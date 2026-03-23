# Component Interface Contracts: doit Goal Tracking App

**Version**: 1.0  
**Last Updated**: March 22, 2026  
**Purpose**: Define component boundaries and API contracts for implementation

---

## GoalItemComponent

**Purpose**: Render a single goal with actions  
**Location**: `src/app/doit/goal-item/goal-item.component.ts`

### Inputs

```typescript
@Input() goal!: Goal;
```
Type: `Goal`  
Required: Yes  
Description: The goal object to display  
Example:
```typescript
{
  id: 'goal-123',
  title: 'Complete project documentation',
  endDate: '2026-04-15',
  isCompleted: false,
  completionDate: null,
  createdAt: 1711100400000,
  updatedAt: 1711100400000
}
```

```typescript
@Input() isCompleted: boolean = false;
```
Type: `boolean`  
Required: No  
Default: `false`  
Description: Whether to render in completed state (visual styling)

### Outputs

```typescript
@Output() complete = new EventEmitter<string>();
```
Type: `EventEmitter<string>`  
Description: Emitted when user checks the goal checkbox  
Payload: Goal id (string)  
Example:
```typescript
this.complete.emit('goal-123');
```

```typescript
@Output() delete = new EventEmitter<string>();
```
Type: `EventEmitter<string>`  
Description: Emitted when user clicks delete button  
Payload: Goal id (string)  
Example:
```typescript
this.delete.emit('goal-123');
```

### Methods (Public)

```typescript
daysRemaining(): number
```
Returns: Number of days until goal end date  
Behavior: Calculates from goal.endDate to today  
Returns 0 if goal is completed

```typescript
isUrgent(): boolean
```
Returns: True if goal has ≤3 days remaining  
Behavior: Based on daysRemaining() calculation  
Returns false if goal is completed

### Template Structure

```html
<div class="goal-item" [ngClass]="{ 'goal-item--completed': isCompleted, 'goal-item--urgent': isUrgent() }">
  
  <!-- Checkbox (only for active goals) -->
  <input *ngIf="!isCompleted"
         type="checkbox"
         class="goal-checkbox"
         [attr.aria-label]="'Mark ' + goal.title + ' as complete'"
         (change)="complete.emit(goal.id)">
  
  <!-- Goal content -->
  <div class="goal-content">
    <h3 class="goal-title">{{ goal.title }}</h3>
    <p class="goal-deadline">
      Due: {{ goal.endDate | date: 'MMM d, y' }}
      <span *ngIf="!isCompleted" class="goal-days">
        {{ daysRemaining() }} days remaining
      </span>
      <span *ngIf="isCompleted" class="goal-completed">
        Completed: {{ goal.completionDate | date: 'MMM d, y' }}
      </span>
    </p>
  </div>
  
  <!-- Delete button -->
  <button class="btn-delete"
          type="button"
          aria-label="Delete goal"
          (click)="delete.emit(goal.id)">
    ×
  </button>
  
</div>
```

### CSS Classes

```css
.goal-item                 /* Base goal item card */
.goal-item--completed      /* Applied when isCompleted = true */
.goal-item--urgent         /* Applied when isUrgent() = true */
.goal-checkbox             /* Checkbox input */
.goal-content              /* Text content container */
.goal-title                /* Goal title heading */
.goal-deadline             /* Deadline/days info */
.goal-days                 /* Days remaining text */
.goal-completed            /* Completion date text */
.btn-delete                /* Delete button */
```

---

## NewGoalModalComponent

**Purpose**: Modal dialog for creating new goals  
**Location**: `src/app/doit/new-goal-modal/new-goal-modal.component.ts`

### Inputs

None

### Outputs

```typescript
@Output() created = new EventEmitter<void>();
```
Type: `EventEmitter<void>`  
Description: Emitted when goal is successfully created  
Usage: Parent closes modal and reloads goals

```typescript
@Output() closed = new EventEmitter<void>();
```
Type: `EventEmitter<void>`  
Description: Emitted when user cancels/closes modal  
Usage: Parent closes modal without changes

### Form Structure

```typescript
form = this.fb.group({
  title: ['', [Validators.required, Validators.maxLength(200)]],
  endDate: ['', [Validators.required]]
});
```

### Methods (Public)

```typescript
onSubmit(): void
```
Behavior:
1. Validate form
2. Call GoalService.createGoal()
3. Emit `created` event
4. Modal should be hidden by parent

```typescript
onCancel(): void
```
Behavior: Emit `closed` event without creating goal

### Validation Rules

| Field | Rules | Message |
|-------|-------|---------|
| title | Required, max 200 chars | "Title is required" / "Title too long" |
| endDate | Required, must be future date | "End date is required" / "End date must be in future" |

### Template Structure

```html
<div class="modal-overlay" (click)="onCancel()">
  <div class="modal-content" (click)="$event.stopPropagation()">
    
    <div class="modal-header">
      <h2>New Goal</h2>
      <button type="button" class="btn-close" (click)="onCancel()">×</button>
    </div>
    
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="modal-form">
      
      <div class="form-group">
        <label for="title">Goal Title</label>
        <input id="title"
               type="text"
               formControlName="title"
               placeholder="What do you want to accomplish?">
        <span *ngIf="form.get('title')?.errors?.['required']" class="error-message">
          Title is required
        </span>
      </div>
      
      <div class="form-group">
        <label for="endDate">End Date</label>
        <input id="endDate"
               type="date"
               formControlName="endDate">
        <span *ngIf="form.get('endDate')?.errors?.['required']" class="error-message">
          End date is required
        </span>
      </div>
      
      <div class="modal-actions">
        <button type="button" class="btn btn-secondary" (click)="onCancel()">
          Cancel
        </button>
        <button type="submit" class="btn btn-primary" [disabled]="!form.valid">
          Add Goal
        </button>
      </div>
      
    </form>
    
  </div>
</div>
```

### CSS Classes

```css
.modal-overlay        /* Background overlay */
.modal-content        /* Modal dialog box */
.modal-header         /* Header section */
.modal-form          /* Form wrapper */
.form-group          /* Field wrapper */
.modal-actions       /* Button container */
.btn-close           /* Close button */
.error-message       /* Validation error text */
```

---

## ActiveGoalsComponent

**Purpose**: Display goals in active column  
**Location**: `src/app/doit/active-goals/active-goals.component.ts`

### Inputs

```typescript
@Input() goals: Goal[] = [];
```
Type: `Goal[]`  
Description: Array of active (non-completed) goals  
Behavior: Component sorts and displays them

### Outputs

```typescript
@Output() goalCompleted = new EventEmitter<string>();
```
Type: `EventEmitter<string>`  
Payload: Goal id

```typescript
@Output() goalDeleted = new EventEmitter<string>();
```
Type: `EventEmitter<string>`  
Payload: Goal id

### Behavior

- Displays goals sorted by endDate (ascending)
- Shows "No active goals" message if empty
- Displays goal count in header
- Handles goal completion and deletion

### Template Structure

```html
<section class="column column--active">
  <div class="column-header">
    <h2>Active Goals</h2>
    <span class="goal-count">{{ goals.length }}</span>
  </div>
  
  <div class="goals-list">
    <app-goal-item *ngFor="let goal of getSortedGoals(); trackBy: trackByGoalId"
                   [goal]="goal"
                   (complete)="goalCompleted.emit($event)"
                   (delete)="goalDeleted.emit($event)">
    </app-goal-item>
  </div>
  
  <div *ngIf="goals.length === 0" class="empty-state">
    <p>No active goals. Great job! 🎉</p>
  </div>
</section>
```

---

## CompletedGoalsComponent

**Purpose**: Display goals in completed column  
**Location**: `src/app/doit/completed-goals/completed-goals.component.ts`

### Inputs

```typescript
@Input() goals: Goal[] = [];
```
Type: `Goal[]`  
Description: Array of completed goals

### Outputs

```typescript
@Output() goalDeleted = new EventEmitter<string>();
```
Type: `EventEmitter<string>`  
Payload: Goal id

### Behavior

- Displays completed goals with visual distinction
- Shows "No completed goals" message if empty
- Displays completion count
- Allows deletion only

### Template Structure

```html
<section class="column column--completed">
  <div class="column-header">
    <h2>Completed</h2>
    <span class="goal-count">{{ goals.length }}</span>
  </div>
  
  <div class="goals-list">
    <app-goal-item *ngFor="let goal of goals; trackBy: trackByGoalId"
                   [goal]="goal"
                   [isCompleted]="true"
                   (delete)="goalDeleted.emit($event)">
    </app-goal-item>
  </div>
  
  <div *ngIf="goals.length === 0" class="empty-state">
    <p>Complete your first goal! 🚀</p>
  </div>
</section>
```

---

## DoitComponent (Container)

**Purpose**: Main app container orchestrating data flow  
**Location**: `src/app/doit/doit.component.ts`

### State

```typescript
public activeGoals: Goal[] = [];
public completedGoals: Goal[] = [];
public isModalOpen: boolean = false;
```

### Data Flow

```
GoalService
    ↓
DoitComponent
    ├─→ ActiveGoalsComponent →→ GoalItemComponent
    ├─→ CompletedGoalsComponent →→ GoalItemComponent
    └─→ NewGoalModalComponent
```

### Event Handlers

```typescript
openModal(): void {
  this.isModalOpen = true;
}

closeModal(): void {
  this.isModalOpen = false;
}

onGoalCreated(): void {
  this.loadGoals();
  this.closeModal();
}

onGoalCompleted(goalId: string): void {
  this.goalService.completeGoal(goalId);
  this.loadGoals();
}

onGoalDeleted(goalId: string): void {
  this.goalService.deleteGoal(goalId);
  this.loadGoals();
}

private loadGoals(): void {
  this.activeGoals = this.goalService.getActiveGoals();
  this.completedGoals = this.goalService.getCompletedGoals();
}
```

### Template Structure

```html
<div class="doit-container">
  <header class="doit-header">
    <h1>doit</h1>
    <button class="btn btn-primary" (click)="openModal()">
      + New Goal
    </button>
  </header>
  
  <main class="doit-main">
    <div class="goals-columns">
      <app-active-goals [goals]="activeGoals"
                        (goalCompleted)="onGoalCompleted($event)"
                        (goalDeleted)="onGoalDeleted($event)">
      </app-active-goals>
      
      <app-completed-goals [goals]="completedGoals"
                           (goalDeleted)="onGoalDeleted($event)">
      </app-completed-goals>
    </div>
  </main>
  
  <app-new-goal-modal *ngIf="isModalOpen"
                      (created)="onGoalCreated()"
                      (closed)="closeModal()">
  </app-new-goal-modal>
</div>
```

---

## GoalService Interface

**Purpose**: Handle all goal data operations  
**Location**: `src/app/services/goal.service.ts`

### Public Methods

```typescript
getAllGoals(): Goal[]
```
Returns all goals in storage

```typescript
getActiveGoals(): Goal[]
```
Returns goals with isCompleted = false, sorted by endDate ascending

```typescript
getCompletedGoals(): Goal[]
```
Returns goals with isCompleted = true

```typescript
createGoal(title: string, endDate: string): Goal
```
Creates new goal and persists to storage  
Parameters:
- `title`: Goal title (1-200 chars)
- `endDate`: ISO date string (YYYY-MM-DD)

Returns: Created Goal object

```typescript
completeGoal(goalId: string): void
```
Marks goal complete, sets completionDate to today

```typescript
deleteGoal(goalId: string): void
```
Permanently removes goal from storage

```typescript
getDaysRemaining(goal: Goal): number
```
Calculates days until goal.endDate  
Returns: Non-negative integer

```typescript
isUrgent(goal: Goal): boolean
```
Returns: true if goal has ≤3 days remaining

---

## Type Contracts

### Goal Interface

```typescript
interface Goal {
  id: string;                    // Unique identifier
  title: string;                 // 1-200 characters
  endDate: string;               // ISO format: YYYY-MM-DD
  isCompleted: boolean;          // Status flag
  completionDate: string | null; // ISO format or null
  createdAt: number;             // Timestamp in milliseconds
  updatedAt: number;             // Timestamp in milliseconds
}
```

---

## Event Flow Diagram

```
User Action                Component              Service            Storage
─────────────────────────────────────────────────────────────────────────
[Click "New Goal"]   
    │
    └──→ openModal()
         isModalOpen = true
         │
[Fill form + submit]
    │
    └──→ NewGoalModalComponent
         onSubmit()
         │
         └──→ GoalService.createGoal()
              │
              └──→ localStorage.setItem()
         created.emit()
    
    ├──→ DoitComponent.onGoalCreated()
    │    loadGoals()
    │    │
    │    └──→ GoalService.getActiveGoals()
    │         GoalService.getCompletedGoals()
    │
    ├──→ activeGoals = [...]
    ├──→ completedGoals = [...]
    └──→ closeModal()

[Click goal checkbox]
    │
    └──→ GoalItemComponent.complete.emit()
         │
         └──→ ActiveGoalsComponent.goalCompleted.emit()
              │
              └──→ DoitComponent.onGoalCompleted()
                   │
                   └──→ GoalService.completeGoal()
                        │
                        └──→ localStorage.setItem()
                   
                   └──→ loadGoals() [refresh]
```

---

## Integration Points

### Module Imports
```typescript
// app.module.ts (if using module-based architecture)
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DoitComponent } from './doit/doit.component';
import { GoalService } from './services/goal.service';

@NgModule({
  declarations: [DoitComponent, /* other components */],
  imports: [CommonModule, ReactiveFormsModule],
  providers: [GoalService]
})
export class AppModule { }
```

### Or Standalone Components (Angular 14+)
```typescript
// doit.component.ts
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-doit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ActiveGoalsComponent,
    CompletedGoalsComponent,
    NewGoalModalComponent
  ],
  templateUrl: './doit.component.html',
  styleUrls: ['./doit.component.css']
})
export class DoitComponent { }
```

---

## Testing Contracts

### GoalItemComponent Test
```typescript
// Should emit complete with goal id when checkbox clicked
// Should emit delete with goal id when delete clicked
// Should display daysRemaining() in template
// Should apply urgent class when isUrgent() = true
// Should show different content when isCompleted = true
```

### NewGoalModalComponent Test
```typescript
// Should not emit created if form invalid
// Should emit created with no payload on successful submit
// Should emit closed when cancel clicked
// Should validate title required and maxLength
// Should validate endDate required and future only
```

### ActiveGoalsComponent Test
```typescript
// Should display all passed goals
// Should sort goals by endDate ascending
// Should emit goalCompleted when child emits complete
// Should emit goalDeleted when child emits delete
// Should show empty state message when no goals
```

### DoitComponent Test
```typescript
// Should load goals on init
// Should open/close modal
// Should update activeGoals and completedGoals when goal created
// Should call goalService methods on goal complete/delete
// Should display modal only when isModalOpen = true
```

---

## Related Documentation

- **Specification**: [spec.md](../spec.md)
- **Data Model**: [data-model.md](../data-model.md)
- **Implementation Plan**: [plan.md](../plan.md)
- **Research**: [research.md](../research.md)
- **Quick Start**: [quickstart.md](../quickstart.md)
