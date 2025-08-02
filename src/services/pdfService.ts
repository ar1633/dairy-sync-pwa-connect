import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Interface for payment summary data
interface PaymentSummaryData {
  farmerId: string;
  farmerName: string;
  totalAmount: number;
  totalQuantity: number;
  collections: number;
}

interface MilkPrice {
  id: string;
  centreId: string;
  centreName: string;
  milkType: 'cow' | 'buffalo';
  fat: number;
  degree: number;
  snf: number;
  rate: number;
  time: 'morning' | 'evening';
}

interface PDFOptions {
  title: string;
  orientation?: 'portrait' | 'landscape';
  filename?: string;
}

export class PDFService {
  private static createHeader(doc: jsPDF, title: string): number {
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Company header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Krishi DairySync', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Rural Dairy Management System', pageWidth / 2, 28, { align: 'center' });
    
    // Report title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(title, pageWidth / 2, 45, { align: 'center' });
    
    // Date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const currentDate = new Date().toLocaleDateString();
    doc.text(`Generated on: ${currentDate}`, pageWidth / 2, 55, { align: 'center' });
    
    // Separator line
    doc.setLineWidth(0.5);
    doc.line(20, 60, pageWidth - 20, 60);
    
    return 70; // Return Y position for content start
  }

  private static createFooter(doc: jsPDF): void {
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Krishi DairySync - Dairy Management System', pageWidth / 2, pageHeight - 10, { align: 'center' });
  }

  static async generatePDF(data: any, options?: any): Promise<Blob> {
    console.log('[PDFService] generatePDF', data, options);
    const doc = new jsPDF(options?.orientation || 'portrait');
    
    const startY = this.createHeader(doc, options?.title || 'Report');
    
    // Handle different data types
    if (data.prices && Array.isArray(data.prices)) {
      // Milk prices report
      const tableData = data.prices.map((price: any) => [
        price.centreId || '',
        price.centreName || '',
        price.milkType === 'cow' ? 'Cow' : 'Buffalo',
        `${price.fat || 0}%`,
        `${price.degree || 0}°`,
        `${price.snf || 0}%`,
        `₹${price.rate || 0}`,
        price.time === 'morning' ? 'Morning' : 'Evening'
      ]);

      const tableHeaders = [
        'Centre ID',
        'Centre Name', 
        'Milk Type',
        'Fat %',
        'Degree',
        'SNF %',
        'Rate (₹/L)',
        'Time'
      ];

      (doc as any).autoTable({
        head: [tableHeaders],
        body: tableData,
        startY: startY,
        theme: 'striped',
        headStyles: {
          fillColor: [34, 197, 94],
          textColor: 255,
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        },
        styles: {
          fontSize: 10,
          cellPadding: 5
        },
        columnStyles: {
          0: { halign: 'center' },
          2: { halign: 'center' },
          3: { halign: 'center' },
          4: { halign: 'center' },
          5: { halign: 'center' },
          6: { halign: 'right' },
          7: { halign: 'center' }
        }
      });
    } else {
      // Generic data report
      doc.setFontSize(12);
      doc.text('No specific data format recognized', 20, startY);
    }

    this.createFooter(doc);
    
    const filename = options?.filename || `report-${new Date().toISOString().split('T')[0]}.pdf`;
    
    try {
      // Save and return blob
      const pdfBlob = doc.output('blob');
      this.downloadPDF(pdfBlob, filename);
      return pdfBlob;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  }

  static async downloadPDF(blob: Blob, filename: string): Promise<void> {
    console.log('[PDFService] downloadPDF', filename);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    console.log('[PDFService] downloadPDF result', filename);
  }

  static generateFarmerReportPDF(farmers: any[], options: PDFOptions): void {
    const doc = new jsPDF(options.orientation || 'portrait');
    
    const startY = this.createHeader(doc, options.title);
    
    const tableData = farmers.map(farmer => [
      farmer.code || '',
      farmer.name || '',
      farmer.centerCode || '',
      farmer.phone || '',
      farmer.village || '',
      farmer.bankAccount || '',
      farmer.status || 'Active'
    ]);

    const tableHeaders = [
      'Farmer Code',
      'Name',
      'Centre',
      'Phone',
      'Village',
      'Bank Account',
      'Status'
    ];

    (doc as any).autoTable({
      head: [tableHeaders],
      body: tableData,
      startY: startY,
      theme: 'striped',
      headStyles: {
        fillColor: [34, 197, 94],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      styles: {
        fontSize: 10,
        cellPadding: 5
      }
    });

    this.createFooter(doc);
    
    const filename = options.filename || `farmer-report-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
  }

  // Generate Payment Summary PDF
  static generatePaymentSummaryPDF(summaryData: PaymentSummaryData[], startDate: string, endDate: string) {
    console.log('[PDFService] Generating payment summary PDF');
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('Payment Summary Report', 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Period: ${startDate} to ${endDate}`, 20, 35);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 45);
    
    // Table headers
    const headers = [['Farmer ID', 'Farmer Name', 'Collections', 'Total Quantity (L)', 'Total Amount (₹)']];
    
    // Table data
    const data = summaryData.map(summary => [
      summary.farmerId,
      summary.farmerName,
      summary.collections.toString(),
      summary.totalQuantity.toFixed(2),
      summary.totalAmount.toFixed(2)
    ]);
    
    // Add table
    (doc as any).autoTable({
      head: headers,
      body: data,
      startY: 55,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [66, 139, 202] }
    });
    
    // Summary totals
    const totalAmount = summaryData.reduce((sum, item) => sum + item.totalAmount, 0);
    const totalQuantity = summaryData.reduce((sum, item) => sum + item.totalQuantity, 0);
    const totalCollections = summaryData.reduce((sum, item) => sum + item.collections, 0);
    
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.text(`Total Collections: ${totalCollections}`, 20, finalY);
    doc.text(`Total Quantity: ${totalQuantity.toFixed(2)} L`, 20, finalY + 10);
    doc.text(`Total Amount: ₹${totalAmount.toFixed(2)}`, 20, finalY + 20);
    
    // Save
    const filename = `payment-summary-${startDate}-to-${endDate}.pdf`;
    doc.save(filename);
  }

  static generateMilkCollectionReportPDF(data: any, options: PDFOptions): void {
    const doc = new jsPDF(options.orientation || 'landscape');
    
    const startY = this.createHeader(doc, options.title);
    
    // Summary section
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Collection Summary', 20, startY);
    
    let currentY = startY + 15;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${data.date}`, 20, currentY);
    doc.text(`Centre: ${data.centerCode || 'All Centres'}`, 120, currentY);
    
    currentY += 10;
    doc.text(`Morning Collection: ${data.morning?.quantity || 0} L`, 20, currentY);
    doc.text(`Evening Collection: ${data.evening?.quantity || 0} L`, 120, currentY);
    doc.text(`Total Collection: ${data.total?.quantity || 0} L`, 220, currentY);
    
    currentY += 10;
    doc.text(`Morning Farmers: ${data.morning?.farmers || 0}`, 20, currentY);
    doc.text(`Evening Farmers: ${data.evening?.farmers || 0}`, 120, currentY);
    doc.text(`Total Amount: ₹${data.total?.amount || 0}`, 220, currentY);
    
    this.createFooter(doc);
    
    const filename = options.filename || `milk-collection-${data.date}.pdf`;
    doc.save(filename);
  }

  static generateBusinessReportPDF(data: any, options: PDFOptions): void {
    const doc = new jsPDF(options.orientation || 'portrait');
    
    const startY = this.createHeader(doc, options.title);
    
    // Business metrics
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Business Analytics', 20, startY);
    
    let currentY = startY + 20;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    const metrics = [
      'Total Revenue: ₹' + (data.totalRevenue || 0),
      'Total Expenses: ₹' + (data.totalExpenses || 0),
      'Net Profit: ₹' + ((data.totalRevenue || 0) - (data.totalExpenses || 0)),
      'Active Farmers: ' + (data.activeFarmers || 0),
      'Average Fat Content: ' + (data.avgFat || 0) + '%',
      'Monthly Growth: ' + (data.monthlyGrowth || 0) + '%'
    ];
    
    metrics.forEach(metric => {
      doc.text(metric, 20, currentY);
      currentY += 15;
    });
    
    this.createFooter(doc);
    
    const filename = options.filename || `business-report-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
  }
}

