import { Component, computed, signal } from '@angular/core';
import { Appointment } from '../models/appointment';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { OnInit } from '@angular/core';

@Component({
  selector: 'app-appointment-list',
  imports: [FormsModule, CommonModule ],
  templateUrl: './appointment-list.html',
  styleUrl: './appointment-list.css',
})
export class AppointmentList implements OnInit {

  newAppointmentTitle: string = '';
  newAppointmentDate: Date = new Date();

  // Signals for reactive state
  protected appointments = signal<Appointment[]>([]);
  
  // Computed signals for filtering
  protected activeTasks = computed(() =>
    this.appointments().filter(a => !a.completed)
  );
  
  protected completedTasks = computed(() =>
    this.appointments().filter(a => a.completed)
  );

  private readonly STORAGE_KEY = 'appointments-list';

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

  private saveToStorage(): void {
    const json = JSON.stringify(this.appointments());
    localStorage.setItem(this.STORAGE_KEY, json);
  }

  addAppointment() {
    if (this.newAppointmentTitle.trim().length && this.newAppointmentDate) {
      let newAppointment: Appointment = {
        id: this.appointments().length + 1,
        title: this.newAppointmentTitle,
        date: this.newAppointmentDate,
        completed: false
      };
      const current = this.appointments();
      this.appointments.set([...current, newAppointment]);
      this.newAppointmentTitle = '';
      this.newAppointmentDate = new Date();

      this.saveToStorage();
    }
  }

  removeAppointment(appointmentId: number) {
    const updated = this.appointments().filter(appointment => appointment.id !== appointmentId);
    this.appointments.set(updated);
    this.saveToStorage();
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

}
