import { ManualDetail } from '@/components/ManualDetail';
import { recentManuals, bookmarkedManuals, manualMetadata } from '../../../api-server/src/lib/catalog/manualDetail';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useManualLibraryStorage } from '@/hooks/useManualLibraryStorage';
import { availableCategories, filterManuals, manufacturerGroups, modelGroups, manualModels, manualCategories } from '../../../api-server/src/lib/catalog/manualLibrary';
import React, { useMemo } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useColors } from '@/hooks/useColors';
import {
  TECH_DOCS,
  type TechDoc,
} from '@/data/techDocs';
import { FLEET } from '@/data/craneFleet';

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
      <Pressable accessibilityRole="button" onPress={onOpen} style={{ minHeight: 44, justifyContent: 'center', paddingHorizontal: 12, borderRadius: 8, backgroundColor: colors.primary }}><Text style={{ color: colors.primaryForeground, fontWeight: '700' }}>View manual</Text></Pressable>
      <Pressable accessibilityRole="button" accessibilityState={{ selected: bookmarked, disabled: !ready }} disabled={!ready} onPress={onBookmark} style={{ minHeight: 44, justifyContent: 'center', paddingHorizontal: 12 }}><Text style={{ color: colors.primary }}>{bookmarked ? 'Bookmarked' : 'Bookmark'}</Text></Pressable>
    </View>
  </View>;
}

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
  const recents = recentManuals(TECH_DOCS, storage.recent.map(entityId => ({ entityId })));
  const bookmarked = bookmarkedManuals(TECH_DOCS, storage.bookmarks.map(documentId => ({ documentId })));

  const update = (values: Record<string, string>) => router.push({ pathname: '/docs', params: { ...params, ...values } });
  const searching = Boolean(search.trim());
  const filtered = useMemo(() => filterManuals(TECH_DOCS, { query: search, category, manufacturer, model }, FLEET)
    .filter(doc => !savedOnly || storage.bookmarks.includes(doc.id)), [search, category, manufacturer, model, savedOnly, storage.bookmarks]);
  const groups = manufacturer ? modelGroups(filtered, FLEET) : manufacturerGroups(filtered);
  const categories = useMemo(() => availableCategories(TECH_DOCS), []);
  const card = (doc: TechDoc) => <DocCard key={doc.id} doc={doc} colors={colors} onPress={() => update({ document: doc.id })} onOpen={() => update({ document: doc.id })} bookmarked={storage.bookmarks.includes(doc.id)} ready={storage.ready} onBookmark={() => storage.toggle(doc.id)} />;
  const shortcut = (doc: TechDoc) => <Pressable key={doc.id} accessibilityRole="button" onPress={() => update({ document: doc.id })} style={{ backgroundColor: colors.card, padding: 14, borderRadius: 12, gap: 6, minHeight: 76 }}><Text style={{ color: colors.foreground, fontWeight: '700' }}>{doc.title}</Text><Text style={{ color: colors.mutedForeground }}>{manualMetadata(doc, FLEET).manufacturer} · {manualMetadata(doc, FLEET).type}</Text><Text style={{ color: colors.mutedForeground }}>{manualMetadata(doc, FLEET).models.join(' · ')}</Text></Pressable>;
  const reset = () => update({ q: '', manufacturer: '', model: '', type: '', saved: '', document: '' });
  if (params.document !== undefined && params.document !== '') return <View style={[styles.root, { paddingTop: insets.top }]}><ManualDetail id={params.document} onBack={() => router.canGoBack() ? router.back() : router.setParams({ document: '' })} /></View>;
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
      {!searching && !manufacturer && !savedOnly && (!category || category === 'All') && <>
        {recents.length > 0 && <View style={{ gap: 10 }}><Text style={{ color: colors.foreground, fontSize: 20, fontWeight: '700' }}>Recently opened</Text>{recents.map(({ doc }) => shortcut(doc))}</View>}
        {bookmarked.length > 0 && <View style={{ gap: 10 }}><Text style={{ color: colors.foreground, fontSize: 20, fontWeight: '700' }}>Bookmarked manuals</Text>{bookmarked.map(shortcut)}<Pressable accessibilityRole="button" onPress={() => update({ saved: '1' })} style={{ minHeight: 44, justifyContent: 'center' }}><Text style={{ color: colors.primary }}>View all bookmarks</Text></Pressable></View>}
      </>}
      {!searching && <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
        <Pressable accessibilityRole="button" onPress={() => update({ manufacturer: '', model: '' })} style={{ minHeight: 44, justifyContent: 'center' }}><Text style={{ color: colors.primary }}>Manuals</Text></Pressable>
        {manufacturer ? <Pressable accessibilityRole="button" onPress={() => update({ model: '' })} style={{ minHeight: 44, justifyContent: 'center' }}><Text style={{ color: colors.primary }}> / {manufacturer}</Text></Pressable> : null}
        {model ? <Text style={{ color: colors.foreground }}> / {model}</Text> : null}
      </View>}
      <Text accessibilityLiveRegion="polite" style={{ color: colors.foreground, fontWeight: '700' }}>{searching ? `${filtered.length} ${filtered.length === 1 ? 'result' : 'results'} for ${search.trim()}` : `${filtered.length} matching documents`}</Text>
      {!filtered.length ? <View style={{ padding: 20, gap: 12 }}><Text style={{ color: colors.foreground }}>{searching ? `No manuals found for “${search.trim()}”` : 'No manuals match these filters.'}</Text><Pressable accessibilityRole="button" onPress={reset} style={{ minHeight: 44, justifyContent: 'center' }}><Text style={{ color: colors.primary }}>Clear search and filters</Text></Pressable></View>
        : searching || model ? filtered.map(card)
        : groups.map(group => <Pressable key={group.label} accessibilityRole="button" onPress={() => update(manufacturer ? { model: group.label } : { manufacturer: group.label, model: '' })} style={{ padding: 18, minHeight: 76, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 12 }}><Text style={{ flex: 1, color: colors.foreground, fontSize: 16, fontWeight: '700' }}>{group.label}</Text><Text style={{ color: colors.mutedForeground }}>{group.count} manuals</Text><Feather name="chevron-right" size={18} color={colors.primary} /></Pressable>)}

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
