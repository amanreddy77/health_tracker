import { TestBed } from '@angular/core/testing';
import { WorkoutService, WorkoutEntry } from './workout.service';

describe('WorkoutService', () => {
  let service: WorkoutService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    localStorage.clear(); 
    service = TestBed.inject(WorkoutService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with sample data if localStorage is empty', () => {
    const entries = service.getWorkoutEntries();
    expect(entries.length).toBe(6); 
  });

  it('should load data from localStorage if available', () => {
    localStorage.clear(); 
    
    const testData: WorkoutEntry[] = [
      { id: '1', userName: 'Test User', workoutType: 'Running', workoutMinutes: 30 }
    ];
    localStorage.setItem('workoutEntries', JSON.stringify(testData));

    service = new WorkoutService(); 
    const entries = service.getWorkoutEntries();

    expect(entries.length).toBe(1); 
    expect(entries[0].userName).toBe('Test User'); 
  });

  it('should add a new workout entry', () => {
    const newEntry: Omit<WorkoutEntry, 'id'> = {
      userName: 'Test User',
      workoutType: 'Running',
      workoutMinutes: 30
    };
    service.addWorkoutEntry(newEntry);
    const entries = service.getWorkoutEntries();

    expect(entries.length).toBe(7);
    expect(entries.some((e: WorkoutEntry) => e.userName === 'Test User' && e.workoutType === 'Running')).toBeTrue();
  });

  it('should delete a workout entry', () => {
    const entries = service.getWorkoutEntries();
    const idToDelete = entries[0].id;
    
    service.deleteWorkoutEntry(idToDelete);
    const updatedEntries = service.getWorkoutEntries();

    expect(updatedEntries.length).toBe(5);
    expect(updatedEntries.some((e: WorkoutEntry) => e.id === idToDelete)).toBeFalse();
  });

  it('should return sample data if localStorage is empty', () => {
    localStorage.clear();
    service = new WorkoutService();
    expect(service.getWorkoutEntries().length).toBe(6);
  });

  it('should not add duplicate workout entries if an identical entry exists', () => {
    const duplicateEntry: Omit<WorkoutEntry, 'id'> = {
      userName: 'John Doe',
      workoutType: 'Running',
      workoutMinutes: 30
    };

    service.addWorkoutEntry(duplicateEntry);
    service.addWorkoutEntry(duplicateEntry);

    const entries = service.getWorkoutEntries().filter((e: WorkoutEntry) => e.userName === 'John Doe' && e.workoutType === 'Running');
    expect(entries.length).toBe(1);
  });

  it('should persist data to localStorage when a new entry is added', () => {
    const newEntry: Omit<WorkoutEntry, 'id'> = {
      userName: 'Alice',
      workoutType: 'Swimming',
      workoutMinutes: 45
    };

    service.addWorkoutEntry(newEntry);
    const storedData = JSON.parse(localStorage.getItem('workoutEntries') || '[]');

    expect(storedData.length).toBe(7);
    expect(storedData.some((e: WorkoutEntry) => e.userName === 'Alice' && e.workoutType === 'Swimming')).toBeTrue();
  });

  it('should persist data to localStorage when an entry is deleted', () => {
    const entries = service.getWorkoutEntries();
    const idToDelete = entries[0].id;

    service.deleteWorkoutEntry(idToDelete);
    const storedData = JSON.parse(localStorage.getItem('workoutEntries') || '[]');

    expect(storedData.length).toBe(5);
    expect(storedData.some((e: WorkoutEntry) => e.id === idToDelete)).toBeFalse();
  });

  it('should handle localStorage being empty when reading workout entries', () => {
    localStorage.clear();
    service = new WorkoutService(); // Force the service to reload with empty localStorage
    const entries = service.getWorkoutEntries();
    expect(entries.length).toBe(6); // Ensure sample data is returned
  });

  it('should not throw an error when localStorage is corrupted or not parsable', () => {
    localStorage.setItem('workoutEntries', 'invalid JSON');
    service = new WorkoutService();
    const entries = service.getWorkoutEntries();
    expect(entries.length).toBe(6); // Ensure sample data is returned if localStorage is corrupted
  });

  it('should return an empty array if localStorage data is an empty array', () => {
    localStorage.setItem('workoutEntries', '[]');
    service = new WorkoutService();
    const entries = service.getWorkoutEntries();
    expect(entries.length).toBe(0); // Ensure empty array is returned
  });

  it('should handle edge case of no entries after all have been deleted', () => {
    const entries = service.getWorkoutEntries();
    entries.forEach(entry => service.deleteWorkoutEntry(entry.id)); // Delete all entries

    const updatedEntries = service.getWorkoutEntries();
    expect(updatedEntries.length).toBe(0); // Ensure no entries remain
  });
});
