// File: services/authService.ts
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authService = {
  async validateUser(username: string, pass: string) {
    // Mencari user berdasarkan username
    const user = await prisma.user.findUnique({ 
      where: { username } 
    });

    if (!user) return null;

    // Bandingkan password input dengan password di database
    const isMatch = await bcrypt.compare(pass, user.password);
    
    return isMatch ? user : null;
  }
};