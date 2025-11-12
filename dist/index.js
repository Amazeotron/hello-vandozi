import { cronSurfReport } from "./cron.js";
import prisma from "./prisma/singleton.js";
import { surfConditions } from "./routes/surf-conditions.js";
import express from "express";
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(".env") });
const app = express();
cronSurfReport();
app.get("/", async (_, res) => {
    const surfReports = await prisma.surfReport.findMany({
        orderBy: {
            createdAt: "desc",
        },
        take: 5,
    });
    res.send(`<h2>Vandozi is running! Try this: <a href="/surf-conditions">/surf-conditions</a></h2>
    <h3>Latest Surf Reports:</h3>
    <ul>
      ${surfReports
        .map((report) => `<li><strong>${report.createdAt.toISOString()}:</strong> ${report.report}</li>`)
        .join("")}
    </ul>`);
});
app.get("/surf-conditions", surfConditions);
const port = parseInt(process.env.PORT || "8080", 10);
app.listen(port, () => {
    console.log(`Vandozi: listening on port ${port}`);
});
