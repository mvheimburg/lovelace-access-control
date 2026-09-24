<img src="docs/icon.png" alt="" width="96" align="right">

# Access Control card

A Lovelace card that gathers the house's doors and gates in one place: whether
everything is locked, what is open, who last used the door panel, and the
everyday actions — lock, unlock, open and close the gate. English and Norwegian
Bokmål (_Dører og porter_).

![Access Control card in Bubble appearance on a dark theme: everything locked, and an evening with the gate open and one door unlocked](docs/access-control-dark.png)

![The same card on a light theme, and the optional confirmation before unlocking](docs/access-control-light.png)

![The history of the front door: a timeline of the lock and the door contact over 24 hours, with the states under the pointer](docs/access-control-history.png)

The images use the production bundle with simulated Home Assistant states. No
live Home Assistant instance was involved.

## Install

In HACS, open **Custom repositories**, add
`https://github.com/mvheimburg/lovelace-access-control` as a **Dashboard**
repository and install **Access Control Card**. HACS normally adds the resource;
if not, add `/hacsfiles/lovelace-access-control/access-control-card.js` as a
JavaScript module under **Settings → Dashboards → Resources**.

The card works with Home Assistant's own `lock` and `cover` entities, from any
integration (KNX, MQTT, Z-Wave …). It needs no integration of its own.

## Card

```yaml
type: custom:access-control-card
title: Dører og porter
appearance: bubble
doors:
  - lock.front_door
  - lock.terrace
  - entity: lock.garage_door
    name: Garasjedør
    contact: binary_sensor.garage_door_contact
gates:
  - cover.driveway_gate
access_event: event.doorbell_door_access
confirm_unlock: false
confirm_gate: false
```

| Option           | Default                           | Description                                                                                                                                                                                                          |
| ---------------- | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `doors`          | all `lock` entities               | Door locks. An entry is an entity ID, or an object with `entity` and optionally `name` and `contact`.                                                                                                                |
| `gates`          | all gate/garage `cover` entities  | Gates. Same form as `doors`.                                                                                                                                                                                         |
| `access_event`   | none                              | An `event` entity whose events carry `event_type` (`unlock`, `lock`, `open`, `close`), `user_name`, `access_level` and `door`, such as the door panel's `event.doorbell_door_access`. Shown as the last panel event. |
| `confirm_unlock` | `false`                           | Ask in the card before unlocking a door (off by default since 0.4.0).                                                                                                                                                |
| `confirm_gate`   | `false`                           | Ask in the card before opening a gate (off by default since 0.4.0).                                                                                                                                                  |
| `title`          | Doors and gates / Dører og porter | Heading.                                                                                                                                                                                                             |
| `appearance`     | `default`                         | `default` or `bubble` (uses the dashboard's `--bubble-*` variables).                                                                                                                                                 |

The visual editor lists the house's locks and gate covers as checkboxes, the
event entities for `access_event`, and the confirmation and appearance choices.
Entries written as objects in YAML are kept when you tick or untick others.

## What it shows

- **Status first.** _All locked_, or what needs attention, most urgent first:
  jammed locks, doors or gates not responding, open doors and gates, unlocked
  doors — for example _1 open · 1 unlocked_. Below it, the last event from the
  door panel: _Kari (resident) unlocked · front · 14:03_.
- **Doors and gates as two groups.** Each row shows the state, whether the door
  itself stands open, and the area. A door contact is found automatically when
  the lock's device has exactly one door/opening sensor; set `contact` to choose
  one yourself. Tap the icon or name for Home Assistant's own dialog; tap the
  state line for the history (below).
- **Actions.** A locked door offers **Unlock**, an unlocked one **Lock**; a gate
  has arrow buttons — up to open, stop (when the gate supports it) and down to
  close — with the direction it is already at disabled (0.2.0). Unlocking and
  opening a gate happen at once; turn on `confirm_unlock` or `confirm_gate` to
  be asked inside the card first. A lock that needs a code offers **Enter
  code**, which opens Home Assistant's dialog so the code is entered there.
  With two or more unlocked doors or open gates, one button locks every
  unlocked door and closes every open gate — **Lock all**, **Close all** or
  **Lock and close all**, depending on what is open (gates since 0.4.0).
- **Feedback.** A request in flight shows _Sending…_ and blocks a second press;
  a failure is shown by the door it concerns, and the row keeps showing Home
  Assistant's real state. A door or gate that is not responding has its actions
  disabled.

## History

Tap a row's state line (_Locked · door closed · Hall_, marked with a small
pulse icon) to see that door's or gate's history from Home Assistant's
recorder (0.5.0). The icon and name keep opening Home Assistant's own dialog;
the state line has its own 44 px touch target without changing the row's look.

- **A timeline, one lane per entity.** A door shows its lock (_Locked_,
  _Unlocked_, _Locking…_, _Jammed_ …) and, when it has one, its door contact
  (_Open_, _Closed_). A gate shows its cover (_Open_, _Closed_, _Opening…_,
  _Closing…_) and its contact, if one is set.
- **Colored bands in the card's tones.** Green for locked or closed, amber for
  unlocked (and locking/unlocking), orange for open, red for jammed. A gate
  in motion has its own bands: amber while opening, blue while closing
  (0.5.1). A spell
  when the entity was unavailable or unknown is hatched grey — a gap, not a
  state. Time before the recorder has anything is left empty.
- **6 h, 24 h and 7 d.** The chart fits the dialog's width, also on a phone.
- **Read it with the pointer.** Moving over the timeline shows the time and
  each lane's state at that moment; without a pointer the lanes show the
  current state. Tap a lane below the chart to close the history and open that
  entity's Home Assistant dialog.
- **Failures are explained** in the dialog (for example when the recorder is
  off), and a slow reply from an earlier range never replaces a newer one.

The card asks Home Assistant for `history/history_during_period` with minimal,
attribute-free rows, using the frontend's websocket connection; no extra setup
is needed beyond the recorder, which Home Assistant runs by default.

## Language and formatting

The card follows Home Assistant's language (`nb`, `nb-NO` and `no` give Bokmål;
`nn` uses Bokmål too; anything else English) and updates when it changes. Times
use Home Assistant's formatting locale and 12/24-hour preference separately.
Entity and user names are shown as Home Assistant and the panel name them. The
card-picker entry is English because it has no Home Assistant context. The
history's range labels (_6 t / 24 t / 7 d_ in Bokmål) and times follow the
formatting locale too.

## Development

```sh
npm ci
npx playwright install chromium
npm test
npm run lint
npm run typecheck
npm run build
node scripts/screenshot.cjs
```

`dist/` is committed and must match the build. Pushing a new `package.json`
version to `main` tags `v<version>` and publishes a release.

## License

MIT

## Color schemes

Choose **Color scheme** in the card's visual editor. The setting is per card and
works with both **Default** and **Bubble** appearance, including in-card dialogs.
Every card supplied by this package offers the same choices:

| Scheme                   | YAML value       | Palette                                                 |
| ------------------------ | ---------------- | ------------------------------------------------------- |
| Home Assistant (default) | `home-assistant` | Follows your dashboard theme and Bubble color variables |
| Bright                   | `bright`         | White surfaces with blue accents                        |
| Warm                     | `warm`           | Ivory surfaces with warm brown accents                  |
| Mint                     | `mint`           | Pale green surfaces with green accents                  |
| Sky                      | `sky`            | Pale blue surfaces with blue accents                    |
| Lavender                 | `lavender`       | Pale purple surfaces with purple accents                |

For example, add these options to your existing card configuration:

```yaml
appearance: bubble
color_scheme: mint
```

The five light schemes stay light even on a dark dashboard and override inherited
colors only within this card. Status colors retain their meaning (green for
success, amber for warnings and red for errors). Remove `color_scheme` or choose
**Home Assistant** to follow the dashboard again. Existing configurations keep
their current appearance. Scheme names and the editor label support English and
Norwegian Bokmål; YAML values remain unchanged in either language. Static
card-picker metadata remains English because it has no Home Assistant language
context.

## Home Assistant state colors

By default the card colors doors and gates by what needs attention: green when
locked or closed, amber when unlocked, orange when open, red when jammed. Turn
on **Use Home Assistant's state colors** in the card editor (0.6.0) to use
Home Assistant's own lock, cover and door colors instead, so your theme decides:

```yaml
state_colors: true
```

The card then colors each door, gate, the summary and the history timeline the
way Home Assistant's own cards do. It uses the most specific theme variable that
is set, for example for a locked lock `--state-lock-locked-color`, then
`--state-lock-inactive-color`, then `--state-inactive-color`, and finally the
card's own color. An open door uses its contact's color
(`--state-binary_sensor-door-on-color`), and a gate its device class first
(`--state-cover-gate-closed-color`). With Home Assistant's default theme, a
locked door is green, an unlocked one red and a closed gate grey.

To change a color, set the variable in your theme, for example a calm grey for
locked doors:

```yaml
my_theme:
  state-lock-locked-color: "var(--grey-color)"
```
