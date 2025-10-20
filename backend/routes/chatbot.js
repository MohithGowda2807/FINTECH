const express = require('express');
const router = express.Router();
const { HfInference } = require('@huggingface/inference');

const hf = new HfInference(process.env.HUGGINGFACE_TOKEN);

router.post('/message', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Create a finance-focused prompt
    const prompt = `You are a finance assistant. Answer this question clearly and concisely:\n\nQuestion: ${message}\n\nAnswer:`;

    // Call HuggingFace AI model
    const response = await hf.textGeneration({
      model: 'mistralai/Mistral-7B-Instruct-v0.2',
      inputs: prompt,
      parameters: {
        max_new_tokens: 200,
        temperature: 0.7,
        return_full_text: false
      }
    });

    res.json({ 
      reply: response.generated_text.trim(),
      timestamp: new Date()
    });

  } catch (error) {
    console.error('HuggingFace Error:', error);
    res.status(500).json({ 
      error: 'Failed to get response from chatbot',
      fallback: 'I apologize, but I am having trouble connecting right now. Please try again later.'
    });
  }
});

module.exports = router;
