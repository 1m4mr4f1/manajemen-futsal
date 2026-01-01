// File: services/bookingService.ts
import prisma from "@/lib/prisma";

export const bookingService = {
  // Ambil semua riwayat booking
  async getAllBookings() {
    return await prisma.booking.findMany({
      include: {
        field: true, // Sertakan info detail lapangan
        user: true   // Sertakan info detail penyewa
      },
      orderBy: { start_time: 'desc' }
    });
  },

  // Cek apakah jadwal tersedia (logika anti-bentrok)
  async isScheduleAvailable(field_id: string, start: Date, end: Date) {
    const conflict = await prisma.booking.findFirst({
      where: {
        field_id,
        status: { not: "cancelled" }, // Abaikan jika sudah dibatalkan
        OR: [
          {
            start_time: { lt: end },
            end_time: { gt: start },
          },
        ],
      },
    });
    return !conflict;
  },

  // Simpan booking baru
  async createBooking(data: {
    user_id: string;
    field_id: string;
    start_time: Date;
    end_time: Date;
    total_price: number;
  }) {
    return await prisma.booking.create({
      data: {
        user_id: data.user_id,
        field_id: data.field_id,
        start_time: data.start_time,
        end_time: data.end_time,
        total_price: data.total_price,
        status: "pending"
      }
    });
  },
  async getDashboardStats() {
    const [totalRevenue, totalBookings, totalFields, totalUsers] = await Promise.all([
      prisma.booking.aggregate({
        _sum: { total_price: true }
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
  }
  
};