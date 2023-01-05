import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom';
import IndexPage from './IndexPage';
import SetPage from './SetPage';

const Layout = () => (
  <div className="p-8 h-screen">
    <Outlet />
  </div>
);

function App() {
  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="set/:theme/:slug" element={<SetPage />} />
          <Route index element={<IndexPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
