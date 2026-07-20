document.addEventListener("DOMContentLoaded", () => {
  const analyzeButton = document.getElementById("analyzeButton");
  const statusMessage = document.getElementById("statusMessage");

  const planBadge = document.getElementById("planBadge");
  const proUpgradeSection = document.getElementById("proUpgradeSection");
  const upgradeButton = document.getElementById("upgradeButton");
  const activateButton = document.getElementById("activateButton");

  const cautionResult = document.getElementById("cautionResult");
  const cautionLevel = document.getElementById("cautionLevel");

  const signalsContainer = document.getElementById("signalsContainer");
  const signalsList = document.getElementById("signalsList");

  const nextStepsContainer = document.getElementById("nextStepsContainer");
  const nextStepsList = document.getElementById("nextStepsList");

  // Temporary access state.
  // This will later be replaced by secure backend activation validation.
  let isPro = false;

  function updatePlanUI() {
    if (isPro) {
      planBadge.textContent = "PRO";
      proUpgradeSection.hidden = true;
    } else {
      planBadge.textContent = "FREE";
      proUpgradeSection.hidden = false;
    }
  }

  updatePlanUI();

  function resetResults() {
    cautionResult.hidden = true;
    signalsContainer.hidden = true;
    nextStepsContainer.hidden = true;

    cautionLevel.textContent = "";
    signalsList.innerHTML = "";
    nextStepsList.innerHTML = "";
  }

  analyzeButton.addEventListener("click", async () => {
    resetResults();

    statusMessage.textContent =
      "Analyzing selected dating profile or conversation text...";

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
                "i need some money",
                "i need your money",
                "financial help",
                "help me financially",
                "borrow money",
                "can you help me with money",
                "could you help me with money",
                "can you send me some money",
                "could you send me some money",
                "help me pay",
                "pay this for me"
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
                "prepaid card",
                "buy me a card",
                "send me the gift card code",
                "send the card code",
                "scratch the card",
                "send me a voucher"
              ],
              explanation:
                "Requests involving gift cards or prepaid cards deserve significant caution because these payment methods can be difficult to recover.",
              recommendation:
                "Do not purchase or send gift card or prepaid-card codes for someone you have met primarily online."
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
                "guaranteed returns",
                "make money together",
                "investment account",
                "i can teach you to trade",
                "teach you crypto",
                "start investing",
                "investment strategy",
                "profitable investment",
                "double your money"
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
                "bank password",
                "card number",
                "cvv number",
                "send your bank details",
                "give me your bank details"
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
                "passport issue",
                "customs fee",
                "customs payment",
                "need help urgently",
                "need your help urgently",
                "i'm in trouble",
                "i am in trouble",
                "something terrible happened",
                "unexpected emergency",
                "urgent situation",
                "need to pay immediately"
              ],
              explanation:
                "Unexpected emergencies can be genuine, but repeated crisis stories combined with requests for financial assistance can be a romance-scam warning pattern.",
              recommendation:
                "Verify the situation independently before providing money, payment, or sensitive information."
            },

            {
              category: "Rapid Emotional Escalation",
              severity: 1,
              keywords: [
                "i love you already",
                "i think i love you",
                "i'm falling for you",
                "i am falling for you",
                "falling in love with you",
                "i've fallen for you",
                "i have fallen for you",
                "i've never felt this way",
                "i have never felt this way",
                "never felt this way before",
                "i feel so connected to you",
                "i feel a deep connection",
                "i feel like i've known you forever",
                "i feel like i have known you forever",
                "feels like i've known you forever",
                "feels like i have known you forever",
                "you understand me like no one else",
                "you are the one",
                "you're the one",
                "you are my soulmate",
                "you're my soulmate",
                "we are meant to be",
                "we're meant to be",
                "meant for each other",
                "i can see a future with you",
                "i see a future with you",
                "our future together",
                "future together",
                "i want to marry you",
                "marry you someday",
                "marry you soon",
                "spend my life with you",
                "destined to be together"
              ],
              explanation:
                "Very rapid emotional intensity or declarations of long-term commitment can sometimes be used to build trust before other requests are introduced.",
              recommendation:
                "Consider how long you have known the person. Allow trust to develop over time and independently verify important claims before making major emotional or financial commitments."
            },

            {
              category: "Meeting or Video Call Avoidance",
              severity: 2,
              keywords: [
                "can't video call",
                "cannot video call",
                "can't do a video call",
                "can't do video",
                "not comfortable with video calls",
                "camera is broken",
                "my camera is broken",
                "camera doesn't work",
                "camera does not work",
                "bad internet for video",
                "internet is too bad for video",
                "can't meet you",
                "cannot meet you",
                "can't meet right now",
                "can't meet in person",
                "cannot meet in person",
                "not ready to meet",
                "maybe we can meet later",
                "maybe another time",
                "meeting got cancelled",
                "cancel our meeting",
                "have to cancel our meeting",
                "postpone our meeting",
                "something came up",
                "can't make it today",
                "cannot make it today"
              ],
              explanation:
                "Repeated avoidance of live video calls or in-person meetings can make it harder to verify that someone is who they claim to be.",
              recommendation:
                "If avoidance becomes a repeated pattern, consider requesting a reasonable live verification method before increasing trust."
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
                "whatsapp me",
                "give me your whatsapp",
                "talk on telegram",
                "message me on telegram",
                "move to telegram",
                "let's use telegram",
                "lets use telegram",
                "telegram me",
                "give me your telegram",
                "text me privately",
                "message me privately",
                "continue somewhere private",
                "let's talk somewhere else",
                "lets talk somewhere else",
                "get off this app",
                "leave this app",
                "delete the dating app"
              ],
              explanation:
                "Moving quickly away from a dating platform may reduce access to the platform's safety, moderation, and reporting tools.",
              recommendation:
                "Consider keeping early conversations on the original platform until you are comfortable with the person's identity and intentions."
            },

            {
              category: "Sensitive Personal Information Request",
              severity: 3,
              keywords: [
                "send your passport",
                "send me your passport",
                "passport photo",
                "send your id",
                "send me your id",
                "id card photo",
                "identity document",
                "social security number",
                "aadhaar number",
                "aadhar number",
                "pan card",
                "otp code",
                "send me the otp",
                "tell me the otp",
                "verification code",
                "send the verification code",
                "tell me the verification code",
                "what is your password",
                "send me your password"
              ],
              explanation:
                "Requests for identity documents, passwords, verification codes, or highly sensitive personal information can create identity-theft or account-security risks.",
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
                "keep it between us",
                "keep it a secret",
                "our little secret",
                "no one needs to know",
                "nobody needs to know",
                "your family won't understand",
                "your family wont understand",
                "your friends won't understand",
                "your friends wont understand",
                "don't tell your family",
                "dont tell your family",
                "don't tell your friends",
                "dont tell your friends",
                "they will try to separate us",
                "they're jealous of us",
                "they are jealous of us"
              ],
              explanation:
                "Pressure to hide a relationship, financial request, or important interaction from trusted people can reduce opportunities for independent perspective.",
              recommendation:
                "Consider discussing significant requests or concerns with someone you trust before taking action."
            },

            {
              category: "Unusual Distance or Travel Explanation",
              severity: 1,
              keywords: [
                "working overseas",
                "working abroad",
                "deployed overseas",
                "military deployment",
                "on an oil rig",
                "working on an oil rig",
                "offshore worker",
                "currently overseas",
                "currently abroad",
                "traveling for work",
                "travelling for work",
                "can't come home yet",
                "cannot come home yet"
              ],
              explanation:
                "Being abroad or traveling for work is not inherently suspicious. However, distance explanations can become relevant when combined with repeated meeting avoidance, emergencies, or financial requests.",
              recommendation:
                "Treat this as contextual information rather than proof of deception. Look for combinations with stronger warning signals and verify important claims independently."
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
          "Please highlight the dating profile or conversation text you want to check, then click Analyze Selected Text again.";
        return;
      }

      cautionResult.hidden = false;
      cautionLevel.textContent = analysis.cautionLevel;

      if (analysis.signalCount === 0) {
        statusMessage.textContent =
          "No matching dating-safety or romance-scam warning signals were found in the selected text. This does not guarantee that the person is safe, authentic, or trustworthy. Consider verifying important claims independently.";
        return;
      }

      statusMessage.textContent =
        analysis.signalCount +
        " explainable warning signal(s) found in the selected text.";

      signalsContainer.hidden = false;

      // FREE users can see detected signal names.
      // PRO users can also see detailed explanations and recommended next steps.
      nextStepsContainer.hidden = !isPro;

      const uniqueRecommendations = new Set();

      analysis.signals.forEach((signal) => {
        const signalCard = document.createElement("div");
        signalCard.className = "signal-card";

        const signalTitle = document.createElement("p");
        signalTitle.className = "signal-title";
        signalTitle.textContent = signal.category;

        signalCard.appendChild(signalTitle);

        // Detailed explanations are available only to Pro users.
        if (isPro) {
          const signalExplanation = document.createElement("p");
          signalExplanation.className = "signal-explanation";
          signalExplanation.textContent = signal.explanation;

          signalCard.appendChild(signalExplanation);

          if (signal.recommendation) {
            uniqueRecommendations.add(signal.recommendation);
          }
        }

        signalsList.appendChild(signalCard);
      });

      // Recommended next steps are available only to Pro users.
      if (isPro) {
        uniqueRecommendations.forEach((recommendation) => {
          const nextStep = document.createElement("p");
          nextStep.className = "next-step-item";
          nextStep.textContent = recommendation;

          nextStepsList.appendChild(nextStep);
        });
      }
    } catch (error) {
      console.error("Date Shield analysis error:", error);

      statusMessage.textContent =
        "Date Shield cannot analyze this page. Try selecting dating profile or conversation text on a regular webpage and run the check again.";
    }
  });
});
