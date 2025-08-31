const { Resend } = require('resend');

class EmailService {
    constructor() {
        // Get API key from environment variable
        const apiKey = process.env.RESEND_API_KEY;
        
        if (!apiKey) {
            console.warn('Resend API key not found. Email sending disabled.');
            this.isConfigured = false;
            return;
        }
        
        try {
            this.resend = new Resend(apiKey);
            this.fromEmail = process.env.SENDER_EMAIL || 'onboarding@resend.dev';
            this.isConfigured = true;
            console.log('Email service initialized with sender:', this.fromEmail);
        } catch (error) {
            console.error('Failed to initialize email service:', error);
            this.isConfigured = false;
        }
    }

    async sendCertificateEmails(certificateData, pdfBuffer) {
        if (!this.isConfigured) {
            console.log('Email service not configured, skipping email send');
            return { sent: false, reason: 'Email service not configured' };
        }

        const results = {
            recipientSent: false,
            managerSent: false,
            errors: []
        };

        try {
            // Convert PDF buffer to base64 for attachment
            const pdfBase64 = pdfBuffer ? pdfBuffer.toString('base64') : null;
            const attachments = pdfBase64 ? [{
                filename: `certificate_${certificateData.name}_${certificateData.surname}.pdf`,
                content: pdfBase64
            }] : [];

            // Send to recipient
            try {
                const recipientEmail = await this.resend.emails.send({
                    from: this.fromEmail,
                    to: certificateData.recipientEmail,
                    subject: `Congratulations ${certificateData.name}! Your Certificate is Ready`,
                    html: this.getRecipientEmailTemplate(certificateData),
                    attachments: attachments
                });
                
                console.log('Email sent to recipient:', recipientEmail.data?.id);
                results.recipientSent = true;
            } catch (error) {
                console.error('Failed to send email to recipient:', error);
                results.errors.push(`Recipient email failed: ${error.message}`);
            }

            // Send to manager
            try {
                const managerEmail = await this.resend.emails.send({
                    from: this.fromEmail,
                    to: certificateData.managerEmail,
                    subject: `Certificate Issued: ${certificateData.name} ${certificateData.surname}`,
                    html: this.getManagerEmailTemplate(certificateData),
                    attachments: attachments
                });
                
                console.log('Email sent to manager:', managerEmail.data?.id);
                results.managerSent = true;
            } catch (error) {
                console.error('Failed to send email to manager:', error);
                results.errors.push(`Manager email failed: ${error.message}`);
            }

            return {
                sent: results.recipientSent || results.managerSent,
                recipientSent: results.recipientSent,
                managerSent: results.managerSent,
                errors: results.errors
            };

        } catch (error) {
            console.error('Error sending certificate emails:', error);
            return {
                sent: false,
                error: error.message
            };
        }
    }

    getRecipientEmailTemplate(certificateData) {
        const completionDate = new Date(certificateData.completionDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        return `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0;">🎉 Congratulations!</h1>
                </div>
                
                <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                    <h2 style="color: #333;">Dear ${certificateData.name} ${certificateData.surname},</h2>
                    
                    <p style="color: #666; line-height: 1.6;">
                        We are pleased to inform you that your certificate has been successfully generated 
                        for completing the GenAI Certificate Program on ${completionDate}.
                    </p>
                    
                    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 5px 0;"><strong>Certificate ID:</strong> ${certificateData.certificateId}</p>
                        <p style="margin: 5px 0;"><strong>Issue Date:</strong> ${new Date().toLocaleDateString()}</p>
                        <p style="margin: 5px 0;"><strong>Completion Date:</strong> ${completionDate}</p>
                    </div>
                    
                    <p style="color: #666; line-height: 1.6;">
                        Your certificate is attached to this email as a PDF document. 
                        Please keep it for your records.
                    </p>
                    
                    <p style="color: #666; line-height: 1.6;">
                        If you have any questions, please don't hesitate to contact us.
                    </p>
                    
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                    
                    <p style="color: #999; font-size: 12px; text-align: center;">
                        This is an automated message from the GenAI Certificate Program.<br>
                        Please do not reply to this email.
                    </p>
                </div>
            </div>
        `;
    }

    getManagerEmailTemplate(certificateData) {
        const completionDate = new Date(certificateData.completionDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        return `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #1976d2; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h2 style="color: white; margin: 0;">Certificate Notification</h2>
                </div>
                
                <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                    <h3 style="color: #333;">Certificate Issued</h3>
                    
                    <p style="color: #666; line-height: 1.6;">
                        This is to notify you that a certificate has been issued to:
                    </p>
                    
                    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 5px 0;"><strong>Recipient:</strong> ${certificateData.name} ${certificateData.surname}</p>
                        <p style="margin: 5px 0;"><strong>Email:</strong> ${certificateData.recipientEmail}</p>
                        <p style="margin: 5px 0;"><strong>Certificate ID:</strong> ${certificateData.certificateId}</p>
                        <p style="margin: 5px 0;"><strong>Completion Date:</strong> ${completionDate}</p>
                        <p style="margin: 5px 0;"><strong>Issue Date:</strong> ${new Date().toLocaleDateString()}</p>
                    </div>
                    
                    <p style="color: #666; line-height: 1.6;">
                        A copy of the certificate is attached for your records.
                    </p>
                    
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                    
                    <p style="color: #999; font-size: 12px; text-align: center;">
                        This is an automated notification from the GenAI Certificate Program.<br>
                        Generated on ${new Date().toLocaleString()}
                    </p>
                </div>
            </div>
        `;
    }

    // Test email function for debugging
    async sendTestEmail(toEmail) {
        if (!this.isConfigured) {
            return { success: false, error: 'Email service not configured' };
        }

        try {
            const result = await this.resend.emails.send({
                from: this.fromEmail,
                to: toEmail,
                subject: 'Test Email - Certificate System',
                html: '<p>This is a test email from the certificate generation system. If you received this, email integration is working correctly!</p>'
            });

            return { success: true, id: result.data?.id };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

module.exports = new EmailService();