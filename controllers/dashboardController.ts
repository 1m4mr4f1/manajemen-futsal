// File: controllers/dashboardController.ts
import { NextResponse } from "next/server";
import { bookingService } from "@/services/bookingService";

export const dashboardController = {
  async getStats() {
    try {
      const stats = await bookingService.getDashboardStats();
      return NextResponse.json(stats);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
};