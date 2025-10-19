require('dotenv').config();
const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function test() {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Hello, OpenAI!" }],
      max_tokens: 10,
    });
    console.log(completion.choices[0].message.content);
  } catch (err) {
    console.error('OpenAI Test Error:', err);
  }
}

test();
