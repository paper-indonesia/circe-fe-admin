# Phase 1: Frontend Specification (PRD)

## Overview

This guide provides prompt templates and strategies for creating **Frontend-focused Product Requirements Documents (PRDs)** that complement the standard PRDs from [Circe Lessons Phase 1](https://github.com/paper-indonesia/circe-lessons/tree/main/01_Specify).

While backend PRDs focus on API contracts and data models, Frontend PRDs emphasize **UI components, user interactions, visual design, and responsive behavior**.

---

## Table of Contents

1. [Frontend PRD Structure](#frontend-prd-structure)
2. [Key Differences from Backend PRDs](#key-differences-from-backend-prd)
3. [Prompt Templates](#prompt-templates)
4. [Frontend-Specific Sections](#frontend-specific-sections)
5. [Examples from Admin Beauty Clinic](#examples-from-admin-beauty-clinic)
6. [Best Practices](#best-practices)

---

## Frontend PRD Structure

### Standard PRD Sections (from Circe Lessons)
- Problem Statement
- Target Users
- Functional Requirements
- Non-Functional Requirements
- Success Metrics
- API Contracts

### Additional Frontend Sections
- **UI/UX Requirements** ⭐ NEW
- **Component Hierarchy** ⭐ NEW
- **Design System Alignment** ⭐ NEW
- **Responsive Behavior** ⭐ NEW
- **Accessibility Requirements** ⭐ NEW
- **UI States (Loading, Error, Empty)** ⭐ NEW
- **Design References** ⭐ NEW

---

## Key Differences from Backend PRD

| Aspect | Backend PRD | Frontend PRD |
|--------|-------------|--------------|
| **Focus** | Data models, business logic | UI components, user interactions |
| **Requirements** | API endpoints, database schemas | Layouts, forms, modals, tables |
| **Validation** | Input validation, error codes | Form validation, inline errors |
| **States** | Request/response status | Loading skeletons, error alerts, empty states |
| **Testing** | Unit tests, integration tests | Visual regression, accessibility tests |
| **Dependencies** | External APIs, databases | Design system, component library, fonts |
| **Documentation** | API specs (OpenAPI) | Component specs, design tokens |

---

## Prompt Templates

### Template 1: UI-Focused PRD from User Stories

```
Create a Frontend PRD for [FEATURE_NAME] based on these user stories:

[Paste user stories or research findings]

The PRD should include:

1. **Problem Statement**:
   - What UI/UX problem are we solving?
   - What pain points exist in the current interface?

2. **Target Users**:
   - User personas with UI preferences
   - Device usage patterns (mobile, tablet, desktop)

3. **UI/UX Requirements**:
   - List all visual components needed (buttons, forms, tables, modals)
   - Describe layouts and page structures
   - Specify interactions (click, hover, drag, scroll)
   - Define navigation flow

4. **Component Hierarchy**:
   - Break down UI into components (Atomic Design pattern)
   - Atoms: buttons, inputs, icons
   - Molecules: search bar, form field, table row
   - Organisms: data table, create modal, navigation sidebar

5. **Responsive Behavior**:
   - Mobile (< 768px): [describe layout]
   - Tablet (768-1024px): [describe layout]
   - Desktop (> 1024px): [describe layout]

6. **UI States**:
   - Loading state: skeleton screens or spinners
   - Error state: error messages with retry actions
   - Empty state: helpful messages with CTAs
   - Success state: main interface

7. **Accessibility**:
   - Keyboard navigation requirements
   - Screen reader support (ARIA labels)
   - Focus indicators
   - Color contrast requirements (WCAG AA)

8. **Design References**:
   - Link to design mockups or screenshots
   - Reference similar UIs (e.g., "similar to Stripe dashboard")

9. **API Integration**:
   - List API endpoints this UI will consume
   - Define request/response handling in UI

10. **Success Metrics**:
    - Page load time < 2s
    - Lighthouse accessibility score > 95
    - Mobile responsiveness 100%

Format as a comprehensive markdown document with clear sections.
```

**Use Case**: When starting from user stories or feature requests and need complete UI specification.

---

### Template 2: Component-Centric PRD

```
Create a Frontend PRD for implementing a [COMPONENT_NAME] component.

Context:
- Technology: [Next.js/React/Vue]
- Component Library: [shadcn/ui / MUI / custom]
- Design System: [link or description]

Structure the PRD as follows:

1. **Component Purpose**:
   - What does this component do?
   - Where is it used in the app?

2. **Visual Specification**:
   - Layout (flex, grid, absolute)
   - Spacing (padding, margin, gap)
   - Colors (background, text, border)
   - Typography (font size, weight, line height)
   - Shadows and borders

3. **Props Interface**:
   ```typescript
   interface [ComponentName]Props {
     // Define all props with types
   }
   ```

4. **States & Variants**:
   - Default state
   - Hover state
   - Focus state
   - Disabled state
   - Loading state
   - Error state

5. **Interactions**:
   - Click behavior
   - Keyboard support (Enter, Escape, Tab)
   - Touch gestures (if mobile)

6. **Accessibility**:
   - ARIA attributes needed
   - Keyboard navigation
   - Screen reader announcements

7. **Responsive Behavior**:
   - Mobile adjustments
   - Tablet adjustments
   - Desktop version

8. **Dependencies**:
   - External libraries needed
   - shadcn/ui components to install
   - Icons required

9. **Example Usage**:
   ```tsx
   <ComponentName
     prop1="value"
     prop2={true}
   />
   ```

Provide a complete, implementable specification.
```

**Use Case**: When building a specific reusable component and need detailed specs.

---

### Template 3: Form-Focused PRD

```
Create a Frontend PRD for a [FORM_NAME] form with validation.

Design references: [attach screenshots or links]

Include these sections:

1. **Form Purpose**:
   - What data are we collecting?
   - What happens on successful submission?

2. **Form Fields**:
   For each field, specify:
   - Field name
   - Field type (text, email, select, date, etc.)
   - Label text
   - Placeholder text
   - Required or optional
   - Validation rules
   - Error messages

   Example:
   | Field | Type | Required | Validation | Error Message |
   |-------|------|----------|------------|---------------|
   | Email | email | Yes | Valid email format | "Please enter a valid email" |
   | Password | password | Yes | Min 8 chars, 1 uppercase, 1 number | "Password must be at least 8 characters with 1 uppercase and 1 number" |

3. **Validation Strategy**:
   - Client-side: [Zod / Yup / Joi schema]
   - When to validate: [onChange / onBlur / onSubmit]
   - Error display: [inline below field / toast / modal]

4. **Layout**:
   - Single column or multi-column
   - Field grouping (sections)
   - Responsive behavior

5. **Submit Flow**:
   - Button text (e.g., "Create Account", "Save Changes")
   - Loading state (disable button, show spinner)
   - Success state (close modal, show toast, redirect)
   - Error state (display error message, keep form open)

6. **API Integration**:
   - Endpoint: POST /api/[resource]
   - Request body mapping
   - Response handling

7. **Accessibility**:
   - Labels associated with inputs (for/id)
   - Error announcements (aria-live)
   - Field descriptions (aria-describedby)

8. **TypeScript Interfaces**:
   ```typescript
   interface FormData {
     // Define form shape
   }

   interface FormErrors {
     // Define error shape
   }
   ```

Provide complete validation schema and error messages.
```

**Use Case**: When building forms with complex validation requirements.

---

### Template 4: Data Display PRD (Tables, Lists, Cards)

```
Create a Frontend PRD for displaying [DATA_TYPE] in a [table/list/grid].

Data source: [API endpoint or mock data structure]

Include:

1. **Data Display Requirements**:
   - What data fields to show
   - Column/card layout
   - Sorting (which columns, default sort)
   - Filtering (filter types, UI placement)
   - Pagination (page size, total count display)
   - Search (which fields to search)

2. **Table/List Structure**:
   For tables:
   | Column | Data Type | Sortable | Filterable | Width | Alignment |
   |--------|-----------|----------|------------|-------|-----------|
   | Name | string | Yes | Yes | 200px | left |
   | Email | string | No | Yes | 250px | left |
   | Status | enum | Yes | Yes | 100px | center |
   | Actions | buttons | No | No | 150px | right |

   For cards/lists:
   - Card layout (image, title, description, actions)
   - Spacing between items
   - Hover effects

3. **Row/Item Actions**:
   - View details (click row or button?)
   - Edit (modal or navigate to page?)
   - Delete (confirmation dialog)
   - Other actions (approve, reject, etc.)

4. **Empty State**:
   - Message when no data
   - CTA (e.g., "Add your first item")
   - Icon/illustration

5. **Loading State**:
   - Skeleton rows (how many?)
   - Spinner

6. **Error State**:
   - Error message
   - Retry button

7. **Responsive Behavior**:
   - Desktop: Full table
   - Tablet: Hide less important columns
   - Mobile: Card view or horizontal scroll

8. **Performance**:
   - Virtualization (if > 100 rows)
   - Lazy loading images
   - Debounced search

9. **API Integration**:
   - GET endpoint with query params
   - Pagination params (page, limit)
   - Sorting params (sortBy, order)
   - Filter params

Provide complete specification with mockups if available.
```

**Use Case**: When building data-heavy UIs (dashboards, admin panels).

---

### Template 5: Modal/Dialog PRD

```
Create a Frontend PRD for a [MODAL_NAME] modal dialog.

Trigger: [Button click / link / automatic on page load]

Include:

1. **Modal Purpose**:
   - What action does this modal facilitate?
   - When should it open/close?

2. **Visual Specification**:
   - Size (small: 400px, medium: 600px, large: 800px, full-screen)
   - Position (centered, side-sheet)
   - Backdrop (dark overlay)
   - Animation (fade in, slide up)

3. **Content Structure**:
   - Header (title, close button)
   - Body (form, content, warnings)
   - Footer (cancel button, confirm button)

4. **Open Triggers**:
   - Button click
   - Keyboard shortcut (e.g., Ctrl+K)
   - URL parameter (e.g., ?modal=create)

5. **Close Triggers**:
   - Close button (X)
   - Cancel button
   - Click backdrop
   - Escape key
   - Successful action completion

6. **Form Inside Modal** (if applicable):
   - See Form-Focused PRD template
   - Submit flow
   - Validation

7. **Interactions**:
   - Focus trap (Tab cycles within modal)
   - Escape key closes modal
   - Click outside to close (configurable)

8. **States**:
   - Idle (form ready)
   - Loading (submitting)
   - Success (action completed, modal closes)
   - Error (error message, modal stays open)

9. **Accessibility**:
   - Focus moves to modal on open
   - Focus returns to trigger on close
   - aria-modal="true"
   - aria-labelledby for title
   - aria-describedby for description

10. **Responsive**:
    - Desktop: Centered, specified width
    - Mobile: Full-screen or bottom sheet

11. **Component Library**:
    - Use shadcn/ui Dialog component
    - Customize as needed

Provide implementation details with shadcn/ui example.
```

**Use Case**: When building modal-based workflows (create, edit, confirm actions).

---

### Template 6: Navigation PRD (Sidebar, Header, Breadcrumbs)

```
Create a Frontend PRD for [NAVIGATION_TYPE] navigation.

Include:

1. **Navigation Purpose**:
   - Primary navigation (sidebar, header)
   - Secondary navigation (tabs, breadcrumbs)

2. **Navigation Items**:
   | Item | Label | Icon | Route | Permissions | Badge (optional) |
   |------|-------|------|-------|-------------|------------------|
   | Dashboard | Dashboard | HomeIcon | /dashboard | all users | - |
   | Bookings | Bookings | CalendarIcon | /bookings | all users | count of pending |
   | Staff | Staff | UsersIcon | /staff | admin only | - |

3. **Visual Design**:
   - Position (fixed left, fixed top, static)
   - Width/Height
   - Background color
   - Active state styling
   - Hover state styling

4. **Behavior**:
   - Active link highlighting
   - Collapse/expand (for sidebar)
   - Dropdown menus (for nested items)
   - Mobile: Hamburger menu, slide-out drawer

5. **Interactions**:
   - Click to navigate
   - Keyboard navigation (Tab, Arrow keys)
   - Active route highlighting

6. **Responsive**:
   - Desktop: Always visible
   - Tablet: Always visible or collapsible
   - Mobile: Hidden, hamburger menu

7. **Accessibility**:
   - nav element with aria-label
   - Active link: aria-current="page"
   - Keyboard accessible
   - Skip to main content link

8. **Icons**:
   - Icon library (Lucide React)
   - Icon size (20px / h-5 w-5)

Provide complete navigation structure.
```

**Use Case**: When building app navigation (sidebar, header, breadcrumbs).

---

## Frontend-Specific Sections

### UI/UX Requirements Section Template

```markdown
## UI/UX Requirements

### 1. Layout

**Desktop (> 1024px)**:
- Fixed sidebar (240px width)
- Main content area (full width - sidebar)
- Header (64px height)
- Footer (optional)

**Tablet (768px - 1024px)**:
- Collapsible sidebar OR
- Full-width layout with top nav

**Mobile (< 768px)**:
- Hamburger menu
- Full-width content
- Bottom navigation (optional)

### 2. Components Required

| Component | Type | Reusable? | shadcn/ui Available? |
|-----------|------|-----------|----------------------|
| Sidebar | organism | Yes | No (custom) |
| Header | organism | Yes | No (custom) |
| Data Table | organism | Yes | Yes (Table) |
| Create Modal | organism | No | Yes (Dialog) |
| User Form | molecule | Yes | Yes (Form) |
| KPI Card | molecule | Yes | Yes (Card) |
| Search Bar | molecule | Yes | Yes (Input) |
| Filter Dropdown | molecule | Yes | Yes (Select) |

### 3. Interactions

**Primary Actions**:
- Click "Add User" → Opens create modal
- Click table row → Opens detail view OR edit modal
- Click "Delete" → Shows confirmation dialog

**Secondary Actions**:
- Hover table row → Shows action buttons
- Search input → Debounced search (300ms)
- Filter dropdown → Immediate filter update

**Keyboard Shortcuts**:
- `Ctrl/Cmd + K` → Open search
- `Escape` → Close modal
- `Tab` → Navigate form fields
- `Enter` → Submit form (if focused on input)

### 4. Visual Feedback

**Loading**:
- Skeleton screens for tables
- Spinner on buttons
- Loading bar at top of page

**Success**:
- Toast notification (green)
- Success icon animation
- Modal closes automatically

**Error**:
- Toast notification (red)
- Inline error messages (forms)
- Alert banner (page-level errors)

**Empty States**:
- Icon + message + CTA
- Example: "No users yet. Click 'Add User' to get started."
```

---

### Component Hierarchy Section Template

```markdown
## Component Hierarchy

### Atomic Design Breakdown

#### Atoms (Primitives from shadcn/ui)
- Button (`components/ui/button.tsx`)
- Input (`components/ui/input.tsx`)
- Label (`components/ui/label.tsx`)
- Badge (`components/ui/badge.tsx`)
- Avatar (`components/ui/avatar.tsx`)
- Icon (Lucide React)

#### Molecules (Composite Components)
- **Search Bar** (`components/search-bar.tsx`)
  - Composition: Input + SearchIcon
  - Props: `onSearch`, `placeholder`, `defaultValue`

- **Filter Dropdown** (`components/filter-dropdown.tsx`)
  - Composition: Select + Label
  - Props: `options`, `onChange`, `value`

- **User Card** (`components/user-card.tsx`)
  - Composition: Card + Avatar + Badge + Button
  - Props: `user`, `onEdit`, `onDelete`

#### Organisms (Complex Components)
- **User Table** (`components/users/user-table.tsx`)
  - Composition: Table + SearchBar + FilterDropdown + Pagination
  - Props: `users`, `isLoading`, `onEdit`, `onDelete`

- **Create User Modal** (`components/users/create-user-modal.tsx`)
  - Composition: Dialog + UserForm + Button
  - Props: `isOpen`, `onClose`, `onSubmit`

- **User Form** (`components/users/user-form.tsx`)
  - Composition: Form + Input + Select + Button (from react-hook-form)
  - Props: `onSubmit`, `defaultValues`, `isLoading`

#### Templates (Page-Level)
- **Users Page Container** (`components/users/users-container.tsx`)
  - Composition: UserTable + CreateUserModal + EditUserModal
  - Manages state and API calls

#### Pages (Next.js Routes)
- **Users Page** (`app/users/page.tsx`)
  - Server Component
  - Renders UsersContainer
```

---

### Responsive Behavior Section Template

```markdown
## Responsive Behavior

### Breakpoints (Tailwind)
- `sm`: 640px (Mobile landscape)
- `md`: 768px (Tablet portrait)
- `lg`: 1024px (Tablet landscape / Small desktop)
- `xl`: 1280px (Desktop)
- `2xl`: 1536px (Large desktop)

### Layout Adaptations

**Sidebar Navigation**:
- Desktop (>= 1024px): Fixed, 240px width, always visible
- Tablet (768px - 1023px): Collapsible, 64px width when collapsed
- Mobile (< 768px): Hidden, hamburger menu opens overlay

**Data Table**:
- Desktop: Full table with all columns
- Tablet: Hide less important columns (e.g., "Created At")
- Mobile:
  - Option 1: Horizontal scroll
  - Option 2: Card view (switch layout)

**Forms**:
- Desktop: Multi-column (2 columns)
- Tablet: 2 columns for related fields
- Mobile: Single column

**Modals**:
- Desktop: Centered, max-width 600px
- Tablet: Centered, max-width 90%
- Mobile: Full-screen or bottom sheet

### Touch Targets (Mobile)
- Minimum size: 44x44px (iOS) / 48x48px (Android)
- Spacing: 8px between targets
- Increase button padding on mobile

### Font Scaling
- Desktop: Base size 16px
- Mobile: Base size 14px or 16px (don't go smaller)
- Headings: Scale down 1-2 sizes on mobile
```

---

### Accessibility Requirements Section Template

```markdown
## Accessibility Requirements

### WCAG AA Compliance

**Color Contrast**:
- Text: 4.5:1 minimum
- Large text (18px+): 3:1 minimum
- UI components: 3:1 minimum

**Keyboard Navigation**:
- All interactive elements accessible via Tab
- Logical tab order
- Visible focus indicators (ring-2 ring-primary)
- Skip to main content link

**Screen Reader Support**:
- Semantic HTML (button, nav, main, header)
- ARIA labels for icon-only buttons
- ARIA live regions for dynamic content
- Form labels associated with inputs

**Focus Management**:
- Modal opens: Focus moves to modal
- Modal closes: Focus returns to trigger
- Form submit error: Focus moves to first error

### Implementation Checklist

- [ ] All buttons use `<button>` element (not `<div onClick>`)
- [ ] All images have `alt` attributes
- [ ] All form inputs have associated `<label>`
- [ ] Icon-only buttons have `aria-label`
- [ ] Dynamic content has `aria-live` regions
- [ ] Modals have `aria-modal="true"`
- [ ] Focus indicators visible (`:focus-visible`)
- [ ] Color not used as only indicator
- [ ] Heading hierarchy logical (h1 → h2 → h3)
- [ ] Links have descriptive text (not "click here")

### Testing
- Run Lighthouse accessibility audit (target: 95+)
- Test with keyboard only (unplug mouse)
- Test with screen reader (NVDA, JAWS, VoiceOver)
```

---

### Design References Section Template

```markdown
## Design References

### Mockups & Screenshots
- **Location**: `design-references/[feature-name]/`
- **Files**:
  - `dribbble-reference-1.png` - Overall layout inspiration
  - `21dev-table-pattern.png` - Data table design
  - `magicui-button-animation.png` - Button hover effect

### Design System
- **Document**: `design-references/design-system.md`
- **Colors**:
  - Primary: `#8B5CF6` (Purple 500)
  - Secondary: `#EC4899` (Pink 500)
  - Background: `#F9FAFB` (Gray 50)
- **Typography**:
  - Font: Geist Sans
  - Headings: 600-700 weight
  - Body: 400 weight
- **Spacing**:
  - Base: 4px unit
  - Card padding: 24px (p-6)
  - Section gap: 32px (gap-8)

### Similar UIs (for reference)
- Stripe Dashboard (table design)
- Linear (minimal, clean layout)
- Notion (flexible cards)
- Vercel Dashboard (modern SaaS)

### Component Library
- **Primary**: shadcn/ui (Tailwind + Radix UI)
- **Icons**: Lucide React
- **Animations**: Framer Motion
```

---

## Examples from Admin Beauty Clinic

### Example 1: Staff Management PRD (Simplified)

```markdown
# Staff Management - Frontend PRD

## Problem Statement
Admin users need to manage staff members (create, view, edit, delete) with a clear interface showing staff details, positions, and availability.

## UI/UX Requirements

### Components
1. **Staff Table** (main view)
   - Columns: Photo, Name, Position, Email, Phone, Status, Actions
   - Actions: Edit, Delete
   - Filters: Position, Status
   - Search: Name, Email

2. **Add Staff Modal**
   - Form fields: Photo, First Name, Last Name, Email, Phone, Position, Status
   - Validation: Email format, required fields

3. **Edit Staff Modal**
   - Same as Add, but pre-filled with existing data

4. **Delete Confirmation Dialog**
   - Warning message with staff name
   - Cancel / Delete buttons

### Component Hierarchy
- Atoms: Button, Input, Label, Avatar, Badge
- Molecules: FormField, TableRow, FilterDropdown
- Organisms: StaffTable, StaffForm, StaffModal
- Template: StaffContainer
- Page: app/staff/page.tsx

### Responsive Behavior
- Desktop: Table with all columns, modal 600px width
- Tablet: Hide "Phone" column, modal 90% width
- Mobile: Card view instead of table, modal full-screen

### Accessibility
- Table has caption "Staff Members"
- Edit/Delete buttons have aria-label "Edit [name]" / "Delete [name]"
- Form inputs have labels
- Keyboard: Tab through table rows, Enter to edit

## Design References
- Table design: `design-references/staff-table/21dev-example.png`
- Form layout: `design-references/forms/modal-form-pattern.png`

## API Integration
- GET /api/staff - Fetch all staff
- POST /api/staff - Create staff
- PUT /api/staff/:id - Update staff
- DELETE /api/staff/:id - Delete staff

## Success Metrics
- Page load < 2s
- Lighthouse accessibility 95+
- Mobile responsive 100%
```

---

### Example 2: Booking Calendar PRD (Simplified)

```markdown
# Booking Calendar - Frontend PRD

## Problem Statement
Users need to view appointments in a calendar format with ability to create, reschedule, and cancel bookings.

## UI/UX Requirements

### Main Components
1. **Calendar View**
   - Month view with day slots
   - Color-coded by booking status
   - Click day → shows bookings list
   - Click time slot → opens create booking modal

2. **Create Booking Modal**
   - Customer selection (dropdown with search)
   - Service selection (multi-select)
   - Staff selection (filtered by service)
   - Date/time picker
   - Notes textarea

3. **Booking Details Modal**
   - View booking details
   - Actions: Reschedule, Cancel, Mark Complete

### UI States
- **Loading**: Skeleton calendar grid
- **Empty**: "No bookings for this day"
- **Error**: "Failed to load calendar" + Retry button

### Responsive
- Desktop: Full month view
- Tablet: Week view
- Mobile: Day view (swipe to change days)

## Design References
- Calendar: `design-references/calendar/full-calendar-example.png`
- Modal: `design-references/booking-modal/design.png`

## API Integration
- GET /api/bookings?start_date=X&end_date=Y - Fetch bookings for calendar
- POST /api/bookings - Create booking
- PUT /api/bookings/:id - Update booking
- DELETE /api/bookings/:id - Cancel booking
```

---

## Best Practices

### DO's ✅

1. **Be Specific with UI Requirements**
   - Good: "Button: 40px height, 16px horizontal padding, purple background (#8B5CF6), white text"
   - Bad: "Nice-looking button"

2. **Include All UI States**
   - Loading (skeleton, spinner)
   - Error (message, retry)
   - Empty (message, CTA)
   - Success (main interface)

3. **Plan Component Reusability**
   - Identify which components are reusable
   - Define props interface upfront
   - Use Atomic Design pattern

4. **Reference Design System**
   - Link to design tokens document
   - Use consistent spacing, colors, typography
   - Reference shadcn/ui components

5. **Document Responsive Behavior**
   - Specify layout for each breakpoint
   - Plan mobile-specific interactions
   - Consider touch targets

6. **Include Accessibility Early**
   - Keyboard navigation
   - ARIA labels
   - Focus management
   - Screen reader support

7. **Link to Design References**
   - Screenshots from Phase 0
   - Similar UIs for inspiration
   - Component library examples

### DON'Ts ❌

1. **Don't Use Vague Descriptions**
   - Avoid: "Modern UI", "Clean design", "User-friendly"
   - Instead: Specify exact colors, spacing, typography

2. **Don't Skip UI States**
   - Every async operation needs loading/error states
   - Every list needs empty state

3. **Don't Forget Mobile**
   - Plan responsive behavior from the start
   - Don't assume desktop-only usage

4. **Don't Ignore Accessibility**
   - Don't add it as an afterthought
   - Include in requirements upfront

5. **Don't Reinvent Primitives**
   - Use shadcn/ui for buttons, inputs, dialogs
   - Only build custom when necessary

6. **Don't Overlook Form Validation**
   - Define validation rules in PRD
   - Specify error messages

7. **Don't Skip Component Breakdown**
   - Plan component hierarchy
   - Identify reusable components

---

## Validation Checklist

Before finalizing Frontend PRD, verify:

- [ ] All UI components identified and listed
- [ ] Component hierarchy planned (Atomic Design)
- [ ] Responsive behavior specified for all breakpoints
- [ ] Loading, error, empty, success states documented
- [ ] Accessibility requirements included
- [ ] Design references linked
- [ ] shadcn/ui components identified
- [ ] Form validation rules defined (if applicable)
- [ ] API integration points listed
- [ ] TypeScript interfaces sketched
- [ ] Success metrics defined (performance, accessibility)

---

## Next Steps

Once Frontend PRD is complete:

1. **Validate with Stakeholders**
   - Review UI requirements with design team
   - Confirm responsive behavior with PM
   - Verify accessibility requirements

2. **Proceed to Phase 2**
   - Use PRD to create [Frontend Development Plan](02_Frontend_Plan.md)
   - Define component architecture
   - Plan file structure

3. **Create Design System Doc** (if not exists)
   - Extract design tokens from PRD
   - Document colors, typography, spacing
   - See [Design System Guide](Design_System.md)

---

<div align="center">

**Frontend PRD Complete?**

[← Back to Phase 0: Design Research](00_Design_Research.md) | [Next: Phase 2 - Frontend Plan →](02_Frontend_Plan.md)

</div>
