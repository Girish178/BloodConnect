import "dotenv/config"; // must stay the first import
import app from "./app.js";
import { connectDB } from "./db/index.js";

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start();