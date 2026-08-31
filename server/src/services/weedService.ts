import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger';

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

let weeds: WeedRecord[] = [];

function loadWeedData(): void {
  try {
    const filePath = path.resolve(__dirname, '../../data/weeds.json');
    const raw = fs.readFileSync(filePath, 'utf-8');
    weeds = JSON.parse(raw);
    logger.info(`Loaded ${weeds.length} weed records from knowledge base`);
  } catch (error) {
    logger.error('Failed to load weed data', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    weeds = [];
  }
}

// Load on module init
loadWeedData();

export function getAllWeeds(crop?: string): WeedRecord[] {
  if (crop) {
    return weeds.filter((w) =>
      w.crops.some((c) => c.toLowerCase() === crop.toLowerCase())
    );
  }
  return weeds;
}

export function getCrops(): string[] {
  const cropSet = new Set<string>();
  weeds.forEach((w) => w.crops.forEach((c) => cropSet.add(c)));
  return Array.from(cropSet).sort();
}

export function getWeedById(id: string): WeedRecord | undefined {
  return weeds.find((w) => w.id === id);
}

export function searchWeeds(query: string): WeedRecord[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  return weeds.filter(
    (w) =>
      w.nameEn.toLowerCase().includes(q) ||
      w.nameUr.includes(q) ||
      w.nameRomanUrdu.toLowerCase().includes(q) ||
      w.scientificName.toLowerCase().includes(q) ||
      w.identification.toLowerCase().includes(q)
  );
}
