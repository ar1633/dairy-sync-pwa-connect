
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

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

  static generateMilkPricesPDF(prices: MilkPrice[], options: PDFOptions): void {
    const doc = new jsPDF(options.orientation || 'portrait');
    
    const startY = this.createHeader(doc, options.title);
    
    // Prepare table data
    const tableData = prices.map(price => [
      price.centreId,
      price.centreName,
      price.milkType === 'cow' ? 'Cow' : 'Buffalo',
      `${price.fat}%`,
      `${price.degree}°`,
      `${price.snf}%`,
      `₹${price.rate}`,
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

    // Generate table using autoTable
    (doc as any).autoTable({
      head: [tableHeaders],
      body: tableData,
      startY: startY,
      theme: 'striped',
      headStyles: {
        fillColor: [34, 197, 94], // green-500
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252] // slate-50
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

    this.createFooter(doc);
    
    const filename = options.filename || `milk-prices-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
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
