import axios from 'axios';

const sendEmail = async ({ to, subject, htmlContent }) => {
    try {
        const apiKey = process.env.BREVO_API_KEY;
        const senderEmail = process.env.ADMIN_EMAIL || 'skillnear@brightbravo.online';

        if (!apiKey) {
            console.error("Brevo API key not found in environment variables.");
            return;
        }

        console.log(`Attempting to send email to: ${to} using Brevo`);

        const data = {
            sender: {
                name: 'SkillNear',
                email: senderEmail,
            },
            to: [
                {
                    email: to,
                },
            ],
            subject: subject,
            htmlContent: htmlContent,
        };

        const config = {
            headers: {
                'api-key': apiKey,
                'Content-Type': 'application/json',
            },
        };

        await axios.post('https://api.brevo.com/v3/smtp/email', data, config);
        console.log(`Email successfully sent to ${to}`);
    } catch (error) {
        console.error("Failed to send email", error.message);
    }
};

export default sendEmail;
