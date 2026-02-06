const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // secure: true for 465, false for other ports
    // For Development (using Ethereal or similar if credentials are mock):
    // const transporter = nodemailer.createTransport({
    //    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    //    port: process.env.SMTP_PORT || 587,
    //    auth: {
    //        user: process.env.SMTP_EMAIL,
    //        pass: process.env.SMTP_PASSWORD
    //    }
    // });

    // Using basic SMTP or Gmail (Not recommended for production without OAuth2, but fine for simple projects)
    // Switch to Port 587 (STARTTLS) which is often less blocked on Cloud Servers than 465
    const transporter = nodemailer.createTransport({
        host: 'smtp-relay.brevo.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD,
        },
        tls: {
            rejectUnauthorized: false
        },
        family: 4, // Force IPv4
        logger: true, // Log to console
        debug: true // Include SMTP traffic in logs
    });

    const message = {
        from: `${process.env.FROM_NAME || 'CloudVault'} <${process.env.FROM_EMAIL || process.env.SMTP_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        html: options.message, // Use HTML for better looking emails
    };

    const info = await transporter.sendMail(message);

    console.log('Message sent: %s', info.messageId);
};

module.exports = sendEmail;
