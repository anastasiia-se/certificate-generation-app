const { app } = require('@azure/functions');

// Import the same certificate store (in production, this would be Cosmos DB)
// For now, we'll simulate some data
const certificateStore = [];

app.http('GetCertificateHistory', {
    methods: ['GET'],
    authLevel: 'anonymous', 
    route: 'GetCertificateHistory',
    handler: async (request, context) => {
        try {
            // In production, fetch from Cosmos DB
            // For now, return mock data if store is empty
            if (certificateStore.length === 0) {
                const mockData = [
                    {
                        certificateId: 'cert_demo_1',
                        name: 'John',
                        surname: 'Doe',
                        recipientEmail: 'john.doe@example.com',
                        managerEmail: 'manager@example.com',
                        completionDate: '2024-01-15',
                        sentDate: '2024-01-15T10:30:00Z',
                        emailSent: true
                    },
                    {
                        certificateId: 'cert_demo_2', 
                        name: 'Jane',
                        surname: 'Smith',
                        recipientEmail: 'jane.smith@example.com',
                        managerEmail: 'manager@example.com',
                        completionDate: '2024-01-10',
                        sentDate: '2024-01-10T14:20:00Z',
                        emailSent: true
                    }
                ];
                
                return {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(mockData)
                };
            }

            // Return actual stored certificates (sorted by sent date, newest first)
            const sortedCertificates = certificateStore
                .sort((a, b) => new Date(b.sentDate) - new Date(a.sentDate));

            return {
                status: 200,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(sortedCertificates)
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
