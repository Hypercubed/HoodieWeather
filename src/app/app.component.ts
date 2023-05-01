import { Component } from '@angular/core';

const API_KEY = 'AIzaSyDUOuJCh05RISrgQPV-IkzMQt74TDTqK2U';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  weather?: Weather;
  location?: string;
  description?: string;
  temp?: string;
  top: string = '';

  gps: GPS = {
    lat: 0,
    long: 0
  };

  ngOnInit() {
    this.setup();
  }

  async setup() {
    this.gps = await getPosition();
    this.refresh();

    setInterval(() => {
      this.refresh();
    }, 60 * 1000 * 5);
  }

  async refresh() {
    this.weather = await getWeather(this.gps);
    this.location = await getLocation(this.gps);
    this.description = getWeatherDescription(this.weather.weathercode);

    this.temp = ((this.weather?.temperature || -273) * 1.8 + 32).toFixed() + ' ºF';
    this.top = getImage(this.weather?.temperature || -273);
  }
}

interface GPS {
  lat: number;
  long: number;
}

interface Weather {
  temperature: number;
  weathercode: number;
}

async function getPosition(): Promise<GPS> {
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
      // TODO: Try https://ipapi.co/json/
      reject('Geolocation is not supported by this browser.');
    }
  });
}

async function getWeather(gps: GPS): Promise<Weather> {
  const { lat, long } = gps;

  const api = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&current_weather=true`;

  const response = await fetch(api);
  const jsonData = await response.json();

  return jsonData.current_weather;
}

async function getLocation(gps: GPS) {
  const { lat, long } = gps;
  const api = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${long}&key=${API_KEY}&result_type=administrative_area_level_1`;

  const response = await fetch(api);
  const jsonData = await response.json();

  return jsonData.results[0].formatted_address;
}

function getWeatherDescription(weathercode: number) {
  switch(weathercode){
    case 0: return "Clear sky";
    case 1: return "Mainly clear";
    case 2: return "Partly cloudy";
    case 3: return "Overcast";
    case 45: return "Fog";
    case 48: return "Rime fog";
    case 51: return "Light Drizzle";
    case 53: return "Moderate Drizzle";
    case 55: return "Dense Drizzle";
    case 56: return "Light Freezing Drizzle";
    case 57: return "Dense Freezing Drizzle";
    case 61: return "Light Rain";
    case 63: return "Moderate Rain";
    case 65: return "Heavy Rain";
    case 66: return "Light Freezing Rain";
    case 67: return "Heavy Freezing Rain";
    case 71: return "Light Snow";
    case 73: return "Moderate Snow";
    case 75: return "Heavy Snow";
    case 77: return "Snow Grains";
    case 80: return "Slight Rain Showers";
    case 81: return "Moderate Rain Showers";
    case 82: return "Violent Rain Showers";
    case 85: return "Slight Snow Showers";
    case 86: return "Heavy Snow Showers";
    case 95: return "Thunderstorm";
    case 96: return "Thunderstorm with slight hail";
    case 99: return "Thunderstorm with heavy hail";
    default: return "";
  }
}

function getImage(celsius: number) {
  if (!celsius) return '';

  if (celsius < 10.6) {  // 51ºF
    return 'jacket';
  } else if (celsius < 18.4) {  // 65ºF
    return 'hoodie';
  } else {
    return 't-shirt';
  }
}
