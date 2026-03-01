import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

// GET /api/people
export async function GET() {
  try {
    const people = await sql`
      SELECT * FROM people
      ORDER BY id ASC
    `;

    return NextResponse.json(people);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch people" },
      { status: 500 }
    );
  }
}

// POST /api/people
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, role, status, email, phone } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    // Create global person
    const [person] = await sql`
      INSERT INTO people (name, role, status)
      VALUES (${name}, ${role || ""}, ${status || "Active"})
      RETURNING *;
    `;

    // Optional contact
    if (email || phone) {
      await sql`
        INSERT INTO contacts (email, phone, person_id)
        VALUES (${email || ""}, ${phone || ""}, ${person.id});
      `;
    }

    return NextResponse.json(person, { status: 201 });

  } catch {
    return NextResponse.json(
      { error: "Failed to create person" },
      { status: 500 }
    );
  }
}
// PUT /api/people/:id | Update a person in the database

// DELETE /api/people/:id | Delete a person from the database