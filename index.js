const express = require("express");
const axios = require("axios");
const FormData = require("form-data"); // Required for multipart/form-data

const app = express();
app.use(express.urlencoded({ extended: true }));

// Environment Variables
const RECAPTCHA_SECRET_KEY = "6LeVN34qAAAAAN3unKiEfcfgnB_4IBwhr6vF02Sg"; // Replace with your reCAPTCHA secret key
const FAUCETPAY_API_KEY = "ef9d4c15ddcacaffa3ee09b5bbe2b352351db21edfb95633c4f639160107bf27"; // Replace with your FaucetPay API key

app.post("/transfer", async (req, res) => {
    const { email, "g-recaptcha-response": recaptchaToken, currency = "DGB" } = req.body;

    // Step 1: Verify reCAPTCHA
    try {
        const recaptchaResponse = await axios.post(
            "https://www.google.com/recaptcha/api/siteverify",
            {},
            {
                params: {
                    secret: RECAPTCHA_SECRET_KEY,
                    response: recaptchaToken,
                },
            }
        );

        if (!recaptchaResponse.data.success) {
            return res.status(400).send("reCAPTCHA verification failed. Please try again.");
        }
    } catch (error) {
        console.error("Error during reCAPTCHA verification:", error.message);
        return res.status(500).send("Server error during reCAPTCHA verification.");
    }

    // Step 2: Process FaucetPay Payout
    try {
        const form = new FormData();
        form.append("api_key", FAUCETPAY_API_KEY);
        form.append("amount", "0.001"); // Change this value to your desired payout amount
        form.append("to", email);
        form.append("currency", currency);

        const faucetPayResponse = await axios.post("https://faucetpay.io/api/v1/send", form, {
            headers: form.getHeaders(),
        });

        if (faucetPayResponse.data.status === 200) {
            res.send("Transfer successful: " + faucetPayResponse.data.message);
        } else {
            res.status(400).send("FaucetPay Error: " + faucetPayResponse.data.message);
        }
    } catch (error) {
        console.error("Error with FaucetPay transfer:", error.response?.data || error.message);
        res.status(500).send("Server error during FaucetPay transfer.");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
         
