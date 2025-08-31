const { app } = require('@azure/functions');
const tableStorage = require('./shared/tableStorage');
const blobStorage = require('./shared/blobStorage');

app.http('GetCertificate', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'certificates/{certificateId}',
    handler: async (request, context) => {
        try {
            const certificateId = request.params.certificateId;
            
            // Find certificate in Table Storage
            const certificate = await tableStorage.getCertificateById(certificateId);
            
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
                
                if (!pdfBuffer) {
                    throw new Error('PDF buffer is empty');
                }
            } catch (downloadError) {
                context.log.error('Error downloading PDF:', downloadError);
                
                // Return more detailed error for debugging
                const errorMessage = downloadError.message || 'Certificate file not found';
                const statusCode = downloadError.statusCode === 404 ? 404 : 500;
                
                return {
                    status: statusCode,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        success: false,
                        message: `Failed to download certificate: ${errorMessage}`,
                        certificateId: certificateId
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