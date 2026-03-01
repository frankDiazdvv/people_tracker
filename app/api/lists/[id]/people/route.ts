import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

// POST /api/lists/[id]/people | Attach a person to a list
export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const { person_id } = body;

    if (!person_id) {
      return NextResponse.json(
        { error: "person_id required" },
        { status: 400 }
      );
    }

    await sql`
      INSERT INTO list_people (list_id, person_id)
      VALUES (${id}, ${person_id})
      ON CONFLICT DO NOTHING;
    `;

    return NextResponse.json({ success: true });

  } catch (error) {
    return NextResponse.json(
      { error: "Failed to attach person to list" },
      { status: 500 }
    );
  }
}