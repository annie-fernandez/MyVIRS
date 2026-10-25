# VIRS design rules

These rules keep every screen consistent. They apply to people and to AI agents writing UI code here.

- **Values** (colors, type, spacing, component defaults): `src/theme/`
- **Shared components**: `src/components/ui`, one file per component (`PageHeader`, `Marker`, `Section`, `OptionCard`, `Surface`, `WordTag`, `CategoryLegend`, `RatingButtons`, `EmptyState`, `Pager`)
- **The site frame** (side menu, footer, the bar on phones): `src/app/_components/site-shell`
- **The four ways to add text**: `src/lib/sources.ts`
- **Everything rendered**: `/style-guide` on any running copy of the app

If a rule here and the code disagree, fix one of them in the same change.

## Where files go

Each file lives as close as possible to the code that uses it, so everything a screen needs sits next to its route.

- **One export per file**, named after it: `formatBytes` is in `format-bytes.ts`, `StatTile` in `stat-tile.tsx`. A file may also export the types that describe its export (props, return values); private constants stay in the file. No barrel (`index.ts`) files.
- **A file goes in the closest folder that holds everything that imports it.** Used by one route: inside that route's folder. Used by several routes: their nearest shared route segment or route group, like `app/(analyze)` or `app/(signed-in)`. Used across the app: `src/components` (UI) or `src/lib` (everything else).
- **Inside a route folder**, components go in `_components/` and other code (query options, schemas, shared types and helpers) in `_lib/`. The underscore keeps Next from treating them as routes. A component with its own helpers, sub-components or CSS module gets a folder named after it that holds them, like `_components/results-screen/`.
- **Server code** follows the same rule: helpers used only by API routes live in `app/api/_lib/` (or a narrower `_lib/` under `app/api`).
- **Data:** every call from the browser goes through TanStack Query: `useQuery` to read, `useMutation` to change anything (including Better Auth calls; throw `AuthError.from(error)` when one fails). Requests use `apiFetch` or `authClient`, never a `useEffect`. Every query key is in `src/lib/query-keys.ts`; each slice keeps its query options in its `_lib/`.

## What it should feel like

VIRS is a reading and vocabulary tool for K-12 students and teachers. Screens should be **calm, warm and obvious**:

- **Calm:** one main thing per screen, plenty of space, few boxes.
- **Studious:** paper, ink and a highlighter. White sheets on a light gray desk, near-black text, the site's indigo for the side menu and the main action, and highlighter yellow on one key word.
- **Obvious:** large readable text, plain words, one clear next step.

**The screen guides the eye.** The indigo side menu says where you are, its current page picked out in white; the white footer stays quiet; and on the page the strongest thing is the one main action. Anything else on the screen (other options, links, history) is white and quiet. If two things compete for attention, tone one down.

The personality comes from the original site's indigo and its source colors, the VIRS name at the top of the side menu, and the highlighter stroke on a key word. Keep those; don't add new decoration (no gradients, no cream or pastel washes, no glow).

## Color

- Use only the palette names in `src/theme/virs-colors.ts` (`virsIndigo`, `virsCyan`, `virsGreen`, `virsPink`, `virsOrange`, `virsBlue`, `virsGold`, `charcoal`) and the `VIRS_TOKENS`. **No raw hex values in screens.**
- **Color carries meaning, not decoration.** Each color has a job:

  | Color | Used for |
  | --- | --- |
  | `virsIndigo` | The side menu, primary buttons, links, the eyebrow line, the "Text" source |
  | `virsCyan` / `virsGreen` / `virsPink` | Word documents / PDFs / photos, wherever those choices appear |
  | `virsOrange` | Warnings, the loader |
  | `virsBlue` | Information messages, the iTranslate screen |
  | `virsGreen` | Success messages |
  | `red` (Mantine's) | Errors and destructive actions |
    | `charcoal` | Text and neutral controls |

- **Every screen looks the same except its highlighter.** The main panel is always a white `Surface` in the same place. A screen with its own color (text indigo, Word document cyan, PDF green, photo pink, iTranslate blue) shows it in the title's `Marker` stroke and in small icons, never in the panel. Screens without a color use the yellow marker.
- **Gray desk, white paper, one indigo bar.** The page is a light neutral gray (`page`), cards and the footer are white (`surface`, `frame`), and the side menu is solid indigo (`menu`) with white text (`onMenu`). In the side menu, hover is a faint white fill (`menuHover`); the current page is white with indigo text and icon, and doesn't change on hover. White on the indigo is the menu's only accent: the Log in button is white too.
- **No large blocks of saturated color besides the side menu.** Use tints (shade 0–2) for colored backgrounds and full color (shade 6) only for small things: filled buttons, the selected rating. No gradients anywhere.
- **Text on color:** filled components switch to dark text on light colors automatically. If you put text on a colored block yourself, use `textOn(color)`. For text or thin icons *in* a color on white, use shade 8 (`--tint-strong`), never 6.
- **Word categories** use `CATEGORY_STYLES` through `WordTag`, never the palette. Every category color reads at 4.5:1 or better. Show a `CategoryLegend` wherever `WordTag`s appear. The legend is plain text beside color swatches, not boxed chips; on the enhanced text it sits at the top of the same sheet as the passage.
- **Ratings** use `RATING_SCALE` through `RatingButtons`: plain grey squares numbered 1–5, the chosen one filled in indigo, each label on hover. The labels follow the Vocabulary Knowledge Scale (what the student can do with the word). The stored values are 1–5 and never change, but the labels can.

## Type

- **Lexend for everything**, loaded (self-hosted) in `app/layout.tsx`, the site name included: "VIRS" in white with the full name small beneath it. One typeface: a second rounded sans next to Lexend reads as a mistake, not a choice.
- Sizes come from the theme; don't set pixel sizes in screens.
  - Page title: `Title order={1}`, one per screen.
  - Section title: `Title order={2}`, or use `Section`.
  - Lead text under a title: `fz="lg"` with `c="dimmed"`. `PageHeader` reserves two lines for it, so the panel below starts at the same height on every screen; keep descriptions to two lines at most.
  - Body: the default, 16 px.
  - Secondary (counts, captions, help): `size="sm"` with `c="dimmed"`. Never smaller than `xs` (13 px).
- Weights: 400 body, 500 labels and navigation, 600 titles, buttons and emphasis. No 300 or lighter.
- **The marker** (`<Marker>`): one key word in a page title, at most once per screen. Not in body text, buttons or section titles. Yellow by default; pass `color` on a screen that has its own.
- Sentence case everywhere ("Upload a photo", not "Upload A Photo"), including labels: no all-caps anywhere, since lower case is easier to read (the British Dyslexia Association's style guide says the same).
- A link inside a sentence is always underlined (`underline="always"`), so it doesn't rely on color alone. Standalone links (menus, buttons, table cells) don't need it.

## Layout and spacing

- Every screen renders inside the shell; never add your own menu, header or footer.
- **The side menu** runs the full height of the window, on the left: the site name and the collapse button at the top, the destinations, then the citation and the account at the bottom. From tablet width up it can collapse to icons (their labels become tooltips); the visitor's choice is remembered. A page that needs the room can open with it collapsed: add its path to `COLLAPSED_MENU_PATHS` (`site-shell/collapsed-menu-paths.ts`). On phones the same menu opens from the burger in a slim indigo bar with the site name.
- The footer is one band along the bottom of the window, beside the side menu. It stays on screen from tablet width up and ends the page on phones.
- **Content fills the width beside the menu, left-aligned.** No centered column and no maximum page width. Use a wide screen by putting related panels side by side (`SimpleGrid cols={{ base: 1, lg: 2 }}`, or a `Grid` for unequal widths) instead of stacking them, as Statistics does with its two word-list panels. Limit **text** width (`maw={640}` on paragraphs), not layout width; a small single-purpose form (log in, new password) stays compact rather than stretching across the screen.
- **Don't cover what's being read.** On Enhanced text a clicked word opens in a panel beside the passage (60/40), which floats at the top of the window and scrolls on its own. When the page is too narrow for both (under 720 px of content, as on phones), it slides in from the right in a drawer instead. Centered pop-ups are for screens where nothing needs to stay visible.
- **Long unbroken text** (URLs, file paths) wraps (`overflow-wrap: anywhere`), and grid columns use `minmax(0, …)`, so one long token can never push a panel off the screen.
- Spacing comes from the scale: `xs` 8, `sm` 12, `md` 16, `lg` 24, `xl` 32 px.
  - Between major blocks of a screen: `xl`.
  - Inside a panel: `sm`.
  - Between cards in a grid: `md`, or `sm` for compact cards.
- Grids: two columns for large option cards, three for compact ones, always one column on phones (`cols={{ base: 1, sm: 2 }}`).
- Corners and shadows come from component defaults. Cards and panels are `lg`; buttons and inputs `md`. Shadows only on hover or on floating things (menus, modals).

## Building a screen

Every screen follows the same shape:

```tsx
<Stack gap="xl">
  <PageHeader
    title={<>Analyze your <Marker color={TEXT_SOURCES.text.color}>text</Marker></>}
    description="One or two sentences on what this screen does."
    actions={/* optional: the one main action, when it isn't inside the panel */}
  />

  <Surface>
    {/* the screen's main work: the input, the upload, the result */}
  </Surface>

  <Section title="Have a file instead?">
    {/* supporting content: other options, history, details */}
  </Section>
</Stack>
```

Which component for what:

| Need | Use |
| --- | --- |
| Top of a screen | `PageHeader` (eyebrow optional) |
| A key word in that title | `Marker`, with `color` on a screen that has its own color |
| A titled group below the main panel | `Section` |
| The screen's main input or result | `Surface`, the same white panel on every screen |
| Any other card on the gray page | `Surface` |
| A choice that goes somewhere (a source, a tool) | `OptionCard`, `compact` when 3+ in a row. White, with its color on the icon only |
| A word marked by category | `WordTag`, plus `CategoryLegend` nearby |
| Rating how well a student knows a word | `RatingButtons` |
| A list or panel with nothing in it yet | `EmptyState` |
| Moving between pages of a list | `Pager` ("‹ 1 of 3 ›"), under the list on the right, with the count on the left |
| A link from a Mantine page | `component={ShellLink}` on `Anchor`, `Button`, `NavLink` or `UnstyledButton` |
| Anything else | The Mantine component directly; the theme already styles it |

- **Mantine components only.** No other UI libraries, no Tailwind, no hand-written HTML controls when Mantine has one.
- Don't restyle Mantine components in a screen to look different from the theme. If the theme default is wrong, change it in `src/theme/theme.ts` so every screen gets the fix.
- Before writing a new shared component, check whether a Mantine component plus the theme already covers it. Add to `components/ui` only when a second screen needs the same thing, and add it to `/style-guide` in the same change.
- The ways to add text (text, Word document, PDF, photo) always come from `TEXT_SOURCES`, in that order, with those colors and words.
- **Variants of one screen share one menu entry.** The four ways to add text are a single "Analyze" entry; tabs at the top of the panel switch between them. Don't list near-identical screens separately in the menu.
- Home is the one screen whose main panel is a white `Surface` holding the `PageHeader` and its button ("Measure readability"). The file uploads sit below it as compact option cards, so the button is the first thing people see.

## Buttons and actions

- **One filled button per area**: the main action. Other actions use `variant="default"` (outlined) or `"subtle"`.
- When two actions sit together, the main one goes on the right.
- Buttons say what they do, with a verb: "Measure readability", "Upload a photo", "Save rating". Not "Submit", "OK" or "Click here".
- An icon in a button goes on the left and repeats the meaning of the words. Icon-only buttons (`ActionIcon`) need a `Tooltip` and an `aria-label`.
- Disable a button only when the reason is visible nearby, such as an empty text box or a word count under the minimum. Otherwise leave it enabled and explain what's wrong when it's clicked.
- Destructive actions (delete a passage, delete an account) are `color="red" variant="light"` and confirm in a `Modal` that names what will be lost.

## Forms

- **Forms read top to bottom**, one field per row. Don't put fields side by side.
- **One place for each thing.** Signed out, the bottom of the side menu is a single "Log in" button; signed in, it's the account menu (My profile, Change password, Log out) and nothing else. Things the user has made, like History, are destinations in the menu above it. Don't link the same destination from both.
- Log in, registration and password recovery are one set of forms (`app/_components/account-forms`), each linking to the others, and always in the one account pop-up (`AccountModal`): the menu's Log in button and the sign-in page's buttons both open it, so there's never a form on the page and another in a pop-up. Keep them short enough to fit a laptop screen without scrolling; ask only for what's needed (no "confirm password" on sign-up, since the field can show what was typed).
- Every field has a visible `label`; placeholders are examples, not labels.
- Help text goes in `description`, under the field. Errors go in `error`, in a full sentence that says how to fix it: "Enter a full email address, like ana@example.com."
- Show limits before people hit them (the character count, the 25 MB file limit), and warn as they approach (the count turns orange at 90 %).

## Messages and states

Every screen handles four states. Never leave a blank or frozen area.

- **Loading:** `Loader` with a sentence saying what's happening ("Reading your photo…"), or `Skeleton` where content will appear. Buttons that started the work show `loading`. Moving between screens, `app/loading.tsx` shows a skeleton of the page header and panel until the screen is ready; don't add per-route `loading.tsx` files.
- **Empty:** `EmptyState` with what will appear here and the action that fills it.
- **Error:** `Alert color="red"` that says what went wrong and what to do next, in plain words. Never show raw error codes or stack traces.
- **Screen fails to render:** `app/error.tsx` shows inside the shell (title, a red `Alert`, *Go to Home* and *Try again*). Don't add per-route `error.tsx` files; handle expected failures inline, as above.
- **Success:** `Alert color="virsGreen"` only when the result isn't already visible; otherwise the visible result is the confirmation.
- **Needs an account:** screens that need an account live in `app/(signed-in)`. Signed-out visitors are redirected to the sign-in page, `/sign-in?title=<what needs an account>&next=<page>`, which says what they were trying to do, with Create an account and Log in buttons that open the account pop-up; afterwards they go back to `next`. Give each new page its title in `src/lib/auth/sign-in-url.ts`. Anything else that needs an account (rating a word) links there too, with `signInUrl(page, title)`, rather than opening a pop-up. Screens don't check the session themselves; when a shared component's UI differs for a signed-in user (rating a word, the side menu), it reads `useSession()`.

Info is `virsBlue`, warnings `virsOrange`. Give each `Alert` an icon.

## Writing

- Plain, friendly and short, for a K-12 reader. Second person ("your text"), active voice.
- Name things the same way everywhere: **passage** or **text** (not document) for what's analyzed; **Enhanced text** and **Statistics** for the two results; **Word document**, **PDF**, **photo** for the uploads. **History** for the list of a signed-in user's saved analyses.
- Numbers as digits with separators: "30,000 characters", "12 of 30 rated".
- No jargon on screen. "Readability score", not "Flesch reading ease"; the details can go in a tooltip or a Reference page.

## Accessibility

- Text contrast at least 4.5:1. The palette, `textOn` and `CATEGORY_STYLES` already meet it; check anything new.
- Everything works with a keyboard and shows a visible focus ring. Don't remove outlines.
- Color is never the only signal. Categories have a legend and tooltips; ratings have numbers and labels; errors have words.
- Images and icon-only controls have text alternatives.
- Every screen works at phone width (390 px): grids drop to one column, nothing scrolls sideways except tables.

## Changing the system

- Change colors, sizes and component defaults in `src/theme/`, never per screen.
- When you add or change a token, shared component or rule, update `/style-guide` and this file in the same change.
