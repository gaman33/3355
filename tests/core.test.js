const assert = require('assert');
const {
  parsePhoneFromUrl,
  extractPhoneCandidate,
  lookupLocaleByPhone,
  buildReplyPrompt,
  retrieveKnowledge
} = require('../src/core.js');

assert.strictEqual(parsePhoneFromUrl('https://web.whatsapp.com/#/972555123456@c.us'), '972555123456');
assert.strictEqual(extractPhoneCandidate('+44 7700 900123'), '447700900123');

const locale = lookupLocaleByPhone('8613812345678');
assert.strictEqual(locale.country, 'China');
assert.strictEqual(locale.language, 'zh');

const kb = [
  { title: 'shipping', content: 'dhl 3 days' },
  { title: 'refund', content: 'return in 7 days' }
];
const hits = retrieveKnowledge('customer asks dhl shipping time', kb, 2);
assert.strictEqual(hits[0].title, 'shipping');

const prompt = buildReplyPrompt({
  context: '客户: shipping?',
  customerLang: 'en',
  customerTime: '2026-04-14 09:33',
  businessTone: 'friendly',
  knowledgeSnippets: hits
});
assert.ok(prompt.includes('Knowledge Base'));

console.log('core tests passed');
