const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const app = express();

const FAUCETPAY_API_KEY = 'ef9d4c15ddcacaffa3ee09b5bbe2b352351db21edfb95633c4f639160107bf27'; // Replace with your FaucetPay API key
const RECAPTCHA_SECRET_KEY = '6LeVN34qAAAAAN3unKiEfcfgnB_4IBwhr6vF02Sg'; // Replace with your reCAPTCHA secret key

app.use(bodyParser.urlencoded({ extended: true }));

app.post('/transfer', async (req, res) => {
    const { email, 'g-recaptcha-response': recaptchaToken } = req.body;

    // Step 1: Verify reCAPTCHA token with Google
    try {
        const recaptchaResponse = await axios.post(
            `https://www.google.com/recaptcha/api/siteverify`,
            {},
            {
                params: {
                    secret: RECAPTCHA_SECRET_KEY,
                    response: recaptchaToken
                }
            }
        );

        if (recaptchaResponse.data.success) {
            // Step 2: Make the transfer request to FaucetPay
            try {
                const faucetPayResponse = await axios.post('https://faucetpay.io/api/v1/send', {}, {
                    params: {
                        api_key: FAUCETPAY_API_KEY,
                        to: email,
                        amount: 500, // Amount in Satoshis to send
                        currency: 'BTC' // Specify the currency, e.g., BTC for Bitcoin
                    }
                });

                // Check FaucetPay API response
                if (faucetPayResponse.data.success) {
                    res.send('500 Satoshi has been successfully transferred to your account.');
                } else {
                    res.status(500).send('FaucetPay transaction failed: ' + faucetPayResponse.data.message);
                }
            } catch (faucetPayError) {
                console.error("Error with FaucetPay transaction:", faucetPayError);
                res.status(500).send("Server error during FaucetPay transaction.");
            }
        } else {
            res.status(400).send('reCAPTCHA verification failed.');
        }
    } catch (error) {
        console.error("Error verifying reCAPTCHA:", error);
        res.status(500).send("Server error during reCAPTCHA verification.");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
