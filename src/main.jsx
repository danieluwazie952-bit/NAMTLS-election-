import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import { HashRouter } from 'react-router-dom';
import App from './App';
import './index.css';

window.addEventListener('error', function(e) {
  try {
    var msg = e.message || 'Unknown error';
    var source = e.filename || '';
    var line = e.lineno || '';
    var root = document.getElementById('root');
    if (!root) return;
    root.innerHTML = '<div style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#003366;color:white;font-family:Arial,sans-serif;padding:32px;text-align:center;">' +
      '<h1 style="color:#ffd700">NAMATL STUDENT E-VOTING</h1>' +
      '<div style="background:#dc2626;color:white;padding:20px;border-radius:8px;max-width:500px;">' +
      '<h2>⚠️ RUNTIME ERROR</h2>' +
      '<p style="font-size:14px">' + msg + '</p>' +
      '<p style="font-size:12px;opacity:0.8;margin-top:8px">' + source + ':' + line + '</p>' +
      '<button onclick="location.reload()" style="padding:10px 24px;background:white;color:#dc2626;border:none;border-radius:4px;cursor:pointer;font-weight:bold;margin-top:12px">Refresh Page</button>' +
      '</div>' +
      '<p style="font-size:12px;margin-top:12px;opacity:0.7">Check console (F12) for full details</p>' +
      '</div>';
  } catch (_) {}
  e.preventDefault();
});

try {
  var rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error('#root element not found in DOM');
    document.body.innerHTML = '<div style="background:#dc2626;color:white;padding:40px;text-align:center;font-family:Arial,sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;"><div><h1>FATAL ERROR</h1><p>#root element missing from index.html</p></div></div>';
  } else {
    var root = createRoot(rootElement);
    root.render(
      <StrictMode>
        <HashRouter>
          <App />
        </HashRouter>
      </StrictMode>
    );
    console.log('NAMTLS E-Voting System mounted successfully');
  }
} catch (err) {
  console.error('Mount failed:', err);
  try {
    var rootEl = document.getElementById('root');
    if (rootEl) {
      rootEl.innerHTML = '<div style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#003366;color:white;font-family:Arial,sans-serif;padding:32px;text-align:center;">' +
        '<h1 style="color:#ffd700">NAMATL STUDENT E-VOTING</h1>' +
        '<div style="background:#dc2626;color:white;padding:24px;border-radius:8px;max-width:500px;">' +
        '<h2>⚠️ CRITICAL MOUNT ERROR</h2>' +
        '<p style="font-size:14px">' + (err.message || 'Unknown error during initialization') + '</p>' +
        '<button onclick="location.reload()" style="padding:10px 24px;background:white;color:#dc2626;border:none;border-radius:4px;cursor:pointer;font-weight:bold;margin-top:12px">Refresh Page</button>' +
        '</div>' +
        '<p style="font-size:12px;margin-top:12px;opacity:0.7">Check console (F12) for full stack trace</p>' +
        '</div>';
    }
  } catch (_) {
    document.body.innerHTML = '<div style="background:#dc2626;color:white;padding:40px;text-align:center;font-family:Arial,sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;"><h1>CRITICAL ERROR</h1><p>' + err.message + '</p></div>';
  }
}
