import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export function formatRwandaDateTime(dateStr: string) {
  const d = new Date(dateStr);
  const date = d.toLocaleDateString("en-CA", { timeZone: "Africa/Kigali" });
  const time = d.toLocaleTimeString("en-GB", { timeZone: "Africa/Kigali" }).slice(0, 5);
  return { date, time };
}

// Download result output PDF (content only)
export function downloadAsPDF({
  fileName,
  summary,
  translation,
}: {
  fileName: string;
  summary?: string;
  translation?: string;
}) {
  const doc = new jsPDF();
  let y = 20;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  let first = true;

  if (summary) {
    const lines = doc.splitTextToSize(summary, 180);
    doc.text(lines, 14, y);
    y += lines.length * 5 + 10;
    first = false;
  }

  if (translation) {
    if (!first) {
      if (y > 250) {
        doc.addPage();
        y = 20;
      } else {
        y += 5; // space between summary and translation
      }
    }
    const lines = doc.splitTextToSize(translation, 180);
    doc.text(lines, 14, y);
  }

  const baseName = fileName.replace(/\.[^/.]+$/, "");
  doc.save(`${baseName}_output.pdf`);
}

// Download result output DOCX (content only)
export function downloadAsDOCX({
  fileName,
  summary,
  translation,
}: {
  fileName: string;
  summary?: string;
  translation?: string;
}) {
  let content = "";
  if (summary) {
    content += summary;
  }
  if (translation) {
    if (content) content += "\n\n";
    content += translation;
  }

  const blob = new Blob([content], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const baseName = fileName.replace(/\.[^/.]+$/, "");
  link.download = `${baseName}_output.docx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Export Audit Log PDF (User, Role, Action, Date, Time)
export function exportAuditLogPDF(logs: any[]) {
  const doc = new jsPDF();

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("GovLingua AI - Administrative Audit Log", 14, 20);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  const now = new Date();
  const nowKigali = now.toLocaleString("en-GB", { timeZone: "Africa/Kigali" });
  doc.text(`Exported on: ${nowKigali} (Rwanda Local Time)`, 14, 27);

  const columns = ["User", "Role", "Action", "Date", "Time"];
  const rows = logs.map(l => {
    const { date, time } = formatRwandaDateTime(l.createdAt);
    return [
      l.user?.name || "System",
      l.user?.role || "-",
      l.action,
      date,
      time
    ];
  });

  autoTable(doc, {
    startY: 35,
    head: [columns],
    body: rows,
    theme: "striped",
    headStyles: { fillColor: [22, 58, 95] }, // Match primary color #163a5f
    styles: { font: "helvetica", fontSize: 9 },
  });

  doc.save(`audit_log_${Date.now()}.pdf`);
}

// Export Reports CSV (Document Name, Processing Type, Source Language, Target Language, Processing Status, Validation, Date, Time)
export function exportReportsCSV(documents: any[]) {
  const headers = [
    "Document Name",
    "Processing Type",
    "Source Language",
    "Target Language",
    "Processing Status",
    "Validation",
    "Date",
    "Time"
  ];

  const rows = documents.map(doc => {
    return [
      doc.name || "",
      doc.action || "",
      doc.source || "",
      doc.target || "",
      doc.status || "",
      doc.validationStatus || "-",
      doc.date || "",
      doc.time || ""
    ];
  });

  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `reports_export_${Date.now()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
