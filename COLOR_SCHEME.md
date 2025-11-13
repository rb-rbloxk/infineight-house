# Color Scheme Reference

## Main Color Palette

### Background & Base Colors
- **Background**: `hsl(40, 20%, 95%)` = `#f6f4f0` (Light beige/cream)
- **Foreground**: `hsl(0, 0%, 13%)` = `#222222` (Dark gray text)
- **Card**: `hsl(40, 20%, 97%)` = Slightly lighter than background for cards
- **Card Foreground**: `hsl(0, 0%, 13%)` = `#222222` (Dark text)

### Primary Colors
- **Primary**: `hsl(45, 100%, 70%)` = Adjusted cream/beige for better contrast on light background
- **Primary Foreground**: `hsl(0, 0%, 13%)` = `#222222` (Dark text on primary)

### Secondary Colors
- **Secondary**: `hsl(40, 15%, 90%)` = Slightly darker than background
- **Secondary Foreground**: `hsl(0, 0%, 13%)` = `#222222` (Dark text)

### Muted Colors
- **Muted**: `hsl(40, 10%, 92%)` = Subtle muted background
- **Muted Foreground**: `hsl(0, 0%, 45%)` = `#737373` (Muted dark gray for secondary text)

### Accent Colors
- **Accent**: `hsl(45, 100%, 85%)` = Light accent color
- **Accent Foreground**: `hsl(0, 0%, 13%)` = `#222222` (Dark text)

### UI Element Colors
- **Border**: `hsl(0, 0%, 80%)` = `#CCCCCC` (Light gray borders for visibility on light background)
- **Input**: `hsl(40, 20%, 98%)` = Very light input background
- **Ring**: `hsl(45, 100%, 70%)` = Focus ring color - matches primary

### Destructive/Action Colors
- **Destructive**: `hsl(0, 84.2%, 60.2%)` = `#EF4444` (Red for errors/delete actions)
- **Destructive Foreground**: `hsl(0, 0%, 98%)` = `#FAFAFA` (Light text on destructive)

### Popover Colors
- **Popover**: `hsl(40, 20%, 97%)` = Same as card
- **Popover Foreground**: `hsl(0, 0%, 13%)` = `#222222` (Dark text)

### Chart Colors (for data visualization)
- **Chart 1**: `hsl(12, 76%, 61%)` = `#F87171` (Coral red)
- **Chart 2**: `hsl(173, 58%, 39%)` = `#14B8A6` (Teal)
- **Chart 3**: `hsl(197, 37%, 24%)` = `#1E3A5F` (Dark blue)
- **Chart 4**: `hsl(43, 74%, 66%)` = `#FCD34D` (Yellow)
- **Chart 5**: `hsl(27, 87%, 67%)` = `#FB923C` (Orange)

## Theme Configuration

### Current Theme
- **Mode**: Light theme with warm beige background
- **Base**: Light beige background (`#f6f4f0`)
- **Text**: Dark gray (`#222222`) for excellent readability
- **Accent**: Cream/beige tones for highlights and primary elements
- **Typography**: Lexend font family
- **Shadows**: Subtle shadows for depth and elevation

### Color Usage
- **Background**: Main page background (`#f6f4f0`)
- **Primary**: Headings, buttons, links, and important UI elements
- **Foreground**: Main text color (`#222222`)
- **Muted Foreground**: Secondary text, descriptions (`#737373`)
- **Border**: Card borders, input borders, dividers (`#CCCCCC`)
- **Destructive**: Error messages, delete buttons, warning states

### Shadow Utilities
- **shadow-subtle**: Light shadow for cards and elevated elements
- **shadow-subtle-md**: Medium shadow for hover states
- **shadow-subtle-lg**: Large shadow for prominent elements

## Product Colors (from customize page)
- White: `#FFFFFF`
- Black: `#000000`
- Navy Blue: `#1E3A8A`
- Forest Green: `#047857`
- Burgundy: `#7F1D1D`
- Royal Purple: `#6B21A8`
- Charcoal: `#374151`
- Heather Grey: `#9CA3AF`

## Gradient Colors (used in hero sections)
- Blue to Purple: `from-blue-500 to-purple-600`
- Green to Teal: `from-green-500 to-teal-600`
- Orange to Red: `from-orange-500 to-red-600`

## Border Radius
- **Base Radius**: `0.5rem` (8px)
- **Large**: `var(--radius)` = 8px
- **Medium**: `calc(var(--radius) - 2px)` = 6px
- **Small**: `calc(var(--radius) - 4px)` = 4px

