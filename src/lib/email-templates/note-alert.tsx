import * as React from 'react';
import { Link, Text } from '@react-email/components';
import type { TemplateEntry } from './registry';
import { Layout, p } from './_shared';

const Email = ({ name, contact, message, blockId }: { name?: string; contact?: string; message?: string; blockId?: string }) => (
  <Layout preview="A neighbor's note is ready for steward review" title="A neighbor sent a note to a host">
    <Text style={p}><strong>Neighbor:</strong> {name ?? 'A neighbor'}</Text>
    <Text style={p}><strong>Email or phone:</strong> {contact ?? 'Not provided'}</Text>
    <Text style={p}><strong>Block:</strong> {blockId ?? 'Not provided'}</Text>
    <Text style={{ ...p, whiteSpace: 'pre-wrap' }}>{message ?? ''}</Text>
    <Text style={p}><Link href="https://thesunsetwave.org/steward">Review this note on the steward page</Link>. It has not been forwarded to the host.</Text>
  </Layout>
);
export const template = {
  component: Email, subject: 'New Sunset Wave neighbor note — review needed',
  displayName: 'Neighbor note alert (to Sunset Social Club)', to: 'oursunsetsocialclub@gmail.com',
  previewData: { name: 'A neighbor', contact: '415-555-0100', blockId: '30-judah', message: 'I can bring chairs!' },
} satisfies TemplateEntry;