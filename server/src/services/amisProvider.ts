import axios from 'axios';
import { logger } from '../utils/logger';

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

const SOURCE_URL = 'http://www.amis.pk/Default.aspx';
const MARKET_NAMES = ['Lahore', 'Faisalabad', 'Rawalpindi', 'Multan', 'Okara'];

function textFromHtml(value: string): string {
  return value.replace(/<[^>]*>/g, ' ').replace(/&nbsp;|&#160;/gi, ' ').replace(/&amp;/gi, '&').replace(/\s+/g, ' ').trim();
}

function parseNumber(value: string): number | null {
  const number = Number(value.replace(/,/g, '').trim());
  return Number.isFinite(number) ? number : null;
}

function parseUpdatedAt(html: string): string {
  const match = html.match(/Page accessed on ([^<]+?)(?:<|\.)/i);
  return match?.[1]?.trim() || new Date().toISOString();
}

export async function getAmisPrices(crop: string): Promise<MandiPrice[]> {
  try {
    const response = await axios.get<string>(SOURCE_URL, { timeout: 30000, responseType: 'text' });
    const tableStart = response.data.indexOf('id="ModulePrices_GridView1"');
    const tableEnd = response.data.indexOf('</table>', tableStart);
    if (tableStart < 0 || tableEnd < 0) return [];
    const table = response.data.slice(tableStart, tableEnd);
    const rows = [...table.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
    const updatedAt = parseUpdatedAt(response.data);
    const results: MandiPrice[] = [];

    for (const row of rows) {
      const cells = [...row[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((cell) => textFromHtml(cell[1]));
      if (cells.length < MARKET_NAMES.length + 1 || !cells[0].toLowerCase().includes(crop.toLowerCase())) continue;

      MARKET_NAMES.forEach((market, index) => {
        const price = parseNumber(cells[index + 1]);
        if (price !== null) {
          results.push({
            crop: cells[0], price, currency: 'PKR', unit: '100 kg', province: 'Punjab', market,
            updatedAt, status: 'latest_available', source: 'AMIS Punjab', sourceUrl: SOURCE_URL,
          });
        }
      });
    }
    return results;
  } catch (error) {
    logger.warn('AMIS price request failed', { error: error instanceof Error ? error.message : 'Unknown error' });
    throw new Error('AMIS price source unavailable');
  }
}