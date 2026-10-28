import * as React from 'react';
import { Text } from '@react-email/components';
import type { TemplateEntry } from './registry';
import { Layout, p } from './_shared';

interface Props { name?: string; email?: string; organization?: string; message?: string; language?: string }
const Email = ({ name, email, organization, message, language }: Props) => (
  <Layout preview={`A message from ${name ?? 'a neighbor'}`} title="A new Sunset Wave inquiry">
    <Text style={p}><strong>Name:</strong> {name ?? '—'}</Text>
    <Text style={p}><strong>Email:</strong> {email ?? '—'}</Text>
    <Text style={p}><strong>Business / organization:</strong> {organization || '—'}</Text>
    <Text style={{ ...p, whiteSpace: 'pre-wrap' }}><strong>Message:</strong> {message ?? '—'}</Text>
    <Text style={p}><strong>Language:</strong> {language ?? 'en'}</Text>
  </Layout>
);
export const template = {
  component: Email,
  subject: 'New Sunset Wave contact inquiry',
  displayName: 'Contact inquiry (to Sunset Social Club)',
  to: 'oursunsetsocialclub@gmail.com',
  previewData: { name: 'A neighbor', email: 'neighbor@example.com', organization: 'Local business', message: 'We would love to get involved.', language: 'en' },
} satisfies TemplateEntry;