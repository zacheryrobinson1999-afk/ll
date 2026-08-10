import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import {
  generateDailyCodes,
  makeLegacyDate,
  type DailyCodeResult,
} from '@/lib/dailyCodes';

type Tool = 'dashboard' | 'generator' | 'pressure' | 'units' | 'crane';
type UnitLength = 'mm' | 'm' | 'ft' | 'in';
type RecentItem = {
  id: string;
  kind: 'LICCON daycode' | 'Pressure' | 'Length' | 'Temperature' | 'Crane check';
  title: string;
  detail: string;
  timestamp: number;
  payload: Record<string, string>;
};
type CraneResult = {
  utilization: number;
  remaining: number;
  adjustedCapacity: number;
  status: 'WITHIN LIMIT' | 'REVIEW REQUIRED';
};
const RECENT_KEY = '@ltc/recent-calculations';
const lengthFactors: Record<UnitLength, number> = { mm: 0.001, m: 1, ft: 0.3048, in: 0.0254 };

function makeDate() {
  return new Date().toISOString().slice(0, 10);
}

function safeNumber(value: string) {
  const parsed = Number(value.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : NaN;
}

async function tactile(kind: 'selection' | 'impact' = 'selection') {
  try {
    if (kind === 'impact') await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    else await Haptics.selectionAsync();
  } catch {
    // Haptics are optional on web and on devices without a supported actuator.
  }
}

export default function TabOneScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [tool, setTool] = useState<Tool>('generator');
  const [recent, setRecent] = useState<RecentItem[]>([]);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [dailyCode, setDailyCode] = useState({
    serial: '',
    date: makeLegacyDate(),
  });
  const [dailyCodeResult, setDailyCodeResult] = useState<DailyCodeResult | null>(null);
  const [dailyCodeError, setDailyCodeError] = useState('');
  const [pressureValue, setPressureValue] = useState('');
  const [pressureUnit, setPressureUnit] = useState<'PSI' | 'BAR'>('PSI');
  const [lengthValue, setLengthValue] = useState('');
  const [lengthUnit, setLengthUnit] = useState<UnitLength>('mm');
  const [lengthToUnit, setLengthToUnit] = useState<UnitLength>('m');
  const [unitMode, setUnitMode] = useState<'length' | 'temperature'>('length');
  const [temperatureValue, setTemperatureValue] = useState('');
  const [temperatureUnit, setTemperatureUnit] = useState<'C' | 'F'>('C');
  const [crane, setCrane] = useState({
    craneNumber: '',
    date: makeDate(),
    loadWeight: '',
    radius: '',
    ratedCapacity: '',
    safetyFactor: '1.00',
  });
  const [craneResult, setCraneResult] = useState<CraneResult | null>(null);
  const [craneError, setCraneError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    AsyncStorage.getItem(RECENT_KEY)
      .then((stored) => {
        if (stored) setRecent(JSON.parse(stored) as RecentItem[]);
      })
      .catch(() => setNotice('Recent calculations could not be loaded.'));
  }, []);

  const saveRecent = async (item: RecentItem) => {
    const next = [item, ...recent.filter((entry) => entry.id !== item.id)].slice(0, 12);
    setRecent(next);
    try {
      await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(next));
      setNotice('Saved to recent calculations.');
      await tactile('impact');
    } catch {
      setNotice('Could not save this calculation.');
    }
  };

  const clearRecent = () => {
    Alert.alert('Clear recent calculations?', 'This removes the saved results from this device.', [
      { text: 'Keep', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          setRecent([]);
          await AsyncStorage.removeItem(RECENT_KEY);
          setNotice('Recent calculations cleared.');
        },
      },
    ]);
  };

  const pressureOutput = useMemo(() => {
    const value = safeNumber(pressureValue);
    if (!Number.isFinite(value)) return '';
    return (pressureUnit === 'PSI' ? value * 0.0689475729 : value * 14.5037738).toFixed(3);
  }, [pressureUnit, pressureValue]);

  const lengthOutput = useMemo(() => {
    const value = safeNumber(lengthValue);
    if (!Number.isFinite(value)) return '';
    const meters = value * lengthFactors[lengthUnit];
    return (meters / lengthFactors[lengthToUnit]).toFixed(4);
  }, [lengthToUnit, lengthUnit, lengthValue]);

  const temperatureOutput = useMemo(() => {
    const value = safeNumber(temperatureValue);
    if (!Number.isFinite(value)) return '';
    return (temperatureUnit === 'C' ? value * 9 / 5 + 32 : (value - 32) * 5 / 9).toFixed(2);
  }, [temperatureUnit, temperatureValue]);

  const resetConverters = () => {
    setPressureValue('');
    setLengthValue('');
    setTemperatureValue('');
    setNotice('');
  };

  const savePressure = () => {
    if (!pressureOutput) return setNotice('Enter a valid pressure first.');
    saveRecent({
      id: `pressure-${Date.now()}`,
      kind: 'Pressure',
      title: `${pressureValue} ${pressureUnit} → ${pressureOutput} ${pressureUnit === 'PSI' ? 'BAR' : 'PSI'}`,
      detail: 'Pressure conversion',
      timestamp: Date.now(),
      payload: { value: pressureValue, unit: pressureUnit },
    });
  };

  const saveLength = () => {
    if (!lengthOutput) return setNotice('Enter a valid length first.');
    saveRecent({
      id: `length-${Date.now()}`,
      kind: 'Length',
      title: `${lengthValue} ${lengthUnit} → ${lengthOutput} ${lengthToUnit}`,
      detail: 'Length conversion',
      timestamp: Date.now(),
      payload: { value: lengthValue, from: lengthUnit, to: lengthToUnit },
    });
  };

  const saveTemperature = () => {
    if (!temperatureOutput) return setNotice('Enter a valid temperature first.');
    saveRecent({
      id: `temperature-${Date.now()}`,
      kind: 'Temperature',
      title: `${temperatureValue}°${temperatureUnit} → ${temperatureOutput}°${temperatureUnit === 'C' ? 'F' : 'C'}`,
      detail: 'Temperature conversion',
      timestamp: Date.now(),
      payload: { value: temperatureValue, unit: temperatureUnit },
    });
  };

  const updateDailyCode = (key: keyof typeof dailyCode, value: string) => {
    setDailyCode((current) => ({ ...current, [key]: value }));
    setDailyCodeError('');
    setDailyCodeResult(null);
  };

  const calculateDailyCode = () => {
    Keyboard.dismiss();
    try {
      const result = generateDailyCodes(dailyCode.serial, dailyCode.date);
      setDailyCodeResult(result);
      setDailyCodeError('');
      tactile('impact');
    } catch (error) {
      setDailyCodeResult(null);
      setDailyCodeError(error instanceof Error ? error.message : 'Check the serial and date.');
    }
  };

  const saveDailyCode = () => {
    if (!dailyCodeResult) {
      setDailyCodeError('Generate the daily code before saving.');
      return;
    }
    saveRecent({
      id: `daily-code-${Date.now()}`,
      kind: 'LICCON daycode',
      title: `${dailyCode.serial} · ${dailyCodeResult.first} / ${dailyCodeResult.second}`,
      detail: `LICCON daycode · ${dailyCode.date}`,
      timestamp: Date.now(),
      payload: { ...dailyCode },
    });
  };

  const updateCrane = (key: keyof typeof crane, value: string) => {
    setCrane((current) => ({ ...current, [key]: value }));
    if (craneError) setCraneError('');
    if (craneResult) setCraneResult(null);
  };

  const calculateCrane = () => {
    Keyboard.dismiss();
    const load = safeNumber(crane.loadWeight);
    const radius = safeNumber(crane.radius);
    const capacity = safeNumber(crane.ratedCapacity);
    const factor = safeNumber(crane.safetyFactor);
    if (!crane.craneNumber.trim() || !crane.date.trim()) return setCraneError('Crane number and date are required.');
    if (![load, radius, capacity, factor].every((value) => Number.isFinite(value) && value > 0)) {
      return setCraneError('Enter positive values for load, radius, capacity, and safety factor.');
    }
    const adjustedCapacity = capacity * factor;
    const utilization = (load / adjustedCapacity) * 100;
    const result: CraneResult = {
      utilization,
      remaining: adjustedCapacity - load,
      adjustedCapacity,
      status: utilization <= 100 ? 'WITHIN LIMIT' : 'REVIEW REQUIRED',
    };
    setCraneResult(result);
    tactile('impact');
  };

  const saveCrane = () => {
    if (!craneResult) return setCraneError('Calculate a crane check before saving.');
    saveRecent({
      id: `crane-${Date.now()}`,
      kind: 'Crane check',
      title: `${crane.craneNumber || 'Unnamed crane'} · ${craneResult.utilization.toFixed(1)}% utilized`,
      detail: `${craneResult.status} · ${crane.date}`,
      timestamp: Date.now(),
      payload: { ...crane },
    });
  };

  const openRecent = (item: RecentItem) => {
    if (item.kind === 'LICCON daycode') {
      setTool('generator');
      setDailyCode({
        serial: item.payload.serial ?? '',
        date: item.payload.date ?? makeLegacyDate(),
      });
      setDailyCodeResult(null);
      setDailyCodeError('');
    } else if (item.kind === 'Pressure') {
      setTool('pressure');
      setPressureValue(item.payload.value ?? '');
      setPressureUnit((item.payload.unit as 'PSI' | 'BAR') ?? 'PSI');
    } else if (item.kind === 'Length') {
      setTool('units');
      setUnitMode('length');
      setLengthValue(item.payload.value ?? '');
      setLengthUnit((item.payload.from as UnitLength) ?? 'mm');
      setLengthToUnit((item.payload.to as UnitLength) ?? 'm');
    } else if (item.kind === 'Temperature') {
      setTool('units');
      setUnitMode('temperature');
      setTemperatureValue(item.payload.value ?? '');
      setTemperatureUnit((item.payload.unit as 'C' | 'F') ?? 'C');
    } else {
      setTool('crane');
      setCrane((current) => ({ ...current, ...item.payload }));
      setCraneResult(null);
    }
    setNotice('Loaded from recent calculations.');
  };

  const goTool = (next: Tool) => {
    tactile();
    setTool(next);
    setNotice('');
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        <ScrollView
          contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 92 }]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topbar}>
            <View style={styles.brandLine}>
              <View style={styles.brandMark}><MaterialCommunityIcons name="crane" size={21} color={colors.primary} /></View>
              <View>
                <Text style={styles.eyebrow}>LTC ENGINEERING</Text>
                <Text style={styles.brand}>FIELD INSTRUMENT</Text>
              </View>
            </View>
            <Pressable testID="about-button" onPress={() => setAboutOpen(true)} style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
              <Feather name="info" size={20} color={colors.mutedForeground} />
            </Pressable>
          </View>

          {tool === 'dashboard' ? (
            <Dashboard colors={colors} styles={styles} recent={recent} onTool={goTool} onRecent={openRecent} onClear={clearRecent} />
          ) : (
            <>
              <View style={styles.sectionHeader}>
                <Pressable onPress={() => goTool('dashboard')} style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
                  <Feather name="arrow-left" size={18} color={colors.primary} />
                  <Text style={styles.backText}>TOOLS</Text>
                </Pressable>
                 <Text style={styles.sectionKicker}>{tool === 'generator' ? 'LICCON DAYCODE' : tool === 'crane' ? 'LOAD CHECK' : 'CONVERTER'}</Text>
              </View>
              {tool === 'generator' && (
                <DailyCodeTool
                  colors={colors}
                  styles={styles}
                  dailyCode={dailyCode}
                  result={dailyCodeResult}
                  error={dailyCodeError}
                  update={updateDailyCode}
                  calculate={calculateDailyCode}
                  save={saveDailyCode}
                />
              )}
              {tool === 'pressure' && (
                <PressureTool
                  colors={colors}
                  styles={styles}
                  value={pressureValue}
                  unit={pressureUnit}
                  output={pressureOutput}
                  onValue={setPressureValue}
                  onUnit={setPressureUnit}
                  onSwap={() => {
                    setPressureUnit(pressureUnit === 'PSI' ? 'BAR' : 'PSI');
                    setPressureValue(pressureOutput);
                  }}
                  onReset={() => { setPressureValue(''); setNotice(''); }}
                  onSave={savePressure}
                />
              )}
              {tool === 'units' && (
                <UnitsTool
                  colors={colors}
                  styles={styles}
                  mode={unitMode}
                  setMode={setUnitMode}
                  lengthValue={lengthValue}
                  lengthUnit={lengthUnit}
                  lengthToUnit={lengthToUnit}
                  lengthOutput={lengthOutput}
                  temperatureValue={temperatureValue}
                  temperatureUnit={temperatureUnit}
                  temperatureOutput={temperatureOutput}
                  setLengthValue={setLengthValue}
                  setLengthUnit={setLengthUnit}
                  setLengthToUnit={setLengthToUnit}
                  setTemperatureValue={setTemperatureValue}
                  setTemperatureUnit={setTemperatureUnit}
                  onReset={resetConverters}
                  onSaveLength={saveLength}
                  onSaveTemperature={saveTemperature}
                />
              )}
              {tool === 'crane' && (
                <CraneTool
                  colors={colors}
                  styles={styles}
                  crane={crane}
                  result={craneResult}
                  error={craneError}
                  update={updateCrane}
                  calculate={calculateCrane}
                  save={saveCrane}
                />
              )}
            </>
          )}
          {!!notice && <View style={styles.notice}><Feather name="check-circle" size={16} color={colors.accent} /><Text style={styles.noticeText}>{notice}</Text></View>}
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={aboutOpen} animationType="slide" transparent onRequestClose={() => setAboutOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.modalHandle} />
            <View style={styles.modalTitleRow}>
              <View style={styles.brandMark}><MaterialCommunityIcons name="crane" size={21} color={colors.primary} /></View>
              <Text style={styles.modalTitle}>About LTC field instrument</Text>
              <Pressable onPress={() => setAboutOpen(false)} style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
                <Feather name="x" size={21} color={colors.mutedForeground} />
              </Pressable>
            </View>
            <Text style={styles.modalBody}>A rebuilt pocket utility inspired by the original LTC (c) 2012 crane engineering APK. It keeps the essentials close at hand: pressure, dimensional checks, temperature, and a clear capacity review.</Text>
            <View style={styles.helpCallout}>
              <Feather name="alert-triangle" size={18} color={colors.primary} />
              <Text style={styles.helpText}>Always verify results against the crane manufacturer's official load chart, site conditions, and current inspection requirements.</Text>
            </View>
            <Text style={styles.version}>LTC / REBUILD 01 · OFFLINE READY</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

type SharedProps = { colors: ReturnType<typeof useColors>; styles: ReturnType<typeof createStyles> };

function Dashboard({ colors, styles, recent, onTool, onRecent, onClear }: SharedProps & { recent: RecentItem[]; onTool: (tool: Tool) => void; onRecent: (item: RecentItem) => void; onClear: () => void }) {
  return (
    <>
      <View style={styles.hero}>
        <View style={styles.heroCopy}>
          <Text style={styles.heroKicker}>READY FOR THE NEXT CHECK</Text>
          <Text style={styles.heroTitle}>Measure twice.{'\n'}Lift once.</Text>
          <Text style={styles.heroBody}>Fast field calculations for the machines that move the work.</Text>
        </View>
        <Image source={require('@/assets/images/crane.png')} style={styles.craneImage} resizeMode="contain" />
        <View style={styles.heroRule}><View style={styles.ruleYellow} /><View style={styles.ruleCyan} /></View>
      </View>

      <View style={styles.toolsHeading}>
        <View><Text style={styles.sectionTitle}>INSTRUMENTS</Text><Text style={styles.sectionSub}>Choose a field-ready check</Text></View>
        <View style={styles.livePill}><View style={styles.liveDot} /><Text style={styles.liveText}>LOCAL</Text></View>
      </View>
      <View style={styles.toolGrid}>
        <Pressable testID="daily-code-tool" onPress={() => onTool('generator')} style={({ pressed }) => [styles.generatorToolCard, pressed && styles.pressed]}>
          <View style={styles.generatorIcon}><MaterialCommunityIcons name="key-variant" size={24} color={colors.primary} /></View>
          <View style={styles.toolCardText}><Text style={styles.toolLabel}>LICCON DAYCODE GENERATOR</Text><Text style={styles.toolDetail}>SERIAL + DATE → 2 CODES</Text></View>
          <Feather name="arrow-up-right" size={18} color={colors.primary} />
        </Pressable>
        <ToolCard colors={colors} styles={styles} icon="activity" label="Pressure" detail="PSI ↔ BAR" tint="yellow" onPress={() => onTool('pressure')} />
        <ToolCard colors={colors} styles={styles} icon="maximize" label="Dimensions" detail="LENGTH + TEMP" tint="cyan" onPress={() => onTool('units')} />
        <Pressable testID="crane-check-tool" onPress={() => onTool('crane')} style={({ pressed }) => [styles.craneToolCard, pressed && styles.pressed]}>
          <Image source={require('@/assets/images/icon.png')} style={styles.toolIconImage} />
          <View style={styles.toolCardText}><Text style={styles.toolLabel}>LTC CRANE CHECK</Text><Text style={styles.toolDetail}>CAPACITY REVIEW</Text></View>
          <Feather name="arrow-up-right" size={18} color={colors.primary} />
        </Pressable>
      </View>
      <RecentList colors={colors} styles={styles} recent={recent} onRecent={onRecent} onClear={onClear} />
    </>
  );
}

function ToolCard({ colors, styles, icon, label, detail, tint, onPress }: SharedProps & { icon: 'activity' | 'maximize'; label: string; detail: string; tint: 'yellow' | 'cyan'; onPress: () => void }) {
  const iconColor = tint === 'yellow' ? colors.primary : colors.accent;
  return (
    <Pressable testID={`${label.toLowerCase()}-tool`} onPress={onPress} style={({ pressed }) => [styles.toolCard, pressed && styles.pressed]}>
      <View style={[styles.toolIcon, { backgroundColor: tint === 'yellow' ? colors.secondary : colors.muted }]}><Feather name={icon} size={23} color={iconColor} /></View>
      <Text style={styles.toolLabel}>{label.toUpperCase()}</Text>
      <Text style={styles.toolDetail}>{detail}</Text>
      <Feather name="arrow-up-right" size={16} color={colors.mutedForeground} style={styles.toolArrow} />
    </Pressable>
  );
}

function RecentList({ colors, styles, recent, onRecent, onClear }: SharedProps & { recent: RecentItem[]; onRecent: (item: RecentItem) => void; onClear: () => void }) {
  return (
    <View style={styles.recentSection}>
      <View style={styles.listHeading}>
        <View><Text style={styles.sectionTitle}>RECENT CHECKS</Text><Text style={styles.sectionSub}>Saved on this device</Text></View>
        {recent.length > 0 && <Pressable onPress={onClear} style={({ pressed }) => [styles.clearButton, pressed && styles.pressed]}><Text style={styles.clearText}>CLEAR ALL</Text></Pressable>}
      </View>
      {recent.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}><Feather name="clock" size={20} color={colors.mutedForeground} /></View>
          <Text style={styles.emptyTitle}>No saved checks yet</Text>
          <Text style={styles.emptyBody}>Save a result after any calculation to make it available here offline.</Text>
        </View>
      ) : recent.slice(0, 4).map((item) => (
        <Pressable key={item.id} onPress={() => onRecent(item)} style={({ pressed }) => [styles.recentRow, pressed && styles.pressed]}>
          <View style={styles.recentIcon}><Feather name={item.kind === 'LICCON daycode' ? 'key' : item.kind === 'Crane check' ? 'anchor' : item.kind === 'Pressure' ? 'activity' : 'repeat'} size={17} color={colors.primary} /></View>
          <View style={styles.recentCopy}><Text style={styles.recentTitle} numberOfLines={1}>{item.title}</Text><Text style={styles.recentDetail}>{item.detail} · {new Date(item.timestamp).toLocaleDateString()}</Text></View>
          <Feather name="chevron-right" size={17} color={colors.mutedForeground} />
        </Pressable>
      ))}
    </View>
  );
}

function DailyCodeTool({
  colors,
  styles,
  dailyCode,
  result,
  error,
  update,
  calculate,
  save,
}: SharedProps & {
  dailyCode: { serial: string; date: string };
  result: DailyCodeResult | null;
  error: string;
  update: (key: 'serial' | 'date', value: string) => void;
  calculate: () => void;
  save: () => void;
}) {
  return (
    <View>
      <ToolIntro
        colors={colors}
        styles={styles}
        icon="key"
        title="LICCON daycode generator"
        text="Generate the two daily access codes from the crane serial number and date."
      />
      <View style={styles.formCard}>
        <View style={styles.formHeader}>
          <View>
            <Text style={styles.inputLabel}>ACCESS CODE INPUT</Text>
            <Text style={styles.formHint}>Matches the original LTC routine</Text>
          </View>
          <Text style={styles.formCode}>LTC / 00</Text>
        </View>
        <Field
          colors={colors}
          styles={styles}
          label="CRANE SERIAL NUMBER"
          value={dailyCode.serial}
          placeholder="5–9 digits"
          keyboardType="number-pad"
          onChangeText={(value) => update('serial', value.replace(/\D/g, '').slice(0, 9))}
        />
        <Field
          colors={colors}
          styles={styles}
          label="DATE · DDMMYY"
          value={dailyCode.date}
          placeholder="010126"
          keyboardType="number-pad"
          onChangeText={(value) => update('date', value.replace(/\D/g, '').slice(0, 6))}
        />
        {!!error && (
          <View style={styles.errorRow}>
            <Feather name="alert-circle" size={16} color={colors.destructive} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        <Pressable
          testID="generate-daily-code"
          onPress={calculate}
          style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
        >
          <MaterialCommunityIcons name="key-variant" size={19} color={colors.primaryForeground} />
          <Text style={styles.primaryButtonText}>GENERATE LICCON CODES</Text>
        </Pressable>
      </View>
      {result && (
        <View style={styles.codeResultCard}>
          <View style={styles.resultTop}>
            <View>
              <Text style={styles.inputLabel}>LICCON CODES</Text>
              <Text style={styles.codeResultSubtitle}>CRANE {dailyCode.serial} · {dailyCode.date}</Text>
            </View>
            <View style={styles.codeReadyIcon}>
              <Feather name="check" size={18} color={colors.background} />
            </View>
          </View>
          <View style={styles.codePair}>
            <View style={styles.codeBlock}>
              <Text style={styles.codeLabel}>LEVEL 1 ACCESS</Text>
              <Text selectable style={styles.codeValue}>{result.first}</Text>
            </View>
            <View style={styles.codeBlock}>
              <Text style={styles.codeLabel}>LEVEL 2 ACCESS</Text>
              <Text selectable style={styles.codeValue}>{result.second}</Text>
            </View>
          </View>
          <Text style={styles.resultNote}>Use these codes for the selected crane and date. The date format is day, month, year.</Text>
          <Pressable
            testID="save-daily-code"
            onPress={save}
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
          >
            <Feather name="bookmark" size={17} color={colors.primary} />
            <Text style={styles.secondaryButtonText}>SAVE CODES</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

function PressureTool({ colors, styles, value, unit, output, onValue, onUnit, onSwap, onReset, onSave }: SharedProps & { value: string; unit: 'PSI' | 'BAR'; output: string; onValue: (value: string) => void; onUnit: (unit: 'PSI' | 'BAR') => void; onSwap: () => void; onReset: () => void; onSave: () => void }) {
  const target = unit === 'PSI' ? 'BAR' : 'PSI';
  return (
    <View>
      <ToolIntro colors={colors} styles={styles} icon="activity" title="Pressure converter" text="Translate hydraulic and load-sensing readings without leaving the machine." />
      <View style={styles.converterCard}>
        <Text style={styles.inputLabel}>READING</Text>
        <View style={styles.valueRow}>
          <TextInput testID="pressure-input" value={value} onChangeText={onValue} keyboardType="decimal-pad" placeholder="0.00" placeholderTextColor={colors.mutedForeground} style={styles.bigInput} />
          <UnitBadge colors={colors} styles={styles} value={unit} active onPress={() => onUnit(unit === 'PSI' ? 'BAR' : 'PSI')} />
        </View>
        <View style={styles.converterDivider}><View style={styles.dividerLine} /><Pressable testID="pressure-swap" onPress={onSwap} style={({ pressed }) => [styles.swapButton, pressed && styles.pressed]}><Feather name="repeat" size={18} color={colors.primary} /></Pressable><View style={styles.dividerLine} /></View>
        <Text style={styles.inputLabel}>CONVERTED RESULT</Text>
        <View style={styles.valueRow}><Text style={[styles.outputValue, !output && styles.placeholderOutput]}>{output || '—'}</Text><UnitBadge colors={colors} styles={styles} value={target} /></View>
        <Text style={styles.formula}>1 PSI = 0.0689476 BAR</Text>
      </View>
      <ActionRow colors={colors} styles={styles} onReset={onReset} onSave={onSave} />
    </View>
  );
}

function UnitsTool({ colors, styles, mode, setMode, lengthValue, lengthUnit, lengthToUnit, lengthOutput, temperatureValue, temperatureUnit, temperatureOutput, setLengthValue, setLengthUnit, setLengthToUnit, setTemperatureValue, setTemperatureUnit, onReset, onSaveLength, onSaveTemperature }: SharedProps & { mode: 'length' | 'temperature'; setMode: (mode: 'length' | 'temperature') => void; lengthValue: string; lengthUnit: UnitLength; lengthToUnit: UnitLength; lengthOutput: string; temperatureValue: string; temperatureUnit: 'C' | 'F'; temperatureOutput: string; setLengthValue: (v: string) => void; setLengthUnit: (v: UnitLength) => void; setLengthToUnit: (v: UnitLength) => void; setTemperatureValue: (v: string) => void; setTemperatureUnit: (v: 'C' | 'F') => void; onReset: () => void; onSaveLength: () => void; onSaveTemperature: () => void }) {
  return (
    <View>
      <ToolIntro colors={colors} styles={styles} icon="maximize" title="Field converters" text="Keep boom dimensions and ambient readings consistent across crews and charts." />
      <View style={styles.segmented}><Pressable onPress={() => setMode('length')} style={[styles.segment, mode === 'length' && styles.segmentActive]}><Text style={[styles.segmentText, mode === 'length' && styles.segmentTextActive]}>LENGTH</Text></Pressable><Pressable onPress={() => setMode('temperature')} style={[styles.segment, mode === 'temperature' && styles.segmentActive]}><Text style={[styles.segmentText, mode === 'temperature' && styles.segmentTextActive]}>TEMPERATURE</Text></Pressable></View>
      {mode === 'length' ? (
        <View style={styles.converterCard}>
          <Text style={styles.inputLabel}>VALUE</Text>
          <View style={styles.valueRow}><TextInput testID="length-input" value={lengthValue} onChangeText={setLengthValue} keyboardType="decimal-pad" placeholder="0.00" placeholderTextColor={colors.mutedForeground} style={styles.bigInput} /><UnitBadge colors={colors} styles={styles} value={lengthUnit.toUpperCase()} onPress={() => {}} /></View>
          <UnitPicker colors={colors} styles={styles} selected={lengthUnit} options={['mm', 'm', 'ft', 'in']} onSelect={setLengthUnit} />
          <View style={styles.converterDivider}><View style={styles.dividerLine} /><Feather name="arrow-down" size={17} color={colors.mutedForeground} /><View style={styles.dividerLine} /></View>
          <Text style={styles.inputLabel}>CONVERTED RESULT</Text>
          <View style={styles.valueRow}><Text style={[styles.outputValue, !lengthOutput && styles.placeholderOutput]}>{lengthOutput || '—'}</Text><UnitBadge colors={colors} styles={styles} value={lengthToUnit.toUpperCase()} onPress={() => {}} /></View>
          <UnitPicker colors={colors} styles={styles} selected={lengthToUnit} options={['mm', 'm', 'ft', 'in']} onSelect={setLengthToUnit} />
        </View>
      ) : (
        <View style={styles.converterCard}>
          <Text style={styles.inputLabel}>TEMPERATURE</Text>
          <View style={styles.valueRow}><TextInput testID="temperature-input" value={temperatureValue} onChangeText={setTemperatureValue} keyboardType="decimal-pad" placeholder="0.00" placeholderTextColor={colors.mutedForeground} style={styles.bigInput} /><UnitBadge colors={colors} styles={styles} value={`°${temperatureUnit}`} onPress={() => setTemperatureUnit(temperatureUnit === 'C' ? 'F' : 'C')} /></View>
          <View style={styles.converterDivider}><View style={styles.dividerLine} /><Pressable onPress={() => { setTemperatureUnit(temperatureUnit === 'C' ? 'F' : 'C'); setTemperatureValue(temperatureOutput); }} style={({ pressed }) => [styles.swapButton, pressed && styles.pressed]}><Feather name="repeat" size={18} color={colors.primary} /></Pressable><View style={styles.dividerLine} /></View>
          <Text style={styles.inputLabel}>CONVERTED RESULT</Text>
          <View style={styles.valueRow}><Text style={[styles.outputValue, !temperatureOutput && styles.placeholderOutput]}>{temperatureOutput || '—'}</Text><UnitBadge colors={colors} styles={styles} value={`°${temperatureUnit === 'C' ? 'F' : 'C'}`} /></View>
          <Text style={styles.formula}>°F = (°C × 9/5) + 32</Text>
        </View>
      )}
      <ActionRow colors={colors} styles={styles} onReset={onReset} onSave={mode === 'length' ? onSaveLength : onSaveTemperature} />
    </View>
  );
}

function CraneTool({ colors, styles, crane, result, error, update, calculate, save }: SharedProps & { crane: { craneNumber: string; date: string; loadWeight: string; radius: string; ratedCapacity: string; safetyFactor: string }; result: CraneResult | null; error: string; update: (key: keyof typeof crane, value: string) => void; calculate: () => void; save: () => void }) {
  return (
    <View>
      <ToolIntro colors={colors} styles={styles} icon="anchor" title="LTC crane check" text="A quick capacity review. Use the official load chart for the final decision." />
      <View style={styles.formCard}>
        <View style={styles.formHeader}><Text style={styles.inputLabel}>CHECK DETAILS</Text><Text style={styles.formCode}>LTC / 01</Text></View>
        <Field colors={colors} styles={styles} label="CRANE NUMBER" value={crane.craneNumber} placeholder="e.g. 047" onChangeText={(v) => update('craneNumber', v)} />
        <Field colors={colors} styles={styles} label="DATE" value={crane.date} placeholder="YYYY-MM-DD" onChangeText={(v) => update('date', v)} />
        <View style={styles.fieldGrid}>
          <Field colors={colors} styles={styles} label="LOAD WEIGHT" suffix="t" value={crane.loadWeight} placeholder="0.00" keyboardType="decimal-pad" onChangeText={(v) => update('loadWeight', v)} />
          <Field colors={colors} styles={styles} label="RADIUS" suffix="m" value={crane.radius} placeholder="0.00" keyboardType="decimal-pad" onChangeText={(v) => update('radius', v)} />
        </View>
        <View style={styles.fieldGrid}>
          <Field colors={colors} styles={styles} label="RATED CAPACITY" suffix="t" value={crane.ratedCapacity} placeholder="0.00" keyboardType="decimal-pad" onChangeText={(v) => update('ratedCapacity', v)} />
          <Field colors={colors} styles={styles} label="SAFETY FACTOR" suffix="×" value={crane.safetyFactor} placeholder="1.00" keyboardType="decimal-pad" onChangeText={(v) => update('safetyFactor', v)} />
        </View>
        {!!error && <View style={styles.errorRow}><Feather name="alert-circle" size={16} color={colors.destructive} /><Text style={styles.errorText}>{error}</Text></View>}
        <Pressable testID="calculate-crane" onPress={calculate} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}><MaterialCommunityIcons name="calculator-variant-outline" size={19} color={colors.primaryForeground} /><Text style={styles.primaryButtonText}>CALCULATE CHECK</Text></Pressable>
      </View>
      {result && <ResultCard colors={colors} styles={styles} result={result} onSave={save} />}
    </View>
  );
}

function ResultCard({ colors, styles, result, onSave }: SharedProps & { result: CraneResult; onSave: () => void }) {
  const safe = result.status === 'WITHIN LIMIT';
  return (
    <View style={[styles.resultCard, { borderColor: safe ? colors.success : colors.destructive }]}>
      <View style={styles.resultTop}><View><Text style={styles.inputLabel}>CALCULATION RESULT</Text><Text style={[styles.statusText, { color: safe ? colors.success : colors.destructive }]}>{result.status}</Text></View><View style={[styles.statusIcon, { backgroundColor: safe ? colors.success : colors.destructive }]}><Feather name={safe ? 'check' : 'alert-triangle'} size={20} color={colors.background} /></View></View>
      <View style={styles.metricRow}><Metric styles={styles} label="UTILIZATION" value={`${result.utilization.toFixed(1)}%`} /><Metric styles={styles} label="REMAINING" value={`${Math.max(result.remaining, 0).toFixed(2)} t`} /><Metric styles={styles} label="ADJUSTED CAP." value={`${result.adjustedCapacity.toFixed(2)} t`} /></View>
      <Text style={styles.resultNote}>{safe ? 'The entered load is within the adjusted capacity.' : 'The entered load exceeds the adjusted capacity. Stop and review the official chart.'}</Text>
      <Pressable testID="save-crane-result" onPress={onSave} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}><Feather name="bookmark" size={17} color={colors.primary} /><Text style={styles.secondaryButtonText}>SAVE RESULT</Text></Pressable>
    </View>
  );
}

function Metric({ styles, label, value }: { styles: ReturnType<typeof createStyles>; label: string; value: string }) {
  return <View style={styles.metric}><Text style={styles.metricLabel}>{label}</Text><Text style={styles.metricValue}>{value}</Text></View>;
}

function ToolIntro({ colors, styles, icon, title, text }: SharedProps & { icon: 'activity' | 'maximize' | 'anchor' | 'key'; title: string; text: string }) {
  return <View style={styles.toolIntro}><View style={styles.toolIntroIcon}><Feather name={icon} size={22} color={colors.primary} /></View><View style={styles.toolIntroCopy}><Text style={styles.toolTitle}>{title}</Text><Text style={styles.toolDescription}>{text}</Text></View></View>;
}

function UnitBadge({ colors, styles, value, active, onPress }: SharedProps & { value: string; active?: boolean; onPress?: () => void }) {
  return <Pressable disabled={!onPress} onPress={onPress} style={[styles.unitBadge, active && { backgroundColor: colors.primary }]}><Text style={[styles.unitBadgeText, active && { color: colors.primaryForeground }]}>{value}</Text></Pressable>;
}

function UnitPicker({ colors, styles, selected, options, onSelect }: SharedProps & { selected: string; options: string[]; onSelect: (value: any) => void }) {
  return <View style={styles.unitPicker}>{options.map((option) => <Pressable key={option} onPress={() => { onSelect(option); tactile(); }} style={[styles.unitOption, selected === option && { backgroundColor: colors.secondary, borderColor: colors.primary }]}><Text style={[styles.unitOptionText, selected === option && { color: colors.primary }]}>{option.toUpperCase()}</Text></Pressable>)}</View>;
}

function ActionRow({ colors, styles, onReset, onSave }: SharedProps & { onReset: () => void; onSave: () => void }) {
  return <View style={styles.actionRow}><Pressable onPress={onReset} style={({ pressed }) => [styles.resetButton, pressed && styles.pressed]}><Feather name="rotate-ccw" size={16} color={colors.mutedForeground} /><Text style={styles.resetText}>RESET</Text></Pressable><Pressable onPress={onSave} style={({ pressed }) => [styles.saveButton, pressed && styles.pressed]}><Feather name="bookmark" size={16} color={colors.primaryForeground} /><Text style={styles.saveText}>SAVE RESULT</Text></Pressable></View>;
}

function Field({ colors, styles, label, suffix, value, placeholder, keyboardType, onChangeText }: SharedProps & { label: string; suffix?: string; value: string; placeholder: string; keyboardType?: 'decimal-pad' | 'number-pad' | 'default'; onChangeText: (value: string) => void }) {
  return <View style={styles.field}><Text style={styles.inputLabel}>{label}</Text><View style={styles.fieldInputWrap}><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.mutedForeground} keyboardType={keyboardType ?? 'default'} autoCapitalize="characters" style={styles.fieldInput} /><Text style={styles.fieldSuffix}>{suffix}</Text></View></View>;
}

const createStyles = (colors: ReturnType<typeof useColors>) => StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 18 },
  topbar: { minHeight: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 },
  brandLine: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandMark: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  eyebrow: { color: colors.primary, fontSize: 10, fontWeight: '700', letterSpacing: 1.6 },
  brand: { color: colors.foreground, fontSize: 13, fontWeight: '700', letterSpacing: 1.1, marginTop: 2 },
  iconButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.62, transform: [{ scale: 0.98 }] },
  hero: { minHeight: 205, backgroundColor: colors.card, borderRadius: 18, borderWidth: 1, borderColor: colors.border, padding: 18, overflow: 'hidden', position: 'relative', marginBottom: 27 },
  heroCopy: { width: '69%', zIndex: 2 },
  heroKicker: { color: colors.accent, fontSize: 10, fontWeight: '700', letterSpacing: 1.3, marginBottom: 9 },
  heroTitle: { color: colors.foreground, fontSize: 30, lineHeight: 33, fontWeight: '700', letterSpacing: -0.7 },
  heroBody: { color: colors.mutedForeground, fontSize: 12, lineHeight: 17, marginTop: 12, maxWidth: 190 },
  craneImage: { position: 'absolute', right: -17, bottom: 18, width: 185, height: 102, opacity: 0.86 },
  heroRule: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, flexDirection: 'row' },
  ruleYellow: { flex: 3, backgroundColor: colors.primary },
  ruleCyan: { flex: 1, backgroundColor: colors.accent },
  toolsHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 13 },
  sectionTitle: { color: colors.foreground, fontSize: 12, fontWeight: '700', letterSpacing: 1.4 },
  sectionSub: { color: colors.mutedForeground, fontSize: 12, marginTop: 4 },
  livePill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.muted, borderRadius: 20, paddingHorizontal: 9, paddingVertical: 6 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.success },
  liveText: { color: colors.mutedForeground, fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  toolGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  generatorToolCard: { width: '100%', minHeight: 78, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.secondary, borderRadius: 14, borderWidth: 1, borderColor: colors.primary, paddingHorizontal: 13, gap: 11 },
  generatorIcon: { width: 43, height: 43, borderRadius: 11, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  toolCard: { width: '48.3%', minHeight: 127, backgroundColor: colors.card, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 13 },
  craneToolCard: { width: '100%', minHeight: 71, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceRaised, borderRadius: 14, borderWidth: 1, borderColor: colors.primary, paddingHorizontal: 13, gap: 11 },
  toolIcon: { width: 40, height: 40, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginBottom: 13 },
  toolIconImage: { width: 45, height: 45, borderRadius: 9 },
  toolCardText: { flex: 1 },
  toolLabel: { color: colors.foreground, fontSize: 12, fontWeight: '700', letterSpacing: 0.8 },
  toolDetail: { color: colors.mutedForeground, fontSize: 10, letterSpacing: 0.9, marginTop: 5 },
  toolArrow: { position: 'absolute', right: 13, top: 14 },
  recentSection: { marginTop: 32 },
  listHeading: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 12 },
  clearButton: { paddingVertical: 6, paddingHorizontal: 2 },
  clearText: { color: colors.destructive, fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  emptyState: { minHeight: 145, backgroundColor: colors.card, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.border, borderRadius: 14, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
  emptyIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.muted, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  emptyTitle: { color: colors.foreground, fontSize: 13, fontWeight: '600' },
  emptyBody: { color: colors.mutedForeground, fontSize: 11, lineHeight: 16, textAlign: 'center', marginTop: 5 },
  recentRow: { minHeight: 64, borderBottomWidth: 1, borderBottomColor: colors.canvasLine, flexDirection: 'row', alignItems: 'center', gap: 11 },
  recentIcon: { width: 34, height: 34, borderRadius: 9, backgroundColor: colors.muted, alignItems: 'center', justifyContent: 'center' },
  recentCopy: { flex: 1 },
  recentTitle: { color: colors.foreground, fontSize: 12, fontWeight: '600' },
  recentDetail: { color: colors.mutedForeground, fontSize: 10, marginTop: 5 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingVertical: 8, paddingRight: 12 },
  backText: { color: colors.primary, fontSize: 11, fontWeight: '700', letterSpacing: 1.1 },
  sectionKicker: { color: colors.mutedForeground, fontSize: 10, fontWeight: '700', letterSpacing: 1.4 },
  toolIntro: { flexDirection: 'row', gap: 13, marginBottom: 22 },
  toolIntroIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.secondary, justifyContent: 'center', alignItems: 'center' },
  toolIntroCopy: { flex: 1 },
  toolTitle: { color: colors.foreground, fontSize: 22, fontWeight: '700', letterSpacing: -0.4 },
  toolDescription: { color: colors.mutedForeground, fontSize: 12, lineHeight: 17, marginTop: 5 },
  converterCard: { backgroundColor: colors.card, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 16 },
  inputLabel: { color: colors.mutedForeground, fontSize: 10, fontWeight: '700', letterSpacing: 1.2, marginBottom: 7 },
  valueRow: { minHeight: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bigInput: { flex: 1, color: colors.foreground, fontSize: 34, fontWeight: '600', paddingVertical: 4, letterSpacing: -1 },
  outputValue: { flex: 1, color: colors.primary, fontSize: 34, fontWeight: '600', letterSpacing: -1 },
  placeholderOutput: { color: colors.mutedForeground },
  unitBadge: { minWidth: 56, height: 36, paddingHorizontal: 11, borderRadius: 8, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center' },
  unitBadgeText: { color: colors.secondaryForeground, fontSize: 12, fontWeight: '700', letterSpacing: 0.6 },
  converterDivider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 15 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  swapButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.muted, alignItems: 'center', justifyContent: 'center' },
  formula: { color: colors.mutedForeground, fontSize: 10, marginTop: 16, letterSpacing: 0.2 },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 13 },
  resetButton: { height: 48, flex: 0.7, borderRadius: 11, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  resetText: { color: colors.mutedForeground, fontSize: 11, fontWeight: '700', letterSpacing: 0.8 },
  saveButton: { height: 48, flex: 1.3, borderRadius: 11, backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  saveText: { color: colors.primaryForeground, fontSize: 11, fontWeight: '700', letterSpacing: 0.8 },
  segmented: { flexDirection: 'row', backgroundColor: colors.muted, borderRadius: 11, padding: 4, marginBottom: 12 },
  segment: { flex: 1, height: 36, justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
  segmentActive: { backgroundColor: colors.secondary },
  segmentText: { color: colors.mutedForeground, fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },
  segmentTextActive: { color: colors.primary },
  unitPicker: { flexDirection: 'row', gap: 7, marginTop: 4 },
  unitOption: { flex: 1, height: 32, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 7 },
  unitOptionText: { color: colors.mutedForeground, fontSize: 10, fontWeight: '700' },
  formCard: { backgroundColor: colors.card, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 16 },
  formHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  formHint: { color: colors.mutedForeground, fontSize: 10, marginTop: -2 },
  formCode: { color: colors.accent, fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  field: { flex: 1, marginTop: 15 },
  fieldGrid: { flexDirection: 'row', gap: 10 },
  fieldInputWrap: { height: 45, flexDirection: 'row', alignItems: 'center', borderRadius: 9, borderWidth: 1, borderColor: colors.input, backgroundColor: colors.overlay, paddingHorizontal: 11 },
  fieldInput: { flex: 1, color: colors.foreground, fontSize: 14, fontWeight: '500', paddingVertical: 0 },
  fieldSuffix: { color: colors.mutedForeground, fontSize: 12, fontWeight: '700' },
  errorRow: { flexDirection: 'row', gap: 7, alignItems: 'center', marginTop: 15 },
  errorText: { color: colors.destructive, flex: 1, fontSize: 11, lineHeight: 16 },
  primaryButton: { height: 50, borderRadius: 11, backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, marginTop: 18 },
  primaryButtonText: { color: colors.primaryForeground, fontSize: 12, fontWeight: '700', letterSpacing: 0.9 },
  resultCard: { backgroundColor: colors.card, borderRadius: 16, borderWidth: 1, padding: 16, marginTop: 13 },
  codeResultCard: { backgroundColor: colors.card, borderRadius: 16, borderWidth: 1, borderColor: colors.accent, padding: 16, marginTop: 13 },
  resultTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  statusText: { fontSize: 18, fontWeight: '700', letterSpacing: 0.3, marginTop: 2 },
  statusIcon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  codeReadyIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.success, alignItems: 'center', justifyContent: 'center' },
  codeResultSubtitle: { color: colors.mutedForeground, fontSize: 10, marginTop: 4, letterSpacing: 0.7 },
  codePair: { flexDirection: 'row', gap: 10, marginTop: 20 },
  codeBlock: { flex: 1, minHeight: 91, borderRadius: 11, backgroundColor: colors.overlay, borderWidth: 1, borderColor: colors.border, padding: 12, justifyContent: 'center' },
  codeLabel: { color: colors.accent, fontSize: 9, fontWeight: '700', letterSpacing: 1.1 },
  codeValue: { color: colors.primary, fontSize: 33, fontWeight: '700', letterSpacing: 2.5, marginTop: 7 },
  metricRow: { flexDirection: 'row', gap: 9, marginTop: 22, paddingTop: 15, borderTopWidth: 1, borderTopColor: colors.border },
  metric: { flex: 1 },
  metricLabel: { color: colors.mutedForeground, fontSize: 8, fontWeight: '700', letterSpacing: 0.7 },
  metricValue: { color: colors.foreground, fontSize: 16, fontWeight: '600', marginTop: 5 },
  resultNote: { color: colors.mutedForeground, fontSize: 11, lineHeight: 16, marginTop: 17 },
  secondaryButton: { height: 43, borderRadius: 10, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16 },
  secondaryButtonText: { color: colors.primary, fontSize: 11, fontWeight: '700', letterSpacing: 0.9 },
  notice: { flexDirection: 'row', alignItems: 'center', gap: 7, padding: 11, backgroundColor: colors.muted, borderRadius: 9, marginTop: 14 },
  noticeText: { color: colors.accentForeground, fontSize: 11, flex: 1 },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: colors.overlay },
  modalCard: { backgroundColor: colors.card, borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 20, paddingTop: 10, borderWidth: 1, borderColor: colors.border },
  modalHandle: { width: 42, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: 'center', marginBottom: 18 },
  modalTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  modalTitle: { color: colors.foreground, flex: 1, fontSize: 17, fontWeight: '700' },
  modalBody: { color: colors.mutedForeground, fontSize: 13, lineHeight: 20, marginTop: 20 },
  helpCallout: { flexDirection: 'row', gap: 10, backgroundColor: colors.secondary, borderRadius: 11, padding: 13, marginTop: 18 },
  helpText: { color: colors.secondaryForeground, fontSize: 12, lineHeight: 18, flex: 1 },
  version: { color: colors.mutedForeground, fontSize: 9, letterSpacing: 1.3, marginTop: 24 },
});