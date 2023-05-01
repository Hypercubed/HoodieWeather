import { Component } from '@angular/core';
import { ReplaySubject } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  name = 'Angular';

  weather: Weather = {
    celsius: 0,
    location: '',
    description: '',
    main: ''
  };

  gps: GPS = {
    lat: 0,
    long: 0
  };

  get fahrenheit() {
    return this.weather.celsius * 1.8 + 32;
  }

  get temp() {
    return this.fahrenheit.toFixed() + ' ºF';
  }

  get top() {
    if (this.weather.celsius < 7) {
      return 'jacket';
    } else if (this.weather.celsius < 18) {
      return 'hoodie';
    } else {
      return 't-shirt';
    }
  }

  ngOnInit() {
    this.setup();
  }

  async setup() {
    this.gps = await getLocation();
    this.refresh();

    setInterval(() => {
      this.refresh();
    }, 60 * 1000 * 5);
  }

  async refresh() {
    this.weather = await getWeather(this.gps);
  }
}

interface GPS {
  lat: number;
  long: number;
}

interface Weather {
  celsius: number;
  location: string;
  description: string;
  main: string;
}

async function getLocation(): Promise<GPS> {
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

  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      let lat = 0;
      let long = 0;

      navigator.geolocation.getCurrentPosition(position => {
        lat = position.coords.latitude;
        long = position.coords.longitude;

        window.location.search = `?lat=${lat}&lon=${long}`;

        resolve({
          lat,
          long
        });
      });
    } else {
      reject('Geolocation is not supported by this browser.');
    }
  });
}

async function getWeather(gps: GPS): Promise<Weather> {
  const { lat, long } = gps;

  const api = `https://fcc-weather-api.glitch.me/api/current?lat=${lat}&lon=${long}`;

  const response = await fetch(api);
  const jsonData = await response.json();

  return {
    celsius: jsonData.main.temp,
    location: jsonData.name,
    description: jsonData.weather[0].description,
    main: jsonData.weather[0].main
  };
}
