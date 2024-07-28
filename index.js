import express from "express";
import cors from "cors";
import compression from "compression";
import { config } from "dotenv";
import { connectDB } from "./config/mongodb.js";
import { scrape } from "./utils/scrape.js";

config();

const init = async () => {
  try {
    const db = await connectDB();
    const app = express();
    app.use(express.json());
    app.use(cors());
    app.use(compression());

    app.post("/scrape", async (req, res) => {
      const { key } = req.body;
      if (!key || key !== process.env.TRIGGER_KEY) {
        return res
          .status(401)
          .send({ error: true, message: "Invalid trigger key" });
      }

      try {
        await scrapeAndUpdateDb(db);
        return res
          .status(200)
          .send({ error: false, message: "Scrape successful" });
      } catch (err) {
        console.error(err);
        return res
          .status(500)
          .send({ error: true, message: "Error during scraping" });
      }
    });

    app.get("/", async (req, res) => {
      try {
        const data = await db.findOne({});
        return data
          ? res.status(200).send(data)
          : res.status(404).send({ error: true, message: "Data not found" });
      } catch (err) {
        console.error(err);
        return res
          .status(500)
          .send({ error: true, message: "Error retrieving data" });
      }
    });

    const port = process.env.PORT || 1000;
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  } catch (err) {
    console.error("Failed to initialize application:", err);
  }
};

const scrapeAndUpdateDb = async (db) => {
  try {
    const scrapedData = await scrape();
    await db.updateOne(
      {},
      { $set: { data: scrapedData, updatedAt: new Date() } }
    );
  } catch (err) {
    throw new Error("Failed to scrape and update database:", err);
  }
};

init();
