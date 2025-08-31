const { app } = require('@azure/functions');
const certificateStore = require('./shared/certificateStore');
const blobStorage = require('./shared/blobStorage');

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

            // Download PDF from Blob Storage
            let pdfBuffer;
            try {
                pdfBuffer = await blobStorage.downloadPDF(certificateId);
            } catch (downloadError) {
                context.log.error('Error downloading PDF:', downloadError);
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