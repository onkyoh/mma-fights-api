import express from "express";
import cors from "cors";
import compression from "compression";
import morgan from "morgan";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { scrapeEvents, scrapeEventDetails } from "../utils/scrape.js";

// Get the current directory path (works with ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define paths based on environment
const isProduction = process.env.NODE_ENV === "production";

// Use Railway.app volume path in production, local path in development
const DATA_DIR = isProduction ? "/data" : path.join(__dirname, "..", "data");
const DATA_FILE_PATH = path.join(DATA_DIR, "fights.data");

// Initialize the data directory if needed
async function ensureDirectoryExists() {
	try {
		await fs.mkdir(DATA_DIR, { recursive: true });
	} catch (err) {
		// Ignore if directory already exists
		if (err.code !== "EEXIST") {
			console.error(`Error creating directory: ${err.message}`);
		}
	}
}

export const createServer = () => {
	const app = express();

	app.use(morgan("tiny"));
	app.use(express.json());
	app.use(cors());
	app.use(compression());

	app.post("/scrape", async (req, res) => {
		const { key } = req.body;
		if (!key || key !== process.env.TRIGGER_KEY) {
			return res.status(401).send({ error: true, message: "Invalid trigger key" });
		}

		try {
			// Ensure the directory exists before writing
			await ensureDirectoryExists();

			const events = await scrapeEvents();
			const eventDetails = await scrapeEventDetails(events);

			const fileData = {
				data: eventDetails,
				updatedAt: new Date(),
			};

			// Convert to Buffer to avoid string encoding issues
			const buffer = Buffer.from(JSON.stringify(fileData));
			await fs.writeFile(DATA_FILE_PATH, buffer);

			return res.status(200).send({ error: false, message: "Scraping and updating completed" });
		} catch (err) {
			console.error("Error during scraping process:", err);
			return res.status(500).send({ error: true, message: "Error during scraping process" });
		}
	});

	app.get("/", async (req, res) => {
		try {
			const buffer = await fs.readFile(DATA_FILE_PATH);
			const data = JSON.parse(buffer.toString());
			return res.status(200).send(data);
		} catch (err) {
			console.error("Error retrieving data:", err);
			return res.status(404).send({ error: true, message: "Data not found" });
		}
	});

	app.get("/health", (req, res) => {
		res.status(200).send("OK");
	});

	return app;
};
