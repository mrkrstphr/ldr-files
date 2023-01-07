import { HashRouter, Link, Outlet, Route, Routes } from 'react-router-dom';
import IndexPage from './IndexPage';
import SetPage from './SetPage';

const Layout = () => (
  <div className="p-8 h-screen flex flex-col">
    <h1 className="text-4xl mb-4">
      <Link to="/">LDR Files</Link>
    </h1>
    <Outlet />
  </div>
);

function App() {
  return (
    <HashRouter basename="/">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="set/:theme/:slug" element={<SetPage />} />
          <Route index element={<IndexPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
