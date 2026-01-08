// File: controllers/fieldController.ts
import { NextResponse } from "next/server";
import { fieldService } from "@/services/fieldService";

export const fieldController = {
  // GET: Ambil semua data
  async getFields() {
    try {
      const fields = await fieldService.getAllFields();
      return NextResponse.json(fields);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  },

  // POST: Tambah data
  async createField(request: Request) {
    try {
      const body = await request.json();
      const { name, type, price_per_hour } = body;

      // Validasi sederhana
      if (!name || !type || !price_per_hour) {
        return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
      }

      const newField = await fieldService.createField({
        name,
        type,
        price_per_hour: Number(price_per_hour) // Pastikan jadi number
      });

      return NextResponse.json(newField, { status: 201 });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  },

  // DELETE: Hapus data
  async deleteField(id: string) {
    try {
      await fieldService.deleteField(id);
      return NextResponse.json({ message: "Lapangan berhasil dihapus" });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
};