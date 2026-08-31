import { motion } from 'framer-motion';
import { CalendarDays, ExternalLink, Info, MapPinned, Wheat } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

type Province = 'punjab' | 'sindh' | 'kpk' | 'balochistan';
type Crop = 'all' | 'wheat' | 'rice' | 'cotton' | 'maize' | 'mango';

const provinces: Array<{ id: Province; className: string }> = [
  { id: 'balochistan', className: 'left-[4%] top-[30%] h-[50%] w-[42%]' },
  { id: 'kpk', className: 'left-[38%] top-[7%] h-[35%] w-[30%]' },
  { id: 'punjab', className: 'left-[57%] top-[29%] h-[39%] w-[33%]' },
  { id: 'sindh', className: 'left-[47%] top-[62%] h-[31%] w-[38%]' },
];

const crops: Array<{ id: Crop; icon: string; label: string }> = [
  { id: 'all', icon: '🌱', label: 'All crops' },
  { id: 'wheat', icon: '🌾', label: 'Wheat' },
  { id: 'rice', icon: '🌾', label: 'Rice' },
  { id: 'cotton', icon: '🌿', label: 'Cotton' },
  { id: 'maize', icon: '🌽', label: 'Maize' },
  { id: 'mango', icon: '🥭', label: 'Mango' },
];

const sindhCrops: Crop[] = ['cotton', 'rice', 'wheat', 'mango'];
const punjabCrops: Crop[] = ['wheat', 'cotton', 'rice', 'maize', 'mango'];
const kpkCrops: Crop[] = ['wheat', 'maize'];
const balochistanCrops: Crop[] = ['wheat'];

export default function AgricultureMap() {
  const { t } = useLanguage();
  const [selectedProvince, setSelectedProvince] = useState<Province>('sindh');
  const [selectedCrop, setSelectedCrop] = useState<Crop>('all');
  const selected = provinces.find((province) => province.id === selectedProvince)!;
  const availableCrops = 
    selectedProvince === 'sindh' ? sindhCrops :
    selectedProvince === 'punjab' ? punjabCrops :
    selectedProvince === 'kpk' ? kpkCrops :
    balochistanCrops;
  const visibleCrops = selectedCrop === 'all' ? availableCrops : availableCrops.filter((crop) => crop === selectedCrop);

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-5xl space-y-5">
      <header className="rounded-2xl bg-gradient-to-br from-farm-700 via-farm-800 to-emerald-950 px-5 py-6 text-white shadow-lg sm:px-8">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-white/15 p-3"><MapPinned size={26} /></div>
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">{t('map.title')}</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-farm-100 sm:text-base">{t('map.description')}</p>
          </div>
        </div>
      </header>

      <section aria-labelledby="crop-filter-title" className="rounded-2xl border border-farm-100 bg-white p-4 shadow-sm sm:p-5">
        <h2 id="crop-filter-title" className="mb-3 text-base font-bold text-gray-900">{t('map.cropFilter')}</h2>
        <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label={t('map.cropFilter')}>
          {crops.map((crop) => (
            <button key={crop.id} type="button" onClick={() => setSelectedCrop(crop.id)} aria-pressed={selectedCrop === crop.id} className={`flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-farm-500 ${selectedCrop === crop.id ? 'border-farm-700 bg-farm-700 text-white' : 'border-gray-200 bg-white text-gray-700 hover:border-farm-300 hover:bg-farm-50'}`}>
              <span aria-hidden="true">{crop.icon}</span>{t(`map.crops.${crop.id}`)}
            </button>
          ))}
        </div>
      </section>

      <section aria-labelledby="map-heading" className="overflow-hidden rounded-2xl border border-emerald-100 bg-[#eaf6ed] shadow-sm">
        <div className="flex items-center justify-between px-4 pt-4 sm:px-6">
          <div><h2 id="map-heading" className="text-lg font-bold text-gray-900">{t('map.mapHeading')}</h2><p className="text-sm text-gray-600">{t('map.tapProvince')}</p></div>
          <Wheat className="text-farm-700" aria-hidden="true" />
        </div>
        <div className="relative mx-auto mt-2 h-[330px] max-w-[540px]" role="group" aria-label={t('map.mapHeading')}>
          <div className="absolute left-[28%] top-[4%] h-[93%] w-[55%] rotate-[12deg] rounded-[48%_45%_52%_43%] border-2 border-dashed border-emerald-200 bg-white/45" aria-hidden="true" />
          {provinces.map((province) => (
            <button key={province.id} type="button" onClick={() => setSelectedProvince(province.id)} aria-pressed={selectedProvince === province.id} aria-label={t(`map.provinces.${province.id}`)} className={`absolute ${province.className} z-10 flex items-center justify-center rounded-[42%_58%_46%_54%] border-2 p-2 text-center text-xs font-bold leading-4 shadow-sm transition duration-200 focus:outline-none focus:ring-4 focus:ring-farm-300 sm:text-sm ${selectedProvince === province.id ? 'scale-[1.04] border-farm-800 bg-farm-600 text-white shadow-lg' : province.id === 'sindh' ? 'border-farm-500 bg-farm-100 text-farm-900 hover:bg-farm-200' : 'border-emerald-300 bg-white text-emerald-900 hover:bg-emerald-50'}`}>
              <span>{t(`map.provinces.${province.id}`)}</span>
            </button>
          ))}
          <span className="absolute bottom-3 left-4 rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-gray-600">{t('map.country')}</span>
        </div>
      </section>

      <motion.section key={`${selectedProvince}-${selectedCrop}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} aria-live="polite" className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-4">
          <div><p className="text-sm font-semibold text-farm-700">{t('map.yourRegion')}</p><h2 className="mt-1 text-2xl font-bold text-gray-900">{t(`map.provinces.${selected.id}`)}</h2></div>
          <span className="rounded-full bg-farm-50 px-3 py-1 text-xs font-bold text-farm-800">{t('map.selected')}</span>
        </div>
        <h3 className="mt-5 text-lg font-bold text-gray-900">{t('map.cropsHere')}</h3>
        {visibleCrops.length > 0 ? <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">{visibleCrops.map((crop) => <div key={crop} className="flex min-h-14 items-center gap-3 rounded-xl bg-farm-50 px-4 text-base font-semibold text-farm-900"><span aria-hidden="true">{crops.find((item) => item.id === crop)?.icon}</span>{t(`map.crops.${crop}`)}</div>)}</div> : <p className="mt-3 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">{t('map.empty')}</p>}
        <div className="mt-5 grid gap-3 border-t border-gray-100 pt-4 text-sm text-gray-700 sm:grid-cols-2">
          <p className="flex gap-2"><Info size={18} className="mt-0.5 shrink-0 text-farm-700" /><span><strong>{t('map.sourceLabel')}:</strong> {availableCrops.length ? t('map.source') : t('map.sourceUnavailable')}</span></p>
          <p className="flex gap-2"><CalendarDays size={18} className="mt-0.5 shrink-0 text-farm-700" /><span><strong>{t('map.dataLabel')}:</strong> {availableCrops.length ? '2024–25' : t('map.notAvailable')}</span></p>
        </div>
        {availableCrops.length > 0 && <a href="https://mnfsr.gov.pk/" target="_blank" rel="noreferrer" className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-lg border border-farm-300 px-4 text-sm font-bold text-farm-800 transition hover:bg-farm-50 focus:outline-none focus:ring-2 focus:ring-farm-500"><ExternalLink size={17} />{t('map.viewSource')}</a>}
      </motion.section>

      <p className="rounded-xl bg-gray-100 p-4 text-sm leading-6 text-gray-700">{t('map.disclaimer')}</p>
    </motion.div>
  );
}