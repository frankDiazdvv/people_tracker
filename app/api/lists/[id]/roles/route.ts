import { NextResponse } from "next/server";
import { sql } from "@/lib/db";


//GET /api/lists/:id/roles

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const roles = await sql`
      SELECT id, name
      FROM list_roles
      WHERE list_id = ${params.id}
      ORDER BY name;
    `;

    return NextResponse.json(roles);
  } catch (error) {
    console.error("Error fetching roles:", error);
    return NextResponse.json({ error: "Failed to fetch roles" }, { status: 500 });
  }
}

//POST /api/lists/:id/roles

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const { name } = body;

  const role = await sql`
    INSERT INTO list_roles (list_id, name)
    VALUES (${params.id}, ${name})
    RETURNING id, name;
  `;

  return NextResponse.json(role[0]);
}