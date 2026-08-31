import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import DiseaseDetection from './pages/DiseaseDetection';
import MandiPrices from './pages/MandiPrices';
import WeedManagement from './pages/WeedManagement';
import AiAssistant from './pages/AiAssistant';
import About from './pages/About';
import AgricultureMap from './pages/AgricultureMap';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/disease" element={<DiseaseDetection />} />
        <Route path="/mandi-prices" element={<MandiPrices />} />
        <Route path="/weeds" element={<WeedManagement />} />
        <Route path="/assistant" element={<AiAssistant />} />
        <Route path="/map" element={<AgricultureMap />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Layout>
  );
}

export default App;
