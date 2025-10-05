const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Routes
app.get("/", (req, res) => {
  res.send("API is running...");
});

// 🧠 Optimized route for Gemini image-based solving
app.post("/sendData", async (req, res) => {
  try {
    const { image, dicts_of_Variables } = req.body;

    if (!image) {
      return res.status(400).json({ error: "No image provided" });
    }

    // Use Gemini 1.5-Flash (fast + multimodal)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

    // 🧩 Extremely detailed + efficient prompt
    const prompt = `
You are a precise mathematical solver.

Your only task:
1. Interpret the math problem shown in the image (typed or handwritten).
2. Solve it step-by-step if necessary.
3. Output only a compact JSON object with this exact format (no explanations, no markdown):

{
  "recognized_expression": "<the expression or equation detected>",
  "solution": "<final numerical or algebraic answer>",
  "steps": ["<step 1>", "<step 2>", "<step 3>", "..."],
  "type": "<type of problem: arithmetic | algebra | calculus | geometry | etc.>"
}

Rules:
- Do NOT include any text outside of the JSON.
- Do NOT wrap the JSON in code blocks.
- Do NOT repeat the instructions.
- Keep all text machine-readable.
- If the problem is unclear, still return valid JSON with "recognized_expression": "unclear" and "solution": "N/A".
`;

    // 🧠 Send image + prompt to Gemini
    const result = await model.generateContent([
      { text: prompt },
      {
        inlineData: {
          mimeType: "image/png",
          data: image.replace(/^data:image\/\w+;base64,/, ""),
        },
      },
    ]);

    // Extract response text
    let rawText = result.response.text().trim();

    // 🧹 Clean Gemini output (remove ```json, ``` and similar wrappers)
    rawText = rawText
      .replace(/^```json/i, "") // remove starting ```json
      .replace(/^```/i, "") // remove starting ```
      .replace(/```$/i, "") // remove ending ```
      .trim();

    let parsedOutput;
    try {
      parsedOutput = JSON.parse(rawText);
    } catch (e) {
      console.warn("Gemini returned non-JSON output:", rawText);
      parsedOutput = { error: "Failed to parse Gemini output", rawText };
    }

    res.status(200).json({
      message: "Processed successfully",
      result: parsedOutput,
      variables: dicts_of_Variables || {},
    });
  } catch (error) {
    console.error("Error processing data:", error);
    res.status(500).json({ error: "Server error processing data" });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "production" ? {} : err,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
