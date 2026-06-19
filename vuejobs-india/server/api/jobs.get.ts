import fs from "node:fs/promises";
import path from "node:path";

defineRouteMeta({
  openAPI: {
    summary: "Get Scraped Multi-Site Jobs",
    description: "Fetches and returns the collection of scraped Vue.js jobs in India.",
    tags: ["jobs"],
    responses: {
      200: {
        description: "Array of job objects containing title, company, location, platform, date, and link.",
      }
    }
  }
});

export default defineEventHandler(async (event) => {
  try {
    const filePath = path.resolve(process.cwd(), "multi_site_jobs.json");
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Failed to read jobs JSON file:", err);
    return [];
  }
});
