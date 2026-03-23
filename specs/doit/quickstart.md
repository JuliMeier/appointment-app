# Quick Start Guide: doit Goal Tracking App

**Version**: 1.0  
**Last Updated**: March 22, 2026  
**Audience**: Developers implementing the doit feature

---

## Prerequisites

Before starting implementation, ensure you have:

- **Node.js**: v16 or higher
- **npm**: v7 or higher
- **Angular CLI**: Latest version
- **VS Code**: With Angular extensions installed
- **Git**: For version control

Verify installation:
```bash
node --version
npm --version
ng version
```

---

## Project Structure

```
appointment-app/
├── src/
│   ├── app/
│   │   ├── doit/                 # NEW: doit feature
│   │   │   ├── doit.component.ts
│   │   │   ├── doit.component.html
│   │   │   ├── doit.component.css
│   │   │   ├── doit.component.spec.ts
│   │   │   ├── active-goals/
│   │   │   ├── completed-goals/
│   │   │   ├── goal-item/
│   │   │   └── new-goal-modal/
│   │   ├── models/
│   │   │   ├── appointment.ts     # Existing
│   │   │   └── goal.ts            # NEW
│   │   ├── services/
│   │   │   └── goal.service.ts    # NEW
│   │   ├── app.routes.ts          # Update with doit route
│   │   └── app.ts
│   ├── index.html
│   ├── main.ts
│   └── styles.css
├── specs/
│   └── doit/                      # Feature specification
│       ├── spec.md
│       ├── plan.md
│       ├── data-model.md
│       ├── research.md
│       ├── quickstart.md
│       └── checklists/
└── angular.json
```

---

## Implementation Checklist

### Phase 1: Setup & Models (2-3 hours)

- [ ] Create Goal model/interface in `src/app/models/goal.ts`
  ```bash
  ng generate interface models/goal --skip-tests
  ```

- [ ] Create Goal service in `src/app/services/`
  ```bash
  ng generate service services/goal
  ```

- [ ] Implement localStorage persistence in service
- [ ] Create unit tests for service
- [ ] Run tests: `npm test`

### Phase 2: Components (6-8 hours)

- [ ] Create main doit component
  ```bash
  ng generate component doit --skip-tests
  ```

- [ ] Create sub-components:
  ```bash
  ng generate component doit/active-goals --skip-tests
  ng generate component doit/completed-goals --skip-tests
  ng generate component doit/goal-item --skip-tests
  ng generate component doit/new-goal-modal --skip-tests
  ```

- [ ] Implement two-column layout HTML/CSS
- [ ] Add responsive design for mobile/tablet/desktop
- [ ] Implement data binding from service
- [ ] Create component unit tests

### Phase 3: Features (4-5 hours)

- [ ] Implement goal creation modal
- [ ] Add form validation
- [ ] Implement checkbox (mark complete)
- [ ] Implement delete functionality
- [ ] Add urgency indicator styling
- [ ] Implement days remaining calculation

### Phase 4: Testing & Polish (3-4 hours)

- [ ] Complete all unit tests
- [ ] Integration testing
- [ ] Responsive design testing
- [ ] Accessibility audit
- [ ] Performance optimization
- [ ] Documentation

---

## Step-by-Step Setup

### 1. Create Goal Model

Create `src/app/models/goal.ts`:

```typescript
export interface Goal {
  id: string;
  title: string;
  endDate: string;  // ISO format: YYYY-MM-DD
  isCompleted: boolean;
  completionDate: string | null;
  createdAt: number;  // Timestamp in ms
  updatedAt: number;  // Timestamp in ms
}
```

### 2. Create Goal Service

Create `src/app/services/goal.service.ts`:

```typescript
import { Injectable } from '@angular/core';
import { Goal } from '../models/goal';

@Injectable({
  providedIn: 'root'
})
export class GoalService {
  private readonly storageKey = 'doit:goals';
  private goals: Goal[] = [];

  constructor() {
    this.loadGoalsFromStorage();
  }

  // Load goals from localStorage
  private loadGoalsFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      this.goals = stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load goals from storage:', error);
      this.goals = [];
    }
  }

  // Save goals to localStorage
  private saveGoalsToStorage(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.goals));
    } catch (error) {
      console.error('Failed to save goals to storage:', error);
    }
  }

  // Get all goals
  getAllGoals(): Goal[] {
    return [...this.goals];
  }

  // Get active goals (not completed)
  getActiveGoals(): Goal[] {
    return this.goals.filter(g => !g.isCompleted).sort((a, b) => {
      return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
    });
  }

  // Get completed goals
  getCompletedGoals(): Goal[] {
    return this.goals.filter(g => g.isCompleted);
  }

  // Create new goal
  createGoal(title: string, endDate: string): Goal {
    const now = Date.now();
    const goal: Goal = {
      id: this.generateId(),
      title,
      endDate,
      isCompleted: false,
      completionDate: null,
      createdAt: now,
      updatedAt: now
    };

    this.goals.push(goal);
    this.saveGoalsToStorage();
    return goal;
  }

  // Mark goal as complete
  completeGoal(goalId: string): void {
    const goal = this.goals.find(g => g.id === goalId);
    if (goal && !goal.isCompleted) {
      goal.isCompleted = true;
      goal.completionDate = new Date().toISOString().split('T')[0];
      goal.updatedAt = Date.now();
      this.saveGoalsToStorage();
    }
  }

  // Delete goal permanently
  deleteGoal(goalId: string): void {
    this.goals = this.goals.filter(g => g.id !== goalId);
    this.saveGoalsToStorage();
  }

  // Calculate days remaining
  getDaysRemaining(goal: Goal): number {
    if (goal.isCompleted) {
      return 0;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endDate = new Date(goal.endDate);
    endDate.setHours(0, 0, 0, 0);

    const msPerDay = 24 * 60 * 60 * 1000;
    const days = Math.ceil((endDate.getTime() - today.getTime()) / msPerDay);

    return Math.max(0, days);
  }

  // Check if goal is urgent (≤3 days)
  isUrgent(goal: Goal): boolean {
    if (goal.isCompleted) {
      return false;
    }
    return this.getDaysRemaining(goal) <= 3;
  }

  // Generate unique ID
  private generateId(): string {
    return 'goal-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }
}
```

### 3. Create Main Component

Create `src/app/doit/doit.component.ts`:

```typescript
import { Component } from '@angular/core';
import { Goal } from '../models/goal';
import { GoalService } from '../services/goal.service';

@Component({
  selector: 'app-doit',
  templateUrl: './doit.component.html',
  styleUrls: ['./doit.component.css']
})
export class DoitComponent {
  public activeGoals: Goal[] = [];
  public completedGoals: Goal[] = [];
  public isModalOpen = false;

  constructor(private goalService: GoalService) {
    this.loadGoals();
  }

  private loadGoals(): void {
    this.activeGoals = this.goalService.getActiveGoals();
    this.completedGoals = this.goalService.getCompletedGoals();
  }

  public openModal(): void {
    this.isModalOpen = true;
  }

  public closeModal(): void {
    this.isModalOpen = false;
  }

  public onGoalCreated(): void {
    this.loadGoals();
    this.closeModal();
  }

  public onGoalCompleted(goalId: string): void {
    this.goalService.completeGoal(goalId);
    this.loadGoals();
  }

  public onGoalDeleted(goalId: string): void {
    this.goalService.deleteGoal(goalId);
    this.loadGoals();
  }
}
```

### 4. Create Main Template

Create `src/app/doit/doit.component.html`:

```html
<div class="doit-container">
  <header class="doit-header">
    <h1>doit</h1>
    <button class="btn btn-primary" (click)="openModal()">+ New Goal</button>
  </header>

  <main class="doit-main">
    <div class="goals-columns">
      <section class="column column--active">
        <h2>Active Goals</h2>
        <div class="goals-list">
          <app-goal-item
            *ngFor="let goal of activeGoals"
            [goal]="goal"
            (complete)="onGoalCompleted($event)"
            (delete)="onGoalDeleted($event)">
          </app-goal-item>
          <div *ngIf="activeGoals.length === 0" class="empty-state">
            No active goals. Great job! 🎉
          </div>
        </div>
      </section>

      <section class="column column--completed">
        <h2>Completed</h2>
        <div class="goals-list">
          <app-goal-item
            *ngFor="let goal of completedGoals"
            [goal]="goal"
            [isCompleted]="true"
            (delete)="onGoalDeleted($event)">
          </app-goal-item>
          <div *ngIf="completedGoals.length === 0" class="empty-state">
            Complete your first goal! 🚀
          </div>
        </div>
      </section>
    </div>
  </main>

  <!-- Modal -->
  <app-new-goal-modal
    *ngIf="isModalOpen"
    (created)="onGoalCreated()"
    (closed)="closeModal()">
  </app-new-goal-modal>
</div>
```

### 5. Add Route to App

Update `src/app/app.routes.ts`:

```typescript
import { Routes } from '@angular/router';
import { AppComponent } from './app';
import { DoitComponent } from './doit/doit.component';

export const routes: Routes = [
  {
    path: 'doit',
    component: DoitComponent
  },
  // ... other routes
];
```

---

## Development Workflow

### Run Development Server

```bash
# Terminal 1: Start dev server
npm run dev

# Application available at http://localhost:4200/doit
```

### Run Tests During Development

```bash
# Terminal 2: Watch mode testing
npm test

# Or specific test file
ng test --include='**/goal.service.spec.ts'
```

### Code Quality Checks

```bash
# Linting
ng lint

# Build for production
ng build --prod
```

---

## Common Development Tasks

### Add a new component

```bash
ng generate component doit/my-component --skip-tests
```

### Add a new service

```bash
ng generate service services/my-service
```

### Generate test file

```bash
ng test --watch
```

### Debug in Browser

1. Open DevTools: `F12`
2. Go to Sources tab
3. Set breakpoints in TypeScript
4. Use console to check variables

### Check localStorage

In browser console:
```javascript
// View all goals
JSON.parse(localStorage.getItem('doit:goals'))

// Clear all goals (reset data)
localStorage.removeItem('doit:goals')
```

---

## Styling Reference

### CSS Custom Properties

Create `src/styles.css` with design tokens:

```css
:root {
  /* Colors */
  --color-primary-light: #F0E8FF;
  --color-primary: #D8BFE8;
  --color-active-bg: #E8F5F0;
  --color-completed-bg: #FFF5E8;
  --color-urgency: #FFB3BA;
  --color-success: #B3E5BA;
  --color-text-dark: #333333;
  --color-text-light: #666666;
  --color-border: #E0E0E0;
  --color-background: #FAFAFA;

  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;

  /* Shadows */
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 2px 8px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 10px 40px rgba(0, 0, 0, 0.1);
}
```

---

## Testing Template

### Service Test Example

```typescript
describe('GoalService', () => {
  let service: GoalService;

  beforeEach(() => {
    service = new GoalService();
    localStorage.clear();
  });

  it('should create a goal', () => {
    const goal = service.createGoal('Test Goal', '2026-12-31');
    expect(goal.title).toBe('Test Goal');
    expect(goal.isCompleted).toBe(false);
  });

  it('should persist goal to storage', () => {
    service.createGoal('Test', '2026-12-31');
    const stored = JSON.parse(localStorage.getItem('doit:goals') || '[]');
    expect(stored.length).toBe(1);
  });

  it('should calculate days remaining', () => {
    const goal = service.createGoal('Test', '2026-12-31');
    const days = service.getDaysRemaining(goal);
    expect(typeof days).toBe('number');
    expect(days).toBeGreaterThan(0);
  });
});
```

---

## Debugging Tips

### Common Issues

**Issue**: Goals not persisting  
**Solution**: Check if localStorage is enabled in browser; check for quota exceeded errors

**Issue**: Component not updating  
**Solution**: Ensure service calls loadGoals() after changes; check change detection

**Issue**: Styles not applied  
**Solution**: Check CSS file is imported; clear browser cache; restart dev server

**Issue**: Date calculations wrong  
**Solution**: Ensure dates are in YYYY-MM-DD format; test with various timezones

### Debug Commands

```typescript
// In component
console.log('Active goals:', this.goalService.getActiveGoals());
console.log('Goal urgency:', this.goalService.isUrgent(goal));
console.log('Days remaining:', this.goalService.getDaysRemaining(goal));
```

---

## Performance Optimization Checklist

- [ ] Use OnPush change detection
- [ ] Implement trackBy in ngFor
- [ ] Minimize template expressions
- [ ] Lazy load if needed
- [ ] Compress bundle size
- [ ] Enable AOT compilation

Example trackBy:
```typescript
trackByGoalId(index: number, goal: Goal): string {
  return goal.id;
}
```

In template:
```html
<app-goal-item
  *ngFor="let goal of activeGoals; trackBy: trackByGoalId"
  [goal]="goal">
</app-goal-item>
```

---

## Deployment Checklist

- [ ] All tests passing
- [ ] No console errors
- [ ] Responsive design verified
- [ ] Accessibility audit complete
- [ ] Performance benchmarks met
- [ ] Documentation complete
- [ ] Build size optimized
- [ ] Environment configuration set

Build for production:
```bash
ng build --configuration production
```

---

## Resources

- [Angular Documentation](https://angular.io/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [MDN Web Docs](https://developer.mozilla.org/)
- [MDN localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)

---

## Next Steps

1. Follow the implementation checklist above
2. Reference [spec.md](spec.md) for requirements
3. Use [data-model.md](data-model.md) for storage details
4. Check [research.md](research.md) for design patterns
5. Reference [plan.md](plan.md) for task breakdown

**Ready to start?** Begin with Phase 1 setup and model creation!
