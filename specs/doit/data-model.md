# Data Model Documentation: doit Goal Tracking App

**Version**: 1.0  
**Last Updated**: March 22, 2026

---

## Entity Relationship Diagram

```
┌─────────────────────────┐
│       Goal              │
├─────────────────────────┤
│ id (UUID)               │
│ title (string)          │
│ endDate (Date)          │
│ isCompleted (boolean)   │
│ completionDate (Date?)  │
│ createdAt (Timestamp)   │
│ updatedAt (Timestamp)   │
└─────────────────────────┘
```

---

## Goal Entity

### Definition
A Goal represents a single objective that a user wants to track. Goals have a title, end date, and completion status.

### Attributes

| Attribute | Type | Required | Constraints | Description |
|-----------|------|----------|-------------|-------------|
| id | UUID or String | Yes | Unique | Auto-generated unique identifier for the goal |
| title | String | Yes | 1-200 chars | User-provided goal title/description |
| endDate | Date | Yes | ≥ today | Target completion date for the goal |
| isCompleted | Boolean | Yes | true/false | Whether the goal has been completed |
| completionDate | Date | No | ≤ today | Date when goal was marked complete (only if isCompleted = true) |
| createdAt | Timestamp | Yes | Auto | Server timestamp when goal was created |
| updatedAt | Timestamp | Yes | Auto | Server timestamp of last modification |

### Validations

```yaml
id:
  - Must be unique across all goals
  - Auto-generated on creation
  
title:
  - Must be non-empty
  - Max length: 200 characters
  - Trimmed of leading/trailing whitespace
  
endDate:
  - Must be a valid date
  - Must be >= today (future dates only)
  - Cannot be edited after creation
  
isCompleted:
  - Valid values: true, false
  - Defaults to false on creation
  - Cannot be edited directly; changed via completion action
  
completionDate:
  - Must be null if isCompleted = false
  - Must be set to current date if isCompleted = true
  - Automatically set; not user-editable
```

---

## Data Storage Architecture

### Client-Side Storage (Primary)

**Implementation**: Browser localStorage API

```typescript
// Storage Key Structure
localStorage.getItem('doit:goals') // Returns JSON array of Goal objects

// Data Format
[
  {
    "id": "uuid-1",
    "title": "Complete project documentation",
    "endDate": "2026-04-15",
    "isCompleted": false,
    "completionDate": null,
    "createdAt": 1711100400000,
    "updatedAt": 1711100400000
  },
  {
    "id": "uuid-2",
    "title": "Learn TypeScript basics",
    "endDate": "2026-03-30",
    "isCompleted": true,
    "completionDate": "2026-03-25",
    "createdAt": 1710940200000,
    "updatedAt": 1711089600000
  }
]
```

### Storage Considerations

- **Capacity**: localStorage typically allows 5-10MB per domain (sufficient for thousands of goals)
- **Expiration**: Data persists indefinitely unless browser storage is cleared
- **Availability**: Works offline; no network connectivity required
- **Security**: Stored as plain JSON in browser; no encryption for MVP
- **Sync**: All changes are immediately persisted to localStorage

---

## State Management

### Application State Structure

```typescript
interface DoitState {
  goals: Goal[];
  uiState: {
    isModalOpen: boolean;
    selectedGoalId: string | null;
    sortOrder: 'asc' | 'desc'; // By end date
    filterActive: 'all' | 'active' | 'completed';
  };
  metadata: {
    totalGoalsCreated: number;
    totalGoalsCompleted: number;
    lastSync: Timestamp;
  };
}
```

### Goals Array Organization

**Active Goals**: `goals.filter(g => !g.isCompleted)`  
**Completed Goals**: `goals.filter(g => g.isCompleted)`  
**Sorted Active**: Sort by endDate ascending (nearest deadline first)

---

## Data Operations

### Create Goal

```typescript
// Input
{
  title: "Complete API documentation",
  endDate: "2026-04-01"
}

// Output
{
  id: "550e8400-e29b-41d4-a716-446655440000",
  title: "Complete API documentation",
  endDate: "2026-04-01",
  isCompleted: false,
  completionDate: null,
  createdAt: 1711100400000,
  updatedAt: 1711100400000
}
```

### Read All Goals

```typescript
// Returns
Goal[] // All goals (both active and completed)
```

### Update Goal Status (Mark Complete)

```typescript
// Input
{
  goalId: "550e8400-e29b-41d4-a716-446655440000",
  action: "complete"
}

// Output - Updated Goal
{
  id: "550e8400-e29b-41d4-a716-446655440000",
  title: "Complete API documentation",
  endDate: "2026-04-01",
  isCompleted: true,
  completionDate: "2026-03-22", // Today's date
  createdAt: 1711100400000,
  updatedAt: 1711186800000 // Updated timestamp
}
```

### Delete Goal

```typescript
// Input
{
  goalId: "550e8400-e29b-41d4-a716-446655440000"
}

// Result: Goal is permanently removed from goals array
```

---

## Calculated Properties

### Days Remaining

```typescript
daysRemaining(goal: Goal): number {
  if (goal.isCompleted) {
    return 0; // Completed goals have no remaining days
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const endDate = new Date(goal.endDate);
  endDate.setHours(0, 0, 0, 0);
  
  const msPerDay = 24 * 60 * 60 * 1000;
  const days = Math.ceil((endDate - today) / msPerDay);
  
  return Math.max(0, days);
}
```

### Urgency Status

```typescript
isUrgent(goal: Goal): boolean {
  if (goal.isCompleted) {
    return false;
  }
  
  return this.daysRemaining(goal) <= 3;
}
```

### Overdue Status

```typescript
isOverdue(goal: Goal): boolean {
  if (goal.isCompleted) {
    return false;
  }
  
  return this.daysRemaining(goal) < 0;
}
```

---

## Migration & Evolution

### Version 1.0 to Future Versions

**Potential Future Enhancements** (out of scope for v1):
- Goal categories/tags
- Goal notes or descriptions
- Goal priority levels
- Recurring goals
- Goal milestones/subtasks
- Server-side persistence (cloud sync)
- Multi-device sync

**Migration Strategy**:
- Add a `version` field to stored data
- Implement migration utility to upgrade schemas
- Maintain backward compatibility for read operations
- Document schema changes in version history

---

## Performance Considerations

### Query Performance
- **All goals**: O(n) - linear iteration through goals array
- **Active goals**: O(n) - filtering operation
- **Sorted goals**: O(n log n) - sorting by end date
- **Find single goal**: O(n) - linear search (could optimize with Map if >1000 goals)

### Storage Performance
- **Typical usage**: 50-100 goals = ~20-50KB in localStorage
- **Heavy usage**: 500 goals = ~250KB in localStorage
- **Extreme usage**: 1000+ goals = consider server persistence

### Load Time
- **Parse from localStorage**: <10ms typical
- **Initial render**: <100ms for 100 goals
- **Status update**: <50ms (immediate visual feedback)

---

## Data Integrity Rules

1. **Uniqueness**: Each goal must have a unique id
2. **Required Fields**: id, title, endDate, isCompleted, createdAt, updatedAt are always present
3. **Date Constraints**: endDate cannot be in the past at creation time
4. **Completion Consistency**: If isCompleted = false, completionDate must be null
5. **Immutable Fields**: id, createdAt cannot be modified after creation
6. **Timestamp Ordering**: updatedAt >= createdAt for all goals

---

## Example Data Set

```json
{
  "goals": [
    {
      "id": "g1-active-urgent",
      "title": "Finish project proposal",
      "endDate": "2026-03-24",
      "isCompleted": false,
      "completionDate": null,
      "createdAt": 1711000000000,
      "updatedAt": 1711100000000
    },
    {
      "id": "g2-active-normal",
      "title": "Learn Angular best practices",
      "endDate": "2026-04-15",
      "isCompleted": false,
      "completionDate": null,
      "createdAt": 1710900000000,
      "updatedAt": 1710900000000
    },
    {
      "id": "g3-completed",
      "title": "Code review team standards",
      "endDate": "2026-03-20",
      "isCompleted": true,
      "completionDate": "2026-03-18",
      "createdAt": 1710700000000,
      "updatedAt": 1710882000000
    }
  ]
}
```

---

## Related Documentation

- **Spec**: See [spec.md](spec.md) for functional requirements
- **API Contracts**: See [contracts/](contracts/) for component interfaces
- **Implementation Plan**: See [plan.md](plan.md) for development roadmap
