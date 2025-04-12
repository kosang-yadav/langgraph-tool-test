import { z } from "zod"
import { tool } from "@langchain/core/tools";

import { getWeatherInfoByCityName } from "./weatherAPI.js"

export const weatherTool = tool(
    getWeatherInfoByCityName
    , {
	name: "getWeatherDataByCityName",
	description: "Get the weather information of the given city",
	schema: z.object({
		city: z.string().describe("A city name input from user"),
	}),
});