import { prisma } from "../config/database.js";

export async function getPreferences(userId: string) {
  let prefs = await prisma.userPreferences.findUnique({ where: { userId } });
  if (!prefs) {
    prefs = await prisma.userPreferences.create({ data: { userId } });
  }
  return {
    ...prefs,
    emailNotifications: prefs.inAppNotifications,
  };
}

export async function updatePreferences(userId: string, data: {
  interfaceLanguage?: string;
  defaultSourceLanguage?: string;
  defaultTargetLanguage?: string;
  defaultSummaryLength?: string;
  emailNotifications?: boolean;
  processingAlerts?: boolean;
}) {
  const prismaData: any = {
    interfaceLanguage: data.interfaceLanguage,
    defaultSourceLanguage: data.defaultSourceLanguage,
    defaultTargetLanguage: data.defaultTargetLanguage,
    defaultSummaryLength: data.defaultSummaryLength,
    inAppNotifications: data.emailNotifications,
    processingAlerts: data.processingAlerts,
  };

  // remove undefined fields
  Object.keys(prismaData).forEach(
    (key) => prismaData[key] === undefined && delete prismaData[key]
  );

  let prefs = await prisma.userPreferences.findUnique({ where: { userId } });
  if (!prefs) {
    prefs = await prisma.userPreferences.create({ data: { userId, ...prismaData } });
  } else {
    prefs = await prisma.userPreferences.update({ where: { userId }, data: prismaData });
  }

  return {
    ...prefs,
    emailNotifications: prefs.inAppNotifications,
  };
}

export async function getOrganizationProfile(userId: string) {
  let settings = await prisma.systemSettings.findFirst();
  if (!settings) {
    settings = await prisma.systemSettings.create({ data: {} });
  }
  return {
    organizationName: settings.organizationName,
    province: settings.province,
    contactEmail: settings.contactEmail,
    department: "Document Processing",
    district: "Kigali City",
    sector: "Nyarugenge",
    contactPhone: "+250 788 123 456",
  };
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
  let settings = await prisma.systemSettings.findFirst();
  if (!settings) {
    settings = await prisma.systemSettings.create({ data: {} });
  }

  const prismaData: any = {};
  if (data.organizationName !== undefined) prismaData.organizationName = data.organizationName;
  if (data.province !== undefined) prismaData.province = data.province;
  if (data.contactEmail !== undefined) prismaData.contactEmail = data.contactEmail;

  if (Object.keys(prismaData).length > 0) {
    settings = await prisma.systemSettings.update({
      where: { id: settings.id },
      data: prismaData,
    });
  }

  return {
    organizationName: settings.organizationName,
    province: settings.province,
    contactEmail: settings.contactEmail,
    department: data.department || "Document Processing",
    district: data.district || "Kigali City",
    sector: data.sector || "Nyarugenge",
    contactPhone: data.contactPhone || "+250 788 123 456",
  };
}
