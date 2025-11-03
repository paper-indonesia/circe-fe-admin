# Phase 3: Frontend Task Checklist Generation

## Overview

This guide provides a systematic approach to generating **Frontend Task Checklists** from PRDs and Development Plans. Frontend tasks differ from backend tasks by including visual validation, responsive testing, and accessibility checkpoints.

This complements [Circe Lessons Phase 3](https://github.com/paper-indonesia/circe-lessons/tree/main/03_Tasks) with Frontend-specific task breakdown strategies.

---

## Table of Contents

1. [Frontend Task Characteristics](#frontend-task-characteristics)
2. [5-Phase Prompt Sequence](#5-phase-prompt-sequence)
3. [Task Template Structure](#task-template-structure)
4. [UI State Task Patterns](#ui-state-task-patterns)
5. [Component Task Breakdown](#component-task-breakdown)
6. [Example Task Checklist](#example-task-checklist)
7. [Best Practices](#best-practices)

---

## Frontend Task Characteristics

### Key Differences from Backend Tasks

| Aspect | Backend Tasks | Frontend Tasks |
|--------|---------------|----------------|
| **Granularity** | Per API endpoint or service | Per component or UI feature |
| **Validation** | Unit tests, API tests | Type checks + **visual alignment** + responsive tests |
| **Dependencies** | Database, external APIs | Design references, component library, fonts |
| **Acceptance** | Tests pass, correct response | Tests pass + **matches design** + **accessibility** |
| **States** | Request handling | Loading + Error + Empty + Success |

### Frontend-Specific Considerations

Every task must include:
- ✅ **File Path**: Exact component file location
- ✅ **UI States**: Loading, error, empty, success
- ✅ **Design Reference**: Link to mockup/screenshot
- ✅ **Responsive**: Mobile, tablet, desktop behavior
- ✅ **Accessibility**: Keyboard, screen reader, ARIA
- ✅ **Visual Validation**: Screenshot comparison or design review

---

## 5-Phase Prompt Sequence

### Phase 1: Context Gathering

**Objective**: Extract all relevant information from PRD and Plan.

#### Prompt 1.1: Document Analysis

```
I need to create a Frontend Task Checklist for implementing [FEATURE_NAME].

Analyze these documents:
1. Frontend PRD: @[PRD_FILE]
2. Frontend Dev Plan: @[PLAN_FILE]
3. Design References: @design-references/[feature]/

Extract:

A. **From PRD**:
   - All UI components mentioned
   - UI states required (loading, error, empty)
   - Responsive requirements
   - Accessibility requirements
   - Design references

B. **From Dev Plan**:
   - File structure (exact paths)
   - Component hierarchy
   - TypeScript interfaces
   - API integration points
   - shadcn/ui components to use

C. **From Design References**:
   - Visual specifications (colors, spacing, typography)
   - Layout patterns
   - Component variants

Create a comprehensive context summary.
```

---

### Phase 2: Phase Definition

**Objective**: Group tasks into logical phases with dependencies.

#### Prompt 2.1: Define Implementation Phases

```
Based on the context from Phase 1, define implementation phases:

**Phase 1: Foundation**
- TypeScript types
- API client methods
- Zustand store setup
- Route structure

**Phase 2: Layout & Core UI**
- Layout components (if new)
- Main container component
- Data display component (table/list)
- Loading skeletons

**Phase 3: CRUD Operations**
- Form component with validation
- Create modal
- Edit modal
- Delete confirmation

**Phase 4: Interactions & States**
- Search and filter functionality
- Error handling
- Empty states
- Animations

**Phase 5: Polish**
- Responsive testing
- Accessibility audit
- Performance optimization
- Visual refinement

For each phase, list major deliverables.
```

---

### Phase 3: Task Breakdown

**Objective**: Generate granular, actionable tasks.

#### Prompt 3.1: Create Detailed Tasks

```
For each component in the Dev Plan, create a detailed task:

**Task Template**:

### Task [N]: [Action] [Component Name]
- [ ] **File**: [exact file path]
- [ ] **Description**: [what to build]
- [ ] **Requirements**:
  - [ ] [Specific requirement 1]
  - [ ] [Specific requirement 2]
  - [ ] UI States: [loading, error, empty, success]
  - [ ] Responsive: [mobile, tablet, desktop behavior]
  - [ ] Accessibility: [keyboard, ARIA, screen reader]

**Acceptance Criteria**:
- [ ] Visual: Matches design reference
- [ ] TypeScript: No compilation errors
- [ ] Responsive: Tested on all breakpoints
- [ ] Accessibility: Keyboard navigation works
- [ ] States: All UI states implemented

**Reference**:
- PRD: [file] - Lines [X-Y]
- Plan: [file] - Lines [X-Y]
- Design: [screenshot or mockup]
- shadcn/ui: [component documentation]

**Dependencies**: [Previous tasks]

**Estimated Time**: [hours]

**Status**: ⏳ Pending

---

Generate tasks for all components, following this structure.
```

---

### Phase 4: Cross-Referencing

**Objective**: Add precise documentation links.

#### Prompt 4.1: Add Line References

```
For each task created, add cross-references with line numbers:

**Format**:
- PRD: `PRD/[feature]-prd.md` - Lines [X-Y] ([section name])
- Plan: `Plan/[feature]-plan.md` - Lines [X-Y] ([section name])
- Design: `design-references/[feature]/[file].png`
- Tech Docs: `Tech_Stack_Docs/[tech].md` - Lines [X-Y] ([example])

**Example**:
- PRD: `PRD/staff-management-prd.md` - Lines 45-67 (Form validation requirements)
- Plan: `Plan/staff-plan.md` - Lines 120-145 (StaffForm component spec)
- Design: `design-references/staff/form-design.png`
- shadcn/ui: Form component (https://ui.shadcn.com/docs/components/form)

Add to all tasks.
```

---

### Phase 5: Refinement & Validation

**Objective**: Ensure completeness and clarity.

#### Prompt 5.1: Validation Checklist

```
Review the generated task checklist:

**Completeness**:
- [ ] All components from Dev Plan have tasks
- [ ] All UI states covered (loading, error, empty, success)
- [ ] All responsive breakpoints addressed
- [ ] All accessibility requirements included
- [ ] All design references linked

**Clarity**:
- [ ] File paths are exact and unambiguous
- [ ] Requirements are specific and actionable
- [ ] Acceptance criteria are testable
- [ ] Dependencies are clearly stated

**Granularity**:
- [ ] Each task is 1-4 hours max
- [ ] No task is too vague ("Build UI")
- [ ] No task combines multiple components

**Traceability**:
- [ ] Every requirement traces to PRD or Plan
- [ ] Line numbers provided for references
- [ ] Design references linked

If any checklist item fails, refine the tasks.
```

---

## Task Template Structure

### Complete Task Template

```markdown
### Task [N]: [Action Verb] [Component/Feature Name]

- [ ] **File**: `[exact/path/to/file.tsx]`
- [ ] **Description**: [1-2 sentence description of what to build]

**Requirements**:
- [ ] [Specific requirement 1 - be detailed]
- [ ] [Specific requirement 2]
- [ ] [Functional requirement]
- [ ] [UI requirement with values: "Button height 40px, padding 16px"]

**UI States** (all required):
- [ ] **Loading**: [skeleton screen / spinner / loading text]
- [ ] **Error**: [error message display / retry button]
- [ ] **Empty**: ["No data" message / CTA to add item]
- [ ] **Success**: [main UI with data]

**Responsive Behavior**:
- [ ] **Mobile (< 768px)**: [layout description]
- [ ] **Tablet (768-1024px)**: [layout description]
- [ ] **Desktop (> 1024px)**: [layout description]

**Accessibility**:
- [ ] Keyboard navigation: [Tab, Enter, Escape behaviors]
- [ ] ARIA labels: [which elements need labels]
- [ ] Screen reader: [announcements needed]
- [ ] Focus management: [focus flow]

**TypeScript**:
```typescript
interface [ComponentName]Props {
  // Define props
}
```

**Acceptance Criteria**:
- [ ] Visual: Matches `design-references/[feature]/[file].png`
- [ ] TypeScript: `npx tsc --noEmit` passes
- [ ] ESLint: `npm run lint` passes
- [ ] Responsive: Tested on mobile, tablet, desktop
- [ ] Accessibility: Keyboard navigation works
- [ ] States: All 4 UI states implemented and tested
- [ ] Component renders without errors

**Reference**:
- PRD: `[file]` - Lines [X-Y] ([section])
- Plan: `[file]` - Lines [X-Y] ([section])
- Design: `design-references/[feature]/[file]`
- shadcn/ui: [component name] ([link])

**Dependencies**: Task [N-1], Task [N-2]

**Estimated Time**: [1-4] hours

**Status**: ⏳ Pending | 🔄 In Progress | ✅ Complete

**Notes** (added during implementation):
- [Implementation decisions]
- [Issues encountered]
- [Deviations from plan]
```

---

## UI State Task Patterns

### Pattern 1: Data Display Component (Table/List)

```markdown
### Task X: Build [Feature] Data Table

- [ ] **File**: `components/[feature]/[feature]-table.tsx`

**Requirements**:
- [ ] Display data in shadcn/ui `<Table>` component
- [ ] Columns: [list columns with widths]
- [ ] Sortable columns: [list which columns]
- [ ] Row actions: Edit button, Delete button
- [ ] Pagination: 10 items per page

**UI States**:
- [ ] **Loading**: Show 5 skeleton rows using `<Skeleton className="h-12 w-full" />`
- [ ] **Error**: Display error message with retry button
- [ ] **Empty**: Show EmptyState component with "No [items] yet" message and "Add [Item]" CTA
- [ ] **Success**: Display table with data, hover effects on rows

**Responsive Behavior**:
- [ ] **Mobile**: Horizontal scroll OR card view (decide based on columns)
- [ ] **Tablet**: Hide less important columns (e.g., "Created At")
- [ ] **Desktop**: Show all columns

**Accessibility**:
- [ ] Table has `caption` element: "[Feature] table"
- [ ] Action buttons have `aria-label`: "Edit [item name]", "Delete [item name]"
- [ ] Keyboard: Tab to navigate rows, Enter to trigger actions
```

---

### Pattern 2: Form Component

```markdown
### Task Y: Build [Feature] Form with Validation

- [ ] **File**: `components/[feature]/[feature]-form.tsx`

**Requirements**:
- [ ] Use React Hook Form (`useForm`)
- [ ] Zod validation schema with rules from PRD
- [ ] Fields: [list all fields with types]
- [ ] Submit button: "[Action]" (e.g., "Create User")

**UI States**:
- [ ] **Idle**: Form ready, fields empty (or pre-filled for edit mode)
- [ ] **Validating**: Inline errors below fields (onChange or onBlur)
- [ ] **Submitting**: Button shows spinner, disabled state
- [ ] **Success**: Form resets (create) or modal closes (edit)
- [ ] **Error**: Toast notification with API error message

**Responsive Behavior**:
- [ ] **Mobile**: Single column layout
- [ ] **Tablet**: 2 columns for related fields
- [ ] **Desktop**: 2 columns, optimized spacing

**Accessibility**:
- [ ] All inputs have associated `<label>` (for/id)
- [ ] Error messages have `aria-live="polite"`
- [ ] Form has `aria-labelledby` pointing to form title
- [ ] Keyboard: Tab through fields, Enter to submit

**Validation Schema**:
```typescript
const formSchema = z.object({
  field1: z.string().min(2, "Message"),
  field2: z.string().email("Message"),
  // ... all fields from PRD
})
```

**Acceptance Criteria**:
- [ ] All validation rules from PRD implemented
- [ ] Error messages display inline below fields
- [ ] Submit button disables during submission
- [ ] Form resets after successful submission (create mode)
- [ ] Pre-fills data correctly (edit mode)
```

---

### Pattern 3: Modal/Dialog Component

```markdown
### Task Z: Build [Action] Modal

- [ ] **File**: `components/[feature]/[action]-modal.tsx`

**Requirements**:
- [ ] Use shadcn/ui `<Dialog>` component
- [ ] Size: 600px width (desktop), 90% (tablet), full-screen (mobile)
- [ ] Contains [FeatureForm] component
- [ ] Header: Title + Close button
- [ ] Footer: Cancel button + Submit button

**UI States**:
- [ ] **Closed**: Modal not visible
- [ ] **Open**: Modal visible with backdrop
- [ ] **Submitting**: Submit button shows spinner
- [ ] **Success**: Modal closes, success toast displays
- [ ] **Error**: Modal stays open, error toast displays

**Responsive Behavior**:
- [ ] **Mobile**: Full-screen modal
- [ ] **Tablet**: 90% width, centered
- [ ] **Desktop**: 600px width, centered

**Accessibility**:
- [ ] Focus moves to modal on open
- [ ] Focus trapped within modal (Tab cycles)
- [ ] Escape key closes modal
- [ ] Focus returns to trigger button on close
- [ ] `aria-modal="true"`
- [ ] `aria-labelledby` points to modal title

**Interactions**:
- [ ] Click backdrop to close (optional, configurable)
- [ ] Click X button to close
- [ ] Click Cancel button to close
- [ ] Successful submit closes modal
- [ ] Error keeps modal open
```

---

## Component Task Breakdown

### Example: Staff Management Feature

```markdown
# Staff Management - Frontend Task Checklist

## Phase 1: Foundation

### Task 1: Create TypeScript Interfaces
- [ ] **File**: `types/staff.ts`
- [ ] **Description**: Define all TypeScript interfaces for Staff entity
- [ ] **Requirements**:
  - [ ] `Staff` interface matching API response
  - [ ] `StaffFormData` for create/edit forms
  - [ ] `StaffFilters` for search and filter state
  - [ ] Export all interfaces

**Reference**:
- PRD: Lines 45-60 (Data model)
- Plan: Lines 78-105 (TypeScript interfaces)

**Estimated Time**: 30 minutes
**Status**: ⏳ Pending

---

### Task 2: Create API Client
- [ ] **File**: `lib/api/staff-api.ts`
- [ ] **Description**: Implement CRUD API methods for staff
- [ ] **Requirements**:
  - [ ] `getAll()` - GET /api/staff with filters
  - [ ] `getById(id)` - GET /api/staff/:id
  - [ ] `create(data)` - POST /api/staff
  - [ ] `update(id, data)` - PUT /api/staff/:id
  - [ ] `delete(id)` - DELETE /api/staff/:id
  - [ ] Proper error handling and typed responses

**Acceptance Criteria**:
- [ ] All methods return properly typed data (Staff, Staff[])
- [ ] Error handling includes user-friendly messages
- [ ] TypeScript compilation passes

**Reference**:
- PRD: Lines 120-145 (API endpoints)
- Plan: Lines 200-230 (API integration)

**Dependencies**: Task 1 (Types)
**Estimated Time**: 1 hour
**Status**: ⏳ Pending

---

### Task 3: Add Zustand Store Slice
- [ ] **File**: `lib/store.ts` (modify existing)
- [ ] **Description**: Add staff management to global store
- [ ] **Requirements**:
  - [ ] State: `staff: Staff[]`, `staffLoading: boolean`, `staffError: string | null`
  - [ ] Actions: `fetchStaff()`, `createStaff()`, `updateStaff()`, `deleteStaff()`
  - [ ] Loading and error state management

**Acceptance Criteria**:
- [ ] Store slice follows existing pattern
- [ ] Async actions handle loading/error states
- [ ] Types from Task 1 are used

**Reference**:
- Plan: Lines 250-290 (State management)

**Dependencies**: Task 1, Task 2
**Estimated Time**: 1 hour
**Status**: ⏳ Pending

---

## Phase 2: Core UI

### Task 4: Create Route Structure
- [ ] **Files**:
  - `app/staff/page.tsx`
  - `app/staff/loading.tsx`
- [ ] **Description**: Set up Next.js routes for staff management

**Requirements**:
- [ ] `page.tsx`: Server Component, renders StaffContainer
- [ ] `loading.tsx`: Skeleton screen with table skeleton
- [ ] Add to navigation (Sidebar component)

**UI States**:
- [ ] **Loading**: Displays loading.tsx automatically (Suspense)

**Acceptance Criteria**:
- [ ] Route accessible at /staff
- [ ] Loading skeleton displays before page loads
- [ ] Navigation link added to Sidebar

**Reference**:
- Plan: Lines 50-65 (File structure)

**Dependencies**: None
**Estimated Time**: 30 minutes
**Status**: ⏳ Pending

---

### Task 5: Build Staff Container Component
- [ ] **File**: `components/staff/staff-container.tsx`
- [ ] **Description**: Main orchestrator component for staff management

**Requirements**:
- [ ] Use "use client" directive
- [ ] Fetch staff data on mount using Zustand store
- [ ] Manage modal states (create, edit, delete)
- [ ] Render StaffTable, CreateModal, EditModal, DeleteDialog

**UI States**:
- [ ] **Loading**: Pass `isLoading` to StaffTable
- [ ] **Error**: Display error alert with retry button
- [ ] **Success**: Render table and modals

**Responsive Behavior**:
- [ ] Same on all devices (delegates to children)

**Accessibility**:
- [ ] Main region with `aria-label="Staff management"`

**Acceptance Criteria**:
- [ ] Data fetches on mount
- [ ] All modals can be opened/closed
- [ ] Error handling displays correctly
- [ ] Loading state passes to children

**Reference**:
- Plan: Lines 320-350 (StaffContainer spec)

**Dependencies**: Task 3 (Store)
**Estimated Time**: 2 hours
**Status**: ⏳ Pending

---

### Task 6: Build Staff Table Component
- [ ] **File**: `components/staff/staff-table.tsx`
- [ ] **Description**: Display staff in table format with actions

**Requirements**:
- [ ] Use shadcn/ui `<Table>` component
- [ ] Columns: Photo (Avatar), Name, Position, Email, Phone, Status, Actions
- [ ] Sortable: Name, Position, Status
- [ ] Row actions: Edit button, Delete button
- [ ] Pagination: 10 per page

**UI States**:
- [ ] **Loading**: 5 skeleton rows
- [ ] **Error**: Not handled here (parent handles)
- [ ] **Empty**: EmptyState with "No staff members yet" + "Add Staff" button
- [ ] **Success**: Table with data, hover effects

**Responsive Behavior**:
- [ ] **Mobile**: Card view (custom layout, hide table)
- [ ] **Tablet**: Hide "Phone" column
- [ ] **Desktop**: All columns visible

**Accessibility**:
- [ ] Table has `<caption>`: "Staff members"
- [ ] Edit button: `aria-label="Edit {name}"`
- [ ] Delete button: `aria-label="Delete {name}"`
- [ ] Keyboard: Tab to navigate, Enter to trigger actions

**Acceptance Criteria**:
- [ ] Visual: Matches `design-references/staff/table-design.png`
- [ ] Sorting works on all sortable columns
- [ ] Pagination displays correct page/total
- [ ] Empty state shows when no data
- [ ] Mobile card view works correctly

**Reference**:
- PRD: Lines 80-110 (Table requirements)
- Plan: Lines 380-420 (StaffTable spec)
- Design: `design-references/staff/table-design.png`

**Dependencies**: Task 1 (Types), Task 5 (Container)
**Estimated Time**: 3 hours
**Status**: ⏳ Pending

---

## Phase 3: CRUD Operations

### Task 7: Build Staff Form Component
- [ ] **File**: `components/staff/staff-form.tsx`
- [ ] **Description**: Create/edit form with validation

**Requirements**:
- [ ] Use React Hook Form with Zod validation
- [ ] Fields: First Name, Last Name, Email, Phone (optional), Position (select), Status (select)
- [ ] Validation: Email format, required fields
- [ ] Accept `initialData` prop for edit mode

**Validation Schema**:
```typescript
const staffFormSchema = z.object({
  first_name: z.string().min(2, "First name required"),
  last_name: z.string().min(2, "Last name required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  position: z.string().min(1, "Position required"),
  status: z.enum(['active', 'inactive']),
})
```

**UI States**:
- [ ] **Idle**: Form ready
- [ ] **Validating**: Inline errors below fields
- [ ] **Submitting**: Submit button disabled, shows spinner
- [ ] **Success**: Handled by parent (modal closes)
- [ ] **Error**: Inline errors or toast

**Responsive Behavior**:
- [ ] **Mobile**: Single column
- [ ] **Tablet**: 2 columns
- [ ] **Desktop**: 2 columns

**Accessibility**:
- [ ] Labels associated with inputs
- [ ] Error messages have `aria-live="polite"`
- [ ] Keyboard: Tab through fields, Enter submits

**Acceptance Criteria**:
- [ ] All validation rules work
- [ ] Error messages display inline
- [ ] Edit mode pre-fills data correctly
- [ ] Form resets after submit (create mode)

**Reference**:
- PRD: Lines 145-180 (Form validation)
- Plan: Lines 450-490 (StaffForm spec)

**Dependencies**: Task 1 (Types)
**Estimated Time**: 3 hours
**Status**: ⏳ Pending

---

### Task 8: Build Create Staff Modal
- [ ] **File**: `components/staff/create-staff-modal.tsx`
- [ ] **Description**: Modal for creating new staff

**Requirements**:
- [ ] Use shadcn/ui `<Dialog>`
- [ ] Contains StaffForm component
- [ ] Submit calls Zustand `createStaff()`
- [ ] Success: Close modal, show toast, refresh table

**UI States**:
- [ ] **Closed**: Not visible
- [ ] **Open/Idle**: Modal visible, form ready
- [ ] **Submitting**: Form shows loading
- [ ] **Success**: Modal closes, toast shows "Staff created"
- [ ] **Error**: Modal stays open, error toast

**Responsive Behavior**:
- [ ] **Mobile**: Full-screen
- [ ] **Tablet/Desktop**: 600px centered

**Accessibility**:
- [ ] Focus to modal on open
- [ ] Escape closes modal
- [ ] Focus returns to "Add Staff" button

**Acceptance Criteria**:
- [ ] Modal opens from "Add Staff" button
- [ ] Form submission creates staff
- [ ] Success toast displays
- [ ] Table refreshes after creation

**Reference**:
- PRD: Lines 190-210 (Create workflow)
- Plan: Lines 500-530 (CreateModal spec)

**Dependencies**: Task 7 (Form), Task 3 (Store)
**Estimated Time**: 2 hours
**Status**: ⏳ Pending

---

[Continue for Task 9 (Edit Modal), Task 10 (Delete Dialog), Task 11-15 (Polish phase)]

## Progress Tracking

**Total Tasks**: 15
**Completed**: 0
**In Progress**: 0
**Pending**: 15

**Estimated Total Time**: ~25 hours (3-4 days)

---

## Notes

[Add implementation notes as tasks are completed]
```

---

## Best Practices

### DO's ✅

1. **One Component Per Task**
   - Don't combine multiple components in one task
   - Each task should be 1-4 hours max

2. **Include All UI States**
   - Loading, error, empty, success
   - Every async operation needs all states

3. **Specify File Paths**
   - Exact paths, not "create a component"
   - Helps AI and developers locate files

4. **Add Visual References**
   - Link to design screenshots
   - Specify exact colors, spacing

5. **Define Acceptance Criteria**
   - Visual match design
   - TypeScript compiles
   - Responsive tested
   - Accessibility works

6. **Map Dependencies**
   - Types before components
   - API client before store
   - Store before containers

7. **Cross-Reference Everything**
   - PRD lines
   - Plan lines
   - Design files
   - shadcn/ui docs

### DON'Ts ❌

1. **Don't Create Vague Tasks**
   - Bad: "Build user interface"
   - Good: "Build UserTable component with sorting and pagination"

2. **Don't Skip UI States**
   - Every component needs loading/error/empty

3. **Don't Forget Responsive**
   - Specify mobile/tablet/desktop for every component

4. **Don't Ignore Accessibility**
   - Include keyboard, ARIA, focus management

5. **Don't Overlook Dependencies**
   - Task order matters (types → API → store → components)

6. **Don't Skip Visual Validation**
   - Every task needs design reference

7. **Don't Batch Too Many Things**
   - Keep tasks focused and granular

---

## Validation Checklist

Before finalizing task checklist:

- [ ] All components from Plan have tasks
- [ ] All tasks have exact file paths
- [ ] All tasks include UI states (4 states)
- [ ] All tasks specify responsive behavior
- [ ] All tasks include accessibility requirements
- [ ] All tasks have acceptance criteria
- [ ] All tasks have cross-references (PRD, Plan, Design)
- [ ] All tasks have dependencies listed
- [ ] All tasks have time estimates
- [ ] Task order respects dependencies
- [ ] No task is larger than 4 hours

---

<div align="center">

**Frontend Task Checklist Complete?**

[← Back to Phase 2: Plan](02_Frontend_Plan.md) | [Next: Phase 4 - Implementation →](04_Frontend_Implementation.md)

</div>
