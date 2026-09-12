// ============================================
// ScamShield Rule-Based Risk Engine
// ============================================


// Scam indicators and their weights

const scamRules = [

    {
        name: "Urgent language",
        patterns: [
            "urgent",
            "immediately",
            "act now",
            "last chance",
            "account will be blocked",
            "account will be suspended"
        ],
        score: 15
    },

    {
        name: "OTP request",
        patterns: [
            "otp",
            "one time password",
            "verification code",
            "security code"
        ],
        score: 25
    },

    {
        name: "Password request",
        patterns: [
            "enter your password",
            "confirm your password",
            "login credentials",
            "username and password"
        ],
        score: 25
    },

    {
        name: "Financial information request",
        patterns: [
            "credit card",
            "debit card",
            "bank account",
            "card number",
            "cvv",
            "account number"
        ],
        score: 25
    },

    {
        name: "Payment request",
        patterns: [
            "make a payment",
            "send money",
            "pay now",
            "payment required",
            "transfer money"
        ],
        score: 20
    },

    {
        name: "Fake reward or offer",
        patterns: [
            "you won",
            "winner",
            "claim your prize",
            "free gift",
            "cash prize",
            "reward",
            "congratulations"
        ],
        score: 15
    },

    {
        name: "Threatening language",
        patterns: [
            "legal action",
            "police",
            "arrest",
            "penalty",
            "fine",
            "account suspended"
        ],
        score: 20
    }

];


// ============================================
// Analyze webpage
// ============================================

function analyzeScam(url, pageText) {

    const text = pageText.toLowerCase();

    let score = 0;

    const detectedIndicators = [];


    // Check every rule

    scamRules.forEach(rule => {

        const matched = rule.patterns.some(pattern =>
            text.includes(pattern)
        );


        if (matched) {

            score += rule.score;

            detectedIndicators.push(
                rule.name
            );
        }

    });


    // Prevent score from exceeding 100

    score = Math.min(score, 100);


    // Determine risk level

    let riskLevel;

    if (score >= 70) {

        riskLevel = "HIGH";

    } else if (score >= 40) {

        riskLevel = "MEDIUM";

    } else {

        riskLevel = "LOW";

    }


    // Generate recommendation

    let recommendation;

    if (riskLevel === "HIGH") {

        recommendation =
            "Avoid entering personal information, OTPs, passwords, or payment details. Leave this website.";

    } else if (riskLevel === "MEDIUM") {

        recommendation =
            "Proceed carefully. Verify the website and avoid sharing sensitive information.";

    } else {

        recommendation =
            "No major scam indicators were detected. Continue to use normal security precautions.";

    }


    return {

        score,
        riskLevel,
        indicators: detectedIndicators,
        recommendation

    };

}