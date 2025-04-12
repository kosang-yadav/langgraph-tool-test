import { StateGraph, MessagesAnnotation } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOllama } from "@langchain/ollama";
import { tool } from "@langchain/core/tools";

import { z } from "zod";
import { config } from "dotenv";

config();

// example tools

// addition tool
const add = tool(async ({ a, b }) => `${a + b}`, {
	name: "addition",
	description: "adds two numbers",
	schema: z.object({
		a: z.number().describe("first number"),
		b: z.number().describe("second number"),
	}),
});

// subtraction tool
const sub = tool(async ({ a, b }) => `${a - b}`, {
	name: "subtraction",
	description: "subtracts two numbers",
	schema: z.object({
		a: z.number().describe("first number"),
		b: z.number().describe("second number"),
	}),
});

// multiplication tool
const multiple = tool(async ({ a, b }) => `${a * b}`, {
	name: "multiplication",
	description: "multiplies two numbers",
	schema: z.object({
		a: z.number().describe("first number"),
		b: z.number().describe("second number"),
	}),
});

// division tool
const divide = tool(async ({ a, b }) => `${a / b}`, {
	name: "division",
	description: "divides two numbers",
	schema: z.object({
		a: z.number().describe("first number"),
		b: z.number().describe("second number"),
	}),
});

const tools = [add, sub, multiple, divide];
const toolsNames = Object.fromEntries(tools.map((tool) => [tool.name, tool]));
// console.log(tools);
// console.log(toolsNames);

// local ollama llm instance
// const llm = new ChatOllama({
// 	model: "llama3.2",
// 	temperature: 0.1,
// 	maxRetries: 2,
// 	// other params...
// });

// google gemini llm instance

const llm = new ChatGoogleGenerativeAI({
	model: "gemini-2.0-flash",
	temperature: 0,
	maxRetries: 2,
	// other params...
});

// augment the llm with tools
const llmWithTools = llm.bindTools(tools);

// Nodes

async function llmCall(state) {
	// LLM decides whether to call a tool or not
	const result = await llmWithTools.invoke([
		{
			role: "system",
			content:
				"you are an mathematical expert, who will perform mathematical operations with given inputs",
		},
		...state.messages,
	]);

	// console.log({ result });
	return { messages: [result] };
}

// converted to the ToolNode({object}) from array of tools([tools])
const toolNode = new ToolNode(tools);
// console.log(toolNode);

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

//agent's workflow
const agentWorkFlow = new StateGraph(MessagesAnnotation)
	.addNode("llmCall", llmCall)
	.addNode("tools", toolNode)
	.addEdge("__start__", "llmCall")
	.addConditionalEdges("llmCall", shouldEndorUseTools, {
		action: "tools",
		end: "__end__",
	})
	.addEdge("tools", "llmCall")
	.compile();

// Invoke
const messages = [
	{
		role: "user",
		content: "Add 2 and 2, then multiply that by 10(five times).",
	},
];
const result = await agentWorkFlow.invoke({ messages });
console.log(result.messages);
