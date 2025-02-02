import { Injectable } from '@angular/core';

export interface WorkoutEntry {
  id: string;
  userName: string;
  workoutType: string;
  workoutMinutes: number;
}

const STORAGE_KEY = 'workoutEntries';

@Injectable({
  providedIn: 'root'
})
export class WorkoutService {
  private workoutEntries: WorkoutEntry[] = [];

  constructor() {
    this.loadFromLocalStorage();
  }

  private loadFromLocalStorage(): void {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (storedData) {
        this.workoutEntries = JSON.parse(storedData);
      } else {
        this.initializeSampleData();
      }
    } catch (error) {
      console.error('Error loading from localStorage', error);
      this.workoutEntries = [];
    }
  }

  private initializeSampleData(): void {
    this.workoutEntries = [
      { id: this.generateId(), userName: 'John Doe', workoutType: 'Running', workoutMinutes: 30 },
      { id: this.generateId(), userName: 'John Doe', workoutType: 'Cycling', workoutMinutes: 45 },
      { id: this.generateId(), userName: 'Jane Smith', workoutType: 'Swimming', workoutMinutes: 60 },
      { id: this.generateId(), userName: 'Jane Smith', workoutType: 'Running', workoutMinutes: 20 },
      { id: this.generateId(), userName: 'Mike Johnson', workoutType: 'Yoga', workoutMinutes: 50 },
      { id: this.generateId(), userName: 'Mike Johnson', workoutType: 'Cycling', workoutMinutes: 40 }
    ];
    this.saveToLocalStorage();
  }

  private saveToLocalStorage(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.workoutEntries));
  }

  getWorkoutEntries(): WorkoutEntry[] {
    return [...this.workoutEntries];
  }

  addWorkoutEntry(entry: Omit<WorkoutEntry, 'id'>): void {
    if (!this.isDuplicateEntry(entry)) {
      const newEntry = { ...entry, id: this.generateId() };
      this.workoutEntries.push(newEntry);
      this.saveToLocalStorage();
    }
  }

  deleteWorkoutEntry(id: string): void {
    this.workoutEntries = this.workoutEntries.filter(entry => entry.id !== id);
    this.saveToLocalStorage();
  }

  private isDuplicateEntry(entry: Omit<WorkoutEntry, 'id'>): boolean {
    return this.workoutEntries.some(e =>
      e.userName === entry.userName &&
      e.workoutType === entry.workoutType &&
      e.workoutMinutes === entry.workoutMinutes
    );
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
