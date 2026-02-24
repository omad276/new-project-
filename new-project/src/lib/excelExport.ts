import * as XLSX from 'xlsx';
import type { MeasurementType, CostItem, MeasurementExportData } from '@/types';

/**
 * Generate an Excel workbook with measurement data
 */
export function generateMeasurementExcel(data: MeasurementExportData): XLSX.WorkBook {
  const workbook = XLSX.utils.book_new();

  // Sheet 1: Measurements
  const measurementRows = data.measurements.map((m) => ({
    Name: m.name,
    Type: formatMeasurementType(m.type),
    Value: m.value,
    Unit: m.unit,
    Color: m.color,
    'Created At': m.createdAt ? new Date(m.createdAt).toLocaleDateString() : '',
  }));

  const measurementSheet = XLSX.utils.json_to_sheet(measurementRows);

  // Set column widths
  measurementSheet['!cols'] = [
    { wch: 20 }, // Name
    { wch: 12 }, // Type
    { wch: 15 }, // Value
    { wch: 8 }, // Unit
    { wch: 10 }, // Color
    { wch: 15 }, // Created At
  ];

  XLSX.utils.book_append_sheet(workbook, measurementSheet, 'Measurements');

  // Sheet 2: Summary by Type
  const summaryRows = Object.entries(data.totals).map(([type, total]) => ({
    Type: formatMeasurementType(type as MeasurementType),
    'Total Value': total,
    Count: data.counts[type as MeasurementType] || 0,
    Average: data.counts[type as MeasurementType]
      ? total / data.counts[type as MeasurementType]
      : 0,
  }));

  const summarySheet = XLSX.utils.json_to_sheet(summaryRows);
  summarySheet['!cols'] = [
    { wch: 12 }, // Type
    { wch: 15 }, // Total Value
    { wch: 8 }, // Count
    { wch: 12 }, // Average
  ];

  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  // Sheet 3: Cost Estimate (if provided)
  if (data.costEstimate && data.costEstimate.items.length > 0) {
    const costRows = data.costEstimate.items.map((item) => ({
      Item: item.name,
      Category: formatCategory(item.category),
      'Unit Cost': item.unitCost,
      Quantity: item.quantity,
      Unit: item.unit,
      'Total Cost': item.totalCost,
    }));

    // Add totals row
    costRows.push({
      Item: '',
      Category: '',
      'Unit Cost': 0,
      Quantity: 0,
      Unit: '',
      'Total Cost': 0,
    });
    costRows.push({
      Item: 'Subtotal',
      Category: '',
      'Unit Cost': 0,
      Quantity: 0,
      Unit: '',
      'Total Cost': data.costEstimate.subtotal,
    });
    costRows.push({
      Item: `Tax (${data.costEstimate.taxRate}%)`,
      Category: '',
      'Unit Cost': 0,
      Quantity: 0,
      Unit: '',
      'Total Cost': data.costEstimate.taxAmount,
    });
    costRows.push({
      Item: 'Grand Total',
      Category: '',
      'Unit Cost': 0,
      Quantity: 0,
      Unit: '',
      'Total Cost': data.costEstimate.grandTotal,
    });

    const costSheet = XLSX.utils.json_to_sheet(costRows);
    costSheet['!cols'] = [
      { wch: 25 }, // Item
      { wch: 12 }, // Category
      { wch: 12 }, // Unit Cost
      { wch: 10 }, // Quantity
      { wch: 8 }, // Unit
      { wch: 15 }, // Total Cost
    ];

    XLSX.utils.book_append_sheet(workbook, costSheet, 'Cost Estimate');
  }

  // Sheet 4: Project Info
  const projectInfoRows = [
    { Field: 'Project Name', Value: data.projectName },
    { Field: 'Project ID', Value: data.projectId },
    { Field: 'Total Measurements', Value: data.measurements.length },
    { Field: 'Generated At', Value: data.generatedAt.toLocaleString() },
  ];

  const projectSheet = XLSX.utils.json_to_sheet(projectInfoRows);
  projectSheet['!cols'] = [
    { wch: 20 }, // Field
    { wch: 40 }, // Value
  ];

  XLSX.utils.book_append_sheet(workbook, projectSheet, 'Project Info');

  return workbook;
}

/**
 * Download an Excel workbook as a file
 */
export function downloadExcel(workbook: XLSX.WorkBook, filename: string): void {
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

/**
 * Generate and download measurement Excel report
 */
export function exportMeasurementsToExcel(data: MeasurementExportData): void {
  const workbook = generateMeasurementExcel(data);
  const filename = `measurements-${data.projectId}-${formatDate(data.generatedAt)}`;
  downloadExcel(workbook, filename);
}

// Helper functions
function formatMeasurementType(type: MeasurementType | string): string {
  const typeMap: Record<string, string> = {
    area: 'Area',
    distance: 'Distance',
    volume: 'Volume',
    perimeter: 'Perimeter',
    angle: 'Angle',
  };
  return typeMap[type] || type;
}

function formatCategory(category: CostItem['category']): string {
  const categoryMap: Record<string, string> = {
    material: 'Material',
    labor: 'Labor',
    equipment: 'Equipment',
    overhead: 'Overhead',
    other: 'Other',
  };
  return categoryMap[category] || category;
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export default {
  generateMeasurementExcel,
  downloadExcel,
  exportMeasurementsToExcel,
};
