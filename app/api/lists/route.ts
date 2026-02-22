import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

// GET /api/lists | Fetch all lists from the database
export async function GET() {
  try {
    const people = await sql`
      SELECT 
        l.id,
        l.name,
        COALESCE(
            json_agg(
            json_build_object(
                'id', p.id,
                'name', p.name,
                'role', p.role,
                'status', p.status
            )
            ) FILTER (WHERE p.id IS NOT NULL),
            '[]'
        ) AS people
        FROM lists l
        LEFT JOIN people p ON p.list_id = l.id
        GROUP BY l.id
        ORDER BY l.id;
    `;

    return NextResponse.json(people);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch people" }, { status: 500 });
  }
}


// POST /api/lists | Add a new list to the database
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const newList = await sql`
      INSERT INTO lists (name)
      VALUES (${name})
      RETURNING *;
    `;

    return NextResponse.json(newList[0], { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create list" },
      { status: 500 }
    );
  }
}