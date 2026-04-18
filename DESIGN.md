# Design Brief

**Tone**: Cosmic explorer — premium tech with invisible UI, letting the 3D solar system dominate visual attention. Clean, minimal, immersive. **Purpose**: Visualize celestial mechanics in real-time; UI is purely functional and secondary.

## Color Palette

| Token | OKLCH | Usage |
|-------|-------|-------|
| **background** | `0.08 0 0` | Deep space black; primary surface |
| **card / popover** | `0.12 0.005 264` | Subtle deep-blue tint for floating panels |
| **foreground** | `0.92 0 0` | Off-white text on dark backgrounds |
| **primary** | `0.58 0.21 264` | Cyan accent; UI controls, button hovers, rings |
| **accent** | `0.68 0.23 45` | Gold/warm accent; sparingly used for highlights, selected states |
| **secondary** | `0.18 0.01 264` | Muted blue for secondary UI elements |
| **border** | `0.2 0.01 264` | Subtle dividers and outlines; barely visible |
| **muted** | `0.2 0.01 264` | Placeholder text, inactive states |
| **destructive** | `0.6 0.21 14` | Red-orange for danger actions |

## Typography

| Layer | Font | Size | Weight | Usage |
|-------|------|------|--------|-------|
| **Display** | General Sans | 28–48px | 600–700 | Headings, planet labels, hero text |
| **Body** | DM Sans | 14–16px | 400–500 | Control labels, info text, descriptions |
| **Mono** | Geist Mono | 12–14px | 400–500 | Data display, coordinates, speeds, technical info |

## Structural Zones

| Zone | Background | Border | Treatment |
|------|------------|--------|-----------|
| **Canvas (3D Scene)** | `background` (deep black) | none | Full viewport, borderless |
| **Header Controls** | glassmorphism overlay | `border / 30%` opacity | Top-right floating panel, subtle blur effect |
| **Info Display (Bottom)** | glassmorphism overlay | `border / 30%` opacity | Bottom-left or center; shows selected body name & data |
| **Orbit Controls** | glassmorphism overlay | `border / 30%` opacity | Floating panel with camera, speed, toggles |
| **Tooltips / Labels** | `popover` | `border / 50%` opacity | Appear on hover; fade in/out smoothly |

## Visual Language

- **Glassmorphism**: All UI overlays use frosted glass effect (`backdrop-filter: blur(8px)`); 80% opacity cards with subtle cyan border
- **Elevation**: Single depth via shadow, not stacking; `space-glow` for subtle cyan glow around interactive elements
- **Spacing**: 12px grid; compact controls to minimize visual noise
- **Corners**: `rounded-sm` (3px) for consistency; slight softness without excess roundness
- **Motion**: Smooth easing for all transitions (`cubic-bezier(0.4, 0, 0.2, 1)`); floating animations for UI elements; 300ms default duration
- **Icons**: Stroke-based, minimal line weight; aligned to 24px grid
- **Interactions**: Hover states use primary cyan glow; active states use gold accent; disabled states use muted color

## Motion Choreography

1. **Scene Entry**: 3D solar system fades in on page load (`fade-in` animation, 400ms)
2. **UI Float**: Control panels gently float up/down (`space-float`, 3s loop, -4px offset)
3. **Label Hover**: Labels pulse gently (`glow-pulse`, 2.5s infinite)
4. **Button Feedback**: Toggle buttons highlight with cyan border + glow on interaction
5. **Camera Animation**: Smooth orbit controls with easing; instant zoom via scroll

## Component Patterns

- **Button**: `bg-primary/10` with `border border-primary` on default; `bg-primary text-primary-foreground` on active; `space-glow` shadow on hover
- **Toggle**: Icon-based; cyan glow when active; muted when inactive
- **Slider**: Horizontal track (`bg-muted`), cyan thumb with `space-glow`
- **Label**: `text-foreground/80`, rotated text for orbit paths; `text-accent` for emphasized labels
- **Info Card**: `glassmorphism` class for frosted glass; `border-l border-primary/50` left accent bar
- **Input**: `bg-input border-border` focus ring uses `ring ring-primary`

## Constraints

- **No full-page gradients**: Maintain focus on 3D scene
- **Minimal text**: Use icons + data; reduce cognitive load
- **Sparse accentuation**: Cyan only for interactive states; gold only for highlights
- **Fade, not pop**: All animations use easing; no abrupt transitions
- **Fixed panel positions**: Avoid floating elements that obscure the scene; dock to corners
- **High contrast for labels**: Ensure all text over space background meets AA+ standard

## Signature Detail

Glassmorphic control panels with cyber-cyan glow effects create a "commander console" feel — professional, futuristic, minimal. The subtle blur effect and low-opacity backgrounds create visual separation without harsh borders, maintaining immersion in the 3D scene while providing clear controls.

