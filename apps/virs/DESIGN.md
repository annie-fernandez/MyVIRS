# VIRS design rules

These rules keep every Mantine screen consistent while the app moves over from Angular. They apply to people and to AI agents writing UI code here.

- **Values** (colors, type, spacing, component defaults): `src/theme.ts`
- **Shared components**: `src/components/ui` (`PageHeader`, `Marker`, `Section`, `OptionCard`, `Surface`, `WordTag`, `CategoryLegend`, `RatingButtons`, `EmptyState`, `Pager`)
- **The site frame** (header, sidebar, footer, sign-in): `src/components/layout`
- **The four ways to add text**: `src/lib/sources.ts`
- **Everything rendered**: `/style-guide` on any running copy of the app

If a rule here and the code disagree, fix one of them in the same change.

## What it should feel like

VIRS is a reading and vocabulary tool for K-12 students and teachers. Screens should be **calm, warm and obvious**:

- **Calm:** one main thing per screen, plenty of space, few boxes.
- **Studious:** paper, ink and a highlighter. White sheets on a light gray desk, near-black text, the site's indigo for the header bar and the main action, and highlighter yellow on one key word.
- **Obvious:** large readable text, plain words, one clear next step.

**The screen guides the eye.** The indigo header bar says where you are; the white sidebar and footer stay quiet; and on the page the strongest thing is the one main action. Anything else on the screen (other options, links, history) is white and quiet. If two things compete for attention, tone one down.

The personality comes from the original site's indigo and its source colors, the Europa site name, and the highlighter stroke on a key word. Keep those; don't add new decoration (no gradients, no cream or pastel washes, no glow).

## Color

- Use only the palette names in `theme.ts` (`virsIndigo`, `virsCyan`, `virsGreen`, `virsPink`, `virsOrange`, `virsBlue`, `virsGold`, `charcoal`) and the `VIRS_TOKENS`. **No raw hex values in screens.**
- **Color carries meaning, not decoration.** Each color has a job:

  | Color | Used for |
  | --- | --- |
  | `virsIndigo` | The header bar, primary buttons, links, the current page in the sidebar, the eyebrow line, the "Text" source |
  | `virsCyan` / `virsGreen` / `virsPink` | Word documents / PDFs / photos, wherever those choices appear |
  | `virsOrange` | Warnings, the loader |
  | `virsBlue` | Information messages, the iTranslate screen |
  | `virsGreen` | Success messages |
  | `red` (Mantine's) | Errors and destructive actions |
    | `charcoal` | Text and neutral controls |

- **Every screen looks the same except its highlighter.** The main panel is always a white `Surface` in the same place. A screen with its own color (text indigo, Word document cyan, PDF green, photo pink, iTranslate blue) shows it in the title's `Marker` stroke and in small icons, never in the panel. Screens without a color use the yellow marker.
- **Gray desk, white paper, one indigo bar.** The page is a light neutral gray (`page`), cards, sidebar and footer are white (`surface`, `frame`), and the header is solid indigo (`header`). In the sidebar, hover is a faint gray fill; the current page is an indigo tint with indigo text and icon, and doesn't change on hover.
- **No large blocks of saturated color besides the header bar.** Use tints (shade 0–2) for colored backgrounds and full color (shade 6) only for small things: filled buttons, the selected rating. No gradients anywhere.
- **Text on color:** filled components switch to dark text on light colors automatically. If you put text on a colored block yourself, use `textOn(color)`. For text or thin icons *in* a color on white, use shade 8 (`--tint-strong`), never 6.
- **Word categories** use `CATEGORY_STYLES` through `WordTag`, never the palette. Every category color reads at 4.5:1 or better. Show a `CategoryLegend` wherever `WordTag`s appear. The legend is plain text beside color swatches, not boxed chips; on the enhanced text it sits at the top of the same sheet as the passage.
- **Ratings** use `RATING_SCALE` through `RatingButtons`: plain grey squares numbered 1–5, the chosen one filled in indigo, each label on hover. The labels follow the Vocabulary Knowledge Scale (what the student can do with the word). The stored values are 1–5 and never change, but the labels can.

## Type

- **Lexend for everything**, loaded in `app/layout.tsx`. **Europa only for the site name** in the header, in white.
- Sizes come from the theme; don't set pixel sizes in screens.
  - Page title: `Title order={1}`, one per screen.
  - Section title: `Title order={2}`, or use `Section`.
  - Lead text under a title: `fz="lg"` with `c="dimmed"`. `PageHeader` reserves two lines for it, so the panel below starts at the same height on every screen; keep descriptions to two lines at most.
  - Body: the default, 16 px.
  - Secondary (counts, captions, help): `size="sm"` with `c="dimmed"`. Never smaller than `xs` (13 px).
- Weights: 400 body, 500 labels and navigation, 600 titles, buttons and emphasis. No 300 or lighter.
- **The marker** (`<Marker>`): one key word in a page title, at most once per screen. Not in body text, buttons or section titles. Yellow by default; pass `color` on a screen that has its own.
- Sentence case everywhere ("Upload a photo", not "Upload A Photo"). No all-caps, except the sidebar's small section labels.

## Layout and spacing

- Every screen renders inside the shell; never add your own header, sidebar or footer.
- The footer is one band along the whole bottom of the window, under the sidebar too. It stays on screen from tablet width up and ends the page on phones.
- Content sits in the shell's column (`--virs-content-width`, 960 px), left-aligned. Don't center a narrower column inside it. Limit **text** width (`maw={640}` on paragraphs), not layout width.
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
- Don't restyle Mantine components in a screen to look different from the theme. If the theme default is wrong, change it in `theme.ts` so every screen gets the fix.
- Before writing a new shared component, check whether a Mantine component plus the theme already covers it. Add to `components/ui` only when a second screen needs the same thing, and add it to `/style-guide` in the same change.
- The ways to add text (text, Word document, PDF, photo) always come from `TEXT_SOURCES`, in that order, with those colors and words.
- **Variants of one screen share one sidebar entry.** The four ways to add text are a single "Analyze" entry; tabs at the top of the panel switch between them. Don't list near-identical screens separately in the sidebar.
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
- **One place for each thing.** Signed out, the top-right corner is a single "Log in" button; signed in, it's the account menu (My profile, Change password, Log out) and nothing else. Things the user has made, like History, live in the sidebar only. Don't link the same destination from both.
- Log in and registration are pop-ups, each linking to the other; registration and password recovery are reached from the log-in pop-up. Keep them short enough to fit a laptop screen without scrolling; ask only for what's needed (no "confirm password" on sign-up, since the field can show what was typed).
- Every field has a visible `label`; placeholders are examples, not labels.
- Help text goes in `description`, under the field. Errors go in `error`, in a full sentence that says how to fix it: "Enter a full email address, like ana@example.com."
- Show limits before people hit them (the character count, the 25 MB file limit), and warn as they approach (the count turns orange at 90 %).

## Messages and states

Every screen handles four states. Never leave a blank or frozen area.

- **Loading:** `Loader` with a sentence saying what's happening ("Reading your photo…"), or `Skeleton` where content will appear. Buttons that started the work show `loading`.
- **Empty:** `EmptyState` with what will appear here and the action that fills it.
- **Error:** `Alert color="red"` that says what went wrong and what to do next, in plain words. Never show raw error codes or stack traces.
- **Success:** `Alert color="virsGreen"` only when the result isn't already visible; otherwise the visible result is the confirmation.
- **Needs an account:** don't redirect signed-out visitors away from a feature that needs one. Show the screen with an `EmptyState` that says what an account adds, with Log in and Create an account actions that open the account pop-ups (`?login=1`, `?register=1`).

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

- Change colors, sizes and component defaults in `theme.ts`, never per screen.
- When you add or change a token, shared component or rule, update `/style-guide` and this file in the same change.
