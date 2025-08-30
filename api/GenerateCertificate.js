const { app } = require('@azure/functions');
const certificateStore = require('./shared/certificateStore');

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

            // Generate certificate ID
            const certificateId = `cert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
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
                certificatePath: `certificates/${certificateId}.pdf`
            };

            // Store in memory (replace with Cosmos DB)
            certificateStore.addCertificate(certificateRecord);

            // TODO: Generate actual PDF certificate
            // TODO: Send emails using SendGrid
            
            context.log('Certificate generated:', certificateId);

            return {
                status: 200,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    success: true,
                    message: 'Certificate generated successfully',
                    certificateId,
                    certificateUrl: `https://example.com/certificates/${certificateId}.pdf`,
                    emailSent: true
                })
            };

        } catch (error) {
            context.log.error('Error generating certificate:', error);
            
            return {
                status: 500,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    success: false,
                    message: 'Internal server error'
                })
            };
        }
    }
});
