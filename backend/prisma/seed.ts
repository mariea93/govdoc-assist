import { PrismaClient, Role, UserStatus, DocumentAction, DocumentStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean existing data
  await prisma.activityLog.deleteMany();
  await prisma.validationRecord.deleteMany();
  await prisma.processingResult.deleteMany();
  await prisma.document.deleteMany();
  await prisma.report.deleteMany();
  await prisma.userPreferences.deleteMany();
  await prisma.organizationProfile.deleteMany();
  await prisma.systemSettings.deleteMany();
  await prisma.user.deleteMany();

  console.log("Cleared existing data");

  // Create users matching frontend mock accounts
  const passwordHash = await bcrypt.hash("Password123", 12);
  const adminHash = await bcrypt.hash("admin123", 12);
  const userHash = await bcrypt.hash("user123", 12);

  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: "Citizen",
        email: "citizen@test.com",
        passwordHash,
        role: "USER",
        office: "Public",
        status: "ACTIVE",
        preferences: { create: { interfaceLanguage: "en", defaultSourceLanguage: "Kinyarwanda", defaultTargetLanguage: "English" } },
        organizationProfile: { create: { organizationName: "Public Citizen" } },
      },
    }),
    prisma.user.create({
      data: {
        name: "Employee",
        email: "employee@minaloc.gov.rw",
        passwordHash,
        role: "EMPLOYEE",
        office: "MINALOC HQ",
        status: "ACTIVE",
        preferences: { create: { interfaceLanguage: "en", defaultSourceLanguage: "Kinyarwanda", defaultTargetLanguage: "English" } },
        organizationProfile: { create: { organizationName: "MINALOC", department: "Document Processing", province: "Kigali City" } },
      },
    }),
    prisma.user.create({
      data: {
        name: "Admin",
        email: "admin@govlingua.gov.rw",
        passwordHash,
        role: "ADMIN",
        office: "GovLingua HQ",
        status: "ACTIVE",
        preferences: { create: { interfaceLanguage: "en" } },
        organizationProfile: { create: { organizationName: "GovLingua AI", department: "Administration" } },
      },
    }),
    prisma.user.create({
      data: {
        name: "Jean Bosco Habimana",
        email: "admin@gov.rw",
        passwordHash: adminHash,
        role: "ADMIN",
        office: "MINALOC HQ",
        status: "ACTIVE",
        preferences: { create: { interfaceLanguage: "rw" } },
        organizationProfile: { create: { organizationName: "MINALOC", department: "IT Services", province: "Kigali City", district: "Nyarugenge" } },
      },
    }),
    prisma.user.create({
      data: {
        name: "Uwase Mukamana",
        email: "uwase.m@kigali.gov.rw",
        passwordHash: userHash,
        role: "USER",
        office: "Kigali District",
        status: "ACTIVE",
        preferences: { create: { interfaceLanguage: "rw", defaultSourceLanguage: "Kinyarwanda", defaultTargetLanguage: "French" } },
        organizationProfile: { create: { organizationName: "Kigali District Office", province: "Kigali City", district: "Kicukiro" } },
      },
    }),
    prisma.user.create({
      data: {
        name: "Claude Niyonzima",
        email: "claude.n@gov.rw",
        passwordHash: userHash,
        role: "USER",
        office: "Musanze District",
        status: "ACTIVE",
        preferences: { create: { interfaceLanguage: "en" } },
        organizationProfile: { create: { organizationName: "Musanze District", province: "Northern Province", district: "Musanze" } },
      },
    }),
    prisma.user.create({
      data: {
        name: "Aline Ingabire",
        email: "user@gov.rw",
        passwordHash: userHash,
        role: "USER",
        office: "Huye Sector",
        status: "ACTIVE",
        preferences: { create: { interfaceLanguage: "en", defaultSourceLanguage: "French", defaultTargetLanguage: "Kinyarwanda" } },
        organizationProfile: { create: { organizationName: "Huye Sector Office", province: "Southern Province", district: "Huye", sector: "Tumba" } },
      },
    }),
    prisma.user.create({
      data: {
        name: "Eric Mugisha",
        email: "eric.m@gov.rw",
        passwordHash: userHash,
        role: "USER",
        office: "Rubavu District",
        status: "ACTIVE",
        preferences: { create: {} },
        organizationProfile: { create: { organizationName: "Rubavu District", province: "Western Province", district: "Rubavu" } },
      },
    }),
    prisma.user.create({
      data: {
        name: "Diane Uwimana",
        email: "diane.u@minaloc.gov.rw",
        passwordHash,
        role: "EMPLOYEE",
        office: "MINALOC HQ",
        status: "ACTIVE",
        preferences: { create: { interfaceLanguage: "en" } },
        organizationProfile: { create: { organizationName: "MINALOC", department: "Translation Services", province: "Kigali City" } },
      },
    }),
    prisma.user.create({
      data: {
        name: "Patrick Nshimiyimana",
        email: "patrick.n@minaloc.gov.rw",
        passwordHash,
        role: "EMPLOYEE",
        office: "MINALOC HQ",
        status: "ACTIVE",
        preferences: { create: { interfaceLanguage: "rw" } },
        organizationProfile: { create: { organizationName: "MINALOC", department: "Quality Assurance", province: "Kigali City" } },
      },
    }),
  ]);

  console.log(`Created ${users.length} users`);

  // Create documents matching frontend mock data
  const citizenUser = users[0];
  const uwaseUser = users[4];
  const claudeUser = users[5];
  const alineUser = users[6];

  const documents = await Promise.all([
    prisma.document.create({
      data: {
        referenceId: "DOC-2041",
        fileName: "itegeko_nshinga_2024.pdf",
        originalName: "Itegeko_Nshinga_2024.pdf",
        fileSize: 1468006,
        mimeType: "application/pdf",
        sourceLanguage: "Kinyarwanda",
        targetLanguage: "English",
        action: "SUMMARIZE_TRANSLATE",
        status: "COMPLETED",
        qualityScore: 92.5,
        userId: citizenUser.id,
        createdAt: new Date("2026-06-01"),
      },
    }),
    prisma.document.create({
      data: {
        referenceId: "DOC-2040",
        fileName: "district_budget_q2.docx",
        originalName: "District_Budget_Q2.docx",
        fileSize: 839680,
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        sourceLanguage: "English",
        targetLanguage: "Kinyarwanda",
        action: "TRANSLATE",
        status: "COMPLETED",
        qualityScore: 88.0,
        userId: uwaseUser.id,
        createdAt: new Date("2026-05-30"),
      },
    }),
    prisma.document.create({
      data: {
        referenceId: "DOC-2039",
        fileName: "sector_meeting_minutes.pdf",
        originalName: "Sector_Meeting_Minutes.pdf",
        fileSize: 626688,
        mimeType: "application/pdf",
        sourceLanguage: "French",
        targetLanguage: "Kinyarwanda",
        action: "SUMMARIZE_TRANSLATE",
        status: "PROCESSING",
        userId: alineUser.id,
        createdAt: new Date("2026-05-29"),
      },
    }),
    prisma.document.create({
      data: {
        referenceId: "DOC-2038",
        fileName: "health_campaign_brief.txt",
        originalName: "Health_Campaign_Brief.txt",
        fileSize: 45056,
        mimeType: "text/plain",
        sourceLanguage: "English",
        targetLanguage: "French",
        action: "SUMMARIZE",
        status: "COMPLETED",
        qualityScore: 95.0,
        userId: claudeUser.id,
        createdAt: new Date("2026-05-28"),
      },
    }),
    prisma.document.create({
      data: {
        referenceId: "DOC-2037",
        fileName: "citizen_petition_2026.pdf",
        originalName: "Citizen_Petition_2026.pdf",
        fileSize: 262144,
        mimeType: "application/pdf",
        sourceLanguage: "Kinyarwanda",
        targetLanguage: "English",
        action: "TRANSLATE",
        status: "FAILED",
        userId: citizenUser.id,
        createdAt: new Date("2026-05-27"),
      },
    }),
    prisma.document.create({
      data: {
        referenceId: "DOC-2036",
        fileName: "land_use_policy.docx",
        originalName: "Land_Use_Policy.docx",
        fileSize: 1153434,
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        sourceLanguage: "English",
        targetLanguage: "Kinyarwanda",
        action: "SUMMARIZE",
        status: "COMPLETED",
        qualityScore: 90.0,
        userId: uwaseUser.id,
        createdAt: new Date("2026-05-26"),
      },
    }),
    prisma.document.create({
      data: {
        referenceId: "DOC-2035",
        fileName: "education_report_2025.pdf",
        originalName: "Education_Report_2025.pdf",
        fileSize: 2411724,
        mimeType: "application/pdf",
        sourceLanguage: "Kinyarwanda",
        targetLanguage: "French",
        action: "SUMMARIZE_TRANSLATE",
        status: "COMPLETED",
        qualityScore: 87.5,
        userId: alineUser.id,
        createdAt: new Date("2026-05-25"),
      },
    }),
    // Additional documents for richer data
    prisma.document.create({
      data: {
        referenceId: "DOC-2034",
        fileName: "umujyi_wa_kigali_plan.pdf",
        originalName: "Umujyi_wa_Kigali_Development_Plan.pdf",
        fileSize: 3145728,
        mimeType: "application/pdf",
        sourceLanguage: "Kinyarwanda",
        targetLanguage: "English",
        action: "SUMMARIZE_TRANSLATE",
        status: "COMPLETED",
        qualityScore: 91.0,
        userId: uwaseUser.id,
        createdAt: new Date("2026-05-22"),
      },
    }),
    prisma.document.create({
      data: {
        referenceId: "DOC-2033",
        fileName: "water_sanitation_report.docx",
        originalName: "Water_Sanitation_Q1_Report.docx",
        fileSize: 524288,
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        sourceLanguage: "English",
        targetLanguage: "Kinyarwanda",
        action: "TRANSLATE",
        status: "COMPLETED",
        qualityScore: 93.0,
        userId: claudeUser.id,
        createdAt: new Date("2026-05-20"),
      },
    }),
    prisma.document.create({
      data: {
        referenceId: "DOC-2032",
        fileName: "imihigo_performance.pdf",
        originalName: "Imihigo_Performance_Contract_2026.pdf",
        fileSize: 1887436,
        mimeType: "application/pdf",
        sourceLanguage: "Kinyarwanda",
        targetLanguage: "French",
        action: "SUMMARIZE",
        status: "COMPLETED",
        qualityScore: 89.0,
        userId: citizenUser.id,
        createdAt: new Date("2026-05-18"),
      },
    }),
    prisma.document.create({
      data: {
        referenceId: "DOC-2031",
        fileName: "agriculture_policy.txt",
        originalName: "Agriculture_Modernization_Policy.txt",
        fileSize: 98304,
        mimeType: "text/plain",
        sourceLanguage: "English",
        targetLanguage: "Kinyarwanda",
        action: "SUMMARIZE_TRANSLATE",
        status: "PENDING",
        userId: alineUser.id,
        createdAt: new Date("2026-06-15"),
      },
    }),
    prisma.document.create({
      data: {
        referenceId: "DOC-2030",
        fileName: "itorero_guidelines.pdf",
        originalName: "Itorero_Program_Guidelines.pdf",
        fileSize: 756832,
        mimeType: "application/pdf",
        sourceLanguage: "Kinyarwanda",
        targetLanguage: "English",
        action: "TRANSLATE",
        status: "COMPLETED",
        qualityScore: 94.5,
        userId: citizenUser.id,
        createdAt: new Date("2026-05-15"),
      },
    }),
  ]);

  console.log(`Created ${documents.length} documents`);

  // Create processing results for completed documents
  const completedDocs = documents.filter((d) => d.status === "COMPLETED");
  const processingResults = await Promise.all(
    completedDocs.map((doc) => {
      const summaries: Record<string, string> = {
        "DOC-2041": "Itegeko Nshinga ry'u Rwanda ryo mu 2024 risobanura amategeko shingiro y'igihugu, harimo uburenganzira bw'abaturage, imiterere y'ubutegetsi, n'inzego z'igihugu. Iryo tegeko rivugurura ingingo zerekeye uburinganire, uburenganzira bw'abagore, n'iterambere rirambye.",
        "DOC-2040": "Raporo y'ingengo y'imari y'akarere mu gihembwe cya 2 igaragaza ko amafaranga yageze kuri 85% y'ibyo byari byateganijwe. Ingingo z'ingenzi zirimo iterambere ry'amashuri, ibikorwa remezo by'amazi, n'uburezi.",
        "DOC-2038": "The Health Campaign Brief outlines the Q2 vaccination drive targeting 500,000 citizens across 30 districts. Key strategies include mobile clinics, community health worker engagement, and digital tracking systems.",
        "DOC-2036": "The Land Use Policy establishes guidelines for sustainable land management in Rwanda, addressing agricultural zoning, urban development boundaries, environmental protection zones, and community land rights.",
        "DOC-2035": "Le rapport sur l'éducation 2025 montre une augmentation de 12% du taux de scolarisation dans les zones rurales. Les résultats des examens nationaux ont progressé de 8% par rapport à l'année précédente.",
        "DOC-2034": "The Kigali Development Plan outlines a 10-year vision for sustainable urban growth, including green transportation infrastructure, affordable housing targets, and technology hub development across 3 districts.",
        "DOC-2033": "Raporo y'amazi n'isuku mu gihembwe cya 1 igaragaza ko 78% by'abaturage bafite amazi meza, kandi ko ibikorwa byo kunoza isuku by'amazu bigeze kuri 65% by'intego.",
        "DOC-2032": "Imihigo y'umwaka wa 2026 igaragaza intego 45 z'iterambere mu nzego zose z'ubutegetsi bw'inzego z'ibanze. Ingingo z'ingenzi zirimo ubuhinzi bwiza, uburezi, n'ubuzima bw'abaturage.",
        "DOC-2030": "The Itorero Program Guidelines describe the civic education framework for youth and adults, covering national values, community service requirements, and leadership development pathways.",
      };

      const translations: Record<string, string> = {
        "DOC-2041": "The 2024 Constitution of Rwanda establishes the fundamental laws of the nation, including citizens' rights, governance structure, and national institutions. This revision updates articles on equality, women's rights, and sustainable development.",
        "DOC-2040": "Ingaranganzira ya buri muntu, imiterere y'ubutegetsi, n'inzego z'igihugu byasobanuwe neza. Igenamigambi ry'amafaranga ryageze kuri 85% y'ibyo byari byateganijwe mu gihembwe cya 2.",
        "DOC-2035": "Le rapport montre une amélioration significative dans le secteur éducatif rwandais avec un taux de réussite global de 76% aux examens nationaux de 2025.",
        "DOC-2033": "Raporo y'amazi n'isuku - Igihembwe cya 1: Amazi meza yageze ku baturage 78%, isuku y'amazu 65%. Intego ni uguhanga kuri 90% mu myaka 3 iri imbere.",
        "DOC-2030": "The Itorero Program serves as Rwanda's civic education platform, training citizens in national values (Rwandanness, unity, patriotism) through structured community-based programs.",
      };

      return prisma.processingResult.create({
        data: {
          documentId: doc.id,
          summary: summaries[doc.referenceId] || "Document processed successfully. Summary available upon review.",
          translation: translations[doc.referenceId] || null,
          generatedAt: new Date(doc.createdAt.getTime() + 300000),
        },
      });
    })
  );

  console.log(`Created ${processingResults.length} processing results`);

  // Create validation records
  const employeeUser = users[1];
  const dianeUser = users[8];

  const validations = await Promise.all([
    prisma.validationRecord.create({
      data: {
        documentId: documents[0].id,
        userId: employeeUser.id,
        action: "APPROVE",
        feedback: "Translation is accurate and captures the legal terminology well.",
        createdAt: new Date("2026-06-02"),
      },
    }),
    prisma.validationRecord.create({
      data: {
        documentId: documents[1].id,
        userId: dianeUser.id,
        action: "APPROVE",
        feedback: "Budget figures correctly translated. Kinyarwanda terminology is appropriate.",
        createdAt: new Date("2026-05-31"),
      },
    }),
    prisma.validationRecord.create({
      data: {
        documentId: documents[3].id,
        userId: employeeUser.id,
        action: "IMPROVEMENT",
        feedback: "Good summary but missing key vaccination target numbers.",
        notes: "Please include the district-level breakdown in the summary.",
        createdAt: new Date("2026-05-29"),
      },
    }),
    prisma.validationRecord.create({
      data: {
        documentId: documents[5].id,
        userId: dianeUser.id,
        action: "APPROVE",
        feedback: "Summary captures all key policy points accurately.",
        createdAt: new Date("2026-05-27"),
      },
    }),
  ]);

  console.log(`Created ${validations.length} validation records`);

  // Create activity logs
  const activityLogs = await Promise.all([
    prisma.activityLog.create({ data: { userId: citizenUser.id, action: "REGISTER", details: "User account created", createdAt: new Date("2026-05-01") } }),
    prisma.activityLog.create({ data: { userId: citizenUser.id, action: "LOGIN", details: "User logged in", createdAt: new Date("2026-06-01") } }),
    prisma.activityLog.create({ data: { userId: citizenUser.id, action: "DOCUMENT_UPLOAD", details: "Uploaded Itegeko_Nshinga_2024.pdf", createdAt: new Date("2026-06-01") } }),
    prisma.activityLog.create({ data: { userId: uwaseUser.id, action: "LOGIN", details: "User logged in", createdAt: new Date("2026-05-30") } }),
    prisma.activityLog.create({ data: { userId: uwaseUser.id, action: "DOCUMENT_UPLOAD", details: "Uploaded District_Budget_Q2.docx", createdAt: new Date("2026-05-30") } }),
    prisma.activityLog.create({ data: { userId: employeeUser.id, action: "LOGIN", details: "User logged in", createdAt: new Date("2026-06-02") } }),
    prisma.activityLog.create({ data: { userId: employeeUser.id, action: "VALIDATION", details: "Approved DOC-2041", createdAt: new Date("2026-06-02") } }),
    prisma.activityLog.create({ data: { userId: users[2].id, action: "LOGIN", details: "Admin logged in", createdAt: new Date("2026-06-01") } }),
    prisma.activityLog.create({ data: { userId: users[2].id, action: "SETTINGS_UPDATE", details: "Updated system settings", createdAt: new Date("2026-06-01") } }),
    prisma.activityLog.create({ data: { userId: alineUser.id, action: "DOCUMENT_UPLOAD", details: "Uploaded Sector_Meeting_Minutes.pdf", createdAt: new Date("2026-05-29") } }),
    prisma.activityLog.create({ data: { userId: claudeUser.id, action: "DOCUMENT_UPLOAD", details: "Uploaded Health_Campaign_Brief.txt", createdAt: new Date("2026-05-28") } }),
    prisma.activityLog.create({ data: { userId: dianeUser.id, action: "VALIDATION", details: "Approved DOC-2040", createdAt: new Date("2026-05-31") } }),
  ]);

  console.log(`Created ${activityLogs.length} activity logs`);

  // Create system settings
  await prisma.systemSettings.create({
    data: {
      organizationName: "MINALOC - Ministry of Local Government",
      defaultSourceLanguage: "Kinyarwanda",
      defaultTargetLanguage: "English",
      maxFileSize: 10,
      allowedFileTypes: "pdf,docx,doc,txt",
      minPasswordLength: 8,
      requireSpecialChar: true,
      sessionTimeout: 30,
      enableEmailNotification: true,
      enableProcessingAlerts: true,
      maintenanceMode: false,
    },
  });

  console.log("Created system settings");

  // Create sample reports
  const adminUser = users[2];
  await Promise.all([
    prisma.report.create({
      data: {
        reportName: "Monthly Document Processing Report - May 2026",
        period: "2026-05",
        type: "monthly",
        status: "PUBLISHED",
        createdBy: adminUser.id,
        content: { totalProcessed: 45, successRate: 91, avgQualityScore: 89.5 },
        createdAt: new Date("2026-06-01"),
      },
    }),
    prisma.report.create({
      data: {
        reportName: "Language Distribution Analysis Q2 2026",
        period: "2026-Q2",
        type: "quarterly",
        status: "DRAFT",
        createdBy: adminUser.id,
        content: { kinyarwanda: 42, english: 35, french: 23 },
        createdAt: new Date("2026-06-10"),
      },
    }),
    prisma.report.create({
      data: {
        reportName: "User Activity Report - May 2026",
        period: "2026-05",
        type: "monthly",
        status: "PUBLISHED",
        createdBy: users[3].id,
        content: { activeUsers: 6, newRegistrations: 2, documentsUploaded: 12 },
        createdAt: new Date("2026-06-02"),
      },
    }),
  ]);

  console.log("Created sample reports");
  console.log("\n--- Seed Complete ---");
  console.log("\nTest Accounts:");
  console.log("  Citizen:  citizen@test.com / Password123");
  console.log("  Employee: employee@minaloc.gov.rw / Password123");
  console.log("  Admin:    admin@govlingua.gov.rw / Password123");
  console.log("  Admin 2:  admin@gov.rw / admin123");
  console.log("  User:     uwase.m@kigali.gov.rw / user123");
  console.log("  User:     claude.n@gov.rw / user123");
  console.log("  User:     user@gov.rw / user123");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
