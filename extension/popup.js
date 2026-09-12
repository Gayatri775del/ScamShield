const scanButton = document.getElementById("scanButton");
const reportButton = document.getElementById("reportButton");

const websiteName = document.getElementById("websiteName");
const websiteUrl = document.getElementById("websiteUrl");

const riskLevel = document.getElementById("riskLevel");
const riskScore = document.getElementById("riskScore");
const riskProgress = document.getElementById("riskProgress");
const riskDescription = document.getElementById("riskDescription");

const indicators = document.getElementById("indicators");
const recommendationText =
    document.getElementById("recommendationText");


// ------------------------------------
// Get current tab
// ------------------------------------

async function getCurrentTab() {

    const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true
    });

    return tabs[0];
}


// ------------------------------------
// Display website information
// ------------------------------------

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

        } catch {

            websiteName.textContent = "Unknown website";

        }

    } catch (error) {

        console.error(error);

        websiteName.textContent = "Unable to detect";
        websiteUrl.textContent = "Error reading URL";
    }
}


// ------------------------------------
// Scan website
// ------------------------------------

scanButton.addEventListener("click", async () => {

    scanButton.disabled = true;

    scanButton.innerHTML = "⏳ Reading Website...";

    riskLevel.textContent = "Analyzing";

    riskScore.textContent = "--";

    riskProgress.style.width = "0%";

    riskDescription.textContent =
        "Reading the current webpage...";

    indicators.innerHTML = `
        <li>Extracting webpage content...</li>
    `;

    recommendationText.textContent =
        "ScamShield is collecting information for analysis.";

    try {

        const tab = await getCurrentTab();

        // Send message to content.js
        const response = await chrome.tabs.sendMessage(
            tab.id,
            {
                action: "extractPageText"
            }
        );

        if (!response || !response.success) {

            throw new Error(
                "Unable to extract webpage text."
            );
        }

        const pageText = response.text;

        console.log("URL:", tab.url);

        console.log(
            "Page text:",
            pageText
        );

        console.log(
            "Characters extracted:",
            pageText.length
        );


        // Display successful extraction

        riskLevel.textContent = "Ready";

        riskDescription.textContent =
            "Website content successfully extracted.";

        indicators.innerHTML = `
            <li>URL detected</li>
            <li>Webpage text extracted</li>
            <li>${pageText.length} characters collected</li>
        `;

        recommendationText.textContent =
            "Ready for scam analysis.";

        scanButton.innerHTML =
            "🔍 Scan This Website";

        scanButton.disabled = false;


    } catch (error) {

        console.error(
            "Scan error:",
            error
        );

        riskLevel.textContent = "Error";

        riskDescription.textContent =
            "Could not read this webpage.";

        indicators.innerHTML = `
            <li>Unable to extract webpage content</li>
        `;

        recommendationText.textContent =
            "Try refreshing the webpage and scanning again.";

        scanButton.innerHTML =
            "🔍 Scan This Website";

        scanButton.disabled = false;
    }

});


// ------------------------------------
// Report website
// ------------------------------------

reportButton.addEventListener(
    "click",
    async () => {

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
    }
);


// Load website when popup opens

loadCurrentWebsite();