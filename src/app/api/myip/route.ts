import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch("https://api64.ipify.org?format=json");
    const data = await response.json();
    return NextResponse.json({ ip: data.ip });
  } catch (error) {
    console.log("error:", error)
    return NextResponse.json({ error: "Could not retrieve IP" }, { status: 500 });
  }
}
