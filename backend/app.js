if (process.env.NODE_ENV !== "production") {
  const path = require("path");
  require("dotenv").config({ path: path.join(__dirname, ".env") });
}

const http = require("http");
const express = require("express");
const app = express();
const server = http.createServer(app);
const cors = require("cors");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const path = require("path");
const fs = require("fs");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const MongoStore = require("connect-mongo");

const { initSocket } = require("./services/notificationService.js");

// Initialize Socket.IO
const io = initSocket(server);

const DEFAULT_LOCAL_DB_URL =
  "mongodb+srv://luckykv17_db_user:HETcndVJlRbg38xS@clusterlx.zfgujix.mongodb.net/THEAIR?retryWrites=true&w=majority&appName=Cluster0";

let dburl = process.env.MONGO_URL || process.env.ATLAS_URI;
if (!dburl || (!dburl.startsWith("mongodb://") && !dburl.startsWith("mongodb+srv://"))) {
  dburl = DEFAULT_LOCAL_DB_URL;
}

const sessionSecret = process.env.SECRET || "LuxeHavenSecretKey2026";
const port = Number(process.env.PORT) || 5000;

// Connect to MongoDB
async function main() {
  await mongoose.connect(dburl);
}

// Middleware setup
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

// EJS setup (for legacy pages)
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../frontend/views"));
app.engine("ejs", ejsMate);
// Serve compiled React build and brand assets first
const localScratchDist = "C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\97b019a5-1c80-41e1-9771-8c5a5a58411a\\scratch\\dist";
const reactDistPath = fs.existsSync(localScratchDist)
  ? localScratchDist
  : path.join(__dirname, "../frontend/dist");
if (fs.existsSync(reactDistPath)) {
  app.use(express.static(reactDistPath));
}
app.use(express.static(path.join(__dirname, "../frontend/Public")));

// Session store
const store = MongoStore.create({
  mongoUrl: dburl,
  crypto: {
    secret: sessionSecret,
  },
  touchAfter: 24 * 3600,
});

store.on("error", (err) => {
  console.log("Session store error:", err);
});

app.use(
  session({
    store,
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  })
);

app.use(flash());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.session.user || null;
  res.locals.searchQuery = req.query.q || "";
  next();
});

// --- API ROUTES FOR LUXE HAVEN PMS ---
const apiRouter = require("./Route/api.js");
app.use("/api", apiRouter);

// --- LEGACY ROUTES (Airbnb demo compatibility) ---
const listingRouter = require("./Route/listing.js");
const reviewRouter = require("./Route/review.js");
const userRouter = require("./Route/user.js");

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

// Single Page Application routing: serve React index.html for all non-API paths if React build exists
app.use((req, res, next) => {
  if (req.method !== "GET") return next();
  if (req.path.startsWith("/api") || req.path.startsWith("/listings")) {
    return next();
  }
  const reactIndex = path.join(reactDistPath, "index.html");
  if (fs.existsSync(reactIndex)) {
    return res.sendFile(reactIndex);
  }
  res.redirect("/listings");
});

// Error handling middleware
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong!" } = err;
  if (res.headersSent) {
    return next(err);
  }

  // If API request, return JSON
  if (req.originalUrl && req.originalUrl.startsWith("/api")) {
    return res.status(statusCode).json({
      success: false,
      message,
      error: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }

  res.status(statusCode).render("error.ejs", { err });
});

// Start server
if (process.env.NODE_ENV !== "test") {
  main()
    .then(() => {
      console.log("Connected to MongoDB Atlas");
      server.listen(port, () => {
        console.log(`Luxe Haven PMS Server running on port ${port}`);
      });
    })
    .catch((err) => {
      console.error("MongoDB connection failed:", err.message);
      // Fallback: start server anyway so APIs / mock mode can be inspected
      server.listen(port, () => {
        console.log(`Luxe Haven PMS Server started on port ${port} (DB connecting in background)`);
      });
    });
}

module.exports = { app, server };
