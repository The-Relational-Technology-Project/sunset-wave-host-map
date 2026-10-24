# The Sunset Wave — landing page plan

## Look and feel
A warm, slightly gritty movie poster set in the Sunset. Fog-grey and sand base, painted-house colors (coral, mustard, teal, pink), ocean blue, Golden Gate Park green. Paper grain texture, a soft fog layer, and simple shapes of dunes, pelicans, gulls and a red-tailed hawk. Headlines use a heavy condensed block typeface, body text a warm readable sans, and the Chinese text gets a matching font. No purple gradients and no glossy effects.

- **Wave hand**: a custom hand-wave drawing used as the logo, the cursor on desktop, the claimed-block marker on the map, and small accents throughout.
- **Opening screen**: wave logo at top, then THE SUNSET WAVE in huge block letters stacked like a poster, with the subtitle "The inaugural Wave · Saturday, March 20, 2027 · 400 blocks, one afternoon". As you scroll, about 10 wave hands pop up one at a time between the letters (people raising a hand to host, or waving hi). For visitors who turn off motion, the hands simply show.
- Built mobile-first: the poster letters scale to the screen, the map can be pinched and dragged, and forms open as full-screen sheets on phones.

## Page sections (in order)
1. **Opening poster**: language switcher in the corner, a "Host your block" button, and a live count ("37 of 400 blocks").
2. **The invitation**: the short pitch from your doc. Not a festival: a folding table on the sidewalk, tea in the garage. You host your block, we help with everything else.
3. **The 400-block map**: one dot per avenue block, 19th Ave to the ocean, Lincoln to Wawona, drawn like your attached map.
   - Open dot: tap it, and "44th Ave between Judah and Kirkham" is filled in on the host form.
   - Claimed dot: becomes a wave hand and lights up. Tapping it shows the host's first name and a "Send a note to the host" form.
   - A "My stretch isn't a dot" link opens the form for any other spot (around the corner, courtyards, the dead end by the beach).
4. **How easy it is**: your four photos as steps: print a flyer, chalk the sidewalk, put up a gathering sign, say hi. Then a row of ideas: cards in the garage, potluck out front, coffee and donuts, chalk art and music.
5. **What hosts get**: host party at 4114 Judah, the host network, planning help, flyers by local artists, a roughly $100 microgrant if you ask, and support on the day.
6. **Targets**: 100 hosts by January, 250 by the host party, 400 by March 20.
7. **FAQ** (lower on the page): do I need a permit, what if someone else has my block (you co-host), the microgrant, giving to another block, what if it rains, and is this happening every year.
8. **Footer**: Sunset Social Club logo linking to sunsetsocialclub.org, with Terms, Privacy and Contact.

## Forms (saved, so you can follow up)
- **Offer to host**: name, email or phone, your stretch in plain words (filled in from the map when you tap a dot), up to 3 co-hosts with optional contact info, "I could use about $100", "I can give a little to help another block", and preferred language. When you submit, the dot lights up right away.
- **Send a note to the host**: your name, how to reach you, and a message. It is saved for the team to pass along. Host contact details are never shown publicly.
- Both forms check for spam and are limited per visitor.
- The team can review all submissions in Lovable Cloud.

## Languages
English, 普通话 (Simplified Chinese), 廣東話 (Traditional Chinese, Cantonese wording), and Español. Every piece of text is translated, including forms, the map, the FAQ and footer pages. Your choice is remembered, and the page sets its language for screen readers. Translations will be drafted by me, and native speakers should review them.

## Pages
- `/` the landing page
- `/terms`, `/privacy`, `/contact`, copied from your Sunset Social Club project and adapted for The Sunset Wave

## Technical details
- Enable Lovable Cloud. Tables: `blocks` (around 400 seeded rows: avenue, between-streets label, grid x/y), `host_offers` (block_id nullable, stretch_text, name, contact, cohosts jsonb, wants_microgrant, can_give, language, created_at), `host_notes` (host_offer_id, name, contact, message). Row-level security: no public reads of the offer or note tables. A public view or server function exposes only claimed block ids and the host's first name.
- Submissions go through createServerFn with zod validation and a honeypot field. Block dots come from a seeded grid made to match the attached map, with the park, school and reservoir gaps.
- Map is an SVG in a pan/zoom wrapper, and claimed dots render the wave symbol. Scroll-triggered waves use IntersectionObserver plus CSS transforms. The custom cursor uses an SVG `cursor:` value, desktop only.
- i18n: a typed dictionary per locale and a React context, stored in localStorage plus the `<html lang>` attribute. Fonts: a display face such as Anton or Bebas Neue, Work Sans, and Noto Sans SC/TC.
- Assets: photos and the SSC logo uploaded as CDN assets. The wave logo and illustrations are generated, and the favicon comes from the wave logo. Each route gets its own head() metadata.

## Open items for you
- Whether host first names should show on claimed dots (planned: yes, first name only).
- Who receives the "note to host" messages, and whether emails should go out automatically. That needs a verified email domain; until then notes are stored only.
