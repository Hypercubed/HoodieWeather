import { Injectable } from "@angular/core";

export interface GPS {
  lat: number;
  long: number;
  location?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GpsLocationService {
  async getPositionFromBrowser(): Promise<GPS> {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        let lat = 0;
        let long = 0;
  
        navigator.geolocation.getCurrentPosition(position => {
          lat = position.coords.latitude;
          long = position.coords.longitude;
  
          resolve({
            lat,
            long
          });
        }, () => {
          reject('Permission not granted for Geolocation.');
        });
      } else {
        reject('Geolocation is not supported by this browser.');
      }
    });
  }

  async getPositionFromIp(): Promise<GPS> {
    const response = await fetch('https://ipapi.co/json');
    const json = await response.json();

    const lat = parseFloat(json.latitude);
    const long = parseFloat(json.longitude);


    return {
      lat: parseFloat(json.latitude),
      long: parseFloat(json.longitude),
      location: `${json.city}, ${json.region_code}`
    };
  }
}