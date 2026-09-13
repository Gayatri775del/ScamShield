// ============================================
// ScamShield Popup
// ============================================

const API_URL = "http://localhost:3000/api/scan";

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

        const tab = await getCurrentTab();

        if (!tab || !tab.url) {

            websiteName.textContent = "Unable to detect";
            websiteUrl.textContent = "No URL available";

            return;
        }

        const url = tab.url;

        websiteUrl.textContent = url;

        try {

            const domain = new URL(url).hostname;

            websiteName.textContent = domain;

        } catch (error) {

            websiteName.textContent = "Unknown website";

        }

        console.log("URL detected:", url);

    } catch (error) {

        console.error("URL detection error:", error);

        websiteName.textContent = "Unable to detect";

        websiteUrl.textContent = "Error reading URL";
    }
}


// ============================================
// Get webpage content
// ============================================

async function getPageContent(tab) {

    try {

        const response = await chrome.tabs.sendMessage(
            tab.id,
            {
                action: "scanWebsite"
            }
        );

        if (!response || !response.success) {

            throw new Error(
                "Could not get webpage content."
            );
        }

        return response;

    } catch (error) {

        console.error(
            "Content extraction error:",
            error
        );

        throw new Error(
            "Could not read webpage. Try refreshing the page."
        );
    }
}


// ============================================
// Send data to backend
// ============================================

async function scanWithBackend(url, pageText) {

    console.log("Sending data to backend...");

    const response = await fetch(API_URL, {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({

            url: url,

            text: pageText

        })

    });


    if (!response.ok) {

        throw new Error(
            `Backend returned ${response.status}`
        );
    }


    const data = await response.json();

    console.log(
        "Backend result:",
        data
    );


    if (!data.success) {

        throw new Error(
            data.error || "Scan failed."
        );
    }


    return data;
}


// ============================================
// Display scan result
// ============================================

function displayResult(analysis) {

    // Score

    riskScore.textContent =
        analysis.score;

    riskProgress.style.width =
        analysis.score + "%";


    // Risk level

    riskLevel.textContent =
        analysis.riskLevel + " RISK";


    // Description

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


    // Indicators

    if (
        analysis.indicators &&
        analysis.indicators.length > 0
    ) {

        indicators.innerHTML =
            analysis.indicators
                .map(indicator => {

                    const li =
                        document.createElement("li");

                    li.textContent = indicator;

                    return li.outerHTML;

                })
                .join("");

    } else {

        indicators.innerHTML =
            "<li>No major scam indicators detected</li>";

    }


    // Recommendation

    recommendationText.textContent =
        analysis.recommendation;
}


// ============================================
// Scan website
// ============================================

scanButton.addEventListener(
    "click",
    async () => {

        scanButton.disabled = true;

        scanButton.innerHTML =
            "⏳ Scanning...";


        riskLevel.textContent =
            "Analyzing";

        riskScore.textContent =
            "--";

        riskProgress.style.width =
            "0%";


        riskDescription.textContent =
            "Reading webpage and analyzing scam indicators...";


        indicators.innerHTML = `
            <li>Extracting webpage content...</li>
        `;


        recommendationText.textContent =
            "Please wait while ScamShield analyzes this website.";


        try {

            // Get current tab

            const tab =
                await getCurrentTab();


            if (!tab || !tab.id || !tab.url) {

                throw new Error(
                    "Could not access current website."
                );
            }


            console.log(
                "Scanning URL:",
                tab.url
            );


            // Get webpage text

            const pageData =
                await getPageContent(tab);


            console.log(
                "Page text length:",
                pageData.text.length
            );


            // Send to backend

            const analysis =
                await scanWithBackend(
                    tab.url,
                    pageData.text
                );


            // Display result

            displayResult(analysis);


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
                error.message;


            indicators.innerHTML = `
                <li>Unable to complete scan</li>
            `;


            recommendationText.textContent =
                "Make sure the backend is running and try again.";

        } finally {

            scanButton.disabled =
                false;

            scanButton.innerHTML =
                "🔍 Scan This Website";
        }

    }
);


// ============================================
// Report website
// ============================================

reportButton.addEventListener(
    "click",
    async () => {

        try {

            const tab =
                await getCurrentTab();


            if (!tab || !tab.url) {

                alert(
                    "Unable to detect the website URL."
                );

                return;
            }


            const confirmed =
                confirm(
                    "Do you want to report this website as suspicious?"
                );


            if (!confirmed) {

                return;
            }


            console.log(
                "Reported website:",
                tab.url
            );


            // Temporary MVP report

            alert(
                "Thank you. Your report has been recorded for the ScamShield MVP."
            );


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