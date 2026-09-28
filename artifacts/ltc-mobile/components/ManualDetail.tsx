import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useColors } from '@/hooks/useColors';
import { useManualLibraryStorage } from '@/hooks/useManualLibraryStorage';
import { TECH_DOCS, docUrl } from '@/data/techDocs';
import { FLEET } from '@/data/craneFleet';
import { resolveManual, manualMetadata, relatedManuals, manualNoteHref } from '../../api-server/src/lib/catalog/manualDetail';

export function ManualDetail({ id, onBack }: { id: string; onBack: () => void }) {
  const colors = useColors();
  const router = useRouter();
  const saved = useManualLibraryStorage();
  const [expanded, setExpanded] = useState<string[]>([]);
  const doc = resolveManual(TECH_DOCS, id);
  const action = (label: string, onPress: () => void, disabled = false) => <Pressable accessibilityRole="button" disabled={disabled} accessibilityState={{ disabled }} onPress={onPress} style={{ minHeight: 48, justifyContent: 'center', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: colors.border, opacity: disabled ? 0.5 : 1 }}><Text style={{ color: colors.primary, fontWeight: '700' }}>{label}</Text></Pressable>;
  if (!doc) return <View style={{ padding: 20, gap: 16 }}><Text style={{ fontSize: 26, color: colors.foreground, fontWeight: '700' }}>Manual not found</Text>{action('Back to Manuals', onBack)}</View>;
  const meta = manualMetadata(doc, FLEET);
  const related = relatedManuals(doc, TECH_DOCS);
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  const open = () => {
    if (saved.ready) saved.record(doc.id);
    void WebBrowser.openBrowserAsync(docUrl(doc)).catch(() => Alert.alert('Unable to open PDF', 'Please try again.'));
  };
  const note = (section?: string) => {
    if (domain) void WebBrowser.openBrowserAsync(`https://${domain}${manualNoteHref(doc.id, section)}`).catch(() => Alert.alert('Unable to open workshop notes'));
  };
  return <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 100, gap: 18 }}>
    {action('Back', onBack)}
    <Text style={{ color: colors.primary }}>{meta.manufacturer} / Manual detail</Text>
    <Text style={{ color: colors.foreground, fontSize: 26, fontWeight: '800' }}>{doc.title}</Text>
    <Text style={{ color: colors.mutedForeground }}>{doc.subtitle}</Text>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
      {action('Open PDF', open)}
      {action(saved.bookmarks.includes(doc.id) ? 'Remove bookmark' : 'Bookmark', () => saved.toggle(doc.id), !saved.ready)}
      {domain ? action('Add workshop note', () => note()) : null}
    </View>
    <View style={{ padding: 16, gap: 10, borderRadius: 12, backgroundColor: colors.card }}>
      <Text style={{ color: colors.foreground }}>System: {doc.system}</Text>
      <Text style={{ color: colors.foreground }}>Type: {meta.type}</Text>
      <Text style={{ color: colors.foreground }}>Models: {meta.models.join(' · ') || 'No specific crane model assigned'}</Text>
      {meta.code && <Text style={{ color: colors.foreground }}>Document / book code: {meta.code}</Text>}
      {doc.year && <Text style={{ color: colors.foreground }}>Publication year: {doc.year}</Text>}
      {doc.pages && <Text style={{ color: colors.foreground }}>Pages: {doc.pages}</Text>}
      {doc.sourceSystem && <Text style={{ color: colors.foreground }}>Source system: {doc.sourceSystem}</Text>}
    </View>
    <Text style={{ color: colors.foreground, fontSize: 20, fontWeight: '700' }}>About this manual</Text>
    <Text style={{ color: colors.mutedForeground, lineHeight: 23 }}>{doc.summary}</Text>
    {FLEET.filter(crane => doc.appliesTo.includes(crane.id)).map(crane => <Text key={crane.id} style={{ color: colors.foreground }}>Applicable fleet model: {crane.model}</Text>)}
    <Text style={{ color: colors.foreground, fontSize: 20, fontWeight: '700' }}>Manual sections</Text>
    {doc.sections.map((section, index) => <View key={`${section.ref}-${index}`} style={{ gap: 10, padding: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 10 }}>
      {action(`${section.ref} · ${section.title}`, () => setExpanded(current => current.includes(String(index)) ? current.filter(value => value !== String(index)) : [...current, String(index)]))}
      {expanded.includes(String(index)) && <><Text style={{ color: colors.mutedForeground, lineHeight: 22 }}>{section.summary}</Text>{domain ? action('Add section note', () => note(section.ref)) : null}</>}
    </View>)}
    <Text style={{ color: colors.foreground, fontSize: 20, fontWeight: '700' }}>Related manuals</Text>
    {related.length ? related.map(item => <Pressable key={item.id} accessibilityRole="button" onPress={() => router.push({ pathname: '/docs', params: { document: item.id } })} style={{ padding: 16, minHeight: 76, gap: 8, backgroundColor: colors.card, borderRadius: 12 }}><Text style={{ color: colors.foreground, fontWeight: '700' }}>{item.title}</Text><Text style={{ color: colors.mutedForeground }}>{manualMetadata(item, FLEET).manufacturer} · {manualMetadata(item, FLEET).type}</Text><Text style={{ color: colors.mutedForeground }}>{manualMetadata(item, FLEET).models.join(' · ')}</Text></Pressable>) : <Text style={{ color: colors.mutedForeground }}>No other manuals with an explicit matching model or fleet association.</Text>}
    <Text style={{ color: colors.mutedForeground, fontSize: 12 }}>Mobile bookmarks save the whole manual on this device. Workshop notes open in the signed-in web app{domain ? '.' : ' when a server domain is configured.'}</Text>
    {saved.error ? <Text style={{ color: colors.foreground }}>{saved.error}</Text> : null}
  </ScrollView>;
}
