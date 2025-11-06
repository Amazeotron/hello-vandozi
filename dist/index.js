import express from "express";
import dotenv from "dotenv";
import { surfConditions } from "./surf-conditions";
dotenv.config({ path: ".env" });
const app = express();
app.get("/surf-conditions", surfConditions);
const port = parseInt(process.env.PORT || "8080", 10);
app.listen(port, () => {
    console.log(`helloworld: listening on port ${port}`);
});
//# sourceMappingURL=index.js.map