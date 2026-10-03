import PDFDocument from 'pdfkit';
import { envVars } from '../../config/env';

interface PrescriptionData {
    doctorName: string;
    doctorEmail: string;
    patientName: string;
    patientEmail: string;
    followUpDate: Date;
    instructions: string;
    prescriptionId: string;
    appointmentDate: Date;
    createdAt: Date;
}

export const generatePrescriptionPDF = async (prescriptionData: PrescriptionData): Promise<Buffer> => {
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
                primary: '#0284c7',    // Medical Blue (Headers, accents)
                textDark: '#0f172a',   // Slate 900 (Main text, values)
                textMuted: '#64748b',  // Slate 500 (Labels, secondary info)
                border: '#cbd5e1',     // Slate 300 (Dividers)
                bgAccent: '#f8fafc',   // Slate 50 (Background highlights)
            };

            // --- TOP BRANDING BAR ---
            doc.rect(0, 0, doc.page.width, 8).fill(colors.primary);
            
            doc.moveDown(2);

            // --- HEADER SECTION ---
            // Left Side: Clinic Name & Slogan
            doc.fillColor(colors.primary).fontSize(22).font('Helvetica-Bold').text('PH Healthcare', 50, 45);
            doc.fillColor(colors.textMuted).fontSize(10).font('Helvetica').text('Your Health, Our Priority', 50, 70);

            // Right Side: Document Type
            doc.fillColor(colors.border).fontSize(28).font('Helvetica-Bold').text('PRESCRIPTION', 50, 40, { 
                align: 'right',
                width: 495 
            });

            doc.y = 100; // Reset Y position after absolute positioning

            // Horizontal Divider
            doc.moveTo(50, doc.y).lineTo(545, doc.y).lineWidth(1).strokeColor(colors.border).stroke();
            doc.moveDown(1.5);

            // --- 3-COLUMN GRID: DOCTOR, PATIENT, DETAILS ---
            const gridY = doc.y;

            // Column 1: Doctor
            doc.fillColor(colors.primary).fontSize(10).font('Helvetica-Bold').text('DOCTOR', 50, gridY);
            doc.fillColor(colors.textDark).fontSize(11).text(prescriptionData.doctorName, 50, gridY + 15);
            doc.fillColor(colors.textMuted).fontSize(9).font('Helvetica').text(prescriptionData.doctorEmail, 50, gridY + 28);

            // Column 2: Patient
            doc.fillColor(colors.primary).fontSize(10).font('Helvetica-Bold').text('PATIENT', 230, gridY);
            doc.fillColor(colors.textDark).fontSize(11).text(prescriptionData.patientName, 230, gridY + 15);
            doc.fillColor(colors.textMuted).fontSize(9).font('Helvetica').text(prescriptionData.patientEmail, 230, gridY + 28);

            // Column 3: Details
            doc.fillColor(colors.primary).fontSize(10).font('Helvetica-Bold').text('DETAILS', 410, gridY);
            doc.fillColor(colors.textMuted).fontSize(9).font('Helvetica')
                .text('Rx ID:', 410, gridY + 15).fillColor(colors.textDark).text(prescriptionData.prescriptionId, 450, gridY + 15)
                .fillColor(colors.textMuted).text('Date:', 410, gridY + 28).fillColor(colors.textDark).text(new Date(prescriptionData.createdAt).toLocaleDateString(), 450, gridY + 28)
                .fillColor(colors.textMuted).text('Appt:', 410, gridY + 41).fillColor(colors.textDark).text(new Date(prescriptionData.appointmentDate).toLocaleDateString(), 450, gridY + 41);

            if (prescriptionData.followUpDate) {
                doc.fillColor(colors.primary).font('Helvetica-Bold').text('Follow-up:', 410, gridY + 56)
                   .fillColor(colors.textDark).font('Helvetica').text(new Date(prescriptionData.followUpDate).toLocaleDateString(), 465, gridY + 56);
            }

            doc.y = gridY + 85; // Move cursor safely below the columns

            // Horizontal Divider
            doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor(colors.border).stroke();
            doc.moveDown(2);

            // --- INSTRUCTIONS SECTION (Modern Left-Border Style) ---
            const sectionY = doc.y;
            // Draw a subtle primary-colored vertical accent bar next to the title
            doc.rect(50, sectionY, 3, 14).fill(colors.primary);
            
            doc.fillColor(colors.primary).fontSize(12).font('Helvetica-Bold').text('MEDICATION & INSTRUCTIONS', 60, sectionY + 1);
            
            doc.x = 50;
            doc.y += 15;

            // Instructions body text with improved line height
            doc.fillColor(colors.textDark).fontSize(10).font('Helvetica').text(prescriptionData.instructions, {
                align: 'left',
                width: 495,
                lineGap: 5 // Better readability
            });

            doc.moveDown(4);

            // --- SIGNATURE SECTION ---
            // If instructions push this to a new page, PDFKit handles it automatically via flow layout
            const signatureY = doc.y;
            doc.moveTo(395, signatureY).lineTo(545, signatureY).strokeColor(colors.border).stroke();
            doc.fillColor(colors.textMuted).fontSize(10).font('Helvetica').text('Doctor\'s Signature', 395, signatureY + 8, {
                align: 'center',
                width: 150
            });

            // --- FOOTER (Sticks to the bottom of the document) ---
            const bottomPosition = doc.page.height - 60;
            
            doc.fillColor(colors.textMuted).fontSize(8).font('Helvetica').text(
                'This is an electronically generated prescription. Please follow all instructions provided by your doctor.',
                50, bottomPosition,
                { align: 'center', width: 495 }
            );

            doc.fillColor(colors.primary).text(`For more information, visit: ${envVars.FRONTEND_URL}`, 50, bottomPosition + 15, {
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