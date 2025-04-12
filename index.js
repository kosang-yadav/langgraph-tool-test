import {
	StateGraph,
	MessagesAnnotation,
} from "@langchain/langgraph";
import { weatherTool } from "./testTool.js";
import { ChatOllama } from "@langchain/ollama";
import { config } from "dotenv";
import { ToolNode } from "@langchain/langgraph/prebuilt";

config();


// local ollama llm instance

const llm = new ChatOllama({
	model: "llama3.2",
	temperature: 0.1,
	maxRetries: 2,
	// other params...
});


// making it as array of tools to parse it
const tools = [weatherTool];
// console.log(tools);

// augment the llm with tools
const llmWithTools = llm.bindTools(tools);

const toolNode = new ToolNode(tools);

//node
async function llmCall(state) {
	const result = await llmWithTools.invoke([
		{
			role: "system",
			content:
				"you are an assistant bot, who have good knowledge of weather conditions of around the world.",
		},
		...state.messages,
	]);
	return { messages: [result] };
	// return { weatherData: result.content };
}

// Conditional edge function to route to the tool node or end
function shouldEndorUseTools(state) {
	const messages = state.messages;
	// console.log({ messages });
	const lastMessage = messages.at(-1);
	// console.log({ lastMessage });

	// If the LLM makes a tool call, then perform an action
	if (lastMessage?.tool_calls?.length) {
		return "action";
	}
	// otherwise, should stop & reply to user
	return "end";
}

const agentWorkFlow = new StateGraph(MessagesAnnotation)
	.addNode("llmCall", llmCall)
	.addNode("tool", toolNode)
	.addEdge("__start__", "llmCall")
	.addConditionalEdges("llmCall", shouldEndorUseTools, {
		action: "tool",
		end: "__end__",
	})
	.addEdge("tool", "llmCall")
	.compile();

const messages = [
	{
		role: "user",
		content: "how's the real-time weather data in Delhi ?",
	},
];

const result = await agentWorkFlow.invoke({ messages });
console.log({ result: result.messages });
