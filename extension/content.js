// ============================================
// ScamShield Content Script
// ============================================

console.log("🛡️ ScamShield content.js is running");


// ============================================
// Extract webpage text
// ============================================

function extractPageText() {

    if (!document.body) {
        return "";
    }

    const text = document.body.innerText || "";

    return text
        .replace(/\s+/g, " ")
        .trim()
        .substring(0, 10000);
}


// ============================================
// Listen for popup requests
// ============================================

chrome.runtime.onMessage.addListener(
    (message, sender, sendResponse) => {

        console.log(
            "📩 ScamShield message received:",
            message
        );


        if (message.action === "scanWebsite") {

            try {

                // Get webpage text
                const pageText = extractPageText();

                // Get current URL
                const url = window.location.href;


                console.log(
                    "🌐 URL:",
                    url
                );


                console.log(
                    "📄 Page text length:",
                    pageText.length
                );


                // ====================================
                // Run risk engine
                // ====================================

                const analysis = analyzeScam(
                    url,
                    pageText
                );


                console.log(
                    "🔍 Analysis:",
                    analysis
                );


                // ====================================
                // Send result to popup
                // ====================================

                sendResponse({

                    success: true,

                    url: url,

                    text: pageText,

                    analysis: analysis

                });


            } catch (error) {

                console.error(
                    "❌ ScamShield scan error:",
                    error
                );


                sendResponse({

                    success: false,

                    error: error.message

                });

            }

        }

        return true;

    }
);