import { fieldController } from "@/controllers/fieldController";

export async function GET() {
  return fieldController.getFields();
}

export async function POST(req: Request) {
  return fieldController.createField(req);
}