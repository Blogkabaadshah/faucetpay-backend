const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies

app.post('/transfer', async (req, res) => {
    const { email, 'g-recaptcha-response': recaptchaToken } = req.body;

    // Step 1: Validate the reCAPTCHA token
    try {
        const recaptchaResponse = await axios.post(
            `https://www.google.com/recaptcha/api/siteverify`,
            {},
            {
                params: {
                    secret: '6LeVN34qAAAAAN3unKiEfcfgnB_4IBwhr6vF02Sg',  // Replace with your actual reCAPTCHA secret key
                    response: recaptchaToken
                }
            }
        );

        if (!recaptchaResponse.data.success) {
            return res.status(400).send('reCAPTCHA verification failed.');
        }

    } catch (error) {
        console.error("Error verifying reCAPTCHA:", error);
        return res.status(500).send("Server error during reCAPTCHA verification.");
    }

    // Step 2: Process the FaucetPay Transaction
    try {
        const faucetPayResponse = await axios.post('https://faucetpay.io/api/v1/send', {
            api_key: process.env.FAUCETPAY_API_KEY, // Make sure this environment variable is set in Koyeb
            to: email,
            amount: 500,  // Amount in Satoshi
            currency: 'DGB', // Updated to DigiByte
        });

        // Check FaucetPay's response
        if (faucetPayResponse.data.status === 200) {
            res.send('500 Satoshi (DigiByte) has been successfully transferred to your account.');
        } else {
            console.error("FaucetPay API Error:", faucetPayResponse.data.message);
            res.status(500).send(`FaucetPay transaction failed: ${faucetPayResponse.data.message}`);
        }

    } catch (error) {
        console.error('Error with FaucetPay transaction:', error.response ? error.response.data : error.message);
        res.status(500).send("Transaction failed due to server error.");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
