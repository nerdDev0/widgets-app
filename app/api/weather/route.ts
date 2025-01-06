import { NextResponse } from "next/server";
import axios from "axios";

const api_key = process.env.API_KEY;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city");

  if (!city) {
    return NextResponse.json(
      { error: "City name is required." },
      { status: 400 }
    );
  }

  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather`,
      {
        params: {
          q: city,
          units: "metric",
          appid: api_key,
        },
      }
    );

    const weatherData = response.data;
    const isDay =
      weatherData.dt > weatherData.sys.sunrise &&
      weatherData.dt < weatherData.sys.sunset;

    return NextResponse.json({
      temperature: Math.round(weatherData.main.temp), // دما بدون اعشار
      isDay,
    });
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return NextResponse.json(
      { error: "Failed to fetch weather data." },
      { status: 500 }
    );
  }
}
