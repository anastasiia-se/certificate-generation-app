const { app } = require('@azure/functions');
const tableStorage = require('./shared/tableStorage');
const { generateCertificatePDF } = require('./shared/pdfGenerator');
const blobStorage = require('./shared/blobStorage');
const emailService = require('./shared/emailService');

app.http('GenerateCertificate', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'GenerateCertificate',
    handler: async (request, context) => {
        try {
            const data = await request.json();
            
            // Validate required fields
            const { name, surname, recipientEmail, managerEmail, completionDate } = data;
            
            if (!name || !surname || !recipientEmail || !managerEmail || !completionDate) {
                return {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        success: false,
                        message: 'Missing required fields'
                    })
                };
            }

            // Generate diploma ID
            const certificateId = `diploma_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            // Create certificate record
            const certificateRecord = {
                certificateId,
                name,
                surname,
                recipientEmail,
                managerEmail,
                completionDate,
                sentDate: new Date().toISOString(),
                emailSent: true, // Simulated for now
                certificatePath: `diplomas/${certificateId}.pdf`
            };

            // Generate PDF diploma
            let pdfUrl = null;
            let pdfBuffer = null;
            try {
                pdfBuffer = await generateCertificatePDF({
                    name,
                    surname,
                    completionDate,
                    certificateId
                });
                
                // Upload to Azure Blob Storage
                pdfUrl = await blobStorage.uploadPDF(certificateId, pdfBuffer);
                certificateRecord.certificatePath = pdfUrl || `diplomas/${certificateId}.pdf`;
                
                context.log('PDF generated and uploaded:', certificateId);
            } catch (pdfError) {
                context.log.error('Error generating/uploading PDF:', pdfError);
                // Continue without PDF - don't fail the entire request
                certificateRecord.certificatePath = null;
            }

            // Store in Azure Table Storage
            await tableStorage.addCertificate(certificateRecord);

            // Send emails with the diploma
            let emailResult = { sent: false };
            if (pdfBuffer) {
                try {
                    emailResult = await emailService.sendDiplomaEmails(certificateRecord, pdfBuffer);
                    
                    if (emailResult.sent) {
                        // Update the record with actual email status
                        certificateRecord.emailSent = true;
                        await tableStorage.updateCertificate(certificateId, { emailSent: true });
                        context.log('Emails sent successfully for diploma:', certificateId);
                    } else {
                        context.log('Email sending failed:', emailResult.errors);
                    }
                } catch (emailError) {
                    context.log.error('Error sending emails:', emailError);
                    // Don't fail the entire request if email fails
                }
            }
            
            context.log('Diploma generated:', certificateId);

            return {
                status: 200,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    success: true,
                    message: 'Diploma generated successfully',
                    certificateId,
                    certificateUrl: `https://certificate-functions-app-77132.azurewebsites.net/api/diplomas/${certificateId}`,
                    emailSent: emailResult.sent,
                    emailDetails: emailResult.sent ? {
                        recipientSent: emailResult.recipientSent,
                        managerSent: emailResult.managerSent
                    } : null
                })
            };

        } catch (error) {
            context.log.error('Error generating diploma:', error);
            context.log.error('Error stack:', error.stack);
            
            return {
                status: 500,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    success: false,
                    message: 'Internal server error',
                    error: error.message,
                    details: process.env.NODE_ENV !== 'production' ? error.stack : undefined
                })
            };
        }
    }
});
