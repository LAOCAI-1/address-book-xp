// server/src/db.js
import "dotenv/config";
import prismaPkg from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const { PrismaClient } = prismaPkg;

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  port: Number(process.env.DATABASE_PORT ?? 3306),
  connectionLimit: 5,
});

export const prisma = new PrismaClient({ adapter });
