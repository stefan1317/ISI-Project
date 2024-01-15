/*
  Copyright 2019 Esri
  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  OnDestroy
} from "@angular/core";

import esri = __esri; // Esri TypeScript Types

import { Subscription } from "rxjs";
import { FirebaseService, ITestItem } from "src/app/services/database/firebase";
import { FirebaseMockService } from "src/app/services/database/firebase-mock";

import Config from '@arcgis/core/config';
import WebMap from '@arcgis/core/WebMap';
import MapView from '@arcgis/core/views/MapView';

import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';

import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import SimpleRenderer from '@arcgis/core/renderers/SimpleRenderer';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import UniqueValueRenderer from "@arcgis/core/renderers/UniqueValueRenderer";


import { AppSearchBarComponent } from "./search-bar.component";

@Component({
  selector: "app-esri-map",
  templateUrl: "./esri-map.component.html",
  styleUrls: ["./esri-map.component.scss"],
})
export class EsriMapComponent implements OnInit, OnDestroy {
  // The <div> where we will place the map
  @ViewChild("mapViewNode", { static: true }) private mapViewEl: ElementRef;

  // Instances
  map: esri.Map;
  view: esri.MapView;
  pointGraphic: esri.Graphic;
  graphicsLayer: esri.GraphicsLayer;

  countries = new Array(195);
  indexCountries: number = 0;

  layer = new FeatureLayer({
    portalItem: {
      id: "3f406805b72f4d579efa4fefcd567439"
    },
    renderer: this.createRenderer() // Apply renderer to the layer
  });

  // Attributes
  zoom = 10;
  center: Array<number> = [-118.73682450024377, 34.07817583063242];
  basemap = "streets-vector";
  loaded = false;
  pointCoords: number[] = [-118.73682450024377, 34.07817583063242];
  dir: number = 0;
  count: number = 0;
  timeoutHandler = null;

  // firebase sync
  isConnected: boolean = false;
  subscriptionList: Subscription;
  subscriptionObj: Subscription;

  onSearch(countryName: string) {
    console.log("The selected country is: " + countryName);


    this.countries[this.indexCountries++] = countryName;

    //de adaugat in baza de date

    const uniqueValueInfos = new Array();
    for (let i = 0; i < this.indexCountries; i++) {
      const uniqueValue = {
        value: countryName,
        symbol: this.createRedSymbol()
      }
      uniqueValueInfos[i] = uniqueValue;
    }


    // const uniqueValueInfos = this.countries.map(country => {
    //   return {
    //     value: country,
    //     symbol: this.createRedSymbol() // Symbol pentru fiecare țară
    //   };
    // });

    const uniqueValueRenderer = new UniqueValueRenderer({
      field: "name", // Câmpul pentru a face potrivirea
      defaultSymbol: this.createDefaultSymbol(), // Simbol implicit pentru celelalte obiecte
      uniqueValueInfos: uniqueValueInfos
    });
    
    this.layer.renderer = uniqueValueRenderer;

    // for (let index = 0; index < this.indexCountries; index++) {
    
    //     const name = this.countries[index];
    //     // Create a UniqueValueRenderer for the layer
    //         const uniqueValueRenderer = new UniqueValueRenderer({
    //           field: "name", // Field to match
    //           defaultSymbol: this.createDefaultSymbol(), // Default symbol for other features
    //           uniqueValueInfos: [
    //             {
    //               value: name, // Value to match for the first feature
    //               symbol: this.createRedSymbol() // Symbol for the first feature
    //             }, 
    //             {
    //               value: this.countries[0], // Value to match for the first feature
    //               symbol: this.createRedSymbol() // Symbol for the first feature
    //             }, 

    //             // Add more uniqueValueInfos if needed
    //           ]
    //         });
    //        this.layer.renderer = uniqueValueRenderer;
    // }
    
    // Apply the renderer to the layer
    
    this.map.add(this.layer);
  }

  constructor(
    private fbs: FirebaseService
  ) { }

  async initializeMap() {
    try {

      // Configure the Map
      const mapProperties: esri.WebMapProperties = {
        basemap: this.basemap
      };

      Config.apiKey = "AAPK4362d1e510c5410783ea83c5fb2ae5d5mEO3vAC2Gw924ONPAGp0sbEyo5B6onZKVh_T-GG8DIPvn5rdsbz0JSv-mUlC8L2z";

      this.map = new WebMap(mapProperties);

      this.addFeatureLayers();
      this.addGraphicLayers();

      this.map.add(this.layer);

      this.addPoint(this.pointCoords[1], this.pointCoords[0], true);

      // Initialize the MapView
      const mapViewProperties = {
        container: this.mapViewEl.nativeElement,
        center: this.center,
        zoom: this.zoom,
        map: this.map
      };

      this.view = new MapView(mapViewProperties);

      // Fires `pointer-move` event when user clicks on "Shift"
      // key and moves the pointer on the view.
      this.view.on('pointer-move', ["Shift"], (event) => {
        let point = this.view.toMap({ x: event.x, y: event.y });
        console.log("map moved: ", point.longitude, point.latitude);
      });

      await this.view.when(); // wait for map to load
      console.log("ArcGIS map loaded");
      console.log("Map center: " + this.view.center.latitude + ", " + this.view.center.longitude);
      return this.view;
    } catch (error) {
      console.log("EsriLoader: ", error);
    }
  }

  addGraphicLayers() {
    this.graphicsLayer = new GraphicsLayer();
    this.map.add(this.graphicsLayer);
  }

  createRenderer(): SimpleRenderer {
    // Create a default symbol for other countries
    const defaultSymbol = new SimpleFillSymbol({
      color: [200, 200, 200, 0.5], // Light gray with 50% transparency
      outline: {
        color: [255, 255, 255, 1], // White outline
        width: 1
      }
    });

    // Create a renderer using the symbols
    const renderer = new SimpleRenderer({
      symbol: defaultSymbol // Start with the default symbol
    });
       // Update the renderer symbol for the highlighted country
    //renderer.symbol = defaultSymbol;

    return renderer;
  }
  createRedRenderer(): SimpleRenderer {
  const redSymbol = new SimpleFillSymbol({
        color: [255, 0, 0, 0.5], // Red color with 50% transparency
        outline: {
          color: [255, 255, 255, 1], // White outline
          width: 1
        }
      });
      const renderer = new SimpleRenderer({
            symbol: redSymbol // Start with the default symbol
          });
          return renderer;}

createDefaultSymbol(): SimpleFillSymbol {
  return new SimpleFillSymbol({
    color: [200, 200, 200, 0.5], // Light gray with 50% transparency
    outline: {
      color: [255, 255, 255, 1], // White outline
      width: 1
    }
  });
}

createRedSymbol(): SimpleFillSymbol {
  return new SimpleFillSymbol({
    color: [255, 0, 0, 0.5], // Red color with 50% transparency
    outline: {
      color: [255, 255, 255, 1], // White outline
      width: 1
    }
  });
}

addFeatureLayers() {

      //baza de date colorat 

      // this.layer.queryFeatures().then((response) => {
      //   const firstFeature = response.features[0];
      //   const name = firstFeature.attributes.name;
      //   // Create a UniqueValueRenderer for the layer
      //       const uniqueValueRenderer = new UniqueValueRenderer({
      //         field: "name", // Field to match
      //         defaultSymbol: this.createDefaultSymbol(), // Default symbol for other features
      //         uniqueValueInfos: [
      //           {
      //             value: name, // Value to match for the first feature
      //             symbol: this.createRedSymbol() // Symbol for the first feature
      //           }
      //           // Add more uniqueValueInfos if needed
      //         ]
      //       });

      //       // Apply the renderer to the layer
      //       this.layer.renderer = uniqueValueRenderer;
      //   console.log(name);
      // });
      // this.map.add(this.layer);

      console.log("feature layers added");
    }

  addPoint(lat: number, lng: number, register: boolean) {
    let point = new Point({
      longitude: lng,
      latitude: lat
    });

    const simpleMarkerSymbol = {
      type: "simple-marker",
      color: [226, 119, 40],  // Orange
      outline: {
        color: [255, 255, 255], // White
        width: 1
      }
    };
    let pointGraphic: esri.Graphic = new Graphic({
      geometry: point,
      symbol: simpleMarkerSymbol
    });

    this.graphicsLayer.add(pointGraphic);
    if (register) {
      this.pointGraphic = pointGraphic;
    }
  }

  removePoint() {
    if (this.pointGraphic != null) {
      this.graphicsLayer.remove(this.pointGraphic);
    }
  }

  runTimer() {
    this.timeoutHandler = setTimeout(() => {
      // code to execute continuously until the view is closed
      // ...
      this.animatePointDemo();
      this.runTimer();
    }, 200);
  }

  animatePointDemo() {
    this.removePoint();
    switch (this.dir) {
      case 0:
        this.pointCoords[1] += 0.01;
        break;
      case 1:
        this.pointCoords[0] += 0.02;
        break;
      case 2:
        this.pointCoords[1] -= 0.01;
        break;
      case 3:
        this.pointCoords[0] -= 0.02;
        break;
    }

    this.count += 1;
    if (this.count >= 10) {
      this.count = 0;
      this.dir += 1;
      if (this.dir > 3) {
        this.dir = 0;
      }
    }

    this.addPoint(this.pointCoords[1], this.pointCoords[0], true);
    this.fbs.syncPointItem(this.pointCoords[1], this.pointCoords[0])
  }

  stopTimer() {
    if (this.timeoutHandler != null) {
      clearTimeout(this.timeoutHandler);
      this.timeoutHandler = null;
    }
  }

  connectFirebase() {
    if (this.isConnected) {
      return;
    }
    this.isConnected = true;
    this.fbs.connectToDatabase();
    this.subscriptionList = this.fbs.getChangeFeedList().subscribe((items: ITestItem[]) => {
      console.log("got new items from list: ", items);
      this.graphicsLayer.removeAll();
      for (let item of items) {
        this.addPoint(item.lat, item.lng, false);
      }
    });
    this.subscriptionObj = this.fbs.getChangeFeedObj().subscribe((stat: ITestItem[]) => {
      console.log("item updated from object: ", stat);
    });
  }

  addPointItem() {
    console.log("Map center: " + this.view.center.latitude + ", " + this.view.center.longitude);
    this.fbs.addPointItem(this.view.center.latitude, this.view.center.longitude);
  }

  disconnectFirebase() {
    if (this.subscriptionList != null) {
      this.subscriptionList.unsubscribe();
    }
    if (this.subscriptionObj != null) {
      this.subscriptionObj.unsubscribe();
    }
  }

  ngOnInit() {
    // Initialize MapView and return an instance of MapView
    console.log("initializing map");
    this.initializeMap().then(() => {
      // The map has been initialized
      console.log("mapView ready: ", this.view.ready);
      this.loaded = this.view.ready;
      this.runTimer();
    });
  }

  ngOnDestroy() {
    if (this.view) {
      // destroy the map view
      this.view.container = null;
    }
    this.stopTimer();
    this.disconnectFirebase();
  }
}
