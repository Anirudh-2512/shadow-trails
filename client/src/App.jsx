import { Routes, Route, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Landing from './pages/Landing.jsx';
import Auth from './pages/Auth.jsx';
import MapPage from './pages/MapPage.jsx';
import WebGlLostNotice from './components/ui/WebGlLostNotice.jsx';

export default function App() {
  const location = useLocation();
  return (
    <>
      <WebGlLostNotice />
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, scale: 1.14, filter: 'blur(14px)' }}
        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        className="min-h-screen"
      >
        <Routes location={location}>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/map" element={<MapPage />} />
        </Routes>
      </motion.div>
    </>
  );
}
