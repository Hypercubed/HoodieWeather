import { Injectable } from "@angular/core";
import type { GPS } from "./gps.service";

export interface Forecast {
  temperature: number;
  shortForecast: string;
  windChill: number;
  chanceOfRain: number;
}

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  // TODO: Use this API if getForecast fails
  // async getWeather(gps: GPS): Promise<Forecast> {
  //   const { lat, long } = gps;
  
  //   const api = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&current_weather=true`;
  
  //   const response = await fetch(api);
  //   const jsonData = await response.json();
  
  //   return jsonData.current_weather;
  // }

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

    // Forecast for next hour
    const { temperature, shortForecast, windSpeed, probabilityOfPrecipitation } = jsonData.properties.periods[0];

    const wind = windSpeed ? +windSpeed.replace(' mph', '') : 0;
    const windChill = calculateWindChill(temperature, wind);

    return {
      temperature,
      shortForecast,
      windChill,
      chanceOfRain: probabilityOfPrecipitation ? probabilityOfPrecipitation.value : 0
    };
  }
}

// Source: https://www.weather.gov/media/epz/wxcalc/windChill.pdf
function calculateWindChill(temp: number, windSpeed: number): number {
  return 35.74 + (0.6215 * temp) - (35.75 * Math.pow(windSpeed, 0.16)) + (0.4275 * temp * Math.pow(windSpeed, 0.16));
}