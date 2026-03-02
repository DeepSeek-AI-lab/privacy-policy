import "./aitopia/service-worker-loader.js";
import "./Helper/chatsAns.js";
// Background script for handling popup window management
const CHAT_URL = "https://chat.deepseek.com/";

let popupWindowId = null;

const POPUP_WIDTH = 1050;
const POPUP_HEIGHT = 900;

// Message handler for popup operations
const messageHandlers = {
  OpenPopup: async () => {
    // Get display info to center the popup
    const displayInfo = await chrome.system.display.getInfo();
    const primaryDisplay =
      displayInfo.find((d) => d.isPrimary) || displayInfo[0];
    const { width: screenWidth, height: screenHeight } =
      primaryDisplay.workArea;

    // Calculate centered position
    const left = Math.round((screenWidth - POPUP_WIDTH) / 2);
    const top = Math.round((screenHeight - POPUP_HEIGHT) / 2);

    // Create centered popup window
    chrome.windows.create(
      {
        url: CHAT_URL,
        type: "popup",
        focused: true,
        width: POPUP_WIDTH,
        height: POPUP_HEIGHT,
        left: left,
        top: top,
      },
      (window) => {
        popupWindowId = window.id;
      },
    );
  },
  ClosePopup: () => {
    if (popupWindowId) {
      chrome.windows.remove(popupWindowId, () => {
        popupWindowId = null;
      });
    }
  },
};

// Listen for messages
chrome.runtime.onMessage.addListener((message) => {
  const handler = messageHandlers[message.messageType];
  if (handler) {
    handler();
  }
});

// Open DeepSeek chat when extension icon is clicked
chrome.action.onClicked.addListener(() => {
  messageHandlers.OpenPopup();
});
