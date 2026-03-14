# Component Interface Contract

**Feature**: Task Completion Checkbox  
**Date**: March 14, 2026  
**Component**: AppointmentListComponent

## Purpose

Define the public API and internal behavior contract for the AppointmentList component to ensure consistency and testability.

## Inputs (Component Inputs)

Currently the component has no formal `@Input()` properties. For this feature, no new inputs are required. The component manages its own data internally.

```typescript
// No inputs for v1 (single-user, same-window)
// Future enhancement: could accept initial appointments list
```

## Outputs (Component Outputs)

Currently the component has no formal `@Output()` properties. For this feature, we maintain internal management.

```typescript
// No outputs for v1 (single-user scenario)
// Future enhancement: could emit appointment changes for parent components
```

## Internal State Contract

### Signal Properties

```typescript
// Main data source
appointments: Signal<Appointment[]>

// Derived collections
activeTasks: Signal<Appointment[]>
completedTasks: Signal<Appointment[]>
```

### State Initialization Behavior

1. On component init, load appointments from localStorage
2. If localStorage is empty, initialize with empty array
3. If localStorage contains invalid JSON, log error and initialize with empty array

### State Update Behavior

1. When user toggles checkbox → update appointment.completed property
2. Update affects both `appointments` signal and derived signals immediately
3. Persist updated array to localStorage synchronously
4. No error handling needed for MVP (localStorage always available in modern browsers)

---

## Method Contract

### Public Methods

#### `toggleTaskCompletion(appointment: Appointment): void`

**Purpose**: Toggle the completion status of an appointment

**Input**:
- `appointment`: Appointment object to toggle

**Effect**:
- Find appointment in array
- Toggle `completed` boolean
- Persist to localStorage
- Update signals (Angular handles re-rendering)

**Error Handling**:
- If appointment not found: no-op (silent ignore for MVP)

**Visibility**: May be called from template via event binding

**Example**:
```typescript
<input type="checkbox" 
       [checked]="appointment.completed"
       (change)="toggleTaskCompletion(appointment)">
```

---

## Template Contract

### Data Binding

**Active Tasks Section**:
```html
<section class="active-tasks">
  <h2>Active Tasks</h2>
  <div *ngIf="activeTasks().length === 0" class="empty-state">
    No active tasks
  </div>
  <div *ngFor="let appointment of activeTasks()" class="appointment-item">
    <!-- Appointment display with checkbox -->
  </div>
</section>
```

**Completed Tasks Section**:
```html
<section class="completed-tasks">
  <h2>Completed Tasks</h2>
  <div *ngIf="completedTasks().length === 0" class="empty-state">
    No completed tasks
  </div>
  <div *ngFor="let appointment of completedTasks()" 
       class="appointment-item completed">
    <!-- Appointment display with checkbox, visual styling -->
  </div>
</section>
```

### Event Binding

**Checkbox Change Event**:
```html
<input type="checkbox" 
       [checked]="appointment.completed"
       (change)="toggleTaskCompletion(appointment)"
       class="appointment-checkbox"
       aria-label="Mark {{ appointment.title }} as complete">
```

---

## Persistence Contract

### localStorage Interface

**Key**: `appointments-list` (constant, defined in component)

**Value**: JSON stringified array of Appointment objects

**Example**:
```json
[
  {
    "id": 1,
    "title": "Project Review",
    "date": "2026-03-15T10:00:00.000Z",
    "completed": true
  },
  {
    "id": 2,
    "title": "Team Meeting",
    "date": "2026-03-16T14:00:00.000Z",
    "completed": false
  }
]
```

### Save Behavior

- Triggered after every `toggleTaskCompletion()`
- Synchronous call to `localStorage.setItem()`
- No retry logic needed for MVP
- No callback/event after save

### Load Behavior

- Triggered on component initialization (`ngOnInit`)
- Try parse JSON, catch errors gracefully
- If parse fails, initialize with empty array
- Log error to console for debugging

---

## Change Detection Contract

### Angular Change Detection

**Strategy**: OnPush detection with signals

**Behavior**:
- Component uses standalone config
- Signals automatically trigger template updates
- `activeTasks` and `completedTasks` computed signals invalidate and recompute when `appointments` changes
- Template re-renders automatically

---

## Accessibility Contract

### WCAG 2.1 Level AA Compliance

1. **Nested Headings**: Use proper heading hierarchy (h1/h2 as needed)
2. **Form Controls**: Checkboxes have associated labels
3. **Color Contrast**: Completed text styling maintains minimum 4.5:1 ratio with background
4. **Keyboard Navigation**: All interactive elements (checkboxes) are keyboard accessible
5. **ARIA Labels**: Checkboxes include descriptive aria-label

**Example**:
```html
<input type="checkbox"
       [checked]="appointment.completed"
       (change)="toggleTaskCompletion(appointment)"
       aria-label="Mark '{{ appointment.title }}' as complete">
```

---

## Error Handling Contract

### Errors Not Expected for MVP

- localStorage is available in all modern browsers
- Component operates offline - no network errors
- Parsing errors: gracefully default to empty array

### Future Considerations

- Backend sync errors (future phase)
- Concurrent update conflicts (future phase)
- Quota exceeded errors (future phase with larger data)

---

## Performance Contract

### Time Complexity

- Toggle operation: O(n) where n = number of appointments
- Filter operations: O(n) via computed() (efficient with memoization)
- localStorage operations: O(n) for serialization

### Expected Performance

- Checkbox toggle visible in DOM within 16ms (60 fps)
- No noticeable lag with 100 appointments
- localStorage operations < 5ms for typical dataset

### Space Complexity

- State: O(n) for appointments array
- Derived signals: O(n) for active + completed collections
- Total memory: ~1KB per appointment (conservative estimate)

---

## Testing Contract

### Unit Test Expectations

1. ✅ Component initializes with appointments from localStorage
2. ✅ Checkbox toggles appointment.completed status
3. ✅ Toggling updates signals
4. ✅ Toggling persists to localStorage
5. ✅ activeTask filter works correctly
6. ✅ completedTask filter works correctly
7. ✅ Template displays correct number of items in each section
8. ✅ Visual classes applied/removed based on completed status

### Integration Test Expectations

1. ✅ User flow: click checkbox → task moves → persistence maintained
2. ✅ Refresh page → completed tasks still marked
3. ✅ Error recovery: localStorage parsing fails → component still works

---

## Versioning & Backward Compatibility

**Version**: 1.0 (MVP)

**Breaking Changes**: None

**Backward Compatibility**:
- Existing appointments without `completed` property default to `false`
- No data loss on component upgrade

**Migration Path**:
- Future versions can add multi-device sync via backend
- Future versions can add shared appointment lists
- No breaking changes to current component interface required
