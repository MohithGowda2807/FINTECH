const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// System prompt for finance context
const SYSTEM_PROMPT = `You are a helpful financial assistant chatbot for a finance management application. 
Your role is to:
1. Answer questions about SIP, Lumpsum, EMI, and other financial calculators
2. Explain financial concepts in simple terms
3. Guide users on how to use the calculators on the website
4. Provide basic financial advice (always mention to consult a professional for detailed advice)

Be friendly, concise, and helpful. Keep responses under 150 words.`;

// POST /api/chatbot/message
router.post('/message', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: message }
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    const reply = completion.choices[0].message.content;

    res.json({ 
      reply: reply,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('OpenAI Error:', error);
    res.status(500).json({ 
      error: 'Failed to get response from chatbot',
      fallback: 'I apologize, but I am having trouble connecting right now. Please try again later.'
    });
  }
});

module.exports = router;
