const express = require('express');
const cors = require('cors');

require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = require('twilio')(accountSid, authToken);

const authRoutes = require('./routes/auth.js');

const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());
app.use(express.urlencoded());

app.get('/', (req, res) => {
    res.send('Hello, World')
});

app.post('/', (req, res) => {
    const {message, user: sender, type, members} = req.body;

    if (type === 'message.new') {
        members
            .filter((member) => member.user_id !== sender.id)
            .forEach(({user}) => {
                if (user && !user.online && user.phoneNumber && message?.text?.length) {
                    twilioClient.messages.create({
                        body: `You have a new message from ${message.user.fullName} - ${message.text}`,
                        messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID,
                        to: user.phoneNumber
                    });
                }
            });
        return res.status(200).send('Message sent!');
    }

    res.status(200).send('Not a new message request');
})

app.use('/auth', authRoutes)

app.listen(PORT, () => console.log(`Server running on ${PORT}`));