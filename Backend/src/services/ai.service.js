import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
import { ChatMistralAI } from "@langchain/mistralai";
import { ChatGroq } from "@langchain/groq";
import { searchInternet } from "./internet.service.js";

const mainModel = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  apiKey: process.env.GROQ_API_KEY
});

const compareModel = new ChatGroq({
  model: "llama-3.1-8b-instant",
  apiKey: process.env.GROQ_API_KEY
});

const mistralModel = new ChatMistralAI({
  model: "mistral-small-latest",
  apiKey: process.env.MISTRAL_API_KEY
});

// Tool definition for search
const tools = [
  {
    name: "searchInternet",
    description: "use this tool to get the latest information from the internet",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "The search query" },
        focus: { type: "string", enum: ["web", "news", "academic", "forums"], description: "Focus area" }
      },
      required: ["query"]
    }
  }
];

// Bind tools to models
const mainModelWithTools = mainModel.bind({
  functions: tools,
  function_call: "auto"
});

function formatMessages(messages, focus = "web") {
  return [
    new SystemMessage(
      `You are a helpful and precise assistant. 
      Current focus area: ${focus}.
      If the user's question requires up-to-date info, use the searchInternet function.
      Always try to provide a comprehensive answer.`
    ),
    ...messages.map(msg => {
      if (msg.role === "user") return new HumanMessage(msg.content);
      const aiRoles = ["ai", "gemini", "mistral", "pro", "con"];
      if (aiRoles.includes(msg.role)) return new AIMessage(msg.content);
      return null;
    }).filter(msg => msg !== null)
  ];
}

export async function generateResponse(messages, focus = "web") {
  try {
    const formattedMessages = formatMessages(messages, focus);
    const response = await mainModelWithTools.invoke(formattedMessages);

    // Handle tool calls
    if (response.additional_kwargs.function_call) {
      const { name, arguments: argsString } = response.additional_kwargs.function_call;
      if (name === "searchInternet") {
        const args = JSON.parse(argsString);
        const searchResult = await searchInternet({ query: args.query, focus: args.focus || focus });
        
        // Follow up with the search results
        const finalRes = await mainModel.invoke([
          ...formattedMessages,
          response,
          new HumanMessage(`Search Results: ${searchResult}\n\nBased on these results, please answer the user's original question.`)
        ]);
        return finalRes.content;
      }
    }

    return response.content;
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw new Error(`AI Logic Error: ${error.message}`);
  }
}

export async function generateCompareResponse(messages, focus = "web") {
  try {
    const formatted = formatMessages(messages, focus);
    const [llamaRes, mistralRes] = await Promise.all([
      mainModel.invoke(formatted),
      mistralModel.invoke(formatted)
    ]);

    return {
      gemini: llamaRes.content,
      mistral: mistralRes.content
    };
  } catch (error) {
    console.error("Compare Error:", error);
    throw new Error(`Compare Mode Error: ${error.message}`);
  }
}

export async function generateDebateResponse(messages, focus = "web") {
  try {
    const userQuery = messages[messages.length - 1].content;
    const [proRes, conRes] = await Promise.all([
      mainModel.invoke([
        new SystemMessage(`You are a skilled debater. Focus: ${focus}. Argue strongly FOR the topic.`),
        new HumanMessage(userQuery)
      ]),
      compareModel.invoke([
        new SystemMessage(`You are a skilled debater. Focus: ${focus}. Argue strongly AGAINST the topic.`),
        new HumanMessage(userQuery)
      ])
    ]);

    return {
      pro: proRes.content,
      con: conRes.content
    };
  } catch (error) {
    console.error("Debate Error:", error);
    throw new Error(`Debate Mode Error: ${error.message}`);
  }
}

export async function generateChatTitle(message, focus = "web") {
  try {
    const response = await compareModel.invoke([
      new SystemMessage(`Generate a 2-4 word title for this chat. Focus: ${focus}.`),
      new HumanMessage(message)
    ]);
    return response.content;
  } catch (error) {
    console.error("Title Generation Error:", error);
    return "New Conversation"; // Safe fallback
  }
}
