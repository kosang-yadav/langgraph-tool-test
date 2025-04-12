import { ChatOllama } from "@langchain/ollama";
import readlineSync from "readline-sync";

// local ollama llm instance
const llm = new ChatOllama({
	model: "llama3.2",
	temperature: 0.1,
	maxRetries: 2,
	// other params...
});

// Wait for user's response and taking input from terminal
const userPrompt = readlineSync.question("User : ") || "nothing to say";

// nothing just console.log() but without newline at the end
process.stdout.write("Assistant : ");

// invokes the llm to prediction after user's prompt
const aiMsg = await llm.invoke([
	{
		role: "system",
		content: "you are a general pupose assistant bot and expert in coding.",
		// any system prompt here
	},
	{ role: "human", content: userPrompt },
]);

// outputs
// console.log({ aiMsg });
console.log({ content: aiMsg.content });
