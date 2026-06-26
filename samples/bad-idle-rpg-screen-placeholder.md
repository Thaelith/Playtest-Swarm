# Screen Placeholder: Bad Idle RPG UI

This document describes what a typical "bad" idle RPG screen looks like.
The demo will analyze this class of screen. Replace this with an actual
screenshot of the game you are testing.

## Screen Description

- Top bar: Player level, gold/gems/dust counters, settings gear icon
- Center: Character idle animation (low-res sprite, no attack feedback)
- Bottom: 4 upgrade buttons in a cramped row (Forge, Crit, Speed, Gold)
- Stats panel: tiny font, dark gray on black, unreadable
- No tutorial arrow or first-time guidance
- Prestige button hidden behind a "More" menu with no indicator
- Drop notification banner flashes too fast to read rarity text
- Offline earnings popup blocks the upgrade buttons on launch

## Known Issues

1. New players have no idea what to tap first
2. The upgrade buttons all look identical - no visual hierarchy
3. Crit Chance unlock at minute 5 but no notification when it's available
4. Stats panel font is 11px in dark gray on black background
5. Drop rarity colors are not colorblind-friendly
6. Prestige button invisible to first-time players
7. Forge upgrade cost grows 3.5x per level - unsustainable
8. Legendary items are just stat sticks with no gameplay change
9. No upgrade available between minutes 10 and 18
10. First prestige reward is only +5% Gold - feels worthless
