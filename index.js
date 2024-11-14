const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const FAUCETPAY_API_KEY = 'ef9d4c15ddcacaffa3ee09b5bbe2b352351db21edfb95633c4f639160107bf27';
const SATOSHI_AMOUNT = 500;

// Endpoint to handle FaucetPay transactions
app.post('/transfer', async (req, res) => {
    const { email, captcha } = req.body;
    
    // Check if captcha is valid (You'll add the reCAPTCHA verification here)
    if (!captcha) {
        return res.status(400).json({ success: false, message: 'Captcha validation failed' });
    }

    try {
        // FaucetPay API request
        const response = await axios.post('https://faucetpay.io/api/v1/send', null, {
            params: {
                api_key: FAUCETPAY_API_KEY,
                to: email,
                amount: SATOSHI_AMOUNT,
                currency: 'BTC'
            }
        });

        if (response.data.status === 200) {
            return res.json({ success: true, message: '500 Satoshi has been successfully transferred' });
        } else {
            return res.json({ success: false, message: response.data.message });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Listen on port for Koyeb deployment
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
