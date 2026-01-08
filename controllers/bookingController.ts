// File: controllers/bookingController.ts
import { NextResponse } from "next/server";
import { bookingService } from "@/services/bookingService";
import { fieldService } from "@/services/fieldService";

export const bookingController = {
  // GET: Ambil semua booking
  async getBookings() {
    try {
      const bookings = await bookingService.getAllBookings();
      return NextResponse.json(bookings);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  },

  // POST: Buat Booking Baru
  async createBooking(request: Request) {
    try {
      const body = await request.json();
      const { 
        user_id, 
        guest_name, 
        guest_phone, 
        field_id, 
        date, 
        start_hour, 
        duration 
      } = body;

      // 1. Validasi Input Kelengkapan
      if (!field_id || !date || !start_hour || !duration) {
         return NextResponse.json({ error: "Data jadwal tidak lengkap" }, { status: 400 });
      }
      
      if (!user_id && !guest_name) {
         return NextResponse.json({ error: "Harus memilih Member atau isi Nama Tamu" }, { status: 400 });
      }

      // --- VALIDASI TAMBAHAN: TIDAK BISA BOOKING MASA LALU ---
      // Cek apakah tanggal yang dipilih < hari ini (00:00)
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset jam jadi 00:00 hari ini
      
      const selectedDate = new Date(date);
      // Fix: Terkadang new Date('YYYY-MM-DD') dianggap jam 07:00 WIB, jadi aman dibandingkan
      
      if (selectedDate < today) {
        return NextResponse.json({ error: "Tidak bisa membuat booking untuk tanggal yang sudah lewat!" }, { status: 400 });
      }
      // ---------------------------------------------------------

      // 2. Validasi Jam Operasional (08:00 - 22:00)
      const startHourInt = parseInt(start_hour);
      const durationInt = parseInt(duration);
      const endHourInt = startHourInt + durationInt;

      if (startHourInt < 8 || endHourInt > 22) {
         return NextResponse.json({ error: "Booking hanya tersedia pukul 08:00 - 22:00" }, { status: 400 });
      }

      // 3. Setup Tanggal
      const startTimeStr = `${date}T${start_hour.toString().padStart(2, '0')}:00:00`;
      const start = new Date(startTimeStr);
      
      const endTimeStr = `${date}T${endHourInt.toString().padStart(2, '0')}:00:00`;
      const end = new Date(endTimeStr);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return NextResponse.json({ error: "Format tanggal atau jam salah" }, { status: 400 });
      }

      // 4. Cek Bentrok Jadwal
      const available = await bookingService.isScheduleAvailable(field_id, start, end);
      if (!available) {
        return NextResponse.json({ error: "Jadwal tersebut sudah terisi! Silakan pilih waktu lain." }, { status: 409 });
      }

      // 5. Hitung Harga
      const fields = await fieldService.getAllFields();
      const selectedField = fields.find(f => f.id === field_id);
      
      if (!selectedField) {
        return NextResponse.json({ error: "Lapangan tidak ditemukan" }, { status: 404 });
      }

      const total_price = durationInt * selectedField.price_per_hour;

      // 6. Simpan
      const newBooking = await bookingService.createBooking({
        user_id: user_id || null, 
        guest_name: user_id ? null : guest_name,
        guest_phone: user_id ? null : guest_phone,
        field_id,
        start_time: start,
        end_time: end,
        total_price
      });

      // 7. Auto Confirm
      await bookingService.updateBookingStatus(newBooking.id, 'confirmed');

      return NextResponse.json(newBooking, { status: 201 });

    } catch (error: any) {
      console.error("Create Booking Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  },

  // ... (Sisa fungsi updateStatus dan deleteBooking biarkan sama)
  async updateStatus(request: Request, id: string) {
    try {
      const body = await request.json();
      const { status } = body;
      if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
        return NextResponse.json({ error: "Status tidak valid" }, { status: 400 });
      }
      const updated = await bookingService.updateBookingStatus(id, status);
      return NextResponse.json(updated);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  },

  async deleteBooking(id: string) {
    try {
      await bookingService.deleteBooking(id);
      return NextResponse.json({ message: "Booking berhasil dihapus" });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
};