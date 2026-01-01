// File: app/api/user/route.ts
import { userController } from "@/controllers/userController";

// Menggunakan getUsers() yang tadi dilaporkan tidak ada
export async function GET() {
  return userController.getUsers();
}

export async function POST(req: Request) {
  return userController.createUser(req);
}