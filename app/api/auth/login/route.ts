// File: app/api/auth/login/route.ts
import { authController } from "@/controllers/authController";

export async function POST(req: Request) {
  return authController.login(req);
}