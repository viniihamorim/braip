const express = require('express');
const bodyParser = require('body-parser');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const port = 3000;

// Inicialize o servidor HTTP e o WebSocket
const server = http.createServer(app);
const io = new Server(server);

app.use(bodyParser.json());
app.use(express.static('public')); // Serve arquivos estáticos do diretório 'public'

// Inicialize o cliente WhatsApp
const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', (qr) => {
    // Gerar QR code no terminal
    qrcode.generate(qr, { small: true });

    // Emitir QR code via WebSocket
    io.emit('qr', `data:image/png;base64,${Buffer.from(qr).toString('base64')}`);
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.initialize();

// Mensagem padrão a ser enviada
const messageTemplate = `✨ *Pagamento Aprovado!* ✨

Olá, {CLIENT_NAME}! 🎉

Temos o prazer de informar que o pagamento do seu tratamento *Oftacure* foi aprovado com sucesso! 🟢
Seu pedido já está sendo processado e logo estará a caminho para que você possa começar seu tratamento e melhorar sua saúde ocular! 👁️💙

Você receberá mais detalhes e o código de rastreamento em breve.

Qualquer dúvida, estamos à disposição.
Agradecemos pela confiança! 😊

Atenciosamente,
Equipe Oftacure`;

// Rota para receber a requisição e enviar a mensagem
app.post('/send-message', (req, res) => {
    const { client_name, client_cel } = req.body;

    // Verifica se o cliente possui nome e número de telefone
    if (client_name && client_cel) {
        // Remove o código do país (se necessário)
        const formattedPhone = client_cel.replace(/[^0-9]/g, '');

        const message = messageTemplate.replace('{CLIENT_NAME}', client_name);

        client.sendMessage(`${formattedPhone}@c.us`, message)
            .then((response) => {
                res.status(200).json({ success: true, message: `Message sent to ${client_name}!` });
            })
            .catch((error) => {
                res.status(500).json({ success: false, error: error.message });
            });
    } else {
        res.status(400).json({ success: false, error: 'Client name or phone number is missing.' });
    }
});

// Servir arquivos estáticos para o frontend
app.use(express.static(path.join(__dirname, 'public')));

// Inicializar o servidor
server.listen(port, () => {
    console.log(`Server running on https://testes.amorimtank.online:${port}`);
});
