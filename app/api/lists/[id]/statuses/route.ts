import { NextResponse } from "next/server";
import { sql } from "@/lib/db";


//GET /api/lists/:id/statuses

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const statuses = await sql`
      SELECT id, name
      FROM list_statuses
      WHERE list_id = ${params.id}
      ORDER BY name;
    `;

    return NextResponse.json(statuses);
  } catch (error) {
    console.error("Error fetching statuses:", error);
    return NextResponse.json({ error: "Failed to fetch statuses" }, { status: 500 });
  }
}


// POST /api/lists/:id/statuses

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const { name } = body;

  const status = await sql`
    INSERT INTO list_statuses (list_id, name)
    VALUES (${params.id}, ${name})
    RETURNING id, name;
  `;

  return NextResponse.json(status[0]);
}