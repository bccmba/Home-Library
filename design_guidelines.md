# My Home Library - Design Guidelines

## Architecture Decisions

### Authentication
**No Auth Required** - This is a single-user, local-first utility app for personal book cataloging.

However, include a **Profile/Settings screen** with:
- User-customizable avatar (generate 3 preset book-themed avatars: person reading, bookworm character, stack of books silhouette)
- Display name field (default: "My Library")
- App preferences:
  - Camera permissions status
  - Storage usage indicator
  - Export backup option
  - Clear all data (with double confirmation)

### Navigation Structure
**Tab Navigation** (3 tabs with center action button):
1. **Library** (left tab) - Browse all shelves and books
2. **Scan** (center tab) - Core action, prominent
3. **Profile** (right tab) - Settings and user info

**Information Architecture:**
- Library Stack: Shelves List → Shelf Detail → Book Detail
- Scan Stack: Camera Scanner → Book Preview → Select Shelf
- Profile Stack: Settings → About/Help

## Screen Specifications

### 1. Library Home Screen
**Purpose:** Browse all virtual bookshelves and access books quickly

**Layout:**
- Header: Custom, transparent background
  - Title: "My Library" (large, bold)
  - Right button: Search icon (for future filtering)
  - No left button
- Main content: Scrollable view
  - Top section: Stats card (total books, total shelves, recently added count)
  - Shelf cards in vertical list, each showing:
    - Shelf name and book count
    - Horizontal scrolling preview of first 5 book covers
    - Arrow/chevron to view full shelf
- Safe area insets: top = headerHeight + Spacing.xl, bottom = tabBarHeight + Spacing.xl

**Components:**
- Stat cards with book count highlights
- Shelf preview cards with horizontal scrolling cover thumbnails
- Empty state illustration when no shelves exist ("Scan your first book!")

### 2. Shelf Detail Screen
**Purpose:** View all books on a specific shelf in Netflix-style grid

**Layout:**
- Header: Default navigation with transparent background
  - Left: Back button
  - Title: Shelf name (e.g., "Kids Room")
  - Right: Edit shelf button (rename/delete)
- Main content: Scrollable grid
  - Responsive grid (2 columns on phone, 3 on tablet) of book covers
  - Cover aspect ratio: 2:3 (standard book proportion)
  - Cards have subtle shadow and rounded corners
- Safe area insets: top = headerHeight + Spacing.xl, bottom = tabBarHeight + Spacing.xl

**Components:**
- Grid of book cover cards
- Empty state for shelves with no books ("Tap Scan to add books here")

### 3. Scan Screen
**Purpose:** Launch camera to scan book barcodes instantly

**Layout:**
- No header (full-screen camera)
- Main content: Camera view with overlay
  - Center: Barcode scanning reticle/frame
  - Top overlay: "Position barcode within frame" instruction text
  - Bottom overlay: "Cancel" button
- Safe area insets: Camera fills entire screen, overlay elements respect top = insets.top + Spacing.xl, bottom = insets.bottom + Spacing.xl

**Components:**
- Full-screen camera component
- Semi-transparent overlay with scanning frame
- Cancel button (bottom center)

### 4. Book Preview Screen (Modal)
**Purpose:** Show fetched book info before adding to shelf

**Layout:**
- Native modal presentation
- Header: Custom
  - Left: "Cancel" text button
  - Title: "Add Book"
  - Right: Empty
- Main content: Scrollable form
  - Book cover (large, centered, 200x300pt)
  - Title (H2, bold)
  - Authors (subtitle, gray)
  - Page count & published year (small text)
  - Shelf picker (dropdown/selector)
  - "Create New Shelf" button
  - Notes field (multiline text input, optional, placeholder: "Personal notes...")
  - Submit button: "Add to Library" (bottom of form, full width, primary color)
- Safe area insets: top = Spacing.xl, bottom = insets.bottom + Spacing.xl

**Components:**
- Cover image with loading state
- Form fields with labels
- Shelf selector with modal picker
- Large primary action button

### 5. Book Detail Screen
**Purpose:** View full book information and edit notes/shelf

**Layout:**
- Header: Default navigation, transparent
  - Left: Back button
  - Right: "Edit" button
- Main content: Scrollable view
  - Hero section: Book cover (large) + gradient overlay
  - White content card overlapping hero:
    - Title and authors
    - Metadata (ISBN, pages, year)
    - Current shelf (tappable to change)
    - Notes section (expandable text)
    - "Remove from Library" button (destructive, at bottom)
- Safe area insets: top = headerHeight + Spacing.xl, bottom = tabBarHeight + Spacing.xl

**Components:**
- Hero image with gradient
- Info cards with icons
- Editable notes field
- Destructive action button

### 6. Profile/Settings Screen
**Purpose:** Manage user preferences and app settings

**Layout:**
- Header: Default, transparent
  - Title: "Profile"
- Main content: Scrollable list
  - Profile section:
    - Avatar (centered, 80pt diameter, tappable)
    - Display name (centered below avatar)
  - Settings grouped list:
    - Storage (with used space indicator)
    - Export backup
    - Help & About
    - Clear all data (nested, red text)
- Safe area insets: top = headerHeight + Spacing.xl, bottom = tabBarHeight + Spacing.xl

**Components:**
- Avatar selector modal
- Grouped list with section headers
- Destructive action in nested screen

## Design System

### Color Palette
**Primary:** Warm Brown (#8B4513) - evokes wood bookcases
**Secondary:** Cream (#F5F5DC) - like aged book pages
**Accent:** Deep Teal (#2C5F5F) - for interactive elements
**Neutrals:**
- Gray 900 (#1A1A1A) - text primary
- Gray 600 (#666666) - text secondary
- Gray 200 (#E5E5E5) - borders/dividers
- White (#FFFFFF) - backgrounds
**Functional:**
- Success: Forest Green (#2D5016)
- Destructive: Dark Red (#B22222)

### Typography
**System Font:** San Francisco (iOS) / Roboto (Android)
- H1: 32pt, Bold - Screen titles
- H2: 24pt, Semibold - Book titles
- Body: 16pt, Regular - Main content
- Caption: 14pt, Regular - Metadata
- Small: 12pt, Regular - Helper text

### Visual Design Rules
1. **Book Covers:** Always maintain 2:3 aspect ratio, rounded corners (8pt radius), subtle drop shadow
2. **Cards:** 16pt border radius, light background, 1pt border in Gray 200
3. **Touchable Feedback:** Scale to 0.95 on press for cards and buttons
4. **Icons:** Use Feather icons from @expo/vector-icons, 24pt default size
5. **Spacing Scale:** xs=4, sm=8, md=12, lg=16, xl=24, xxl=32
6. **Tab Bar:** Use custom icons for Library (book-open), Scan (camera), Profile (user)
7. **Floating Elements:** Scan button in tab bar should have primary color background with subtle shadow (shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.10, shadowRadius: 2)

### Critical Assets
Generate these custom illustrations/icons:
1. **Empty State Illustrations:**
   - No shelves: Open book with sparkles (welcoming, warm colors)
   - No books on shelf: Empty bookcase sketch (line art, brown tones)
2. **Profile Avatars (3 presets):**
   - Avatar 1: Person reading silhouette (warm brown)
   - Avatar 2: Stack of books icon (illustrated, colorful spines)
   - Avatar 3: Bookworm character (cute, friendly)
3. **Scan Reticle:** Custom barcode frame overlay (white with corners, 280x160pt)

### Interaction Design
- **Scan Success:** Haptic feedback + brief green flash around reticle
- **Add Book:** Smooth modal slide-up with spring animation
- **Shelf Selection:** Bottom sheet modal for picker
- **Book Cover Tap:** Hero animation scaling cover to full detail view
- **Pull-to-Refresh:** Custom refresh control on Library and Shelf screens

### Accessibility
- All book covers must have alt text: "[Title] by [Author]"
- Minimum touch target: 44x44pt for all interactive elements
- Color contrast ratio: 4.5:1 for all text
- Camera permission: Clear explanation modal before first scan
- VoiceOver labels for all icons and actions