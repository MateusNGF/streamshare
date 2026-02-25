
const nodemailer = require('nodemailer');
require('dotenv').config();

async function test() {
    console.log('--- TESTE SMTP DIRETO ---');
    console.log('Host:', process.env.SMTP_HOST);
    console.log('Port:', process.env.SMTP_PORT);
    console.log('User:', process.env.SMTP_USER);
    console.log('From:', process.env.EMAIL_FROM);

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    try {
        console.log('Verificando conexão...');
        await transporter.verify();
        console.log('✅ Conexão OK!');

        console.log('Enviando email de teste...');
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: process.env.SMTP_USER, // Envia para si mesmo
            subject: 'Teste Direto StreamShare',
            text: 'Se você recebeu isso, o SMTP via script funcionou.',
            html: '<b>Teste Direto StreamShare</b>'
        });

        console.log('✅ Email enviado com sucesso!');
        console.log('Message ID:', info.messageId);
        console.log('Response:', info.response);
    } catch (error) {
        console.error('❌ ERRO NO TESTE:', error);
    }
}

test();
