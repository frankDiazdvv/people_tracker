import { NextResponse } from "next/server";
import { sql } from "@/lib/db";


//PATCH /api/lists/:listId/people/:personId/status

export async function PATCH(
  req: Request,
  { params }: { params: { listId: string; personId: string } }
) {
  try {
    const body = await req.json();
    const { status_id } = body;

    await sql`
      UPDATE list_people
      SET status_id = ${status_id}
      WHERE list_id = ${params.listId}
      AND person_id = ${params.personId};
    `;

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Error updating status:", error);
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}