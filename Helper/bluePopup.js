// Constants
const REVIEW_URL =
  "https://chromewebstore.google.com/detail/deepseek/inhcgfpbfdjbjogdfjbclgolkmhnooop/reviews";

// DOM Elements
const elements = {
  closeButton: document.getElementById("closeButton"),
  rateButton: document.getElementById("rateUsButton"),
};

const handlers = {
  close: () => window.close(),
  rate: () => chrome.tabs.create({ url: REVIEW_URL }),
};

async function initializePopup() {
  try {
    setTimeout(async () => {
      await chrome.runtime.sendMessage({ messageType: "OpenPopup" });

      elements.closeButton?.addEventListener("click", handlers.close);
      elements.rateButton?.addEventListener("click", handlers.rate);
      domNode.settingImg()?.addEventListener("click", eventList.eventHandler);
      domNode
        .switchbtn()
        ?.addEventListener("click", eventList.swichBtn.bind(eventList));
      domNode.backIcon()?.addEventListener("click", eventList.backIconHandler);
      eventList.intialToggle();
    }, 500);
  } catch (error) {
    console.error("Failed to initialize popup:", error);
  }
}

// Start the application

let domNode = {
  settingImg() {
    return document.getElementById("settingImg");
  },
  toggleBox() {
    return document.getElementById("togglebox");
  },

  rateingBox() {
    return document.getElementById("popup-container");
  },
  switchbtn() {
    return document.getElementById("togglep");
  },
  backIcon() {
    return document.getElementById("backIcon");
  },
  chckBoxInput() {
    return document.getElementById("switchToggle");
  },
};

let eventList = {
  eventHandler(e) {
    domNode.rateingBox().classList.contains("hide")
      ? domNode.rateingBox().classList.remove("hide")
      : domNode.rateingBox().classList.add("hide");
    domNode.toggleBox().classList.contains("hide")
      ? domNode.toggleBox().classList.remove("hide")
      : domNode.toggleBox().classList.add("hide");
  },

  backIconHandler() {
    domNode.rateingBox().classList.contains("hide")
      ? domNode.rateingBox().classList.remove("hide")
      : domNode.rateingBox().classList.add("hide");
    domNode.toggleBox().classList.contains("hide")
      ? domNode.toggleBox().classList.remove("hide")
      : domNode.toggleBox().classList.add("hide");
  },

  swichBtn(e) {
    console.log("runnnn....");
    let chckBox = domNode.chckBoxInput();
    console.log(chckBox.checked, " chckBox.checked");
    chckBox.checked = !chckBox.checked;
    let msg = chckBox.checked == true ? "OpenPopupclick" : "ClosePopupclick";
    this.sendMassage(msg, null);
  },

  sendMassage: function (
    messageType,
    body,
    callback = (res) => {
      //  console.log("res", res);
    },
  ) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ messageType, body }, (response) => {
        if (chrome.runtime.lastError) {
          callback(chrome.runtime.lastError);
          reject(chrome.runtime.lastError);
        } else {
          callback(response);
          resolve(response);
        }
      });
    });
  },

  async intialToggle() {
    domNode.chckBoxInput().checked =
      (await getSetValues.getValue("chatFlag")) || false;
  },
};

let getSetValues = {
  getValue(key) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get([key], (r) => {
        resolve(r[key] || null);
      });
    });
  },
  setValue(key, value) {
    return new Promise((resolve, reject) => {
      try {
        chrome.storage.local.set({ [key]: value }, () => {
          resolve("value save");
        });
      } catch (e) {
        console.error(e);
        reject(e);
      }
    });
  },
};

document.addEventListener("DOMContentLoaded", initializePopup);
