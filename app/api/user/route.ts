// File: app/api/user/route.ts
import { userController } from "@/controllers/userController";

export async function GET() {
  return userController.getUsers();
}

export async function POST(req: Request) {
  return userController.createUser(req);
}