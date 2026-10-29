import * as React from 'react';
import { Text } from '@react-email/components';
import type { TemplateEntry } from './registry';
import { Layout, p } from './_shared';
import { DICTS, type Lang } from '@/lib/i18n';

const Email = ({ hostName, name, contact, message, stretch, language = 'en' }: { hostName?: string; name?: string; contact?: string; message?: string; stretch?: string; language?: Lang }) => {
  const copy = (DICTS[language] ?? DICTS.en).noteForward;
  return <Layout preview={copy.title} title={copy.title}>
    <Text style={p}>{hostName ? `${copy.hello} ${hostName},` : copy.hello}</Text>
    <Text style={p}>{copy.intro} {stretch ?? ''}</Text>
    <Text style={p}><strong>{copy.name}:</strong> {name ?? ''}</Text>
    <Text style={p}><strong>{copy.contact}:</strong> {contact ?? ''}</Text>
    <Text style={{ ...p, whiteSpace: 'pre-wrap' }}>{message ?? ''}</Text>
    <Text style={p}>{copy.encourage}</Text>
    <Text style={p}>{copy.reply}</Text>
  </Layout>;
};
export const template = {
  component: Email, subject: 'A note from your Sunset Wave neighbor', displayName: 'Steward-approved note to host',
  previewData: { hostName: 'Host', name: 'Neighbor', contact: '415-555-0100', message: 'I can bring chairs!', stretch: '30th Ave between Judah and Kirkham', language: 'en' },
} satisfies TemplateEntry;