import { prisma } from "../lib/prisma.js";
import { NotFoundError } from "../utils/errors.js";
import {
  parseDocumentLanguage,
  parsePlatformLanguage,
  parseSummaryLength,
  toApiDocumentLanguage,
  toApiPlatformLanguage,
} from "../utils/mappers.js";

export async function getPreferences(userId: number) {
  let prefs = await prisma.userPreferences.findUnique({ where: { userId } });
  if (!prefs) {
    prefs = await prisma.userPreferences.create({ data: { userId } });
  }
  return {
    interfaceLanguage: toApiPlatformLanguage(prefs.interfaceLanguage),
    defaultSummaryLength: prefs.defaultSummaryLength.toLowerCase(),
    defaultTargetLanguage: toApiDocumentLanguage(prefs.defaultTargetLanguage),
    emailNotifications: prefs.emailNotifications,
  };
}

export async function updatePreferences(
  userId: number,
  data: {
    interfaceLanguage?: string;
    defaultSummaryLength?: string;
    defaultTargetLanguage?: string;
    emailNotifications?: boolean;
  },
) {
  const prefs = await prisma.userPreferences.upsert({
    where: { userId },
    create: {
      userId,
      interfaceLanguage: data.interfaceLanguage ? parsePlatformLanguage(data.interfaceLanguage) : undefined,
      defaultSummaryLength: data.defaultSummaryLength ? parseSummaryLength(data.defaultSummaryLength) : undefined,
      defaultTargetLanguage: data.defaultTargetLanguage
        ? parseDocumentLanguage(data.defaultTargetLanguage)
        : undefined,
      emailNotifications: data.emailNotifications,
    },
    update: {
      interfaceLanguage: data.interfaceLanguage ? parsePlatformLanguage(data.interfaceLanguage) : undefined,
      defaultSummaryLength: data.defaultSummaryLength ? parseSummaryLength(data.defaultSummaryLength) : undefined,
      defaultTargetLanguage: data.defaultTargetLanguage
        ? parseDocumentLanguage(data.defaultTargetLanguage)
        : undefined,
      emailNotifications: data.emailNotifications,
    },
  });

  return {
    interfaceLanguage: toApiPlatformLanguage(prefs.interfaceLanguage),
    defaultSummaryLength: prefs.defaultSummaryLength.toLowerCase(),
    defaultTargetLanguage: toApiDocumentLanguage(prefs.defaultTargetLanguage),
    emailNotifications: prefs.emailNotifications,
  };
}

export async function getOrganization(userId: number) {
  let org = await prisma.organizationProfile.findUnique({ where: { userId } });
  if (!org) {
    org = await prisma.organizationProfile.create({ data: { userId } });
  }
  return org;
}

export async function updateOrganization(
  userId: number,
  data: { organizationName?: string; province?: string; contactEmail?: string },
) {
  return prisma.organizationProfile.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
  });
}

export async function getSystemSettings() {
  let settings = await prisma.systemSettings.findUnique({ where: { id: 1 } });
  if (!settings) {
    settings = await prisma.systemSettings.create({ data: { id: 1 } });
  }
  return {
    orgName: settings.orgName,
    defaultLanguage: toApiPlatformLanguage(settings.defaultLanguage),
    defaultOutputLanguage: toApiDocumentLanguage(settings.defaultOutputLanguage),
    passwordRequirements: settings.passwordRequirements.toLowerCase(),
    docProcessedAlerts: settings.docProcessedAlerts,
    validationAlerts: settings.validationAlerts,
    userRegistrationAlerts: settings.userRegistrationAlerts,
    updatedAt: settings.updatedAt,
  };
}

export async function updateSystemSettings(data: {
  orgName?: string;
  defaultLanguage?: string;
  defaultOutputLanguage?: string;
  passwordRequirements?: string;
  docProcessedAlerts?: boolean;
  validationAlerts?: boolean;
  userRegistrationAlerts?: boolean;
}) {
  const passwordMap = {
    standard: "STANDARD",
    strong: "STRONG",
    government: "GOVERNMENT",
  } as const;

  const settings = await prisma.systemSettings.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      orgName: data.orgName,
      defaultLanguage: data.defaultLanguage ? parsePlatformLanguage(data.defaultLanguage) : undefined,
      defaultOutputLanguage: data.defaultOutputLanguage
        ? parseDocumentLanguage(data.defaultOutputLanguage)
        : undefined,
      passwordRequirements: data.passwordRequirements
        ? passwordMap[data.passwordRequirements as keyof typeof passwordMap]
        : undefined,
      docProcessedAlerts: data.docProcessedAlerts,
      validationAlerts: data.validationAlerts,
      userRegistrationAlerts: data.userRegistrationAlerts,
    },
    update: {
      orgName: data.orgName,
      defaultLanguage: data.defaultLanguage ? parsePlatformLanguage(data.defaultLanguage) : undefined,
      defaultOutputLanguage: data.defaultOutputLanguage
        ? parseDocumentLanguage(data.defaultOutputLanguage)
        : undefined,
      passwordRequirements: data.passwordRequirements
        ? passwordMap[data.passwordRequirements as keyof typeof passwordMap]
        : undefined,
      docProcessedAlerts: data.docProcessedAlerts,
      validationAlerts: data.validationAlerts,
      userRegistrationAlerts: data.userRegistrationAlerts,
    },
  });

  if (!settings) throw new NotFoundError("System settings not found");

  return getSystemSettings();
}
