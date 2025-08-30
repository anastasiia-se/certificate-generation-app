const { app } = require('@azure/functions');
const certificateStore = require('./shared/certificateStore');
const fs = require('fs');
const path = require('path');

app.http('GetCertificate', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'certificates/{certificateId}',
    handler: async (request, context) => {
        try {
            const certificateId = request.params.certificateId;
            
            // Find certificate in store
            const certificate = certificateStore.getCertificateById(certificateId);
            
            if (!certificate) {
                return {
                    status: 404,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        success: false,
                        message: 'Certificate not found'
                    })
                };
            }

            // Check if PDF file exists
            const pdfPath = certificate.certificatePath;
            if (!fs.existsSync(pdfPath)) {
                return {
                    status: 404,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        success: false,
                        message: 'Certificate file not found'
                    })
                };
            }

            // Read and return PDF file
            const pdfBuffer = fs.readFileSync(pdfPath);
            
            return {
                status: 200,
                headers: {
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': `attachment; filename="${certificate.name}_${certificate.surname}_certificate.pdf"`
                },
                body: pdfBuffer
            };

        } catch (error) {
            context.log.error('Error downloading certificate:', error);
            
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