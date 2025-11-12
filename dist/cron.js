import cron from "node-cron";
import { fetchSurfReport } from "./routes/surf-conditions.js";
import prisma from "./prisma/singleton.js";
export const cronSurfReport = async () => {
    // once every 6 hours, fetch surf report and store in DB
    cron.schedule("0 */6 * * *", async () => {
        console.log("Running a task every 6 hours to fetch surf report");
        try {
            const surfData = await fetchSurfReport();
            console.log("Fetched surf data:", surfData.body);
            await prisma.surfReport.create({
                data: {
                    report: surfData.body,
                },
            });
            console.log("Surf report saved to database");
        }
        catch (error) {
            console.error("Error fetching or saving surf report:", error);
        }
    });
};
