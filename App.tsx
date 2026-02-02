import React from 'react';
import { AutoPrimeProvider, useAutoPrime } from './context/AutoPrimeContext';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Clients } from './components/Clients';
import { Vehicles } from './components/Vehicles';
import { Inventory } from './components/Inventory';
import { ServiceOrders } from './components/ServiceOrders';
import { Settings } from './components/Settings';

const ViewManager: React.FC = () => {
  const { currentView } = useAutoPrime();

  switch (currentView) {
    case 'dashboard': return <Dashboard />;
    case 'clients': return <Clients />;
    case 'vehicles': return <Vehicles />;
    case 'inventory': return <Inventory />;
    case 'os': return <ServiceOrders />;
    case 'settings': return <Settings />;
    default: return <Dashboard />;
  }
};

const App: React.FC = () => {
  return (
    <AutoPrimeProvider>
      <Layout>
        <ViewManager />
      </Layout>
    </AutoPrimeProvider>
  );
};

export default App;