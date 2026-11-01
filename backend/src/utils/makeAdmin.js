import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/User.js";

const email = process.argv[2]?.toLowerCase();

if (!email) {
  console.error("Usage: node src/utils/makeAdmin.js user@example.com");
  process.exit(1);
}

await mongoose.connect(process.env.MONGO_URI);
const user = await User.findOneAndUpdate({ email }, { role: "admin" }, { new: true });
console.log(user ? `${user.email} is now an admin` : "No user found with that email");
await mongoose.disconnect();
//Make an admin with this, using a third account (register “Hospital Admin” in the browser first):

//bash
//node src/utils/makeAdmin.js admin@test.com

//You can also open Compass, find the user in users, and change role to admin. After promoting, refresh the browser so the app reloads the role.