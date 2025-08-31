const { app } = require('@azure/functions');

app.http('TestTableStorage', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'test-table',
    handler: async (request, context) => {
        try {
            const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
            
            if (!connectionString) {
                return {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        success: false,
                        message: 'No connection string found'
                    })
                };
            }
            
            // Try to import and use the library
            const { TableClient } = require('@azure/data-tables');
            const tableClient = TableClient.fromConnectionString(connectionString, 'certificates');
            
            // Try to create a test entity
            const testEntity = {
                partitionKey: 'TEST',
                rowKey: 'test-' + Date.now(),
                testField: 'Hello World',
                timestamp: new Date().toISOString()
            };
            
            await tableClient.createEntity(testEntity);
            
            return {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    success: true,
                    message: 'Table Storage test successful',
                    connectionFound: true,
                    libraryLoaded: true,
                    entityCreated: true
                })
            };
            
        } catch (error) {
            context.log.error('Table Storage test error:', error);
            
            return {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    success: false,
                    error: error.message,
                    stack: error.stack
                })
            };
        }
    }
});