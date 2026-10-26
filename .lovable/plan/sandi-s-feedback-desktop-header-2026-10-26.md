# Sandi's feedback + desktop header

## Header
- Desktop: THE SUNSET WAVE runs in one line across the full width (stacked stays on phones), filling the empty space on the right. Hands still pop up across the letters.
- Date: replace "The Inaugural Wave - Saturday, March 20, 2027" with **SATURDAY, MARCH 20TH 2027**, larger, bold, in the poster lettering.
- "WAVE" gently wiggles side to side (a slow loop, paused for visitors who turn off motion).

## Wording changes (all 4 languages)
- Section title: "GATHERINGS ON EVERY BLOCK. ON THE SAME DAY."
- "We help out and celebrate you." becomes "We support you with a host kit and opportunities to meet fellow hosts."
- "My stretch isn't a dot" becomes "My area isn't a dot on the map".
- Host form money question: "If it becomes available, I could use extra funds to help cover expenses."
- Make it yours: add "You decide!"
- FAQ:
  - "What do I actually have to do?" gets Sandi's answer, including the suggested 11:00 am - 1:00 pm.
  - "How does the $100 work?" becomes "Is there any financial support for hosting?" with "Let us know you could use support when you sign up. We will provide support where possible!"
  - "Can I help another block?" becomes "Can I help financially support another block?"
  - Item 11 (the "next stretch over" answer): reword so it says you can host anywhere near you, right around the corner, a courtyard or your own driveway, using "My area isn't a dot on the map". You don't need to know anyone there.

## Host form
- New optional checkbox: "The place I'm hosting is sheltered from rain." It is saved with the offer and included in the alert email to the Social Club inbox.

## Map
- Claimed-block hand turns a cool blue with a dark outline, so it stands out on the light map. The legend matches.
- Small note under the map: "Blank spaces are parks and reservoirs!"
- Expand to the District 4 lines from the map you sent:
  - Add the Wawona to Sloat row west of Stern Grove (about 34th to 47th Ave).
  - Add a "South of Sloat" area below it with dots for the curved streets there, such as Lakeshore, Sylvan, Eucalyptus, Ocean Ave, Clearfield, Gellert and Springfield, down to Lake Merced Blvd. These streets don't follow the grid, so they appear as a separate labeled cluster. The dots are approximate, about 20 to 25 of them.
  - Existing blocks and saved hosts stay as they are.

## What we can't fully do
- The south-of-Sloat streets curve, so on our dot map they will look approximate rather than exact. Hosts can still pick a nearby dot or use "My area isn't a dot on the map".
- Translations are still drafts written by me.

## Technical details
- Hero: on md and up, the title becomes a single flex row with a size based on vw. Hand positions get a second set of coordinates for the wide layout. Add a `wiggle` keyframe on the WAVE span, with a reduced-motion guard.
- i18n: update the keys above in en/zh/yue/es, and add `form.sheltered`, `map.blankNote` and the new idea.
- Migration: add `sheltered boolean default false` to host_offers and update its insert policy. Pass the field through the zod schema, server fn and host-alert template.
- blocks.ts: add the Sloat row (new ids such as `34-wawona`) plus a SOUTH_SLOAT list with explicit col/row positions and named labels. Existing ids stay unchanged. Update blocks tests.
- New `--color-claim` token in styles.css. BlockMap renders claimed markers with a tinted hand: a blue disc behind the black hand.
