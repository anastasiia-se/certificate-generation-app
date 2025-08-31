const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

function generateCertificatePDF(certificateData) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                layout: 'landscape',
                size: 'A4',
                margins: { top: 30, bottom: 30, left: 40, right: 40 }
            });

            // Collect PDF data chunks
            const chunks = [];
            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => {
                const pdfBuffer = Buffer.concat(chunks);
                resolve(pdfBuffer);
            });
            doc.on('error', reject);

            // Certificate design based on Swedbank template
            const { name, surname, completionDate, certificateId } = certificateData;
            const pageWidth = doc.page.width;
            const pageHeight = doc.page.height;
            const orangeColor = '#FF6B35'; // Swedbank orange
            const darkText = '#2C2C2C';
            
            // Try to add background image (oak leaves) on the right side
            try {
                const bgImagePath = path.join(__dirname, 'oak-leaves-bg.jpg');
                if (fs.existsSync(bgImagePath)) {
                    // Add background image on the right side with opacity effect
                    doc.save();
                    doc.rect(pageWidth * 0.65, 40, pageWidth * 0.35 - 50, pageHeight - 80)
                       .clip();
                    doc.image(bgImagePath, pageWidth * 0.65, 40, {
                        width: pageWidth * 0.35,
                        height: pageHeight - 80,
                        fit: [pageWidth * 0.35, pageHeight - 80]
                    });
                    doc.restore();
                }
            } catch (imgError) {
                console.log('Could not add background image:', imgError);
            }
            
            // Draw double border frame
            // Outer border
            doc.rect(30, 30, pageWidth - 60, pageHeight - 60)
               .lineWidth(3)
               .stroke(orangeColor);
            
            // Inner border
            doc.rect(40, 40, pageWidth - 80, pageHeight - 80)
               .lineWidth(1)
               .stroke(orangeColor);
            
            // DIPLOMA title
            doc.font('Helvetica-Bold')
               .fontSize(48)
               .fillColor(darkText)
               .text('DIPLOMA', 0, 100, { 
                   align: 'center',
                   width: pageWidth
               });
            
            // Subtitle
            doc.font('Helvetica')
               .fontSize(18)
               .fillColor(darkText)
               .text('for successful completion of', 0, 170, { 
                   align: 'center',
                   width: pageWidth
               });
            
            // Program name
            doc.font('Helvetica-Bold')
               .fontSize(32)
               .fillColor(darkText)
               .text('Gen AI Training for Technical Professionals', 0, 200, { 
                   align: 'center',
                   width: pageWidth
               });
            
            // Description paragraph
            doc.font('Helvetica')
               .fontSize(14)
               .fillColor(darkText)
               .text('Completion of this program demonstrates technical expertise', 0, 260, {
                   align: 'center',
                   width: pageWidth
               })
               .text('in developing Generative AI applications within highly', 0, 280, {
                   align: 'center',
                   width: pageWidth
               })
               .text('regulated environments, adherence to best practices in the', 0, 300, {
                   align: 'center',
                   width: pageWidth
               })
               .text('financial industry, and alignment with Swedbank\'s standards', 0, 320, {
                   align: 'center',
                   width: pageWidth
               })
               .text('and guidelines.', 0, 340, {
                   align: 'center',
                   width: pageWidth
               });
            
            // Certificate presented to
            doc.fontSize(16)
               .fillColor(darkText)
               .text('This certificate is proudly presented to', 0, 380, {
                   align: 'center',
                   width: pageWidth
               });
            
            // Recipient name
            doc.font('Helvetica-Bold')
               .fontSize(36)
               .fillColor(darkText)
               .text(`${name.toUpperCase()} ${surname.toUpperCase()}`, 0, 410, {
                   align: 'center',
                   width: pageWidth
               });
            
            // Date with decorative elements
            const dateText = new Date(completionDate).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            
            // Decorative swirls around date
            doc.moveTo(250, 475)
               .quadraticCurveTo(220, 470, 200, 475)
               .stroke(orangeColor);
            
            doc.moveTo(pageWidth - 250, 475)
               .quadraticCurveTo(pageWidth - 220, 470, pageWidth - 200, 475)
               .stroke(orangeColor);
            
            doc.font('Helvetica')
               .fontSize(16)
               .fillColor(darkText)
               .text(dateText, 0, 465, {
                   align: 'center',
                   width: pageWidth
               });
            
            // Add Swedbank logo
            try {
                const logoPath = path.join(__dirname, 'swedbank-logo.png');
                if (fs.existsSync(logoPath)) {
                    // Add the actual Swedbank logo centered at bottom
                    doc.image(logoPath, pageWidth / 2 - 100, 500, {
                        width: 200,
                        height: 50,
                        fit: [200, 50],
                        align: 'center'
                    });
                } else {
                    // Fallback to text if logo not found
                    doc.font('Helvetica-Bold')
                       .fontSize(24)
                       .fillColor(orangeColor)
                       .text('Swedbank', 0, 510, {
                           align: 'center',
                           width: pageWidth
                       });
                }
            } catch (logoError) {
                console.log('Could not add logo:', logoError);
                // Fallback to text
                doc.font('Helvetica-Bold')
                   .fontSize(24)
                   .fillColor(orangeColor)
                   .text('Swedbank', 0, 510, {
                       align: 'center',
                       width: pageWidth
                   });
            }
            
            // Small certificate ID at bottom
            doc.font('Helvetica')
               .fontSize(8)
               .fillColor('#999999')
               .text(`Certificate ID: ${certificateId}`, 50, pageHeight - 50, {
                   align: 'left',
                   width: pageWidth - 100
               });

            doc.end();

        } catch (error) {
            reject(error);
        }
    });
}

module.exports = { generateCertificatePDF };