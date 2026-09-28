import { useLocalSearchParams, useRouter } from 'expo-router';
import { useManualLibraryStorage } from '@/hooks/useManualLibraryStorage';
import { availableCategories, filterManuals, manufacturerGroups, modelGroups, manualModels, manualCategories } from '../../../api-server/src/lib/catalog/manualLibrary';
import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useColors } from '@/hooks/useColors';
import {
  TECH_DOCS,
  SYSTEM_COLORS,
  SYSTEM_ICONS,
  TYPE_ICONS,
  docUrl,
  type TechDoc,
  type DocSection,
} from '@/data/techDocs';
import { FLEET } from '@/data/craneFleet';

// ─── helpers ─────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  Diagnostics:   'DIAGNOSTICS',
  Procedure:     'PROCEDURE',
  Reference:     'REFERENCE',
  'Screen Guide':'SCREEN GUIDE',
  Training:      'TRAINING',
};

const TYPE_COLORS: Record<string, string> = {
  Diagnostics:   '#E36B55',
  Procedure:     '#67C587',
  Reference:     '#1B9AAA',
  'Screen Guide':'#F7BE21',
  Training:      '#A78BFA',
};

// ─── sub-components ──────────────────────────────────────────────────────────

function SystemChip({
  label,
  active,
  color,
  onPress,
  colors,
}: {
  label: string;
  active: boolean;
  color: string;
  onPress: () => void;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => ({
        paddingHorizontal: 14,
        paddingVertical: 12,
        minHeight: 44,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: active ? color : colors.border,
        backgroundColor: active ? color + '22' : 'transparent',
        marginRight: 8,
        opacity: pressed ? 0.75 : 1,
      })}
    >
      <Text
        style={{
          color: active ? color : colors.mutedForeground,
          fontWeight: active ? '700' : '500',
          fontSize: 12,
          letterSpacing: 0.3,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function TypePill({
  type,
  colors,
}: {
  type: string;
  colors: ReturnType<typeof useColors>;
}) {
  const color = TYPE_COLORS[type] ?? colors.mutedForeground;
  return (
    <View
      style={{
        backgroundColor: color + '22',
        borderRadius: 6,
        paddingHorizontal: 7,
        paddingVertical: 3,
        borderWidth: 1,
        borderColor: color + '55',
      }}
    >
      <Text style={{ color, fontSize: 9, fontWeight: '700', letterSpacing: 0.6 }}>
        {TYPE_LABELS[type] ?? type.toUpperCase()}
      </Text>
    </View>
  );
}

function DocCard({ doc, colors, onPress, onOpen, bookmarked, onBookmark, ready }: {
  doc: TechDoc; colors: ReturnType<typeof useColors>; onPress: () => void;
  onOpen: () => void; bookmarked: boolean; onBookmark: () => void; ready: boolean;
}) {
  return <View style={{ padding: 14, borderWidth: 1, borderColor: colors.border, borderRadius: 12, backgroundColor: colors.card, marginBottom: 12, gap: 8 }}>
    <Pressable accessibilityRole="button" accessibilityLabel={`Details for ${doc.title}`} onPress={onPress} style={{ minHeight: 44, gap: 6 }}>
      <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: '700' }}>{doc.title}</Text>
      <Text style={{ color: colors.mutedForeground, fontSize: 12 }}>{doc.manufacturer ?? doc.system} · {doc.documentType ?? manualCategories(doc).join(' / ')}</Text>
      <Text style={{ color: colors.mutedForeground, fontSize: 12 }} numberOfLines={2}>{manualModels(doc, FLEET).join(' · ') || 'Engine / system reference'}</Text>
      <Text style={{ color: colors.mutedForeground, fontSize: 12 }}>{[doc.docNumber, doc.year].filter(Boolean).join(' · ')}</Text>
    </Pressable>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
      <Pressable accessibilityRole="button" onPress={onOpen} style={{ minHeight: 44, justifyContent: 'center', paddingHorizontal: 12, borderRadius: 8, backgroundColor: colors.primary }}><Text style={{ color: colors.primaryForeground, fontWeight: '700' }}>Open manual</Text></Pressable>
      <Pressable accessibilityRole="button" accessibilityState={{ selected: bookmarked, disabled: !ready }} disabled={!ready} onPress={onBookmark} style={{ minHeight: 44, justifyContent: 'center', paddingHorizontal: 12 }}><Text style={{ color: colors.primary }}>{bookmarked ? 'Bookmarked' : 'Bookmark'}</Text></Pressable>
    </View>
  </View>;
}

function SectionRow({
  section,
  colors,
  expanded,
  onToggle,
}: {
  section: DocSection;
  colors: ReturnType<typeof useColors>;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <View
      style={{
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      <Pressable
        onPress={onToggle}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 12,
          paddingHorizontal: 16,
          opacity: pressed ? 0.75 : 1,
        })}
      >
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {section.ref !== '—' && (
              <Text
                style={{
                  color: colors.primary,
                  fontSize: 10,
                  fontWeight: '700',
                  letterSpacing: 0.5,
                  minWidth: 40,
                }}
              >
                {section.ref}
              </Text>
            )}
            <Text
              style={{
                color: colors.foreground,
                fontWeight: '600',
                fontSize: 13,
                flex: 1,
              }}
            >
              {section.title}
            </Text>
          </View>
        </View>
        <Feather
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={14}
          color={colors.mutedForeground}
        />
      </Pressable>

      {expanded && (
        <View
          style={{
            paddingHorizontal: 16,
            paddingBottom: 14,
            paddingTop: 0,
          }}
        >
          <Text
            style={{
              color: colors.mutedForeground,
              fontSize: 12,
              lineHeight: 18,
            }}
          >
            {section.summary}
          </Text>
        </View>
      )}
    </View>
  );
}

function DocDetail({
  doc,
  colors,
  onBack,
  onOpen,
}: {
  doc: TechDoc;
  colors: ReturnType<typeof useColors>;
  onBack: () => void;
  onOpen: () => void;
}) {
  const sysColor = SYSTEM_COLORS[doc.system];
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (ref: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(ref)) next.delete(ref);
      else next.add(ref);
      return next;
    });
  };

  const expandAll = () =>
    setExpandedSections(new Set(doc.sections.map((s) => s.ref + s.title)));
  const collapseAll = () => setExpandedSections(new Set());

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* coloured header */}
      <View
        style={{
          backgroundColor: sysColor + '14',
          borderBottomWidth: 2,
          borderBottomColor: sysColor + '44',
          padding: 20,
          paddingTop: 8,
        }}
      >
        <Pressable
          onPress={onBack}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            marginBottom: 16,
            opacity: pressed ? 0.7 : 1,
            alignSelf: 'flex-start',
          })}
        >
          <Feather name="arrow-left" size={16} color={sysColor} />
          <Text style={{ color: sysColor, fontWeight: '600', fontSize: 13 }}>
            Tech Docs
          </Text>
        </Pressable>

        {/* title block */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
          <View
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              backgroundColor: sysColor + '33',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1.5,
              borderColor: sysColor + '66',
              flexShrink: 0,
            }}
          >
            <MaterialCommunityIcons
              name={TYPE_ICONS[doc.type] as any}
              size={24}
              color={sysColor}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: colors.foreground,
                fontWeight: '800',
                fontSize: 18,
                lineHeight: 24,
              }}
            >
              {doc.title}
            </Text>
            <Text
              style={{ color: sysColor, fontWeight: '600', fontSize: 12, marginTop: 3 }}
            >
              {doc.system}
            </Text>
          </View>
        </View>

        {/* subtitle + pills */}
        <Text
          style={{
            color: colors.mutedForeground,
            fontSize: 12,
            marginTop: 10,
            lineHeight: 17,
          }}
        >
          {doc.subtitle}
        </Text>

        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
            marginTop: 12,
          }}
        >
          <TypePill type={doc.type} colors={colors} />
          {doc.pages != null && (
            <View
              style={{
                backgroundColor: colors.muted,
                borderRadius: 6,
                paddingHorizontal: 7,
                paddingVertical: 3,
              }}
            >
              <Text
                style={{
                  color: colors.mutedForeground,
                  fontSize: 9,
                  fontWeight: '600',
                }}
              >
                {doc.pages} PAGES
              </Text>
            </View>
          )}
          {doc.year != null && (
            <View
              style={{
                backgroundColor: colors.muted,
                borderRadius: 6,
                paddingHorizontal: 7,
                paddingVertical: 3,
              }}
            >
              <Text
                style={{
                  color: colors.mutedForeground,
                  fontSize: 9,
                  fontWeight: '600',
                }}
              >
                {doc.year}
              </Text>
            </View>
          )}
          {doc.docNumber != null && (
            <View
              style={{
                backgroundColor: colors.muted,
                borderRadius: 6,
                paddingHorizontal: 7,
                paddingVertical: 3,
              }}
            >
              <Text
                style={{
                  color: colors.mutedForeground,
                  fontSize: 9,
                  fontWeight: '600',
                }}
              >
                {doc.docNumber}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
        {/* summary */}
        <Text
          style={{
            color: colors.mutedForeground,
            fontSize: 11,
            fontWeight: '700',
            letterSpacing: 1,
            marginBottom: 8,
          }}
        >
          OVERVIEW
        </Text>
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: colors.border,
            padding: 14,
          }}
        >
          <Text style={{ color: colors.foreground, fontSize: 13, lineHeight: 20 }}>
            {doc.summary}
          </Text>
        </View>

        {/* applies to */}
        <Text
          style={{
            color: colors.mutedForeground,
            fontSize: 11,
            fontWeight: '700',
            letterSpacing: 1,
            marginTop: 20,
            marginBottom: 8,
          }}
        >
          APPLICABLE CRANE TYPES
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {doc.craneTypes.map((ct) => (
            <View
              key={ct}
              style={{
                backgroundColor: sysColor + '22',
                borderRadius: 8,
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderWidth: 1,
                borderColor: sysColor + '44',
              }}
            >
              <Text style={{ color: sysColor, fontWeight: '700', fontSize: 12 }}>{ct}</Text>
            </View>
          ))}
        </View>

        {/* sections */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 20,
            marginBottom: 8,
          }}
        >
          <Text
            style={{
              color: colors.mutedForeground,
              fontSize: 11,
              fontWeight: '700',
              letterSpacing: 1,
            }}
          >
            SECTIONS ({doc.sections.length})
          </Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Pressable onPress={expandAll}>
              <Text style={{ color: sysColor, fontSize: 11, fontWeight: '600' }}>
                Expand all
              </Text>
            </Pressable>
            <Pressable onPress={collapseAll}>
              <Text
                style={{ color: colors.mutedForeground, fontSize: 11, fontWeight: '600' }}
              >
                Collapse
              </Text>
            </Pressable>
          </View>
        </View>

        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: colors.border,
            overflow: 'hidden',
          }}
        >
          {doc.sections.map((section, index) => {
            const key = section.ref + section.title;
            return (
              <SectionRow
                key={key}
                section={section}
                colors={colors}
                expanded={expandedSections.has(key)}
                onToggle={() => toggleSection(key)}
              />
            );
          })}
        </View>

        {/* open document button */}
        <Pressable
          onPress={onOpen}
          style={({ pressed }) => ({
            backgroundColor: pressed ? colors.primary + 'cc' : colors.primary,
            borderRadius: 12,
            paddingVertical: 14,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            gap: 8,
            marginTop: 16,
          })}
        >
          <Feather name="book-open" size={16} color={colors.primaryForeground} />
          <Text style={{ color: colors.primaryForeground, fontWeight: '700', fontSize: 15 }}>
            Open Document
          </Text>
        </Pressable>

        {/* file reference */}
        <View
          style={{
            backgroundColor: colors.muted,
            borderRadius: 10,
            padding: 12,
            marginTop: 10,
            flexDirection: 'row',
            gap: 8,
          }}
        >
          <Feather
            name="file-text"
            size={14}
            color={colors.mutedForeground}
            style={{ marginTop: 1 }}
          />
          <Text
            style={{ color: colors.mutedForeground, fontSize: 10, lineHeight: 16, flex: 1 }}
          >
            {doc.cleanFile}
          </Text>
        </View>

        {doc.type === 'Procedure' && (
          <View
            style={{
              backgroundColor: colors.success + '14',
              borderRadius: 10,
              padding: 12,
              marginTop: 10,
              flexDirection: 'row',
              gap: 8,
              borderWidth: 1,
              borderColor: colors.success + '33',
            }}
          >
            <MaterialCommunityIcons
              name="key-variant"
              size={14}
              color={colors.success}
              style={{ marginTop: 1 }}
            />
            <Text
              style={{
                color: colors.success,
                fontSize: 11,
                lineHeight: 17,
                flex: 1,
                fontWeight: '600',
              }}
            >
              Use the LICCON Daycode Generator on the Instrument tab to generate the access
              code required for this procedure.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

// ─── main screen ─────────────────────────────────────────────────────────────

export default function DocsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const params = useLocalSearchParams<{ q?: string; manufacturer?: string; model?: string; type?: string; document?: string; saved?: string }>();
  const search = typeof params.q === 'string' ? params.q : '';
  const manufacturer = params.manufacturer ?? '';
  const model = params.model ?? '';
  const category = params.type ?? 'All';
  const savedOnly = params.saved === '1';
  const storage = useManualLibraryStorage();
  const [showRecent, setShowRecent] = useState(false);
  const selected = TECH_DOCS.find(doc => doc.id === params.document);
  const update = (values: Record<string, string>) => router.push({ pathname: '/docs', params: { ...params, ...values } });
  const searching = Boolean(search.trim());
  const filtered = useMemo(() => filterManuals(TECH_DOCS, { query: search, category, manufacturer, model }, FLEET)
    .filter(doc => !savedOnly || storage.bookmarks.includes(doc.id)), [search, category, manufacturer, model, savedOnly, storage.bookmarks]);
  const groups = manufacturer ? modelGroups(filtered, FLEET) : manufacturerGroups(filtered);
  const categories = useMemo(() => availableCategories(TECH_DOCS), []);
  const open = (doc: TechDoc) => {
    if (storage.ready) storage.record(doc.id);
    void WebBrowser.openBrowserAsync(docUrl(doc), { presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET });
  };
  const card = (doc: TechDoc) => <DocCard key={doc.id} doc={doc} colors={colors} onPress={() => update({ document: doc.id })} onOpen={() => open(doc)} bookmarked={storage.bookmarks.includes(doc.id)} ready={storage.ready} onBookmark={() => storage.toggle(doc.id)} />;
  const reset = () => update({ q: '', manufacturer: '', model: '', type: '', saved: '', document: '' });
  if (selected) return <View style={[styles.root, { paddingTop: insets.top }]}><DocDetail doc={selected} colors={colors} onOpen={() => open(selected)} onBack={() => router.canGoBack() ? router.back() : router.setParams({ document: '' })} /></View>;
  return <View style={[styles.root, { paddingTop: insets.top }]}>
    <StatusBar style="light" />
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 90, gap: 14 }}>
      <Text style={{ color: colors.foreground, fontSize: 28, fontWeight: '800' }}>Manuals</Text>
      <Text style={{ color: colors.mutedForeground }}>{TECH_DOCS.length} documents</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 12, backgroundColor: colors.card }}>
        <TextInput accessibilityLabel="Search manuals" placeholder="Search manuals, models, systems, document numbers…" placeholderTextColor={colors.mutedForeground} value={search} onChangeText={q => router.setParams({ q })} autoCapitalize="none" style={{ flex: 1, minHeight: 52, padding: 12, color: colors.foreground }} />
        {search ? <Pressable accessibilityRole="button" accessibilityLabel="Clear search" onPress={() => router.setParams({ q: '' })} style={{ minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' }}><Feather name="x" size={20} color={colors.foreground} /></Pressable> : null}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {categories.map(type => <SystemChip key={type} label={type} active={(category || 'All') === type} color={colors.primary} colors={colors} onPress={() => update({ type })} />)}
        <SystemChip label="Bookmarks" active={savedOnly} color={colors.primary} colors={colors} onPress={() => update({ saved: savedOnly ? '' : '1' })} />
      </View>
      {!searching && <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
        <Pressable accessibilityRole="button" onPress={() => update({ manufacturer: '', model: '' })} style={{ minHeight: 44, justifyContent: 'center' }}><Text style={{ color: colors.primary }}>Manuals</Text></Pressable>
        {manufacturer ? <Pressable accessibilityRole="button" onPress={() => update({ model: '' })} style={{ minHeight: 44, justifyContent: 'center' }}><Text style={{ color: colors.primary }}> / {manufacturer}</Text></Pressable> : null}
        {model ? <Text style={{ color: colors.foreground }}> / {model}</Text> : null}
      </View>}
      <Text accessibilityLiveRegion="polite" style={{ color: colors.foreground, fontWeight: '700' }}>{searching ? `${filtered.length} ${filtered.length === 1 ? 'result' : 'results'} for ${search.trim()}` : `${filtered.length} matching documents`}</Text>
      {!filtered.length ? <View style={{ padding: 20, gap: 12 }}><Text style={{ color: colors.foreground }}>{searching ? `No manuals found for “${search.trim()}”` : 'No manuals match these filters.'}</Text><Pressable accessibilityRole="button" onPress={reset} style={{ minHeight: 44, justifyContent: 'center' }}><Text style={{ color: colors.primary }}>Clear search and filters</Text></Pressable></View>
        : searching || model ? filtered.map(card)
        : groups.map(group => <Pressable key={group.label} accessibilityRole="button" onPress={() => update(manufacturer ? { model: group.label } : { manufacturer: group.label, model: '' })} style={{ padding: 18, minHeight: 76, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 12 }}><Text style={{ flex: 1, color: colors.foreground, fontSize: 16, fontWeight: '700' }}>{group.label}</Text><Text style={{ color: colors.mutedForeground }}>{group.count} manuals</Text><Feather name="chevron-right" size={18} color={colors.primary} /></Pressable>)}
      {!searching && !manufacturer && !savedOnly && <><Pressable accessibilityRole="button" onPress={() => setShowRecent(!showRecent)} style={{ minHeight: 48, justifyContent: 'center' }}><Text style={{ color: colors.primary }}>Recently viewed ({storage.recent.length})</Text></Pressable>{showRecent && storage.recent.map(id => TECH_DOCS.find(doc => doc.id === id)).filter((doc): doc is TechDoc => Boolean(doc)).map(card)}</>}
      <Text style={{ color: colors.mutedForeground, fontSize: 12 }}>Mobile bookmarks are saved on this device.</Text>
      {storage.error ? <Text style={{ color: colors.foreground }}>{storage.error}</Text> : null}
    </ScrollView>
  </View>;
}

// ─── styles ──────────────────────────────────────────────────────────────────

function createStyles(colors: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 14,
    },
    headerKicker: {
      color: colors.primary,
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 1.5,
    },
    headerTitle: {
      color: colors.foreground,
      fontSize: 22,
      fontWeight: '800',
      marginTop: 2,
    },
    headerBadge: {
      backgroundColor: colors.secondary,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderWidth: 1,
      borderColor: colors.border,
    },
    headerBadgeText: {
      color: colors.mutedForeground,
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 0.8,
    },
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 12,
      marginHorizontal: 20,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 12,
    },
    searchInput: { flex: 1, color: colors.foreground, fontSize: 14 },
    filterScroll: { flexGrow: 0, flexShrink: 0, maxHeight: 48, marginBottom: 8 },
    filterRow: {
      paddingHorizontal: 20,
      alignItems: 'center',
      flexDirection: 'row',
    },
    listContent: { paddingHorizontal: 16, paddingTop: 4 },
    groupHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
      gap: 8,
    },
    groupStripe: { width: 3, height: 16, borderRadius: 2 },
    groupTitle: { fontWeight: '800', fontSize: 12, letterSpacing: 1, flex: 1 },
    groupCount: { color: colors.mutedForeground, fontSize: 11 },
    empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
    emptyText: { color: colors.mutedForeground, fontSize: 14 },
  });
}
