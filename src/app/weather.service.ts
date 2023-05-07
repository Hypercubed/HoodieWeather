import { Injectable } from "@angular/core";
import type { GPS } from "./gps.service";

export interface Weather {
  temperature: number;
  weathercode: number;
}

export interface Forecast {
  temperature: number;
  shortForecast: string;
}

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  async getWeather(gps: GPS): Promise<Weather> {
    const { lat, long } = gps;
  
    const api = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&current_weather=true`;
  
    const response = await fetch(api);
    const jsonData = await response.json();
  
    return jsonData.current_weather;
  }

  async getWeatherGovMeta(gps: GPS) {
    const { lat, long } = gps;

    const api = `https://api.weather.gov/points/${lat},${long}`;

    const response = await fetch(api);
    const jsonData = await response.json();

    return jsonData;
  }

  async getForecast(url: string): Promise<Forecast> {
    const response = await fetch(url);
    const jsonData = await response.json();

    return jsonData.properties.periods[0];
  }
}