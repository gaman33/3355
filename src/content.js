(function () {
  if (window.__WA_AI_ASSISTANT_INIT__) return;
  window.__WA_AI_ASSISTANT_INIT__ = true;

  const core = window.WAAssistantCore;
  const state = {
    phone: null,
    locale: null,
    inferredCustomerLanguage: "en",
    lastIncomingText: "",
    autoTranslateIncoming: true,
    autoSuggestReply: false,
    businessTone: "professional, friendly, solution-oriented",
    knowledgeBase: [],
    contextMaxChars: 240000
  };

  const ui = buildPanel();
  init().catch((e) => setStatus(`初始化失败: ${e.message}`));

  async function init() {
    const cfg = await chrome.storage.local.get(["autoTranslateIncoming", "autoSuggestReply", "businessTone", "knowledgeBase", "contextMaxChars"]);
    state.autoTranslateIncoming = cfg.autoTranslateIncoming ?? true;
    state.autoSuggestReply = cfg.autoSuggestReply ?? false;
    state.businessTone = cfg.businessTone || state.businessTone;
    state.knowledgeBase = cfg.knowledgeBase || [];
    state.contextMaxChars = cfg.contextMaxChars || state.contextMaxChars;

    setStatus("已启动，等待会话加载...");
    refreshMeta();

    const observer = new MutationObserver(onDomChanged);
    observer.observe(document.body, { childList: true, subtree: true });
    setInterval(refreshMeta, 15000);
  }

  function onDomChanged() {
    refreshMeta();
    const incoming = getLastIncomingMessage();
    if (!incoming || incoming === state.lastIncomingText) return;
    state.lastIncomingText = incoming;

    if (state.autoTranslateIncoming) translateIncoming(incoming).catch((e) => setStatus(`自动翻译失败: ${e.message}`));
    if (state.autoSuggestReply) suggestReply().catch((e) => setStatus(`自动建议失败: ${e.message}`));
  }

  function refreshMeta() {
    const phoneFromUrl = core.parsePhoneFromUrl(location.href);
    const headerText = document.querySelector("header span[title]")?.getAttribute("title") || "";
    const phone = phoneFromUrl || core.extractPhoneCandidate(headerText);
    if (phone) {
      state.phone = phone;
      state.locale = core.lookupLocaleByPhone(phone);
      if (!state.inferredCustomerLanguage || state.inferredCustomerLanguage === "en") state.inferredCustomerLanguage = state.locale.language || "en";
    }

    ui.meta.innerText = [
      `客户号码: ${state.phone || "未识别"}`,
      `国家/地区: ${state.locale?.country || "Unknown"} (+${state.locale?.code || "?"})`,
      `客户时区: ${state.locale?.timezone || "UTC"}`,
      `客户当地时间: ${core.formatLocalTime(state.locale?.timezone || "UTC")}`,
      `客户语言(推断): ${state.inferredCustomerLanguage || "unknown"}`,
      `知识库条目: ${state.knowledgeBase.length}`
    ].join("\n");
  }

  async function translateIncoming(text) {
    setStatus("识别语言并翻译中...");
    const out = await callOpenAI(core.buildDetectTranslatePrompt(text), 0.1, 700);
    let parsed;
    try { parsed = JSON.parse(out); } catch (_e) { parsed = { source_language: state.inferredCustomerLanguage, chinese_text: out }; }
    state.inferredCustomerLanguage = parsed.source_language || state.inferredCustomerLanguage;
    ui.incomingZh.value = parsed.chinese_text || "";
    setStatus("已完成来信自动翻译(中文)");
    refreshMeta();
  }

  async function translateOutgoingToCustomer() {
    const zhText = ui.outgoingZh.value.trim();
    if (!zhText) return;
    const targetLang = state.inferredCustomerLanguage || state.locale?.language || "en";
    setStatus(`翻译中文 -> ${targetLang}...`);
    ui.outgoingTranslated.value = await callOpenAI(core.buildTranslatePrompt(zhText, targetLang), 0.2, 900);
    setStatus("已完成发送语言翻译");
  }

  async function suggestReply() {
    setStatus("生成AI客服回复中...");
    const context = collectConversationContext(state.contextMaxChars);
    const kb = core.retrieveKnowledge(context, state.knowledgeBase, 6);
    const prompt = core.buildReplyPrompt({
      context,
      customerLang: state.inferredCustomerLanguage || state.locale?.language || "en",
      customerTime: core.formatLocalTime(state.locale?.timezone || "UTC"),
      businessTone: state.businessTone,
      knowledgeSnippets: kb
    });
    ui.outgoingTranslated.value = await callOpenAI(prompt, 0.35, 1200);
    setStatus(`AI回复建议已生成（上下文${context.length}字符，知识片段${kb.length}条）`);
  }

  function collectConversationContext(maxChars) {
    const nodes = Array.from(document.querySelectorAll("div.copyable-text"));
    const messages = nodes.map((n) => {
      const dir = n.closest(".message-in") ? "客户" : "我方";
      return `${dir}: ${n.innerText.replace(/\s+/g, " ").trim()}`;
    });
    const combined = messages.join("\n");
    if (combined.length <= maxChars) return combined;
    return combined.slice(combined.length - maxChars);
  }

  function getLastIncomingMessage() {
    const incoming = Array.from(document.querySelectorAll(".message-in div.copyable-text"));
    const last = incoming.pop();
    return last ? last.innerText.replace(/\s+/g, " ").trim() : "";
  }

  async function callOpenAI(input, temperature, maxOutputTokens) {
    const res = await chrome.runtime.sendMessage({ type: "OPENAI_CALL", payload: { input, temperature, maxOutputTokens } });
    if (!res?.ok) throw new Error(res?.error || "unknown error");
    return res.data.output_text;
  }

  function setStatus(msg) { ui.status.innerText = msg; }

  function buildPanel() {
    const panel = document.createElement("aside");
    panel.id = "wa-ai-panel";
    panel.innerHTML = `
      <header>
        <span>WA AI 客服助手</span>
        <button id="wa-ai-refresh" class="secondary">刷新</button>
      </header>
      <div class="body">
        <div class="meta" id="wa-ai-meta"></div>
        <div class="section-title">客户来信 -> 中文</div>
        <textarea id="wa-ai-incoming-zh" placeholder="自动翻译后的中文会显示在这里"></textarea>
        <div class="section-title">你的中文 -> 客户语言</div>
        <label>默认输入中文</label>
        <textarea id="wa-ai-outgoing-zh" placeholder="输入你要发送的中文"></textarea>
        <button id="wa-ai-translate">翻译为客户语言</button>
        <button id="wa-ai-suggest" class="secondary">AI智能回复建议（全会话）</button>
        <textarea id="wa-ai-outgoing-translated" placeholder="可复制发送给客户"></textarea>
        <div id="wa-ai-status"></div>
      </div>`;
    document.body.appendChild(panel);

    const refs = {
      meta: panel.querySelector("#wa-ai-meta"),
      incomingZh: panel.querySelector("#wa-ai-incoming-zh"),
      outgoingZh: panel.querySelector("#wa-ai-outgoing-zh"),
      outgoingTranslated: panel.querySelector("#wa-ai-outgoing-translated"),
      status: panel.querySelector("#wa-ai-status")
    };

    panel.querySelector("#wa-ai-refresh").addEventListener("click", refreshMeta);
    panel.querySelector("#wa-ai-translate").addEventListener("click", () => translateOutgoingToCustomer().catch((e) => setStatus(`翻译失败: ${e.message}`)));
    panel.querySelector("#wa-ai-suggest").addEventListener("click", () => suggestReply().catch((e) => setStatus(`AI建议失败: ${e.message}`)));

    return refs;
  }
})();
