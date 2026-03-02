let globlChatVars2 = {
  chatbtnAllow: function () {
    const host = document.querySelector("#ai-sidebar-privacy-consent-host");
    return host?.shadowRoot?.querySelector("#ai_sidebar_accept_btn");
  },
  chatbtmdecline: function () {
    const host = document.querySelector("#ai-sidebar-privacy-consent-host");
    return host?.shadowRoot?.querySelector("#ai_sidebar_decline_btn");
  },
};
(function () {
  "use strict";

  const injectTime = performance.now();

  function loadSidebar() {
    (async () => {
      const { onExecute } = await import(
        /* @vite-ignore */
        chrome.runtime.getURL(
          "aitopia/assets/a06923325df9fc23634226f1be1668ff.js",
        )
      );
      onExecute?.({
        perf: { injectTime, loadTime: performance.now() - injectTime },
      });
    })().catch(console.error);
  }

  function createConsentBanner() {
    const host = document.createElement("div");
    host.id = "ai-sidebar-privacy-consent-host";
    host.style.cssText =
      "position:fixed; bottom:20px; right:20px; z-index:2147483647; font-family:sans-serif;";
    const shadow = host.attachShadow({ mode: "open" });

    const container = document.createElement("div");
    container.style.cssText = `
      background: #fff;
      border: 1px solid #e0e0e0;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      border-radius: 8px;
      width: 320px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      color: #333;
      font-size: 14px;
      line-height: 1.4;
    `;

    const title = document.createElement("strong");
    title.textContent = "AI Sidebar Privacy Notice";
    title.style.fontSize = "15px";

    const text = document.createElement("span");
    text.innerHTML =
      'To assist you on this page, the AI Sidebar extension requires access to read the page content. No data is sent to external servers without your action. <br><br> <a href="https://*deepseek.*ai/privacy-policy" target="_blank" style="color: #007bff; text-decoration: underline;">Privacy Policy</a>';

    const btnGroup = document.createElement("div");
    btnGroup.style.display = "flex";
    btnGroup.style.gap = "8px";
    btnGroup.style.justifyContent = "flex-end";

    const declineBtn = document.createElement("button");
    declineBtn.id = "ai_sidebar_decline_btn";
    declineBtn.textContent = "Decline";
    declineBtn.style.cssText = `
      background: transparent;
      border: 1px solid #ccc;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
      color: #666;
    `;
    declineBtn.onmouseover = () => (declineBtn.style.background = "#f5f5f5");
    declineBtn.onmouseout = () => (declineBtn.style.background = "transparent");
    declineBtn.onclick = () => {
      host.remove();
      // Optional: Save 'false' to not ask again for a while, or just close for now.
      // chrome.storage.local.set({ chatFlag: false });
    };

    const acceptBtn = document.createElement("button");
    acceptBtn.textContent = "Accept";
    acceptBtn.id = "ai_sidebar_accept_btn";
    acceptBtn.style.cssText = `
      background: #007bff;
      border: none;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
      color: #fff;
      font-weight: 500;
    `;
    acceptBtn.onmouseover = () => (acceptBtn.style.background = "#0056b3");
    acceptBtn.onmouseout = () => (acceptBtn.style.background = "#007bff");
    acceptBtn.onclick = () => {
      chrome.storage.local.set({ chatFlag: true }, () => {
        host.remove();
        loadSidebar();
      });
    };

    btnGroup.appendChild(declineBtn);
    btnGroup.appendChild(acceptBtn);

    container.appendChild(title);
    container.appendChild(text);
    container.appendChild(btnGroup);
    shadow.appendChild(container);

    document.documentElement.appendChild(host);
  }

  // Check consent before loading
  chrome.storage.local.get(["chatFlag"], (result) => {
    if (result.chatFlag === true) {
      loadSidebar();
    } else {
      // Only show banner if specifically not consented (undefined or false)
      createConsentBanner();
    }
  });
})();

function attachClickListeners() {
  globlChatVars2.chatbtnAllow()?.addEventListener("click", () => {
    chrome.storage.local.set({ chatFlag: true }, function () {
      msgPassing.sendMassage("OpenPopupclick", null);
    });
  });

  globlChatVars2.chatbtmdecline()?.addEventListener("click", () => {
    chrome.storage.local.set({ chatFlag: false }, function () {
      msgPassing.sendMassage("ClosePopupclick", null);
    });
  });
}

let msgPassing = {
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

  onMessage: function (callback) {
    chrome.runtime.onMessage.addListener((req, sender, sendr) => {
      callback(req, sender, sendr);
    });
  },

  hadleMessage: function (response, sender, sendResponse) {
    if (response.messageType == "OpenPopupclick") {
      chrome.storage.local.set({ chatFlag: true }, function () {
        gptRuntimeContext.chatFlag = true;
        gptSidebarBridge.fetchAssistantState({
          uId: gptRuntimeContext.chatId,
          chatFlag: gptRuntimeContext.chatFlag,
        });
        sendResponse("msg recive");
      });
    } else if (response.messageType == "ClosePopupclick") {
      chrome.storage.local.set({ chatFlag: false }, function () {
        gptRuntimeContext.chatFlag = false;
        gptSidebarBridge.fetchAssistantState({
          uId: gptRuntimeContext.chatId,
          chatFlag: gptRuntimeContext.chatFlag,
        });
        sendResponse("msg recive");
      });
    } else {
    }
  },
};

setTimeout(attachClickListeners, 2000);
