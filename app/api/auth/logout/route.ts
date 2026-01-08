// File: app/api/auth/logout/route.ts
import { NextResponse } from "next/server";

export async function POST() {
  // 1. Buat response JSON biasa
  const response = NextResponse.json({ message: "Logout Berhasil" });

  // 2. Hapus cookie 'auth_session' dengan cara menimpanya (expired immediately)
  response.cookies.delete("auth_session");

  return response;
}