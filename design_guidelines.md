# Virtual Outfit Try-On Application - Design Guidelines

## Design Approach

**Selected Framework**: Modern AI Tool Aesthetic  
Drawing inspiration from Midjourney, RunwayML, and Notion for clean, functional interfaces that prioritize the AI-generated content while maintaining professional credibility.

**Core Principle**: Showcase the AI output as the hero, with controls that feel intuitive but unobtrusive.

---

## Layout System

### Three-Panel Structure
- **Left Panel** (320px fixed): Input controls and image upload
- **Center Panel** (flex-grow): Primary preview area for generated images
- **Right Panel** (280px fixed): Clothing selection interface

**Responsive Behavior**:
- Desktop (≥1280px): Full three-panel layout
- Tablet (768px-1279px): Stack right panel below center, left remains sidebar
- Mobile (<768px): Full vertical stack - left controls → preview → selections

**Spacing Foundation**: Use Tailwind units of **2, 4, 6, 8, 12, 16** for consistent rhythm throughout the application.

---

## Typography

**Primary Font**: Inter (Google Fonts)  
**Accent Font**: Space Grotesk (for headings/labels)

**Hierarchy**:
- Page Title: 2xl, semibold
- Section Headers: lg, semibold  
- Labels: sm, medium
- Body Text: base, regular
- Helper Text: sm, regular
- Button Text: sm, semibold

---

## Component Library

### Image Upload Zone
- Large dropzone area with dashed border (border-2 border-dashed)
- Icon: Upload cloud icon (Heroicons) at 48px
- Text hierarchy: Main instruction + supported formats below
- Drag-over state: Slightly elevated appearance
- Uploaded preview: Rounded corners (rounded-lg), max height 400px

### Clothing Selectors
- Card-based layout for each clothing category
- Each card contains:
  - Category label (semibold)
  - Type dropdown (full width)
  - Color picker button (40px height, rounded-md)
- Stack vertically with gap-4 spacing
- Cards use subtle background separation

### Color Picker Integration
- Display selected color as a colored square (32px × 32px, rounded)
- Label showing hex/color name below
- Click to open react-color picker in modal overlay

### Action Buttons
**Primary CTA** ("Generate Outfit Preview"):
- Full width in left panel
- Height: h-12
- Rounded: rounded-lg
- Prominent visual weight

**Secondary Actions** (Re-generate, Download, Clear):
- Inline horizontal group
- Height: h-10
- Rounded: rounded-md
- Icons from Heroicons (Download, RefreshCW, X)

### Preview Area (Center Panel)
**Before/After Layout**:
- Side-by-side comparison when both images exist
- Grid: grid-cols-1 lg:grid-cols-2, gap-6
- Each image container:
  - Label above ("Original" / "Try-On Result")
  - Rounded corners (rounded-lg)
  - Subtle shadow for depth
  - Aspect ratio maintained
  - Max width constraints for large images

**Loading State**:
- Centered spinner (48px)
- Loading text below spinner
- Semi-transparent overlay on center panel
- Processing message: "AI is generating your outfit..."

### Error Messages
- Toast-style notifications (top-right corner)
- Icon + message + dismiss button
- Auto-dismiss after 5 seconds
- Different visual treatments for error vs. success

---

## Container & Spacing

**Main Container**:
- Full viewport height (h-screen)
- Flex layout for three panels
- No internal scrolling on desktop (panels scroll independently)

**Panel Padding**:
- Left Panel: p-6
- Center Panel: p-8
- Right Panel: p-6

**Section Spacing**:
- Between clothing category cards: gap-4
- Between buttons: gap-3
- Form field spacing: space-y-3

---

## Interaction Patterns

### Upload Flow
1. Empty state: Prominent dropzone with clear instructions
2. Hover state: Visual feedback indicating drop capability
3. Uploading: Progress indicator
4. Uploaded: Show thumbnail with remove option

### Generation Flow
1. Button disabled until image + at least one clothing item selected
2. Click triggers loading overlay on center panel
3. Success: Fade-in generated image with subtle animation
4. Error: Toast notification + maintain previous state

### Image Preview
- Click to view full-resolution modal
- Download button overlays bottom-right of preview
- Zoom functionality on hover (optional enhancement)

---

## Visual Hierarchy & Focus

**Primary Focus**: Generated AI image in center panel  
**Secondary Focus**: Upload zone and Generate button  
**Tertiary**: Clothing selectors and secondary actions

Use visual weight (size, spacing, prominence) to guide users through the natural flow: Upload → Select → Generate → Preview → Download

---

## Accessibility

- All interactive elements minimum 44px touch target
- Focus indicators on all form controls
- Alt text for all images
- Keyboard navigation through clothing selectors
- Error messages announced to screen readers
- Loading states communicated via aria-live regions

---

## Key UI States

1. **Initial/Empty**: Clear call-to-action to upload image
2. **Image Uploaded**: Enable clothing selectors, highlight Generate button
3. **Generating**: Loading overlay, disable all inputs
4. **Result Ready**: Show both images, enable download/regenerate
5. **Error**: Clear error message, maintain previous valid state

---

This design creates a professional, focused environment where the AI-generated content takes center stage while providing intuitive, accessible controls for customization.