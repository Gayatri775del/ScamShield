// Get elements from the popup
const scanButton = document.getElementById("scanButton");
const reportButton = document.getElementById("reportButton");

const websiteName = document.getElementById("websiteName");
const websiteUrl = document.getElementById("websiteUrl");

const riskLevel = document.getElementById("riskLevel");
const riskScore = document.getElementById("riskScore");
const riskProgress = document.getElementById("riskProgress");
const riskDescription = document.getElementById("riskDescription");

const indicators = document.getElementById("indicators");
const recommendationText = document.getElementById("recommendationText");


// ------------------------------------
// Get the current browser tab
// ------------------------------------

async function getCurrentTab() {

    const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true
    });

    return tabs[0];
}


// ------------------------------------
// Display current website
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

        // Display full URL
        websiteUrl.textContent = url;

        // Try to extract domain name
        try {

            const domain = new URL(url).hostname;

            websiteName.textContent = domain;

        } catch {

            websiteName.textContent = "Unknown website";

        }

    } catch (error) {

        console.error("Error getting current tab:", error);

        websiteName.textContent = "Unable to detect";
        websiteUrl.textContent = "Error reading URL";
    }
}


// ------------------------------------
// Scan button
// ------------------------------------

scanButton.addEventListener("click", async () => {

    scanButton.disabled = true;

    scanButton.innerHTML = "⏳ Scanning...";

    riskLevel.textContent = "Scanning";

    riskScore.textContent = "--";

    riskProgress.style.width = "0%";

    riskDescription.textContent =
        "Preparing the website for security analysis...";

    indicators.innerHTML = `
        <li>Collecting website information...</li>
    `;

    recommendationText.textContent =
        "Please wait while ScamShield analyzes this website.";

    try {

        const tab = await getCurrentTab();

        console.log("Website URL:", tab.url);

        // For now, we are only displaying the URL.
        // Vercel + Groq will be connected later.

        setTimeout(() => {

            riskLevel.textContent = "Ready";

            riskScore.textContent = "--";

            riskProgress.style.width = "0%";

            riskDescription.textContent =
                "Backend analysis will be connected next.";

            indicators.innerHTML = `
                <li>URL successfully detected</li>
                <li>Ready for security analysis</li>
            `;

            recommendationText.textContent =
                "The ScamShield analysis engine is being prepared.";

            scanButton.disabled = false;

            scanButton.innerHTML =
                "🔍 Scan This Website";

        }, 1000);

    } catch (error) {

        console.error("Scan error:", error);

        riskLevel.textContent = "Error";

        riskDescription.textContent =
            "Unable to access the current website.";

        scanButton.disabled = false;

        scanButton.innerHTML =
            "🔍 Scan This Website";
    }

});


// ------------------------------------
// Report button
// ------------------------------------

reportButton.addEventListener("click", async () => {

    const tab = await getCurrentTab();

    if (!tab || !tab.url) {
        alert("Unable to detect the website URL.");
        return;
    }

    const confirmed = confirm(
        "Do you want to report this website as suspicious?"
    );

    if (confirmed) {

        console.log("Reported website:", tab.url);

        alert(
            "Thank you. Your report will be submitted."
        );

        // Later:
        // popup → Vercel → Supabase
    }
});


// ------------------------------------
// Run when popup opens
// ------------------------------------

loadCurrentWebsite();