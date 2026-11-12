# Stock Portfolio Analysis Agent (React + AI Integration)

A learning/demo portfolio dashboard built with React, JavaScript, HTML and CSS, with a small Express API for optional AI-generated portfolio commentary.

## Features
- Responsive portfolio dashboard
- Sample portfolio value, illustrative performance chart and allocation chart
- Add, search and remove stock holdings
- Calculate holding values and portfolio allocation in the browser
- AI portfolio commentary through a server-side OpenAI API integration
- Built-in rule-based demo analysis when no OpenAI key is configured

## Important data note
This starter uses manually entered/sample prices and illustrative chart history. It does **not** connect to a brokerage account or provide live market prices. The analysis is educational and is not investment advice.

## Requirements
- Node.js 18+
- npm

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. (Optional) Enable OpenAI:
   - Copy `.env.example` to `.env`
   - Add your key to `OPENAI_API_KEY`
   - Keep the key only in the server environment. Never expose it in frontend code.
3. Start the API in terminal 1:
   ```bash
   npm run server
   ```
4. Start the React app in terminal 2:
   ```bash
   npm run dev
   ```
5. Open the local URL printed by Vite (usually `http://localhost:5173`).

If no API key is provided, the API returns a built-in demo analysis. The dashboard still requires the API server to be running for the Analyze button.

## Project structure
```text
stock-portfolio-analysis-agent/
├── server/
│   └── index.js
├── src/
│   ├── App.jsx
│   ├── data.js
│   ├── main.jsx
│   └── styles.css
├── .env.example
├── index.html
├── package.json
└── vite.config.js
```

## Suggested learning path
1. Understand the React state in `src/App.jsx`.
2. Trace how adding/removing holdings updates calculated totals.
3. Review Recharts components for the performance and allocation visualizations.
4. Trace the `fetch()` call to `/api/analyze`.
5. Review `server/index.js` to understand why the OpenAI key stays on the server.

## Attribution
This is an original learning implementation inspired by the general idea of an AI-assisted stock portfolio dashboard. It is not the source code of the linked third-party repository. If you build on another project's code, follow its license and preserve required attribution.