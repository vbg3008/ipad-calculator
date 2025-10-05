const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const rateLimit = require("express-rate-limit");


// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

const limiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 1, // Limit each IP to 1 request per windowMs
  message: { error: "You can only make one request every 24 hours. Please try again later." },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-Rate-Limit-*` headers
  keyGenerator: (req) => req.ip, // Use IP address as the identifier
});

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
// app.use(cookieParser());
app.use("/sendData",limiter)


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
    const prompt = `You are a highly precise mathematical solver with expertise in accurate interpretation and computation.

Your only task:
1. Carefully interpret the math problem from the image (typed or handwritten), including all variables, equations, or expressions. Strictly adhere to the order of operations (PEMDAS/BODMAS: Parentheses/Brackets, Exponents/Orders, Multiplication-Division left to right, Addition-Subtraction left to right).
2. Substitute any provided variable values exactly and compute step-by-step with maximum precision.
3. Perform all calculations accurately: Use exact fractions where applicable, compute each operation in sequence, and round the final numerical answer to exactly 2 decimal places only if it’s a repeating decimal. Ensure the "solution" exactly matches the result of the final step.
4. Output only a compact JSON object in this exact format (no extra text, no explanations, no markdown, no code blocks):

{
  "recognized_expression": "<the exact expression or equation detected, including any variable assignments like 'with x=2' or 'x=2, ... ='; if an equation, include the right side if present>",
  "solution": "<final numerical or algebraic answer as a string; must precisely match the last step’s result, e.g., '32.67' for 80/3 + 6 rounded to 2 decimals, or '80/3 + 6' if exact>",
  "steps": ["<step 1 describing substitution or operation>", "<step 2>", "<step 3>", "...", "<final step with the exact result>"],
  "type": "<type of problem: arithmetic | algebra | calculus | geometry | etc.>"
}

Rules:
- Ensure absolute consistency: The "solution" must be identical to the result in the final step. If steps compute to 32.666..., "solution" must be "32.67" (rounded to 2 decimals), not any other value. Recompute and correct if mismatched.
- Perform operations sequentially and verify each step against the original expression.
- Use at least 2 decimal places for intermediate results involving division (e.g., 26.67 for 80/3) and finalize rounding only at the last step.
- Double-check all calculations for arithmetic errors before finalizing the JSON.
- If the image suggests an equation (e.g., includes '='), solve for the variable if required; if it’s an expression (no '='), evaluate it as given.
- Handle handwriting ambiguities by choosing the most logical interpretation (e.g., distinguish between division and fraction bars).
- If multiple valid interpretations exist, prioritize the one aligning with standard mathematical notation; if still unclear, mark as "unclear".
- Preserve exact forms (e.g., fractions, radicals) in "solution" unless numerical approximation is needed at the final step.
- Recompute and adjust the "solution" if it deviates from the final step’s result, ensuring no external assumptions alter the outcome.
- Flag inconsistency by setting "solution": "N/A" and adding a step "Inconsistent computation detected" if the final step’s result does not match the computed value.
- Do NOT include any text outside the JSON.
- Do NOT wrap in code blocks or repeat instructions.
- Keep all text machine-readable and error-free.
- If the problem is unclear, return valid JSON with "recognized_expression": "unclear", "solution": "N/A", empty steps array, and "type": "unknown".

Example of a hard algebra problem to learn from:
Interpret this expression: Solve for x in the equation \( x^3 - 6x^2 + 11x - 6 = 0 \).
- Recognized: "x^3 - 6x^2 + 11x - 6 = 0"
- Steps: ["Possible rational roots: factors of 6 over 1 (±1,2,3,6)", "Test x=1: 1-6+11-6=0, so (x-1) factor", "Divide: x^3-6x^2+11x-6 ÷ (x-1) = x^2-5x+6", "Factor: (x-1)(x-2)(x-3)=0", "Roots: x=1,2,3"]
- Solution: "x=1, x=2, x=3"
- Type: "algebra"`;

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
    console.log("result",result)

    // Extract response text
    let rawText = result.response.text().trim();
    console.log("rawtext",rawText)

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
      apiRes:result,
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
