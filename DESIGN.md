# Vibecoding Project Tracker — Design

**Status:** Hackathon starter design doc · fill in the **`<TODO>`** sections before you tag `design-done`.

**Why this file exists.** This tracker is your tool. It should look like *your* tool — not a generic Kanban with default Tailwind blue. Twenty minutes of design decisions here will be visible on every screen for the next six weeks of Module 5.

**Who owns this.** Person B, during the same window the rest of the team is reviewing the PRD. By the time the team converges to start M4 (`data-model`), this file should be filled in and the colors should already be in `tailwind.config.js`.

---

## 1. Mood / vibe

One sentence that captures the feeling the tracker should leave you with.

`Professional`

Two or three references that capture the vibe (links to dribbble shots, screenshots of apps you admire, Pinterest boards — anything visual):

- `https://dribbble.com/shots/26279299-Compliance-Task-Board-Kanban-UI`
- `https://dribbble.com/shots/25030400-Taskify-Project-Management-Dashboard-Kanban-View`
- `https://dribbble.com/shots/21227113-Managemate-Task-Management-Dashboard`
- `https://flathub.org/oc/apps/com.mattermost.Desktop`

Anti-references — what we are explicitly **not** trying to look like:

- `miro.com/pt/wireframe/o-que-e-wireframe/`

## 2. Color palette

These are the colors the build milestones will reference. Once chosen, paste the hex values into `tailwind.config.js` so the rest of the team can use Tailwind utility classes (e.g. `bg-brand-primary`, `border-due-warning`).

### Brand

| Token           | Hex         | Where it shows up               |
| --------------- | ----------- | ------------------------------- |
| `brand-primary` | `#6610f2ff` | Header, "+" button, focus rings |
| `brand-accent`  | `#5ef38cff` | Highlights, hover states, links |
| `surface-page`  | `#fafaffff` | Page background                 |
| `surface-card`  | `#EBEBFF`   | Card background                 |
| `text-primary`  | `#000`      | Body text                       |
| `text-muted`    | `#6F6F71`   | Captions, dates, counts         |

### Task type (M6 `tag-style`)

| Token          | Hex       | When used                                     |
| -------------- | --------- | --------------------------------------------- |
| `type-feature` | `#6610F2` | Cards tagged `feature` (accent stripe + icon) |
| `type-bug`     | `#FF2E00` | Cards tagged `bug` (accent stripe + icon)     |

### Due-date states (M8 `due-tint`)

| Token         | Hex       | When used             |
| ------------- | --------- | --------------------- |
| `due-safe`    | `#5EF38C` | More than 2 days out  |
| `due-warning` | `#FF2E00` | Less than 24 hours    |
| `due-overdue` | `#AD0000` | Past due              |
| `due-neutral` | `#6F6F71` | Done (overrides date) |

## 3. Typography

| Role                           | Font            | Why                                   |
| ------------------------------ | --------------- | ------------------------------------- |
| Heading                        | `Mozilla Text`  | `Clean and cleancut`                  |
| Body                           | `Poppins`       | `out of your way and readable`        |
| Monospace (tags, badges, code) | `JetBrainsMono` | `it's just the best programming font` |

Suggested sizes (override only if the design demands it):

- Page title: 24 px / semibold
- Section header: 16 px / semibold uppercase
- Card title: 14 px / medium
- Body: 14 px / regular
- Caption: 12 px / regular muted

## 4. Component principles

One short sentence per element. These set the tone for the build phase — Person A's modal and Person B's anchor board should both feel like they came from this doc.

- **Cards:** `Light, almost weightless; the only weight is from a 1px border, no shadow except on hover.`
- **Buttons:** `Solid fill, no gradient, generous padding, rounded-md.`
- **Modal:** `Centered, max-width-md, slate-900 backdrop at 50% opacity.`
- **Empty states:** `Dashed border, muted text, never sad.`
- **Drag affordance (if used):** `None — we use a status dropdown.`

## 5. Voice / microcopy

Three lines of microcopy that capture the tone of the product. Keep it short — these are the words a stressed user reads at 11pm.

| Where                                | Text                                            |
| ------------------------------------ | ----------------------------------------------- |
| "+" button label                     | `+ Task`                                        |
| Empty column placeholder             | `Nothing here yet — keep going.`                |
| Toast after "Copy as Prompt Context" | `Copied. Now paste it into the AI.`             |
| Confirm-delete message               | `REALLY delete this task? You can't undo this.` |
| Handoff toast (M7 `task-owner`)      | `Handed off to {name}. They've got it.`         |

## 6. Logo / wordmark

The tracker probably doesn't need a logo, but it does need a name and a wordmark style.

- **Product name:** `Kan't-Ban` (match PRD §11 team identity)
- **Wordmark style:** `simple, Just the name in the heading font, brand-primary color, no icon.`

## 7. Out of scope (this hackathon)

To keep design tight, the following are explicitly not part of `design-done`:

- A dark mode toggle. Pick one mode and ship it.
- Multiple themes. One brand, applied consistently.
- Animations beyond a 200 ms fade on toast notifications.
- A custom icon set. Use [Lucide icons](https://lucide.dev) via Tailwind classes if you need any.

---

*DESIGN.md version: hackathon-starter v1*
