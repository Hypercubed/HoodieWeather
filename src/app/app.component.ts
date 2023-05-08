import { Component, inject } from '@angular/core';
import { GPS, GpsLocationService } from './gps.service';
import { Forecast, WeatherService } from './weather.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  gpsService = inject(GpsLocationService);
  weatherService = inject(WeatherService);

  location?: string;
  description?: string;
  temp?: string;
  top: string = '';

  gps?: GPS;

  private forecastUrl?: string;

  ngOnInit() {
    this.setup();
  }

  async setup() {
    this.gps = await this.getPosition();
    this.location = this.gps.location;

    const { properties } = await this.weatherService.getWeatherGovMeta(this.gps);
    const { relativeLocation, forecastHourly } = properties;

    if (relativeLocation) {
      this.location = relativeLocation.properties.city + ', ' + relativeLocation.properties.state;
    }
    this.forecastUrl = forecastHourly;

    this.refresh();

    setInterval(() => {
      this.refresh();
    }, 60 * 1000 * 5);
  }

  private async refresh() {
    if (!this.forecastUrl) return;

    const forecast = await this.weatherService.getForecast(this.forecastUrl!);

    this.description = forecast.shortForecast;

    this.temp = forecast.temperature.toFixed() + ' ºF';
    this.top = getImage(forecast);
  }

  private async getPosition(): Promise<GPS> {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
  
    if (urlParams.has('lat') && urlParams.has('lon')) {
      const lat = urlParams.get('lat')!;
      const long = urlParams.get('lon')!;
    
      return {
        lat: parseFloat(lat),
        long: parseFloat(long)
      }
    }

    try {
      return await this.gpsService.getPositionFromBrowser();
    } catch (e) {
      console.log(e);
    }

    try {
      return await this.gpsService.getPositionFromIp();
    } catch (e) {
      console.log(e);
    }

    return { lat: 0, long: 0 };
  }

  openLocation() {
    if (!this.gps) return;
    window.location.search = `?lat=${this.gps.lat}&lon=${this.gps.long}`;
  }
}

function getImage(forecast: Forecast): string {
  const { apparentTemperature, chanceOfRain } = forecast;

  if (chanceOfRain > 30) {
    return 'raincoat';
  } else if (apparentTemperature < 51) {
    return 'jacket';
  } else if (apparentTemperature < 65) {
    return 'hoodie';
  } else {
    return 't-shirt';
  }
}
