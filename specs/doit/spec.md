# Feature Specification: Goal Tracking Web App 'doit'

**Version**: 1.0  
**Status**: Ready for Planning  
**Created**: March 22, 2026  
**Feature Owner**: Development Team

---

## Overview

**doit** is a goal tracking web application that empowers users to manage their goals effectively with an intuitive two-column layout. The application provides visual clarity on active goals with countdown indicators and celebrates achievement by showcasing completed goals. Users can create, track, mark as complete, and organize their goals in a clean, modern interface.

---

## User Scenarios & Acceptance Criteria

### Scenario 1: User Creates a New Goal
**Actor**: Goal setter (any user)  
**Context**: User wants to track a new objective with a specific deadline

**Flow**:
1. User clicks the "New Goal" button on the homepage
2. Modal form opens with two fields: Title and End Date
3. User enters goal title (e.g., "Complete project documentation")
4. User selects an end date using the date picker
5. User clicks "Add Goal" button
6. Modal closes and new goal appears in the active column (left)
7. Goal shows days remaining until end date

**Acceptance Criteria**:
- Modal form opens without page navigation
- Title field accepts text input with reasonable length validation
- Date picker allows selection of future dates
- Newly created goal appears in active column immediately
- Goal displays accurate countdown (days remaining)
- Form cannot be submitted with empty fields

---

### Scenario 2: User Tracks Goal Progress
**Actor**: Goal tracker  
**Context**: User reviews active goals and their deadlines

**Flow**:
1. User opens doit application
2. Sees active goals in left column with countdown timers
3. Identifies goals with 0-3 days remaining (highlighted with visual indicator)
4. Prioritizes urgent goals based on visual prominence

**Acceptance Criteria**:
- Active goals clearly display remaining days until end date
- Goals with ≤3 days until deadline show distinctive visual indicator (color/icon)
- Countdown updates reflect current date
- No goals are missing from active column until marked complete

---

### Scenario 3: User Marks Goal as Complete
**Actor**: Goal achiever  
**Context**: User has completed a goal and wants to move it out of active view

**Flow**:
1. User views active goals in left column
2. Locates a completed goal
3. Clicks the checkbox next to the goal
4. Goal moves to completed column on the right
5. Visual confirmation that goal is now in completed section

**Acceptance Criteria**:
- Checkbox is clearly visible and clickable
- Checked goal immediately moves to right column
- Completed goal no longer appears in active column
- Visual distinction between active and completed goals
- User can see list of completed goals for motivation/reference

---

### Scenario 4: User Deletes a Goal
**Actor**: Goal manager  
**Context**: User no longer wants to track a goal

**Flow**:
1. User hovers over or focuses on a goal
2. Delete option becomes visible (button/icon)
3. User clicks delete
4. Goal is permanently removed from the application
5. User receives confirmation that goal was deleted

**Acceptance Criteria**:
- Delete action is easy to discover but hard to trigger accidentally
- Deleted goal is permanently removed (not recoverable)
- No broken references or orphaned data remain
- Delete action doesn't affect other goals

---

## Functional Requirements

### FR1: Goal Creation
- Users can open a modal dialog via "New Goal" button
- Modal contains two form fields: Title (text input) and End Date (date picker)
- Title field must be a required field with max length of 200 characters
- End Date field must be a required field and only allow future dates
- Form validation provides clear error messages for invalid input
- Users can cancel the modal without creating a goal
- Submit button creates the goal and adds it to the active goals column

### FR2: Goal Display
- Active goals appear in the left column with consistent formatting
- Each active goal displays: Goal title, end date, and days remaining
- Days remaining is calculated as: `(endDate - today).days`
- Goals are sorted chronologically by end date (earliest first)
- Completed goals appear in the right column with clear visual separation
- Completed goals display: Goal title and completion date/indicator

### FR3: Goal Status Management
- Unchecked checkbox = active goal
- Checked checkbox = goal moves to completed column
- Checking a goal marks it with current date as completion date
- Status changes reflect immediately in the UI
- Completed goals cannot be edited, only deleted

### FR4: Visual Urgency Indicators
- Goals with 0-3 days remaining until end date show a distinctive visual indicator
- Indicator uses color, icon, badge, or combination thereof
- Indicator is prominent but doesn't clutter the UI
- Urgency indicator disappears when goal is marked complete

### FR5: Goal Deletion
- Delete action is available on both active and completed goals
- Delete button/icon is visible on hover or in a goal context menu
- Clicking delete removes the goal permanently
- Optional: Confirmation dialog to prevent accidental deletion

### FR6: Two-Column Layout
- Left column displays active goals with clear header ("Active Goals" or similar)
- Right column displays completed goals with clear header ("Completed" or similar)
- Columns are side-by-side on desktop viewports
- Responsive behavior on smaller screens (stacked on mobile)
- Column headers and spacing provide clear visual distinction

### FR7: Data Persistence
- All goals are persisted and survive page refreshes
- Goal data includes: title, end date, completion status, and completion date (if completed)

---

## Success Criteria

The feature is successful when:

1. **Goal Creation**: Users can create a goal with title and end date in under 30 seconds
2. **Goal Tracking**: Users can view all active and completed goals at a glance with clear deadline information
3. **Status Management**: Users can mark a goal complete and see it move to the completed column in under 2 seconds
4. **Visual Urgency**: 100% of goals with ≤3 days remaining display the urgency indicator
5. **Data Accuracy**: All countdown calculations are within ±1 day of actual remaining days
6. **Performance**: Page loads in under 2 seconds and responds to user actions without noticeable lag
7. **User Satisfaction**: The UI feels intuitive and modern; users can accomplish basic tasks without instructions
8. **Data Safety**: No goals are lost due to browser crashes or accidental actions (deletions are permanent but require deliberate action)

---

## Key Entities

### Goal
- **id**: Unique identifier (UUID or auto-generated)
- **title**: String (1-200 characters)
- **endDate**: Date (must be in future)
- **isCompleted**: Boolean (false = active, true = completed)
- **completionDate**: Date (nullable, set when completed)
- **createdAt**: Timestamp
- **updatedAt**: Timestamp

---

## Assumptions

1. **Single User**: This is a personal goal tracker with no multi-user or collaboration features
2. **Browser Storage**: Data will be persisted using localStorage or similar client-side storage initially
3. **Date Format**: End dates represent the end of a calendar day (11:59 PM)
4. **No Recurring Goals**: Goals are one-time items, not recurring/repeating
5. **No Goal Categories**: Goals are tracked in a flat list without categories or tags
6. **No Collaborative Features**: Only single user access, no sharing or team features
7. **Modern Browsers**: Target modern browsers with ES6+ support and localStorage API
8. **No Goal Editing**: Goals cannot be edited after creation; users must delete and recreate
9. **Default Urgency Threshold**: 3 days is the default threshold for urgency indicator (not configurable)
10. **Auto-refresh Not Required**: Days remaining counter doesn't need to auto-refresh in real-time; updates on page load

---

## Out of Scope

- User authentication and multi-user support
- Goal categories, tags, or custom grouping
- Goal editing after creation
- Goal reminders or notifications
- Goal notes, descriptions, or attachments
- Goal templates or recurring goals
- Analytics or goal statistics
- Goal sharing or collaboration
- Mobile native app (web-responsive only)
- Dark mode theme (light theme only per requirements)
- Advanced filtering or search

---

## Acceptance Tests

### Test 1: Creating a New Goal
```
Given: User is on the doit homepage
When: User clicks "New Goal" button and fills in title "Learn TypeScript" with end date "2026-04-15"
Then: Modal closes and new goal appears in active column with "24 days remaining"
```

### Test 2: Urgency Indicator Display
```
Given: Active goals exist with end dates of 2026-03-23, 2026-03-24, 2026-03-25, 2026-03-26, and 2026-03-31
When: User views the active goals on 2026-03-22
Then: Goals ending 2026-03-23, 2026-03-24, and 2026-03-25 (0-3 days) show urgency indicator, others don't
```

### Test 3: Marking Goal Complete
```
Given: User has an active goal "Write quarterly review"
When: User clicks the checkbox next to this goal
Then: Goal immediately appears in completed column with today's date as completion date
```

### Test 4: Deleting a Goal
```
Given: User has a goal in either column
When: User clicks delete action and confirms
Then: Goal is permanently removed from the application
```

### Test 5: Data Persistence
```
Given: User has created multiple goals and marked some complete
When: User closes browser and returns to application
Then: All goals and their completion status are exactly as left
```

---

## Dependencies & Constraints

### Technical Dependencies
- Angular framework (available in workspace)
- TypeScript compiler
- Browser localStorage API for persistence

### Constraints
- Must integrate with existing Angular application structure
- Must use existing component architecture patterns
- Must follow existing code style and conventions
- Light theme only (no dark mode option)
- Pastel color scheme for visual design

---

## Open Questions

None at this time - all key design decisions are clarified in the requirements above.

---

## Next Steps

1. Proceed to `/speckit.plan` for detailed task breakdown and implementation planning
2. Use [data-model.md](data-model.md) for database/storage schema details
3. Review [research.md](research.md) for design patterns and Angular best practices
4. Reference [quickstart.md](quickstart.md) for developer setup instructions
