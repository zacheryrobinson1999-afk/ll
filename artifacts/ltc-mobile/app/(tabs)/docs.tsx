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
  DOC_SYSTEMS,
  SYSTEM_COLORS,
  SYSTEM_ICONS,
  TYPE_ICONS,
  getByFleetId,
  docUrl,
  type TechDoc,
  type DocSystem,
  type DocSection,
} from '@/data/techDocs';
import { FLEET, CATEGORY_COLORS, type CraneModel } from '@/data/craneFleet';

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
      onPress={onPress}
      style={({ pressed }) => ({
        paddingHorizontal: 14,
        paddingVertical: 8,
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

function DocCard({
  doc,
  colors,
  onPress,
}: {
  doc: TechDoc;
  colors: ReturnType<typeof useColors>;
  onPress: () => void;
}) {
  const sysColor = SYSTEM_COLORS[doc.system];
  const icon = TYPE_ICONS[doc.type] as any;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: colors.card,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 10,
        overflow: 'hidden',
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <View style={{ height: 3, backgroundColor: sysColor }} />

      <View style={{ padding: 14 }}>
        {/* header row */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
          <View
            style={{
              width: 42,
              height: 42,
              borderRadius: 11,
              backgroundColor: sysColor + '22',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: sysColor + '44',
              flexShrink: 0,
            }}
          >
            <MaterialCommunityIcons name={icon} size={20} color={sysColor} />
          </View>

          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: colors.foreground,
                fontWeight: '700',
                fontSize: 14,
                lineHeight: 20,
              }}
              numberOfLines={2}
            >
              {doc.title}
            </Text>
            <Text
              style={{ color: colors.mutedForeground, fontSize: 11, marginTop: 2 }}
              numberOfLines={1}
            >
              {doc.subtitle}
            </Text>
          </View>
        </View>

        {/* meta row */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 10,
            gap: 8,
            flexWrap: 'wrap',
          }}
        >
          {/* system badge */}
          <View
            style={{
              backgroundColor: sysColor + '22',
              borderRadius: 6,
              paddingHorizontal: 7,
              paddingVertical: 3,
              borderWidth: 1,
              borderColor: sysColor + '55',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Text style={{ color: sysColor, fontSize: 9, fontWeight: '800' }}>
              {SYSTEM_ICONS[doc.system]}
            </Text>
            <Text style={{ color: sysColor, fontSize: 9, fontWeight: '600' }}>
              {doc.system}
            </Text>
          </View>

          <TypePill type={doc.type} colors={colors} />

          {doc.pages != null && (
            <Text style={{ color: colors.mutedForeground, fontSize: 10 }}>
              {doc.pages} pp
            </Text>
          )}
          {doc.year != null && (
            <Text style={{ color: colors.mutedForeground, fontSize: 10 }}>
              {doc.year}
            </Text>
          )}
        </View>

        {/* crane types */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 5, flexWrap: 'wrap' }}>
          <Feather name="cpu" size={11} color={colors.mutedForeground} />
          <Text style={{ color: colors.mutedForeground, fontSize: 11 }}>
            {doc.craneTypes.join(' · ')}
          </Text>
        </View>

        {/* summary */}
        <Text
          style={{
            color: colors.mutedForeground,
            fontSize: 12,
            lineHeight: 17,
            marginTop: 8,
          }}
          numberOfLines={3}
        >
          {doc.summary}
        </Text>

        {/* section count + arrow */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 10,
          }}
        >
          <Text style={{ color: colors.mutedForeground, fontSize: 11 }}>
            {doc.sections.length} section{doc.sections.length !== 1 ? 's' : ''}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text style={{ color: colors.mutedForeground, fontSize: 11 }}>View</Text>
            <Feather name="chevron-right" size={13} color={colors.mutedForeground} />
          </View>
        </View>
      </View>
    </Pressable>
  );
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
}: {
  doc: TechDoc;
  colors: ReturnType<typeof useColors>;
  onBack: () => void;
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
          onPress={() => WebBrowser.openBrowserAsync(docUrl(doc), {
            presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
          })}
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

  const [activeFilter, setActiveFilter] = useState<DocSystem | 'All'>('All');
  const [selectedCraneId, setSelectedCraneId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<TechDoc | null>(null);

  /** Docs eligible after crane filter is applied */
  const byCrane = useMemo<TechDoc[]>(() => {
    if (!selectedCraneId) return TECH_DOCS;
    return getByFleetId(selectedCraneId);
  }, [selectedCraneId]);

  const filtered = useMemo(() => {
    const bySys =
      activeFilter === 'All'
        ? byCrane
        : byCrane.filter((d) => d.system === activeFilter);
    if (!search.trim()) return bySys;
    const q = search.toLowerCase();
    return bySys.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.subtitle.toLowerCase().includes(q) ||
        d.system.toLowerCase().includes(q) ||
        d.type.toLowerCase().includes(q) ||
        d.craneTypes.some((c) => c.toLowerCase().includes(q)) ||
        d.sections.some((s) => s.title.toLowerCase().includes(q)),
    );
  }, [activeFilter, byCrane, search]);

  const groups = useMemo(() => {
    if (activeFilter !== 'All') return null;
    const map = new Map<DocSystem, TechDoc[]>();
    for (const doc of filtered) {
      const list = map.get(doc.system) ?? [];
      list.push(doc);
      map.set(doc.system, list);
    }
    return map;
  }, [activeFilter, filtered]);

  const selectedCrane = useMemo(
    () => (selectedCraneId ? FLEET.find((c) => c.id === selectedCraneId) ?? null : null),
    [selectedCraneId],
  );

  if (selected) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <StatusBar style="light" />
        <DocDetail doc={selected} colors={colors} onBack={() => setSelected(null)} />
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar style="light" />

      {/* header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerKicker}>TECHNICAL LIBRARY</Text>
          <Text style={styles.headerTitle}>Tech Docs</Text>
        </View>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>
            {filtered.length !== TECH_DOCS.length
              ? `${filtered.length} / ${TECH_DOCS.length}`
              : TECH_DOCS.length}{' '}
            DOCS
          </Text>
        </View>
      </View>

      {/* search */}
      <View style={styles.searchRow}>
        <Feather
          name="search"
          size={15}
          color={colors.mutedForeground}
          style={{ marginRight: 8 }}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search docs, sections, crane types…"
          placeholderTextColor={colors.mutedForeground}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')}>
            <Feather name="x" size={14} color={colors.mutedForeground} />
          </Pressable>
        )}
      </View>

      {/* system filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterRow}
      >
        <SystemChip
          label="ALL"
          active={activeFilter === 'All'}
          color={colors.primary}
          onPress={() => setActiveFilter('All')}
          colors={colors}
        />
        {DOC_SYSTEMS.map((sys) => (
          <SystemChip
            key={sys}
            label={sys}
            active={activeFilter === sys}
            color={SYSTEM_COLORS[sys]}
            onPress={() => setActiveFilter(sys)}
            colors={colors}
          />
        ))}
      </ScrollView>

      {/* crane filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterRow}
      >
        <Pressable
          onPress={() => setSelectedCraneId(null)}
          style={({ pressed }) => ({
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 20,
            borderWidth: 1.5,
            borderColor: !selectedCraneId ? colors.primary : colors.border,
            backgroundColor: !selectedCraneId ? colors.primary + '22' : 'transparent',
            marginRight: 6,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            opacity: pressed ? 0.75 : 1,
          })}
        >
          <Feather
            name="cpu"
            size={11}
            color={!selectedCraneId ? colors.primary : colors.mutedForeground}
          />
          <Text
            style={{
              color: !selectedCraneId ? colors.primary : colors.mutedForeground,
              fontWeight: !selectedCraneId ? '700' : '500',
              fontSize: 11,
              letterSpacing: 0.2,
            }}
          >
            All cranes
          </Text>
        </Pressable>

        {FLEET.map((crane) => {
          const isActive = selectedCraneId === crane.id;
          const chipColor = CATEGORY_COLORS[crane.category];
          return (
            <Pressable
              key={crane.id}
              onPress={() => setSelectedCraneId(isActive ? null : crane.id)}
              style={({ pressed }) => ({
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 20,
                borderWidth: 1.5,
                borderColor: isActive ? chipColor : colors.border,
                backgroundColor: isActive ? chipColor + '22' : 'transparent',
                marginRight: 6,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                opacity: pressed ? 0.75 : 1,
              })}
            >
              <Text
                style={{
                  color: isActive ? chipColor : colors.mutedForeground,
                  fontWeight: isActive ? '700' : '500',
                  fontSize: 11,
                  letterSpacing: 0.2,
                }}
              >
                {crane.model}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* active crane banner */}
      {selectedCrane && (
        <View
          style={{
            marginHorizontal: 16,
            marginBottom: 8,
            backgroundColor: CATEGORY_COLORS[selectedCrane.category] + '18',
            borderRadius: 10,
            borderWidth: 1,
            borderColor: CATEGORY_COLORS[selectedCrane.category] + '44',
            paddingHorizontal: 12,
            paddingVertical: 8,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Feather name="filter" size={13} color={CATEGORY_COLORS[selectedCrane.category]} />
          <Text
            style={{
              flex: 1,
              color: CATEGORY_COLORS[selectedCrane.category],
              fontSize: 12,
              fontWeight: '600',
            }}
          >
            Showing docs for {selectedCrane.model}
          </Text>
          <Pressable
            onPress={() => setSelectedCraneId(null)}
            hitSlop={8}
          >
            <Feather name="x" size={13} color={CATEGORY_COLORS[selectedCrane.category]} />
          </Pressable>
        </View>
      )}

      {/* list */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 80 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {filtered.length === 0 && (
          <View style={styles.empty}>
            <MaterialCommunityIcons
              name="file-search"
              size={36}
              color={colors.border}
            />
            <Text style={styles.emptyText}>
              {selectedCrane
                ? `No docs found for ${selectedCrane.model}.`
                : 'No documents match your search.'}
            </Text>
          </View>
        )}

        {groups
          ? Array.from(groups.entries()).map(([sys, docs]) => (
              <View key={sys} style={{ marginBottom: 8 }}>
                <View style={styles.groupHeader}>
                  <View
                    style={[
                      styles.groupStripe,
                      { backgroundColor: SYSTEM_COLORS[sys] },
                    ]}
                  />
                  <Text
                    style={[styles.groupTitle, { color: SYSTEM_COLORS[sys] }]}
                  >
                    {sys.toUpperCase()}
                  </Text>
                  <Text style={styles.groupCount}>
                    {docs.length} doc{docs.length !== 1 ? 's' : ''}
                  </Text>
                </View>
                {docs.map((doc) => (
                  <DocCard
                    key={doc.id}
                    doc={doc}
                    colors={colors}
                    onPress={() => setSelected(doc)}
                  />
                ))}
              </View>
            ))
          : filtered.map((doc) => (
              <DocCard
                key={doc.id}
                doc={doc}
                colors={colors}
                onPress={() => setSelected(doc)}
              />
            ))}
      </ScrollView>
    </View>
  );
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
