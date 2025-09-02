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
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: white;">
                <!-- Swedbank Header with Oak Leaves -->
                <div style="background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%); height: 60px; background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 20" fill="rgba(255,255,255,0.1)"><path d="M10,5 Q15,0 20,5 Q25,10 20,15 Q15,20 10,15 Q5,10 10,5 M30,5 Q35,0 40,5 Q45,10 40,15 Q35,20 30,15 Q25,10 30,5 M50,5 Q55,0 60,5 Q65,10 60,15 Q55,20 50,15 Q45,10 50,5 M70,5 Q75,0 80,5 Q85,10 80,15 Q75,20 70,15 Q65,10 70,5"/></svg>'); background-size: cover; position: relative;">
                </div>
                
                <!-- Swedbank Orange Header -->
                <div style="background: #FF5F00; padding: 25px 30px; text-align: center; color: white;">
                    <h1 style="margin: 0; font-size: 28px; font-weight: 600;">🎓 Congratulations!</h1>
                    <p style="margin: 8px 0 0 0; font-size: 16px; opacity: 0.95;">Your Professional Training is Complete</p>
                </div>
                
                <div style="background: #FAFAFA; padding: 30px; border-left: 4px solid #FF5F00;">
                    <h2 style="color: #2C2C2C; margin: 0 0 20px 0; font-size: 22px; font-weight: 500;">
                        Dear ${certificateData.name} ${certificateData.surname},
                    </h2>
                    
                    <p style="color: #666; line-height: 1.7; margin: 0 0 20px 0; font-size: 15px;">
                        We are delighted to inform you that your <strong>diploma has been successfully generated</strong> 
                        for completing the <strong>Gen AI Training for Technical Professionals</strong> program on ${completionDate}.
                    </p>
                    
                    <div style="background: white; padding: 25px; border-radius: 8px; margin: 25px 0; border: 1px solid #E0E0E0; border-left: 4px solid #FF5F00;">
                        <h3 style="color: #FF5F00; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">Diploma Details</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr><td style="padding: 8px 0; color: #666; font-weight: 500;">Diploma ID:</td><td style="padding: 8px 0; color: #2C2C2C; font-weight: 600;">${certificateData.certificateId}</td></tr>
                            <tr><td style="padding: 8px 0; color: #666; font-weight: 500;">Issue Date:</td><td style="padding: 8px 0; color: #2C2C2C; font-weight: 600;">${new Date().toLocaleDateString()}</td></tr>
                            <tr><td style="padding: 8px 0; color: #666; font-weight: 500;">Completion Date:</td><td style="padding: 8px 0; color: #2C2C2C; font-weight: 600;">${completionDate}</td></tr>
                            <tr><td style="padding: 8px 0; color: #666; font-weight: 500;">Program:</td><td style="padding: 8px 0; color: #2C2C2C; font-weight: 600;">Gen AI Training for Technical Professionals</td></tr>
                        </table>
                    </div>
                    
                    <p style="color: #666; line-height: 1.7; margin: 20px 0; font-size: 15px;">
                        📎 Your <strong>professional diploma</strong> is attached to this email as a PDF document. 
                        Please download and keep it for your records and future reference.
                    </p>
                    
                    <div style="background: #FFF5F2; padding: 20px; border-radius: 8px; border-left: 4px solid #FF5F00; margin: 20px 0;">
                        <p style="color: #CC4C00; line-height: 1.6; margin: 0; font-size: 14px;">
                            <strong>🏆 Achievement Unlocked:</strong> You have successfully demonstrated expertise in developing 
                            Generative AI applications within regulated environments, adhering to industry best practices.
                        </p>
                    </div>
                    
                    <p style="color: #666; line-height: 1.7; margin: 20px 0 0 0; font-size: 15px;">
                        If you have any questions regarding your diploma or the program, please don't hesitate to contact our team.
                    </p>
                </div>
                
                <!-- Swedbank Footer -->
                <div style="background: #2C2C2C; padding: 20px 30px; text-align: center;">
                    <div style="color: #FF5F00; font-size: 18px; font-weight: 600; margin-bottom: 8px;">Swedbank</div>
                    <p style="color: #999; font-size: 12px; margin: 0; line-height: 1.5;">
                        This is an automated message from the Gen AI Training for Technical Professionals program.<br>
                        Professional Training Excellence • Regulated Environment Expertise<br>
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
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: white;">
                <!-- Manager Header -->
                <div style="background: #2C2C2C; padding: 25px 30px; text-align: center; color: white;">
                    <h2 style="margin: 0; font-size: 24px; font-weight: 600;">📋 Diploma Notification</h2>
                    <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.9;">Professional Training Completion Alert</p>
                </div>
                
                <div style="background: #FAFAFA; padding: 30px; border-left: 4px solid #FF5F00;">
                    <h3 style="color: #2C2C2C; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">
                        Diploma Successfully Issued
                    </h3>
                    
                    <p style="color: #666; line-height: 1.7; margin: 0 0 20px 0; font-size: 15px;">
                        This is to notify you that a <strong>professional diploma</strong> has been successfully issued to the following participant:
                    </p>
                    
                    <div style="background: white; padding: 25px; border-radius: 8px; margin: 25px 0; border: 1px solid #E0E0E0; border-left: 4px solid #FF5F00;">
                        <h4 style="color: #FF5F00; margin: 0 0 15px 0; font-size: 16px; font-weight: 600;">Participant Information</h4>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr><td style="padding: 8px 0; color: #666; font-weight: 500; width: 140px;">Recipient:</td><td style="padding: 8px 0; color: #2C2C2C; font-weight: 600;">${certificateData.name} ${certificateData.surname}</td></tr>
                            <tr><td style="padding: 8px 0; color: #666; font-weight: 500;">Email:</td><td style="padding: 8px 0; color: #2C2C2C; font-weight: 600;">${certificateData.recipientEmail}</td></tr>
                            <tr><td style="padding: 8px 0; color: #666; font-weight: 500;">Diploma ID:</td><td style="padding: 8px 0; color: #2C2C2C; font-weight: 600;">${certificateData.certificateId}</td></tr>
                            <tr><td style="padding: 8px 0; color: #666; font-weight: 500;">Program:</td><td style="padding: 8px 0; color: #2C2C2C; font-weight: 600;">Gen AI Training for Technical Professionals</td></tr>
                            <tr><td style="padding: 8px 0; color: #666; font-weight: 500;">Completion Date:</td><td style="padding: 8px 0; color: #2C2C2C; font-weight: 600;">${completionDate}</td></tr>
                            <tr><td style="padding: 8px 0; color: #666; font-weight: 500;">Issue Date:</td><td style="padding: 8px 0; color: #2C2C2C; font-weight: 600;">${new Date().toLocaleDateString()}</td></tr>
                        </table>
                    </div>
                    
                    <div style="background: #FFF5F2; padding: 20px; border-radius: 8px; border-left: 4px solid #FF5F00; margin: 20px 0;">
                        <p style="color: #CC4C00; line-height: 1.6; margin: 0; font-size: 14px;">
                            <strong>✅ Program Completed:</strong> The participant has successfully demonstrated expertise in developing 
                            Generative AI applications within regulated environments, meeting all Swedbank professional standards.
                        </p>
                    </div>
                    
                    <p style="color: #666; line-height: 1.7; margin: 20px 0; font-size: 15px;">
                        📎 A copy of the <strong>professional diploma</strong> is attached to this email for your records and documentation.
                    </p>
                    
                    <p style="color: #666; line-height: 1.7; margin: 20px 0 0 0; font-size: 15px;">
                        For any questions regarding this diploma or the training program, please contact our team.
                    </p>
                </div>
                
                <!-- Swedbank Footer -->
                <div style="background: #2C2C2C; padding: 20px 30px; text-align: center;">
                    <div style="color: #FF5F00; font-size: 18px; font-weight: 600; margin-bottom: 8px;">Swedbank</div>
                    <p style="color: #999; font-size: 12px; margin: 0; line-height: 1.5;">
                        Automated notification from Gen AI Training for Technical Professionals<br>
                        Excellence in Professional Development • Regulated Environment Expertise<br>
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