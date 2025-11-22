import jsPDF from 'jspdf';
import { Receipt, Delivery, Transfer, Adjustment } from '@/types';
import { format } from 'date-fns';

interface PDFData {
  receipt?: Receipt;
  delivery?: Delivery;
  transfer?: Transfer;
  adjustment?: Adjustment;
  suppliers?: Array<{ id: string; name: string }>;
  warehouses?: Array<{ id: string; name: string }>;
  products?: Array<{ id: string; name: string; sku: string; unitOfMeasure: string }>;
}

export const generatePDF = (data: PDFData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPos = margin;

  // Helper function to add a new page if needed
  const checkPageBreak = (requiredSpace: number) => {
    if (yPos + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPos = margin;
      return true;
    }
    return false;
  };

  // Helper function to get name by ID
  const getNameById = (id: string, items?: Array<{ id: string; name: string }>) => {
    return items?.find(item => item.id === id)?.name || 'Unknown';
  };

  const getProductName = (id: string) => {
    return data.products?.find(p => p.id === id)?.name || 'Unknown Product';
  };

  const getProductSKU = (id: string) => {
    return data.products?.find(p => p.id === id)?.sku || '';
  };

  const getProductUnit = (id: string) => {
    return data.products?.find(p => p.id === id)?.unitOfMeasure || '';
  };

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('StockMaster', margin, yPos);
  
  yPos += 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Inventory Management System', margin, yPos);
  
  yPos += 15;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  // Document Type and Details
  if (data.receipt) {
    const receipt = data.receipt;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('RECEIPT DOCUMENT', margin, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Receipt ID: ${receipt.id}`, margin, yPos);
    yPos += 6;
    doc.text(`Status: ${receipt.status.toUpperCase()}`, margin, yPos);
    yPos += 6;
    doc.text(`Supplier: ${getNameById(receipt.supplierId, data.suppliers)}`, margin, yPos);
    yPos += 6;
    doc.text(`Warehouse: ${getNameById(receipt.warehouseId, data.warehouses)}`, margin, yPos);
    yPos += 6;
    doc.text(`Date: ${format(new Date(receipt.createdAt), 'MMM dd, yyyy HH:mm')}`, margin, yPos);
    yPos += 10;

    if (receipt.notes) {
      doc.text(`Notes: ${receipt.notes}`, margin, yPos);
      yPos += 10;
    }

    // Products Table
    checkPageBreak(30);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Products', margin, yPos);
    yPos += 8;

    // Table Header
    const colWidths = [80, 50, 30, 30];
    const headers = ['Product', 'SKU', 'Quantity', 'Unit'];
    let xPos = margin;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setFillColor(240, 240, 240);
    doc.rect(xPos, yPos - 5, pageWidth - 2 * margin, 8, 'F');
    
    headers.forEach((header, i) => {
      doc.text(header, xPos + 2, yPos);
      xPos += colWidths[i];
    });
    yPos += 8;

    // Table Rows
    doc.setFont('helvetica', 'normal');
    receipt.lines.forEach((line) => {
      checkPageBreak(10);
      xPos = margin;
      doc.text(getProductName(line.productId).substring(0, 35), xPos + 2, yPos);
      xPos += colWidths[0];
      doc.text(getProductSKU(line.productId), xPos + 2, yPos);
      xPos += colWidths[1];
      doc.text(line.quantity.toLocaleString(), xPos + 2, yPos);
      xPos += colWidths[2];
      doc.text(getProductUnit(line.productId), xPos + 2, yPos);
      yPos += 6;
    });

    // Total
    yPos += 5;
    const totalQty = receipt.lines.reduce((sum, line) => sum + line.quantity, 0);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Quantity: ${totalQty.toLocaleString()}`, pageWidth - margin - 50, yPos);
  } else if (data.delivery) {
    const delivery = data.delivery;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('DELIVERY ORDER', margin, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Delivery ID: ${delivery.id}`, margin, yPos);
    yPos += 6;
    doc.text(`Status: ${delivery.status.toUpperCase()}`, margin, yPos);
    yPos += 6;
    doc.text(`Customer: ${delivery.customerName || 'N/A'}`, margin, yPos);
    yPos += 6;
    doc.text(`Warehouse: ${getNameById(delivery.warehouseId, data.warehouses)}`, margin, yPos);
    yPos += 6;
    doc.text(`Date: ${format(new Date(delivery.createdAt), 'MMM dd, yyyy HH:mm')}`, margin, yPos);
    yPos += 10;

    if (delivery.notes) {
      doc.text(`Notes: ${delivery.notes}`, margin, yPos);
      yPos += 10;
    }

    // Products Table
    checkPageBreak(30);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Products', margin, yPos);
    yPos += 8;

    const colWidths = [80, 50, 30, 30];
    const headers = ['Product', 'SKU', 'Quantity', 'Unit'];
    let xPos = margin;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setFillColor(240, 240, 240);
    doc.rect(xPos, yPos - 5, pageWidth - 2 * margin, 8, 'F');
    
    headers.forEach((header, i) => {
      doc.text(header, xPos + 2, yPos);
      xPos += colWidths[i];
    });
    yPos += 8;

    doc.setFont('helvetica', 'normal');
    delivery.lines.forEach((line) => {
      checkPageBreak(10);
      xPos = margin;
      doc.text(getProductName(line.productId).substring(0, 35), xPos + 2, yPos);
      xPos += colWidths[0];
      doc.text(getProductSKU(line.productId), xPos + 2, yPos);
      xPos += colWidths[1];
      doc.text(line.quantity.toLocaleString(), xPos + 2, yPos);
      xPos += colWidths[2];
      doc.text(getProductUnit(line.productId), xPos + 2, yPos);
      yPos += 6;
    });

    yPos += 5;
    const totalQty = delivery.lines.reduce((sum, line) => sum + line.quantity, 0);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Quantity: ${totalQty.toLocaleString()}`, pageWidth - margin - 50, yPos);
  } else if (data.transfer) {
    const transfer = data.transfer;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('INTERNAL TRANSFER', margin, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Transfer ID: ${transfer.id}`, margin, yPos);
    yPos += 6;
    doc.text(`Status: ${transfer.status.toUpperCase()}`, margin, yPos);
    yPos += 6;
    doc.text(`From: ${getNameById(transfer.fromWarehouseId, data.warehouses)}`, margin, yPos);
    yPos += 6;
    doc.text(`To: ${getNameById(transfer.toWarehouseId, data.warehouses)}`, margin, yPos);
    yPos += 6;
    doc.text(`Date: ${format(new Date(transfer.createdAt), 'MMM dd, yyyy HH:mm')}`, margin, yPos);
    yPos += 10;

    if (transfer.notes) {
      doc.text(`Notes: ${transfer.notes}`, margin, yPos);
      yPos += 10;
    }

    // Products Table
    checkPageBreak(30);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Products', margin, yPos);
    yPos += 8;

    const colWidths = [80, 50, 30, 30];
    const headers = ['Product', 'SKU', 'Quantity', 'Unit'];
    let xPos = margin;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setFillColor(240, 240, 240);
    doc.rect(xPos, yPos - 5, pageWidth - 2 * margin, 8, 'F');
    
    headers.forEach((header, i) => {
      doc.text(header, xPos + 2, yPos);
      xPos += colWidths[i];
    });
    yPos += 8;

    doc.setFont('helvetica', 'normal');
    transfer.lines.forEach((line) => {
      checkPageBreak(10);
      xPos = margin;
      doc.text(getProductName(line.productId).substring(0, 35), xPos + 2, yPos);
      xPos += colWidths[0];
      doc.text(getProductSKU(line.productId), xPos + 2, yPos);
      xPos += colWidths[1];
      doc.text(line.quantity.toLocaleString(), xPos + 2, yPos);
      xPos += colWidths[2];
      doc.text(getProductUnit(line.productId), xPos + 2, yPos);
      yPos += 6;
    });

    yPos += 5;
    const totalQty = transfer.lines.reduce((sum, line) => sum + line.quantity, 0);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Quantity: ${totalQty.toLocaleString()}`, pageWidth - margin - 50, yPos);
  } else if (data.adjustment) {
    const adjustment = data.adjustment;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('STOCK ADJUSTMENT', margin, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Adjustment ID: ${adjustment.id}`, margin, yPos);
    yPos += 6;
    doc.text(`Status: ${adjustment.status.toUpperCase()}`, margin, yPos);
    yPos += 6;
    doc.text(`Warehouse: ${getNameById(adjustment.warehouseId, data.warehouses)}`, margin, yPos);
    yPos += 6;
    doc.text(`Date: ${format(new Date(adjustment.createdAt), 'MMM dd, yyyy HH:mm')}`, margin, yPos);
    yPos += 10;

    if (adjustment.notes) {
      doc.text(`Notes: ${adjustment.notes}`, margin, yPos);
      yPos += 10;
    }

    // Products Table
    checkPageBreak(30);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Products', margin, yPos);
    yPos += 8;

    const colWidths = [60, 40, 30, 30, 30];
    const headers = ['Product', 'SKU', 'System', 'Counted', 'Diff'];
    let xPos = margin;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setFillColor(240, 240, 240);
    doc.rect(xPos, yPos - 5, pageWidth - 2 * margin, 8, 'F');
    
    headers.forEach((header, i) => {
      doc.text(header, xPos + 2, yPos);
      xPos += colWidths[i];
    });
    yPos += 8;

    doc.setFont('helvetica', 'normal');
    adjustment.lines.forEach((line) => {
      checkPageBreak(10);
      xPos = margin;
      doc.text(getProductName(line.productId).substring(0, 25), xPos + 2, yPos);
      xPos += colWidths[0];
      doc.text(getProductSKU(line.productId), xPos + 2, yPos);
      xPos += colWidths[1];
      doc.text(line.systemQuantity.toLocaleString(), xPos + 2, yPos);
      xPos += colWidths[2];
      doc.text(line.countedQuantity.toLocaleString(), xPos + 2, yPos);
      xPos += colWidths[3];
      const diff = line.countedQuantity - line.systemQuantity;
      doc.setTextColor(diff >= 0 ? 0 : 255, diff >= 0 ? 150 : 0, 0);
      doc.text(diff >= 0 ? `+${diff}` : `${diff}`, xPos + 2, yPos);
      doc.setTextColor(0, 0, 0);
      yPos += 6;
    });

    yPos += 5;
    const totalDiff = adjustment.lines.reduce((sum, line) => sum + (line.countedQuantity - line.systemQuantity), 0);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Difference: ${totalDiff >= 0 ? '+' : ''}${totalDiff.toLocaleString()}`, pageWidth - margin - 50, yPos);
  }

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${totalPages} - Generated on ${format(new Date(), 'MMM dd, yyyy HH:mm')}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  // Generate filename
  let filename = 'document';
  if (data.receipt) filename = `receipt-${data.receipt.id}`;
  else if (data.delivery) filename = `delivery-${data.delivery.id}`;
  else if (data.transfer) filename = `transfer-${data.transfer.id}`;
  else if (data.adjustment) filename = `adjustment-${data.adjustment.id}`;

  doc.save(`${filename}.pdf`);
};

