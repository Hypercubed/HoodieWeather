import { Component, inject } from '@angular/core';
import { GPS, GpsLocationService } from './gps.service';
import { Weather, WeatherService } from './weather.service';

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

  private forecastUrl?: string;

  ngOnInit() {
    this.setup();
  }

  async setup() {
    const gps = await this.getPosition();

    const meta = await this.weatherService.getWeatherGovMeta(gps);
    const { relativeLocation, forecastHourly } = meta.properties;

    this.location = relativeLocation.properties.city + ', ' + relativeLocation.properties.state;
    this.forecastUrl = forecastHourly;

    this.refresh();

    setInterval(() => {
      this.refresh();
    }, 60 * 1000 * 5);
  }

  async refresh() {
    if (!this.forecastUrl) return;

    const { shortForecast, temperature } = await this.weatherService.getForecast(this.forecastUrl!);
    this.description = shortForecast;

    this.temp = temperature.toFixed() + ' ºF';
    this.top = getImage(temperature || -273);
  }

  async getPosition(): Promise<GPS> {
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
}

function getImage(temperature: number) {
  if (!temperature) return '';

  if (temperature < 51) {  // 51ºF
    return 'jacket';
  } else if (temperature < 65) {  // 65ºF
    return 'hoodie';
  } else {
    return 't-shirt';
  }
}
