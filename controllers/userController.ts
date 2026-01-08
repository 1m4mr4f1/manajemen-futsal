// File: controllers/userController.ts
import { NextResponse } from "next/server";
import { userService } from "@/services/userService";
import bcrypt from "bcryptjs";

export const userController = {
  // 1. GET: Ambil daftar user
  async getUsers() {
    try {
      const users = await userService.getAllUsers();
      return NextResponse.json(users);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  },

  // 2. POST: Tambah user baru
  async createUser(request: Request) {
    try {
      const body = await request.json();
      const { name, email, username, password, role } = body;

      // Validasi Input
      if (!name || !email || !username || !password) {
        return NextResponse.json({ error: "Semua data (Nama, Email, Username, Password) wajib diisi!" }, { status: 400 });
      }

      // Cek apakah email sudah terdaftar
      const existingUser = await userService.getUserByEmail(email);
      if (existingUser) {
        return NextResponse.json({ error: "Email sudah digunakan user lain." }, { status: 409 });
      }

      // Enkripsi password sebelum disimpan
      const hashedPassword = await bcrypt.hash(password, 10);

      // Simpan ke database via service
      const newUser = await userService.createUser({ 
        name, 
        email, 
        username, 
        password: hashedPassword, 
        role: role || "customer" // Default ke customer jika kosong
      });

      return NextResponse.json({
        message: "User berhasil dibuat",
        data: newUser
      }, { status: 201 });

    } catch (error: any) {
      // Menangani error unique constraint dari Prisma (misal username kembar)
      if (error.code === 'P2002') {
        return NextResponse.json({ error: "Username atau Email sudah terdaftar." }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
};