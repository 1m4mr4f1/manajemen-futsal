import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    // 1. Cek apakah admin sudah ada agar tidak duplikat
    const existing = await prisma.user.findUnique({
      where: { username: "admin1" }
    });

    if (existing) {
      return NextResponse.json({ message: "Admin sudah ada di database!" });
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash("profutsal123", 10);
    
    // 3. Masukkan data ke Neon
    const user = await prisma.user.create({
      data: {
        username: "admin1",
        password: hashedPassword,
        email: "admin@futsal.com",
        name: "Super Admin",
        role: "admin",
      },
    });

    return NextResponse.json({ 
      status: "SUKSES!",
      message: "Data admin1 berhasil masuk ke Neon",
      data_user: user.username 
    });
  } catch (error: any) {
    console.error("Gagal Seed:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}