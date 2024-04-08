import express from "express";
import cors from "cors";
import compression from "compression";
import { config } from "dotenv";
import { connectDB } from "./config/mongodb.js";
import { scrape } from "./utils/scrape.js";
import { scrapedDataSchema } from "./utils/schema.js";

//initialize mongodb instance
config();
const init = async () => {
  const db = await connectDB();

  //setup express

  const app = express();
  app.use(express.json());
  app.use(cors());
  app.use(compression());

  //triggers scraping and updates db

  const updatedDb = async () => {
    try {
      const scrapedData = await scrape();
      scrapedDataSchema.parse(scrapedData);
      const updated = await db.updateOne(
        {},
        { $set: { data: scrapedData, updatedAt: new Date() } }
      );
    } catch (err) {
      throw err;
    }
  };

  // post endpoint triggered by AWS lambda function to trigger scrape

  app.post("/scrape", async (req, res) => {
    const { key } = req.body;

    if (!key || key !== process.env.TRIGGER_KEY) {
      return res.status(401).send({
        error: true,
        message: "invalid trigger key",
      });
    } else {
      try {
        const scraperResponse = await updatedDb();
        return res.status(200).send({
          error: false,
          message: "scrape successful",
        });
      } catch (err) {
        console.error(err);
        return res.status(500).send({
          error: true,
          message: "error during scraping",
        });
      }
    }
  });

  //single endpoint to grab all the fights in the db

  app.get("/", async (req, res) => {
    const data = await db.findOne({});

    if (data) {
      return res.status(200).send(data);
    } else {
      return res.status(500).send({
        error: true,
        message: "error during retrieval",
      });
    }
  });

  const port = process.env.PORT || 1000;

  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
};

init();
