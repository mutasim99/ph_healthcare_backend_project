import PDFDocument from 'pdfkit';

interface InvoiceData {
    invoiceId: string;
    patientName: string;
    patientEmail: string;
    doctorName: string;
    appointmentDate: string;
    amount: number;
    transactionId: string;
    paymentDate: string;
}

export const generateInvoicePdf = async (data: InvoiceData): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: 'A4',
                margin: 50,
            });

            const chunks: Buffer[] = [];

            doc.on('data', (chunk) => {
                chunks.push(chunk);
            });

            doc.on('end', () => {
                resolve(Buffer.concat(chunks));
            });

            doc.on('error', (error) => {
                reject(error);
            });

            // --- COLOR PALETTE ---
            const colors = {
                primary: '#0284c7',    // Medical Blue (Headers, accents, totals)
                textDark: '#0f172a',   // Slate 900 (Main text, values)
                textMuted: '#64748b',  // Slate 500 (Labels, secondary info)
                border: '#cbd5e1',     // Slate 300 (Dividers, table borders)
                bgAccent: '#f8fafc',   // Slate 50 (Table header background)
            };

            // --- TOP BRANDING BAR ---
            doc.rect(0, 0, doc.page.width, 8).fill(colors.primary);
            
            // --- HEADER SECTION ---
            // Left Side: Clinic Name & Slogan
            doc.fillColor(colors.primary).fontSize(22).font('Helvetica-Bold').text('PH Healthcare', 50, 45);
            doc.fillColor(colors.textMuted).fontSize(10).font('Helvetica').text('Your Health, Our Priority', 50, 70);

            // Right Side: Document Type
            doc.fillColor(colors.border).fontSize(28).font('Helvetica-Bold').text('INVOICE', 50, 40, { 
                align: 'right',
                width: 495 
            });

            doc.y = 100;

            // Horizontal Divider
            doc.moveTo(50, doc.y).lineTo(545, doc.y).lineWidth(1).strokeColor(colors.border).stroke();
            
            // --- 3-COLUMN GRID: PATIENT, DOCTOR, INVOICE DETAILS ---
            const gridY = doc.y + 20;

            // Column 1: Billed To (Patient)
            doc.fillColor(colors.primary).fontSize(10).font('Helvetica-Bold').text('BILLED TO', 50, gridY);
            doc.fillColor(colors.textDark).fontSize(11).text(data.patientName, 50, gridY + 15);
            doc.fillColor(colors.textMuted).fontSize(9).font('Helvetica').text(data.patientEmail, 50, gridY + 28);

            // Column 2: Provider (Doctor)
            doc.fillColor(colors.primary).fontSize(10).font('Helvetica-Bold').text('PROVIDER', 230, gridY);
            doc.fillColor(colors.textDark).fontSize(11).text(data.doctorName, 230, gridY + 15);
            doc.fillColor(colors.textMuted).fontSize(9).font('Helvetica').text(`Appt: ${new Date(data.appointmentDate).toLocaleDateString()}`, 230, gridY + 28);

            // Column 3: Invoice Info
            doc.fillColor(colors.primary).fontSize(10).font('Helvetica-Bold').text('DETAILS', 410, gridY);
            doc.fillColor(colors.textMuted).fontSize(9).font('Helvetica')
                .text('Invoice #:', 410, gridY + 15).fillColor(colors.textDark).text(data.invoiceId, 460, gridY + 15)
                .fillColor(colors.textMuted).text('Paid On:', 410, gridY + 28).fillColor(colors.textDark).text(new Date(data.paymentDate).toLocaleDateString(), 460, gridY + 28)
                .fillColor(colors.textMuted).text('Txn ID:', 410, gridY + 41).fillColor(colors.textDark).text(data.transactionId, 460, gridY + 41);

            // --- PAYMENT SUMMARY TABLE ---
            const tableY = gridY + 85;

            // Table Header Background
            doc.rect(50, tableY, 495, 25).fill(colors.bgAccent);

            // Table Header Text
            doc.fillColor(colors.primary).fontSize(10).font('Helvetica-Bold')
                .text('DESCRIPTION', 60, tableY + 8)
                .text('AMOUNT', 400, tableY + 8, { width: 135, align: 'right' });

            // Table Item Row
            const rowY = tableY + 40;
            doc.fillColor(colors.textDark).fontSize(11).font('Helvetica')
                .text('Medical Consultation Fee', 60, rowY)
                .text(`${data.amount.toFixed(2)} BDT`, 400, rowY, { width: 135, align: 'right' });

            // Table Bottom Divider
            const dividerY = rowY + 25;
            doc.moveTo(50, dividerY).lineTo(545, dividerY).lineWidth(1).strokeColor(colors.border).stroke();

            // Total Section
            const totalY = dividerY + 15;
            doc.fillColor(colors.textDark).fontSize(11).font('Helvetica-Bold')
                .text('Total Paid', 350, totalY + 2, { width: 80, align: 'right' })
                .fillColor(colors.primary).fontSize(14)
                .text(`${data.amount.toFixed(2)} BDT`, 440, totalY, { width: 95, align: 'right' });

            // Status Badge (Paid)
            doc.rect(50, totalY, 50, 20).fill('#dcfce7'); // Light green bg
            doc.fillColor('#166534').fontSize(10).font('Helvetica-Bold').text('PAID', 50, totalY + 5, { 
                width: 50, 
                align: 'center' 
            });

            // --- FOOTER SECTION ---
            const bottomPosition = doc.page.height - 70;
            
            // Security / Payment Gateway Note
            doc.fillColor(colors.textMuted).fontSize(8).font('Helvetica').text(
                'Payment processed securely through Stripe.',
                50, bottomPosition - 15,
                { align: 'center', width: 495 }
            );

            // Standard Footer Note
            doc.fillColor(colors.textMuted).fontSize(8).text(
                'Thank you for choosing PH Healthcare. This is an electronically generated receipt.',
                50, bottomPosition,
                { align: 'center', width: 495 }
            );

            doc.fillColor(colors.primary).text(`Support: support@ph-healthcare.com`, 50, bottomPosition + 15, {
                align: 'center',
                width: 495
            });

            // End the document
            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};