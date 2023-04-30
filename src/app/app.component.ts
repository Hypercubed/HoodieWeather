import { Component } from '@angular/core';

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
    lat: 39.977763,
    long: -105.131930
  };

  get fahrenheit() {
    return this.weather.celsius * 1.8 + 32;
  }

  get temp() {
    return this.fahrenheit.toFixed() + ' ºF';
  }

  get top() {
    if (this.weather.celsius < 20) {
      return 'jacket';
    } else if (this.weather.celsius < 30) {
      return 'hoodie';
    } else {
      return 't-shirt';
    }
  }

  ngOnInit() {
    this.setup();
  }

  async setup() {
    try {
      this.gps = await getLocation();
    } catch (e) {
      this.gps = {
        lat: 39.977763,
        long: -105.131930
      }
    }

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
  return new Promise((resolve) => {
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
      });
    } else {
      resolve({
        lat: 39.977763,
        long: -105.131930
      });
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
