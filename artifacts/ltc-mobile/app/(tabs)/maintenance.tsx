/**
 * Maintenance tab — three-level navigator (state-based):
 *   1. Manufacturer cards   → pick a make
 *   2. Crane list           → pick a crane
 *   3. Crane detail         → maintenance procedures (placeholder + future uploads)
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as DocumentPicker from 'expo-document-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import {
  FLEET,
  getByManufacturer,
  type CraneModel,
} from '@/data/craneFleet';
import {
  generateDailyCodes,
  makeLegacyDate,
  type DailyCodeResult,
} from '@/lib/dailyCodes';
import {
  getByFleetId,
  docUrl,
  SYSTEM_COLORS,
  type TechDoc,
} from '@/data/techDocs';
import {
  fetchUploadedDocs,
  uploadDoc,
  formatBytes,
  type UploadedDoc,
} from '@/lib/uploadedDocs';

// ── Manufacturer metadata ────────────────────────────────────────────────────

type MfrMeta = {
  id: string;        // matches manufacturer field in CraneModel exactly
  name: string;
  tagline: string;
  accent: string;    // brand colour
  onAccent: string;  // text on accent
  initials: string;
};

const MANUFACTURERS: MfrMeta[] = [
  {
    id: 'Liebherr',
    name: 'Liebherr',
    tagline: 'LTM · LG · LTR',
    accent: '#F7BE21',
    onAccent: '#000000',
    initials: 'LH',
  },
  {
    id: 'Grove',
    name: 'Grove',
    tagline: 'GMK All-Terrain',
    accent: '#0055A5',
    onAccent: '#FFFFFF',
    initials: 'GR',
  },
  {
    id: 'Terex Franna',
    name: 'Terex Franna',
    tagline: 'AT40 · MAC25',
    accent: '#E8271A',
    onAccent: '#FFFFFF',
    initials: 'TF',
  },
  {
    id: 'Demag',
    name: 'Demag',
    tagline: 'CC Lattice Crawler',
    accent: '#5C6BC0',
    onAccent: '#FFFFFF',
    initials: 'DM',
  },
  {
    id: 'Sany',
    name: 'Sany',
    tagline: 'SCC Crawler',
    accent: '#E65100',
    onAccent: '#FFFFFF',
    initials: 'SA',
  },
  {
    id: 'Kobelco',
    name: 'Kobelco',
    tagline: 'CKS Crawler',
    accent: '#00796B',
    onAccent: '#FFFFFF',
    initials: 'KO',
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function unitCount(mfrId: string) {
  return getByManufacturer(mfrId).reduce((sum, c) => sum + c.units.length, 0);
}

function modelCount(mfrId: string) {
  return getByManufacturer(mfrId).length;
}

// ── Animations ───────────────────────────────────────────────────────────────

type NavView = 'manufacturers' | 'cranes' | 'crane';

function useSlide() {
  const { width } = Dimensions.get('window');
  const anim = useRef(new Animated.Value(0)).current;

  const forward = (cb: () => void) => {
    Animated.timing(anim, {
      toValue: -width,
      duration: 260,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      cb();
      anim.setValue(width);
      Animated.timing(anim, {
        toValue: 0,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    });
  };

  const back = (cb: () => void) => {
    Animated.timing(anim, {
      toValue: width,
      duration: 240,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      cb();
      anim.setValue(-width);
      Animated.timing(anim, {
        toValue: 0,
        duration: 240,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    });
  };

  return { anim, forward, back };
}

// ── Main screen ──────────────────────────────────────────────────────────────

export default function MaintenanceScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { anim, forward, back } = useSlide();

  const [view, setView] = useState<NavView>('manufacturers');
  const [mfr, setMfr] = useState<MfrMeta | null>(null);
  const [crane, setCrane] = useState<CraneModel | null>(null);

  const goToMfr = (m: MfrMeta) => {
    forward(() => {
      setMfr(m);
      setView('cranes');
    });
  };

  const goToCrane = (c: CraneModel) => {
    forward(() => {
      setCrane(c);
      setView('crane');
    });
  };

  const goBack = () => {
    back(() => {
      if (view === 'crane') setView('cranes');
      else { setView('manufacturers'); setMfr(null); }
    });
  };

  const s = styles(colors);
  const topPad = insets.top + 16;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Animated.View style={{ flex: 1, transform: [{ translateX: anim }] }}>

        {/* ── Level 1: Manufacturer cards ────────────────────────────────── */}
        {view === 'manufacturers' && (
          <ScrollView
            contentContainerStyle={{ paddingTop: topPad, paddingBottom: insets.bottom + 100, paddingHorizontal: 16 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <Text style={s.kicker}>MAINTENANCE</Text>
            <Text style={s.screenTitle}>Select Manufacturer</Text>
            <Text style={s.subtitle}>
              Choose a make to browse cranes and access maintenance procedures.
            </Text>

            {/* Grid */}
            <View style={s.grid}>
              {MANUFACTURERS.map((m) => {
                const models = modelCount(m.id);
                const units  = unitCount(m.id);
                return (
                  <Pressable
                    key={m.id}
                    onPress={() => goToMfr(m)}
                    style={({ pressed }) => [s.mfrCard, { opacity: pressed ? 0.85 : 1 }]}
                  >
                    {/* Top accent strip */}
                    <View style={[s.mfrAccentBar, { backgroundColor: m.accent }]} />

                    {/* Initials badge */}
                    <View style={[s.mfrBadge, { backgroundColor: m.accent + '22' }]}>
                      <Text style={[s.mfrBadgeText, { color: m.accent }]}>{m.initials}</Text>
                    </View>

                    {/* Name & tagline */}
                    <Text style={s.mfrName}>{m.name}</Text>
                    <Text style={s.mfrTagline}>{m.tagline}</Text>

                    {/* Stats row */}
                    <View style={s.mfrStats}>
                      <View style={s.mfrStat}>
                        <Text style={[s.mfrStatNum, { color: m.accent }]}>{models}</Text>
                        <Text style={s.mfrStatLabel}>model{models !== 1 ? 's' : ''}</Text>
                      </View>
                      <View style={s.mfrDivider} />
                      <View style={s.mfrStat}>
                        <Text style={[s.mfrStatNum, { color: m.accent }]}>{units}</Text>
                        <Text style={s.mfrStatLabel}>unit{units !== 1 ? 's' : ''}</Text>
                      </View>
                    </View>

                    {/* Arrow */}
                    <Feather
                      name="chevron-right"
                      size={16}
                      color={colors.mutedForeground}
                      style={s.mfrArrow}
                    />
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        )}

        {/* ── Level 2: Crane list ─────────────────────────────────────────── */}
        {view === 'cranes' && mfr && (
          <View style={{ flex: 1 }}>
            {/* Sticky header */}
            <View style={[s.navHeader, { paddingTop: topPad }]}>
              <Pressable onPress={goBack} style={s.backBtn} hitSlop={12}>
                <Feather name="chevron-left" size={22} color={colors.foreground} />
              </Pressable>
              <View style={[s.navBadge, { backgroundColor: mfr.accent + '22' }]}>
                <Text style={[s.navBadgeText, { color: mfr.accent }]}>{mfr.initials}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.navTitle}>{mfr.name}</Text>
                <Text style={s.navSub}>{mfr.tagline}</Text>
              </View>
            </View>

            <ScrollView
              contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: insets.bottom + 100 }}
              showsVerticalScrollIndicator={false}
            >
              <Text style={s.sectionLabel}>
                {modelCount(mfr.id)} crane model{modelCount(mfr.id) !== 1 ? 's' : ''}
              </Text>

              {getByManufacturer(mfr.id).map((c) => (
                <Pressable
                  key={c.id}
                  onPress={() => goToCrane(c)}
                  style={({ pressed }) => [s.craneCard, { opacity: pressed ? 0.85 : 1 }]}
                >
                  {/* Left accent */}
                  <View style={[s.craneAccent, { backgroundColor: mfr.accent }]} />

                  <View style={{ flex: 1, gap: 6 }}>
                    {/* Model + category */}
                    <View style={s.craneHeader}>
                      <Text style={s.craneModel}>{c.model}</Text>
                      <View style={[s.craneCatBadge, { backgroundColor: mfr.accent + '22' }]}>
                        <Text style={[s.craneCatText, { color: mfr.accent }]}>{c.category.toUpperCase()}</Text>
                      </View>
                    </View>

                    {/* Key specs */}
                    <View style={s.craneSpecs}>
                      <SpecChip icon="arrow-up" label={`${c.maxCapacity} t`} colors={colors} />
                      <SpecChip icon="maximize-2" label={`${c.maxBoom} m boom`} colors={colors} />
                      {c.maxTravel && <SpecChip icon="navigation" label="Pick & Carry" colors={colors} />}
                    </View>

                    {/* Units */}
                    <Text style={s.craneUnits} numberOfLines={1}>
                      {c.units.length} unit{c.units.length !== 1 ? 's' : ''} ·{' '}
                      {c.units.slice(0, 4).join(', ')}{c.units.length > 4 ? '…' : ''}
                    </Text>
                  </View>

                  <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ── Level 3: Crane detail ───────────────────────────────────────── */}
        {view === 'crane' && crane && mfr && (
          <View style={{ flex: 1 }}>
            {/* Sticky header */}
            <View style={[s.navHeader, { paddingTop: topPad }]}>
              <Pressable onPress={goBack} style={s.backBtn} hitSlop={12}>
                <Feather name="chevron-left" size={22} color={colors.foreground} />
              </Pressable>
              <View style={[s.navBadge, { backgroundColor: mfr.accent + '22' }]}>
                <Text style={[s.navBadgeText, { color: mfr.accent }]}>{mfr.initials}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.navTitle}>{crane.model}</Text>
                <Text style={s.navSub}>{mfr.name}</Text>
              </View>
            </View>

            <ScrollView
              contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: insets.bottom + 100 }}
              showsVerticalScrollIndicator={false}
            >
              {/* Crane spec card */}
              <View style={s.specCard}>
                <View style={[s.specCardBar, { backgroundColor: mfr.accent }]} />
                <View style={s.specGrid}>
                  <SpecBlock label="Max Capacity" value={`${crane.maxCapacity} t`} accent={mfr.accent} />
                  <SpecBlock label="Max Boom" value={`${crane.maxBoom} m`} accent={mfr.accent} />
                  <SpecBlock label="Max Radius" value={`${crane.maxRadius} m`} accent={mfr.accent} />
                  {crane.axles > 0 && (
                    <SpecBlock label="Road Axles" value={String(crane.axles)} accent={mfr.accent} />
                  )}
                </View>
                <Text style={s.craneNotes}>{crane.notes}</Text>
              </View>

              {/* Units section */}
              <Text style={s.sectionLabel}>Fleet Units ({crane.units.length})</Text>
              <View style={s.unitsGrid}>
                {crane.units.map((u) => (
                  <View key={u} style={[s.unitChip, { borderColor: mfr.accent + '55' }]}>
                    <Text style={[s.unitChipText, { color: mfr.accent }]}>{u}</Text>
                  </View>
                ))}
              </View>

              {/* Daily code generator — Liebherr only */}
              {mfr.id === 'Liebherr' && (
                <>
                  <Text style={s.sectionLabel}>Daily Access Code</Text>
                  <DailyCodeWidget accent={mfr.accent} onAccent={mfr.onAccent} />
                </>
              )}

              {/* Maintenance documents section — linked docs + upload placeholder */}
              <MaintenanceDocsSection
                crane={crane}
                accent={mfr.accent}
                onAccent={mfr.onAccent}
              />
            </ScrollView>
          </View>
        )}

      </Animated.View>
    </View>
  );
}

// ── Daily Code Widget (Liebherr only) ────────────────────────────────────────

function DailyCodeWidget({ accent, onAccent }: { accent: string; onAccent: string }) {
  const colors = useColors();
  const [serial, setSerial] = useState('');
  const [date, setDate]     = useState(makeLegacyDate);
  const [result, setResult] = useState<DailyCodeResult | null>(null);
  const [error, setError]   = useState('');

  const run = () => {
    Keyboard.dismiss();
    setResult(null);
    setError('');
    try {
      setResult(generateDailyCodes(serial, date));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    }
  };

  return (
    <View style={{ backgroundColor: colors.card, borderRadius: 16, borderWidth: 1, borderColor: accent + '55', overflow: 'hidden' }}>
      {/* Title bar */}
      <View style={{ backgroundColor: accent + '18', paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 8, borderBottomWidth: 1, borderBottomColor: accent + '33' }}>
        <Feather name="key" size={15} color={accent} />
        <Text style={{ fontSize: 13, fontWeight: '700', color: accent, letterSpacing: 0.5 }}>LICCON DAYCODE GENERATOR</Text>
      </View>

      <View style={{ padding: 16, gap: 12 }}>
        {/* Serial */}
        <View style={{ gap: 4 }}>
          <Text style={{ fontSize: 10, fontWeight: '700', color: colors.mutedForeground, textTransform: 'uppercase', letterSpacing: 0.8 }}>
            Crane Serial Number
          </Text>
          <TextInput
            style={{
              backgroundColor: colors.muted,
              borderRadius: 10,
              paddingHorizontal: 14,
              paddingVertical: 11,
              fontSize: 16,
              fontWeight: '600',
              color: colors.foreground,
              borderWidth: 1,
              borderColor: colors.border,
              letterSpacing: 2,
            }}
            value={serial}
            onChangeText={setSerial}
            placeholder="5–9 digits"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="number-pad"
            maxLength={9}
          />
        </View>

        {/* Date */}
        <View style={{ gap: 4 }}>
          <Text style={{ fontSize: 10, fontWeight: '700', color: colors.mutedForeground, textTransform: 'uppercase', letterSpacing: 0.8 }}>
            Date · DDMMYY
          </Text>
          <TextInput
            style={{
              backgroundColor: colors.muted,
              borderRadius: 10,
              paddingHorizontal: 14,
              paddingVertical: 11,
              fontSize: 16,
              fontWeight: '600',
              color: colors.foreground,
              borderWidth: 1,
              borderColor: colors.border,
              letterSpacing: 2,
            }}
            value={date}
            onChangeText={setDate}
            placeholder="DDMMYY"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="number-pad"
            maxLength={6}
          />
        </View>

        {/* Generate button */}
        <Pressable
          onPress={run}
          style={({ pressed }) => ({
            backgroundColor: accent,
            opacity: pressed ? 0.8 : 1,
            borderRadius: 11,
            paddingVertical: 13,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 8,
          })}
        >
          <Feather name="zap" size={15} color={onAccent} />
          <Text style={{ fontSize: 14, fontWeight: '800', color: onAccent, letterSpacing: 0.5 }}>
            GENERATE CODES
          </Text>
        </Pressable>

        {/* Error */}
        {!!error && (
          <View style={{ backgroundColor: '#E8271A22', borderRadius: 10, padding: 12, flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
            <Feather name="alert-circle" size={14} color="#E8271A" style={{ marginTop: 1 }} />
            <Text style={{ color: '#E8271A', fontSize: 13, flex: 1 }}>{error}</Text>
          </View>
        )}

        {/* Result */}
        {result && (
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={{ flex: 1, backgroundColor: accent + '18', borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: accent + '44' }}>
                <Text style={{ fontSize: 10, fontWeight: '700', color: accent, letterSpacing: 1, marginBottom: 4 }}>LEVEL 1</Text>
                <Text style={{ fontSize: 32, fontWeight: '900', color: colors.foreground, letterSpacing: 6 }}>{result.first}</Text>
              </View>
              <View style={{ flex: 1, backgroundColor: colors.muted, borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ fontSize: 10, fontWeight: '700', color: colors.mutedForeground, letterSpacing: 1, marginBottom: 4 }}>LEVEL 2</Text>
                <Text style={{ fontSize: 32, fontWeight: '900', color: colors.foreground, letterSpacing: 6 }}>{result.second}</Text>
              </View>
            </View>
            <Text style={{ fontSize: 10, color: colors.mutedForeground, textAlign: 'center' }}>
              Valid for {date.slice(0, 2)}/{date.slice(2, 4)}/{date.slice(4)}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

function MaintenanceDocsSection({
  crane,
  accent,
  onAccent,
}: {
  crane: CraneModel;
  accent: string;
  onAccent: string;
}) {
  const colors = useColors();
  const staticDocs = getByFleetId(crane.id);

  const [uploadedDocs, setUploadedDocs] = useState<UploadedDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const loadDocs = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const docs = await fetchUploadedDocs(crane.id);
      setUploadedDocs(docs);
    } catch {
      setFetchError('Could not load uploaded documents.');
    } finally {
      setLoading(false);
    }
  }, [crane.id]);

  useEffect(() => {
    void loadDocs();
  }, [loadDocs]);

  const handleUpload = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*', 'application/msword',
             'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
             'application/vnd.ms-excel',
             'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    setUploading(true);
    try {
      await uploadDoc(crane.id, {
        uri: asset.uri,
        name: asset.name,
        mimeType: asset.mimeType ?? 'application/octet-stream',
      });
      await loadDocs();
    } catch {
      Alert.alert('Upload failed', 'Could not upload the document. Please check your connection and try again.');
    } finally {
      setUploading(false);
    }
  };

  const totalDocs = staticDocs.length + uploadedDocs.length;
  const showEmpty = !loading && totalDocs === 0;

  return (
    <>
      {/* Section header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 10 }}>
        <Text
          style={{
            flex: 1,
            fontSize: 11,
            fontWeight: '700',
            color: colors.mutedForeground,
            textTransform: 'uppercase',
            letterSpacing: 1,
          }}
        >
          Maintenance Documents{totalDocs > 0 ? ` (${totalDocs})` : ''}
        </Text>
        {loading && <ActivityIndicator size="small" color={colors.mutedForeground} />}
      </View>

      {/* Static linked documents */}
      {staticDocs.length > 0 && (
        <View style={{ gap: 8, marginBottom: 8 }}>
          {staticDocs.map((doc) => (
            <DocCard key={doc.id} doc={doc} accent={accent} />
          ))}
        </View>
      )}

      {/* Uploaded documents */}
      {!loading && uploadedDocs.length > 0 && (
        <View style={{ gap: 8, marginBottom: 8 }}>
          {uploadedDocs.map((doc) => (
            <UploadedDocCard
              key={doc.id}
              doc={doc}
              accent={accent}
            />
          ))}
        </View>
      )}

      {/* Fetch error (non-blocking) */}
      {fetchError && (
        <Text style={{ fontSize: 12, color: '#E8271A', marginBottom: 8 }}>{fetchError}</Text>
      )}

      {/* Empty state */}
      {showEmpty && (
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.border,
            borderStyle: 'dashed',
            padding: 28,
            alignItems: 'center',
            gap: 10,
          }}
        >
          <MaterialCommunityIcons
            name="clipboard-text-clock-outline"
            size={40}
            color={colors.mutedForeground}
          />
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.foreground, textAlign: 'center' }}>
            No documents yet
          </Text>
          <Text style={{ fontSize: 13, color: colors.mutedForeground, textAlign: 'center', lineHeight: 19 }}>
            Upload maintenance procedures, schematics, or service records for the {crane.model}.
          </Text>
          <Pressable
            onPress={uploading ? undefined : handleUpload}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              gap: 7,
              paddingHorizontal: 20,
              paddingVertical: 11,
              borderRadius: 10,
              marginTop: 6,
              backgroundColor: accent,
              opacity: pressed || uploading ? 0.7 : 1,
            })}
          >
            {uploading
              ? <ActivityIndicator size="small" color={onAccent} />
              : <Feather name="upload" size={15} color={onAccent} />
            }
            <Text style={{ fontSize: 14, fontWeight: '700', color: onAccent }}>
              {uploading ? 'Uploading…' : 'Upload Document'}
            </Text>
          </Pressable>
        </View>
      )}

      {/* "Upload another" strip (when docs already exist) */}
      {!showEmpty && (
        <Pressable
          onPress={uploading ? undefined : handleUpload}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 7,
            paddingVertical: 11,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: accent + '55',
            borderStyle: 'dashed',
            opacity: pressed || uploading ? 0.6 : 1,
            marginTop: 4,
          })}
        >
          {uploading
            ? <ActivityIndicator size="small" color={accent} />
            : <Feather name="upload" size={14} color={accent} />
          }
          <Text style={{ fontSize: 13, fontWeight: '600', color: accent }}>
            {uploading ? 'Uploading…' : 'Upload Document'}
          </Text>
        </Pressable>
      )}
    </>
  );
}

// ── Uploaded document card ────────────────────────────────────────────────────

function UploadedDocCard({
  doc,
  accent,
}: {
  doc: UploadedDoc;
  accent: string;
}) {
  const colors = useColors();

  const openDoc = () => {
    WebBrowser.openBrowserAsync(doc.url, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
    }).catch(() => { /* URL may be expired — silently fail */ });
  };

  const isPdf = doc.mimeType === 'application/pdf' || doc.name.toLowerCase().endsWith('.pdf');
  const isImage = doc.mimeType.startsWith('image/');
  const iconName: React.ComponentProps<typeof Feather>['name'] = isPdf
    ? 'file-text'
    : isImage
    ? 'image'
    : 'file';

  const uploadDate = new Date(doc.uploadedAt);
  const dateStr = uploadDate.toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
      }}
    >
      <View style={{ flexDirection: 'row' }}>
        {/* Left accent bar */}
        <View style={{ width: 3, backgroundColor: accent + '88' }} />

        <View style={{ flex: 1, padding: 12, gap: 6 }}>
          {/* Title row */}
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: accent + '18',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Feather name={iconName} size={15} color={accent} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text
                style={{ fontSize: 14, fontWeight: '700', color: colors.foreground, lineHeight: 19 }}
                numberOfLines={2}
              >
                {doc.name}
              </Text>
              <Text style={{ fontSize: 11, color: colors.mutedForeground }}>
                {formatBytes(doc.size)} · {dateStr}
              </Text>
            </View>
          </View>

          {/* Action row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {/* Uploaded badge */}
            <View style={{ paddingHorizontal: 7, paddingVertical: 3, borderRadius: 5, backgroundColor: accent + '18' }}>
              <Text style={{ fontSize: 9, fontWeight: '700', color: accent, letterSpacing: 0.6, textTransform: 'uppercase' }}>
                Uploaded
              </Text>
            </View>

            <View style={{ flex: 1 }} />

            {/* Open */}
            <Pressable
              onPress={openDoc}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                backgroundColor: accent,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 8,
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Feather name="external-link" size={11} color="#fff" />
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#fff' }}>Open</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}
function SpecChip({
  icon,
  label,
  colors,
}: {
  icon: React.ComponentProps<typeof Feather>['name'];
  label: string;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.muted, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 }}>
      <Feather name={icon} size={10} color={colors.mutedForeground} />
      <Text style={{ color: colors.mutedForeground, fontSize: 11, fontWeight: '500' }}>{label}</Text>
    </View>
  );
}

function SpecBlock({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <View style={{ flex: 1, minWidth: '45%', gap: 2 }}>
      <Text style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</Text>
      <Text style={{ fontSize: 20, fontWeight: '700', color: accent }}>{value}</Text>
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

function styles(colors: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    // ── Level 1 — Manufacturer grid
    kicker: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.primary,
      letterSpacing: 2,
      marginBottom: 4,
    },
    screenTitle: {
      fontSize: 28,
      fontWeight: '800',
      color: colors.foreground,
      marginBottom: 6,
    },
    subtitle: {
      fontSize: 13,
      color: colors.mutedForeground,
      lineHeight: 19,
      marginBottom: 24,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    mfrCard: {
      width: '47.5%',
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
      overflow: 'hidden',
      position: 'relative',
    },
    mfrAccentBar: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 3,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
    },
    mfrBadge: {
      width: 48,
      height: 48,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },
    mfrBadgeText: {
      fontSize: 15,
      fontWeight: '800',
      letterSpacing: 0.5,
    },
    mfrName: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.foreground,
      marginBottom: 2,
    },
    mfrTagline: {
      fontSize: 11,
      color: colors.mutedForeground,
      marginBottom: 14,
    },
    mfrStats: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    mfrStat: {
      alignItems: 'center',
    },
    mfrStatNum: {
      fontSize: 18,
      fontWeight: '800',
    },
    mfrStatLabel: {
      fontSize: 9,
      color: colors.mutedForeground,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    mfrDivider: {
      width: 1,
      height: 24,
      backgroundColor: colors.border,
    },
    mfrArrow: {
      position: 'absolute',
      bottom: 14,
      right: 14,
    },

    // ── Navigation header (levels 2 + 3)
    navHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingBottom: 14,
      gap: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.background,
    },
    backBtn: {
      width: 36,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.muted,
      borderRadius: 10,
    },
    navBadge: {
      width: 38,
      height: 38,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    navBadgeText: {
      fontSize: 12,
      fontWeight: '800',
    },
    navTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.foreground,
    },
    navSub: {
      fontSize: 11,
      color: colors.mutedForeground,
    },

    // ── Section label
    sectionLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.mutedForeground,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 10,
      marginTop: 20,
    },

    // ── Level 2 — Crane cards
    craneCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
      marginBottom: 10,
      gap: 12,
      overflow: 'hidden',
    },
    craneAccent: {
      width: 3,
      alignSelf: 'stretch',
      borderRadius: 2,
    },
    craneHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    craneModel: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.foreground,
    },
    craneCatBadge: {
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: 5,
    },
    craneCatText: {
      fontSize: 9,
      fontWeight: '700',
      letterSpacing: 0.8,
    },
    craneSpecs: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 5,
    },
    craneUnits: {
      fontSize: 11,
      color: colors.mutedForeground,
    },

    // ── Level 3 — Crane detail
    specCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 18,
      overflow: 'hidden',
      gap: 14,
    },
    specCardBar: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 3,
    },
    specGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 14,
      marginTop: 6,
    },
    craneNotes: {
      fontSize: 12,
      color: colors.mutedForeground,
      lineHeight: 18,
    },
    unitsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 7,
      marginBottom: 4,
    },
    unitChip: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 8,
      borderWidth: 1,
      backgroundColor: colors.muted,
    },
    unitChipText: {
      fontSize: 12,
      fontWeight: '600',
    },

    // ── Maintenance procedures placeholder
    proceduresEmpty: {
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      borderStyle: 'dashed',
      padding: 28,
      alignItems: 'center',
      gap: 10,
    },
    proceduresEmptyTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.foreground,
      textAlign: 'center',
    },
    proceduresEmptyBody: {
      fontSize: 13,
      color: colors.mutedForeground,
      textAlign: 'center',
      lineHeight: 19,
    },
    uploadBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
      paddingHorizontal: 20,
      paddingVertical: 11,
      borderRadius: 10,
      marginTop: 6,
    },
    uploadBtnText: {
      fontSize: 14,
      fontWeight: '700',
    },
  });
}

function DocCard({ doc, accent }: { doc: TechDoc; accent: string }) {
  const colors = useColors();
  const systemColor = SYSTEM_COLORS[doc.system];

  const openDoc = () => {
    const url = docUrl(doc);
    WebBrowser.openBrowserAsync(url, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
    }).catch(() => {
      /* no-op — URL may not be reachable in dev */
    });
  };

  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
      }}
    >
      {/* Left accent bar */}
      <View style={{ flexDirection: 'row' }}>
        <View style={{ width: 3, backgroundColor: systemColor }} />

        <View style={{ flex: 1, padding: 12, gap: 6 }}>
          {/* Title row */}
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
            <View style={{ flex: 1, gap: 2 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '700',
                  color: colors.foreground,
                  lineHeight: 19,
                }}
                numberOfLines={2}
              >
                {doc.title}
              </Text>
              {doc.subtitle ? (
                <Text
                  style={{ fontSize: 11, color: colors.mutedForeground }}
                  numberOfLines={1}
                >
                  {doc.subtitle}
                </Text>
              ) : null}
            </View>
          </View>

          {/* Badges + Open button row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            {/* Type badge */}
            <View
              style={{
                paddingHorizontal: 7,
                paddingVertical: 3,
                borderRadius: 5,
                backgroundColor: systemColor + '22',
              }}
            >
              <Text
                style={{
                  fontSize: 9,
                  fontWeight: '700',
                  color: systemColor,
                  letterSpacing: 0.6,
                  textTransform: 'uppercase',
                }}
              >
                {doc.type}
              </Text>
            </View>

            {/* System badge */}
            <View
              style={{
                paddingHorizontal: 7,
                paddingVertical: 3,
                borderRadius: 5,
                backgroundColor: colors.muted,
              }}
            >
              <Text
                style={{
                  fontSize: 9,
                  fontWeight: '600',
                  color: colors.mutedForeground,
                  letterSpacing: 0.4,
                }}
              >
                {doc.system}
              </Text>
            </View>

            {doc.pages ? (
              <Text style={{ fontSize: 10, color: colors.mutedForeground }}>
                {doc.pages} pp
              </Text>
            ) : null}

            {/* Spacer */}
            <View style={{ flex: 1 }} />

            {/* Open button */}
            <Pressable
              onPress={openDoc}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                backgroundColor: accent,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 8,
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Feather name="book-open" size={11} color="#fff" />
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#fff' }}>Open</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}
