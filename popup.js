document.addEventListener("DOMContentLoaded", () => {
  const analyzeButton = document.getElementById("analyzeButton");
  const statusMessage = document.getElementById("statusMessage");

  analyzeButton.addEventListener("click", async () => {
    statusMessage.textContent = "Analyzing visible profile information...";

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
          return document.body.innerText;
        }
      });

      const pageText = results[0]?.result || "";

      if (!pageText.trim()) {
        statusMessage.textContent =
          "Date Shield could not find visible profile information on this page.";
        return;
      }

      statusMessage.textContent =
        "Profile information found. Date Shield is ready for safety analysis.";
    } catch (error) {
      console.error("Date Shield analysis error:", error);

      statusMessage.textContent =
        "Date Shield cannot analyze this page. Try opening a regular website or profile page.";
    }
  });
});
