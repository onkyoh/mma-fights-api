import { config } from 'dotenv';
import { createServer } from './config/server.js';
import { connectDB } from './config/mongodb.js';

config();

const init = async () => {
  try {
    const db = await connectDB();
    const app = createServer(db);

    const port = process.env.PORT || 1000;
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  } catch (err) {
    console.error('Failed to initialize application:', err);
  }
};

init();
