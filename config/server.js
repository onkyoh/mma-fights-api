import express from 'express';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import { scrapeAndUpdateDb } from '../utils/scrape.js';

export const createServer = (db) => {
  const app = express();

  // Middlewares
  app.use(morgan('tiny'));
  app.use(express.json());
  app.use(cors());
  app.use(compression());

  // Routes
  app.post('/scrape', async (req, res) => {
    const { key } = req.body;
    if (!key || key !== process.env.TRIGGER_KEY) {
      return res.status(401).send({ error: true, message: 'Invalid trigger key' });
    }

    try {
      await scrapeAndUpdateDb(db);
      return res.status(200).send({ error: false, message: 'Scrape successful' });
    } catch (err) {
      console.error(err);
      return res.status(500).send({ error: true, message: 'Error during scraping' });
    }
  });

  app.get('/', async (req, res) => {
    try {
      const data = await db.findOne({});
      return data
        ? res.status(200).send(data)
        : res.status(404).send({ error: true, message: 'Data not found' });
    } catch (err) {
      console.error(err);
      return res.status(500).send({ error: true, message: 'Error retrieving data' });
    }
  });

  app.get('/health', (req, res) => {
    res.status(200).send('OK');
  });

  return app;
};
