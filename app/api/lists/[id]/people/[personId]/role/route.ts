import { NextResponse } from "next/server";
import { sql } from "@/lib/db";


// PATCH /api/lists/:listId/people/:personId/role

export async function PATCH(
  req: Request,
  { params }: { params: { listId: string; personId: string } }
) {
  try {
    const body = await req.json();
    const { role_id } = body;

    await sql`
      UPDATE list_people
      SET role_id = ${role_id}
      WHERE list_id = ${params.listId}
      AND person_id = ${params.personId};
    `;

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Error updating role:", error);
    return NextResponse.json({ error: "Failed to update role" }, { status: 500 });
  }
}