import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get("month") || new Date().getMonth().toString());
    const year = parseInt(searchParams.get("year") || new Date().getFullYear().toString());

    // Hitung tanggal awal dan akhir bulan
    // Ingat: di JS bulan mulai dari 0 (Januari = 0)
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59);

    const bookings = await prisma.booking.findMany({
      where: {
        status: 'confirmed', // Hanya ambil yang sudah pasti/lunas
        start_time: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        field: true,
        user: true
      },
      orderBy: {
        start_time: 'asc'
      }
    });

    return NextResponse.json(bookings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}