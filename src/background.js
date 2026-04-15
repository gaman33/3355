const DEFAULT_CONFIG = {
  apiKey: "",
  model: "gpt-5",
  businessTone: "professional, friendly, solution-oriented",
  autoTranslateIncoming: true,
  autoSuggestReply: false,
  useAutoLatestModel: true,
  knowledgeBase: []
};

const MODEL_PREFERENCES = ["gpt-5", "gpt-5-mini", "gpt-4.1", "gpt-4.1-mini"];

chrome.runtime.onInstalled.addListener(async () => {
  const current = await chrome.storage.local.get(Object.keys(DEFAULT_CONFIG));
  await chrome.storage.local.set({ ...DEFAULT_CONFIG, ...current });
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "OPENAI_CALL") {
    handleOpenAICall(message.payload).then((data) => sendResponse({ ok: true, data })).catch((error) => sendResponse({ ok: false, error: error.message }));
    return true;
  }
  if (message?.type === "GET_LATEST_MODEL") {
    resolveLatestModel().then((model) => sendResponse({ ok: true, model })).catch((error) => sendResponse({ ok: false, error: error.message }));
    return true;
  }
  return false;
});

async function handleOpenAICall(payload) {
  const cfg = await chrome.storage.local.get(["apiKey", "model", "useAutoLatestModel"]);
  const apiKey = cfg.apiKey;
  if (!apiKey) throw new Error("请先在插件选项中设置 OpenAI API Key");

  const model = payload.model || (cfg.useAutoLatestModel ? await resolveLatestModel(apiKey, cfg.model) : cfg.model) || DEFAULT_CONFIG.model;
  const reqBody = {
    model,
    input: payload.input,
    temperature: payload.temperature ?? 0.2,
    max_output_tokens: payload.maxOutputTokens ?? 1200
  };

  const resp = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(reqBody)
  });
  if (!resp.ok) throw new Error(`OpenAI API调用失败: ${resp.status} ${await resp.text()}`);

  const data = await resp.json();
  return { output_text: data.output_text || extractOutputText(data), model_used: data.model || model, raw: data };
}

async function resolveLatestModel(apiKeyParam, fallbackModel) {
  const cfg = await chrome.storage.local.get(["apiKey", "model"]);
  const apiKey = apiKeyParam || cfg.apiKey;
  const fallback = fallbackModel || cfg.model || DEFAULT_CONFIG.model;
  if (!apiKey) return fallback;

  const resp = await fetch("https://api.openai.com/v1/models", {
    headers: { Authorization: `Bearer ${apiKey}` }
  });
  if (!resp.ok) return fallback;
  const data = await resp.json();
  const available = new Set((data.data || []).map((m) => m.id));
  for (const pref of MODEL_PREFERENCES) {
    if (available.has(pref)) return pref;
  }
  return fallback;
}

function extractOutputText(data) {
  const chunks = [];
  for (const item of data.output || []) {
    for (const c of item.content || []) {
      if (c.type === "output_text" && c.text) chunks.push(c.text);
    }
  }
  return chunks.join("\n").trim();
}
