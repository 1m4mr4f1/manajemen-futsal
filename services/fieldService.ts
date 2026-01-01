// File: services/fieldService.ts
import prisma from "@/lib/prisma";

export const fieldService = {
  // Mengambil semua data lapangan
  async getAllFields() {
    return await prisma.field.findMany({
      orderBy: { name: 'asc' }
    });
  },

  // Menambah lapangan baru
  async createField(data: { name: string; type: string; price_per_hour: number }) {
    return await prisma.field.create({
      data: {
        name: data.name,
        type: data.type,
        price_per_hour: data.price_per_hour
      }
    });
  },

  // Cari lapangan berdasarkan ID (berguna untuk booking nanti)
  async getFieldById(id: string) {
    return await prisma.field.findUnique({
      where: { id }
    });
  }
};