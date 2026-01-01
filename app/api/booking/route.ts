// File: app/api/booking/route.ts
import { bookingController } from "@/controllers/bookingController";

export async function GET() {
  return bookingController.getBookings();
}

export async function POST(req: Request) {
  return bookingController.createBooking(req);
}