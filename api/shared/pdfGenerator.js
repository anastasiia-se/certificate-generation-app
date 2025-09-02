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

            // State-of-the-art certificate design with Swedbank elements
            const { name, surname, completionDate, certificateId } = certificateData;
            const pageWidth = doc.page.width;
            const pageHeight = doc.page.height;
            const orangeColor = '#FF6B35'; // Swedbank orange
            const goldColor = '#DAA520';   // Elegant gold accent
            const darkText = '#2C2C2C';
            const lightText = '#666666';
            const centerX = pageWidth / 2;
            
            // Subtle oak leaves background - very light watermark effect across entire page
            try {
                const bgImagePath = path.join(__dirname, 'oak-leaves-bg.jpg');
                if (fs.existsSync(bgImagePath)) {
                    doc.save();
                    // Full page subtle background
                    doc.opacity(0.08)  // Very subtle watermark
                       .image(bgImagePath, 0, 0, {
                        width: pageWidth,
                        height: pageHeight,
                        cover: [pageWidth, pageHeight]
                    });
                    doc.opacity(1);
                    doc.restore();
                }
            } catch (imgError) {
                console.log('Could not add background image:', imgError);
            }
            
            // Elegant border system
            // Outer decorative border
            doc.rect(20, 20, pageWidth - 40, pageHeight - 40)
               .lineWidth(2)
               .stroke(orangeColor);
            
            // Inner elegant frame
            doc.rect(35, 35, pageWidth - 70, pageHeight - 70)
               .lineWidth(0.5)
               .stroke(goldColor);
            
            // Top decorative header bar
            doc.rect(50, 50, pageWidth - 100, 3)
               .fill(orangeColor);
            
            // Bottom decorative footer bar  
            doc.rect(50, pageHeight - 53, pageWidth - 100, 3)
               .fill(orangeColor);
            
            // Header section with Swedbank logo
            try {
                const logoPath = path.join(__dirname, 'swedbank-logo.png');
                if (fs.existsSync(logoPath)) {
                    const logoWidth = 200;
                    const logoHeight = 50;
                    doc.image(logoPath, centerX - logoWidth/2, 80, {
                        width: logoWidth,
                        height: logoHeight,
                        fit: [logoWidth, logoHeight]
                    });
                } else {
                    // Fallback to text logo
                    doc.font('Helvetica-Bold')
                       .fontSize(28)
                       .fillColor(orangeColor)
                       .text('Swedbank', 0, 85, {
                           align: 'center',
                           width: pageWidth
                       });
                }
            } catch (logoError) {
                console.log('Could not add logo:', logoError);
            }
            
            // DIPLOMA - elegant title
            doc.font('Helvetica-Bold')
               .fontSize(72)
               .fillColor(darkText)
               .text('DIPLOMA', 0, 160, { 
                   align: 'center',
                   width: pageWidth,
                   characterSpacing: 4
               });
            
            // Decorative line under title
            const lineY = 240;
            doc.moveTo(centerX - 150, lineY)
               .lineTo(centerX - 50, lineY)
               .lineWidth(2)
               .stroke(orangeColor);
               
            doc.moveTo(centerX + 50, lineY)
               .lineTo(centerX + 150, lineY)
               .lineWidth(2)
               .stroke(orangeColor);
               
            // Center decorative element
            doc.circle(centerX, lineY, 8)
               .fill(goldColor);
            
            // Presentation text
            doc.font('Helvetica')
               .fontSize(16)
               .fillColor(darkText)
               .text('This certificate is proudly presented to', 0, 270, {
                   align: 'center',
                   width: pageWidth
               });
            
            // Recipient name with elegant underline
            const nameY = 310;
            doc.font('Times-Bold')
               .fontSize(36)
               .fillColor(darkText)
               .text(`${name} ${surname}`, 0, nameY, {
                   align: 'center',
                   width: pageWidth
               });
               
            // Elegant underline for name
            doc.moveTo(centerX - 200, nameY + 45)
               .lineTo(centerX + 200, nameY + 45)
               .lineWidth(1)
               .stroke(goldColor);
            
            // Program description
            doc.font('Helvetica')
               .fontSize(16)
               .fillColor(darkText)
               .text('for successful completion of the comprehensive', 0, 380, {
                   align: 'center',
                   width: pageWidth
               });
               
            doc.font('Helvetica-Bold')
               .fontSize(22)
               .fillColor(orangeColor)
               .text('Generative AI Training Program', 0, 405, {
                   align: 'center',
                   width: pageWidth
               })
               .font('Helvetica-Bold')
               .fontSize(18)
               .fillColor(darkText)
               .text('for Technical Professionals', 0, 435, {
                   align: 'center',
                   width: pageWidth
               });
            
            // Achievement description
            doc.font('Helvetica')
               .fontSize(12)
               .fillColor(lightText)
               .text('This program demonstrates expertise in developing AI applications within', 0, 470, {
                   align: 'center',
                   width: pageWidth
               })
               .text('regulated environments, adherence to industry best practices, and', 0, 485, {
                   align: 'center',
                   width: pageWidth
               })
               .text('alignment with Swedbank\'s professional standards and guidelines.', 0, 500, {
                   align: 'center',
                   width: pageWidth
               });
            
            // Date section with elegant formatting
            const dateText = new Date(completionDate).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            
            const dateY = 540;
            
            // Decorative elements around date
            doc.moveTo(centerX - 120, dateY + 15)
               .quadraticCurveTo(centerX - 80, dateY + 10, centerX - 40, dateY + 15)
               .lineWidth(1)
               .stroke(goldColor);
            
            doc.moveTo(centerX + 40, dateY + 15)
               .quadraticCurveTo(centerX + 80, dateY + 10, centerX + 120, dateY + 15)
               .lineWidth(1)
               .stroke(goldColor);
            
            doc.font('Helvetica')
               .fontSize(14)
               .fillColor(darkText)
               .text(`Completed on ${dateText}`, 0, dateY, {
                   align: 'center',
                   width: pageWidth
               });
            
            // Certificate ID at bottom right - elegant and discrete
            doc.font('Helvetica')
               .fontSize(8)
               .fillColor('#AAAAAA')
               .text(`Certificate ID: ${certificateId}`, 0, pageHeight - 40, {
                   align: 'center',
                   width: pageWidth
               });

            doc.end();

        } catch (error) {
            reject(error);
        }
    });
}

module.exports = { generateCertificatePDF };