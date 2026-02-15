import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    const people = await sql`
      SELECT * FROM people
      ORDER BY id ASC
    `;

    return NextResponse.json(people);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch people" }, { status: 500 });
  }
}
