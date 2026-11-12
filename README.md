# InvestIQ – Stock Portfolio Analysis Agent

A learning/demo stock portfolio dashboard built using React, JavaScript, HTML, CSS, and AI integration. It helps users manage sample stock holdings, visualize portfolio performance, and generate AI-assisted portfolio commentary.

## Live Demo

**Live Website:** https://invest-iq-stock-portfolio.vercel.app/

**GitHub Repository:** https://github.com/Maheswari-Tunga/InvestIQ-Stock-Portfolio

## Features

- Responsive stock portfolio dashboard
- Portfolio value and performance overview
- Interactive portfolio performance chart
- Stock allocation visualization
- Add, search, and remove stock holdings
- Automatic calculation of holding values and portfolio allocation
- AI-powered portfolio commentary
- Built-in rule-based demo analysis when no OpenAI API key is configured
- Responsive interface for desktop and mobile devices

## Technologies Used

- **Frontend:** React.js, JavaScript, HTML5, CSS3
- **Charts:** Recharts
- **Icons:** Lucide React
- **Backend:** Node.js, Express.js
- **AI Integration:** OpenAI API
- **Development Tools:** VS Code, Git, GitHub, Vite
- **Deployment:** Vercel

## Important Data Note

This project uses manually entered/sample stock prices and illustrative chart history. It does not connect to brokerage accounts or provide live market prices. The analysis is for educational and demonstration purposes only and is not investment advice.

## Requirements

- Node.js 18+
- npm

## Installation and Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/Maheswari-Tunga/InvestIQ-Stock-Portfolio.git
   ```

2. Navigate to the project folder:

   ```bash
   cd InvestIQ-Stock-Portfolio
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. (Optional) Enable OpenAI integration:
   - Copy `.env.example` to `.env`.
   - Add your API key to `OPENAI_API_KEY`.
   - Keep your API key on the server. Never expose it in frontend code.

5. Start the backend API in terminal 1:

   ```bash
   npm run server
   ```

6. Start the React application in terminal 2:

   ```bash
   npm run dev
   ```

7. Open the local URL printed by Vite, usually:

   ```text
   http://localhost:5173
   ```

If no OpenAI API key is configured, the API uses built-in demo analysis. The Analyze button requires the API server to be running.

## Project Structure

```text
InvestIQ-Stock-Portfolio/
├── server/
│   └── index.js
├── src/
│   ├── App.jsx
│   ├── data.js
│   ├── main.jsx
│   └── styles.css
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
├── README.md
└── vite.config.js
```

## Learning Outcomes

- Developed a responsive frontend using React.
- Implemented component-based UI and state management.
- Used Recharts to visualize portfolio performance and stock allocation.
- Implemented CRUD operations for stock holdings.
- Integrated a React frontend with an Express backend.
- Explored AI integration using the OpenAI API.
- Practiced Git, GitHub, and deployment using Vercel.

## Attribution

This is an original learning/demo implementation inspired by the general concept of an AI-assisted stock portfolio dashboard. It is not the source code of the linked third-party repository. If you build on another project's code, follow its license and preserve required attribution.
