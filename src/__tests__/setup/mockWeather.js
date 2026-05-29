jest.mock(
  '../../src/modules/weather/weather.service',
  () => ({
    getWeather: jest.fn(() =>
      Promise.resolve({
        temperature: 20,
        humidity: 50,
      })
    ),
  })
);