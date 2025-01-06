"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import styles from "../page.module.css";

export default function WeatherPage() {
  
  const [city, setCity] = useState<string>(() => {
    return localStorage.getItem("weatherCity") || "Tehran"; // شهر پیش‌فرض
  });
  const [temperature, setTemperature] = useState<string | null>(null);
  const [isDay, setIsDay] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState<boolean>(false); // نمایش یا عدم نمایش دیالوگ جستجو
  const [search, setSearch] = useState<string>(""); // متن جستجو
  const [suggestions, setSuggestions] = useState<
    { name: string; country: string; state: string }[]
  >([]);
  const dialogRef = useRef<HTMLDivElement | null>(null); // مرجع دیالوگ برای کنترل کلیک خارج

  // بارگذاری اطلاعات شهر ذخیره‌شده یا پیش‌فرض
  useEffect(() => {
    fetchWeather(city);
  }, [city]);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        setShowDialog(false);
      }
    };

    if (showDialog) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDialog]);

 
  const fetchWeather = async (cityName: string) => {
    setError(null); // پاک کردن خطا
    setTemperature(null); // پاک کردن دما

    try {
      const response = await axios.get(`/api/weather?city=${cityName}`);
      setTemperature(`${response.data.temperature}°C`);
      setIsDay(response.data.isDay);
    } catch (err) {
      console.error("Error fetching weather data:", err);
      setError("Unable to fetch weather data.");
    }
  };


  const fetchSuggestions = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await axios.get(`/api/cities?q=${query}`);
      const cities = response.data.map(
        (item: { name: string; country: string; state?: string }) => ({
          name: item.name,
          country: item.country,
          state: item.state || "N/A",
        })
      );
      setSuggestions(cities);
    } catch (err) {
      console.error("Error fetching city suggestions:", err);
      setSuggestions([]);
    }
  };


  const handleCitySelection = (selectedCity: string) => {
    setCity(selectedCity); 
    localStorage.setItem("weatherCity", selectedCity); 
    setShowDialog(false); 
    setSearch(""); 
    setSuggestions([]); 
  };

  return (
    <div className={styles.container}>
     
      <div className={styles.header}>
        <h1>Weather App</h1>
        <button
          className={styles.searchButton}
          onClick={() => setShowDialog(true)}
        >
          🔍
        </button>
      </div>

     
      {showDialog && (
        <div className={styles.dialog} ref={dialogRef}>
          <div className={styles.dialogContent}>
            <input
              type="text"
              placeholder="Enter city name"
              value={search}
              onChange={(e) => {
                const value = e.target.value;
                setSearch(value);
                fetchSuggestions(value); 
              }}
              className={styles.input}
            />
            {suggestions.length > 0 && (
              <ul className={styles.suggestionsList}>
                {suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    onClick={() =>
                      handleCitySelection(
                        `${suggestion.name}, ${suggestion.state}, ${suggestion.country}`
                      )
                    }
                    className={styles.suggestionItem}
                  >
                    {suggestion.name}, {suggestion.state}, {suggestion.country}
                  </li>
                ))}
              </ul>
            )}
            {search.length >= 2 && suggestions.length === 0 && (
              <p className={styles.error}>City not found. Try again.</p>
            )}
          </div>
        </div>
      )}

    
      <div className={styles.weatherInfo}>
        {error ? (
          <p className={styles.error}>{error}</p>
        ) : (
          <>
            <p>City: {city}</p>
            <p>Temperature: {temperature}</p>
            <p>
              Status: {isDay !== null ? (isDay ? "Day" : "Night") : "Loading..."}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
