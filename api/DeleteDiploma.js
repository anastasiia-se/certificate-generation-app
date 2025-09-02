const { app } = require('@azure/functions');
const tableStorage = require('./shared/tableStorage');
const blobStorage = require('./shared/blobStorage');

app.http('DeleteDiploma', {
    methods: ['DELETE'],
    authLevel: 'anonymous',
    route: 'diplomas/{diplomaId}',
    handler: async (request, context) => {
        try {
            const diplomaId = request.params.diplomaId;
            
            if (!diplomaId) {
                return {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        success: false,
                        message: 'Diploma ID is required'
                    })
                };
            }

            context.log('Deleting diploma:', diplomaId);

            // First, try to get the diploma record to check if it exists
            let diplomaRecord = null;
            try {
                diplomaRecord = await tableStorage.getCertificateById(diplomaId);
            } catch (error) {
                context.log('Diploma not found in table storage:', diplomaId);
                return {
                    status: 404,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        success: false,
                        message: 'Diploma not found'
                    })
                };
            }

            // Delete from blob storage if PDF exists
            if (diplomaRecord && diplomaRecord.certificatePath) {
                try {
                    await blobStorage.deletePDF(diplomaId);
                    context.log('PDF deleted from blob storage:', diplomaId);
                } catch (blobError) {
                    context.log.warn('Failed to delete PDF from blob storage:', blobError.message);
                    // Continue with table deletion even if blob deletion fails
                }
            }

            // Delete from table storage
            await tableStorage.deleteCertificate(diplomaId);
            context.log('Diploma record deleted from table storage:', diplomaId);

            return {
                status: 200,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    success: true,
                    message: 'Diploma deleted successfully',
                    diplomaId: diplomaId
                })
            };

        } catch (error) {
            context.log.error('Error deleting diploma:', error);
            context.log.error('Error stack:', error.stack);
            
            return {
                status: 500,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    success: false,
                    message: 'Internal server error',
                    error: error.message
                })
            };
        }
    }
});