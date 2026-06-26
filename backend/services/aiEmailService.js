import Setting from '../models/Setting.js';

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

function buildPrompt({ to, subject, tone, context }) {
  const toneGuide = {
    professional: 'Use a polished, business-appropriate tone. Be clear and concise.',
    friendly: 'Use a warm, approachable tone. Be conversational but respectful.',
    formal: 'Use a highly formal, respectful tone. Address the recipient formally.',
    casual: 'Use a relaxed, informal tone. Write as if to a colleague.',
    persuasive: 'Use a compelling, convincing tone. Highlight benefits and value.',
  };

  const toneInstruction = toneGuide[tone] || toneGuide.professional;

  let prompt = `You are a professional email writer. Write a complete email body in plain text (no markdown, no HTML).

Tone: ${toneInstruction}
Recipient: ${to || 'the recipient'}
Subject: ${subject || 'No subject'}
Context: ${context || 'General business correspondence'}

Write the email body only. Do not include subject line, salutation, or signature. Just the main body paragraphs.`;

  return prompt;
}

export async function generateEmailBody({ to, subject, tone = 'professional', context = '' }) {
  const setting = await Setting.findOne({ key: 'aiApiKey' });
  const apiKey = setting?.value;

  if (!apiKey) {
    return generateFallback(to, subject, tone, context);
  }

  try {
    const prompt = buildPrompt({ to, subject, tone, context });

    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: 'You are a professional email writer. Write clear, effective email bodies in plain text.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.error('[AI Email] API error:', response.status, await response.text());
      return generateFallback(to, subject, tone, context);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();

    if (!content) return generateFallback(to, subject, tone, context);

    return content;
  } catch (error) {
    console.error('[AI Email] Service error:', error.message);
    return generateFallback(to, subject, tone, context);
  }
}

function generateFallback(to, subject, tone, context) {
  const toneOpeners = {
    professional: `Thank you for reaching out. I am writing to follow up on the matter of "${subject || 'our recent discussion'}".`,
    friendly: `Thanks so much for getting in touch! I wanted to follow up regarding "${subject || 'what we discussed'}" and see how things are going.`,
    formal: `Dear ${to || 'Sir/Madam'},\n\nI trust this message finds you well. I am writing with reference to "${subject || 'our correspondence'}" and wish to provide the following information.`,
    casual: `Hey there! Just following up on "${subject || 'our chat'}" — hope everything's going well on your end!`,
    persuasive: `I wanted to personally reach out regarding "${subject || 'this opportunity'}" because I believe it could deliver significant value to you.`,
  };

  const opener = toneOpeners[tone] || toneOpeners.professional;

  return `${opener}\n\n${context || 'I would be happy to discuss this further and provide any additional information you may need. Please let me know if you have any questions or would like to schedule a call to go over the details.'}\n\nLooking forward to hearing from you.`;
}
