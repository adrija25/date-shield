document.addEventListener("DOMContentLoaded", () => {
  const analyzeButton = document.getElementById("analyzeButton");
  const statusMessage = document.getElementById("statusMessage");

  analyzeButton.addEventListener("click", async () => {
    statusMessage.textContent = "Analyzing profile information...";

    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
      });

      if (!tab || !tab.id) {
        statusMessage.textContent = "Date Shield could not access this page.";
        return;
      }

      const results = await chrome.scripting.executeScript({
        target: {
          tabId: tab.id
        },
        func: () => {
          const selectedText = window.getSelection().toString().trim();

          if (!selectedText) {
            return {
              requiresSelection: true
            };
          }

          const pageText = selectedText.toLowerCase();

          const signals = [
            {
              category: "Financial Request",
              keywords: [
                "send me money",
                "send money",
                "wire money",
                "transfer money",
                "lend me money",
                "need money",
                "financial help"
              ]
            },
            {
              category: "Gift Card Request",
              keywords: [
                "gift card",
                "gift cards",
                "itunes card",
                "google play card",
                "steam card"
              ]
            },
            {
              category: "Cryptocurrency or Investment",
              keywords: [
                "cryptocurrency",
                "crypto investment",
                "invest in crypto",
                "bitcoin investment",
                "investment opportunity",
                "trading platform"
              ]
            },
            {
              category: "Sensitive Financial Information",
              keywords: [
                "bank account",
                "bank details",
                "account number",
                "credit card details",
                "debit card details",
                "online banking"
              ]
            },
            {
              category: "Urgent Financial Situation",
              keywords: [
                "medical emergency",
                "family emergency",
                "emergency money",
                "urgent payment",
                "hospital bill",
                "stuck overseas"
              ]
            },
            {
              category: "Moving Communication Off Platform",
              keywords: [
                "message me on whatsapp",
                "contact me on whatsapp",
                "talk on telegram",
                "message me on telegram",
                "move to whatsapp",
                "move to telegram"
              ]
            }
          ];

          const detectedSignals = [];

          for (const signal of signals) {
            const matched = signal.keywords.some((keyword) =>
              pageText.includes(keyword)
            );

            if (matched) {
              detectedSignals.push(signal.category);
            }
          }

          let cautionLevel = "Low";

          if (detectedSignals.length >= 4) {
            cautionLevel = "High";
          } else if (detectedSignals.length >= 2) {
            cautionLevel = "Elevated";
          } else if (detectedSignals.length === 1) {
            cautionLevel = "Moderate";
          }

          return {
            requiresSelection: false,
            cautionLevel: cautionLevel,
            signalCount: detectedSignals.length,
            signals: detectedSignals,
            analysisSource: "Selected profile text"
          };
        }
      });

      const analysis = results[0]?.result;

      if (!analysis) {
        statusMessage.textContent =
          "Date Shield could not analyze this page.";
        return;
      }

      if (analysis.requiresSelection) {
        statusMessage.textContent =
          "Please highlight the profile or conversation text you want to check, then click Analyze This Profile again.";
        return;
      }

      if (analysis.signalCount === 0) {
        statusMessage.textContent =
          analysis.analysisSource +
          ": Caution Level: Low — No matching warning signals were found. This does not guarantee that the profile is safe or authentic.";
        return;
      }

      statusMessage.textContent =
        analysis.analysisSource +
        ": Caution Level: " +
        analysis.cautionLevel +
        " — " +
        analysis.signalCount +
        " warning signal(s) found: " +
        analysis.signals.join(", ") +
        ". These signals do not prove that the person is deceptive. Review and independently verify important claims.";
    } catch (error) {
      console.error("Date Shield analysis error:", error);

      statusMessage.textContent =
        "Date Shield cannot analyze this page. Try opening a regular website or profile page.";
    }
  });
});
