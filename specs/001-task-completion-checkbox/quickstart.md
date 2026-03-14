# Quick Start Guide: Task Completion Checkbox

**Feature**: Appointment Task Completion  
**Date**: March 14, 2026

This guide helps developers quickly understand and implement the task completion feature.

## Feature Overview (30 seconds)

Users can now:
1. **Check a checkbox** next to any appointment task
2. **See the task move** to a "Completed Tasks" section
3. **Uncheck to restore** the task to the active list
4. **Data persists** across page refreshes

---

## Architecture Overview

### Key Components

```
AppointmentListComponent (src/app/appointment-list/)
  ├── Template: appointment-list.html
  │   ├── Active Tasks Section (filtered from signal)
  │   └── Completed Tasks Section (filtered from signal)
  │
  ├── Logic: appointment-list.ts
  │   ├── appointments: Signal<Appointment[]>
  │   ├── activeTasks: Computed<Appointment[]>
  │   ├── completedTasks: Computed<Appointment[]>
  │   ├── toggleTaskCompletion(): void
  │   ├── loadFromStorage(): void
  │   └── saveToStorage(): void
  │
  └── Data: Appointment Model (src/app/models/appointment.ts)
      └── [Add: completed?: boolean]
```

### Data Flow

```
[Component Init]
     ↓
[Load from localStorage via loadFromStorage()]
     ↓
[Signal: appointments initialized]
     ↓
[Computed: activeTasks filtered (completed=false)]
[Computed: completedTasks filtered (completed=true)]
     ↓
[Template renders both sections]
     ↓
[User checks checkbox]
     ↓
[toggleTaskCompletion() called]
     ↓
[Update appointment.completed property]
     ↓
[Signals updated (Angular automatic)]
     ↓
[saveToStorage() persists to localStorage]
     ↓
[Template re-renders with new filtering]
```

---

## Implementation Checklist

### Step 1: Update Data Model
**File**: `src/app/models/appointment.ts`

```typescript
export interface Appointment {
    id: number;
    title: string;
    date: Date;
    completed?: boolean;  // ADD THIS LINE
}
```

**Why**: Adds the completion tracking property to the Appointment interface.

---

### Step 2: Update Component Logic
**File**: `src/app/appointment-list/appointment-list.ts`

**Imports to add**:
```typescript
import { computed, signal, Signal } from '@angular/core';
import { Appointment } from '../models/appointment';
```

**Signals to add to class**:
```typescript
protected appointments = signal<Appointment[]>([]);
protected activeTasks = computed(() =>
  this.appointments().filter(a => !a.completed)
);
protected completedTasks = computed(() =>
  this.appointments().filter(a => a.completed)
);

private readonly STORAGE_KEY = 'appointments-list';
```

**Methods to add**:
```typescript
ngOnInit(): void {
  this.loadFromStorage();
}

private loadFromStorage(): void {
  try {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Appointment[];
      // Ensure completed property exists on all items
      const withDefaults = parsed.map(a => ({
        ...a,
        completed: a.completed ?? false
      }));
      this.appointments.set(withDefaults);
    }
  } catch (error) {
    console.error('Failed to load appointments from storage:', error);
    this.appointments.set([]);
  }
}

protected toggleTaskCompletion(appointment: Appointment): void {
  const current = this.appointments();
  const updated = current.map(a =>
    a.id === appointment.id
      ? { ...a, completed: !a.completed }
      : a
  );
  this.appointments.set(updated);
  this.saveToStorage();
}

private saveToStorage(): void {
  const json = JSON.stringify(this.appointments());
  localStorage.setItem(this.STORAGE_KEY, json);
}
```

**Why**: Creates signals for reactive updates, handles persistence, and provides the toggle method.

---

### Step 3: Update Template
**File**: `src/app/appointment-list/appointment-list.html`

**Structure**:
```html
<div class="appointment-list">
  <!-- Active Tasks Section -->
  <section class="active-tasks">
    <h2>Active Tasks</h2>
    
    <div *ngIf="activeTasks().length === 0" class="empty-state">
      No active tasks
    </div>

    <div *ngFor="let appointment of activeTasks()" 
         class="appointment-item">
      <input type="checkbox"
             [checked]="appointment.completed"
             (change)="toggleTaskCompletion(appointment)"
             class="appointment-checkbox"
             aria-label="Mark '{{ appointment.title }}' as complete">
      
      <div class="appointment-info">
        <h3>{{ appointment.title }}</h3>
        <p class="appointment-date">{{ appointment.date | date }}</p>
      </div>
    </div>
  </section>

  <!-- Completed Tasks Section -->
  <section class="completed-tasks">
    <h2>Completed Tasks</h2>
    
    <div *ngIf="completedTasks().length === 0" class="empty-state">
      No completed tasks yet
    </div>

    <div *ngFor="let appointment of completedTasks()" 
         class="appointment-item completed">
      <input type="checkbox"
             [checked]="appointment.completed"
             (change)="toggleTaskCompletion(appointment)"
             class="appointment-checkbox"
             aria-label="Mark '{{ appointment.title }}' as incomplete">
      
      <div class="appointment-info">
        <h3>{{ appointment.title }}</h3>
        <p class="appointment-date">{{ appointment.date | date }}</p>
      </div>
    </div>
  </section>
</div>
```

**Why**: Displays both active and completed sections with checkboxes; uses signals for reactive updates.

---

### Step 4: Add Styling
**File**: `src/app/appointment-list/appointment-list.css`

```css
.appointment-list {
  padding: 20px;
}

.active-tasks,
.completed-tasks {
  margin-bottom: 30px;
}

.appointment-item {
  display: flex;
  align-items: center;
  padding: 12px;
  margin-bottom: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #fff;
  transition: background-color 0.2s;
}

.appointment-item.completed {
  background-color: #f5f5f5;
  opacity: 0.7;
}

.appointment-checkbox {
  width: 20px;
  height: 20px;
  margin-right: 12px;
  cursor: pointer;
}

.appointment-info {
  flex: 1;
}

.appointment-item.completed h3 {
  text-decoration: line-through;
  color: #999;
}

.appointment-item.completed .appointment-date {
  color: #999;
}

.appointment-info h3 {
  margin: 0;
  font-size: 16px;
}

.appointment-date {
  margin: 4px 0 0 0;
  font-size: 12px;
  color: #666;
}

.empty-state {
  padding: 20px;
  text-align: center;
  color: #999;
  font-style: italic;
}
```

**Why**: Provides visual distinction between active and completed tasks; improves UX.

---

### Step 5: Add Unit Tests
**File**: `src/app/appointment-list/appointment-list.spec.ts`

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppointmentList } from './appointment-list';
import { Appointment } from '../models/appointment';

describe('AppointmentList with Task Completion', () => {
  let component: AppointmentList;
  let fixture: ComponentFixture<AppointmentList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentList],
    }).compileComponents();

    fixture = TestBed.createComponent(AppointmentList);
    component = fixture.componentInstance;
    
    // Clear localStorage before each test
    localStorage.clear();
    
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load appointments from localStorage on init', () => {
    const mock: Appointment[] = [
      { id: 1, title: 'Test', date: new Date(), completed: false }
    ];
    localStorage.setItem('appointments-list', JSON.stringify(mock));
    
    const newComponent = fixture.componentInstance;
    newComponent.ngOnInit?.();
    
    expect(newComponent.appointments().length).toBe(1);
  });

  it('should initialize empty if localStorage is empty', () => {
    expect(component.appointments().length).toBe(0);
  });

  it('should separate active and completed tasks', () => {
    const appointments: Appointment[] = [
      { id: 1, title: 'Active', date: new Date(), completed: false },
      { id: 2, title: 'Completed', date: new Date(), completed: true },
    ];
    component.appointments.set(appointments);
    
    expect(component.activeTasks().length).toBe(1);
    expect(component.completedTasks().length).toBe(1);
  });

  it('should toggle task completion', () => {
    const appointment: Appointment = {
      id: 1,
      title: 'Test',
      date: new Date(),
      completed: false
    };
    component.appointments.set([appointment]);
    
    component.toggleTaskCompletion(appointment);
    
    const updated = component.appointments()[0];
    expect(updated.completed).toBeTrue();
  });

  it('should persist to localStorage on toggle', () => {
    const appointment: Appointment = {
      id: 1,
      title: 'Test',
      date: new Date(),
      completed: false
    };
    component.appointments.set([appointment]);
    
    component.toggleTaskCompletion(appointment);
    
    const stored = localStorage.getItem('appointments-list');
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored!);
    expect(parsed[0].completed).toBeTrue();
  });
});
```

**Why**: Ensures new functionality works correctly; provides regression protection.

---

## Testing the Feature

### Manual Testing Steps

1. **Start the app**:
   ```bash
   npm start
   ```

2. **Open in browser**: http://localhost:4200

3. **Test active task**:
   - See appointments in "Active Tasks" section
   - Click checkbox next to an appointment
   - Verify it moves to "Completed Tasks" section

4. **Test persistence**:
   - Refresh the page (F5)
   - Verify completed task still appears in completed section

5. **Test undo**:
   - In "Completed Tasks" section, click checkbox again
   - Verify it moves back to "Active Tasks"

### Automated Testing

```bash
# Run unit tests
npm test

# Run with coverage
ng test --code-coverage
```

---

## Common Issues & Troubleshooting

### Issue: Changes not persisting
- **Cause**: localStorage disabled or full
- **Fix**: Check browser DevTools > Application > Local Storage

### Issue: Completed tasks not appearing
- **Cause**: Missing completed property in data or filter logic error
- **Fix**: Check browser console for errors; verify `completed?: boolean` in model

### Issue: Checkbox not responsive
- **Cause**: Event binding not working or toggle method not called
- **Fix**: Verify `(change)="toggleTaskCompletion(appointment)"` in template

### Issue: Performance lag with many tasks
- **Cause**: Large array filtering or excessive re-renders
- **Fix**: Consider pagination or virtual scrolling (future enhancement)

---

## Next Steps

- [ ] Implement Steps 1-5 above
- [ ] Run unit tests and verify all pass
- [ ] Perform manual testing
- [ ] Code review with team
- [ ] Deploy to staging
- [ ] User acceptance testing
- [ ] Deploy to production

---

## References

- **Data Model**: [data-model.md](../data-model.md)
- **Component Contract**: [contracts/component-interface.md](../contracts/component-interface.md)
- **Feature Spec**: [spec.md](../spec.md)
- **Angular Signals**: https://angular.dev/guide/signals
- **localStorage API**: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage

---

## Support

For questions about implementation:
1. Check the Feature Spec: `specs/001-task-completion-checkbox/spec.md`
2. Review the Component Contract: `specs/001-task-completion-checkbox/contracts/component-interface.md`
3. Check test examples: `src/app/appointment-list/appointment-list.spec.ts`
