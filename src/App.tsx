import { useState, useEffect } from 'react';
import TradingDashboard from './components/TradingDashboard';
import InsightsPage from './components/InsightsPage';
import './index.css';

type Page = 'dashboard' | 'insights';

function App() {
  const [page, setPage] = useState<Page>(() => {
    const hash = window.location.hash.slice(1);
    return hash === 'insights' ? 'insights' : 'dashboard';
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      setPage(hash === 'insights' ? 'insights' : 'dashboard');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (newPage: Page) => {
    window.location.hash = newPage === 'dashboard' ? '' : newPage;
    setPage(newPage);
  };

  if (page === 'insights') {
    return <InsightsPage onBack={() => navigate('dashboard')} />;
  }

  return <TradingDashboard onNavigateToInsights={() => navigate('insights')} />;
}

export default App;
