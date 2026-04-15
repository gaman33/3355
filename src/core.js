(function (root) {
  const COUNTRY_CODE_MAP = [
    { code: "1", country: "US/CA", timezone: "America/New_York", language: "en" },
    { code: "7", country: "Russia", timezone: "Europe/Moscow", language: "ru" },
    { code: "20", country: "Egypt", timezone: "Africa/Cairo", language: "ar" },
    { code: "27", country: "South Africa", timezone: "Africa/Johannesburg", language: "en" },
    { code: "30", country: "Greece", timezone: "Europe/Athens", language: "el" },
    { code: "31", country: "Netherlands", timezone: "Europe/Amsterdam", language: "nl" },
    { code: "32", country: "Belgium", timezone: "Europe/Brussels", language: "nl" },
    { code: "33", country: "France", timezone: "Europe/Paris", language: "fr" },
    { code: "34", country: "Spain", timezone: "Europe/Madrid", language: "es" },
    { code: "39", country: "Italy", timezone: "Europe/Rome", language: "it" },
    { code: "40", country: "Romania", timezone: "Europe/Bucharest", language: "ro" },
    { code: "44", country: "United Kingdom", timezone: "Europe/London", language: "en" },
    { code: "45", country: "Denmark", timezone: "Europe/Copenhagen", language: "da" },
    { code: "46", country: "Sweden", timezone: "Europe/Stockholm", language: "sv" },
    { code: "47", country: "Norway", timezone: "Europe/Oslo", language: "no" },
    { code: "48", country: "Poland", timezone: "Europe/Warsaw", language: "pl" },
    { code: "49", country: "Germany", timezone: "Europe/Berlin", language: "de" },
    { code: "52", country: "Mexico", timezone: "America/Mexico_City", language: "es" },
    { code: "55", country: "Brazil", timezone: "America/Sao_Paulo", language: "pt" },
    { code: "60", country: "Malaysia", timezone: "Asia/Kuala_Lumpur", language: "ms" },
    { code: "61", country: "Australia", timezone: "Australia/Sydney", language: "en" },
    { code: "62", country: "Indonesia", timezone: "Asia/Jakarta", language: "id" },
    { code: "63", country: "Philippines", timezone: "Asia/Manila", language: "tl" },
    { code: "64", country: "New Zealand", timezone: "Pacific/Auckland", language: "en" },
    { code: "65", country: "Singapore", timezone: "Asia/Singapore", language: "en" },
    { code: "66", country: "Thailand", timezone: "Asia/Bangkok", language: "th" },
    { code: "81", country: "Japan", timezone: "Asia/Tokyo", language: "ja" },
    { code: "82", country: "South Korea", timezone: "Asia/Seoul", language: "ko" },
    { code: "84", country: "Vietnam", timezone: "Asia/Ho_Chi_Minh", language: "vi" },
    { code: "86", country: "China", timezone: "Asia/Shanghai", language: "zh" },
    { code: "90", country: "Turkey", timezone: "Europe/Istanbul", language: "tr" },
    { code: "91", country: "India", timezone: "Asia/Kolkata", language: "hi" },
    { code: "92", country: "Pakistan", timezone: "Asia/Karachi", language: "ur" },
    { code: "93", country: "Afghanistan", timezone: "Asia/Kabul", language: "fa" },
    { code: "94", country: "Sri Lanka", timezone: "Asia/Colombo", language: "si" },
    { code: "95", country: "Myanmar", timezone: "Asia/Yangon", language: "my" },
    { code: "98", country: "Iran", timezone: "Asia/Tehran", language: "fa" },
    { code: "212", country: "Morocco", timezone: "Africa/Casablanca", language: "ar" },
    { code: "216", country: "Tunisia", timezone: "Africa/Tunis", language: "ar" },
    { code: "218", country: "Libya", timezone: "Africa/Tripoli", language: "ar" },
    { code: "220", country: "Gambia", timezone: "Africa/Banjul", language: "en" },
    { code: "221", country: "Senegal", timezone: "Africa/Dakar", language: "fr" },
    { code: "233", country: "Ghana", timezone: "Africa/Accra", language: "en" },
    { code: "234", country: "Nigeria", timezone: "Africa/Lagos", language: "en" },
    { code: "248", country: "Seychelles", timezone: "Indian/Mahe", language: "en" },
    { code: "249", country: "Sudan", timezone: "Africa/Khartoum", language: "ar" },
    { code: "254", country: "Kenya", timezone: "Africa/Nairobi", language: "sw" },
    { code: "255", country: "Tanzania", timezone: "Africa/Dar_es_Salaam", language: "sw" },
    { code: "263", country: "Zimbabwe", timezone: "Africa/Harare", language: "en" },
    { code: "351", country: "Portugal", timezone: "Europe/Lisbon", language: "pt" },
    { code: "352", country: "Luxembourg", timezone: "Europe/Luxembourg", language: "fr" },
    { code: "353", country: "Ireland", timezone: "Europe/Dublin", language: "en" },
    { code: "358", country: "Finland", timezone: "Europe/Helsinki", language: "fi" },
    { code: "359", country: "Bulgaria", timezone: "Europe/Sofia", language: "bg" },
    { code: "370", country: "Lithuania", timezone: "Europe/Vilnius", language: "lt" },
    { code: "371", country: "Latvia", timezone: "Europe/Riga", language: "lv" },
    { code: "372", country: "Estonia", timezone: "Europe/Tallinn", language: "et" },
    { code: "380", country: "Ukraine", timezone: "Europe/Kyiv", language: "uk" },
    { code: "385", country: "Croatia", timezone: "Europe/Zagreb", language: "hr" },
    { code: "386", country: "Slovenia", timezone: "Europe/Ljubljana", language: "sl" },
    { code: "420", country: "Czechia", timezone: "Europe/Prague", language: "cs" },
    { code: "421", country: "Slovakia", timezone: "Europe/Bratislava", language: "sk" },
    { code: "852", country: "Hong Kong", timezone: "Asia/Hong_Kong", language: "zh" },
    { code: "853", country: "Macau", timezone: "Asia/Macau", language: "zh" },
    { code: "855", country: "Cambodia", timezone: "Asia/Phnom_Penh", language: "km" },
    { code: "886", country: "Taiwan", timezone: "Asia/Taipei", language: "zh" },
    { code: "960", country: "Maldives", timezone: "Indian/Maldives", language: "dv" },
    { code: "961", country: "Lebanon", timezone: "Asia/Beirut", language: "ar" },
    { code: "962", country: "Jordan", timezone: "Asia/Amman", language: "ar" },
    { code: "966", country: "Saudi Arabia", timezone: "Asia/Riyadh", language: "ar" },
    { code: "971", country: "UAE", timezone: "Asia/Dubai", language: "ar" },
    { code: "972", country: "Israel", timezone: "Asia/Jerusalem", language: "he" }
  ];

  function extractPhoneCandidate(text) {
    if (!text) return null;
    const m = String(text).replace(/\s+/g, "").match(/\+?\d{6,15}/);
    return m ? m[0].replace(/^\+/, "") : null;
  }

  function parsePhoneFromUrl(url) {
    if (!url) return null;
    const matched = String(url).match(/\/(\d{6,15})(?=@|\b)/);
    return matched ? matched[1] : null;
  }

  function lookupLocaleByPhone(phone) {
    if (!phone) return null;
    const normalized = String(phone).replace(/\D/g, "");
    const sortedCodes = COUNTRY_CODE_MAP.map((x) => x.code).sort((a, b) => b.length - a.length);
    const code = sortedCodes.find((c) => normalized.startsWith(c));
    if (!code) {
      return { code: "unknown", country: "Unknown", timezone: "UTC", language: "en" };
    }
    return COUNTRY_CODE_MAP.find((x) => x.code === code);
  }

  function formatLocalTime(timezone) {
    try {
      return new Intl.DateTimeFormat("zh-CN", {
        timeZone: timezone,
        hour12: false,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      }).format(new Date());
    } catch (_e) {
      return new Date().toISOString();
    }
  }

  function tokenize(text) {
    return String(text || "")
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .split(/\s+/)
      .filter((x) => x.length > 1);
  }

  function retrieveKnowledge(contextText, knowledgeBase, topK = 5) {
    if (!Array.isArray(knowledgeBase) || knowledgeBase.length === 0) return [];
    const q = new Set(tokenize(contextText));
    const scored = knowledgeBase
      .filter((d) => d && d.content)
      .map((doc) => {
        const words = tokenize(doc.content);
        let score = 0;
        for (const w of words) if (q.has(w)) score += 1;
        return { ...doc, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
    return scored;
  }

  function buildTranslatePrompt(text, targetLang) {
    return `You are a precise business translator. Translate into ${targetLang}. Keep product specs, prices, quantities, SKUs intact. Return only translated text.\nMessage:\n${text}`;
  }

  function buildDetectTranslatePrompt(text) {
    return `Detect source language and translate to Simplified Chinese. Return strict JSON: {"source_language":"...","chinese_text":"..."}. Message: ${text}`;
  }

  function buildReplyPrompt({ context, customerLang, customerTime, businessTone, knowledgeSnippets }) {
    const kb = knowledgeSnippets?.length
      ? `\n\nKnowledge Base (high priority facts):\n${knowledgeSnippets.map((d, i) => `${i + 1}. [${d.title || "doc"}] ${d.content}`).join("\n")}`
      : "";
    return `You are a senior WhatsApp sales & support agent.
Draft ONE best reply in ${customerLang}.
Tone: ${businessTone}.
Customer local time: ${customerTime}.
Rules:
1) Be accurate and concise.
2) If policy/price/shipping info exists in Knowledge Base, follow it first.
3) If missing critical info, ask one clarifying question.
4) Output only final message text.

Conversation Context:\n${context}${kb}`;
  }

  const api = {
    COUNTRY_CODE_MAP,
    extractPhoneCandidate,
    parsePhoneFromUrl,
    lookupLocaleByPhone,
    formatLocalTime,
    tokenize,
    retrieveKnowledge,
    buildTranslatePrompt,
    buildDetectTranslatePrompt,
    buildReplyPrompt
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.WAAssistantCore = api;
})(typeof self !== "undefined" ? self : globalThis);
