// File: app/api/booking/[id]/route.ts
import { bookingController } from "@/controllers/bookingController";
import { NextResponse } from "next/server";

// Handler untuk Update (PATCH)
// Menangani request ke /api/booking/:id
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // Fix untuk Next.js 15+: params harus Promise
) {
  try {
    const { id } = await params; // Wajib di-await
    return bookingController.updateStatus(request, id);
  } catch (error: any) {
    return NextResponse.json({ error: "Gagal memproses ID" }, { status: 400 });
  }
}

// Handler untuk Delete (DELETE)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    return bookingController.deleteBooking(id);
  } catch (error: any) {
    return NextResponse.json({ error: "Gagal memproses ID" }, { status: 400 });
  }
}