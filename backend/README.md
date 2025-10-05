# Math Solver API

A lightweight Node.js Express server that leverages Google's Gemini AI (Gemini 2.0 Flash Lite) to interpret images of mathematical problems (typed or handwritten) and provide step-by-step solutions in a structured JSON format. Ideal for integrating into web or mobile apps for on-the-fly math solving.

## Features

- **Multimodal AI Processing**: Upload base64-encoded images of math equations or problems; Gemini analyzes and solves them.
- **Structured Output**: Returns compact JSON with recognized expression, final solution, step-by-step explanations, and problem type (e.g., algebra, geometry).
- **Security & Performance**: Includes Helmet for security, Morgan for logging, CORS for cross-origin requests, and optimized prompts for fast, accurate responses.
- **Error Handling**: Robust try-catch blocks and JSON parsing fallback for unreliable AI outputs.
- **Extensible**: Supports additional variables via `dicts_of_Variables` in requests for context-aware solving.

## Prerequisites

- Node.js (v18+ recommended)
- A Google AI Studio API key for Gemini (free tier available)

## Installation

1. Clone or download the project:

   ```bash
   git clone https://github.com/vbg3008/ipad-calculator
   cd ipad-calculator
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your Gemini API key:

   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   PORT=5000  # Optional: defaults to 5000
   FRONTEND_URL=http://localhost:3000  # Optional: set your frontend URL for CORS
   ```

## Usage

### Starting the Server

Run the server locally:

```bash
npm run start
# or
node index.js
```

The server will listen on `http://localhost:5000` (or your specified `PORT`).

Test the health check endpoint:

```bash
curl http://localhost:5000/
```

Expected response: `"API is running..."`

### API Endpoints

#### `POST /sendData`

Sends an image of a math problem to Gemini for analysis and solving.

**Request Body** (JSON):
```json
{
  "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",  // Base64-encoded PNG/JPG image
  "dicts_of_Variables": {  // Optional: Dictionary of variables for context
    "x": 5,
    "pi": 3.14
  }
}
```

**Example Request** (using curl):
```bash
curl -X POST http://localhost:5000/sendData \
  -H "Content-Type: application/json" \
  -d '{
    "image": "data:image/png;base64,...your_base64_image...",
    "dicts_of_Variables": {}
  }'
```

**Response** (JSON):
```json
{
  "message": "Processed successfully",
  "result": {
    "recognized_expression": "2x + 3 = 7",
    "solution": "x = 2",
    "steps": [
      "Subtract 3 from both sides: 2x = 4",
      "Divide both sides by 2: x = 2"
    ],
    "type": "algebra"
  },
  "variables": {}
}
```

**Error Responses**:
- `400 Bad Request`: Missing image.
- `500 Internal Server Error`: API key issues, parsing failures, or server errors.

### Image Requirements
- Supported formats: PNG, JPG (base64-encoded).
- Max size: 50MB (enforced by Express middleware).
- Content: Clear math problems (equations, word problems, diagrams). Handwritten text works best with high-resolution images.

## Project Structure

```
math-solver-api/
├── index.js          # Main server file
├── .env.example      # Template for environment variables
├── .gitignore        # Standard Node ignores
├── package.json      # Dependencies and scripts
└── README.md         # This file
```

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `express` | ^4.18.0 | Web framework |
| `cors` | ^2.8.5 | Cross-origin resource sharing |
| `morgan` | ^1.10.0 | HTTP request logging |
| `helmet` | ^7.0.0 | Security headers |
| `cookie-parser` | ^1.4.6 | Cookie parsing |
| `dotenv` | ^16.0.0 | Environment variables |
| `@google/generative-ai` | ^0.2.1 | Gemini AI integration |

Install with `npm install`.

## Development

- **Logging**: Morgan logs requests in "dev" format.
- **Testing**: Add your own tests (e.g., using Jest) for endpoints.
- **Prompt Customization**: Edit the `prompt` string in `/sendData` for tailored AI behavior.
- **Rate Limits**: Gemini has usage quotas; monitor via Google AI Studio.

## Contributing

1. Fork the repo.
2. Create a feature branch (`git checkout -b feature/amazing-feature`).
3. Commit changes (`git commit -m 'Add amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

## License

This project is open-source and available under the MIT License. See [LICENSE](LICENSE) for details.

## Support

- Issues: Open a GitHub issue.
- Questions: Check Google AI docs for Gemini troubleshooting.

---

*Built with ❤️ using Node.js and Gemini AI. Last updated: October 2025.*