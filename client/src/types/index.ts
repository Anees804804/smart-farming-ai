export type Language = 'en' | 'ur' | 'roman-urdu';

export interface NavItem {
  label: string;
  path: string;
  icon: string;
}

export interface StatItem {
  value: string;
  label: string;
  icon: string;
}

export interface FeatureItem {
  title: string;
  description: string;
  path: string;
  icon: string;
}

export interface HealthResponse {
  status: string;
  service: string;
  timestamp: string;
  environment: string;
  dependencies?: {
    mongodb: 'connected' | 'unavailable';
    ml: 'available' | 'unavailable';
    groq: 'configured' | 'not_configured';
    weather: 'configured' | 'not_configured';
  };
}

export interface MLHealthResponse {
  status: string;
  service: string;
  models: {
    disease: string;
    crop: string;
  };
}

// Phase 2 types

export interface WeedRecord {
  id: string;
  nameEn: string;
  nameUr: string;
  nameRomanUrdu: string;
  scientificName: string;
  crops: string[];
  identification: string;
  symptomsOrImpact: string;
  yieldImpact: string;
  pestHosting: string;
  controlPeriod: string;
  culturalControl: string;
  mechanicalControl: string;
  chemicalControl: string;
  prevention: string;
}

export interface WeedListResponse {
  status: string;
  count: number;
  data: WeedRecord[];
}

export interface CropsResponse {
  status: string;
  data: string[];
}

export interface WeatherResponse {
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  rainfall: number;
  location: string;
  farmingAdvice: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatRequest {
  message: string;
  sessionId?: string;
  language: Language;
}

export interface ChatResponse {
  status: string;
  data: {
    reply: string;
    sessionId: string;
    timestamp: string;
  };
}

export interface DiseasePrediction {
  disease: string;
  confidence: number;
  topPredictions: Array<{ label: string; confidence: number }>;
}

export interface DiseaseFallbackObservation {
  crop: string;
  observation: string;
}

export type DiseaseDetectionResponse = {
  status: 'ok' | 'low_confidence';
  message?: string;
  explanation?: string;
  data: DiseasePrediction;
} | {
  status: 'fallback_observation';
  explanation?: string;
  data: DiseaseFallbackObservation;
};

export interface MandiPrice {
  crop: string;
  price: number;
  currency: string;
  unit: string;
  province: string;
  market: string;
  updatedAt: string;
  status: 'latest_available';
  source: string;
  sourceUrl: string;
}

export interface MandiPricesResponse {
  status: string;
  data: { province: string; crop: string; data: MandiPrice[]; status: string };
}

export interface FarmerRateEntry {
  province: string;
  crop: string;
  rate: number;
  createdAt: string;
}

export interface FarmerRatesResponse {
  status: string;
  data: FarmerRateEntry[];
}

export interface ApiError {
  status: string;
  error: string;
  code?: string;
}
