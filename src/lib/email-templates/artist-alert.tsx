import * as React from "react";
import { Link, Text } from "@react-email/components";
import type { TemplateEntry } from "./registry";
import { Layout, p } from "./_shared";
import { WAVE_URL } from "../share";

interface Props { name?: string; contact?: string; note?: string; workLink?: string; fileCount?: number }
const Email = ({ name, contact, note, workLink, fileCount }: Props) => (
  <Layout preview="An artist raised a hand to help design The Sunset Wave logo." title="An artist wants to help">
    <Text style={p}><strong>Name:</strong> {name || "—"}</Text>
    <Text style={p}><strong>Contact:</strong> {contact || "—"}</Text>
    <Text style={{ ...p, whiteSpace: "pre-wrap" }}><strong>Note:</strong> {note || "—"}</Text>
    {workLink && <Text style={p}><Link href={workLink}>Work examples</Link></Text>}
    <Text style={p}>{fileCount ?? 0} uploaded work examples. Files are private and available in the Artists tab.</Text>
    <Text style={p}><Link href={`${WAVE_URL}/steward`}>Review artist submissions</Link></Text>
  </Layout>
);
export const template = {
  component: Email, subject: "New Sunset Wave artist submission", displayName: "Artist submission (to Sunset Social Club)",
  to: "oursunsetsocialclub@gmail.com",
  previewData: { name: "Rowan Example", contact: "artist@example.com", note: "I'd love to draw something for the neighborhood.", fileCount: 2 },
} satisfies TemplateEntry;