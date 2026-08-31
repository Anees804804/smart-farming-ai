import type { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import { AppProvider } from '../../context/AppContext';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <AppProvider>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col lg:ml-64">
          <Header />
          <main className="flex-1 p-4 lg:p-8">{children}</main>
          <Footer />
        </div>
      </div>
    </AppProvider>
  );
}
