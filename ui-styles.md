# UI Style System — Dark Premium React
> Steering file for Kiro. Apply these rules to ALL UI generation tasks unless explicitly overridden.

---

## Intent

Generate UI that feels like it was built by a senior frontend developer at a real SaaS company.
Not flashy. Not generic. Calm, readable, functional, and visually precise.

---

## Color System

```css
--bg-primary:    #0B0F19;
--bg-secondary:  #111827;
--bg-tertiary:   #1F2937;

--text-primary:   #E5E7EB;
--text-secondary: #9CA3AF;
--text-muted:     #6B7280;

--border:         #1F2937;

--accent-primary:   #4F46E5;
--accent-secondary: #06B6D4;

--success: #10B981;
--warning: #F59E0B;
--error:   #EF4444;
```

**Rules:**
- Never use pure black (`#000000`) or pure white (`#FFFFFF`)
- Use accent colors sparingly — 5–10% of the UI surface only
- Background must feel layered (3 levels: primary → secondary → tertiary)
- No neon, no glow, no bright gradient blobs

---

## Typography

**Font stack:** `'Geist', 'Inter', 'Poppins', sans-serif`

| Token  | Size     |
|--------|----------|
| `h1`   | 40–48px  |
| `h2`   | 28–32px  |
| `h3`   | 20–24px  |
| `body` | 16px     |
| `small`| 14px     |

- Line height: `1.5–1.7`
- Heading letter-spacing: `-0.02em` to `-0.03em`
- Font weight: headings `600–700`, body `400`, labels `500`
- Do NOT bold everything — use weight contrast deliberately

---

## Spacing (8px Grid)

Allowed values: `4px 8px 12px 16px 24px 32px 48px 64px`

- All padding, margin, and gap must be multiples of 8
- No arbitrary values like `13px`, `22px`, `37px`
- Component internal padding: `16px` default, `24px` for cards

---

## Border & Radius

```css
border: 1px solid #1F2937;

--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-xl: 20px;
```

- Use `rounded-xl` (`16px`) or `rounded-2xl` (`20px`) as default for cards, modals, inputs
- No sharp 0px corners except dividers/rules
- No heavy drop shadows — use `box-shadow: 0 4px 20px rgba(0,0,0,0.3)` max

---

## Component Contracts

### Button
```css
padding: 10px 16px;
border-radius: 12px;
font-weight: 500;
font-size: 14px;
transition: all 0.2s ease-in-out;
```
- Hover: `background` lightens by ~10%, no scale
- Active: `transform: scale(0.98)`
- Disabled: `opacity: 0.5; cursor: not-allowed`
- Primary: uses `--accent-primary` fill
- Ghost: transparent bg, `--border` border, `--text-primary` text

### Card
```css
background: #111827;
border-radius: 16px;
border: 1px solid #1F2937;
padding: 16px;
```
- No heavy shadow
- Hover (if interactive): `border-color: #374151; transition: 0.2s`

### Input / Select
```css
background: #1F2937;
border: 1px solid #374151;
border-radius: 10px;
padding: 10px 14px;
color: #E5E7EB;
font-size: 14px;
```
- Focus: `border-color: #4F46E5; outline: none`
- Placeholder: `color: #6B7280`

### Badge / Tag
```css
padding: 4px 10px;
border-radius: 8px;
font-size: 12px;
font-weight: 500;
```
- Use bg variants of semantic colors at 15–20% opacity with matching text

---

## Interaction & Animation

- Duration: `200ms–300ms` only
- Easing: `ease-in-out` or `cubic-bezier(0.4, 0, 0.2, 1)`
- Page/section fade-in: `opacity: 0 → 1` with `translateY(8px) → 0`
- Hover scale (cards only, not buttons): `transform: scale(1.02)`

**Never use:**
- Bounce / spring animations
- Pulsing glow effects
- Looping animations on static content
- Slide-from-extreme-edges transitions

---

## Icon Rules

- Library: `lucide-react` (outline style)
- Sizes: `16px / 20px / 24px` only
- Default color: `#9CA3AF`
- Active / selected: `#E5E7EB` or `--accent-primary`
- Never mix icon styles (no mixing filled + outline)
- No emojis in UI

---

## Glass / Blur (Optional, Use Sparingly)

```css
backdrop-filter: blur(10px);
background: rgba(17, 24, 39, 0.6);
border: 1px solid rgba(255, 255, 255, 0.06);
```

- Max 1–2 glassmorphism elements per page
- Always pair with a border so it reads as a surface
- Not for primary containers — only modals, dropdowns, or floating panels

---

## Tailwind Mapping Reference

| Token            | Tailwind Class           |
|------------------|--------------------------|
| `--bg-primary`   | `bg-[#0B0F19]`           |
| `--bg-secondary` | `bg-gray-900`            |
| `--bg-tertiary`  | `bg-gray-800`            |
| `--text-primary` | `text-gray-200`          |
| `--text-secondary`| `text-gray-400`         |
| `--accent-primary`| `bg-indigo-600`         |
| Card radius      | `rounded-2xl`            |
| Button radius    | `rounded-xl`             |
| Border           | `border border-gray-800` |

---

## Hard Rules — Never Violate

1. No bright gradients (`from-purple-500 to-pink-500` type) as decorative backgrounds
2. No glow / drop-shadow effects on text
3. No emojis in any component
4. No inconsistent spacing (random px values)
5. No more than 3 colors in active use per screen
6. No overly symmetrical "template" layouts — introduce slight asymmetry
7. No auto-animated looping elements unless user-triggered
