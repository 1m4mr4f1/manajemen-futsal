// File: services/userService.ts
import prisma from "@/lib/prisma";

export const userService = {
  async getAllUsers() {
    return await prisma.user.findMany({
      orderBy: { created_at: 'desc' }
    });
  },

  async getUserByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email }
    });
  },

  // Update: Tambahkan username dan password di sini
  async createUser(data: { name: string; email: string; username: string; password: string; role?: "customer" | "admin" }) {
    return await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        username: data.username, // Wajib diisi
        password: data.password, // Wajib diisi
        role: data.role || "customer"
      }
    });
  }
};