import { ChatOllama } from "@langchain/ollama";
import readline from "node:readline";
import dotenv from "dotenv"

import { weatherTool } from "./mcpServer.js";

dotenv.config();

const llm = new ChatOllama({
	model: "llama3.2",
	temperature: 0.1,
	maxRetries: 2,
	// other params...
});

const llmWithTools = llm.bindTools([weatherTool]);

const askToLLM = async () => {
    // initial prompt
	let userPrompt = "nothing to say";

    // readline creates interfaces for input command line
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});

    // taking input using promise
	userPrompt = await new Promise((resolve, reject) => {
		rl.question("User : ", (answer) => {
			resolve(answer);
			rl.close();
		});
	});

    // nothing just console.log() but without newline at the end
	process.stdout.write("Assistant : ");

    // invokes the llm to prediction after user's prompt
	const aiMsg = await llmWithTools.invoke([
		[
			"system",
			"You are a helpful friend that loves programming too and will help me understand code.",
		],
		["human", userPrompt],
	]);

	console.log(aiMsg);
	console.log( aiMsg.content);
};

askToLLM();

//can you tell me the latest weather updates of tokyo, yes or no, just one word answer