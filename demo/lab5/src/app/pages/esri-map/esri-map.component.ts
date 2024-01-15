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
  OnDestroy,
  CUSTOM_ELEMENTS_SCHEMA
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

import FeatureSet from '@arcgis/core/rest/support/FeatureSet';
import RouteParameters from '@arcgis/core/rest/support/RouteParameters';
import * as route from "@arcgis/core/rest/route.js";
import * as locator from "@arcgis/core/rest/locator.js";

// import { AppSearchBarComponent } from "./search-bar.component";
// import { AppSearchBarComponent2 } from "./search-landmark.component";

class SpatialReference {
  wkid;
  latestWkis;
  constructor(wkid,latestWkis) {
    this.wkid = wkid;
    this.latestWkis = latestWkis;
  }
}

class LocationInfo {
  spatialReference : SpatialReference;
  location;
  address;
  score;
  attributes;
  constructor(spatialReference, x, y, address, score, placeName, placeAddress) {
    this.spatialReference = spatialReference;
    this.location = { x, y };
    this.address = address;
    this.score = score;
    this.attributes = {
      PlaceName: placeName,
      Place_addr: placeAddress
    };
  }
}

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
  landmarkName: string;

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
  center: Array<number> = [44.43225, 26.10626];
  basemap = "streets-vector";
  loaded = false;
  pointCoords: number[] = [44.43225, 26.10626];
  dir: number = 0;
  count: number = 0;
  timeoutHandler = null;

  // firebase sync
  isConnected: boolean = false;
  subscriptionList: Subscription;
  subscriptionObj: Subscription;

  onSearchLandmark(landmark: string) {
    this.findPlaces(landmark);
  }

  onSearch(countryName: string) {
    console.log("The selected country is: " + countryName);

    this.countries[this.indexCountries++] = countryName;
    //de adaugat in baza de date

    const uniqueValueInfos = new Array();
    for (let i = 0; i < this.indexCountries; i++) {
      const uniqueValue = {
        value: this.countries[i],
        symbol: this.createRedSymbol()
      }
      uniqueValueInfos[i] = uniqueValue;
    }

    const uniqueValueRenderer = new UniqueValueRenderer({
      field: "name", // Câmpul pentru a face potrivirea
      defaultSymbol: this.createDefaultSymbol(), // Simbol implicit pentru celelalte obiecte
      uniqueValueInfos: uniqueValueInfos
    });

    this.layer.renderer = uniqueValueRenderer;

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
      this.findPlaces([-117.196, 34.056]);
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
      this.addRouter();

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

      console.log("feature layers added");
    }
    addRouter() {
      const routeUrl = "https://route-api.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World";

      this.view.on("click", (event) => {
        console.log("point clicked: ", event.mapPoint.latitude, event.mapPoint.longitude);
        if (this.view.graphics.length === 0) {
          addGraphic("origin", event.mapPoint);
        } else if (this.view.graphics.length === 1) {
          addGraphic("destination", event.mapPoint);
          getRoute(); // Call the route service
        } else {
          this.view.graphics.removeAll();
          addGraphic("origin", event.mapPoint);
        }
      });

      var addGraphic = (type: any, point: any) => {
        const graphic = new Graphic({
          symbol: {
            type: "simple-marker",
            color: (type === "origin") ? "white" : "black",
            size: "8px"
          } as any,
          geometry: point
        });
        this.view.graphics.add(graphic);
      }

      var getRoute = () => {
        const routeParams = new RouteParameters({
          stops: new FeatureSet({
            features: this.view.graphics.toArray()
          }),
          returnDirections: true
        });

        route.solve(routeUrl, routeParams).then((data: any) => {
          for (let result of data.routeResults) {
            result.route.symbol = {
              type: "simple-line",
              color: [5, 150, 255],
              width: 3
            };
            this.view.graphics.add(result.route);
          }

          // Display directions
          if (data.routeResults.length > 0) {
            const directions: any = document.createElement("ol");
            directions.classList = "esri-widget esri-widget--panel esri-directions__scroller";
            directions.style.marginTop = "0";
            directions.style.padding = "15px 15px 15px 30px";
            const features = data.routeResults[0].directions.features;

            let sum = 0;
            // Show each direction
            features.forEach((result: any, i: any) => {
              sum += parseFloat(result.attributes.length);
              const direction = document.createElement("li");
              direction.innerHTML = result.attributes.text + " (" + result.attributes.length + " miles)";
              directions.appendChild(direction);
            });

            sum = sum * 1.609344;
            console.log('dist (km) = ', sum);
            this.view.ui.empty("top-right");
            this.view.ui.add(directions, "top-right");
          }
        }).catch((error: any) => {
          console.log(error);
        });
      }
    }
  findPlaces(landmark) {
      const geocodingServiceUrl = "http://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer";

      const params = {
        address: {
          address: landmark
        },
        //location: x,
        f: "json",
        token: "AAPK52d38feee5af4fe9bdfd773689ad7364LJfRy7t3A73137Q7dZGLRUTCid4xZ6V4lODMFh7BjMFaQzsp5GsXITuXtm1ELo8I",
        outFields: ["PlaceName","Place_addr"]
      }

      locator.addressToLocations(geocodingServiceUrl, params).then((results)=> {
        this.showResults(results);
      });
    }
    showResults(results) {
        this.view.popup.close();
          this.view.graphics.removeAll();
          results.forEach((result : LocationInfo)=>{

            const simpleMarkerSymbol = {
              type: "simple-marker",
              color: [226, 119, 255],  // Orange
              outline: {
                color: [255, 255, 255], // White
                width: 1
              }
            };

            this.graphicsLayer.add(new Graphic({
              geometry: new Point({
                longitude: result.location.x,
                latitude: result.location.y
              }),
              symbol: simpleMarkerSymbol
            }))
          });
          if (results.length) {
            const g = this.view.graphics.getItemAt(0);
            this.view.openPopup({
              features: [g],
              location: g.geometry
            });
          }
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
    const startPoint = { latitude: this.pointCoords[1], longitude: this.pointCoords[0] };
      const endPoint = { latitude: 38.8951, longitude: -90.0060 };

      // Calculate the step size for latitude and longitude
      const stepLat = (endPoint.latitude - startPoint.latitude) / 70;
      const stepLng = (endPoint.longitude - startPoint.longitude) / 70;

      // Update the point coordinates
      this.pointCoords[1] += stepLat;
      this.pointCoords[0] += stepLng;

      if(endPoint.latitude == this.pointCoords[1] && endPoint.longitude == this.pointCoords[0])
     {
      endPoint.latitude = 48;
      endPoint.longitude = 2;
     }

      this.addPoint(this.pointCoords[1], this.pointCoords[0], true);
      this.fbs.syncPointItem(this.pointCoords[1], this.pointCoords[0]);
//
//     this.addPoint(this.pointCoords[1], this.pointCoords[0], true);
//     this.fbs.syncPointItem(this.pointCoords[1], this.pointCoords[0])
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
