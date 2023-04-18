const express = require('express');
const cors = require('cors');
const schedule = require('node-schedule')
require('dotenv').config()
const MongoClient = require('mongodb').MongoClient;
const connectDB = require('./config/mongodb')
const scrape = require('./scrape')

//initialize mongodb instance

const init = async () => {
 const db = await connectDB()

 //setup express

  const app = express();
  app.use(express.json());
  app.use(cors());

  //triggers scraping and updates db

  const updatedDb = async () => {

    console.log('scraper called')

    const scrapedData = await scrape()

    const updateCollection = async() => {
      try {
        const updated = await db.updateOne({}, {$set: {data: scrapedData, updatedAt: new Date()}})
      } catch (err) {
        console.log(err)
      }
    }

    updateCollection()
  }

  // post endpoint triggered by AWS lambda function to trigger scrape

  app.post('/scrape', async(req,res) => {

    const { key } = req.body

    if (!key || key !== process.env.TRIGGER_KEY) {
      return res.status(401).send({
        error: true,
        message: 'invalid trigger key'
      })
    } else {
      await updatedDb()
      return res.status(200).send({
        error: false,
        message: 'scrape triggered'
      })
    }
  })

  //single endpoint to grab all the fights in the db

  app.get('/', async (req, res) => {

    const data = await db.findOne({})

    if (data) {
      return res.status(200).send(data)
    } else {
      return res.status(500).send({
        error: true,
        message: 'error during retrieval'
      })
    }
  });

  const port = process.env.PORT || 1000;

  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });

}

init()


