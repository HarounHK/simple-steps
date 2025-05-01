// /api/nutrition  – verbose-logging version
import { NextResponse } from "next/server";

/* ------------------------------------------------------------------ */
/*  FatSecret constants + helper                                      */
/* ------------------------------------------------------------------ */
const FATSECRET_API_URL = "https://platform.fatsecret.com/rest/server.api";
const CLIENT_ID     = (process.env.FATSECRET_CLIENT_ID  || "").trim();
const CLIENT_SECRET = (process.env.FATSECRET_CLIENT_SECRET || "").trim();

console.log("🐾  Loaded FatSecret env-vars » id.length=%d  secret.length=%d",
            CLIENT_ID.length, CLIENT_SECRET.length);

/* ------------------------------------------------------------------ */
/*  Utilities                                                         */
/* ------------------------------------------------------------------ */
interface FoodItem { food_id: string; [k: string]: unknown }
interface ServingData {
  serving_weight_grams?: string | number;
  metric_serving_amount?: string | number;
  calories?: string | number;
  protein?: string | number;
  carbohydrate?: string | number;
  fat?: string | number;
  sugar?: string | number;
  [k: string]: unknown;
}
interface FoodDetails {
  food_name?: string;
  servings?: { serving?: ServingData | ServingData[] };
  [k: string]: unknown;
}

const num = (v: unknown) =>
  typeof v === "number" ? v : typeof v === "string" ? parseFloat(v) || 0 : 0;

const per100g = (v: unknown, g: number) =>
  !g ? num(v).toFixed(2) : ((num(v) * 100) / g).toFixed(2);

/* ------------------------------------------------------------------ */
/*  OAuth token                                                       */
/* ------------------------------------------------------------------ */
async function fetchAccessToken(): Promise<string> {
  console.log("🔑  Requesting FatSecret access-token …");

  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error("FatSecret credentials are missing!");
  }

  const res = await fetch("https://oauth.fatsecret.com/connect/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64"),
    },
    body: "grant_type=client_credentials&scope=basic",
  });

  const body = await res.text();
  console.log("🔑  token status=%d  body=%s", res.status, body.slice(0, 300));

  if (!res.ok) throw new Error("Failed to get FatSecret token");

  return JSON.parse(body).access_token as string;
}

/* ------------------------------------------------------------------ */
/*  Helpers for food look-ups                                         */
/* ------------------------------------------------------------------ */
async function fetchFoodDetails(foodId: string, token: string) {
  const url = `${FATSECRET_API_URL}?method=food.get.v3&format=json&food_id=${foodId}`;
  console.log("🥄  food.get.v3 id=%s", foodId);

  const res   = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const body  = await res.text();
  console.log("🥄  details status=%d size=%dB", res.status, body.length);

  if (!res.ok) throw new Error("food.get.v3 failed");
  return JSON.parse(body).food as FoodDetails;
}

/* ------------------------------------------------------------------ */
/*  Route handler                                                     */
/* ------------------------------------------------------------------ */
export async function GET(req: Request) {
  console.log("\n🚀  /api/nutrition --------------------------------------------------");

  const query = new URL(req.url).searchParams.get("query")?.trim();
  console.log("🔍  query='%s'", query);

  if (!query) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  try {
    console.time("⏱️  overall");

    /* ---------------- token ---------------- */
    const token = await fetchAccessToken();

    /* ---------------- search ---------------- */
    const searchURL =
      FATSECRET_API_URL +
      `?method=foods.search&format=json&search_expression=${encodeURIComponent(
        query,
      )}`;
    console.log("📡  foods.search %s", searchURL);

    const sRes  = await fetch(searchURL, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const sBody = await sRes.text();
    console.log("📡  search status=%d size=%dB", sRes.status, sBody.length);

    if (!sRes.ok) {
      return NextResponse.json(
        { error: "Error from foods.search" },
        { status: 500 },
      );
    }

    const data      = JSON.parse(sBody);
    const rawItems  = data?.foods?.food;
    const foodItems: FoodItem[] = Array.isArray(rawItems)
      ? rawItems
      : rawItems
        ? [rawItems]
        : [];

    console.log("📊  foods returned=%d", foodItems.length);

    if (!foodItems.length) {
      return NextResponse.json({ error: "No results found" }, { status: 404 });
    }

    /* ---------------- details for top 3 ---------------- */
    const detailed = await Promise.all(
      foodItems.slice(0, 3).map(async (item) => {
        try {
          const d = await fetchFoodDetails(item.food_id, token);

          const s = Array.isArray(d.servings?.serving)
            ? d.servings!.serving![0]
            : d.servings?.serving;

          const g =
            num(s?.serving_weight_grams) ||
            num(s?.metric_serving_amount) ||
            100;

          const result = {
            id: item.food_id,
            name: d.food_name ?? "Unknown",
            calories: per100g(s?.calories, g),
            protein: per100g(s?.protein, g),
            carbs: per100g(s?.carbohydrate, g),
            fat: per100g(s?.fat, g),
            sugar: per100g(s?.sugar, g),
          };

          console.log("✅  built %o", result);
          return result;
        } catch (err) {
          console.error("❌  detail failed for %s – %o", item.food_id, err);
          return null;
        }
      }),
    );

    const cleaned = detailed.filter(Boolean);
    console.log("🎯  returning %d items", cleaned.length);
    console.timeEnd("⏱️  overall");

    return NextResponse.json(cleaned, { status: 200 });
  } catch (err) {
    console.error("🔥  route failed –", err);
    return NextResponse.json({ error: err }, { status: 500 });
  }
}
