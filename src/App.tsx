import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import "./App.css";

// Define the interface for the weather information
interface WeatherInfo {
  date: string;
  temp: number;
  temp_min: number;
  temp_max: number;
  humidity: number;
}

const App: React.FC = () => {
  // State for storing weather data, location name, and loading state
  const [weatherReportData, setWeatherReportData] = useState<WeatherInfo[]>([]);
  const [locationName, setLocationName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const apiKey = '8d8ec7f8761ec7bde05a6ad20a94da31';
  const latitude = 12.971599;
  const longitude = 77.594566;

  useEffect(() => {
    getFiveDaysWeatherReport(latitude, longitude, apiKey);
  }, []);

// Function to retrieve weather data
const getFiveDaysWeatherReport = async (lat: number, lon: number, apiKey: string) => {
  try {
    // Set loading state to true while fetching data
    setLoading(true);

    // Fetch weather data from OpenWeatherMap API
    const response = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);

    // Extract location name from the API response
    setLocationName(response.data.city.name);

    // Extract weather information for the next five days
    const weatherData = response.data.list;
    const weatherInfo: WeatherInfo[] = weatherData.map((item: { main: WeatherInfo; dt_txt: string; }) => {
      const { main, dt_txt } = item;
      const { temp, temp_min, temp_max, humidity } = main;

      return {
        date: dt_txt,
        temp,
        temp_min,
        temp_max,
        humidity
      };
    });

    // Initialize an object to store nearest weather entries
    const nearestWeatherEntries: { [date: string]: WeatherInfo } = {};

    // Iterate through the weather info
    for (const entry of weatherInfo) {
      const date = entry.date.split(' ')[0];
      const time = entry.date.split(' ')[1].split(':');
      const hours = parseInt(time[0]);
      const minutes = parseInt(time[1]);

      const currentTime = moment();
      const currentHour = parseInt(currentTime.format('HH'));
      const currentMinutes = parseInt(currentTime.format('mm'));

      const nearNextWeatherReportHour = currentHour + (3 - currentHour % 3);
      const nearWeatherReportHour = currentHour % 3 === 0 ? currentHour > 21 ? 0 : currentHour : nearNextWeatherReportHour === 24 ? 0 : nearNextWeatherReportHour;

      // Check if the entry's time matches the nearest weather report hour
      if (hours === nearWeatherReportHour && minutes >= 0 && minutes <= currentMinutes) {
        // Check if the date already exists in nearestWeatherEntries
        if (!nearestWeatherEntries[date]) {
          nearestWeatherEntries[date] = {
            date: entry.date,
            temp_min: entry.temp_min,
            temp_max: entry.temp_max,
            humidity: entry.humidity,
            temp: entry.temp
          };
        }
      }
    }

    // If there are any nearest weather entries, set them in state
    if (Object.keys(nearestWeatherEntries).length > 0) {
      setWeatherReportData(Object.values(nearestWeatherEntries));
    }

    // Set loading state to false after data is fetched
    setLoading(false);
  } catch (error) {
    // Handle and log any errors that occur during the process
    console.log("Error:", error);
  }
};


  return (
    <>
      <div className="App">
        {!loading && <h2 style={{ textAlign: 'center' }}>5-Days Weather Report for {locationName}</h2>}
        {weatherReportData?.length > 0 ? (
          weatherReportData.map((weatherInfo, index) => (
            <div className="box-container" key={index}>
              <div><h4>Date: {weatherInfo.date}</h4></div>
              <p>Location: {locationName}</p>
              <p>Current Temperature: {weatherInfo.temp} °C</p>
              <p>Min Temperature: {weatherInfo.temp_min} °C</p>
              <p>Max Temperature: {weatherInfo.temp_max} °C</p>
              <p>Humidity: {weatherInfo.humidity}%</p>
            </div>
          ))
        ) : (
          loading ? (
            <h1 className="loading-wrapper">Loading...</h1>
          ) : (
            <div className="nodata-wrapper">No Weather Report Data</div>
          )
        )}
      </div>
    </>
  );
};

export default App;
