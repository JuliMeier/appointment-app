import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentList } from './appointment-list';
import { Appointment } from '../models/appointment';

describe('AppointmentList with Task Completion', () => {
  let component: AppointmentList;
  let fixture: ComponentFixture<AppointmentList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentList]
    })
    .compileComponents();

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

  // T007 Tests: Toggle Functionality
  describe('Task Completion Toggle', () => {
    it('should toggle task completion from false to true', () => {
      const appointment: Appointment = {
        id: 1,
        title: 'Test Task',
        date: new Date(),
        completed: false
      };
      component['appointments'].set([appointment]);

      component['toggleTaskCompletion'](appointment);

      const updated = component['appointments']()[0];
      expect(updated.completed).toBeTrue();
    });

    it('should toggle task completion from true to false', () => {
      const appointment: Appointment = {
        id: 1,
        title: 'Test Task',
        date: new Date(),
        completed: true
      };
      component['appointments'].set([appointment]);

      component['toggleTaskCompletion'](appointment);

      const updated = component['appointments']()[0];
      expect(updated.completed).toBeFalse();
    });

    it('should update the appointments signal after toggle', () => {
      const appointment: Appointment = {
        id: 1,
        title: 'Test Task',
        date: new Date(),
        completed: false
      };
      component['appointments'].set([appointment]);

      component['toggleTaskCompletion'](appointment);

      // Signal should update and trigger reactivity
      const completedTasks = component['completedTasks']();
      expect(completedTasks.length).toBe(1);
      expect(completedTasks[0].id).toBe(1);
    });

    it('should call saveToStorage after toggle', () => {
      spyOn(component as any, 'saveToStorage');
      const appointment: Appointment = {
        id: 1,
        title: 'Test Task',
        date: new Date(),
        completed: false
      };
      component['appointments'].set([appointment]);

      component['toggleTaskCompletion'](appointment);

      expect((component as any).saveToStorage).toHaveBeenCalled();
    });

    it('should handle toggling non-existent appointment gracefully', () => {
      const appointment: Appointment = {
        id: 1,
        title: 'Test Task',
        date: new Date(),
        completed: false
      };
      component['appointments'].set([appointment]);

      const nonExistent: Appointment = {
        id: 999,
        title: 'Non-existent',
        date: new Date(),
        completed: false
      };

      // Should not throw
      expect(() => component['toggleTaskCompletion'](nonExistent)).not.toThrow();
    });
  });

  // T008 Tests: localStorage Persistence
  describe('localStorage Persistence', () => {
    it('should load appointments from localStorage on init', () => {
      const mock: Appointment[] = [
        { id: 1, title: 'Test', date: new Date(), completed: false }
      ];
      localStorage.setItem('appointments-list', JSON.stringify(mock));

      const newComponent: AppointmentList = TestBed.createComponent(AppointmentList).componentInstance;
      newComponent.ngOnInit?.();

      expect(newComponent['appointments']().length).toBe(1);
    });

    it('should initialize with empty array if localStorage is empty', () => {
      const newComponent: AppointmentList = TestBed.createComponent(AppointmentList).componentInstance;
      newComponent.ngOnInit?.();

      expect(newComponent['appointments']().length).toBe(0);
    });

    it('should handle JSON parse errors gracefully', () => {
      localStorage.setItem('appointments-list', 'invalid JSON {');

      const newComponent: AppointmentList = TestBed.createComponent(AppointmentList).componentInstance;
      spyOn(console, 'error');
      
      newComponent.ngOnInit?.();

      expect(newComponent['appointments']().length).toBe(0);
      expect(console.error).toHaveBeenCalled();
    });

    it('should persist data to localStorage after toggle', () => {
      const appointment: Appointment = {
        id: 1,
        title: 'Test',
        date: new Date(),
        completed: false
      };
      component['appointments'].set([appointment]);

      component['toggleTaskCompletion'](appointment);

      const stored = localStorage.getItem('appointments-list');
      expect(stored).toBeTruthy();
      const parsed = JSON.parse(stored!);
      expect(parsed[0].completed).toBeTrue();
    });

    it('should ensure completed property defaults to false for backward compatibility', () => {
      const oldData: any[] = [
        { id: 1, title: 'Old Task', date: new Date() } // No completed property
      ];
      localStorage.setItem('appointments-list', JSON.stringify(oldData));

      const newComponent: AppointmentList = TestBed.createComponent(AppointmentList).componentInstance;
      newComponent.ngOnInit?.();

      const loaded = newComponent['appointments']();
      expect(loaded[0].completed).toBeFalse();
    });

    it('should call loadFromStorage on ngOnInit', () => {
      const newComponent: AppointmentList = TestBed.createComponent(AppointmentList).componentInstance;
      spyOn<any>(newComponent, 'loadFromStorage');

      newComponent.ngOnInit?.();

      expect((newComponent as any).loadFromStorage).toHaveBeenCalled();
    });
  });

  // T011 Tests: Filtering
  describe('Task Filtering - Active and Completed', () => {
    it('should filter active tasks correctly (completed=false)', () => {
      const appointments: Appointment[] = [
        { id: 1, title: 'Active 1', date: new Date(), completed: false },
        { id: 2, title: 'Completed', date: new Date(), completed: true },
        { id: 3, title: 'Active 2', date: new Date(), completed: false }
      ];
      component['appointments'].set(appointments);

      const activeTasks = component['activeTasks']();
      expect(activeTasks.length).toBe(2);
      expect(activeTasks.some(t => t.id === 1)).toBeTrue();
      expect(activeTasks.some(t => t.id === 3)).toBeTrue();
    });

    it('should filter completed tasks correctly (completed=true)', () => {
      const appointments: Appointment[] = [
        { id: 1, title: 'Active 1', date: new Date(), completed: false },
        { id: 2, title: 'Completed', date: new Date(), completed: true },
        { id: 3, title: 'Active 2', date: new Date(), completed: false }
      ];
      component['appointments'].set(appointments);

      const completedTasks = component['completedTasks']();
      expect(completedTasks.length).toBe(1);
      expect(completedTasks[0].id).toBe(2);
    });

    it('should update filtered signals when appointment toggled', () => {
      const appointment: Appointment = {
        id: 1,
        title: 'Test',
        date: new Date(),
        completed: false
      };
      component['appointments'].set([appointment]);

      expect(component['activeTasks']().length).toBe(1);
      expect(component['completedTasks']().length).toBe(0);

      component['toggleTaskCompletion'](appointment);

      expect(component['activeTasks']().length).toBe(0);
      expect(component['completedTasks']().length).toBe(1);
    });

    it('should handle empty task list', () => {
      component['appointments'].set([]);

      expect(component['activeTasks']().length).toBe(0);
      expect(component['completedTasks']().length).toBe(0);
    });

    it('should handle all tasks completed', () => {
      const appointments: Appointment[] = [
        { id: 1, title: 'Task 1', date: new Date(), completed: true },
        { id: 2, title: 'Task 2', date: new Date(), completed: true }
      ];
      component['appointments'].set(appointments);

      expect(component['activeTasks']().length).toBe(0);
      expect(component['completedTasks']().length).toBe(2);
    });
  });

  // T012 Tests: Uncompleting Tasks
  describe('Uncompleting Tasks', () => {
    it('should move completed task back to active when toggled', () => {
      const appointment: Appointment = {
        id: 1,
        title: 'Completed Task',
        date: new Date(),
        completed: true
      };
      component['appointments'].set([appointment]);

      expect(component['completedTasks']().length).toBe(1);

      component['toggleTaskCompletion'](appointment);

      expect(component['activeTasks']().length).toBe(1);
      expect(component['completedTasks']().length).toBe(0);
    });

    it('should persist uncompleted task to localStorage', () => {
      const appointment: Appointment = {
        id: 1,
        title: 'Task',
        date: new Date(),
        completed: true
      };
      component['appointments'].set([appointment]);

      component['toggleTaskCompletion'](appointment);

      const stored = localStorage.getItem('appointments-list');
      const parsed = JSON.parse(stored!);
      expect(parsed[0].completed).toBeFalse();
    });

    it('should maintain uncompleted state after reload', () => {
      const appointment: Appointment = {
        id: 1,
        title: 'Task',
        date: new Date(),
        completed: true
      };
      component['appointments'].set([appointment]);
      component['toggleTaskCompletion'](appointment);

      // Simulate page refresh
      const newComponent: AppointmentList = TestBed.createComponent(AppointmentList).componentInstance;
      newComponent.ngOnInit?.();

      const loaded = newComponent['appointments']();
      expect(loaded[0].completed).toBeFalse();
      expect(newComponent['activeTasks']().length).toBe(1);
    });
  });

  // T014-T015: Integration Tests
  describe('Integration Tests - Complete User Flows', () => {
    it('should complete full workflow: add task → mark complete → verify sections', () => {
      // Given: Empty list
      expect(component['activeTasks']().length).toBe(0);
      expect(component['completedTasks']().length).toBe(0);

      // When: Add a task
      component.newAppointmentTitle = 'Test Integration Task';
      component.newAppointmentDate = new Date('2026-03-15');
      component.addAppointment();

      // Then: Task appears in active section
      expect(component['activeTasks']().length).toBe(1);
      expect(component['completedTasks']().length).toBe(0);

      // When: Mark task as complete
      const task = component['activeTasks']()[0];
      component['toggleTaskCompletion'](task);

      // Then: Task moves to completed section
      expect(component['activeTasks']().length).toBe(0);
      expect(component['completedTasks']().length).toBe(1);
    });

    it('should persist and restore complete task state across reload', () => {
      // Given: Create and complete a task
      const appointment: Appointment = {
        id: 1,
        title: 'Task to Complete',
        date: new Date(),
        completed: false
      };
      component['appointments'].set([appointment]);
      component['toggleTaskCompletion'](appointment);

      // Verify task is in completed section
      expect(component['completedTasks']().length).toBe(1);

      // When: Simulate page refresh (create new component)
      localStorage.clear();
      localStorage.setItem('appointments-list', JSON.stringify(component['appointments']()));
      
      const newComponent: AppointmentList = TestBed.createComponent(AppointmentList).componentInstance;
      newComponent.ngOnInit?.();
      fixture.detectChanges();

      // Then: Completed task still in completed section
      expect(newComponent['completedTasks']().length).toBe(1);
      expect(newComponent['completedTasks']()[0].completed).toBeTrue();
      expect(newComponent['activeTasks']().length).toBe(0);
    });

    it('should handle multiple tasks with mixed completion states', () => {
      // Given: Multiple tasks with mixed states
      const appointments: Appointment[] = [
        { id: 1, title: 'Task 1', date: new Date('2026-03-15'), completed: false },
        { id: 2, title: 'Task 2', date: new Date('2026-03-16'), completed: true },
        { id: 3, title: 'Task 3', date: new Date('2026-03-17'), completed: false },
        { id: 4, title: 'Task 4', date: new Date('2026-03-18'), completed: true }
      ];
      component['appointments'].set(appointments);

      // Then: Filtering works correctly
      expect(component['activeTasks']().length).toBe(2);
      expect(component['completedTasks']().length).toBe(2);

      // When: Toggle one active task to complete
      component['toggleTaskCompletion'](component['activeTasks']()[0]);

      // Then: Counts update
      expect(component['activeTasks']().length).toBe(1);
      expect(component['completedTasks']().length).toBe(3);
    });

    it('should allow toggling back and forth between states', () => {
      const appointment: Appointment = {
        id: 1,
        title: 'Flexible Task',
        date: new Date(),
        completed: false
      };
      component['appointments'].set([appointment]);

      // Initial state: active
      expect(component['activeTasks']().length).toBe(1);

      // Toggle 1: to completed
      component['toggleTaskCompletion'](component['activeTasks']()[0]);
      expect(component['activeTasks']().length).toBe(0);
      expect(component['completedTasks']().length).toBe(1);

      // Toggle 2: back to active
      component['toggleTaskCompletion'](component['completedTasks']()[0]);
      expect(component['activeTasks']().length).toBe(1);
      expect(component['completedTasks']().length).toBe(0);

      // Toggle 3: to completed again
      component['toggleTaskCompletion'](component['activeTasks']()[0]);
      expect(component['activeTasks']().length).toBe(0);
      expect(component['completedTasks']().length).toBe(1);
    });
  });
});
