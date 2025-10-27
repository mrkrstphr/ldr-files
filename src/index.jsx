import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import './index.css';
import { Home } from './pages/Home';
import { Model } from './pages/Model';
import { Seasonal } from './pages/Seasonal';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router basename="/ldr-files">
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="model/:modelSlug" element={<Model />} />
          <Route path="seasonal/:season" element={<Seasonal />} />
        </Route>
      </Routes>
    </Router>
  </StrictMode>,
);

if (import.meta.env.PROD) {
  const script = document.createElement('script');
  script.src = '//gc.zgo.at/count.js';
  script.async = true;
  script.setAttribute(
    'data-goatcounter',
    'https://mrkrstphr.goatcounter.com/count',
  );
  document.head.appendChild(script);
}
