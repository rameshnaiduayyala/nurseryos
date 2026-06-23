import PDFDocument from 'pdfkit';

const parsePlanNotes = (notes) => {
  if (!notes) return null;
  try {
    const parsed = JSON.parse(notes);
    return parsed?.kind === 'SOURCING_LIST' ? parsed : null;
  } catch {
    return null;
  }
};

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

/**
 * Compiles a route-sheet PDF for an exporter collection plan.
 *
 * @param {Object} plan The Prisma OperationalPlan including stops and exporter relations.
 * @returns {Promise<Buffer>} Resolver returning raw binary file buffer
 */
export const generatePlanPdf = (plan) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 44 });
    const buffers = [];

    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', (err) => reject(err));

    const list = parsePlanNotes(plan.notes);
    const plantsByNursery = new Map();

    (list?.selectedSources || []).forEach((line) => {
      if (!plantsByNursery.has(line.nurseryId)) {
        plantsByNursery.set(line.nurseryId, []);
      }
      plantsByNursery.get(line.nurseryId).push(line);
    });

    doc.fillColor('#1b5e20').font('Helvetica-Bold').fontSize(24).text('NurseryOS', 44, 40);
    doc.fillColor('#555555').font('Helvetica').fontSize(10).text('Exporter Route Sheet', 44, 68);

    doc.fillColor('#222222').font('Helvetica-Bold').fontSize(18).text('ROUTE SHEET', 390, 40, { align: 'right' });
    doc.font('Helvetica').fontSize(10).text(`Plan #: ${plan.id.slice(0, 8).toUpperCase()}`, 390, 66, { align: 'right' });
    doc.text(`Date: ${new Date(plan.createdAt).toLocaleDateString()}`, 390, 81, { align: 'right' });
    doc.text(`Status: ${plan.status}`, 390, 96, { align: 'right' });

    doc.moveTo(44, 122).lineTo(548, 122).strokeColor('#e0e0e0').stroke();

    doc.fillColor('#222222').font('Helvetica-Bold').fontSize(12).text('Exporter:', 44, 140);
    doc.font('Helvetica').fontSize(10).text(plan.exporter?.fullName || 'N/A', 44, 158);
    doc.text(plan.exporter?.email || '', 44, 172);

    doc.fillColor('#222222').font('Helvetica-Bold').fontSize(12).text('Plan Summary:', 290, 140);
    doc.font('Helvetica').fontSize(10).text(plan.name, 290, 158);
    doc.text(list?.landscaperName ? `Customer: ${list.landscaperName}` : 'Customer: -', 290, 172);
    doc.text(`Stops: ${plan.totalStops || 0}`, 290, 186);
    doc.text(`Total Plants: ${plan.totalQuantity || 0}`, 290, 200);

    let y = 235;
    doc.fillColor('#222222').font('Helvetica-Bold').fontSize(12).text('Collection Stops', 44, y);
    y += 20;

    const stopRows = plan.stops || [];
    stopRows.forEach((stop, idx) => {
      const nursery = stop.nursery || {};
      const farmer = nursery.farmer || {};
      const stopLines = plantsByNursery.get(stop.nurseryId) || [];

      if (y > 680) {
        doc.addPage();
        y = 44;
      }

      doc.roundedRect(44, y, 504, 92 + Math.min(stopLines.length, 4) * 12).strokeColor('#e5e7eb').stroke();

      doc.font('Helvetica-Bold').fontSize(11).fillColor('#1f2937')
        .text(`${idx + 1}. ${nursery.name || 'Unknown nursery'}`, 54, y + 10);

      doc.font('Helvetica').fontSize(9).fillColor('#4b5563')
        .text(`Location: ${nursery.location || '-'}`, 54, y + 26);
      doc.text(`Farmer: ${farmer.fullName || 'Unknown'} | ${farmer.email || 'No email'}`, 54, y + 39);
      doc.text(`Contact: ${nursery.contactPerson || '-'}${nursery.mobileNumber ? ` | ${nursery.mobileNumber}` : ''}`, 54, y + 52);
      doc.text(`Planned Quantity: ${stop.plannedQuantity || 0}`, 54, y + 65);

      doc.fillColor('#111827').font('Helvetica-Bold').fontSize(9)
        .text('Plants to load', 312, y + 10);

      let lineY = y + 24;
      stopLines.slice(0, 4).forEach((line) => {
        doc.font('Helvetica').fontSize(8).fillColor('#374151')
          .text(`- ${line.requestedPlantName} x ${line.requestedQuantity}`, 312, lineY, { width: 220 });
        lineY += 12;
      });
      if (stopLines.length > 4) {
        doc.font('Helvetica-Oblique').fontSize(8).fillColor('#6b7280')
          .text(`+ ${stopLines.length - 4} more items`, 312, lineY);
      }

      y += 108 + Math.min(stopLines.length, 4) * 12;
    });

    y += 10;
    if (y > 700) {
      doc.addPage();
      y = 44;
    }

    doc.font('Helvetica-Bold').fontSize(12).fillColor('#222222').text('Route Note', 44, y);
    doc.font('Helvetica').fontSize(9).fillColor('#555555')
      .text('Use the stop order above for lorry loading and handoff. Each stop lists the farmer contact and the plant load for that nursery.', 44, y + 18, {
        width: 504,
      });

    doc.end();
  });
};
