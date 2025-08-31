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
            
            // Add oak leaves background - full height, positioned naturally across right side
            try {
                const bgImagePath = path.join(__dirname, 'oak-leaves-bg.jpg');
                if (fs.existsSync(bgImagePath)) {
                    // Add background image with full height, starting from center-right
                    doc.save();
                    // Create clipping region for the right portion - wider area
                    doc.rect(pageWidth * 0.4, 0, pageWidth * 0.6, pageHeight)
                       .clip();
                    
                    // Position image to take full height, positioned more to the left for natural look
                    doc.opacity(0.7)  // Reduced transparency for better visual impact
                       .image(bgImagePath, pageWidth * 0.25, 0, {
                        width: pageWidth * 0.75,  // Wider coverage
                        height: pageHeight,
                        cover: [pageWidth * 0.75, pageHeight]  // Cover to maintain aspect ratio
                    });
                    doc.opacity(1);  // Reset opacity
                    doc.restore();
                }
            } catch (imgError) {
                console.log('Could not add background image:', imgError);
            }
            
            // Add white semi-transparent overlay on left side for better text readability
            doc.save();
            doc.rect(0, 0, pageWidth * 0.55, pageHeight)
               .fill('white')
               .opacity(0.92);  // Slightly more transparent to let some background show through
            doc.restore();
            
            // Draw double border frame AFTER background
            // Outer border with orange section on right
            doc.rect(30, 30, pageWidth - 60, pageHeight - 60)
               .lineWidth(3)
               .stroke(orangeColor);
            
            // Inner border
            doc.rect(40, 40, pageWidth - 80, pageHeight - 80)
               .lineWidth(1)
               .stroke(orangeColor);
            
            // Add vertical orange accent line to separate text from image
            doc.rect(pageWidth * 0.57, 30, 2, pageHeight - 60)
               .fill(orangeColor);
            
            // DIPLOMA title - positioned in left content area
            const contentWidth = pageWidth * 0.6;
            const leftMargin = 50;
            
            doc.font('Helvetica-Bold')
               .fontSize(48)
               .fillColor(darkText)
               .text('DIPLOMA', leftMargin, 100, { 
                   align: 'center',
                   width: contentWidth
               });
            
            // Subtitle
            doc.font('Helvetica')
               .fontSize(18)
               .fillColor(darkText)
               .text('for successful completion of', leftMargin, 170, { 
                   align: 'center',
                   width: contentWidth
               });
            
            // Program name - adjusted for better fit
            doc.font('Helvetica-Bold')
               .fontSize(28)
               .fillColor(darkText)
               .text('Gen AI Training for', leftMargin, 200, { 
                   align: 'center',
                   width: contentWidth
               })
               .text('Technical Professionals', leftMargin, 235, { 
                   align: 'center',
                   width: contentWidth
               });
            
            // Description paragraph - in left content area
            doc.font('Helvetica')
               .fontSize(12)
               .fillColor(darkText)
               .text('Completion of this program demonstrates technical', leftMargin, 275, {
                   align: 'center',
                   width: contentWidth
               })
               .text('expertise in developing Generative AI applications', leftMargin, 292, {
                   align: 'center',
                   width: contentWidth
               })
               .text('within highly regulated environments, adherence to', leftMargin, 309, {
                   align: 'center',
                   width: contentWidth
               })
               .text('best practices in the financial industry, and alignment', leftMargin, 326, {
                   align: 'center',
                   width: contentWidth
               })
               .text('with Swedbank\'s standards and guidelines.', leftMargin, 343, {
                   align: 'center',
                   width: contentWidth
               });
            
            // Certificate presented to
            doc.fontSize(16)
               .fillColor(darkText)
               .text('This certificate is proudly presented to', leftMargin, 380, {
                   align: 'center',
                   width: contentWidth
               });
            
            // Recipient name
            doc.font('Helvetica-Bold')
               .fontSize(32)
               .fillColor(darkText)
               .text(`${name.toUpperCase()} ${surname.toUpperCase()}`, leftMargin, 410, {
                   align: 'center',
                   width: contentWidth
               });
            
            // Date with decorative elements - in left content area
            const dateText = new Date(completionDate).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            
            // Decorative swirls around date - positioned for left content area
            const dateY = 465;
            const centerX = leftMargin + contentWidth / 2;
            
            doc.moveTo(centerX - 80, dateY + 10)
               .quadraticCurveTo(centerX - 50, dateY + 5, centerX - 20, dateY + 10)
               .stroke(orangeColor);
            
            doc.moveTo(centerX + 20, dateY + 10)
               .quadraticCurveTo(centerX + 50, dateY + 5, centerX + 80, dateY + 10)
               .stroke(orangeColor);
            
            doc.font('Helvetica')
               .fontSize(16)
               .fillColor(darkText)
               .text(dateText, leftMargin, dateY, {
                   align: 'center',
                   width: contentWidth
               });
            
            // Add Swedbank logo - positioned in left portion
            try {
                const logoPath = path.join(__dirname, 'swedbank-logo.png');
                if (fs.existsSync(logoPath)) {
                    // Add the actual Swedbank logo in the text area (left side)
                    // Position it in the center of the left content area
                    const logoWidth = 180;
                    const logoHeight = 45;
                    const logoX = (pageWidth * 0.6 - logoWidth) / 2;  // Center in left content area
                    
                    doc.image(logoPath, logoX, 505, {
                        width: logoWidth,
                        height: logoHeight,
                        fit: [logoWidth, logoHeight]
                    });
                } else {
                    // Fallback to text if logo not found
                    doc.font('Helvetica-Bold')
                       .fontSize(24)
                       .fillColor(orangeColor)
                       .text('Swedbank', 50, 510, {
                           align: 'center',
                           width: pageWidth * 0.6
                       });
                }
            } catch (logoError) {
                console.log('Could not add logo:', logoError);
                // Fallback to text
                doc.font('Helvetica-Bold')
                   .fontSize(24)
                   .fillColor(orangeColor)
                   .text('Swedbank', 50, 510, {
                       align: 'center',
                       width: pageWidth * 0.6
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