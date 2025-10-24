import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import './index.css';
import { Home } from './pages/Home';
import { Model } from './pages/Model';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router basename="/ldr-files">
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="model/:modelSlug" element={<Model />} />
        </Route>
      </Routes>
    </Router>
  </StrictMode>,
);

if (import.meta.env.PROD) {
  const script = document.createElement('script');
  script.src = 'https://mrkrstphr.goatcounter.com/count';
  script.async = true;
  document.head.appendChild(script);
}
