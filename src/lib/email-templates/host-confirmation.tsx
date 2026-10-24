import * as React from 'react'
import { Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import { Layout, p } from './_shared'

const Email = ({ name, stretch }: { name?: string; stretch?: string }) => (
  <Layout preview="Thanks for raising your hand to host" title="Thanks for raising your hand!">
    <Text style={p}>{name ? `Hi ${name},` : 'Hi neighbor,'}</Text>
    <Text style={p}>Thanks for raising your hand to host{stretch ? ` on ${stretch}` : ''}. We appreciate you and we'll be in touch soon. This is going to be joyful!</Text>
    <Text style={p}>See you on the block,<br />The Sunset Wave</Text>
  </Layout>
)

export const template = {
  component: Email,
  subject: "Thanks for raising your hand!",
  displayName: 'Host offer confirmation',
  previewData: { name: 'Josh', stretch: '30th Ave between Judah and Kirkham' },
} satisfies TemplateEntry
