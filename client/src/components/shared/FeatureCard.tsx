import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  path: string;
  index?: number;
}

export default function FeatureCard({
  icon,
  title,
  description,
  path,
  index = 0,
}: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Link
        to={path}
        className="group flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-farm-300"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-farm-50 text-farm-600 transition-colors group-hover:bg-farm-100">
          {icon}
        </div>
        <h3 className="mt-4 text-lg font-semibold text-gray-900">{title}</h3>
        <p className="mt-2 text-sm text-gray-500 flex-1">{description}</p>
        <div className="mt-4 flex items-center gap-1 text-sm font-medium text-farm-600 opacity-0 transition-opacity group-hover:opacity-100">
          <span>Open</span>
          <ArrowRight size={14} />
        </div>
      </Link>
    </motion.div>
  );
}
