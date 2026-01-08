// File: services/userService.ts
import prisma from "@/lib/prisma";

export const userService = {
  // Ambil semua user
  async getAllUsers() {
    return await prisma.user.findMany({
      orderBy: { created_at: 'desc' },
      // Opsional: Kita bisa memilih field apa saja yang dikembalikan (agar password tidak ikut terkirim)
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        created_at: true,
        // Password tidak kita select demi keamanan
      }
    });
  },

  // Cari user berdasarkan email (untuk validasi duplikat)
  async getUserByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email }
    });
  },

  // Buat user baru
  async createUser(data: { name: string; email: string; username: string; password: string; role?: "customer" | "admin" }) {
    return await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        username: data.username,
        password: data.password,
        role: data.role || "customer"
      }
    });
  }
};