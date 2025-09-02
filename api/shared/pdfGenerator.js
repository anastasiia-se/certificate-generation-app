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

            // State-of-the-art diploma design with Swedbank elements
            const { name, surname, completionDate, certificateId } = certificateData;
            const pageWidth = doc.page.width;
            const pageHeight = doc.page.height;
            const orangeColor = '#FF6B35'; // Swedbank orange
            const darkText = '#2C2C2C';
            const lightText = '#666666';
            const centerX = pageWidth / 2;
            
            // Green oak leaves frame - 1.5cm (approximately 43 points) thick border
            const frameWidth = 43; // 1.5cm in points
            try {
                const bgImagePath = path.join(__dirname, 'oak-leaves-bg.jpg');
                if (fs.existsSync(bgImagePath)) {
                    doc.save();
                    
                    // Top frame
                    doc.rect(0, 0, pageWidth, frameWidth).clip();
                    doc.image(bgImagePath, 0, 0, {
                        width: pageWidth,
                        height: frameWidth * 2,
                        cover: [pageWidth, frameWidth * 2]
                    });
                    doc.restore();
                    
                    // Bottom frame
                    doc.save();
                    doc.rect(0, pageHeight - frameWidth, pageWidth, frameWidth).clip();
                    doc.image(bgImagePath, 0, pageHeight - frameWidth * 2, {
                        width: pageWidth,
                        height: frameWidth * 2,
                        cover: [pageWidth, frameWidth * 2]
                    });
                    doc.restore();
                    
                    // Left frame
                    doc.save();
                    doc.rect(0, 0, frameWidth, pageHeight).clip();
                    doc.image(bgImagePath, 0, 0, {
                        width: frameWidth * 2,
                        height: pageHeight,
                        cover: [frameWidth * 2, pageHeight]
                    });
                    doc.restore();
                    
                    // Right frame
                    doc.save();
                    doc.rect(pageWidth - frameWidth, 0, frameWidth, pageHeight).clip();
                    doc.image(bgImagePath, pageWidth - frameWidth * 2, 0, {
                        width: frameWidth * 2,
                        height: pageHeight,
                        cover: [frameWidth * 2, pageHeight]
                    });
                    doc.restore();
                }
            } catch (imgError) {
                console.log('Could not add background frame:', imgError);
            }
            
            // White center area for content
            doc.rect(frameWidth, frameWidth, pageWidth - frameWidth * 2, pageHeight - frameWidth * 2)
               .fill('white');
            
            // Elegant inner border
            doc.rect(frameWidth + 10, frameWidth + 10, pageWidth - frameWidth * 2 - 20, pageHeight - frameWidth * 2 - 20)
               .lineWidth(2)
               .stroke(orangeColor);
            
            // Header section with Swedbank logo
            const contentTop = frameWidth + 30; // Start content below frame
            try {
                const logoPath = path.join(__dirname, 'swedbank-logo.png');
                if (fs.existsSync(logoPath)) {
                    const logoWidth = 180;
                    const logoHeight = 45;
                    doc.image(logoPath, centerX - logoWidth/2, contentTop + 10, {
                        width: logoWidth,
                        height: logoHeight,
                        fit: [logoWidth, logoHeight]
                    });
                } else {
                    // Fallback to text logo
                    doc.font('Helvetica-Bold')
                       .fontSize(28)
                       .fillColor(orangeColor)
                       .text('Swedbank', frameWidth, contentTop + 15, {
                           align: 'center',
                           width: pageWidth - frameWidth * 2
                       });
                }
            } catch (logoError) {
                console.log('Could not add logo:', logoError);
            }
            
            // DIPLOMA - elegant title
            doc.font('Helvetica')
               .fontSize(52)
               .fillColor(darkText)
               .text('DIPLOMA', frameWidth, contentTop + 70, { 
                   align: 'center',
                   width: pageWidth - frameWidth * 2,
                   characterSpacing: 5
               });
            
            // Decorative line under title
            const lineY = contentTop + 145;
            doc.moveTo(centerX - 120, lineY)
               .lineTo(centerX - 40, lineY)
               .lineWidth(2)
               .stroke(orangeColor);
               
            doc.moveTo(centerX + 40, lineY)
               .lineTo(centerX + 120, lineY)
               .lineWidth(2)
               .stroke(orangeColor);
               
            // Center decorative element - oak leaf circle
            doc.circle(centerX, lineY, 6)
               .fill(orangeColor);
            
            // Presentation text
            doc.font('Helvetica')
               .fontSize(15)
               .fillColor(darkText)
               .text('This diploma is proudly presented to', frameWidth, contentTop + 170, {
                   align: 'center',
                   width: pageWidth - frameWidth * 2
               });
            
            // Recipient name with elegant underline
            const nameY = contentTop + 200;
            doc.font('Times-Bold')
               .fontSize(34)
               .fillColor(darkText)
               .text(`${name} ${surname}`, frameWidth, nameY, {
                   align: 'center',
                   width: pageWidth - frameWidth * 2
               });
               
            // Elegant underline for name
            doc.moveTo(centerX - 180, nameY + 40)
               .lineTo(centerX + 180, nameY + 40)
               .lineWidth(1)
               .stroke(orangeColor);
            
            // Program description
            doc.font('Helvetica')
               .fontSize(15)
               .fillColor(darkText)
               .text('for successful completion of the comprehensive', frameWidth, contentTop + 260, {
                   align: 'center',
                   width: pageWidth - frameWidth * 2
               });
               
            doc.font('Helvetica-Bold')
               .fontSize(20)
               .fillColor(orangeColor)
               .text('Gen AI Training for Technical Professionals', frameWidth, contentTop + 285, {
                   align: 'center',
                   width: pageWidth - frameWidth * 2
               });
            
            // Achievement description
            doc.font('Helvetica')
               .fontSize(11)
               .fillColor(lightText)
               .text('This program demonstrates expertise in developing AI applications within', frameWidth, contentTop + 320, {
                   align: 'center',
                   width: pageWidth - frameWidth * 2
               })
               .text('regulated environments, adherence to industry best practices, and', frameWidth, contentTop + 335, {
                   align: 'center',
                   width: pageWidth - frameWidth * 2
               })
               .text('alignment with Swedbank\'s professional standards and guidelines.', frameWidth, contentTop + 350, {
                   align: 'center',
                   width: pageWidth - frameWidth * 2
               });
            
            // Date section with elegant formatting
            const dateText = new Date(completionDate).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            
            const dateY = contentTop + 380;
            
            // Simple date without overlapping decorative lines
            doc.font('Helvetica')
               .fontSize(13)
               .fillColor(darkText)
               .text(`Completed on ${dateText}`, frameWidth, dateY, {
                   align: 'center',
                   width: pageWidth - frameWidth * 2
               });
            
            // Diploma ID at bottom - elegant and discrete
            doc.font('Helvetica')
               .fontSize(8)
               .fillColor('#999999')
               .text(`Diploma ID: ${certificateId}`, frameWidth, pageHeight - frameWidth - 20, {
                   align: 'center',
                   width: pageWidth - frameWidth * 2
               });

            doc.end();

        } catch (error) {
            reject(error);
        }
    });
}

module.exports = { generateCertificatePDF };