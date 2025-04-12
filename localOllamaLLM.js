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

// a normal function to format LLM's messages
function formatLLMMessage(message) {
	const lines = message.split("\n");
	let formatted = "";

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];

		// Heading line
		if (/^\d\.\s\*\*(.*?)\*\*:?\s*(.*)/.test(line)) {
			const match = line.match(/^\d\.\s\*\*(.*?)\*\*:?\s*(.*)/);
			if (match) {
				const title = match[1];
				const desc = match[2];
				formatted += `\n\n${title.toUpperCase()}:\n${desc}`;
			}
		}
		// First paragraph or other notes
		else {
			formatted += `\n${line}`;
		}
	}

	return formatted.trim();
}

// outputs
// console.log({ aiMsg });
console.log({ content: formatLLMMessage(aiMsg.content) });
