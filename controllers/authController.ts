// File: controllers/authController.ts
import { NextResponse } from "next/server";
import { authService } from "@/services/authService";
import prisma from "@/lib/prisma"; // Menggunakan instance dari lib/prisma.ts kamu

export const authController = {
  async login(request: Request) {
    try {
      const { username, password } = await request.json();

      // [1] Cek User untuk status Lock (Tanpa validasi password dulu)
      const targetUser = await prisma.user.findUnique({
        where: { username }
      });

      // Jika user tidak ditemukan, return error umum (Security best practice)
      if (!targetUser) {
        return NextResponse.json({ error: "Username atau Password salah!" }, { status: 401 });
      }

      // [2] Cek apakah akun sedang TERKUNCI?
      if (targetUser.locked_until && new Date(targetUser.locked_until) > new Date()) {
        const timeLeft = Math.ceil((new Date(targetUser.locked_until).getTime() - Date.now()) / 1000);
        return NextResponse.json({ 
          error: `Akun terkunci sementara. Coba lagi dalam ${timeLeft} detik.` 
        }, { status: 429 }); // 429 = Too Many Requests
      }

      // [3] Validasi Password
      const user = await authService.validateUser(username, password);

      // --- SKENARIO GAGAL LOGIN ---
      if (!user) {
        // Tambah counter gagal
        const newAttempts = (targetUser.failed_login_attempts || 0) + 1;
        let updateData: any = { failed_login_attempts: newAttempts };

        // Jika sudah gagal 3 kali, kunci akun selama 1 menit (60000 ms)
        if (newAttempts >= 3) {
          updateData.locked_until = new Date(Date.now() + 60 * 1000);
        }

        // Update ke database
        await prisma.user.update({
          where: { id: targetUser.id },
          data: updateData
        });

        // Berikan pesan error sesuai sisa kesempatan
        const sisa = 3 - newAttempts;
        if (sisa <= 0) {
          return NextResponse.json({ 
            error: "Terlalu banyak percobaan gagal. Akun dikunci selama 1 menit." 
          }, { status: 429 });
        } else {
          return NextResponse.json({ 
            error: `Password salah! Sisa kesempatan: ${sisa}` 
          }, { status: 401 });
        }
      }

      // --- SKENARIO SUKSES LOGIN ---
      
      // Reset counter dan lock jika berhasil login
      if ((targetUser.failed_login_attempts || 0) > 0 || targetUser.locked_until) {
        await prisma.user.update({
          where: { id: targetUser.id },
          data: { 
            failed_login_attempts: 0, 
            locked_until: null 
          }
        });
      }

      // Buat response sukses
      const response = NextResponse.json({ 
        message: "Login Berhasil", 
        user: { name: user.name, role: user.role } 
      });

      // Set Cookie
      response.cookies.set("auth_session", user.id, { 
        httpOnly: true, 
        path: "/",
        maxAge: 60 * 60 * 24 
      });
      
      return response;

    } catch (error: any) {
      console.error("Login Error:", error);
      return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
  }
};