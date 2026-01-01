// File: controllers/bookingController.ts
import { NextResponse } from "next/server";
import { bookingService } from "@/services/bookingService";
import { fieldService } from "@/services/fieldService";

export const bookingController = {
  async getBookings() {
    try {
      const bookings = await bookingService.getAllBookings();
      return NextResponse.json(bookings);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  },

  async createBooking(request: Request) {
    try {
      const body = await request.json();
      const { user_id, field_id, start_time, end_time } = body;

      const start = new Date(start_time);
      const end = new Date(end_time);

      // 1. Cek ketersediaan jadwal
      const available = await bookingService.isScheduleAvailable(field_id, start, end);
      if (!available) {
        return NextResponse.json({ error: "Jadwal sudah dipesan orang lain" }, { status: 400 });
      }

      // 2. Ambil data lapangan untuk hitung harga
      const field = await fieldService.getFieldById(field_id);
      if (!field) {
        return NextResponse.json({ error: "Lapangan tidak ditemukan" }, { status: 404 });
      }

      // 3. Hitung durasi jam
      const durationInMs = end.getTime() - start.getTime();
      const durationInHours = durationInMs / (1000 * 60 * 60);
      
      if (durationInHours <= 0) {
        return NextResponse.json({ error: "Durasi waktu tidak valid" }, { status: 400 });
      }

      const total_price = durationInHours * field.price_per_hour;

      // 4. Simpan booking
      const newBooking = await bookingService.createBooking({
        user_id,
        field_id,
        start_time: start,
        end_time: end,
        total_price
      });

      return NextResponse.json(newBooking, { status: 201 });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
};