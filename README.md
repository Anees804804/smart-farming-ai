# Smart Farming AI Pakistan

An AI-powered agriculture platform designed to provide accessible farming assistance for Pakistani farmers. Built for the **Alibaba Cloud AI Hackathon Pakistan 2026**.

## Features

### Phase 2 (Current)
- **Weed Management** — Curated knowledge base covering 8 major Pakistani crops (Wheat, Rice, Cotton, Sugarcane, Maize, Chickpea, Mango, Potato) with search and crop filtering
- **Weather Intelligence** — Real-time weather data via OpenWeather API with farming advice based on conditions
- **AI Farming Assistant** — Multilingual AI chatbot powered by Groq, supporting English, Urdu, and Roman Urdu
- **Chat Persistence** — MongoDB-backed chat session storage with 30-day TTL auto-cleanup

### Phase 1 (Foundation)
- Responsive React dashboard with Tailwind CSS
- Internationalization (English, Urdu, Roman Urdu)
- Mobile-friendly sidebar navigation
- Health endpoints for all services

### Phase 3 (Current)
- Mandi market prices through the official AMIS Punjab source where available
- Plant disease image inference through a Hugging Face MobileNet V2 model
- Express-to-FastAPI ML proxy endpoints
- React crop and disease workflows with controlled error states
- In-memory image handling; uploads are not permanently stored

## Languages

- English
- Urdu (اردو)
- Roman Urdu

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite 5, Tailwind CSS 3 |
| Backend | Node.js, Express, TypeScript |
| ML Service | Python, FastAPI |
| Database | MongoDB (Mongoose) |
| AI | Groq API |
| Weather | OpenWeather API |
| Market prices | AMIS Punjab |
| Testing | Jest, Supertest |

## Project Structure

```
smart-farming-ai/
├── client/              # React frontend (Vite + Tailwind)
│   └── src/
│       ├── components/  # Layout + shared components
│       ├── pages/       # Route pages
│       ├── context/     # React contexts (language, app state)
│       ├── hooks/       # Custom hooks
│       ├── i18n/        # Translation files (en, ur, roman-urdu)
│       ├── services/    # API client
│       └── types/       # TypeScript type definitions
├── server/              # Express backend (TypeScript)
│   ├── data/            # Static data (weeds.json)
│   └── src/
│       ├── config/      # Environment + DB configuration
│       ├── controllers/ # Route controllers
│       ├── middleware/   # CORS, error handling, rate limiting, validation
│       ├── models/      # Mongoose models (ChatSession)
│       ├── routes/      # Express routes
│       ├── services/    # Business logic (weather, Groq, weeds)
│       └── utils/       # Logger, async handler, AppError
├── ml-service/          # Python FastAPI ML service
└── tests/               # Server tests (Jest + Supertest)
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port (default: 5000) | No |
| `NODE_ENV` | Environment (development/production) | No |
| `MONGODB_URI` | MongoDB connection string | No* |
| `GROQ_API_KEY` | Groq API key for AI assistant | For AI chat |
| `GROQ_MODEL` | Groq model name | No |
| `OPENWEATHER_API_KEY` | OpenWeather API key | For weather |
| `ML_SERVICE_URL` | ML service URL (default: http://localhost:8000) | No |
| `VITE_API_URL` | Client API base URL | No |

\* MongoDB is optional — the application runs without it. Chat persistence degrades gracefully.

## Local Development

### Prerequisites

- Node.js 20+
- Python 3.11+
- MongoDB (local or Atlas) — optional

### Setup

1. **Install dependencies:**

```bash
npm run install:all
```

2. **Configure environment variables:**

```bash
cp .env.example .env
# Edit .env with your API keys (optional — features degrade gracefully without keys)
```

3. **Start development servers:**

```bash
# Start frontend + backend together
npm run dev

# Or start individually
npm run dev:client    # Frontend on http://localhost:5173
npm run dev:server    # Backend on http://localhost:5000
npm run dev:ml        # ML service on http://localhost:8000
```

4. **Start MongoDB (optional):**

```bash
mongod
```

### Configuring OpenWeather

1. Sign up at [OpenWeather](https://openweathermap.org/api) for a free API key
2. Set `OPENWEATHER_API_KEY=your_key` in `.env`
3. Without a key, weather endpoints return HTTP 503

### Configuring Groq

1. Sign up at [Groq Cloud](https://console.groq.com/) for an API key
2. Set `GROQ_API_KEY=your_key` in `.env`
3. Optionally set `GROQ_MODEL=model_name` (defaults to llama-3.1-8b-instant)
4. Without a key, chat endpoints return HTTP 503

## API Endpoints

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health with dependency status |
| GET | `/health` | ML service health |

### Weeds
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/weeds` | List all weeds (optional `?crop=` filter) |
| GET | `/api/weeds/crops` | List available crops |
| GET | `/api/weeds/:id` | Get weed by ID |
| GET | `/api/weeds/search?q=` | Search weeds by name |

### Weather
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/weather/current?lat=&lon=` | Current weather by coordinates |
| GET | `/api/weather/city?city=` | Current weather by city |
| GET | `/api/weather/farming-advice?lat=&lon=` | Weather + farming advice |

### AI Assistant
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/assistant/chat` | Send message, get AI response |

### ML Inference
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/mandi-prices?province=punjab&crop=wheat` | Fetch latest available AMIS market prices |
| POST | `/api/disease/detect` | Proxy an in-memory JPEG, PNG, or WEBP image to FastAPI |

## Running Tests

```bash
cd server
npm test
```

All tests use mocked external services — no real API keys required.

## Docker Deployment

```bash
docker-compose up --build
```

Services:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- ML Service: http://localhost:8000
- MongoDB: localhost:27017

## ML Models (Phase 3)

Mandi prices are sourced from AMIS Punjab's daily market pages. The application preserves the source's market, unit, and update metadata and labels results as latest available rather than live.

Disease inference uses the Hugging Face model `linkanjarad/mobilenet_v2_140x140_plant_diseases_kaggle` through a Transformers image-classification pipeline. The project does not contain its training dataset, local artifact, label metadata, or training script. Dataset origin, country, class inventory, and official metrics are **Not verified**. The project does not claim that this model was trained on Pakistani data.

Disease confidence below `DISEASE_CONFIDENCE_THRESHOLD` (default `0.6`) is returned as `low_confidence`. Treatment, pesticide, dosage, and disease-specific prevention information are not generated by the ML endpoint; users are directed to local agricultural experts.

## License

MIT
