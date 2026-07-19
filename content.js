// Date Shield
// Local, rule-based dating safety analysis.
// This script does not label a person as a scammer or make accusations.
// It identifies explainable warning signals in user-selected page content.

function analyzeDateSafety(pageText) {
  const text = pageText.toLowerCase();

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
      ],
      explanation:
        "Requests for money can be a warning signal in online romance scams, especially when you have not met the person."
    },
    {
      category: "Gift Card Request",
      keywords: [
        "gift card",
        "gift cards",
        "itunes card",
        "google play card",
        "steam card"
      ],
      explanation:
        "Requests for payment through gift cards can be a significant scam warning signal."
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
      ],
      explanation:
        "Unexpected investment or cryptocurrency opportunities introduced through an online relationship deserve additional verification."
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
      ],
      explanation:
        "Requests for sensitive financial information should be treated with caution."
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
      ],
      explanation:
        "Unexpected emergencies combined with requests for financial assistance are a known romance-scam pattern."
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
      ],
      explanation:
        "Quickly moving conversations away from a dating platform can reduce the protections and reporting tools provided by that platform."
    }
  ];

  const detectedSignals = [];

  for (const signal of signals) {
    const matchedKeywords = signal.keywords.filter((keyword) =>
      text.includes(keyword)
    );

    if (matchedKeywords.length > 0) {
      detectedSignals.push({
        category: signal.category,
        explanation: signal.explanation,
        matchedKeywords: matchedKeywords
      });
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
    cautionLevel: cautionLevel,
    signalCount: detectedSignals.length,
    signals: detectedSignals,
    disclaimer:
      "These signals do not prove that a person is deceptive or involved in a scam. Date Shield provides informational warning signals to help you decide what to verify."
  };
}
