const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv').config()
const MongoClient = require('mongodb').MongoClient;
const connectDB = require('./config/mongodb')

//initialize mongodb instance

let db;
const init = async () => {
  db = await connectDB()
}
init()

//setup express

const app = express();
app.use(express.json());
app.use(cors());

//triggers scraping and updates database with returned data every 24hr

const updatedDb = async () => {

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

setInterval(async () => {
  await updatedDb()
}, 24 * 60 * 60 * 1000)


//single endpoint to grab all the fights in the db

app.get('/cards', async (req, res) => {

  const data = await db.findOne({})

  if (data) {
    return res.status(200).send(data)
  } else {
    return res.status(404).send({
      error: true,
      message: 'error during retrieval'
    })
  }
});

const port = process.env.PORT || 1000;

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
