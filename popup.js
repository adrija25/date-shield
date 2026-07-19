document.addEventListener("DOMContentLoaded", () => {
  const analyzeButton = document.getElementById("analyzeButton");
  const statusMessage = document.getElementById("statusMessage");

  analyzeButton.addEventListener("click", async () => {
    statusMessage.textContent = "Preparing to analyze this profile...";

    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true
    });

    if (!tab || !tab.id) {
      statusMessage.textContent = "Date Shield could not access this page.";
      return;
    }

    statusMessage.textContent = "Date Shield is ready to analyze this profile.";
  });
});
