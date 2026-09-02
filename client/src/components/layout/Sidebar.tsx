import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useApp } from '../../context/AppContext';
import LanguageSwitcher from '../shared/LanguageSwitcher';
import { NAV_ITEMS } from '../../utils/constants';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Microscope,
  Sprout,
  BadgeIndianRupee,
  Leaf,
  MessageCircle,
  Map,
  Newspaper,
  Info,
} from 'lucide-react';
import type { ReactNode } from 'react';

const iconMap: Record<string, ReactNode> = {
  LayoutDashboard: <LayoutDashboard size={20} />,
  Microscope: <Microscope size={20} />,
  Sprout: <Sprout size={20} />,
  BadgeIndianRupee: <BadgeIndianRupee size={20} />,
  Leaf: <Leaf size={20} />,
  MessageCircle: <MessageCircle size={20} />,
  Map: <Map size={20} />,
  Newspaper: <Newspaper size={20} />,
  Info: <Info size={20} />,
};

export default function Sidebar() {
  const { t } = useLanguage();
  const { sidebarOpen, setSidebarOpen } = useApp();
  const location = useLocation();

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden rounded-lg bg-white p-2 shadow-md border border-gray-200"
        aria-label="Toggle menu"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-64 bg-white border-r border-gray-200 shadow-sm transform transition-transform duration-300 lg:translate-x-0 flex flex-col overflow-y-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-farm-600 text-white">
            <Sprout size={20} />
          </div>
          <div>
            <h1 className="text-sm font-bold text-farm-800 leading-tight">
              Smart Farming
            </h1>
            <p className="text-xs text-gray-500">AI Pakistan</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-farm-50 text-farm-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className={isActive ? 'text-farm-600' : 'text-gray-400'}>
                  {iconMap[item.icon]}
                </span>
                {t(item.label)}
              </Link>
            );
          })}
        </nav>

        {/* Language switcher in sidebar */}
        <div className="mt-auto px-4 py-4 border-t border-gray-100">
          <LanguageSwitcher />
        </div>
      </aside>
    </>
  );
}
