import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  name = 'Angular';

  celsius = 0;

  location = '';
  description = '';
  main = '';

  get fahrenheit() {
    return this.celsius * 1.8 + 32;
  }

  get temp() {
    return this.fahrenheit.toFixed() + ' ºF';
  }

  get top() {
    if (this.celsius < 20) {
      return 'jacket';
    } else if (this.celsius < 30) {
      return 'hoodie';
    } else {
      return 't-shirt';
    }
  }

  ngOnInit() {
    this.refresh();

    setInterval(() => {
      this.refresh();
    }, 60 * 1000 * 5)
  }

  async refresh() {
    const w = await getWeather();

    this.celsius = w.celsius;
    this.location = w.location;
    this.description = w.description;
    this.main = w.main;
  }
}

interface Weather {
  celsius: number;
  location: string;
  description: string;
  main: string;
}

function getWeather(): Promise<Weather> {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const lat = position.coords.latitude;
        const long = position.coords.longitude;

        const api = `https://fcc-weather-api.glitch.me/api/current?lat=${lat}&lon=${long}`;

        const response = await fetch(api);
        const jsonData = await response.json();

        resolve({
          celsius: jsonData.main.temp,
          location: jsonData.name,
          description: jsonData.weather[0].description,
          main: jsonData.weather[0].main
        });
      });
    } else {
      reject('Geolocation is not supported by this browser.');
    }
  });
}
