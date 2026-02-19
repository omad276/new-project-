import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  calculateMortgage,
  calculatePricePerSqm,
  calculateRentalYield,
  formatCurrency,
  formatPercentage,
} from './financial';

// Extend jsPDF type for autoTable
declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: { finalY: number };
  }
}

export interface PropertyReportData {
  // Basic Info
  title: string;
  type: string;
  status: string;
  price: number;
  currency: string;
  area: number;
  bedrooms?: number;
  bathrooms?: number;

  // Location
  address: string;
  city: string;
  country: string;

  // Details
  description?: string;
  features: string[];
  images: string[];

  // Dates
  listedDate: Date;

  // Agent Info
  agentName?: string;
  agentPhone?: string;
  agentEmail?: string;
}

export interface ReportOptions {
  includeFinancials: boolean;
  includeMap: boolean;
  includeImages: boolean;
  language: 'en' | 'ar';
  mortgageSettings?: {
    downPaymentPercent: number;
    interestRate: number;
    termYears: number;
  };
}

const COLORS = {
  primary: [197, 165, 114] as [number, number, number], // Gold #C5A572
  dark: [26, 26, 46] as [number, number, number], // #1A1A2E
  text: [51, 51, 51] as [number, number, number],
  muted: [128, 128, 128] as [number, number, number],
  success: [34, 197, 94] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
};

/**
 * Generate a PDF report for a property
 */
export async function generatePropertyReport(
  property: PropertyReportData,
  options: ReportOptions
): Promise<jsPDF> {
  const { language, includeFinancials, mortgageSettings } = options;
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
  const contentWidth = pageWidth - margin * 2;
  let currentY = margin;

  // Helper functions
  const addText = (
    text: string,
    x: number,
    y: number,
    options: {
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
    } = options;

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
  // Logo area
  doc.setFillColor(...COLORS.dark);
  doc.rect(0, 0, pageWidth, 40, 'F');

  // Brand name
  addText('UPGREAT', margin, 18, {
    fontSize: 24,
    fontStyle: 'bold',
    color: COLORS.primary,
  });
  addText(isArabic ? 'تقرير العقار' : 'Property Report', margin, 28, {
    fontSize: 12,
    color: COLORS.white,
  });

  // Date
  const reportDate = new Date().toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  addText(reportDate, pageWidth - margin, 28, {
    fontSize: 10,
    color: COLORS.white,
    align: 'right',
  });

  currentY = 55;

  // =====================
  // PROPERTY TITLE & STATUS
  // =====================
  addText(property.title, margin, currentY, {
    fontSize: 20,
    fontStyle: 'bold',
    color: COLORS.dark,
    maxWidth: contentWidth,
  });
  currentY += 10;

  // Status badge
  const statusLabels: Record<string, { en: string; ar: string }> = {
    for_sale: { en: 'For Sale', ar: 'للبيع' },
    for_rent: { en: 'For Rent', ar: 'للإيجار' },
    sold: { en: 'Sold', ar: 'تم البيع' },
    rented: { en: 'Rented', ar: 'تم التأجير' },
  };
  const statusText = statusLabels[property.status]?.[language] || property.status;

  doc.setFillColor(...COLORS.primary);
  doc.roundedRect(margin, currentY - 4, 30, 8, 2, 2, 'F');
  addText(statusText, margin + 15, currentY, {
    fontSize: 9,
    fontStyle: 'bold',
    color: COLORS.white,
    align: 'center',
  });

  // Type badge
  const typeLabels: Record<string, { en: string; ar: string }> = {
    villa: { en: 'Villa', ar: 'فيلا' },
    apartment: { en: 'Apartment', ar: 'شقة' },
    office: { en: 'Office', ar: 'مكتب' },
    land: { en: 'Land', ar: 'أرض' },
    warehouse: { en: 'Warehouse', ar: 'مستودع' },
    industrial: { en: 'Industrial', ar: 'صناعي' },
  };
  const typeText = typeLabels[property.type]?.[language] || property.type;

  doc.setFillColor(...COLORS.muted);
  doc.roundedRect(margin + 35, currentY - 4, 30, 8, 2, 2, 'F');
  addText(typeText, margin + 50, currentY, {
    fontSize: 9,
    color: COLORS.white,
    align: 'center',
  });

  currentY += 10;

  // Location
  addText(`📍 ${property.address}, ${property.city}`, margin, currentY, {
    fontSize: 11,
    color: COLORS.muted,
  });
  currentY += 8;

  // Price
  const priceText = formatCurrency(property.price, property.currency);
  addText(priceText, margin, currentY, {
    fontSize: 22,
    fontStyle: 'bold',
    color: COLORS.primary,
  });
  currentY += 5;

  // =====================
  // KEY METRICS
  // =====================
  addSection(isArabic ? 'المواصفات الرئيسية' : 'Key Specifications');

  const metricsData = [
    [isArabic ? 'المساحة' : 'Area', `${property.area.toLocaleString()} ${isArabic ? 'م²' : 'sqm'}`],
    ...(property.bedrooms !== undefined
      ? [[isArabic ? 'غرف النوم' : 'Bedrooms', property.bedrooms.toString()]]
      : []),
    ...(property.bathrooms !== undefined
      ? [[isArabic ? 'الحمامات' : 'Bathrooms', property.bathrooms.toString()]]
      : []),
    [
      isArabic ? 'السعر/م²' : 'Price/sqm',
      formatCurrency(calculatePricePerSqm(property.price, property.area)),
    ],
    [
      isArabic ? 'تاريخ الإدراج' : 'Listed Date',
      property.listedDate.toLocaleDateString(isArabic ? 'ar-SA' : 'en-US'),
    ],
  ];

  autoTable(doc, {
    startY: currentY,
    head: [],
    body: metricsData,
    theme: 'plain',
    styles: {
      fontSize: 11,
      cellPadding: 4,
    },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: COLORS.muted, cellWidth: 50 },
      1: { textColor: COLORS.text },
    },
    margin: { left: margin, right: margin },
  });

  currentY = doc.lastAutoTable.finalY + 5;

  // =====================
  // DESCRIPTION
  // =====================
  if (property.description) {
    checkPageBreak(50);
    addSection(isArabic ? 'الوصف' : 'Description');
    const descHeight = addText(property.description, margin, currentY, {
      fontSize: 10,
      color: COLORS.text,
      maxWidth: contentWidth,
    });
    currentY += descHeight + 5;
  }

  // =====================
  // FEATURES
  // =====================
  if (property.features.length > 0) {
    checkPageBreak(40);
    addSection(isArabic ? 'المميزات' : 'Features');

    const featuresPerRow = 3;
    const featureWidth = contentWidth / featuresPerRow;

    property.features.forEach((feature, index) => {
      const col = index % featuresPerRow;
      const row = Math.floor(index / featuresPerRow);

      if (col === 0 && row > 0) {
        currentY += 7;
        checkPageBreak(20);
      }

      const x = margin + col * featureWidth;
      addText(`✓ ${feature}`, x, currentY, {
        fontSize: 10,
        color: COLORS.text,
      });
    });

    currentY += 10;
  }

  // =====================
  // FINANCIAL ANALYSIS
  // =====================
  if (includeFinancials) {
    checkPageBreak(80);
    addSection(isArabic ? 'التحليل المالي' : 'Financial Analysis');

    const settings = mortgageSettings || {
      downPaymentPercent: 20,
      interestRate: 5,
      termYears: 25,
    };

    const downPayment = (property.price * settings.downPaymentPercent) / 100;
    const loanAmount = property.price - downPayment;

    const mortgage = calculateMortgage({
      principal: loanAmount,
      annualRate: settings.interestRate / 100,
      termYears: settings.termYears,
    });

    // Estimated rental (5% annual yield)
    const estimatedAnnualRent = property.price * 0.05;
    const rentalYield = calculateRentalYield(estimatedAnnualRent, property.price);

    const financialData = [
      [isArabic ? 'الدفعة الأولى' : 'Down Payment', formatCurrency(downPayment)],
      [isArabic ? 'مبلغ القرض' : 'Loan Amount', formatCurrency(loanAmount)],
      [isArabic ? 'معدل الفائدة' : 'Interest Rate', formatPercentage(settings.interestRate)],
      [isArabic ? 'مدة القرض' : 'Loan Term', `${settings.termYears} ${isArabic ? 'سنة' : 'years'}`],
      [isArabic ? 'القسط الشهري' : 'Monthly Payment', formatCurrency(mortgage.monthlyPayment)],
      [isArabic ? 'إجمالي المدفوعات' : 'Total Payments', formatCurrency(mortgage.totalPayment)],
      [isArabic ? 'إجمالي الفوائد' : 'Total Interest', formatCurrency(mortgage.totalInterest)],
      [isArabic ? 'العائد الإيجاري المقدر' : 'Est. Rental Yield', formatPercentage(rentalYield)],
      [
        isArabic ? 'الإيجار الشهري المقدر' : 'Est. Monthly Rent',
        formatCurrency(estimatedAnnualRent / 12),
      ],
    ];

    autoTable(doc, {
      startY: currentY,
      head: [[isArabic ? 'البند' : 'Item', isArabic ? 'القيمة' : 'Value']],
      body: financialData,
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

    // Disclaimer
    checkPageBreak(20);
    addText(
      isArabic
        ? '* التقديرات المالية للإرشاد فقط وقد تختلف عن الواقع'
        : '* Financial estimates are for guidance only and may differ from actual values',
      margin,
      currentY,
      {
        fontSize: 8,
        color: COLORS.muted,
      }
    );
    currentY += 10;
  }

  // =====================
  // AGENT CONTACT
  // =====================
  if (property.agentName) {
    checkPageBreak(40);
    addSection(isArabic ? 'معلومات التواصل' : 'Contact Information');

    const contactData = [
      [isArabic ? 'الوكيل' : 'Agent', property.agentName],
      ...(property.agentPhone ? [[isArabic ? 'الهاتف' : 'Phone', property.agentPhone]] : []),
      ...(property.agentEmail ? [[isArabic ? 'البريد' : 'Email', property.agentEmail]] : []),
    ];

    autoTable(doc, {
      startY: currentY,
      head: [],
      body: contactData,
      theme: 'plain',
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      columnStyles: {
        0: { fontStyle: 'bold', textColor: COLORS.muted, cellWidth: 40 },
        1: { textColor: COLORS.text },
      },
      margin: { left: margin, right: margin },
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
      isArabic ? 'تم إنشاء هذا التقرير بواسطة Upgreat' : 'This report was generated by Upgreat',
      margin,
      footerY,
      { fontSize: 8, color: COLORS.muted }
    );

    addText('www.upgreat.sa', pageWidth - margin, footerY, {
      fontSize: 8,
      color: COLORS.primary,
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
 * Download the PDF report
 */
export function downloadReport(doc: jsPDF, filename: string): void {
  doc.save(`${filename}.pdf`);
}

/**
 * Open the PDF in a new window
 */
export function openReportInNewWindow(doc: jsPDF): void {
  const pdfBlob = doc.output('blob');
  const url = URL.createObjectURL(pdfBlob);
  window.open(url, '_blank');
}
