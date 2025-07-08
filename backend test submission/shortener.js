"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Import express and your logging middleware
var express = require("express");
var log_1 = require("../logging middleware/log");
var cors = require("cors");
// Extract Request and Response types for convenience
var Request = express.Request, Response = express.Response;
// Create express app
var app = express();
var port = 3000;
app.use(cors());
// Enable JSON body parsing
app.use(express.json());
// In-memory store
var urlStore = new Map();
// POST: Create Short URL
app.post("/shorturls", function (req, res) {
    var _a = req.body, url = _a.url, validity = _a.validity, shortcode = _a.shortcode;
    (0, log_1.log)("backend", "debug", "handler", "Received request to create short URL");
    if (!url || !validity || !shortcode) {
        (0, log_1.log)("backend", "warn", "handler", "Missing required fields in request body");
        return res.status(400).json({ error: "Missing required fields." });
    }
    if (urlStore.has(shortcode)) {
        (0, log_1.log)("backend", "warn", "handler", "Shortcode '".concat(shortcode, "' already exists"));
        return res.status(409).json({ error: "Shortcode already exists." });
    }
    urlStore.set(shortcode, {
        url: url,
        validity: validity,
        createdAt: Date.now(),
        clicks: 0,
        interactions: [],
    });
    (0, log_1.log)("backend", "info", "handler", "Created short URL for shortcode '".concat(shortcode, "'"));
    res.status(201).json({ message: "Short URL created", shortcode: shortcode });
});
// GET: Redirect to long URL and log interaction
app.get("/:shortcode", function (req, res) {
    var shortcode = req.params.shortcode;
    var entry = urlStore.get(shortcode);
    (0, log_1.log)("backend", "debug", "handler", "Received redirect request for shortcode '".concat(shortcode, "'"));
    if (!entry) {
        (0, log_1.log)("backend", "error", "handler", "Shortcode '".concat(shortcode, "' not found"));
        return res.status(404).json({ error: "Shortcode not found." });
    }
    var ageInSeconds = (Date.now() - entry.createdAt) / 1000;
    if (ageInSeconds > entry.validity) {
        (0, log_1.log)("backend", "info", "handler", "Shortcode '".concat(shortcode, "' expired"));
        urlStore.delete(shortcode);
        return res.status(410).json({ error: "Short URL expired." });
    }
    // Log interaction
    entry.clicks += 1;
    var interaction = {
        timestamp: Date.now(),
        referrer: req.get("Referrer") || "unknown",
        ip: req.ip,
    };
    entry.interactions.push(interaction);
    (0, log_1.log)("backend", "info", "handler", "Redirecting shortcode '".concat(shortcode, "' (total clicks: ").concat(entry.clicks, ")"));
    res.redirect(entry.url);
});
// GET: Retrieve statistics
app.get("/shorturls/:shortcode", function (req, res) {
    var shortcode = req.params.shortcode;
    var entry = urlStore.get(shortcode);
    (0, log_1.log)("backend", "debug", "handler", "Retrieving statistics for shortcode '".concat(shortcode, "'"));
    if (!entry) {
        (0, log_1.log)("backend", "error", "handler", "Shortcode '".concat(shortcode, "' not found"));
        return res.status(404).json({ error: "Shortcode not found." });
    }
    var expiryDate = entry.createdAt + entry.validity * 1000;
    (0, log_1.log)("backend", "info", "handler", "Returning statistics for shortcode '".concat(shortcode, "'"));
    res.json({
        shortcode: shortcode,
        target_url: entry.url,
        created_at: new Date(entry.createdAt).toISOString(),
        expiry_at: new Date(expiryDate).toISOString(),
        total_clicks: entry.clicks,
        interactions: entry.interactions.map(function (interaction) { return ({
            timestamp: new Date(interaction.timestamp).toISOString(),
            referrer: interaction.referrer,
            ip: interaction.ip,
        }); }),
    });
});
// Start server
app.listen(port, function () {
    (0, log_1.log)("backend", "info", "service", "URL shortener running on http://localhost:".concat(port));
});
