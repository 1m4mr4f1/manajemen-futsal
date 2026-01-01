// File: controllers/authController.ts
import { NextResponse } from "next/server";
import { authService } from "@/services/authService";

export const authController = {
  async login(request: Request) {
    try {
      const { username, password } = await request.json();
      
      // Memanggil logika validasi
      const user = await authService.validateUser(username, password);

      if (!user) {
        return NextResponse.json({ error: "Username atau Password salah!" }, { status: 401 });
      }

      // Membuat respon sukses
      const response = NextResponse.json({ 
        message: "Login Berhasil", 
        user: { name: user.name, role: user.role } 
      });

      // Menyimpan "auth_session" di cookie agar bisa dibaca middleware/proxy
      response.cookies.set("auth_session", user.id, { 
        httpOnly: true, 
        path: "/",
        maxAge: 60 * 60 * 24 // Berlaku 1 hari
      });
      
      return response;
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
};