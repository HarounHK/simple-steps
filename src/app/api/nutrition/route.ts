import { NextResponse } from "next/server";

// FatSecret endpoint and OAuth credentials
const FATSECRET_API_URL = "https://platform.fatsecret.com/rest/server.api";
const CLIENT_ID = process.env.FATSECRET_CLIENT_ID!;
const CLIENT_SECRET = process.env.FATSECRET_CLIENT_SECRET!;

// Interfaces
interface FoodItem {
  food_id: string;
  [key: string]: unknown;
}

interface ServingData {
  serving_weight_grams?: string | number;
  metric_serving_amount?: string | number;
  calories?: string | number;
  protein?: string | number;
  carbohydrate?: string | number;
  fat?: string | number;
  sugar?: string | number;
  [key: string]: unknown;
}

interface FoodDetails {
  food_name?: string;
  servings?: {
    serving?: ServingData | ServingData[];
  };
  [key: string]: unknown;
}

// Parses a value to a float
function parseNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return parseFloat(value) || 0;
  return 0;
}

// Converts nutrient values to per 100g
function convertToPer100g(nutrientValue: unknown, servingWeight: number): string {
  if (!servingWeight || servingWeight <= 0) return parseNumber(nutrientValue).toFixed(2);
  return ((parseNumber(nutrientValue) * 100) / servingWeight).toFixed(2);
}

// Fetches an OAuth access token from FatSecret.
async function fetchAccessToken(): Promise<string> {
  const url = "https://oauth.fatsecret.com/connect/token";

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)}`,
    },
    body: "grant_type=client_credentials&scope=basic",
  });

  if (!response.ok) {
    return NextResponse.json({ error: "Failed to retrieve access token" }, { status: 500 }) as unknown as string;
  }

  const data = await response.json();
  return data.access_token;
}

// Retrieves detailed info about a specific food item using the food ID.
async function fetchFoodDetails(foodId: string, token: string): Promise<FoodDetails> {
  const response = await fetch(
    `${FATSECRET_API_URL}?method=food.get.v3&format=json&food_id=${foodId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    return NextResponse.json({ error: "Could not retrieve food details." }, { status: 500 }) as unknown as FoodDetails;
  }

  const data = await response.json();
  return data.food;
}

// Handles GET request for searching and returning food data.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");

  try {
    const token = await fetchAccessToken();

    // Search for food items matching the query
    const searchResponse = await fetch(
      `${FATSECRET_API_URL}?method=foods.search&format=json&search_expression=${encodeURIComponent(query!)}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!searchResponse.ok) {
      return NextResponse.json({ error: "Could not retrieve search results." }, { status: 500 });
    }

    const searchData = await searchResponse.json();
    const foodItems = searchData.foods?.food;

    if (!foodItems) {
      return NextResponse.json({ error: "No results found" }, { status: 404 });
    }

    // Limit results to top 3 items
    const topFoods: FoodItem[] = ([] as FoodItem[]).concat(foodItems).slice(0, 3);

    // Fetch detailed data and fix to per 100g
    const detailedFoods = await Promise.all(topFoods.map(fetchFood));

    async function fetchFood(item: FoodItem): Promise<Record<string, string | number> | null> {
      try {
        const details = await fetchFoodDetails(item.food_id as string, token);

        const servingData = Array.isArray(details?.servings?.serving)
          ? details.servings.serving[0]
          : details.servings?.serving;

        const servingWeight =
          parseNumber(servingData?.serving_weight_grams) ||
          parseNumber(servingData?.metric_serving_amount) ||
          100;

        return {
          id: item.food_id,
          name: details.food_name || "Unknown",
          calories: convertToPer100g(servingData?.calories, servingWeight),
          protein: convertToPer100g(servingData?.protein, servingWeight),
          carbs: convertToPer100g(servingData?.carbohydrate, servingWeight),
          fat: convertToPer100g(servingData?.fat, servingWeight),
          sugar: convertToPer100g(servingData?.sugar, servingWeight),
        };
      } catch {
        return null;
      }
    }

    // Remove any failed results
    const validResults = detailedFoods.filter((food): food is Record<string, string | number> => food !== null);

    return NextResponse.json(validResults, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
