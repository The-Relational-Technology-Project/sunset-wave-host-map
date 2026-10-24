import * as React from 'react'
import { Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import { Layout, p } from './_shared'

const Email = ({ name }: { name?: string }) => (
  <Layout preview="Your note to a Sunset Wave host was sent" title="Note sent">
    <Text style={p}>{name ? `Hi ${name},` : 'Hi neighbor,'}</Text>
    <Text style={p}>We got your note and will pass it along to the host. Thanks for being a good neighbor.</Text>
    <Text style={p}>The Sunset Wave</Text>
  </Layout>
)

export const template = {
  component: Email,
  subject: 'Your note to a Sunset Wave host was sent',
  displayName: 'Neighbor note confirmation',
  previewData: { name: 'Maria' },
} satisfies TemplateEntry
