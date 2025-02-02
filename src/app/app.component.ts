import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface WorkoutEntry {
  userName: string;
  workoutType: string;
  workoutMinutes: number;
}

@Component({
  selector: 'app-root',
  template: `
   <div class="max-w-4xl mx-auto p-4 sm:p-6 font-sans">
  <h1 class="text-3xl font-semibold text-center text-gray-800 mb-6">
    Health Challenge Tracker App
  </h1>

  <form
    #workoutForm="ngForm"
    (ngSubmit)="onSubmit(workoutForm)"
    class="bg-white p-6 rounded-lg shadow-lg space-y-6"
  >
    <div class="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-6">
      <div class="form-group">
        <label for="userName" class="text-sm font-medium text-gray-700">
          User Name*
        </label>
        <input
          type="text"
          id="userName"
          name="userName"
          [(ngModel)]="userName"
          required
          class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div class="form-group">
        <label for="workoutType" class="text-sm font-medium text-gray-700">
          Workout Type*
        </label>
        <select
          id="workoutType"
          name="workoutType"
          [(ngModel)]="workoutType"
          required
          class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select a workout type</option>
          <option
            *ngFor="let type of availableWorkoutTypes"
            [value]="type"
          >
            {{ type }}
          </option>
        </select>
      </div>
      <div class="form-group">
        <label for="workoutMinutes" class="text-sm font-medium text-gray-700">
          Workout Minutes*
        </label>
        <input
          type="number"
          id="workoutMinutes"
          name="workoutMinutes"
          [(ngModel)]="workoutMinutes"
          required
          class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
    <button
      type="submit"
      [disabled]="!workoutForm.form.valid"
      class="w-full py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-900 disabled:bg-gray-400 cursor-pointer"
    >
      Add Workout
    </button>
  </form>

  <div class="mt-12">
    <h2 class="text-xl font-semibold text-gray-800 mb-4">Workout Entries</h2>

    <div class="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 mb-4">
      <input
        type="text"
        placeholder="Search by name"
        [(ngModel)]="searchTerm"
        (ngModelChange)="applyFilters()"
        class="w-full p-3 border border-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <select
        [(ngModel)]="filterType"
        (ngModelChange)="applyFilters()"
        class="w-full md:w-1/3 p-3 border border-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">All Workout Types</option>
        <option *ngFor="let type of availableWorkoutTypes" [value]="type">
          {{ type }}
        </option>
      </select>
    </div>

    <div class="overflow-x-auto">
      <table class="min-w-full table-auto border-collapse bg-white rounded-lg shadow-lg">
        <thead>
          <tr>
            <th class="px-4 py-2 text-left text-sm font-semibold text-gray-600">
              Name
            </th>
            <th class="px-4 py-2 text-left text-sm font-semibold text-gray-600">
              Workouts
            </th>
            <th class="px-4 py-2 text-left text-sm font-semibold text-gray-600">
              Number of Workouts
            </th>
            <th class="px-4 py-2 text-left text-sm font-semibold text-gray-600">
              Total Workout Minutes
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            *ngFor="let entry of paginatedEntries"
            class="border-t border-gray-200"
          >
            <td class="px-4 py-2 text-sm text-gray-700">
              {{ entry.userName }}
            </td>
            <td class="px-4 py-2 text-sm text-gray-700">
              {{ entry.workoutType }}
            </td>
            <td class="px-4 py-2 text-sm text-gray-700">
              {{ getNumberOfWorkouts(entry.userName) }}
            </td>
            <td class="px-4 py-2 text-sm text-gray-700">
              {{ getTotalWorkoutMinutes(entry.userName) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="mt-6 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
      <button
        (click)="changePage(-1)"
        [disabled]="currentPage === 1"
        class="px-4 py-2 bg-gray-100 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-400 disabled:bg-gray-100"
      >
        &lt;
      </button>
      <span class="text-sm text-gray-600">Page {{ currentPage }} of {{ totalPages }}</span>
      <button
        (click)="changePage(1)"
        [disabled]="currentPage === totalPages"
        class="px-4 py-2 bg-gray-100 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-400 disabled:bg-gray-100"
      >
        &gt;
      </button>
      <select
        [(ngModel)]="itemsPerPage"
        (ngModelChange)="applyFilters()"
        class="p-3 border border-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option [value]="5">5 per page</option>
        <option [value]="10">10 per page</option>
        <option [value]="20">20 per page</option>
      </select>
    </div>
  </div>

  <div class="mt-12 flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-6">
    <div class="w-full md:w-1/4">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">Users</h2>
      <ul class="space-y-2">
        <li
          *ngFor="let user of getUniqueUsers()"
          (click)="selectUser(user)"
          [class.selected]="user === selectedUser"
          class="cursor-pointer p-3 rounded-lg hover:bg-gray-200"
        >
          {{ user }}
        </li>
      </ul>
    </div>
    <div class="flex-grow">
      <div *ngIf="selectedUser" class="chart-container">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">
          {{ selectedUser }}'s workout progress
        </h2>
        <canvas id="chartCanvas" class="w-full h-72"></canvas>
      </div>
    </div>
  </div>
</div>
  `,
})
export class AppComponent implements OnInit, OnDestroy {
  userName: string = '';
  workoutType: string = '';
  workoutMinutes: number = 0;
  workoutEntries: WorkoutEntry[] = [];
  filteredEntries: WorkoutEntry[] = [];
  paginatedEntries: WorkoutEntry[] = [];
  selectedUser: string | null = null;
  chart: Chart | null = null;

  searchTerm: string = '';
  filterType: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 1;

  availableWorkoutTypes: string[] = [
    'Running', 'Walking', 'Cycling', 'Swimming', 'Weightlifting',
    'Yoga', 'Pilates', 'HIIT', 'Dance', 'Martial Arts'
  ];

  constructor(private elementRef: ElementRef) {}

  ngOnInit() {
    this.loadFromLocalStorage();
    this.applyFilters();
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.destroy(); 
    }
  }

  loadFromLocalStorage() {
    const storedData = localStorage.getItem('workoutEntries');
    if (storedData) {
      this.workoutEntries = JSON.parse(storedData);
    } else {
      this.workoutEntries = [
        { userName: 'John Doe', workoutType: 'Running', workoutMinutes: 30 },
        { userName: 'John Doe', workoutType: 'Cycling', workoutMinutes: 45 },
        { userName: 'Jane Smith', workoutType: 'Swimming', workoutMinutes: 60 },
        { userName: 'Jane Smith', workoutType: 'Running', workoutMinutes: 20 },
        { userName: 'Mike Johnson', workoutType: 'Running', workoutMinutes: 50 },
        { userName: 'Mike Johnson', workoutType: 'Swimming', workoutMinutes: 40 },
      ];
      this.saveToLocalStorage();
    }
  }

  saveToLocalStorage() {
    localStorage.setItem('workoutEntries', JSON.stringify(this.workoutEntries));
  }

  onSubmit(form: NgForm | any) {
    if (form.valid) {
      this.workoutEntries.push({
        userName: this.userName,
        workoutType: this.workoutType,
        workoutMinutes: this.workoutMinutes
      });
      this.saveToLocalStorage();
      this.applyFilters();
      this.selectUser(this.userName);
      this.resetForm(form);
    }
  }

  resetForm(form: NgForm | any) {
    if (form.resetForm && typeof form.resetForm === 'function') {
      form.resetForm();
    }
    this.userName = '';
    this.workoutType = '';
    this.workoutMinutes = 0;
  }

  getUniqueUsers(): string[] {
    return Array.from(new Set(this.workoutEntries.map(entry => entry.userName)));
  }

  selectUser(user: string | null) {
    this.selectedUser = user;
    this.updateChart();
  }

  updateChart() {
    if (this.selectedUser) {
      const canvas = this.elementRef.nativeElement.querySelector('#chartCanvas');
      if (!canvas) return;

      const userEntries = this.workoutEntries.filter(entry => entry.userName === this.selectedUser);
      const workoutData: { [key: string]: number } = {};

      userEntries.forEach(entry => {
        workoutData[entry.workoutType] = (workoutData[entry.workoutType] || 0) + entry.workoutMinutes;
      });

      const labels = Object.keys(workoutData);
      const data = Object.values(workoutData);

      if (this.chart) {
        this.chart.destroy(); // Ensure the previous chart instance is destroyed before creating a new one
      }

      this.chart = new Chart(canvas, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Workout Minutes',
            data: data,
            backgroundColor: '#ffffff',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }
  }

  applyFilters() {
    this.filteredEntries = this.workoutEntries.filter(entry => {
      const nameMatch = entry.userName.toLowerCase().includes(this.searchTerm.toLowerCase());
      const typeMatch = this.filterType ? entry.workoutType === this.filterType : true;
      return nameMatch && typeMatch;
    });
    this.totalPages = Math.ceil(this.filteredEntries.length / this.itemsPerPage);
    this.currentPage = 1;
    this.updatePaginatedEntries();
  }

  updatePaginatedEntries() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedEntries = this.filteredEntries.slice(startIndex, startIndex + this.itemsPerPage);
  }

  changePage(delta: number) {
    this.currentPage += delta;
    this.updatePaginatedEntries();
  }

  getNumberOfWorkouts(userName: string): number {
    return this.workoutEntries.filter(entry => entry.userName === userName).length;
  }

  getTotalWorkoutMinutes(userName: string): number {
    return this.workoutEntries
      .filter(entry => entry.userName === userName)
      .reduce((total, entry) => total + entry.workoutMinutes, 0);
  }
}
