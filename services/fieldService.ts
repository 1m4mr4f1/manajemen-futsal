// File: services/fieldService.ts
import prisma from "@/lib/prisma";

export const fieldService = {
  // Ambil semua data lapangan
  async getAllFields() {
    return await prisma.field.findMany({
      orderBy: { name: 'asc' } // Urutkan berdasarkan nama
    });
  },

  // Tambah lapangan baru
  async createField(data: { name: string; type: string; price_per_hour: number }) {
    return await prisma.field.create({
      data: {
        name: data.name,
        type: data.type,
        price_per_hour: data.price_per_hour,
      },
    });
  },

  // Hapus lapangan
  async deleteField(id: string) {
    return await prisma.field.delete({
      where: { id },
    });
  }
};