// API call to get Weather Info through city name...

// import dotenv from "dotenv";

// dotenv.config();

export const getWeatherInfoByCityName = async (city = "") => {
	if (!city || city.trim() === "")
		return {
			success: false,
			status: "miss",
			error: `from try part : city is missing, but why mcp ??`,
		};
	// console.log(city);
	try {
		const response = await fetch(
			`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.OPENWEATHER_API_KEY}`
		);
		const data = await response.json();
		if (
			String(city).toLowerCase() === data.name.toLowerCase() &&
			data.cod === 200
		) {
			// console.log(data.name);
			const { sys, main, weather } = data;
			return {
				success: true,
				status: "hit",
				country: sys.country,
				tempearture: main.temp,
				weather: weather[0].description,
			};
		}

		return {
			success: false,
			status: "miss",
			error:
				`from try part : ${data.message}` ||
				"City not found, Please try again...",
		};
	} catch (error) {
		console.error("Weather API Error:", error);
		return {
			success: false,
			status: "miss",
			error: `from catch part : ${error.message}` || "Something went wrong...",
		};
	}
};
// const wrapperFunction = async () =>
// 	console.log(await getWeatherInfoByCityName("gaya"));

// wrapperFunction();
