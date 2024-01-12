import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-search-bar',
  template: `
    <input [(ngModel)]="countryName" placeholder="Enter Country" />
    <button (click)="search()">Search</button>
  `,
})
export class AppSearchBarComponent {
  @Output() searchCountry = new EventEmitter<string>();
  countryName: string = '';

  search() {
    this.searchCountry.emit(this.countryName);
  }
}
