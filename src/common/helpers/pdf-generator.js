import PDFDocument from 'pdfkit';

/**
 * Compiles a professional Invoice PDF layout
 * 
 * @param {Object} invoice The Prisma Invoice object including procurementOrder, items, exporter, and customer relations.
 * @returns {Promise<Buffer>} Resolver returning raw binary file buffer
 */
export const generateInvoicePdf = (invoice) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];

    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', (err) => reject(err));

    const order = invoice.procurementOrder;
    const customer = order.customer;
    const exporter = order.exporter;

    // Header Branding
    doc.fillColor('#1b5e20').font('Helvetica-Bold').fontSize(24).text('NurseryOS', 50, 50);
    doc.fillColor('#555555').font('Helvetica').fontSize(10).text('Global Nursery Procurement Network', 50, 75);
    
    doc.fillColor('#222222').font('Helvetica-Bold').fontSize(18).text('INVOICE', 400, 50, { align: 'right' });
    doc.font('Helvetica').fontSize(10).text(`Invoice #: ${invoice.invoiceNumber}`, 400, 75, { align: 'right' });
    doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, 400, 90, { align: 'right' });
    doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 400, 105, { align: 'right' });

    // Divider Line
    doc.moveTo(50, 130).lineTo(550, 130).strokeColor('#e0e0e0').stroke();

    // Exporter Details
    doc.fillColor('#222222').font('Helvetica-Bold').fontSize(12).text('From (Exporter):', 50, 150);
    doc.font('Helvetica').fontSize(10).text(exporter.fullName, 50, 168);
    doc.text(exporter.email, 50, 183);

    // Customer Details
    if (customer) {
      doc.fillColor('#222222').font('Helvetica-Bold').fontSize(12).text('Bill To (Customer):', 300, 150);
      doc.font('Helvetica').fontSize(10).text(customer.name, 300, 168);
      doc.text(customer.email || '', 300, 183);
      doc.text(customer.phone || '', 300, 198);
      doc.text(customer.address || '', 300, 213);
    }

    // Table Column Headers
    let y = 260;
    doc.moveTo(50, y).lineTo(550, y).strokeColor('#222222').lineWidth(1).stroke();
    
    y += 10;
    doc.fillColor('#222222').font('Helvetica-Bold').fontSize(10);
    doc.text('Item Description', 50, y);
    doc.text('Quantity', 280, y, { width: 60, align: 'center' });
    doc.text('Unit Price', 360, y, { width: 80, align: 'right' });
    doc.text('Total', 460, y, { width: 90, align: 'right' });

    y += 15;
    doc.moveTo(50, y).lineTo(550, y).strokeColor('#e0e0e0').lineWidth(1).stroke();

    // Table Row Items
    doc.font('Helvetica').fontSize(10).fillColor('#333333');
    for (const item of order.items) {
      y += 10;
      // Handle page break check
      if (y > 700) {
        doc.addPage();
        y = 50;
      }
      doc.text(item.plant.name, 50, y);
      doc.text(item.quantity.toString(), 280, y, { width: 60, align: 'center' });
      doc.text(`INR ${parseFloat(item.unitPrice).toFixed(2)}`, 360, y, { width: 80, align: 'right' });
      
      const itemTotal = item.quantity * parseFloat(item.unitPrice);
      doc.text(`INR ${itemTotal.toFixed(2)}`, 460, y, { width: 90, align: 'right' });
      
      y += 15;
      doc.moveTo(50, y).lineTo(550, y).strokeColor('#eeeeee').stroke();
    }

    // Invoice Total Summaries
    y += 20;
    doc.fillColor('#222222').font('Helvetica-Bold').fontSize(11);
    doc.text('Total Due:', 320, y);
    doc.text(`INR ${parseFloat(invoice.amountDue).toFixed(2)}`, 460, y, { width: 90, align: 'right' });

    y += 20;
    doc.font('Helvetica').fontSize(10).fillColor('#555555');
    doc.text('Invoice Status:', 320, y);
    doc.text(invoice.status, 460, y, { width: 90, align: 'right' });

    // Payout Terms Footer
    doc.fontSize(8)
      .fillColor('#999999')
      .text('Payments should be settled within the specified terms duration. Overdue amounts might incur penalties.', 50, 730, { align: 'center', width: 500 });

    doc.end();
  });
};

/**
 * Compiles a professional Quotation PDF layout
 * 
 * @param {Object} quotation The Prisma Quotation object including customer and exporter relations.
 * @returns {Promise<Buffer>} Resolver returning raw binary file buffer
 */
export const generateQuotationPdf = (quotation) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];

    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', (err) => reject(err));

    const customer = quotation.customer;
    const exporter = quotation.exporter;

    // Header Branding
    doc.fillColor('#1b5e20').font('Helvetica-Bold').fontSize(24).text('NurseryOS', 50, 50);
    doc.fillColor('#555555').font('Helvetica').fontSize(10).text('Global Nursery Procurement Network', 50, 75);

    doc.fillColor('#222222').font('Helvetica-Bold').fontSize(18).text('QUOTATION', 400, 50, { align: 'right' });
    doc.font('Helvetica').fontSize(10).text(`Quotation ID: ${quotation.id.slice(0, 8).toUpperCase()}`, 400, 75, { align: 'right' });
    doc.text(`Date Issued: ${new Date(quotation.createdAt).toLocaleDateString()}`, 400, 90, { align: 'right' });
    doc.text(`Expires: ${new Date(quotation.expiresAt).toLocaleDateString()}`, 400, 105, { align: 'right' });

    // Divider Line
    doc.moveTo(50, 130).lineTo(550, 130).strokeColor('#e0e0e0').stroke();

    // Issuer Details
    doc.fillColor('#222222').font('Helvetica-Bold').fontSize(12).text('Issued By:', 50, 150);
    doc.font('Helvetica').fontSize(10).text(exporter.fullName, 50, 168);
    doc.text(exporter.email, 50, 183);

    // Client Details
    doc.fillColor('#222222').font('Helvetica-Bold').fontSize(12).text('Prepared For:', 300, 150);
    doc.font('Helvetica').fontSize(10).text(customer.name, 300, 168);
    doc.text(customer.email || '', 300, 183);
    doc.text(customer.phone || '', 300, 198);
    doc.text(customer.address || '', 300, 213);

    // Divider Line
    doc.moveTo(50, 240).lineTo(550, 240).strokeColor('#222222').lineWidth(1).stroke();

    // Summary Details
    let y = 260;
    doc.fillColor('#222222').font('Helvetica-Bold').fontSize(12).text('Pricing Proposal Summary', 50, y);
    
    y += 30;
    doc.font('Helvetica').fontSize(11).fillColor('#333333');
    doc.text('Offer Status:', 50, y);
    doc.font('Helvetica-Bold').text(quotation.status, 200, y);

    y += 25;
    doc.font('Helvetica').text('Estimated Net Amount:', 50, y);
    doc.font('Helvetica-Bold').text(`INR ${parseFloat(quotation.totalAmount).toFixed(2)}`, 200, y);

    y += 40;
    doc.font('Helvetica-Oblique').fontSize(9).fillColor('#777777').text(
      'Note: This quotation represents estimated costs based on active nursery inventory holdings. Price list locks are subject to confirmation and expiration guidelines.',
      50, y, { width: 500 }
    );

    // Footer
    doc.fontSize(8)
      .fillColor('#999999')
      .text('Thank you for choosing NurseryOS services for your supply chain requirements.', 50, 730, { align: 'center', width: 500 });

    doc.end();
  });
};
