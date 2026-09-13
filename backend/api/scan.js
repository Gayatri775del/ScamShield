function handler(req, res) {

    // CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // Preflight request
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    // Only POST
    if (req.method !== "POST") {
        return res.status(405).json({
            success: false,
            error: "Only POST requests are allowed."
        });
    }

    try {

        const body = req.body || {};

        const url = body.url || "";
        const pageText = body.text || "";

        if (!url) {
            return res.status(400).json({
                success: false,
                error: "URL is required."
            });
        }

        // Combine URL + webpage text
        const content = `${url} ${pageText}`.toLowerCase();

        let score = 0;
        const indicators = [];

        // Urgent language
        if (
            content.includes("urgent") ||
            content.includes("immediately") ||
            content.includes("act now")
        ) {
            score += 20;
            indicators.push("Urgent or threatening language");
        }

        // OTP
        if (
            content.includes("otp") ||
            content.includes("one time password")
        ) {
            score += 20;
            indicators.push("OTP request");
        }

        // Password
        if (
            content.includes("password") ||
            content.includes("login credentials")
        ) {
            score += 20;
            indicators.push("Password or credential request");
        }

        // Financial information
        if (
            content.includes("credit card") ||
            content.includes("cvv") ||
            content.includes("bank account")
        ) {
            score += 20;
            indicators.push("Financial information request");
        }

        // Payment
        if (
            content.includes("pay") ||
            content.includes("payment") ||
            content.includes("send money")
        ) {
            score += 10;
            indicators.push("Payment request");
        }

        // Prize/reward
        if (
            content.includes("winner") ||
            content.includes("you won") ||
            content.includes("reward") ||
            content.includes("prize")
        ) {
            score += 10;
            indicators.push("Suspicious reward or prize");
        }

        // Maximum score
        score = Math.min(score, 100);

        // Risk level
        let riskLevel;

        if (score >= 60) {
            riskLevel = "HIGH";
        } else if (score >= 30) {
            riskLevel = "MEDIUM";
        } else {
            riskLevel = "LOW";
        }

        // Recommendation
        let recommendation;

        if (riskLevel === "HIGH") {
            recommendation =
                "Do not enter passwords, OTPs or financial information. Leave the website.";
        } else if (riskLevel === "MEDIUM") {
            recommendation =
                "Proceed carefully and avoid sharing sensitive information.";
        } else {
            recommendation =
                "No major scam indicators were detected. Continue with normal caution.";
        }

        // Send result
        return res.status(200).json({
            success: true,
            url: url,
            score: score,
            riskLevel: riskLevel,
            indicators: indicators,
            recommendation: recommendation
        });

    } catch (error) {

        console.error("Scan error:", error);

        return res.status(500).json({
            success: false,
            error: "Internal server error."
        });
    }
}

module.exports = handler;