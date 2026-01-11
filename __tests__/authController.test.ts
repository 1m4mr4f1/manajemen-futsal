// File: __tests__/authController.test.ts
import { authController } from "@/controllers/authController";
import { prismaMock } from "@/lib/prismaMock";
import { authService } from "@/services/authService";
import { NextResponse } from "next/server";

// Mock authService agar kita tidak perlu hashing password beneran
jest.mock("@/services/authService");

describe("Auth Controller - Throttling System", () => {
  
  // Reset semua mock sebelum setiap test case jalan
  beforeEach(() => {
    jest.clearAllMocks();
  });

// Helper untuk membuat request palsu
  const createRequest = (body: any) => new Request("http://localhost/api/auth/login", {
    method: "POST",
    // Pastikan ini JSON.stringify, agar MockRequest.json() kita bisa mem-parsingnya kembali
    body: JSON.stringify(body) 
  });

  // TEST CASE 1: SKENARIO TERKUNCI
  it("Harus menolak login (429) jika akun sedang terkunci", async () => {
    // Ceritanya: Di database, user ini punya 'locked_until' 5 menit ke depan
    const futureTime = new Date();
    futureTime.setMinutes(futureTime.getMinutes() + 5);

    const lockedUser = {
      id: "user-123",
      username: "admin",
      locked_until: futureTime, 
    };

    // Saat controller minta data user ke Prisma, kasih data palsu di atas
    prismaMock.user.findUnique.mockResolvedValue(lockedUser as any);

    // Jalankan Controller
    const req = createRequest({ username: "admin", password: "password_apapun" });
    const res = await authController.login(req);
    const json = await res.json();

    // HARAPAN (EXPECTATION):
    // 1. Prisma update TIDAK BOLEH dipanggil (karena user ditolak di pintu depan)
    expect(prismaMock.user.update).not.toHaveBeenCalled();
    // 2. Status harus 429
    expect(res.status).toBe(429);
    // 3. Pesan error harus mengandung kata kunci
    expect(json.error).toContain("Akun terkunci sementara");
  });

  // TEST CASE 2: SKENARIO GAGAL KE-3 KALI
  it("Harus mengunci akun (429) jika gagal login ke-3 kalinya", async () => {
    // Ceritanya: User sudah gagal 2 kali sebelumnya
    const mockUser = {
      id: "user-123",
      username: "admin",
      failed_login_attempts: 2, 
      locked_until: null,
    };

    prismaMock.user.findUnique.mockResolvedValue(mockUser as any);
    
    // Auth service bilang password salah (return null)
    (authService.validateUser as jest.Mock).mockResolvedValue(null);

    // Jalankan Controller
    const req = createRequest({ username: "admin", password: "salah" });
    const res = await authController.login(req);
    const json = await res.json();

    // HARAPAN:
    // Status jadi 429 (bukan 401 lagi, karena ini kegagalan ke-3)
    expect(res.status).toBe(429);
    
    // Database harus di-update: attempts jadi 3, dan locked_until diisi tanggal
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: "user-123" },
      data: expect.objectContaining({
        failed_login_attempts: 3,
        locked_until: expect.any(Date) 
      })
    });
  });

  // TEST CASE 3: LOGIN SUKSES = RESET
  it("Harus me-reset counter ke 0 jika login berhasil", async () => {
    const mockUser = {
      id: "user-123",
      username: "admin",
      failed_login_attempts: 2, // Pernah gagal
      locked_until: null,
      name: "Admin"
    };

    prismaMock.user.findUnique.mockResolvedValue(mockUser as any);
    // Login sukses (password benar)
    (authService.validateUser as jest.Mock).mockResolvedValue(mockUser);

    const req = createRequest({ username: "admin", password: "benar" });
    const res = await authController.login(req);

    // HARAPAN:
    expect(res.status).toBe(200);
    // Prisma harus dipanggil untuk reset data
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: "user-123" },
      data: { failed_login_attempts: 0, locked_until: null }
    });
  });
});