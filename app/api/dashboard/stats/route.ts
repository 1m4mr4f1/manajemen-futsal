// File: app/api/dashboard/stats/route.ts
import { dashboardController } from "@/controllers/dashboardController";

export async function GET() {
  return dashboardController.getStats();
}