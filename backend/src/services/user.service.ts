import { prisma } from "../config/database.js";
import { AppError } from "../middleware/error-handler.js";

export async function getPreferences(userId: string) {
  let prefs = await prisma.userPreferences.findUnique({ where: { userId } });
  if (!prefs) {
    prefs = await prisma.userPreferences.create({ data: { userId } });
  }
  return prefs;
}

export async function updatePreferences(userId: string, data: {
  interfaceLanguage?: string;
  defaultSourceLanguage?: string;
  defaultTargetLanguage?: string;
  defaultSummaryLength?: string;
  emailNotifications?: boolean;
  processingAlerts?: boolean;
}) {
  let prefs = await prisma.userPreferences.findUnique({ where: { userId } });
  if (!prefs) {
    prefs = await prisma.userPreferences.create({ data: { userId, ...data } });
  } else {
    prefs = await prisma.userPreferences.update({ where: { userId }, data });
  }
  return prefs;
}

export async function getOrganizationProfile(userId: string) {
  let profile = await prisma.organizationProfile.findUnique({ where: { userId } });
  if (!profile) {
    profile = await prisma.organizationProfile.create({ data: { userId } });
  }
  return profile;
}

export async function updateOrganizationProfile(userId: string, data: {
  organizationName?: string;
  department?: string;
  province?: string;
  district?: string;
  sector?: string;
  contactEmail?: string;
  contactPhone?: string;
}) {
  let profile = await prisma.organizationProfile.findUnique({ where: { userId } });
  if (!profile) {
    profile = await prisma.organizationProfile.create({ data: { userId, ...data } });
  } else {
    profile = await prisma.organizationProfile.update({ where: { userId }, data });
  }
  return profile;
}
