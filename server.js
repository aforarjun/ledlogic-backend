import dotenv from "dotenv";
import app from "./src/app.js";
import connectDatabase from "./src/config/database.js";

// ********* Handling Uncaught Exception **********
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log("Shutting down the server due to Uncaught Exception");

  process.exit(1);
});

// config
dotenv.config({ path: "src/config/config.env" });

// connecting to the database
connectDatabase();

const server = app.listen(process.env.PORT, () => {
  console.log("server is listening on " + process.env.PORT);
});

// ********* Uhandled Promise Rejection **********
process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  console.log("Shutting down the server due to Unhandled promise rejection");

  server.close(() => {
    process.exit(1);
  });
});
