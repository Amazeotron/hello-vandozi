import { surfConditions, } from "./routes/surf-conditions.js";
import express from "express";
const url = "https://services.surfline.com/kbyg/regions/forecasts/conditions?subregionId=5cc73566c30e4c0001096989&days=1&accesstoken=b892cc4f756bdbce41c7abfd05f96cae384664fd";
const pageUrl = "https://www.surfline.com/surf-report/linda-mar-north/5cbf8d85e7b15800014909e8";
const app = express();
app.get("/", (_, res) => {
    res.send('<h5>Vandozi is running! Try this: <a href="/surf-conditions">/surf-conditions</a></h5>');
});
app.get("/surf-conditions", surfConditions);
const port = parseInt(process.env.PORT || "8080", 10);
app.listen(port, () => {
    console.log(`Vandozi: listening on port ${port}`);
});
