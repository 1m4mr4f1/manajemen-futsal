import { defineConfig } from '@prisma/config';
import * as dotenv from 'dotenv';

// Memaksa load .env agar DATABASE_URL tersedia bagi CLI
dotenv.config();

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL,
  },
});