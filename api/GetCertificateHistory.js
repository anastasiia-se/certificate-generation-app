const { app } = require('@azure/functions');
const tableStorage = require('./shared/tableStorage');

app.http('GetCertificateHistory', {
    methods: ['GET'],
    authLevel: 'anonymous', 
    route: 'GetCertificateHistory',
    handler: async (request, context) => {
        try {
            // Get all certificates from Table Storage
            const certificates = await tableStorage.getAllCertificates();
            
            // Return actual stored certificates (sorted by newest first)
            return {
                status: 200,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(certificates)
            };

        } catch (error) {
            context.log.error('Error fetching certificate history:', error);
            
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
