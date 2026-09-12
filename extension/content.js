// ScamShield webpage text extractor

function extractPageText() {

    const text = document.body.innerText || "";

    return text
        .replace(/\s+/g, " ")
        .trim()
        .substring(0, 10000);
}


// Listen for messages from popup.js

chrome.runtime.onMessage.addListener(
    (message, sender, sendResponse) => {

        if (message.action === "extractPageText") {

            const pageText = extractPageText();

            sendResponse({
                success: true,
                text: pageText
            });
        }

        return true;
    }
);