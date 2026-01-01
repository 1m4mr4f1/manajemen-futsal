// File: proxy.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const session = request.cookies.get('auth_session');
  const { pathname } = request.nextUrl;

  // Proteksi halaman dashboard
  if (pathname.startsWith('/dashboard')) {
    if (!session) {
      // Jika tidak ada session, lempar kembali ke login
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

// Konfigurasi agar proxy hanya berjalan pada rute tertentu (opsional tapi disarankan)
export const config = {
  matcher: ['/dashboard/:path*', '/api/user/:path*'],
};