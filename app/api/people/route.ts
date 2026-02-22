import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

// GET /api/people | Fetch all people from the database
// export async function GET() {
//   try {
//     const people = await sql`
//       SELECT * FROM people
//       ORDER BY id ASC
//     `;

//     return NextResponse.json(people);
//   } catch (error) {
//     return NextResponse.json({ error: "Failed to fetch people" }, { status: 500 });
//   }
// }

// POST /api/people | Add a new person to the database

// PUT /api/people/:id | Update a person in the database

// DELETE /api/people/:id | Delete a person from the database