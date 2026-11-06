CREATE TABLE IF NOT EXISTS "WhatsAppSettings" (
  "id" UUID NOT NULL,
  "companyId" UUID NOT NULL,
  "accessTokenEncrypted" TEXT NOT NULL,
  "phoneNumberId" TEXT NOT NULL,
  "businessAccountId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "WhatsAppSettings_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "WhatsAppSettings_companyId_key" UNIQUE ("companyId"),
  CONSTRAINT "WhatsAppSettings_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
