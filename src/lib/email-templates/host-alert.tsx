import * as React from 'react'
import { Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import { Layout, p } from './_shared'

interface Props {
  name?: string
  contact?: string
  stretch?: string
  cohosts?: { name: string; contact: string }[]
  wantsMicrogrant?: boolean
  canGive?: boolean
  language?: string
}

const Email = ({ name, contact, stretch, cohosts, wantsMicrogrant, canGive, language }: Props) => (
  <Layout preview={`New host: ${name ?? 'someone'} on ${stretch ?? 'a block'}`} title="A neighbor raised their hand!">
    <Text style={p}><strong>Name:</strong> {name ?? '—'}</Text>
    <Text style={p}><strong>Contact:</strong> {contact ?? '—'}</Text>
    <Text style={p}><strong>Block stretch:</strong> {stretch ?? '—'}</Text>
    <Text style={p}><strong>Co-hosts:</strong> {cohosts && cohosts.length ? cohosts.map((c) => `${c.name}${c.contact ? ` (${c.contact})` : ''}`).join(', ') : 'None'}</Text>
    <Text style={p}><strong>Wants microgrant:</strong> {wantsMicrogrant ? 'Yes' : 'No'}</Text>
    <Text style={p}><strong>Can give:</strong> {canGive ? 'Yes' : 'No'}</Text>
    <Text style={p}><strong>Language:</strong> {language ?? 'en'}</Text>
  </Layout>
)

export const template = {
  component: Email,
  subject: (d: Record<string, any>) => `New Sunset Wave host: ${d.name ?? 'someone'}`,
  displayName: 'New host alert (to Sunset Social Club)',
  to: 'oursunsetsocialclub@gmail.com',
  previewData: { name: 'Josh', contact: 'josh@example.com', stretch: '30th Ave between Judah and Kirkham', cohosts: [{ name: 'Ana', contact: '' }], wantsMicrogrant: true, canGive: false, language: 'en' },
} satisfies TemplateEntry
