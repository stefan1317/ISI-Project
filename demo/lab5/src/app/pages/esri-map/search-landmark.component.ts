import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-search-landmark',
  template: `
    <input [(ngModel)]="landmark" placeholder="Enter Landmark" />
    <button (click)="searchForLandmark()">Search Landmark</button>
  `,
})
export class AppSearchLandmarkComponent {
  @Output() searchLandmark = new EventEmitter<string>();
  landmark: string = '';

  searchForLandmark() {
    this.searchLandmark.emit(this.landmark);
  }
}