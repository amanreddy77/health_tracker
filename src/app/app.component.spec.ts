import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, NgForm } from '@angular/forms';
import { AppComponent } from './app.component';
import { ElementRef } from '@angular/core';
import { Chart } from 'chart.js';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let mockElementRef: jasmine.SpyObj<ElementRef>;

  beforeEach(async () => {
    mockElementRef = jasmine.createSpyObj('ElementRef', [], {
      nativeElement: {
        querySelector: jasmine.createSpy('querySelector').and.returnValue(document.createElement('canvas'))
      }
    });

    await TestBed.configureTestingModule({
      declarations: [ AppComponent ],
      imports: [ FormsModule ],
      providers: [
        { provide: ElementRef, useValue: mockElementRef }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;

    spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify([
      { userName: 'John Doe', workoutType: 'Running', workoutMinutes: 30 },
      { userName: 'Jane Smith', workoutType: 'Yoga', workoutMinutes: 45 }
    ]));
    spyOn(localStorage, 'setItem');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load workout entries on init', () => {
    expect(component.workoutEntries.length).toBe(2);
  });

  it('should handle no workout entries in localStorage', () => {
    spyOn(localStorage, 'getItem').and.returnValue(null); 
    component.ngOnInit(); 
    expect(component.workoutEntries.length).toBe(0); 
  });

  it('should handle invalid workout data in localStorage', () => {
    spyOn(localStorage, 'getItem').and.returnValue('invalid data');
    component.ngOnInit();
    expect(component.workoutEntries.length).toBe(0);
  });

  it('should add a new workout entry', () => {
    spyOn(component, 'updateChart');
    component.userName = 'Test User';
    component.workoutType = 'Cycling';
    component.workoutMinutes = 60;

    const mockForm = {
      valid: true,
      resetForm: jasmine.createSpy('resetForm')
    };

    component.onSubmit(mockForm as unknown as NgForm);

    expect(component.workoutEntries.length).toBe(3);
    expect(localStorage.setItem).toHaveBeenCalled();
    expect(component.updateChart).toHaveBeenCalled();
    expect(mockForm.resetForm).toHaveBeenCalled();
  });

  it('should not add a new workout entry if form is invalid', () => {
    spyOn(component, 'updateChart');
    component.userName = 'Test User';
    component.workoutType = 'Cycling';
    component.workoutMinutes = 60;

    const mockForm = {
      valid: false, 
      resetForm: jasmine.createSpy('resetForm')
    };

    component.onSubmit(mockForm as unknown as NgForm);

    expect(component.workoutEntries.length).toBe(2);
    expect(localStorage.setItem).not.toHaveBeenCalled();
    expect(component.updateChart).not.toHaveBeenCalled();
    expect(mockForm.resetForm).not.toHaveBeenCalled();
  });

  it('should filter entries', () => {
    component.searchTerm = 'John';
    component.applyFilters();
    expect(component.filteredEntries.length).toBe(1);
  });

  it('should apply filters with pagination', () => {
    component.searchTerm = '';
    component.itemsPerPage = 1;
    component.applyFilters();
    expect(component.filteredEntries.length).toBe(2); 
    expect(component.totalPages).toBe(2); 
  });

  it('should handle empty search term and apply pagination', () => {
    component.searchTerm = '';
    component.itemsPerPage = 1;
    component.applyFilters();
    expect(component.filteredEntries.length).toBe(2); 
    expect(component.totalPages).toBe(2);
  });

  it('should apply filters with pagination for an empty search', () => {
    component.searchTerm = '';
    component.itemsPerPage = 1;
    component.applyFilters();
    expect(component.filteredEntries.length).toBe(2); 
    expect(component.totalPages).toBe(2);
  });

  it('should change page', () => {
    component.itemsPerPage = 1;
    component.applyFilters();
    component.changePage(1);
    expect(component.currentPage).toBe(2);
  });

  it('should not change to an invalid page number', () => {
    component.itemsPerPage = 1;
    component.applyFilters();
    component.changePage(-1);
    expect(component.currentPage).toBe(1);
    component.changePage(999);
    expect(component.currentPage).toBe(1);
  });

  it('should handle zero items per page gracefully', () => {
    component.itemsPerPage = 0;
    component.applyFilters();
    expect(component.totalPages).toBe(1);
    expect(component.filteredEntries.length).toBe(0);
  });

  it('should handle page change on the last page', () => {
    component.itemsPerPage = 1;
    component.currentPage = 2;
    component.applyFilters();
    component.changePage(2);
    expect(component.currentPage).toBe(2); 
  });

  it('should update chart when selecting a user', () => {
    spyOn(Chart.prototype, 'destroy');
    spyOn(Chart, 'register');
    spyOn(component, 'updateChart');

    component.selectUser('John Doe');

    expect(component.selectedUser).toBe('John Doe');
    expect(component.updateChart).toHaveBeenCalled();
  });

  it('should destroy existing chart before creating a new one', () => {
    component.chart = jasmine.createSpyObj('Chart', ['destroy']);
    spyOn(component, 'updateChart');
    component.selectUser('John Doe');
    expect(component.chart!.destroy).toHaveBeenCalled();

    expect(component.updateChart).toHaveBeenCalled();
  });

  it('should handle selecting a null user gracefully', () => {
    spyOn(component, 'updateChart');
    component.selectUser('');
    expect(component.selectedUser).toBe(null);
    expect(component.updateChart).toHaveBeenCalled();
  });

  it('should not update chart if same user is selected', () => {
    spyOn(Chart.prototype, 'destroy');
    spyOn(Chart, 'register');
    spyOn(component, 'updateChart');

    component.selectedUser = 'John Doe';
    component.selectUser('John Doe');

    expect(component.updateChart).not.toHaveBeenCalled();
  });

  it('should handle selecting a non-existing user', () => {
    spyOn(Chart.prototype, 'destroy');
    spyOn(Chart, 'register');
    spyOn(component, 'updateChart');

    component.selectUser('Non Existing User');

    expect(component.selectedUser).toBe('Non Existing User');
    expect(component.updateChart).toHaveBeenCalled();
  });

  it('should handle missing canvas element when updating chart', () => {
    mockElementRef.nativeElement.querySelector.and.returnValue(null);
    expect(() => component.updateChart()).not.toThrow();
  });

  it('should get number of workouts for a user', () => {
    const count = component.getNumberOfWorkouts('John Doe');
    expect(count).toBe(1);
  });

  it('should return 0 for non-existing user workouts', () => {
    const count = component.getNumberOfWorkouts('Non Existing User');
    expect(count).toBe(0);
  });

  it('should get total workout minutes for a user', () => {
    const total = component.getTotalWorkoutMinutes('John Doe');
    expect(total).toBe(30);
  });

  it('should return 0 for total workout minutes of non-existing user', () => {
    const total = component.getTotalWorkoutMinutes('Non Existing User');
    expect(total).toBe(0);
  });

  it('should reset form', () => {
    const mockForm = {
      resetForm: jasmine.createSpy('resetForm')
    };
    component.userName = 'Test';
    component.workoutType = 'Running';
    component.workoutMinutes = 30;

    component.resetForm(mockForm as unknown as NgForm);

    expect(mockForm.resetForm).toHaveBeenCalled();
    expect(component.userName).toBe('');
    expect(component.workoutType).toBe('');
    expect(component.workoutMinutes).toBe(0);
  });

  it('should reset form manually if resetForm is not available', () => {
    const mockForm = {};
    component.userName = 'Test';
    component.workoutType = 'Running';
    component.workoutMinutes = 30;

    component.resetForm(mockForm as unknown as NgForm);

    expect(component.userName).toBe('');
    expect(component.workoutType).toBe('');
    expect(component.workoutMinutes).toBe(0);
  });

  it('should handle empty workout entries in localStorage and empty form', () => {
    spyOn(localStorage, 'getItem').and.returnValue(null);
    component.ngOnInit();
    component.userName = '';
    component.workoutType = '';
    component.workoutMinutes = 0;

    const mockForm = {
      valid: false,
      resetForm: jasmine.createSpy('resetForm')
    };

    component.onSubmit(mockForm as unknown as NgForm);

    expect(component.workoutEntries.length).toBe(0);
    expect(mockForm.resetForm).not.toHaveBeenCalled();
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });

  it('should handle empty form data when submitting', () => {
    component.userName = '';
    component.workoutType = '';
    component.workoutMinutes = 0;

    const mockForm = {
      valid: false,
      resetForm: jasmine.createSpy('resetForm')
    };

    component.onSubmit(mockForm as unknown as NgForm);
    expect(mockForm.resetForm).not.toHaveBeenCalled();
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });

  it('should not add workout if only partial data is provided', () => {
    component.userName = 'Partial User';
    component.workoutType = '';
    component.workoutMinutes = 60;

    const mockForm = { valid: false, resetForm: jasmine.createSpy('resetForm') };

    component.onSubmit(mockForm as unknown as NgForm);

    expect(component.workoutEntries.length).toBe(2);
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });

  it('should clean up on component destroy', () => {
    spyOn(Chart.prototype, 'destroy');
    component.ngOnDestroy();
    expect(Chart.prototype.destroy).toHaveBeenCalled();
  });
});
