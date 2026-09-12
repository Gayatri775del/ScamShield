// ============================================
// ScamShield Popup
// ============================================

const websiteName = document.getElementById("websiteName");
const websiteUrl = document.getElementById("websiteUrl");

const scanButton = document.getElementById("scanButton");
const reportButton = document.getElementById("reportButton");

const riskLevel = document.getElementById("riskLevel");
const riskScore = document.getElementById("riskScore");
const riskProgress = document.getElementById("riskProgress");
const riskDescription = document.getElementById("riskDescription");

const indicators = document.getElementById("indicators");
const recommendationText =
    document.getElementById("recommendationText");


// ============================================
// Get current tab
// ============================================

async function getCurrentTab() {

    const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true
    });

    return tabs[0];
}


// ============================================
// Display current website
// ============================================

async function loadCurrentWebsite() {

    try {

        console.log("Getting current tab...");

        const tab = await getCurrentTab();

        console.log("Current tab:", tab);

        if (!tab || !tab.url) {

            websiteName.textContent = "Unable to detect";
            websiteUrl.textContent = "No URL available";

            return;
        }

        const url = tab.url;

        // Display URL immediately
        websiteUrl.textContent = url;

        try {

            const domain = new URL(url).hostname;

            websiteName.textContent = domain;

        } catch (error) {

            websiteName.textContent = "Unknown website";

        }

        console.log("URL detected:", url);

    } catch (error) {

        console.error(
            "URL detection error:",
            error
        );

        websiteName.textContent = "Unable to detect";

        websiteUrl.textContent =
            "Error reading URL";
    }
}


// ============================================
// Scan website
// ============================================

scanButton.addEventListener("click", async () => {

    scanButton.disabled = true;

    scanButton.innerHTML = "⏳ Scanning...";

    riskLevel.textContent = "Analyzing";

    riskScore.textContent = "--";

    riskProgress.style.width = "0%";

    riskDescription.textContent =
        "Analyzing this webpage...";

    indicators.innerHTML = `
        <li>Reading webpage content...</li>
    `;

    recommendationText.textContent =
        "Please wait while ScamShield analyzes this website.";


    try {

        const tab = await getCurrentTab();

        if (!tab || !tab.id) {

            throw new Error(
                "Could not access current tab."
            );
        }


        console.log("Sending scan request...");


        const response = await chrome.tabs.sendMessage(
            tab.id,
            {
                action: "scanWebsite"
            }
        );


        console.log(
            "Scan response:",
            response
        );


        if (!response || !response.success) {

            throw new Error(
                "No valid response from content.js"
            );
        }


        const analysis =
            response.analysis;


        // ====================================
        // Display score
        // ====================================

        riskScore.textContent =
            analysis.score;


        riskProgress.style.width =
            analysis.score + "%";


        // ====================================
        // Display risk level
        // ====================================

        riskLevel.textContent =
            analysis.riskLevel + " RISK";


        // ====================================
        // Display description
        // ====================================

        if (analysis.riskLevel === "HIGH") {

            riskDescription.textContent =
                "Multiple indicators commonly associated with scams were detected.";

        } else if (analysis.riskLevel === "MEDIUM") {

            riskDescription.textContent =
                "Some suspicious indicators were detected. Proceed carefully.";

        } else {

            riskDescription.textContent =
                "No major scam indicators were detected.";

        }


        // ====================================
        // Display indicators
        // ====================================

        if (
            analysis.indicators &&
            analysis.indicators.length > 0
        ) {

            indicators.innerHTML =
                analysis.indicators
                    .map(indicator => {

                        return `<li>${indicator}</li>`;

                    })
                    .join("");

        } else {

            indicators.innerHTML =
                "<li>No major scam indicators detected</li>";

        }


        // ====================================
        // Recommendation
        // ====================================

        recommendationText.textContent =
            analysis.recommendation;


    } catch (error) {

        console.error(
            "Scan error:",
            error
        );


        riskLevel.textContent =
            "ERROR";

        riskScore.textContent =
            "--";

        riskProgress.style.width =
            "0%";

        riskDescription.textContent =
            "Unable to analyze this webpage.";

        indicators.innerHTML = `
            <li>Could not read webpage content</li>
        `;

        recommendationText.textContent =
            "Refresh the webpage and try scanning again.";

    } finally {

        scanButton.disabled = false;

        scanButton.innerHTML =
            "🔍 Scan This Website";
    }

});


// ============================================
// Report website
// ============================================

reportButton.addEventListener(
    "click",
    async () => {

        try {

            const tab = await getCurrentTab();

            if (!tab || !tab.url) {

                alert(
                    "Unable to detect the website URL."
                );

                return;
            }

            const confirmed = confirm(
                "Do you want to report this website as suspicious?"
            );

            if (confirmed) {

                console.log(
                    "Reported website:",
                    tab.url
                );

                alert(
                    "Thank you. Your report will be submitted."
                );
            }

        } catch (error) {

            console.error(
                "Report error:",
                error
            );

            alert(
                "Unable to submit the report."
            );
        }

    }
);


// ============================================
// Start popup
// ============================================

loadCurrentWebsite();