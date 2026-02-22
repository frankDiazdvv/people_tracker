import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

// DELETE /api/lists/[id] | Delete a list from the database
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    await sql`
      DELETE FROM lists
      WHERE id = ${id};
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete list" },
      { status: 500 }
    );
  }
}