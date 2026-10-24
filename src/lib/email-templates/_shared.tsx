import * as React from 'react'
import { Body, Container, Head, Heading, Html, Preview, Text, Hr } from '@react-email/components'

export function Layout({ preview, title, children }: { preview: string; title: string; children: React.ReactNode }) {
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: '#ffffff', fontFamily: 'Helvetica, Arial, sans-serif', color: '#1f1a17' }}>
        <Container style={{ padding: '28px 24px', maxWidth: '560px' }}>
          <Text style={{ fontSize: '13px', letterSpacing: '2px', fontWeight: 700, color: '#e0603f', margin: 0 }}>THE SUNSET WAVE</Text>
          <Heading style={{ fontSize: '28px', margin: '12px 0 16px' }}>{title}</Heading>
          {children}
          <Hr style={{ borderColor: '#eadfce', margin: '28px 0 16px' }} />
          <Text style={{ fontSize: '13px', color: '#6b625b' }}>The Inaugural Wave · Saturday, March 20, 2027 · Supported by the Sunset Social Club. Questions? Just reply to this email.</Text>
        </Container>
      </Body>
    </Html>
  )
}
export const p = { fontSize: '16px', lineHeight: '1.6', margin: '0 0 14px' }
