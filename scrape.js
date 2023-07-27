const axios = require('axios');
const cheerio = require('cheerio');

const delayBetweenRequests = 3600000 / 1000; // 3600000ms = 1 hour, dividing by 1000 to get seconds
const maxActorsPerHour = 1000;
let actorsScrapedThisHour = 0;
let lastScrapeTimestamp = null;

// Function to scrape data for a given actor ID
async function scrapeDataFromURL(actorId) {
  const URL = `https://www.ordino.gr/en_actor_detail.asp?id=${actorId}`;

  try {
    const response = await axios.get(URL);
    const html = response.data;
    const details = scrapeData(html);

    console.log(`Scraped Data for actor ID ${actorId}:`, details);
  } catch (error) {
    console.error(`Error while scraping actor ID ${actorId}:`, error.message);
  }
}

// Function to scrape data for a range of actor IDs with a limit per hour
async function scrapeDataForActorRange(startActorId, endActorId) {
  for (let currentActorId = startActorId; currentActorId <= endActorId; currentActorId++) {
    // Check if the hourly limit has been reached
    if (actorsScrapedThisHour >= maxActorsPerHour) {
      const currentTime = Date.now();
      const timeElapsedSinceLastScrape = currentTime - lastScrapeTimestamp;

      if (timeElapsedSinceLastScrape < delayBetweenRequests) {
        const delay = delayBetweenRequests - timeElapsedSinceLastScrape;
        console.log(`Hourly limit reached. Waiting for ${delay / 1000} seconds before resuming.`);
        await sleep(delay);
      }

      actorsScrapedThisHour = 0;
      lastScrapeTimestamp = null;
    }

    // Scrape data for the current actor ID
    await scrapeDataFromURL(currentActorId);

    // Update counters and timestamp
    actorsScrapedThisHour++;
    if (!lastScrapeTimestamp) {
      lastScrapeTimestamp = Date.now();
    }
  }
}

function scrapeData(html) {
  const $ = cheerio.load(html);
  const details = {};

  // Extracting eye color, height, and other details
  $('td.bodymain').each((index, element) => {
    const detailText = $(element).text().trim();
    console.log('detailText:', detailText); // Log the detailText to check if it's correct
    const [key, value] = detailText.split(':');

    if (key && value) {
      console.log('key:', key); // Log the key to check if it's correct
      console.log('value:', value); // Log the value to check if it's correct
      // Cleaning up the key and value to remove any extra whitespace
      const cleanKey = key.trim();
      const cleanValue = value.trim();

      // Store the data only if it's not an empty string
      if (cleanValue) {
        details[cleanKey] = cleanValue;
      }
    }
  });

  return details;
}


// Function to create a sleep delay
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Usage: Scrape data for actors with IDs from 10551 to 11550
scrapeDataForActorRange(5000, 30000);
