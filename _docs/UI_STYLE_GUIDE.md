# TravelAgentic UI Style Guide

## Brand Identity

### Brand Name

**TravelAgentic** - AI-powered vacation planning platform

### Logo

- Full "TravelAgentic" text logo for desktop headers
- Color: Blue (#2563eb / bg-blue-600)

## Color Palette

### Primary Colors

- **Primary Blue**: `#2563eb` (`bg-blue-600`, `text-blue-600`)
- **Primary Blue Hover**: `#1d4ed8` (`bg-blue-700`, `hover:bg-blue-700`)
- **Light Blue**: `#dbeafe` (`bg-blue-50`)
- **Blue Ring**: `ring-blue-500` (for selected states)

### Neutral Colors

- **White**: `#ffffff` (`bg-white`)
- **Light Gray**: `#f9fafb` (`bg-gray-50`)
- **Medium Gray**: `#6b7280` (`text-gray-500`, `text-gray-600`)
- **Dark Gray**: `#374151` (`text-gray-700`)
- **Darker Gray**: `#1f2937` (`text-gray-800`)
- **Darkest Gray**: `#111827` (`text-gray-900`)

### Accent Colors

- **Yellow**: `#eab308` (`text-yellow-500`) - for stars, celebrations
- **Red**: `#ef4444` (`text-red-500`) - for hearts, alerts
- **Green**: `#10b981` (`text-green-600`) - for success states
- **Purple**: `#8b5cf6` (`to-purple-600`) - for gradients

## Typography

### Font Family

- **Primary**: Inter font family
- **Weights**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)
- **Import**: `import { Inter } from 'next/font/google'`

### Text Sizes

- **Hero Title**: `text-3xl` (desktop), `text-2xl` (mobile)
- **Page Title**: `text-2xl`
- **Section Title**: `text-xl`
- **Card Title**: `text-lg font-semibold`
- **Body Text**: `text-base` (default)
- **Small Text**: `text-sm`
- **Extra Small**: `text-xs`

### Text Colors

- **Primary Text**: `text-gray-900`
- **Secondary Text**: `text-gray-600`
- **Muted Text**: `text-gray-500`
- **Light Text**: `text-gray-400`
- **White Text**: `text-white`

## Layout & Spacing

### Container Widths

- **Full Width**: `w-full`
- **Max Content Width**: `max-w-4xl` (for main forms)
- **Card Max Width**: `max-w-md` (for login/signup)
- **Chat Panel**: `w-96` (384px fixed width)

### Padding & Margins

- **Page Padding**: `p-6` (desktop), `p-4` (mobile)
- **Card Padding**: `p-4` to `p-6`
- **Button Padding**: `px-8 py-3` (large), `px-4 py-2` (medium)
- **Section Margins**: `mb-6`, `mb-8`
- **Element Gaps**: `gap-2`, `gap-3`, `gap-4`

### Grid & Flexbox

- **Activity Grid**: `grid-cols-2 lg:grid-cols-4`
- **Hotel Grid**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- **Form Layout**: `flex items-end gap-2` (horizontal inputs)
- **Center Content**: `flex items-center justify-center`

## Components

### Buttons

#### Primary Button

```tsx
<Button className="bg-blue-600 hover:bg-blue-700 text-white">
Primary Action
</Button>
```

#### Secondary Button

```tsx
<Button variant="outline" className="border-gray-400 bg-transparent">
Secondary Action
</Button>
```

#### Large Button

```tsx
<Button className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6">
Large Action
</Button>
```

### Cards

#### Standard Card

```tsx
<Card className="hover:shadow-lg transition-shadow">
<CardContent className="p-4">
{/* Content */}
</CardContent>
</Card>
```

#### Selected Card

```tsx
<Card className="ring-2 ring-blue-500 bg-blue-50">
{/* Selected state styling */}
</Card>
```

### Form Elements

#### Input Field

```tsx
<Input 
  className="h-12 w-full" 
  placeholder="Enter text..."
/>
```

#### Input with Icon Label

```tsx
<Label className="flex items-center gap-2 text-sm font-medium">
<Icon size={16} />
Label Text
</Label>
```

#### Popover Trigger Button

```tsx
<Button
variant="outline"
className="w-full justify-start text-left font-normal bg-transparent border border-gray-400"

>   <Icon className="mr-2 h-4 w-4" />
>   {displayText}
> </Button>
> ```

### Loading States

#### Sparkle Loading Icon

```tsx
<Sparkles className="w-4 h-4 animate-pulse text-blue-500" />
```

#### Spinner Loading

```tsx
<Loader2 className="w-6 h-6 animate-spin mr-2" />
```

#### Thinking Process Display

```tsx

<div className="space-y-3">
  {thoughts.map((thought, index) => (
    <div key={index} className="flex items-start gap-3 text-sm text-gray-600">
      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
      <p>{thought}</p>
    </div>
  ))}
</div>
```

## Responsive Design

### Breakpoints

- **Mobile**: Default (< 768px)
- **Tablet**: `md:` (768px+)
- **Desktop**: `lg:` (1024px+)

### Mobile-First Patterns

```tsx
// Mobile: single column, Desktop: multiple columns
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"

// Mobile: full width, Desktop: fixed width
className="w-full lg:w-96"

// Mobile: small text, Desktop: larger text
className="text-sm md:text-base lg:text-lg"
```

### Mobile Navigation

- Collapsible chat interface
- Tab navigation with icons for mobile
- Simplified headers with essential actions only

## Background & Visual Effects

### Background Images

```tsx
// Slideshow background with opacity

<div 
  className="absolute inset-0 bg-cover bg-center opacity-60"
  style={{ backgroundImage: `url(${imageUrl})` }}
/>
<div className="absolute inset-0 bg-black/20" />
```

### Glass Morphism Effect

```tsx
className="bg-white/75 backdrop-blur-sm"
```

### Transitions

```tsx
// Standard hover transition
className="transition-all hover:shadow-lg"

// Opacity transition for slideshow
className="transition-opacity duration-[3000ms] ease-in-out"

// Transform transition for mobile panels
className="transition-transform"
```

## Icons

### Icon Library

- **Lucide React** for all icons
- Standard size: `size={16}` for labels, `size={20}` for buttons
- Consistent usage across components

### Common Icons

- **Plane**: Travel/flights (`<Plane size={16} />`)
- **Users**: Travelers (`<Users size={16} />`)
- **Calendar**: Dates (`<CalendarIcon size={16} />`)
- **Star**: Ratings (`<Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />`)
- **Sparkles**: Loading/AI (`<Sparkles className="w-4 h-4 animate-pulse text-blue-500" />`)

## Animations

### Loading Animations

```tsx
// Pulse animation for loading states
className="animate-pulse"

// Spin animation for loaders
className="animate-spin"
```

### Celebration Effects

```tsx
// Confetti animation (CSS keyframes)
@keyframes confetti-fall {
0% {
transform: translateY(-10px) rotate(0deg);
opacity: 1;
}
100% {
transform: translateY(100vh) rotate(720deg);
opacity: 0;
}
}
```

## Accessibility

### ARIA Labels

```tsx
// Live regions for dynamic content

<div aria-live="polite" aria-atomic="true">
  {dynamicContent}
</div>

// Button states
<Button aria-pressed={isSelected}>
Toggle Button
</Button>
```

### Semantic HTML

- Use proper heading hierarchy (`h1`, `h2`, `h3`)
- Form labels associated with inputs
- Alt text for all images
- Screen reader only text: `className="sr-only"`

## State Management Patterns

### Loading States

```tsx
const [isLoading, setIsLoading] = useState(false)
const [data, setData] = useState([])

// Show loading UI while fetching
{isLoading ? <LoadingComponent /> : <DataComponent data={data} />}
```

### Selection States

```tsx
const [selectedItems, setSelectedItems] = useState<string[]>([])

const handleSelect = (id: string) => {
setSelectedItems(prev =>
prev.includes(id)
? prev.filter(item => item !== id)
: [...prev, id]
)
}
```

## File Organization

### Component Structure

```
components/
├── ui/ # shadcn/ui components
├── chat-interface.tsx # Feature components
├── travel-input-form.tsx
├── hotel-card.tsx
├── activity-card.tsx
└── flight-card.tsx

app/
├── page.tsx # Main application
├── login/page.tsx # Auth pages
└── signup/page.tsx

lib/
├── mock-data.ts # Data types and mock data
└── api.ts # API functions
```

### Import Patterns

```tsx
// UI components
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

// Custom components
import { ChatInterface } from "@/components/chat-interface"

// Icons
import { Plane, Users, Calendar } from 'lucide-react'

// Utilities
import { format } from "date-fns"
import { Inter } from 'next/font/google'
```

## Best Practices

### Performance

- Use `useCallback` for event handlers in frequently re-rendered components
- Implement proper loading states for async operations
- Optimize images with proper sizing and lazy loading

### User Experience

- Provide immediate feedback for user actions
- Use consistent spacing and alignment
- Implement proper error states and empty states
- Ensure touch targets are at least 44px for mobile

### Code Quality

- Use TypeScript for type safety
- Implement proper error boundaries
- Use consistent naming conventions
- Comment complex logic and business rules

This style guide should help maintain consistency when developing outside of v0. Keep it updated as the design system evolves!
