// File: jest.setup.js
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// 1. Setup TextEncoder (Wajib untuk Prisma Client)
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// 2. Mock Class Headers
class MockHeaders {
  constructor(init) {
    this.map = new Map(Object.entries(init || {}));
  }
  get(key) { return this.map.get(key.toLowerCase()) || null; }
  set(key, value) { this.map.set(key.toLowerCase(), value); }
}

// 3. Mock Class Request
class MockRequest {
  constructor(url, init) {
    this.url = url;
    this.method = init ? init.method : 'GET';
    this.body = init ? init.body : null;
    this.headers = new MockHeaders(init ? init.headers : {});
  }

  async json() {
    // Jika body adalah string, parse. Jika object, kembalikan langsung.
    if (!this.body) return {};
    if (typeof this.body === 'string') return JSON.parse(this.body);
    return this.body;
  }
}

// 4. Mock Class Response
class MockResponse {
  constructor(body, init) {
    this.body = body;
    this.status = init ? init.status : 200;
    this.headers = new MockHeaders(init ? init.headers : {});
  }

  async json() {
    if (!this.body) return {};
    if (typeof this.body === 'string') return JSON.parse(this.body);
    return this.body;
  }

  // PENTING: Static method json() yang dicari Next.js
  static json(data, init) {
    // Simpan data sebagai JSON string agar mirip perilaku asli
    return new MockResponse(JSON.stringify(data), init);
  }
}

// 5. Assign ke Global
global.Headers = MockHeaders;
global.Request = MockRequest;
global.Response = MockResponse;