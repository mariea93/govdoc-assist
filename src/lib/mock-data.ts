export type DocStatus = "Completed" | "Processing" | "Failed";

export interface DocItem {
  id: string;
  name: string;
  source: string;
  target: string;
  action: "Summarize" | "Translate" | "Summarize + Translate";
  date: string;
  status: DocStatus;
  size: string;
}

export const recentDocs: DocItem[] = [
  { id: "DOC-2041", name: "Itegeko_Nshinga_2024.pdf", source: "Kinyarwanda", target: "English", action: "Summarize + Translate", date: "2026-06-01", status: "Completed", size: "1.4 MB" },
  { id: "DOC-2040", name: "District_Budget_Q2.docx", source: "English", target: "Kinyarwanda", action: "Translate", date: "2026-05-30", status: "Completed", size: "820 KB" },
  { id: "DOC-2039", name: "Sector_Meeting_Minutes.pdf", source: "French", target: "Kinyarwanda", action: "Summarize + Translate", date: "2026-05-29", status: "Processing", size: "612 KB" },
  { id: "DOC-2038", name: "Health_Campaign_Brief.txt", source: "English", target: "French", action: "Summarize", date: "2026-05-28", status: "Completed", size: "44 KB" },
  { id: "DOC-2037", name: "Citizen_Petition_2026.pdf", source: "Kinyarwanda", target: "English", action: "Translate", date: "2026-05-27", status: "Failed", size: "256 KB" },
  { id: "DOC-2036", name: "Land_Use_Policy.docx", source: "English", target: "Kinyarwanda", action: "Summarize", date: "2026-05-26", status: "Completed", size: "1.1 MB" },
  { id: "DOC-2035", name: "Education_Report_2025.pdf", source: "Kinyarwanda", target: "French", action: "Summarize + Translate", date: "2026-05-25", status: "Completed", size: "2.3 MB" },
];

export const users = [
  { id: 1, name: "Jean Bosco Habimana", email: "jbosco@gov.rw", role: "Admin", office: "MINALOC HQ", status: "Active" },
  { id: 2, name: "Uwase Mukamana", email: "uwase.m@kigali.gov.rw", role: "Officer", office: "Kigali District", status: "Active" },
  { id: 3, name: "Claude Niyonzima", email: "claude.n@gov.rw", role: "Translator", office: "Musanze District", status: "Active" },
  { id: 4, name: "Aline Ingabire", email: "aline.i@gov.rw", role: "Viewer", office: "Huye Sector", status: "Invited" },
  { id: 5, name: "Eric Mugisha", email: "eric.m@gov.rw", role: "Officer", office: "Rubavu District", status: "Disabled" },
];

export const LANGUAGES = ["Kinyarwanda", "English", "French"] as const;
