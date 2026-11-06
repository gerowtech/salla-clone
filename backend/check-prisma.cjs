const { PrismaClient } = require("@prisma/client");

const db = new PrismaClient();

console.log("Available Prisma models:");

console.log(
  Object.keys(db)
    .filter(key => !key.startsWith("$"))
    .sort()
);

db.$disconnect();
