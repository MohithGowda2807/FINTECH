const express = require('express');
const router = express.Router();

// The API URL for the Hugging Face model. You can change this to any other model.
const MODEL_API_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2";

/**
 * A helper function to format the conversation history and the new message
 * into a single prompt string that the Mistral model understands.
 * @param {string} systemPrompt - The initial instruction for the AI.
 * @param {Array<Object>} history - The previous conversation messages.
 * @param {string} newMessage - The new user message.
 * @returns {string} - The fully formatted prompt.
 */
function formatPrompt(systemPrompt, history, newMessage) {
  let prompt = `<s>[INST] ${systemPrompt} [/INST]\n`;

  // Combine history into the prompt
  history.forEach(turn => {
    prompt += `[INST] ${turn.user} [/INST]\n`;
    prompt += `${turn.assistant}</s>\n`;
  });

  // Add the new message
  prompt += `[INST] ${newMessage} [/INST]`;
  
  return prompt;
}


// This is the endpoint your frontend will call
router.post('/chat', async (req, res) => {
  const { message, history = [] } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Define the AI's personality and instructions
  const systemPrompt = `You are an expert financial assistant. Your name is "Finance Assistant (AI)". 
  You are helpful, polite, and an expert in all things related to finance, including SIPs, investments, and financial planning. 
  Keep your answers concise and easy to understand. Do not provide financial advice, but you can provide financial education.`;

  // Format the complete prompt
  const formattedPrompt = formatPrompt(systemPrompt, history, message);

  try {
    // Call the Hugging Face Inference API
    const response = await fetch(MODEL_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HUGGINGFACE_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: formattedPrompt,
        parameters: {
          return_full_text: false, // Only return the generated part
          max_new_tokens: 500,     // Limit the length of the reply
        }
      }),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error('Hugging Face API Error:', errorBody);
        throw new Error(`API request failed with status ${response.status}`);
    }

    const result = await response.json();
    
    // The response is an array, we get the first element's generated text
    const aiResponse = result[0].generated_text.trim();

    res.json({ reply: aiResponse });

  } catch (error) {
    console.error('Error communicating with Hugging Face:', error);
    res.status(500).json({ error: 'Sorry, I am having trouble connecting to the AI service. Please try again later.' });
  }
});

module.exports = router;

