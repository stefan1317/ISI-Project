// app.module.ts
import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { FormsModule } from '@angular/forms';  // Import FormsModule
import { MatInputModule } from '@angular/material/input';  // Import MatInputModule

import { AppComponent } from "./app.component";
import { EsriMapComponent } from "./pages/esri-map/esri-map.component";
import { AppRoutingModule } from "./app-routing.module";

import { environment } from '../environments/environment';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';

import { FirebaseService } from './services/database/firebase';
import { FirebaseMockService } from './services/database/firebase-mock';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { FlexLayoutModule } from '@angular/flex-layout';

import { AppSearchBarComponent } from './pages/esri-map/search-bar.component';
import { AppSearchLandmarkComponent } from "./pages/esri-map/search-landmark.component";

@NgModule({
  declarations: [AppComponent, EsriMapComponent, AppSearchBarComponent, AppSearchLandmarkComponent],
  imports: [
    BrowserModule,
    FormsModule,  // Add FormsModule here
    MatInputModule,  // Add MatInputModule here
    AppRoutingModule,
    BrowserAnimationsModule,
    MatTabsModule,
    MatButtonModule,
    MatDividerModule,
    MatListModule,
    FlexLayoutModule,
    AngularFireModule.initializeApp(environment.firebase, 'AngularDemoArcGIS'),
    AngularFireDatabaseModule
  ],
  providers: [
    FirebaseService,
    FirebaseMockService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
