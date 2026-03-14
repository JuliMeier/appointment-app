# Phase 1: Data Model

**Feature**: Task Completion Checkbox  
**Date**: March 14, 2026

## Entity: Appointment

### Definition

Represents a user appointment/task with optional completion tracking.

### Current Model vs. Extended Model

**Current** (from `src/app/models/appointment.ts`):
```typescript
export interface Appointment {
    id: number;
    title: string;
    date: Date;
}
```

**Extended** (after this feature):
```typescript
export interface Appointment {
    id: number;
    title: string;
    date: Date;
    completed?: boolean;  // NEW: defaults to false
}
```

### Field Specifications

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | number | Yes | N/A | Unique identifier; generated on creation |
| `title` | string | Yes | N/A | Appointment title/task name |
| `date` | Date | Yes | N/A | Appointment date and time |
| `completed` | boolean | No | `false` | Whether task is marked as completed |

### Relationships

- **One Appointment** maps to exactly **one completion status**
- Appointments can be filtered into two groups: active (completed = false) and completed (completed = true)
- No join tables or complex relationships needed for MVP

### Validation Rules

1. `id` must be unique across all appointments
2. `title` must not be empty string
3. `date` must be a valid Date object
4. `completed` must be boolean when present

### State Transitions

```
┌─────────────────────────────────────┐
│      NEW APPOINTMENT                │
│  completed: false (default)         │
└────────────┬────────────────────────┘
             │
             ├─── User checks checkbox ──→ ┌──────────────┐
             │                             │   COMPLETED  │
             │                             │completed: true
             │                             └──────────────┘
             │                                    ▲
             │                                    │
             │                        User unchecks checkbox
             │                                    │
             └────────────────────────────────────┘
```

### Storage Representation

**In Memory** (TypeScript):
```typescript
const appointment: Appointment = {
  id: 1,
  title: "Project Review",
  date: new Date("2026-03-15"),
  completed: true
};
```

**In localStorage** (JSON):
```json
{
  "id": 1,
  "title": "Project Review",
  "date": "2026-03-15T10:00:00.000Z",
  "completed": true
}
```

Note: `Date` objects must be serialized to ISO 8601 strings for JSON storage.

---

## Collections

### Active Tasks Collection
- **Definition**: All appointments where `completed === false`
- **Computed Property**: Derived from appointments array with filter
- **Display Order**: Chronological (by date)
- **Primary Use**: Main list shown to user for ongoing tasks

### Completed Tasks Collection
- **Definition**: All appointments where `completed === true`
- **Computed Property**: Derived from appointments array with filter
- **Display Order**: Reverse chronological (newest completed first) OR Chronological
- **Primary Use**: Shows user's completed work; historical record

---

## Migration & Backward Compatibility

### Handling Existing Appointments

Existing appointments in localStorage will not have the `completed` field. 

**Strategy**: Treat missing `completed` as `false` (default to active state)

```typescript
const appointmentWithDefault: Appointment = {
  ...existingAppointment,
  completed: existingAppointment.completed ?? false
};
```

This ensures:
- Old data continues to work
- Old appointments appear in active list
- No data loss during migration

---

## Implementation Notes

### TypeScript Strict Mode

The project uses TypeScript strict mode (tsconfig.json). The `completed` field is optional (`?`) to maintain backward compatibility while supporting the new feature.

### Database Migration Path (Future)

When migrating to backend persistence:
```sql
ALTER TABLE appointments ADD COLUMN completed BOOLEAN DEFAULT FALSE;
```

---

## Entity Diagram

```
┌─────────────────────────┐
│      Appointment        │
├─────────────────────────┤
│ pk: id (number)         │
│ title (string)          │
│ date (Date)             │
│ completed? (boolean)    │
└─────────────────────────┘
         │
         ├─ Active Appointment (completed=false)
         │
         └─ Completed Appointment (completed=true)
```
