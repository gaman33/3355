const DEFAULTS = {
  apiKey: "",
  model: "gpt-5",
  businessTone: "professional, friendly, solution-oriented",
  autoTranslateIncoming: true,
  autoSuggestReply: false,
  useAutoLatestModel: true,
  contextMaxChars: 240000,
  knowledgeBase: []
};

async function load() {
  const cfg = await chrome.storage.local.get(Object.keys(DEFAULTS));
  const merged = { ...DEFAULTS, ...cfg };
  document.getElementById("apiKey").value = merged.apiKey;
  document.getElementById("model").value = merged.model;
  document.getElementById("businessTone").value = merged.businessTone;
  document.getElementById("autoTranslateIncoming").checked = !!merged.autoTranslateIncoming;
  document.getElementById("autoSuggestReply").checked = !!merged.autoSuggestReply;
  document.getElementById("useAutoLatestModel").checked = !!merged.useAutoLatestModel;
  document.getElementById("contextMaxChars").value = merged.contextMaxChars;
  document.getElementById("knowledgeBase").value = JSON.stringify(merged.knowledgeBase, null, 2);
}

async function save() {
  let knowledgeBase;
  try {
    const raw = document.getElementById("knowledgeBase").value.trim();
    knowledgeBase = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(knowledgeBase)) throw new Error("知识库必须是JSON数组");
  } catch (e) {
    return setStatus(`保存失败：${e.message}`);
  }

  const payload = {
    apiKey: document.getElementById("apiKey").value.trim(),
    model: document.getElementById("model").value.trim() || DEFAULTS.model,
    businessTone: document.getElementById("businessTone").value.trim() || DEFAULTS.businessTone,
    autoTranslateIncoming: document.getElementById("autoTranslateIncoming").checked,
    autoSuggestReply: document.getElementById("autoSuggestReply").checked,
    useAutoLatestModel: document.getElementById("useAutoLatestModel").checked,
    contextMaxChars: Number(document.getElementById("contextMaxChars").value || DEFAULTS.contextMaxChars),
    knowledgeBase
  };
  await chrome.storage.local.set(payload);
  setStatus("保存成功");
}

async function checkLatestModel() {
  const res = await chrome.runtime.sendMessage({ type: "GET_LATEST_MODEL" });
  if (!res?.ok) return setStatus(`查询失败：${res?.error || "unknown"}`);
  setStatus(`当前检测到可用优先模型：${res.model}`);
}

function setStatus(msg) {
  document.getElementById("status").innerText = msg;
  setTimeout(() => (document.getElementById("status").innerText = ""), 3000);
}

document.getElementById("save").addEventListener("click", save);
document.getElementById("checkModel").addEventListener("click", checkLatestModel);
load();
