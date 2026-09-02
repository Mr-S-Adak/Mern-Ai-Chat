const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.LLM_API_KEY,
  baseURL: process.env.LLM_BASE_URL,
});

const generateAIResponse = async (messages) => {
  const response = await client.chat.completions.create({
    model: process.env.LLM_MODEL || "default",
    messages: messages.map((message) => ({
      role: message.role,
      content: message.content,
    })),
  });

  return response.choices[0].message.content;
};

module.exports = {
  generateAIResponse,
};
