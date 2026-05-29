const axios = require('axios');

class WeatherService {
  async getDailyEnvironment(
    location,
    date
  ) {
    const response = await axios.get(
      'https://api.weatherapi.com/v1/forecast.json',
      {
        params: {
          key:
            process.env.WEATHER_API_KEY,

          q: location,

          days: 1,

          dt: date,

          aqi: 'no',

          alerts: 'no',
        },
      }
    );

    const day =
      response.data.forecast
        .forecastday[0].day;

    const temperature_avg =
      day.avgtemp_c;

    const humidity_avg =
      day.avghumidity;

    const uv_index = Math.round(
      day.uv
    );

    const recommended_spf =
      this.calculateRecommendedSpf(
        uv_index
      );

    const hydration_multiplier =
      this.calculateHydrationMultiplier({
        temperature_avg,
        humidity_avg,
        uv_index,
      });

    return {
      temperature_avg,

      humidity_avg,

      uv_index,

      recommended_spf,

      hydration_multiplier,
    };
  }

  calculateRecommendedSpf(uv) {
    if (uv <= 2) return 15;

    if (uv <= 5) return 30;

    return 50;
  }

  calculateHydrationMultiplier({
    temperature_avg,
    humidity_avg,
    uv_index,
  }) {
    let multiplier = 1;

    // TEMPERATURE

    if (temperature_avg >= 30) {
      multiplier += 0.2;
    } else if (temperature_avg >= 25) {
      multiplier += 0.1;
    } else if (temperature_avg >= 20) {
      multiplier += 0.05;
    }

    // HUMIDITY

    if (humidity_avg <= 20) {
      multiplier += 0.15;
    } else if (humidity_avg <= 35) {
      multiplier += 0.1;
    } else if (humidity_avg <= 50) {
      multiplier += 0.05;
    }

    // UV

    if (uv_index >= 8) {
      multiplier += 0.1;
    } else if (uv_index >= 6) {
      multiplier += 0.05;
    }

    return Number(
      multiplier.toFixed(2)
    );
  }

  calculateTargetWater(
    waterAvg,
    hydrationMultiplier
  ) {
    return Math.round(
      waterAvg * hydrationMultiplier
    );
  }
}

module.exports = new WeatherService();