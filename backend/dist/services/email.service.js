"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTicketConfirmationEmail = sendTicketConfirmationEmail;
exports.testEmailConnection = testEmailConnection;
const nodemailer_1 = __importDefault(require("nodemailer"));
const qrcode_1 = __importDefault(require("qrcode"));
// Mock email configuration for development/testing
// Option 1: Use jsonTransport for complete mocking (no actual emails sent)
const useMockTransport = process.env.NODE_ENV !== 'development';
let transporter;
if (useMockTransport) {
    // Create a mock transporter that logs emails instead of sending them
    transporter = nodemailer_1.default.createTransport({
        streamTransport: true,
        newline: 'unix',
        buffer: true
    });
}
else {
    // Use real SMTP provider for actual email delivery
    transporter = nodemailer_1.default.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER || 'ammerlaan.rodi@gmail.com',
            pass: process.env.SMTP_PASS || 'egdj tmlv jwsh xxxj' // Use App Password, not regular password
        }
    });
}
// Helper function to generate QR code as Buffer for email attachment
async function generateQRCodeBuffer(ticketNumber) {
    try {
        // Create QR code data with ticket information
        const qrData = JSON.stringify({
            ticket: ticketNumber,
            event: 'FrontRow Event',
            timestamp: new Date().toISOString(),
            version: '1.0'
        });
        // Generate QR code as Buffer (binary data)
        const qrCodeBuffer = await qrcode_1.default.toBuffer(qrData, {
            errorCorrectionLevel: 'M',
            margin: 1,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            },
            width: 200
        });
        return qrCodeBuffer;
    }
    catch (error) {
        console.error('Error generating QR code:', error);
        // Return a minimal 1x1 transparent PNG as fallback
        return Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
    }
}
async function sendTicketConfirmationEmail(userInfo, tickets, eventInfo) {
    try {
        // Generate QR codes as buffers for email attachments
        const ticketsWithQR = await Promise.all(tickets.map(async (ticket, index) => {
            const qrCodeBuffer = await generateQRCodeBuffer(ticket.ticket_number);
            const cid = `qr-${ticket.id}-${index}`;
            return {
                ...ticket,
                qrCodeBuffer,
                cid
            };
        }));
        // Create email attachments for QR codes
        const attachments = ticketsWithQR.map(ticket => ({
            filename: `qr-${ticket.ticket_number}.png`,
            content: ticket.qrCodeBuffer,
            contentType: 'image/png',
            cid: ticket.cid,
            contentDisposition: 'inline'
        }));
        const ticketListHtml = ticketsWithQR.map(ticket => `
            <div style="border: 1px solid #ddd; margin: 20px 0; padding: 20px; border-radius: 8px; background-color: #fafafa;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px;">
                    <div style="flex: 1;">
                        <h4 style="margin: 0 0 10px 0; color: #333; font-size: 18px;">🎫 Ticket: ${ticket.ticket_number}</h4>
                        <p style="margin: 5px 0; color: #666;"><strong>Order ID:</strong> ${ticket.order_id || 'N/A'}</p>
                        <p style="margin: 5px 0; color: #666;"><strong>Ticket ID:</strong> ${ticket.id}</p>
                        ${ticket.created_at ? `<p style="margin: 5px 0; color: #666;"><strong>Created:</strong> ${new Date(ticket.created_at).toLocaleDateString('nl-NL')}</p>` : ''}
                    </div>
                    <div style="margin-left: 20px; text-align: center;">
                        <img src="cid:${ticket.cid}" alt="QR Code for ${ticket.ticket_number}" style="width: 120px; height: 120px; border: 1px solid #ddd; border-radius: 4px; display: block; margin: 0 auto; max-width: 120px; max-height: 120px;" />
                        <p style="margin: 8px 0 0 0; font-size: 12px; color: #888; font-weight: bold;">SCAN AT ENTRANCE</p>
                    </div>
                </div>
                <div style="background-color: #e8f4fd; padding: 10px; border-radius: 4px; border-left: 4px solid #2196F3;">
                    <p style="margin: 0; font-size: 12px; color: #1976D2;">
                        💡 <strong>Tip:</strong> Save this email or take a screenshot of the QR code for quick access at the event.
                    </p>
                </div>
            </div>
        `).join('');
        const mailOptions = {
            from: process.env.SMTP_FROM || '"FrontRow Tickets" <noreply@frontrow.nl>',
            to: userInfo.email,
            subject: `Ticket Confirmation - ${eventInfo.title}`,
            html: `
                <h1>Ticket Confirmation</h1>
                <p>Dear ${userInfo.first_name} ${userInfo.last_name},</p>
                
                <p>Thank you for your purchase! You have successfully bought ${tickets.length} ticket(s) for the following event:</p>
                
                <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 5px;">
                    <h2>${eventInfo.title}</h2>
                    <p><strong>Description:</strong> ${eventInfo.description || 'No description available'}</p>
                    <p><strong>Start Time:</strong> ${new Date(eventInfo.start_time).toLocaleDateString('nl-NL', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })}</p>
                    <p><strong>End Time:</strong> ${new Date(eventInfo.end_time).toLocaleDateString('nl-NL', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })}</p>
                </div>
                
                <h3>🎫 Your Digital Tickets:</h3>
                ${ticketListHtml}
                
                <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 30px 0;">
                    <h4 style="margin: 0 0 15px 0; color: #856404;">📱 How to Use Your Tickets:</h4>
                    <ul style="margin: 0; padding-left: 20px; color: #856404;">
                        <li style="margin-bottom: 8px;"><strong>Save this email</strong> or take screenshots of the QR codes</li>
                        <li style="margin-bottom: 8px;"><strong>Show your QR code</strong> at the entrance on your phone or print it</li>
                        <li style="margin-bottom: 8px;"><strong>Each ticket has a unique QR code</strong> - one scan per person</li>
                        <li style="margin-bottom: 8px;"><strong>Arrive early</strong> to avoid queues at the entrance</li>
                    </ul>
                </div>
                
                <p style="margin-top: 30px; padding: 15px; background-color: #f8f9fa; border-radius: 5px; border-left: 4px solid #28a745;">
                    <strong>✅ Important:</strong> Each ticket contains a unique QR code that will be scanned at the entrance. 
                    Make sure to have your QR codes ready (either on your phone or printed) when you arrive at the event.
                </p>
                
                <p>If you have any questions, please contact our support team.</p>
                
                <p>Best regards,<br>
                The FrontRow Team</p>
                
                <hr style="margin-top: 40px;">
                <p style="font-size: 12px; color: #666;">
                    This is an automated email. Please do not reply to this message.
                </p>
            `,
            attachments: attachments
        };
        const info = await transporter.sendMail(mailOptions);
        if (useMockTransport) {
            console.log('📧 MOCK EMAIL SENT:');
            console.log('  To:', userInfo.email);
            console.log('  Subject:', mailOptions.subject);
            console.log('  Event:', eventInfo.title);
            console.log('  Tickets:', tickets.length);
            console.log('  QR Codes Generated:', ticketsWithQR.length);
            console.log('  Message ID:', info.messageId || 'mock-' + Date.now());
        }
        else {
            console.log('Email sent successfully to:', userInfo.email);
            console.log('QR codes generated for', ticketsWithQR.length, 'tickets');
        }
        return { success: true, messageId: info.messageId };
    }
    catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error: error };
    }
}
// Test email configuration
async function testEmailConnection() {
    try {
        if (useMockTransport) {
            console.log('🚀 Mock email transporter is ready (no actual verification needed)');
            return true;
        }
        else {
            await transporter.verify();
            console.log('Email server connection successful');
            return true;
        }
    }
    catch (error) {
        console.error('Email server connection failed:', error);
        return false;
    }
}
//# sourceMappingURL=email.service.js.map