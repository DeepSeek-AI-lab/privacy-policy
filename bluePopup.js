// DOM Elements
const elements = {
  closeButton: document.getElementById("closeButton"),
};

const handlers = {
  close: () => window.close(),
};

async function initializePopup() {
  try {
    await chrome.runtime.sendMessage({ messageType: "OpenPopup" });
    elements.closeButton?.addEventListener("click", handlers.close);
  } catch (error) {
    console.error("Failed to initialize popup:", error);
  }
}

document.addEventListener("DOMContentLoaded", initializePopup);
