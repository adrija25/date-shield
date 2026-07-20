document.addEventListener("DOMContentLoaded", () => {
  const analyzeButton = document.getElementById("analyzeButton");
  const statusMessage = document.getElementById("statusMessage");

  analyzeButton.addEventListener("click", async () => {
    statusMessage.textContent = "Analyzing dating safety signals...";

    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
      });

      if (!tab || !tab.id) {
        statusMessage.textContent =
          "Date Shield could not access this page.";
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
              needsSelection: true
            };
          }

          const text = selectedText.toLowerCase();

          const signalRules = [
            {
              category: "Financial Request",
              severity: 3,
              keywords: [
                "send me money",
                "send money",
                "wire me money",
                "wire money",
                "transfer me money",
                "transfer money",
                "lend me money",
                "loan me money",
                "need money",
                "financial help",
                "help me financially",
                "borrow money"
              ],
              explanation:
                "Requests for money from someone you know primarily through an online relationship can be an important romance-scam warning signal.",
              recommendation:
                "Do not send money based only on an online relationship. Independently verify the situation and the person's identity."
            },
            {
              category: "Gift Card Request",
              severity: 3,
              keywords: [
                "gift card",
                "gift cards",
                "itunes card",
                "apple gift card",
                "google play card",
                "steam card",
                "amazon gift card",
                "prepaid card"
              ],
              explanation:
                "Requests involving gift cards or prepaid cards deserve significant caution because these payment methods can be difficult to recover.",
              recommendation:
                "Do not purchase or send gift card codes for someone you have met primarily online."
            },
            {
              category: "Cryptocurrency or Investment Pitch",
              severity: 3,
              keywords: [
                "cryptocurrency",
                "crypto investment",
                "invest in crypto",
                "invest with me",
                "bitcoin investment",
                "investment opportunity",
                "trading platform",
                "forex trading",
                "crypto trading",
                "investment returns",
                "guaranteed returns"
              ],
              explanation:
                "Romantic relationships that unexpectedly lead to cryptocurrency, trading, or investment opportunities can require additional caution.",
              recommendation:
                "Do not transfer money or invest through a platform recommended by an online romantic contact without independently verifying the platform."
            },
            {
              category: "Sensitive Financial Information Request",
              severity: 3,
              keywords: [
                "bank account",
                "bank details",
                "account number",
                "routing number",
                "credit card details",
                "debit card details",
                "online banking",
                "bank login",
                "bank password"
              ],
              explanation:
                "Requests for banking or payment information can expose you to financial loss or identity misuse.",
              recommendation:
                "Do not share banking credentials, card details, passwords, or other sensitive financial information."
            },
            {
              category: "Emergency or Crisis Narrative",
              severity: 2,
              keywords: [
                "medical emergency",
                "family emergency",
                "financial emergency",
                "emergency money",
                "urgent payment",
                "hospital bill",
                "hospital bills",
                "stuck overseas",
                "stranded overseas",
                "passport problem",
                "customs fee",
                "need help urgently",
                "need your help urgently"
              ],
              explanation:
                "Unexpected emergencies can be genuine, but repeated crisis stories combined with financial requests are a known romance-scam pattern.",
              recommendation:
                "Verify the situation independently before providing money or sensitive information."
            },
            {
              category: "Rapid Emotional Escalation",
              severity: 1,
              keywords: [
                "i love you already",
                "i think i love you",
                "you are my soulmate",
                "you're my soulmate",
                "we are meant to be",
                "we're meant to be",
                "i want to marry you",
                "marry you soon",
                "spend my life with you",
                "future together",
                "destined to be together"
              ],
              explanation:
                "Very rapid declarations of love, destiny, or long-term commitment can sometimes be used to build trust before other requests are introduced.",
              recommendation:
                "Allow trust to develop over time and independently verify important claims before making major emotional or financial commitments."
            },
            {
              category: "Meeting or Video Call Avoidance",
              severity: 2,
              keywords: [
                "can't video call",
                "cannot video call",
                "can't do video",
                "camera is broken",
                "camera doesn't work",
                "camera does not work",
                "can't meet you",
                "cannot meet you",
                "can't meet right now",
                "can't meet in person",
                "cannot meet in person",
                "meeting got cancelled",
                "cancel our meeting",
                "postpone our meeting",
                "maybe another time"
              ],
              explanation:
                "Repeated avoidance of live video calls or in-person meetings can make it harder to verify that someone is who they claim to be.",
              recommendation:
                "Consider requesting a live video call or another reasonable verification method before increasing trust."
            },
            {
              category: "Moving Conversation Off Platform",
              severity: 1,
              keywords: [
                "message me on whatsapp",
                "contact me on whatsapp",
                "move to whatsapp",
                "let's use whatsapp",
                "lets use whatsapp",
                "talk on telegram",
                "message me on telegram",
                "move to telegram",
                "let's use telegram",
                "lets use telegram",
                "text me privately",
                "continue somewhere private"
              ],
              explanation:
                "Moving quickly away from a dating platform may reduce access to the platform's safety, moderation, and reporting tools.",
              recommendation:
                "Consider keeping early conversations on the original platform until you are comfortable with the person's identity and intentions."
            },
            {
              category: "Request for Sensitive Personal Information",
              severity: 3,
              keywords: [
                "send your passport",
                "send me your passport",
                "passport photo",
                "send your id",
                "send me your id",
                "id card photo",
                "social security number",
                "aadhaar number",
                "aadhar number",
                "pan card",
                "otp code",
                "send me the otp",
                "verification code"
              ],
              explanation:
                "Requests for identity documents, verification codes, or highly sensitive personal information can create identity-theft or account-security risks.",
              recommendation:
                "Do not share identity documents, passwords, OTPs, or account verification codes with an online romantic contact."
            },
            {
              category: "Secrecy or Isolation Pressure",
              severity: 2,
              keywords: [
                "don't tell anyone",
                "dont tell anyone",
                "keep this between us",
                "keep it a secret",
                "our little secret",
                "your family won't understand",
                "your family wont understand",
                "don't tell your family",
                "dont tell your family",
                "don't tell your friends",
                "dont tell your friends"
              ],
              explanation:
                "Pressure to hide a relationship, financial request, or important interaction from trusted people can reduce opportunities for independent perspective.",
              recommendation:
                "Consider discussing significant requests or concerns with someone you trust before taking action."
            }
          ];

          const detectedSignals = [];

          for (const rule of signalRules) {
            const matchedKeywords = rule.keywords.filter((keyword) =>
              text.includes(keyword)
            );

            if (matchedKeywords.length > 0) {
              detectedSignals.push({
                category: rule.category,
                severity: rule.severity,
                explanation: rule.explanation,
                recommendation: rule.recommendation
              });
            }
          }

          const totalSeverity = detectedSignals.reduce(
            (total, signal) => total + signal.severity,
            0
          );

          let cautionLevel = "Low";

          if (totalSeverity >= 8 || detectedSignals.length >= 4) {
            cautionLevel = "High";
          } else if (
            totalSeverity >= 4 ||
            detectedSignals.length >= 2
          ) {
            cautionLevel = "Elevated";
          } else if (detectedSignals.length === 1) {
            cautionLevel = "Moderate";
          }

          return {
            needsSelection: false,
            cautionLevel: cautionLevel,
            signalCount: detectedSignals.length,
            signals: detectedSignals
          };
        }
      });

      const analysis = results[0]?.result;

      if (!analysis) {
        statusMessage.textContent =
          "Date Shield could not analyze this page.";
        return;
      }

      if (analysis.needsSelection) {
        statusMessage.textContent =
          "Please highlight the dating profile or conversation text you want to check, then click Analyze This Profile again.";
        return;
      }

      if (analysis.signalCount === 0) {
        statusMessage.textContent =
          "Caution Level: Low\n\n" +
          "No matching dating safety or romance scam warning signals were found in the selected text.\n\n" +
          "This does not guarantee that the person is safe, authentic, or trustworthy. Consider verifying important claims independently.";
        return;
      }

      let resultText =
        "Caution Level: " +
        analysis.cautionLevel +
        "\n\n" +
        analysis.signalCount +
        " warning signal(s) found:\n\n";

      analysis.signals.forEach((signal, index) => {
        resultText +=
          (index + 1) +
          ". " +
          signal.category +
          "\n" +
          "Why it matters: " +
          signal.explanation +
          "\n" +
          "Recommended next step: " +
          signal.recommendation +
          "\n\n";
      });

      resultText +=
        "These signals do not prove that the person is deceptive or involved in a scam. Date Shield provides informational warning signals to help you decide what to verify.";

      statusMessage.textContent = resultText;
    } catch (error) {
      console.error("Date Shield analysis error:", error);

      statusMessage.textContent =
        "Date Shield cannot analyze this page. Try selecting profile or conversation text on a regular webpage and run the check again.";
    }
  });
});
