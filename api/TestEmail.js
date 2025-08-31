const { app } = require('@azure/functions');

app.http('TestEmail', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    route: 'test-email',
    handler: async (request, context) => {
        try {
            context.log('Testing email service initialization...');
            
            // Check environment variables
            const hasApiKey = !!process.env.RESEND_API_KEY;
            const hasSenderEmail = !!process.env.SENDER_EMAIL;
            
            // Try to load the email service
            let emailServiceLoaded = false;
            let emailServiceError = null;
            let emailServiceConfigured = false;
            
            try {
                const emailService = require('./shared/emailService');
                emailServiceLoaded = true;
                emailServiceConfigured = emailService.isConfigured;
                context.log('Email service loaded. Configured:', emailServiceConfigured);
            } catch (error) {
                emailServiceError = error.message;
                context.log('Failed to load email service:', error);
            }
            
            // If POST with email, try sending test
            let testResult = null;
            if (request.method === 'POST' && emailServiceLoaded) {
                const body = await request.json();
                if (body.email) {
                    const emailService = require('./shared/emailService');
                    testResult = await emailService.sendTestEmail(body.email);
                }
            }
            
            return {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    environment: {
                        hasApiKey,
                        hasSenderEmail,
                        apiKeyLength: process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.length : 0,
                        senderEmail: process.env.SENDER_EMAIL
                    },
                    emailService: {
                        loaded: emailServiceLoaded,
                        configured: emailServiceConfigured,
                        error: emailServiceError
                    },
                    testResult,
                    timestamp: new Date().toISOString()
                })
            };
            
        } catch (error) {
            context.log.error('Test email endpoint error:', error);
            
            return {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    error: error.message,
                    stack: error.stack
                })
            };
        }
    }
});