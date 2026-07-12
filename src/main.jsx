import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

console.log('APP_START: NAMTLS Election initializing...');

class ErrorBoundary extends React.Component {
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
      return (
        <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'#1e3a5f',color:'white',fontFamily:'Arial,sans-serif',padding:'20px',textAlign:'center'}}>
          <h1 style={{fontSize:'28px',marginBottom:'16px'}}>NAMTLS Election</h1>
          <p style={{fontSize:'18px',marginBottom:'8px'}}>App loaded but an error occurred</p>
          <p style={{color:'#fbbf24',fontSize:'14px',maxWidth:'500px'}}>{this.state.error?.message || 'Unknown error'}</p>
          <p style={{marginTop:'20px',fontSize:'12px',color:'#94a3b8'}}>Please check the browser console (F12) for details</p>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <HashRouter>
        <App />
      </HashRouter>
    </ErrorBoundary>
  </React.StrictMode>
);

console.log('RENDER_OK: App mounted successfully');
