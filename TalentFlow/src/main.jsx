import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'


async function enableMocking() {
  console.log('🚀 Starting MSW...');
  
  try {
    const { worker } = await import('./services/browser');
    
    await worker.start({
      onUnhandledRequest: 'bypass'
    });
    
    console.log('✅ MSW started successfully');
  } catch (error) {
    console.error('❌ MSW failed to start:', error);
  }
}

enableMocking()
  .then(() => {
    ReactDOM.createRoot(document.getElementById('root')).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    );
  });
