const PDFDocument = require('pdfkit');

function generateCertificatePDF(certificateData) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                layout: 'landscape',
                size: 'A4'
            });

            // Collect PDF data chunks
            const chunks = [];
            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => {
                const pdfBuffer = Buffer.concat(chunks);
                resolve(pdfBuffer);
            });
            doc.on('error', reject);

            // Certificate design
            const { name, surname, completionDate, certificateId } = certificateData;
            
            // Header
            doc.fontSize(30)
               .fillColor('#1976d2')
               .text('CERTIFICATE OF COMPLETION', 50, 80, { align: 'center' });

            // Decorative line
            doc.moveTo(100, 140)
               .lineTo(700, 140)
               .stroke('#1976d2');

            // Main content
            doc.fontSize(18)
               .fillColor('#333333')
               .text('This is to certify that', 50, 180, { align: 'center' });

            doc.fontSize(32)
               .fillColor('#1976d2')
               .text(`${name} ${surname}`, 50, 220, { align: 'center' });

            doc.fontSize(16)
               .fillColor('#333333')
               .text('has successfully completed the GenAI Certificate Program', 50, 280, { align: 'center' });

            // Date and ID
            doc.fontSize(14)
               .text(`Completion Date: ${new Date(completionDate).toLocaleDateString()}`, 50, 350, { align: 'center' })
               .text(`Certificate ID: ${certificateId}`, 50, 375, { align: 'center' });

            // Footer
            doc.fontSize(12)
               .fillColor('#666666')
               .text('GenAI Certificate Program', 50, 450, { align: 'center' })
               .text('Generated with Azure Functions', 50, 470, { align: 'center' });

            doc.end();

        } catch (error) {
            reject(error);
        }
    });
}

module.exports = { generateCertificatePDF };