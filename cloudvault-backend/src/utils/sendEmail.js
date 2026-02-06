const SibApiV3Sdk = require('sib-api-v3-sdk');

const sendEmail = async (options) => {
    // API Setup
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = process.env.BREVO_API_KEY; // Requires 'xkeysib-...' key

    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    // Configure Email
    sendSmtpEmail.subject = options.subject;
    sendSmtpEmail.htmlContent = options.message;
    // Use the authenticated email from Brevo as the sender
    sendSmtpEmail.sender = { "name": process.env.FROM_NAME || "CloudVault", "email": process.env.SMTP_EMAIL };
    sendSmtpEmail.to = [{ "email": options.email }];

    console.log(`Attempting to send email to ${options.email} via Brevo API...`);

    try {
        const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log('Email sent successfully via API. Message ID:', data.messageId);
        return data;
    } catch (error) {
        console.error('Brevo API Error:', error);
        throw new Error('Email could not be sent');
    }
};

module.exports = sendEmail;
