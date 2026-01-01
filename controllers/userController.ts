// File: controllers/userController.ts
import { NextResponse } from "next/server";
import { userService } from "@/services/userService";
import bcrypt from "bcryptjs";

export const userController = {
  // Fungsi ini yang hilang dan menyebabkan error
  async getUsers() {
    try {
      const users = await userService.getAllUsers();
      return NextResponse.json(users);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  },

  async createUser(request: Request) {
    try {
      const body = await request.json();
      const { name, email, username, password, role } = body;

      if (!username || !password || !email) {
        return NextResponse.json({ error: "Username, Password, dan Email wajib diisi" }, { status: 400 });
      }

      // Enkripsi password sebelum disimpan
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await userService.createUser({ 
        name, 
        email, 
        username, 
        password: hashedPassword, 
        role 
      });

      return NextResponse.json(newUser, { status: 201 });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
};