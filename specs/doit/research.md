# Research & Design Analysis: doit Goal Tracking App

**Version**: 1.0  
**Last Updated**: March 22, 2026  
**Purpose**: Document design patterns, architectural decisions, and best practices for implementation

---

## Design Patterns & Architecture

### 1. Component Architecture Pattern

**Pattern**: Smart/Container & Dumb/Presentational Components

```
Smart Components (Containers):
- doit.component: Main app container
- active-goals.component: Active column container
- completed-goals.component: Completed column container
- new-goal-modal.component: Modal container

Dumb Components (Presentational):
- goal-item.component: Reusable goal display
```

**Benefits**:
- Clear separation of concerns
- Easier testing of presentation logic
- Reusable presentational components
- Clear data flow (down via @Input, up via @Output)

**Implementation Guidance**:
- Container components handle data fetching from service
- Containers manage state and pass to presentational components
- Presentational components only render passed data
- Use @Output events for child-to-parent communication

---

### 2. Service Pattern for Data Management

**Pattern**: Centralized Service with Local State

```typescript
// GoalService acts as single source of truth
- Manages all goal data
- Provides CRUD methods
- Handles persistence to localStorage
- Exposes observable streams (optional: RxJS)
```

**Benefits**:
- Single source of truth for goal data
- Consistent data access across components
- Centralized persistence logic
- Easier to add caching or optimization later

**localStorage Implementation**:
```typescript
// Synchronous storage pattern
private goals: Goal[] = [];

constructor() {
  this.loadGoalsFromStorage();
}

private loadGoalsFromStorage(): void {
  const stored = localStorage.getItem('doit:goals');
  this.goals = stored ? JSON.parse(stored) : [];
}

private saveGoalsToStorage(): void {
  localStorage.setItem('doit:goals', JSON.stringify(this.goals));
}
```

---

### 3. Form Handling Pattern

**Pattern**: Reactive Forms with Validation

```typescript
// Use Angular Reactive Forms for modal form
form = this.fb.group({
  title: ['', [
    Validators.required,
    Validators.minLength(1),
    Validators.maxLength(200)
  ]],
  endDate: ['', [
    Validators.required,
    this.futureDateValidator
  ]]
});

// Custom validator for future dates
futureDateValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  
  const selectedDate = new Date(control.value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return selectedDate >= today ? null : { pastDate: true };
}
```

**Benefits**:
- Type-safe form handling
- Built-in validation framework
- Reactive data flow
- Easy error message display

---

### 4. State Management Considerations

### Option A: Component Local State (Simplest - Recommended for MVP)

```typescript
// doit.component.ts
export class DoitComponent implements OnInit {
  public goals$: Observable<Goal[]>;
  public isModalOpen = false;
  
  constructor(private goalService: GoalService) {
    this.goals$ = this.goalService.getGoals$.asObservable();
  }
  
  openModal(): void {
    this.isModalOpen = true;
  }
  
  closeModal(): void {
    this.isModalOpen = false;
  }
}
```

**Advantages**: Simple, minimal dependencies, fast to implement  
**Disadvantages**: State scattered across components  
**Best for**: MVP phase

### Option B: State Management with RxJS (Recommended for future scaling)

```typescript
// Use BehaviorSubject for reactive state
export class GoalService {
  private goalsSubject = new BehaviorSubject<Goal[]>([]);
  public goals$ = this.goalsSubject.asObservable();
  
  addGoal(goal: Goal): void {
    const current = this.goalsSubject.value;
    this.goalsSubject.next([...current, goal]);
    this.saveGoalsToStorage();
  }
  
  completeGoal(id: string): void {
    const updated = this.goalsSubject.value.map(g =>
      g.id === id ? { ...g, isCompleted: true } : g
    );
    this.goalsSubject.next(updated);
    this.saveGoalsToStorage();
  }
}
```

**Advantages**: Reactive data flow, easier testing, scales well  
**Disadvantages**: More complex, additional dependencies  
**Best for**: Future enhancements

### Recommendation for MVP
Use **Option A** (component local state) for simplicity, migrate to **Option B** if feature grows significantly.

---

### 5. Change Detection Strategy

**Strategy**: OnPush Change Detection for Performance

```typescript
@Component({
  selector: 'app-goal-item',
  templateUrl: './goal-item.component.html',
  styleUrls: ['./goal-item.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GoalItemComponent {
  @Input() goal!: Goal;
  @Output() complete = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();
}
```

**Benefits**:
- Only checks component when inputs change
- Better performance with many goals
- Encourages immutable patterns

**Considerations**:
- Requires immutable data patterns
- Need to ensure proper change notifications

---

## Layout & Responsive Design

### Grid-Based Layout Approach

```html
<!-- Main container with CSS Grid -->
<div class="doit-container">
  <header class="doit-header">
    <h1>doit</h1>
    <button class="btn-new-goal">+ New Goal</button>
  </header>
  
  <main class="doit-main">
    <div class="goals-columns">
      <section class="column column--active">
        <!-- Active goals column -->
      </section>
      
      <section class="column column--completed">
        <!-- Completed goals column -->
      </section>
    </div>
  </main>
</div>
```

### CSS Grid Definition

```css
/* Desktop (>1024px) */
.goals-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  padding: 2rem;
}

/* Tablet (768px - 1024px) */
@media (max-width: 1024px) {
  .goals-columns {
    grid-template-columns: 1fr;
    padding: 1.5rem;
  }
}

/* Mobile (<768px) */
@media (max-width: 768px) {
  .goals-columns {
    padding: 1rem;
  }
  
  .column {
    padding: 1rem;
    border-radius: 8px;
  }
}
```

### Pastel Color Palette

```css
/* Primary Colors (Pastel) */
--color-primary-light: #F0E8FF;     /* Soft lavender */
--color-primary: #D8BFE8;            /* Lavender */
--color-active-bg: #E8F5F0;          /* Soft mint */
--color-completed-bg: #FFF5E8;       /* Soft peach */
--color-urgency: #FFB3BA;            /* Soft red/pink */
--color-success: #B3E5BA;            /* Soft green */

/* Text & Neutral */
--color-text-dark: #333333;
--color-text-light: #666666;
--color-border: #E0E0E0;
--color-background: #FAFAFA;

/* Column Styling */
.column--active {
  background-color: var(--color-active-bg);
  border-left: 4px solid var(--color-primary);
}

.column--completed {
  background-color: var(--color-completed-bg);
  border-left: 4px solid var(--color-success);
}
```

---

## Visual Design Standards

### Typography

```css
/* Headings */
h1 { font-size: 2rem; font-weight: 700; color: var(--color-text-dark); }
h2 { font-size: 1.5rem; font-weight: 600; color: var(--color-text-dark); }
h3 { font-size: 1.125rem; font-weight: 600; }

/* Body Text */
body { font-size: 1rem; line-height: 1.5; color: var(--color-text-light); }
.small { font-size: 0.875rem; }

/* Font Family */
body { font-family: 'Segoe UI', -apple-system, sans-serif; }
```

### Spacing System (8px baseline)

```css
/* Consistent spacing increments */
--spacing-xs: 0.25rem;   /* 4px */
--spacing-sm: 0.5rem;    /* 8px */
--spacing-md: 1rem;      /* 16px */
--spacing-lg: 1.5rem;    /* 24px */
--spacing-xl: 2rem;      /* 32px */
```

### Component Style Guide

#### Goal Item Card

```css
.goal-item {
  padding: var(--spacing-md);
  background: white;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  transition: all 0.2s ease;
  margin-bottom: var(--spacing-md);
}

.goal-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.goal-item.urgent {
  border-left: 3px solid var(--color-urgency);
  background-color: #FFF0F0;
}

.goal-item.completed {
  opacity: 0.7;
  text-decoration: line-through;
}
```

#### Buttons

```css
.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  font-size: 1rem;
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  background-color: #C4A8D8;
  transform: translateY(-1px);
}

.btn-secondary {
  background-color: transparent;
  border: 2px solid var(--color-border);
  color: var(--color-text-dark);
}

.btn-danger {
  background-color: var(--color-urgency);
  color: white;
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
}
```

#### Modal

```css
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: var(--spacing-lg);
  max-width: 500px;
  width: 90%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.modal-header {
  margin-bottom: var(--spacing-lg);
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: var(--color-text-dark);
}

.form-group input {
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 1rem;
  font-family: inherit;
}

.form-group input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(216, 191, 232, 0.1);
}
```

---

## Accessibility Considerations

### WCAG 2.1 Level AA Compliance

1. **Color Contrast**:
   - Ensure text colors have sufficient contrast (4.5:1 for normal text)
   - Don't rely on color alone for urgency indicator
   - Use icons + color for better accessibility

2. **Keyboard Navigation**:
   - All interactive elements focusable with Tab key
   - Modal can be closed with Escape key
   - Focus visible on all elements (outline or border)
   - Logical tab order through form fields

3. **ARIA Labels**:
   ```html
   <!-- Modal button -->
   <button aria-label="Open new goal dialog" (click)="openModal()">
     + New Goal
   </button>
   
   <!-- Checkbox -->
   <input type="checkbox" 
          [attr.aria-label]="'Mark ' + goal.title + ' as complete'"
          (change)="onComplete()">
   
   <!-- Column headers -->
   <h2 id="active-goals-title">Active Goals</h2>
   <section aria-labelledby="active-goals-title" role="region">
   ```

4. **Focus Management**:
   - Focus moves to modal when opened
   - Focus returns to trigger button when modal closes
   - Skip to main content link for keyboard users

5. **Semantic HTML**:
   - Use `<button>` for clickable actions
   - Use `<form>` for modal form
   - Use `<section>` for columns
   - Use proper heading hierarchy

---

## Testing Strategy

### Unit Testing Approach

```typescript
// Example: Goal Service Tests
describe('GoalService', () => {
  let service: GoalService;
  
  beforeEach(() => {
    service = new GoalService();
    localStorage.clear();
  });
  
  it('should create a new goal', () => {
    const goal = service.createGoal('Test', new Date());
    expect(goal.title).toBe('Test');
    expect(goal.isCompleted).toBe(false);
  });
  
  it('should persist goal to localStorage', () => {
    service.createGoal('Test', new Date());
    const stored = JSON.parse(localStorage.getItem('doit:goals') || '[]');
    expect(stored.length).toBe(1);
  });
});
```

### Component Testing Pattern

```typescript
// Example: Goal Item Component Tests
describe('GoalItemComponent', () => {
  let component: GoalItemComponent;
  let fixture: ComponentFixture<GoalItemComponent>;
  
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GoalItemComponent ]
    }).compileComponents();
    
    fixture = TestBed.createComponent(GoalItemComponent);
    component = fixture.componentInstance;
  });
  
  it('should emit complete event when checkbox checked', () => {
    spyOn(component.complete, 'emit');
    component.goal = { id: '1', title: 'Test' } as Goal;
    fixture.detectChanges();
    
    const checkbox = fixture.debugElement.query(By.css('input[type="checkbox"]'));
    checkbox.nativeElement.click();
    
    expect(component.complete.emit).toHaveBeenCalledWith('1');
  });
});
```

---

## Performance Optimization Guidelines

### Rendering Performance

1. **Virtual Scrolling** (if >100 goals):
   ```typescript
   // Use CDK virtual scroll
   import { ScrollingModule } from '@angular/cdk/scrolling';
   
   // In template
   <cdk-virtual-scroll-viewport itemSize="80">
     <app-goal-item *cdkVirtualFor="let goal of goals" [goal]="goal">
     </app-goal-item>
   </cdk-virtual-scroll-viewport>
   ```

2. **Change Detection**:
   - Use OnPush strategy
   - Immutable data patterns
   - Limit template expressions

3. **Lazy Loading**:
   - Load completed goals on demand
   - Collapse completed section by default (if many goals)

### Storage Performance

1. **localStorage Limitations**:
   - ~5-10MB limit per domain
   - Synchronous API (blocks UI)
   - Consider IndexedDB for >10,000 goals

2. **Optimization Strategy**:
   - Serialize only needed fields
   - Consider compression for metadata
   - Implement archival for very old goals

---

## Browser Compatibility

### Target Browsers

| Browser | Version | Notes |
|---------|---------|-------|
| Chrome | Latest 2 | Primary target |
| Firefox | Latest 2 | Full support |
| Safari | Latest 2 | Full support |
| Edge | Latest 2 | Full support |

### Feature Detection

```typescript
// Check localStorage availability
if (typeof localStorage !== 'undefined') {
  // Safe to use
} else {
  // Fallback to session storage or in-memory
}
```

---

## Deployment & Environment Considerations

### Build Configuration

```typescript
// Environment setup
// environment.ts (development)
export const environment = {
  production: false,
  persistenceMethod: 'localStorage',
  logLevel: 'debug'
};

// environment.prod.ts (production)
export const environment = {
  production: true,
  persistenceMethod: 'localStorage',
  logLevel: 'error'
};
```

### Production Considerations

1. **Bundle Size**: Tree-shake unused Angular modules
2. **Caching**: Leverage browser caching for static assets
3. **Compression**: Enable gzip compression on deployment
4. **Monitoring**: Log errors for production debugging

---

## Future Enhancement Considerations

### Scalability Path

1. **Server-Side Persistence**: Replace localStorage with API
2. **Real-Time Sync**: Add WebSocket support for multi-device
3. **Goal Categories**: Add tagging/grouping system
4. **Analytics**: Track completion rates and trends
5. **Notifications**: Add browser notifications for deadlines
6. **Collaboration**: Add sharing and team features

### Migration Strategy
- Plan database schema alongside localStorage structure
- Build API layer that mirrors current service interface
- Gradual migration path without breaking changes

---

## Related Documentation

- **Specification**: [spec.md](spec.md) - Feature requirements
- **Implementation Plan**: [plan.md](plan.md) - Development roadmap
- **Data Model**: [data-model.md](data-model.md) - Storage schema
- **Quick Start**: [quickstart.md](quickstart.md) - Setup guide
