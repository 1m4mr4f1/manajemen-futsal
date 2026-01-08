import { fieldController } from "@/controllers/fieldController";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // Fix untuk Next.js 15+ params harus di-await
) {
  const { id } = await params;
  return fieldController.deleteField(id);
}