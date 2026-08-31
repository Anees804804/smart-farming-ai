import { getAmisPrices, MandiPrice } from './amisProvider';

export const MANDI_PROVINCES = ['punjab', 'sindh', 'kpk', 'balochistan', 'gilgit-baltistan'] as const;
export const MANDI_CROPS = ['wheat', 'rice', 'cotton', 'maize', 'mango', 'sugarcane', 'chickpea', 'potato', 'tomato', 'onion', 'green chilli', 'okra'] as const;

const provinceNames: Record<string, string> = {
  punjab: 'Punjab', sindh: 'Sindh', kpk: 'Khyber Pakhtunkhwa', balochistan: 'Balochistan', 'gilgit-baltistan': 'Gilgit-Baltistan',
};
const cropNames: Record<string, string> = {
  wheat: 'Wheat', rice: 'Rice', cotton: 'Cotton', maize: 'Maize', mango: 'Mango', sugarcane: 'Sugarcane', chickpea: 'Chickpea', potato: 'Potato', tomato: 'Tomato', onion: 'Onion', 'green chilli': 'Green Chilli', okra: 'Lady Finger/Okra',
};

export class MandiPricesError extends Error {
  constructor(message: string, public readonly statusCode: number, public readonly code: string) { super(message); }
}

export async function getMandiPrices(province: string, crop: string): Promise<{ province: string; crop: string; data: MandiPrice[]; status: string }> {
  const provinceKey = province.toLowerCase();
  const cropKey = crop.toLowerCase();
  if (!(MANDI_PROVINCES as readonly string[]).includes(provinceKey)) throw new MandiPricesError('Invalid province.', 400, 'INVALID_PROVINCE');
  if (!(MANDI_CROPS as readonly string[]).includes(cropKey)) throw new MandiPricesError('Invalid crop.', 400, 'INVALID_CROP');
  if (provinceKey !== 'punjab') return { province: provinceNames[provinceKey], crop: cropNames[cropKey], data: [], status: 'no_data' };

  const data = await getAmisPrices(cropNames[cropKey]);
  return { province: provinceNames[provinceKey], crop: cropNames[cropKey], data, status: data.length ? 'latest_available' : 'no_data' };
}