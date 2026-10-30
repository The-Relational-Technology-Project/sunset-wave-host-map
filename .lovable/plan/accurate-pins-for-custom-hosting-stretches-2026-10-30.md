# Accurate pins for custom hosting stretches

## Result
Typing a stretch such as **“Wawona between 37th and 38th”** will place a wave on that actual east–west block—not a nearby Avenue. Existing Avenue pins and host signups remain attached to their original blocks.

## Map coverage
- Define one explicit campaign footprint: 19th Avenue to the neighborhood’s ocean frontage, Lincoln through Sloat, plus the existing supported streets south of Sloat.
- Use that footprint to limit eligible street segments and validate every proposed location. Viewing or panning the tile map does not expand campaign eligibility.
- Keep parks, reservoirs and unsupported roads from becoming automatic hosting locations. Hosts can still submit an unusual location for steward review.

## Understand typed stretches
- Build a local catalog of real street segments from the city’s public street centerlines, including east–west blocks, coastal streets and supported south-of-Sloat streets.
- Recognize street names, numbered avenues, common abbreviations, reversed endpoints and connecting phrases in all four site languages.
- Match clear descriptions to one real segment and place the wave at its midpoint. For example, “24th Avenue between Irving and Lincoln” resolves to the existing Avenue pin.
- Show the matched stretch and a small location preview before submission, allowing the host to correct it.
- Treat intersections such as “35th and Moraga” as a distinct location choice, not an arbitrary adjacent Avenue block; ask the host to confirm the corner or specify a stretch.
- For unclear, conflicting, multi-block or out-of-area descriptions, keep the signup and flag its location for steward review. Never silently guess or move it inside the boundary.

## Public map and stewardship
- Render newly claimed non-Avenue segments as waves without adding hundreds of new open dots to the initial map.
- Keep map details anonymous and allow neighbor notes to reach the correct location through the existing steward approval process.
- Add a location status and review controls to the host table: mapped, needs clarification, or outside campaign coverage. Stewards can confirm an eligible segment while preserving the submitted description.
- Resolve existing unassigned signups using the same matcher. Apply only unique, geographically verified matches; leave uncertain cases for review. Do not delete or merge duplicate signups.
- Keep host count and distinct mapped-location count separate.

## Technical details
- Store a versioned, browser-safe street catalog and campaign coverage definition locally; no live geocoding request or third-party sharing of host descriptions is needed.
- Preserve all current block IDs. Add stable IDs for non-Avenue segments; use those IDs for both claims and note routing.
- Extend public occupancy reads only as necessary to support the new locations; never expose names, contact information or raw host descriptions publicly.
- Validate matches server-side as well as in the form. Steward location changes recheck the existing password session and avoid changing a location that would invalidate an already approved note’s recipient.
- Fail safely when claim reads fail rather than showing a misleading empty map.

## Verification
- Test Renee’s exact Wawona description, reversed Avenue endpoints, coastal descriptions, intersections, ambiguous input, geographic limits and preservation of existing IDs.
- Check future signup → mapped wave → neighbor note routing, plus a steward-reviewed uncertain location.
- Verify phone and desktop layouts, all four languages, anonymous map privacy and no duplicate waves for hosts sharing a segment.