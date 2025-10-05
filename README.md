# iPad Calculator

A full-stack math solver app inspired by iPad's calculator, allowing users to handwrite or draw math problems on a responsive canvas and get AI-powered solutions using Google's Gemini. Features a Node.js Express backend for image processing and a React/Vite frontend for interactive drawing. Perfect for educational tools, quick calculations, or fun math experiments on desktop or mobile devices.

## Overview

- **Frontend**: React app with a full-screen drawing canvas supporting touch/mouse input, color selection, and real-time result display.
- **Backend**: Express server integrating Gemini AI to analyze base64 images of math expressions, providing step-by-step solutions in JSON.
- **Key Integration**: Canvas drawings are captured as PNGs and sent to the backend via Axios for multimodal AI processing.


[![Live Demo](https://img.shields.io/badge/Live_Demo-4CAF50?style=for-the-badge&logo=vercel&logoColor=white)](https://ipad-calculator-lbw1otfp3-vbg3008s-projects.vercel.app/)

![Demo Screenshot](https://raw.githubusercontent.com/vbg3008/ipad-calculator/refs/heads/main/image.png)  

## Features

- **Handwriting Recognition**: Draw equations, graphs, or problems with smooth strokes; supports colors for diagrams.
- **AI-Powered Solving**: Uses Gemini 2.0 Flash Lite for fast, accurate interpretation and solutions across arithmetic, algebra, calculus, geometry, etc.
- **Step-by-Step Explanations**: Detailed breakdown in the UI overlay, with recognized expression and problem type.
- **Responsive & Touch-Friendly**: Optimized for iPad/iOS, but works on any device with adaptive controls.
- **Error-Resilient**: Handles unclear inputs gracefully with fallback JSON.
- **Extensible**: Optional variable context in requests for advanced solving.

## Tech Stack

| Category | Technologies |
|----------|--------------|
| **Backend** | Node.js, Express, Google Generative AI (Gemini), dotenv, CORS, Helmet, Morgan |
| **Frontend** | React 19, Vite, Tailwind CSS 4, Axios, Canvas API |
| **Build Tools** | npm |
| **Other** | JavaScript (ES6+), JSON for data exchange |

## Prerequisites

- Node.js (v18+)
- Google AI Studio API key for Gemini
- Git for cloning

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/vbg3008/ipad-calculator.git
cd ipad-calculator
```

### 2. Backend Setup

Navigate to the backend directory (assumed `/backend` or root if monorepo):

```bash
cd backend  # Adjust path if needed
npm install
```

Create `.env`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=5000
```

Start the server:

```bash
npm start
```

Server runs on `http://localhost:5000`.

### 3. Frontend Setup

Navigate to the frontend directory (assumed `/frontend` or `/calculator`):

```bash
cd frontend  # or cd calculator
npm install
```

Create `.env`:

```env
VITE_BACKEND_URL=http://localhost:5000
```

Start the dev server:

```bash
npm run dev
```

App opens at `http://localhost:5173`.

### 4. Usage

- Draw a math problem on the canvas (e.g., "x² + 2x + 1 = 0").
- Click "Calculate" to send to backend.
- View the solution overlay with steps.

**API Endpoint** (for direct testing): `POST /sendData` with `{ image: base64_png }`.

## Project Structure

```
ipad-calculator/
├── backend/                 # Express server
│   ├── index.js            # Main server file
│   ├── package.json        # Backend deps
│   └── .env                # API keys
├── frontend/                # React app (or /calculator)
│   ├── src/
│   │   ├── components/
│   │   │   └── Home.jsx    # Drawing canvas component
│   │   ├── constants/
│   │   │   └── index.js    # Colors config
│   │   ├── App.jsx         # Root component
│   │   └── main.jsx        # Entry point
│   ├── package.json        # Frontend deps
│   ├── vite.config.js      # Vite config
│   ├── tailwind.config.js  # Tailwind setup
│   └── postcss.config.js   # PostCSS config
├── README.md               # This file
├── .gitignore
└── LICENSE                 # MIT License
```

## Development

- **Backend**: Edit prompts in `/sendData` route for custom AI behavior. Test with Postman/curl.
- **Frontend**: Customize colors in `constants/index.js`. Add routing with React Router if expanding.
- **Linting**: `npm run lint` in frontend.
- **Build**: `npm run build` for production bundles.
- **Testing**: Add unit tests with Jest (not included).

## Deployment

- **Backend**: Deploy to Vercel, Heroku, or Render. Set env vars for GEMINI_API_KEY.
- **Frontend**: Build with `npm run build` and host on Netlify, Vercel, or GitHub Pages.
- **Full-Stack**: Use Docker for containerization or separate deploys with CORS configured.

## Contributing

1. Fork the repo.
2. Create a branch: `git checkout -b feature/your-feature`.
3. Commit: `git commit -m 'Add your feature'`.
4. Push: `git push origin feature/your-feature`.
5. Open a PR.

Pull requests welcome! Focus on performance, accessibility, or new math types.

## License

MIT License. See [LICENSE](LICENSE) for details.

## Acknowledgments

- Google Gemini AI for multimodal capabilities.
- Tailwind CSS for rapid styling.
- Vite for blazing-fast builds.

---

*Built with ❤️ for math lovers. Last updated: October 05, 2025. Questions? Open an issue!*