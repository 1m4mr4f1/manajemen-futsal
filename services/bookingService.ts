// File: services/bookingService.ts
import prisma from "@/lib/prisma";

export const bookingService = {
  // 1. AMBIL SEMUA DATA
  async getAllBookings() {
    return await prisma.booking.findMany({
      include: {
        field: true, 
        user: true 
      },
      orderBy: { created_at: 'desc' }
    });
  },

  // 2. CEK KETERSEDIAAN JADWAL
  async isScheduleAvailable(field_id: string, start: Date, end: Date) {
    const conflict = await prisma.booking.findFirst({
      where: {
        field_id,
        status: { not: "cancelled" },
        AND: [
          { start_time: { lt: end } },
          { end_time: { gt: start } }
        ]
      },
    });
    return !conflict; 
  },

  // 3. BUAT BOOKING BARU (UPDATE: Support Guest & Nullable User)
  async createBooking(data: {
    user_id: string | null;     // Boleh null jika tamu
    guest_name?: string | null; // Optional
    guest_phone?: string | null;// Optional
    field_id: string;
    start_time: Date;
    end_time: Date;
    total_price: number;
  }) {
    return await prisma.booking.create({
      data: {
        user_id: data.user_id,      // Prisma otomatis handle jika null
        guest_name: data.guest_name,// Masukkan data tamu
        guest_phone: data.guest_phone,
        field_id: data.field_id,
        start_time: data.start_time,
        end_time: data.end_time,
        total_price: data.total_price,
        status: "pending"
      }
    });
  },

  // 4. STATISTIK DASHBOARD
  async getDashboardStats() {
    const [totalRevenue, totalBookings, totalFields, totalUsers] = await Promise.all([
      prisma.booking.aggregate({
        _sum: { total_price: true },
        where: { status: 'confirmed' }
      }),
      prisma.booking.count(),
      prisma.field.count(),
      prisma.user.count()
    ]);

    const recentBookings = await prisma.booking.findMany({
      take: 5,
      orderBy: { created_at: 'desc' },
      include: { field: true, user: true }
    });

    return {
      revenue: totalRevenue._sum.total_price || 0,
      bookings: totalBookings,
      fields: totalFields,
      users: totalUsers,
      recentBookings
    };
  },

  // 5. UPDATE STATUS
  async updateBookingStatus(id: string, status: string) {
    return await prisma.booking.update({
      where: { id },
      data: { status },
      include: { user: true, field: true }
    });
  },

  // 6. HAPUS BOOKING
  async deleteBooking(id: string) {
    return await prisma.booking.delete({
      where: { id }
    });
  }
};