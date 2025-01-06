import { NextResponse } from "next/server";
import axios from "axios";

const api_key = process.env.API_KEY; 

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");

  if (!query || query.length < 2) {
    return NextResponse.json(
      { error: "Query must be at least 2 characters long." },
      { status: 400 }
    );
  }

  try {
    const response = await axios.get(
      `http://api.openweathermap.org/geo/1.0/direct`,
      {
        params: {
          q: query,
          limit: 5,
          appid: api_key,
        },
      }
    );

    const data = response.data.map((item: any) => ({
      name: item.name,
      country: item.country,
      state: item.state || "",
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching city suggestions:", error);
    return NextResponse.json(
      { error: "Failed to fetch city suggestions." },
      { status: 500 }
    );
  }
}
