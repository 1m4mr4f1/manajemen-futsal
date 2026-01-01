// File: controllers/fieldController.ts
import { NextResponse } from "next/server";
import { fieldService } from "@/services/fieldService";

export const fieldController = {
  // Handler untuk GET
  async getFields() {
    try {
      const fields = await fieldService.getAllFields();
      return NextResponse.json(fields);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  },

  // Handler untuk POST
  async createField(request: Request) {
    try {
      const body = await request.json();
      
      // Validasi sederhana atau transformasi data dilakukan di sini
      const fieldData = {
        name: body.name,
        type: body.type,
        price_per_hour: parseInt(body.price_per_hour)
      };

      const newField = await fieldService.createField(fieldData);
      return NextResponse.json(newField, { status: 201 });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
};