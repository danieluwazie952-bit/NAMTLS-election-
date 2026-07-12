import { createRoot } from 'react-dom/client'
import { createElement, Component, StrictMode } from 'react'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

console.log('APP_START: NAMTLS Election initializing...');

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('RENDER_ERROR:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return createElement('div', {
        style: {
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1e3a5f',
          color: 'white',
          fontFamily: 'Arial, sans-serif',
          padding: '20px',
          textAlign: 'center'
        }
      },
        createElement('h1', { style: { fontSize: '28px', marginBottom: '16px' } }, 'NAMTLS Election'),
        createElement('p', { style: { fontSize: '18px', marginBottom: '8px' } }, 'App loaded but an error occurred'),
        createElement('p', { style: { color: '#fbbf24', fontSize: '14px', maxWidth: '500px' } },
          this.state.error?.message || 'Unknown error'
        ),
        createElement('p', { style: { marginTop: '20px', fontSize: '12px', color: '#94a3b8' } },
          'Please check the browser console (F12) for details'
        )
      );
    }
    return this.props.children;
  }
}

const root = createRoot(document.getElementById('root'));
root.render(
  createElement(StrictMode, null,
    createElement(ErrorBoundary, null,
      createElement(HashRouter, null,
        createElement(App, null)
      )
    )
  )
);

console.log('RENDER_OK: App mounted successfully');
