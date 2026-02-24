import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { MeasurementExportData, MeasurementType, CostItem } from '@/types';

// Extend jsPDF type for autoTable
declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: { finalY: number };
  }
}

const COLORS = {
  primary: [197, 165, 114] as [number, number, number], // Gold #C5A572
  dark: [26, 26, 46] as [number, number, number], // #1A1A2E
  text: [51, 51, 51] as [number, number, number],
  muted: [128, 128, 128] as [number, number, number],
  success: [34, 197, 94] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  area: [76, 175, 80] as [number, number, number],
  distance: [33, 150, 243] as [number, number, number],
  volume: [156, 39, 176] as [number, number, number],
  perimeter: [255, 152, 0] as [number, number, number],
  angle: [244, 67, 54] as [number, number, number],
};

const TYPE_COLORS: Record<MeasurementType, [number, number, number]> = {
  area: COLORS.area,
  distance: COLORS.distance,
  volume: COLORS.volume,
  perimeter: COLORS.perimeter,
  angle: COLORS.angle,
};

export interface MeasurementReportOptions {
  language: 'en' | 'ar';
  includeCosts: boolean;
  includeTimeline: boolean;
  includeTotals: boolean;
}

/**
 * Generate a PDF report for measurements
 */
export async function generateMeasurementReport(
  data: MeasurementExportData,
  options: MeasurementReportOptions
): Promise<jsPDF> {
  const { language, includeCosts, includeTotals } = options;
  const isArabic = language === 'ar';

  // Create PDF - A4 size
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  void (pageWidth - margin * 2); // contentWidth available if needed
  let currentY = margin;

  // Helper functions
  const addText = (
    text: string,
    x: number,
    y: number,
    opts: {
      fontSize?: number;
      fontStyle?: 'normal' | 'bold';
      color?: [number, number, number];
      align?: 'left' | 'center' | 'right';
      maxWidth?: number;
    } = {}
  ) => {
    const {
      fontSize = 12,
      fontStyle = 'normal',
      color = COLORS.text,
      align = 'left',
      maxWidth,
    } = opts;

    doc.setFontSize(fontSize);
    doc.setFont('helvetica', fontStyle);
    doc.setTextColor(...color);

    if (maxWidth) {
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.text(lines, x, y, { align });
      return lines.length * (fontSize * 0.4);
    } else {
      doc.text(text, x, y, { align });
      return fontSize * 0.4;
    }
  };

  const addSection = (title: string) => {
    currentY += 8;
    doc.setDrawColor(...COLORS.primary);
    doc.setLineWidth(0.5);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 6;
    addText(title, margin, currentY, {
      fontSize: 14,
      fontStyle: 'bold',
      color: COLORS.dark,
    });
    currentY += 8;
  };

  const checkPageBreak = (requiredSpace: number) => {
    if (currentY + requiredSpace > pageHeight - margin) {
      doc.addPage();
      currentY = margin;
      return true;
    }
    return false;
  };

  // =====================
  // HEADER
  // =====================
  doc.setFillColor(...COLORS.dark);
  doc.rect(0, 0, pageWidth, 45, 'F');

  // Logo placeholder (or actual logo if provided)
  if (data.projectLogo) {
    try {
      doc.addImage(data.projectLogo, 'PNG', margin, 8, 25, 25);
      addText(data.projectName, margin + 30, 18, {
        fontSize: 18,
        fontStyle: 'bold',
        color: COLORS.primary,
      });
    } catch {
      // Fallback if logo fails to load
      addText(data.projectName, margin, 18, {
        fontSize: 18,
        fontStyle: 'bold',
        color: COLORS.primary,
      });
    }
  } else {
    addText(data.projectName, margin, 18, {
      fontSize: 18,
      fontStyle: 'bold',
      color: COLORS.primary,
    });
  }

  addText(isArabic ? 'تقرير القياسات' : 'Measurement Report', margin, 30, {
    fontSize: 12,
    color: COLORS.white,
  });

  // Date
  const reportDate = data.generatedAt.toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  addText(reportDate, pageWidth - margin, 30, {
    fontSize: 10,
    color: COLORS.white,
    align: 'right',
  });

  currentY = 55;

  // =====================
  // SUMMARY
  // =====================
  addSection(isArabic ? 'ملخص القياسات' : 'Measurement Summary');

  const summaryData = [
    [isArabic ? 'إجمالي القياسات' : 'Total Measurements', data.measurements.length.toString()],
    [isArabic ? 'مساحات' : 'Areas', (data.counts.area || 0).toString()],
    [isArabic ? 'مسافات' : 'Distances', (data.counts.distance || 0).toString()],
    [isArabic ? 'أحجام' : 'Volumes', (data.counts.volume || 0).toString()],
    [isArabic ? 'محيطات' : 'Perimeters', (data.counts.perimeter || 0).toString()],
    [isArabic ? 'زوايا' : 'Angles', (data.counts.angle || 0).toString()],
  ];

  autoTable(doc, {
    startY: currentY,
    head: [],
    body: summaryData,
    theme: 'plain',
    styles: {
      fontSize: 11,
      cellPadding: 4,
    },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: COLORS.muted, cellWidth: 60 },
      1: { textColor: COLORS.text },
    },
    margin: { left: margin, right: margin },
  });

  currentY = doc.lastAutoTable.finalY + 5;

  // =====================
  // TOTALS BY TYPE
  // =====================
  if (includeTotals && Object.keys(data.totals).length > 0) {
    checkPageBreak(50);
    addSection(isArabic ? 'الإجماليات حسب النوع' : 'Totals by Type');

    const totalsData = Object.entries(data.totals)
      .filter(([, value]) => value > 0)
      .map(([type, total]) => {
        const typeLabel = formatMeasurementType(type as MeasurementType, isArabic);
        const unit = getUnitForType(type as MeasurementType);
        return [typeLabel, `${total.toFixed(2)} ${unit}`];
      });

    if (totalsData.length > 0) {
      autoTable(doc, {
        startY: currentY,
        head: [[isArabic ? 'النوع' : 'Type', isArabic ? 'الإجمالي' : 'Total']],
        body: totalsData,
        theme: 'striped',
        headStyles: {
          fillColor: COLORS.dark,
          textColor: COLORS.white,
          fontStyle: 'bold',
        },
        styles: {
          fontSize: 10,
          cellPadding: 4,
        },
        columnStyles: {
          0: { cellWidth: 60 },
          1: { halign: 'right' },
        },
        margin: { left: margin, right: margin },
      });

      currentY = doc.lastAutoTable.finalY + 5;
    }
  }

  // =====================
  // MEASUREMENTS TABLE
  // =====================
  checkPageBreak(50);
  addSection(isArabic ? 'تفاصيل القياسات' : 'Measurement Details');

  const measurementRows = data.measurements.map((m) => [
    m.name,
    formatMeasurementType(m.type, isArabic),
    `${m.value.toFixed(2)} ${m.unit}`,
    m.createdAt ? new Date(m.createdAt).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US') : '-',
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [
      [
        isArabic ? 'الاسم' : 'Name',
        isArabic ? 'النوع' : 'Type',
        isArabic ? 'القيمة' : 'Value',
        isArabic ? 'التاريخ' : 'Date',
      ],
    ],
    body: measurementRows,
    theme: 'striped',
    headStyles: {
      fillColor: COLORS.dark,
      textColor: COLORS.white,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 30 },
      2: { halign: 'right', cellWidth: 40 },
      3: { cellWidth: 30 },
    },
    margin: { left: margin, right: margin },
    didDrawCell: (hookData) => {
      // Color-code by type
      if (hookData.section === 'body' && hookData.column.index === 1) {
        const type = data.measurements[hookData.row.index]?.type;
        if (type && TYPE_COLORS[type]) {
          doc.setTextColor(...TYPE_COLORS[type]);
        }
      }
    },
  });

  currentY = doc.lastAutoTable.finalY + 5;

  // =====================
  // COST ESTIMATE
  // =====================
  if (includeCosts && data.costEstimate && data.costEstimate.items.length > 0) {
    checkPageBreak(80);
    addSection(isArabic ? 'تقدير التكلفة' : 'Cost Estimate');

    const costRows = data.costEstimate.items.map((item) => [
      item.name,
      formatCategory(item.category, isArabic),
      `${item.unitCost.toFixed(2)}`,
      `${item.quantity.toFixed(2)} ${item.unit}`,
      `${item.totalCost.toFixed(2)}`,
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [
        [
          isArabic ? 'البند' : 'Item',
          isArabic ? 'الفئة' : 'Category',
          isArabic ? 'سعر الوحدة' : 'Unit Cost',
          isArabic ? 'الكمية' : 'Quantity',
          isArabic ? 'الإجمالي' : 'Total',
        ],
      ],
      body: costRows,
      theme: 'striped',
      headStyles: {
        fillColor: COLORS.dark,
        textColor: COLORS.white,
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      columnStyles: {
        0: { cellWidth: 45 },
        1: { cellWidth: 30 },
        2: { halign: 'right', cellWidth: 25 },
        3: { halign: 'right', cellWidth: 30 },
        4: { halign: 'right', cellWidth: 30 },
      },
      margin: { left: margin, right: margin },
    });

    currentY = doc.lastAutoTable.finalY + 5;

    // Cost summary
    checkPageBreak(30);
    const currency = data.costEstimate.currency || 'USD';
    const costSummaryData = [
      [
        isArabic ? 'المجموع الفرعي' : 'Subtotal',
        `${data.costEstimate.subtotal.toFixed(2)} ${currency}`,
      ],
      [
        `${isArabic ? 'الضريبة' : 'Tax'} (${data.costEstimate.taxRate}%)`,
        `${data.costEstimate.taxAmount.toFixed(2)} ${currency}`,
      ],
      [
        isArabic ? 'المجموع الكلي' : 'Grand Total',
        `${data.costEstimate.grandTotal.toFixed(2)} ${currency}`,
      ],
    ];

    autoTable(doc, {
      startY: currentY,
      head: [],
      body: costSummaryData,
      theme: 'plain',
      styles: {
        fontSize: 11,
        cellPadding: 3,
      },
      columnStyles: {
        0: { fontStyle: 'bold', textColor: COLORS.muted, cellWidth: 60 },
        1: { halign: 'right', fontStyle: 'bold', textColor: COLORS.dark },
      },
      margin: { left: margin + 80, right: margin },
    });

    currentY = doc.lastAutoTable.finalY + 5;
  }

  // =====================
  // FOOTER
  // =====================
  const addFooter = () => {
    const footerY = pageHeight - 15;
    doc.setDrawColor(...COLORS.muted);
    doc.setLineWidth(0.2);
    doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

    addText(
      isArabic ? 'تم إنشاء هذا التقرير تلقائياً' : 'This report was generated automatically',
      margin,
      footerY,
      { fontSize: 8, color: COLORS.muted }
    );

    addText(`ID: ${data.projectId}`, pageWidth - margin, footerY, {
      fontSize: 8,
      color: COLORS.muted,
      align: 'right',
    });
  };

  // Add footer to all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter();

    // Page number
    addText(`${i} / ${totalPages}`, pageWidth / 2, pageHeight - 15, {
      fontSize: 8,
      color: COLORS.muted,
      align: 'center',
    });
  }

  return doc;
}

/**
 * Download the measurement PDF report
 */
export function downloadMeasurementReport(doc: jsPDF, filename: string): void {
  doc.save(`${filename}.pdf`);
}

/**
 * Generate and download measurement PDF report
 */
export async function exportMeasurementsToPDF(
  data: MeasurementExportData,
  options: MeasurementReportOptions
): Promise<void> {
  const doc = await generateMeasurementReport(data, options);
  const filename = `measurements-${data.projectId}-${formatDate(data.generatedAt)}`;
  downloadMeasurementReport(doc, filename);
}

// Helper functions
function formatMeasurementType(type: MeasurementType, isArabic: boolean): string {
  const typeMap: Record<MeasurementType, { en: string; ar: string }> = {
    area: { en: 'Area', ar: 'مساحة' },
    distance: { en: 'Distance', ar: 'مسافة' },
    volume: { en: 'Volume', ar: 'حجم' },
    perimeter: { en: 'Perimeter', ar: 'محيط' },
    angle: { en: 'Angle', ar: 'زاوية' },
  };
  return typeMap[type]?.[isArabic ? 'ar' : 'en'] || type;
}

function formatCategory(category: CostItem['category'], isArabic: boolean): string {
  const categoryMap: Record<string, { en: string; ar: string }> = {
    material: { en: 'Material', ar: 'مواد' },
    labor: { en: 'Labor', ar: 'عمالة' },
    equipment: { en: 'Equipment', ar: 'معدات' },
    overhead: { en: 'Overhead', ar: 'نفقات عامة' },
    other: { en: 'Other', ar: 'أخرى' },
  };
  return categoryMap[category]?.[isArabic ? 'ar' : 'en'] || category;
}

function getUnitForType(type: MeasurementType): string {
  const unitMap: Record<MeasurementType, string> = {
    area: 'm²',
    distance: 'm',
    volume: 'm³',
    perimeter: 'm',
    angle: '°',
  };
  return unitMap[type] || '';
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export default {
  generateMeasurementReport,
  downloadMeasurementReport,
  exportMeasurementsToPDF,
};
