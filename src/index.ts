import express from "express";
// import dotenv from "dotenv";
import { surfConditions } from "./routes/surf-conditions";

// dotenv.config({ path: ".env" });

const app = express();

app.get("/surf-conditions", surfConditions);

const port = parseInt(process.env.PORT || "8080", 10);
app.listen(port, () => {
  console.log(`Vandozi: listening on port ${port}`);
});
