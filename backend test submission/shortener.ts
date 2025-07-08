// Import express and your logging middleware
import * as express from "express";
import { log } from "../logging middleware/log";
import * as cors from "cors";


// Extract Request and Response types for convenience
const { Request, Response } = express;

// Create express app
const app = express();
const port = 3000;
app.use(cors());

// Enable JSON body parsing
app.use(express.json());

// Types
interface ShortUrl {
  url: string;
  validity: number;
  createdAt: number;
  clicks: number;
  interactions: Interaction[];
}

interface Interaction {
  timestamp: number;
  referrer: string;
  ip: string;
}

interface CreateShortUrlRequest {
  url: string;
  validity: number;
  shortcode: string;
}

// In-memory store
const urlStore = new Map<string, ShortUrl>();

// POST: Create Short URL
app.post(
  "/shorturls",
  (
    req: express.Request<{}, {}, CreateShortUrlRequest>,
    res: express.Response
  ) => {
    const { url, validity, shortcode } = req.body;

    log("backend", "debug", "handler", "Received request to create short URL");

    if (!url || !validity || !shortcode) {
      log(
        "backend",
        "warn",
        "handler",
        "Missing required fields in request body"
      );
      return res.status(400).json({ error: "Missing required fields." });
    }

    if (urlStore.has(shortcode)) {
      log(
        "backend",
        "warn",
        "handler",
        `Shortcode '${shortcode}' already exists`
      );
      return res.status(409).json({ error: "Shortcode already exists." });
    }

    urlStore.set(shortcode, {
      url,
      validity,
      createdAt: Date.now(),
      clicks: 0,
      interactions: [],
    });

    log(
      "backend",
      "info",
      "handler",
      `Created short URL for shortcode '${shortcode}'`
    );

    res.status(201).json({ message: "Short URL created", shortcode });
  }
);

// GET: Redirect to long URL and log interaction
app.get("/:shortcode", (req: express.Request, res: express.Response) => {
  const { shortcode } = req.params;
  const entry = urlStore.get(shortcode);

  log(
    "backend",
    "debug",
    "handler",
    `Received redirect request for shortcode '${shortcode}'`
  );

  if (!entry) {
    log(
      "backend",
      "error",
      "handler",
      `Shortcode '${shortcode}' not found`
    );
    return res.status(404).json({ error: "Shortcode not found." });
  }

  const ageInSeconds = (Date.now() - entry.createdAt) / 1000;
  if (ageInSeconds > entry.validity) {
    log(
      "backend",
      "info",
      "handler",
      `Shortcode '${shortcode}' expired`
    );
    urlStore.delete(shortcode);
    return res.status(410).json({ error: "Short URL expired." });
  }

  // Log interaction
  entry.clicks += 1;
  const interaction: Interaction = {
    timestamp: Date.now(),
    referrer: req.get("Referrer") || "unknown",
    ip: req.ip,
  };
  entry.interactions.push(interaction);

  log(
    "backend",
    "info",
    "handler",
    `Redirecting shortcode '${shortcode}' (total clicks: ${entry.clicks})`
  );

  res.redirect(entry.url);
});

// GET: Retrieve statistics
app.get("/shorturls/:shortcode", (req: express.Request, res: express.Response) => {
  const { shortcode } = req.params;
  const entry = urlStore.get(shortcode);

  log(
    "backend",
    "debug",
    "handler",
    `Retrieving statistics for shortcode '${shortcode}'`
  );

  if (!entry) {
    log(
      "backend",
      "error",
      "handler",
      `Shortcode '${shortcode}' not found`
    );
    return res.status(404).json({ error: "Shortcode not found." });
  }

  const expiryDate = entry.createdAt + entry.validity * 1000;

  log(
    "backend",
    "info",
    "handler",
    `Returning statistics for shortcode '${shortcode}'`
  );

  res.json({
    shortcode,
    target_url: entry.url,
    created_at: new Date(entry.createdAt).toISOString(),
    expiry_at: new Date(expiryDate).toISOString(),
    total_clicks: entry.clicks,
    interactions: entry.interactions.map((interaction) => ({
      timestamp: new Date(interaction.timestamp).toISOString(),
      referrer: interaction.referrer,
      ip: interaction.ip,
    })),
  });
});

// Start server
app.listen(port, () => {
  log("backend", "info", "service", `URL shortener running on http://localhost:${port}`);
});
