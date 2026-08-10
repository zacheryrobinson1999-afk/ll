import React, { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useColors } from '@/hooks/useColors';
import {
  FLEET,
  CATEGORIES,
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  type CraneModel,
  type Category,
} from '@/data/craneFleet';
import { useCustomFleet, type CustomCraneInput } from '@/lib/customFleet';

// ─── sub-components ──────────────────────────────────────────────────────────

function CategoryChip({
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

function SpecBadge({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View
      style={{
        backgroundColor: colors.muted,
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 6,
        alignItems: 'center',
        flex: 1,
      }}
    >
      <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 13 }}>{value}</Text>
      <Text style={{ color: colors.mutedForeground, fontSize: 9, marginTop: 2, letterSpacing: 0.5 }}>
        {label}
      </Text>
    </View>
  );
}

function CraneCard({
  crane,
  colors,
  isCustom,
  onPress,
}: {
  crane: CraneModel;
  colors: ReturnType<typeof useColors>;
  isCustom?: boolean;
  onPress: () => void;
}) {
  const catColor = CATEGORY_COLORS[crane.category];
  const unitCount = crane.units.length;

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
      <View style={{ height: 3, backgroundColor: catColor }} />

      <View style={{ padding: 14 }}>
        {/* header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
          <View
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              backgroundColor: catColor + '22',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 10,
              borderWidth: 1,
              borderColor: catColor + '44',
            }}
          >
            <Text style={{ color: catColor, fontWeight: '900', fontSize: 11 }}>
              {CATEGORY_ICONS[crane.category]}
            </Text>
          </View>

          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ color: colors.foreground, fontWeight: '700', fontSize: 15 }}>
                {crane.model}
              </Text>
              {isCustom && (
                <View style={{ backgroundColor: colors.primary + '22', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2 }}>
                  <Text style={{ color: colors.primary, fontSize: 8, fontWeight: '800', letterSpacing: 0.8 }}>CUSTOM</Text>
                </View>
              )}
            </View>
            <Text style={{ color: colors.mutedForeground, fontSize: 11, marginTop: 1 }}>
              {crane.manufacturer} · {crane.category}
            </Text>
          </View>

          <View style={{ alignItems: 'flex-end', gap: 4 }}>
            <View
              style={{
                backgroundColor: colors.primary + '22',
                borderRadius: 8,
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderWidth: 1,
                borderColor: colors.primary + '55',
              }}
            >
              <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 13 }}>
                {crane.maxCapacity} t
              </Text>
            </View>
            {unitCount > 1 && (
              <Text style={{ color: colors.mutedForeground, fontSize: 10 }}>
                {unitCount} units
              </Text>
            )}
          </View>
        </View>

        {/* specs */}
        <View style={{ flexDirection: 'row', gap: 6 }}>
          <SpecBadge label="MAX BOOM" value={`${crane.maxBoom} m`} colors={colors} />
          <SpecBadge label="MAX RADIUS" value={`${crane.maxRadius} m`} colors={colors} />
          {crane.axles > 0 ? (
            <SpecBadge label="AXLES" value={String(crane.axles)} colors={colors} />
          ) : (
            <SpecBadge label="TYPE" value="CRAWLER" colors={colors} />
          )}
        </View>

        {crane.maxTravel && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 5 }}>
            <MaterialCommunityIcons name="truck-check" size={12} color={colors.success} />
            <Text style={{ color: colors.success, fontSize: 10, fontWeight: '600', letterSpacing: 0.3 }}>
              TRAVELS WITH LOAD
            </Text>
          </View>
        )}

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-end',
            marginTop: 8,
          }}
        >
          <Text style={{ color: colors.mutedForeground, fontSize: 11, marginRight: 4 }}>Details</Text>
          <Feather name="chevron-right" size={13} color={colors.mutedForeground} />
        </View>
      </View>
    </Pressable>
  );
}

function DetailRow({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 11,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      <Text style={{ color: colors.mutedForeground, fontSize: 13 }}>{label}</Text>
      <Text style={{ color: colors.foreground, fontWeight: '600', fontSize: 13 }}>{value}</Text>
    </View>
  );
}

function CraneDetail({
  crane,
  colors,
  isCustom,
  onBack,
  onDelete,
}: {
  crane: CraneModel;
  colors: ReturnType<typeof useColors>;
  isCustom?: boolean;
  onBack: () => void;
  onDelete?: () => void;
}) {
  const catColor = CATEGORY_COLORS[crane.category];

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* coloured header */}
      <View
        style={{
          backgroundColor: catColor + '18',
          borderBottomWidth: 2,
          borderBottomColor: catColor + '44',
          padding: 20,
          paddingTop: 8,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <Pressable
            onPress={onBack}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Feather name="arrow-left" size={16} color={catColor} />
            <Text style={{ color: catColor, fontWeight: '600', fontSize: 13 }}>Fleet Library</Text>
          </Pressable>

          {isCustom && onDelete && (
            <Pressable
              onPress={onDelete}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
                backgroundColor: '#E8271A18',
                borderRadius: 8,
                paddingHorizontal: 10,
                paddingVertical: 6,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Feather name="trash-2" size={13} color="#E8271A" />
              <Text style={{ color: '#E8271A', fontSize: 12, fontWeight: '700' }}>Remove</Text>
            </Pressable>
          )}
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View
            style={{
              width: 54,
              height: 54,
              borderRadius: 14,
              backgroundColor: catColor + '33',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1.5,
              borderColor: catColor + '66',
            }}
          >
            <Text style={{ color: catColor, fontWeight: '900', fontSize: 16 }}>
              {CATEGORY_ICONS[crane.category]}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ color: colors.foreground, fontWeight: '800', fontSize: 22 }}>
                {crane.model}
              </Text>
              {isCustom && (
                <View style={{ backgroundColor: colors.primary + '22', borderRadius: 5, paddingHorizontal: 6, paddingVertical: 3 }}>
                  <Text style={{ color: colors.primary, fontSize: 9, fontWeight: '800', letterSpacing: 0.8 }}>CUSTOM</Text>
                </View>
              )}
            </View>
            <Text style={{ color: catColor, fontWeight: '600', fontSize: 12, marginTop: 2 }}>
              {crane.manufacturer}
            </Text>
          </View>
        </View>

        {/* capacity + travel badge */}
        <View style={{ marginTop: 14, flexDirection: 'row', gap: 8 }}>
          <View
            style={{
              backgroundColor: colors.primary + '22',
              borderRadius: 10,
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderWidth: 1,
              borderColor: colors.primary + '55',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <MaterialCommunityIcons name="weight" size={14} color={colors.primary} />
            <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 18 }}>
              {crane.maxCapacity} t
            </Text>
            <Text style={{ color: colors.mutedForeground, fontSize: 11 }}>max capacity</Text>
          </View>

          {crane.maxTravel && (
            <View
              style={{
                backgroundColor: colors.success + '18',
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderWidth: 1,
                borderColor: colors.success + '44',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <MaterialCommunityIcons name="truck-check" size={14} color={colors.success} />
              <Text style={{ color: colors.success, fontWeight: '700', fontSize: 12 }}>
                Pick & Carry
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
        {/* specs */}
        <Text
          style={{
            color: colors.mutedForeground,
            fontSize: 11,
            fontWeight: '700',
            letterSpacing: 1,
            marginBottom: 4,
          }}
        >
          SPECIFICATIONS
        </Text>
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: colors.border,
            paddingHorizontal: 16,
            marginTop: 8,
          }}
        >
          <DetailRow label="Category" value={crane.category} colors={colors} />
          <DetailRow label="Manufacturer" value={crane.manufacturer} colors={colors} />
          <DetailRow label="Max Capacity" value={`${crane.maxCapacity} t`} colors={colors} />
          <DetailRow label="Max Boom" value={`${crane.maxBoom} m`} colors={colors} />
          <DetailRow label="Max Radius" value={`${crane.maxRadius} m`} colors={colors} />
          {crane.axles > 0 && (
            <DetailRow label="Road Axles" value={String(crane.axles)} colors={colors} />
          )}
          <DetailRow
            label="Travel with Load"
            value={crane.maxTravel ? 'Yes' : 'No'}
            colors={colors}
          />
          <DetailRow
            label="Fleet Units"
            value={crane.units.length ? `${crane.units.length} (${crane.units.join(', ')})` : 'None listed'}
            colors={colors}
          />
        </View>

        {/* notes */}
        {!!crane.notes && (
          <>
            <Text
              style={{
                color: colors.mutedForeground,
                fontSize: 11,
                fontWeight: '700',
                letterSpacing: 1,
                marginTop: 22,
                marginBottom: 4,
              }}
            >
              NOTES
            </Text>
            <View
              style={{
                backgroundColor: colors.card,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: colors.border,
                padding: 16,
                marginTop: 8,
              }}
            >
              <Text style={{ color: colors.foreground, fontSize: 14, lineHeight: 21 }}>
                {crane.notes}
              </Text>
            </View>
          </>
        )}

        {/* disclaimer */}
        <View
          style={{
            backgroundColor: colors.muted,
            borderRadius: 10,
            padding: 12,
            marginTop: 16,
            flexDirection: 'row',
            gap: 8,
          }}
        >
          <Feather name="alert-triangle" size={14} color={colors.warning} style={{ marginTop: 1 }} />
          <Text style={{ color: colors.mutedForeground, fontSize: 11, lineHeight: 17, flex: 1 }}>
            Reference data only. Always verify against the current manufacturer load chart and site
            conditions before any lift.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

// ─── Add Crane Modal ──────────────────────────────────────────────────────────

type FormState = {
  model: string;
  manufacturer: string;
  category: Category;
  maxCapacity: string;
  maxBoom: string;
  maxRadius: string;
  axles: string;
  maxTravel: boolean;
  units: string;
  notes: string;
};

const BLANK_FORM: FormState = {
  model: '',
  manufacturer: '',
  category: 'Slewer',
  maxCapacity: '',
  maxBoom: '',
  maxRadius: '',
  axles: '',
  maxTravel: false,
  units: '',
  notes: '',
};

function FormField({
  label,
  required,
  children,
  colors,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontSize: 10, fontWeight: '700', color: colors.mutedForeground, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>
        {label}{required && <Text style={{ color: '#E8271A' }}> *</Text>}
      </Text>
      {children}
    </View>
  );
}

function AddCraneModal({
  visible,
  onClose,
  onSave,
  colors,
  insetBottom,
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (input: CustomCraneInput) => void;
  colors: ReturnType<typeof useColors>;
  insetBottom: number;
}) {
  const [form, setForm] = useState<FormState>(BLANK_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const set = <K extends keyof FormState>(key: K, val: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const inputStyle = {
    backgroundColor: colors.muted,
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingVertical: 11,
    fontSize: 15,
    color: colors.foreground,
    borderWidth: 1,
    borderColor: colors.border,
  };

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!form.model.trim()) e.model = 'Required';
    if (!form.manufacturer.trim()) e.manufacturer = 'Required';
    if (!form.maxCapacity || isNaN(Number(form.maxCapacity)) || Number(form.maxCapacity) <= 0)
      e.maxCapacity = 'Enter a valid number';
    if (!form.maxBoom || isNaN(Number(form.maxBoom)) || Number(form.maxBoom) <= 0)
      e.maxBoom = 'Enter a valid number';
    if (!form.maxRadius || isNaN(Number(form.maxRadius)) || Number(form.maxRadius) <= 0)
      e.maxRadius = 'Enter a valid number';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const units = form.units
      .split(',')
      .map((u) => u.trim())
      .filter(Boolean);
    onSave({
      model: form.model.trim(),
      manufacturer: form.manufacturer.trim(),
      category: form.category,
      maxCapacity: Number(form.maxCapacity),
      maxBoom: Number(form.maxBoom),
      maxRadius: Number(form.maxRadius),
      axles: form.axles ? Number(form.axles) : 0,
      maxTravel: form.maxTravel,
      units,
      notes: form.notes.trim(),
    });
    setForm(BLANK_FORM);
    setErrors({});
  };

  const handleClose = () => {
    setForm(BLANK_FORM);
    setErrors({});
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: colors.background }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Modal header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 14,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 10, fontWeight: '700', color: colors.primary, letterSpacing: 1.5, marginBottom: 2 }}>
              CRANE FLEET
            </Text>
            <Text style={{ fontSize: 20, fontWeight: '800', color: colors.foreground }}>
              Add Crane
            </Text>
          </View>
          <Pressable
            onPress={handleClose}
            hitSlop={12}
            style={({ pressed }) => ({
              width: 34,
              height: 34,
              borderRadius: 17,
              backgroundColor: colors.muted,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Feather name="x" size={18} color={colors.foreground} />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: insetBottom + 20 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Model */}
          <FormField label="Model" required colors={colors}>
            <TextInput
              style={[inputStyle, errors.model ? { borderColor: '#E8271A' } : {}]}
              value={form.model}
              onChangeText={(v) => set('model', v)}
              placeholder="e.g. LTM 1750-9.1"
              placeholderTextColor={colors.mutedForeground}
              returnKeyType="next"
            />
            {errors.model && <Text style={{ color: '#E8271A', fontSize: 11, marginTop: 4 }}>{errors.model}</Text>}
          </FormField>

          {/* Manufacturer */}
          <FormField label="Manufacturer" required colors={colors}>
            <TextInput
              style={[inputStyle, errors.manufacturer ? { borderColor: '#E8271A' } : {}]}
              value={form.manufacturer}
              onChangeText={(v) => set('manufacturer', v)}
              placeholder="e.g. Liebherr"
              placeholderTextColor={colors.mutedForeground}
              returnKeyType="next"
            />
            {errors.manufacturer && <Text style={{ color: '#E8271A', fontSize: 11, marginTop: 4 }}>{errors.manufacturer}</Text>}
          </FormField>

          {/* Category */}
          <FormField label="Category" colors={colors}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {CATEGORIES.map((cat) => {
                const active = form.category === cat;
                const color = CATEGORY_COLORS[cat];
                return (
                  <Pressable
                    key={cat}
                    onPress={() => {
                      set('category', cat);
                      if (cat === 'Franna') { set('maxTravel', true); set('axles', '2'); }
                      else if (cat === 'Crawler') { set('axles', '0'); }
                    }}
                    style={({ pressed }) => ({
                      flex: 1,
                      paddingVertical: 10,
                      borderRadius: 10,
                      borderWidth: 1.5,
                      borderColor: active ? color : colors.border,
                      backgroundColor: active ? color + '22' : colors.muted,
                      alignItems: 'center',
                      opacity: pressed ? 0.75 : 1,
                    })}
                  >
                    <Text style={{ fontSize: 11, fontWeight: '700', color: active ? color : colors.mutedForeground }}>
                      {cat.toUpperCase()}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </FormField>

          {/* Specs row */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <FormField label="Max Capacity (t)" required colors={colors}>
                <TextInput
                  style={[inputStyle, errors.maxCapacity ? { borderColor: '#E8271A' } : {}]}
                  value={form.maxCapacity}
                  onChangeText={(v) => set('maxCapacity', v)}
                  placeholder="e.g. 500"
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="decimal-pad"
                />
                {errors.maxCapacity && <Text style={{ color: '#E8271A', fontSize: 11, marginTop: 4 }}>{errors.maxCapacity}</Text>}
              </FormField>
            </View>
            <View style={{ flex: 1 }}>
              <FormField label="Max Boom (m)" required colors={colors}>
                <TextInput
                  style={[inputStyle, errors.maxBoom ? { borderColor: '#E8271A' } : {}]}
                  value={form.maxBoom}
                  onChangeText={(v) => set('maxBoom', v)}
                  placeholder="e.g. 84"
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="decimal-pad"
                />
                {errors.maxBoom && <Text style={{ color: '#E8271A', fontSize: 11, marginTop: 4 }}>{errors.maxBoom}</Text>}
              </FormField>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <FormField label="Max Radius (m)" required colors={colors}>
                <TextInput
                  style={[inputStyle, errors.maxRadius ? { borderColor: '#E8271A' } : {}]}
                  value={form.maxRadius}
                  onChangeText={(v) => set('maxRadius', v)}
                  placeholder="e.g. 72"
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="decimal-pad"
                />
                {errors.maxRadius && <Text style={{ color: '#E8271A', fontSize: 11, marginTop: 4 }}>{errors.maxRadius}</Text>}
              </FormField>
            </View>
            {form.category !== 'Crawler' && (
              <View style={{ flex: 1 }}>
                <FormField label="Road Axles" colors={colors}>
                  <TextInput
                    style={inputStyle}
                    value={form.axles}
                    onChangeText={(v) => set('axles', v)}
                    placeholder="e.g. 8"
                    placeholderTextColor={colors.mutedForeground}
                    keyboardType="number-pad"
                  />
                </FormField>
              </View>
            )}
          </View>

          {/* Pick & Carry toggle */}
          <FormField label="Pick & Carry (travels with load)" colors={colors}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ color: form.maxTravel ? colors.foreground : colors.mutedForeground, fontSize: 14 }}>
                {form.maxTravel ? 'Yes' : 'No'}
              </Text>
              <Switch
                value={form.maxTravel}
                onValueChange={(v) => set('maxTravel', v)}
                trackColor={{ false: colors.border, true: colors.primary + '88' }}
                thumbColor={form.maxTravel ? colors.primary : colors.mutedForeground}
              />
            </View>
          </FormField>

          {/* Unit numbers */}
          <FormField label="Fleet Unit Numbers" colors={colors}>
            <TextInput
              style={inputStyle}
              value={form.units}
              onChangeText={(v) => set('units', v)}
              placeholder="e.g. 101, 102, 103 (comma-separated)"
              placeholderTextColor={colors.mutedForeground}
              returnKeyType="next"
            />
          </FormField>

          {/* Notes */}
          <FormField label="Notes" colors={colors}>
            <TextInput
              style={[inputStyle, { height: 90, textAlignVertical: 'top' }]}
              value={form.notes}
              onChangeText={(v) => set('notes', v)}
              placeholder="Optional — model-specific notes, configuration details, etc."
              placeholderTextColor={colors.mutedForeground}
              multiline
              numberOfLines={4}
            />
          </FormField>

          {/* Save button */}
          <Pressable
            onPress={handleSave}
            style={({ pressed }) => ({
              backgroundColor: colors.primary,
              borderRadius: 12,
              paddingVertical: 15,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 8,
              marginTop: 8,
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Feather name="plus-circle" size={17} color="#000" />
            <Text style={{ color: '#000', fontWeight: '800', fontSize: 15, letterSpacing: 0.3 }}>
              Add to Fleet
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── main screen ─────────────────────────────────────────────────────────────

export default function FleetScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { cranes: customCranes, addCrane, removeCrane } = useCustomFleet();

  const [activeFilter, setActiveFilter] = useState<Category | 'All'>('All');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<CraneModel | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  // Merge built-in + custom cranes
  const allCranes = useMemo(() => [...FLEET, ...customCranes], [customCranes]);
  const customIds = useMemo(() => new Set(customCranes.map((c) => c.id)), [customCranes]);

  const totalUnits = useMemo(
    () => allCranes.reduce((s, c) => s + c.units.length, 0),
    [allCranes],
  );

  const filtered = useMemo(() => {
    const byCat =
      activeFilter === 'All' ? allCranes : allCranes.filter((c) => c.category === activeFilter);
    if (!search.trim()) return byCat;
    const q = search.toLowerCase();
    return byCat.filter(
      (c) =>
        c.model.toLowerCase().includes(q) ||
        c.manufacturer.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.units.some((u) => u.toLowerCase().includes(q)),
    );
  }, [activeFilter, search, allCranes]);

  // group by category for "All" view
  const groups = useMemo(() => {
    if (activeFilter !== 'All') return null;
    const map = new Map<Category, CraneModel[]>();
    for (const crane of filtered) {
      const list = map.get(crane.category) ?? [];
      list.push(crane);
      map.set(crane.category, list);
    }
    return map;
  }, [activeFilter, filtered]);

  const handleSave = async (input: CustomCraneInput) => {
    await addCrane(input);
    setShowAdd(false);
  };

  const handleDelete = (crane: CraneModel) => {
    Alert.alert(
      'Remove crane',
      `Remove ${crane.model} from the fleet?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await removeCrane(crane.id);
            setSelected(null);
          },
        },
      ],
    );
  };

  if (selected) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <StatusBar style="light" />
        <CraneDetail
          crane={selected}
          colors={colors}
          isCustom={customIds.has(selected.id)}
          onBack={() => setSelected(null)}
          onDelete={customIds.has(selected.id) ? () => handleDelete(selected) : undefined}
        />
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar style="light" />

      {/* header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerKicker}>CRANE FLEET</Text>
          <Text style={styles.headerTitle}>Fleet Library</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>{totalUnits} UNITS</Text>
          </View>
          <Pressable
            onPress={() => setShowAdd(true)}
            style={({ pressed }) => ({
              width: 38,
              height: 38,
              borderRadius: 11,
              backgroundColor: colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Feather name="plus" size={20} color="#000" />
          </Pressable>
        </View>
      </View>

      {/* search */}
      <View style={styles.searchRow}>
        <Feather name="search" size={15} color={colors.mutedForeground} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search model or unit number…"
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

      {/* category filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterRow}
      >
        <CategoryChip
          label="ALL"
          active={activeFilter === 'All'}
          color={colors.primary}
          onPress={() => setActiveFilter('All')}
          colors={colors}
        />
        {CATEGORIES.map((cat) => (
          <CategoryChip
            key={cat}
            label={cat.toUpperCase()}
            active={activeFilter === cat}
            color={CATEGORY_COLORS[cat]}
            onPress={() => setActiveFilter(cat)}
            colors={colors}
          />
        ))}
      </ScrollView>

      {/* list */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {filtered.length === 0 && (
          <View style={styles.empty}>
            <MaterialCommunityIcons name="crane" size={36} color={colors.border} />
            <Text style={styles.emptyText}>No cranes match your search.</Text>
          </View>
        )}

        {groups
          ? Array.from(groups.entries()).map(([cat, cranes]) => (
              <View key={cat} style={{ marginBottom: 8 }}>
                <View style={styles.groupHeader}>
                  <View
                    style={[styles.groupStripe, { backgroundColor: CATEGORY_COLORS[cat] }]}
                  />
                  <Text style={[styles.groupTitle, { color: CATEGORY_COLORS[cat] }]}>
                    {cat.toUpperCase()}
                  </Text>
                  <Text style={styles.groupCount}>
                    {cranes.reduce((s, c) => s + c.units.length, 0)} units ·{' '}
                    {cranes.length} model{cranes.length !== 1 ? 's' : ''}
                  </Text>
                </View>
                {cranes.map((crane) => (
                  <CraneCard
                    key={crane.id}
                    crane={crane}
                    colors={colors}
                    isCustom={customIds.has(crane.id)}
                    onPress={() => setSelected(crane)}
                  />
                ))}
              </View>
            ))
          : filtered.map((crane) => (
              <CraneCard
                key={crane.id}
                crane={crane}
                colors={colors}
                isCustom={customIds.has(crane.id)}
                onPress={() => setSelected(crane)}
              />
            ))}
      </ScrollView>

      <AddCraneModal
        visible={showAdd}
        onClose={() => setShowAdd(false)}
        onSave={handleSave}
        colors={colors}
        insetBottom={insets.bottom}
      />
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
    filterRow: { paddingHorizontal: 20, alignItems: 'center', flexDirection: 'row' },
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
