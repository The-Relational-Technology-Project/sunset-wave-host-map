import * as React from 'react'
import { Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import { Layout, p } from './_shared'

const Email = ({ name, stretch }: { name?: string; stretch?: string }) => (
  <Layout preview="You're on the map for The Sunset Wave" title="You're on the map!">
    <Text style={p}>{name ? `Hi ${name},` : 'Hi neighbor,'}</Text>
    <Text style={p}>Thank you for raising your hand to host{stretch ? ` on ${stretch}` : ''}. We'll be in touch soon about the host party and next steps.</Text>
    <Text style={p}>See you on the block,<br />The Sunset Wave</Text>
  </Layout>
)

export const template = {
  component: Email,
  subject: "You're on the map for The Sunset Wave",
  displayName: 'Host offer confirmation',
  previewData: { name: 'Josh', stretch: '30th Ave between Judah and Kirkham' },
} satisfies TemplateEntry
