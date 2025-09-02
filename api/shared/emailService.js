// Try different import approaches for compatibility
let Resend;
try {
    // Try named export first
    const resendModule = require('resend');
    Resend = resendModule.Resend || resendModule;
} catch (error) {
    console.error('Failed to load Resend module:', error);
    Resend = null;
}

class EmailService {
    constructor() {
        // Get API key from environment variable
        const apiKey = process.env.RESEND_API_KEY;
        
        if (!apiKey) {
            console.warn('Resend API key not found. Email sending disabled.');
            this.isConfigured = false;
            return;
        }
        
        if (!Resend) {
            console.error('Resend module not loaded properly');
            this.isConfigured = false;
            return;
        }
        
        try {
            // Handle both class and function exports
            if (typeof Resend === 'function') {
                this.resend = new Resend(apiKey);
            } else if (Resend.Resend) {
                this.resend = new Resend.Resend(apiKey);
            } else {
                console.error('Unexpected Resend module structure');
                this.isConfigured = false;
                return;
            }
            
            this.fromEmail = process.env.SENDER_EMAIL || 'onboarding@resend.dev';
            this.isConfigured = true;
            console.log('Email service initialized with sender:', this.fromEmail);
        } catch (error) {
            console.error('Failed to initialize email service:', error);
            this.isConfigured = false;
        }
    }

    async sendDiplomaEmails(certificateData, pdfBuffer) {
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
                filename: `diploma_${certificateData.name}_${certificateData.surname}.pdf`,
                content: pdfBase64
            }] : [];

            // Send to recipient
            try {
                const recipientEmail = await this.resend.emails.send({
                    from: this.fromEmail,
                    to: certificateData.recipientEmail,
                    subject: `Congratulations ${certificateData.name}! Your Diploma is Ready`,
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
                    subject: `Diploma Issued: ${certificateData.name} ${certificateData.surname}`,
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
            console.error('Error sending diploma emails:', error);
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
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: white; border: 1px solid #E0E0E0; border-radius: 8px; overflow: hidden;">
                <!-- Clean Header with Subtle Branding -->
                <div style="background: white; padding: 30px 40px; text-align: center; border-bottom: 3px solid #FF5F00;">
                    <div style="color: #FF5F00; font-size: 24px; font-weight: 700; margin-bottom: 8px;">Swedbank</div>
                    <h1 style="margin: 0; font-size: 28px; font-weight: 400; color: #2C2C2C;">🎓 Congratulations!</h1>
                    <p style="margin: 8px 0 0 0; font-size: 16px; color: #666; font-weight: 300;">Your Professional Training is Complete</p>
                </div>
                
                <div style="background: white; padding: 40px;">
                    <h2 style="color: #2C2C2C; margin: 0 0 25px 0; font-size: 20px; font-weight: 500;">
                        Dear ${certificateData.name} ${certificateData.surname},
                    </h2>
                    
                    <p style="color: #666; line-height: 1.8; margin: 0 0 25px 0; font-size: 16px;">
                        We are delighted to inform you that your diploma has been successfully generated 
                        for completing the <strong>Gen AI Training for Technical Professionals</strong> program on <strong>${completionDate}</strong>.
                    </p>
                    
                    <div style="background: #F8F9FA; padding: 25px; border-radius: 6px; margin: 30px 0; border: 1px solid #E9ECEF;">
                        <h3 style="color: #2C2C2C; margin: 0 0 20px 0; font-size: 16px; font-weight: 600; display: flex; align-items: center;">
                            <span style="display: inline-block; width: 4px; height: 20px; background: #FF5F00; margin-right: 10px; border-radius: 2px;"></span>
                            Diploma Details
                        </h3>
                        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                            <tr><td style="padding: 10px 0; color: #666; font-weight: 500; width: 140px;">Diploma ID:</td><td style="padding: 10px 0; color: #2C2C2C; font-weight: 600;">${certificateData.certificateId}</td></tr>
                            <tr><td style="padding: 10px 0; color: #666; font-weight: 500;">Issue Date:</td><td style="padding: 10px 0; color: #2C2C2C; font-weight: 600;">${new Date().toLocaleDateString()}</td></tr>
                            <tr><td style="padding: 10px 0; color: #666; font-weight: 500;">Completion Date:</td><td style="padding: 10px 0; color: #2C2C2C; font-weight: 600;">${completionDate}</td></tr>
                            <tr><td style="padding: 10px 0; color: #666; font-weight: 500;">Program:</td><td style="padding: 10px 0; color: #2C2C2C; font-weight: 600;">Gen AI Training for Technical Professionals</td></tr>
                        </table>
                    </div>
                    
                    <div style="background: #F0F8FF; padding: 20px; border-radius: 6px; margin: 25px 0; border-left: 4px solid #4A90E2;">
                        <p style="color: #2C5282; line-height: 1.6; margin: 0; font-size: 14px;">
                            <strong>📎 Attachment:</strong> Your professional diploma is attached as a PDF document. 
                            Please download and keep it for your records and future reference.
                        </p>
                    </div>
                    
                    <div style="background: #F9FDF7; padding: 20px; border-radius: 6px; margin: 25px 0; border-left: 4px solid #22C55E;">
                        <p style="color: #166534; line-height: 1.6; margin: 0; font-size: 14px;">
                            <strong>🏆 Achievement:</strong> You have successfully demonstrated expertise in developing 
                            Generative AI applications within regulated environments, adhering to industry best practices.
                        </p>
                    </div>
                    
                    <p style="color: #666; line-height: 1.8; margin: 30px 0 0 0; font-size: 15px;">
                        If you have any questions regarding your diploma or the program, please don't hesitate to contact our team at 
                        <a href="mailto:ai.learning@swedbank.se" style="color: #FF5F00; text-decoration: none; font-weight: 500;">ai.learning@swedbank.se</a>
                    </p>
                </div>
                
                <!-- Clean Footer -->
                <div style="background: #F8F9FA; padding: 25px; text-align: center; border-top: 1px solid #E9ECEF;">
                    <div style="color: #FF5F00; font-size: 16px; font-weight: 600; margin-bottom: 8px;">Swedbank</div>
                    <p style="color: #6C757D; font-size: 12px; margin: 0; line-height: 1.5;">
                        This is an automated message from the Gen AI Training for Technical Professionals program.<br>
                        Generated on ${new Date().toLocaleString()}
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
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: white; border: 1px solid #E0E0E0; border-radius: 8px; overflow: hidden;">
                <!-- Professional Header for Manager -->
                <div style="background: white; padding: 30px 40px; text-align: center; border-bottom: 3px solid #FF5F00;">
                    <div style="color: #FF5F00; font-size: 24px; font-weight: 700; margin-bottom: 8px;">Swedbank</div>
                    <h1 style="margin: 0; font-size: 26px; font-weight: 400; color: #2C2C2C;">📋 Diploma Notification</h1>
                    <p style="margin: 8px 0 0 0; font-size: 16px; color: #666; font-weight: 300;">Professional Training Completion Alert</p>
                </div>
                
                <div style="background: white; padding: 40px;">
                    <h3 style="color: #2C2C2C; margin: 0 0 25px 0; font-size: 20px; font-weight: 600;">
                        Diploma Successfully Issued
                    </h3>
                    
                    <p style="color: #666; line-height: 1.8; margin: 0 0 25px 0; font-size: 16px;">
                        This is to notify you that a professional diploma has been successfully issued to the following participant:
                    </p>
                    
                    <div style="background: #F8F9FA; padding: 25px; border-radius: 6px; margin: 30px 0; border: 1px solid #E9ECEF;">
                        <h4 style="color: #2C2C2C; margin: 0 0 20px 0; font-size: 16px; font-weight: 600; display: flex; align-items: center;">
                            <span style="display: inline-block; width: 4px; height: 20px; background: #FF5F00; margin-right: 10px; border-radius: 2px;"></span>
                            Participant Information
                        </h4>
                        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                            <tr><td style="padding: 10px 0; color: #666; font-weight: 500; width: 140px;">Recipient:</td><td style="padding: 10px 0; color: #2C2C2C; font-weight: 600;">${certificateData.name} ${certificateData.surname}</td></tr>
                            <tr><td style="padding: 10px 0; color: #666; font-weight: 500;">Email:</td><td style="padding: 10px 0; color: #2C2C2C; font-weight: 600;">${certificateData.recipientEmail}</td></tr>
                            <tr><td style="padding: 10px 0; color: #666; font-weight: 500;">Diploma ID:</td><td style="padding: 10px 0; color: #2C2C2C; font-weight: 600;">${certificateData.certificateId}</td></tr>
                            <tr><td style="padding: 10px 0; color: #666; font-weight: 500;">Program:</td><td style="padding: 10px 0; color: #2C2C2C; font-weight: 600;">Gen AI Training for Technical Professionals</td></tr>
                            <tr><td style="padding: 10px 0; color: #666; font-weight: 500;">Completion Date:</td><td style="padding: 10px 0; color: #2C2C2C; font-weight: 600;">${completionDate}</td></tr>
                            <tr><td style="padding: 10px 0; color: #666; font-weight: 500;">Issue Date:</td><td style="padding: 10px 0; color: #2C2C2C; font-weight: 600;">${new Date().toLocaleDateString()}</td></tr>
                        </table>
                    </div>
                    
                    <div style="background: #F0F8FF; padding: 20px; border-radius: 6px; margin: 25px 0; border-left: 4px solid #4A90E2;">
                        <p style="color: #2C5282; line-height: 1.6; margin: 0; font-size: 14px;">
                            <strong>📎 Attachment:</strong> A copy of the professional diploma is attached to this email for your records and documentation.
                        </p>
                    </div>
                    
                    <div style="background: #F9FDF7; padding: 20px; border-radius: 6px; margin: 25px 0; border-left: 4px solid #22C55E;">
                        <p style="color: #166534; line-height: 1.6; margin: 0; font-size: 14px;">
                            <strong>✅ Program Completed:</strong> The participant has successfully demonstrated expertise in developing 
                            Generative AI applications within regulated environments, meeting all Swedbank professional standards.
                        </p>
                    </div>
                    
                    <p style="color: #666; line-height: 1.8; margin: 30px 0 0 0; font-size: 15px;">
                        For any questions regarding this diploma or the training program, please contact our team at 
                        <a href="mailto:ai.learning@swedbank.se" style="color: #FF5F00; text-decoration: none; font-weight: 500;">ai.learning@swedbank.se</a>
                    </p>
                </div>
                
                <!-- Clean Footer -->
                <div style="background: #F8F9FA; padding: 25px; text-align: center; border-top: 1px solid #E9ECEF;">
                    <div style="color: #FF5F00; font-size: 16px; font-weight: 600; margin-bottom: 8px;">Swedbank</div>
                    <p style="color: #6C757D; font-size: 12px; margin: 0; line-height: 1.5;">
                        Automated notification from Gen AI Training for Technical Professionals<br>
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
                subject: 'Test Email - Diploma System',
                html: '<p>This is a test email from the diploma generation system. If you received this, email integration is working correctly!</p>'
            });

            return { success: true, id: result.data?.id };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

module.exports = new EmailService();