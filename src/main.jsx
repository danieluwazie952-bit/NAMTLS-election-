import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
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
    root.innerHTML =
      '<div style="min-height:100vh;background:#003366;display:flex;flex-direction:column;align-items:center;justify-content:center;color:white;font-family:Arial,sans-serif;padding:32px;text-align:center;">' +
      '<h1 style="font-size:28px;margin-bottom:16px;">NAMATL STUDENT E-VOTING</h1>' +
      '<hr style="width:80px;border:2px solid #FFD700;margin-bottom:24px;">' +
      '<h2 style="color:#ef4444;">RUNTIME ERROR</h2>' +
      '<p style="margin:16px 0;color:#ccc;">' + msg + '</p>' +
      '<p style="color:#999;font-size:12px;">' + source + ':' + line + '</p>' +
      '<button onclick="window.location.reload()" style="padding:10px 24px;background:white;color:#dc2626;border:none;border-radius:4px;cursor:pointer;font-weight:bold;margin-top:12px;">Refresh Page</button>' +
      '<p style="margin-top:16px;font-size:11px;color:#666;">Check console (F12) for full details</p>' +
      '</div>';
  } catch (_) {}
  e.preventDefault();
});

try {
  var rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error('#root element not found in DOM');
    document.body.innerHTML =
      '<div style="min-height:100vh;background:#003366;display:flex;align-items:center;justify-content:center;color:white;font-family:Arial,sans-serif;padding:32px;text-align:center;">' +
      '<h1>FATAL ERROR: #root element missing</h1></div>';
  } else {
    var root = createRoot(rootElement);
    root.render(
      <StrictMode>
        <HashRouter>
          <App />
        </HashRouter>
      </StrictMode>
    );
  }
} catch (err) {
  console.error('Mount failed:', err);
  try {
    var rootEl = document.getElementById('root');
    if (rootEl) {
      rootEl.innerHTML =
        '<div style="min-height:100vh;background:#003366;display:flex;flex-direction:column;align-items:center;justify-content:center;color:white;font-family:Arial,sans-serif;padding:32px;text-align:center;">' +
        '<h1 style="font-size:28px;margin-bottom:16px;">NAMATL STUDENT E-VOTING</h1>' +
        '<hr style="width:80px;border:2px solid #FFD700;margin-bottom:24px;">' +
        '<h2 style="color:#ef4444;">CRITICAL MOUNT ERROR</h2>' +
        '<p style="margin:16px 0;color:#ccc;">' + (err.message || 'Unknown error during initialization') + '</p>' +
        '<button onclick="window.location.reload()" style="padding:10px 24px;background:white;color:#dc2626;border:none;border-radius:4px;cursor:pointer;font-weight:bold;margin-top:12px;">Refresh Page</button>' +
        '<p style="margin-top:16px;font-size:11px;color:#666;">Check console (F12) for full stack trace</p>' +
        '</div>';
    }
  } catch (_) {
    document.body.innerHTML = '<div style="min-height:100vh;background:#003366;display:flex;align-items:center;justify-content:center;color:white;font-family:Arial,sans-serif;"><h1>CRITICAL ERROR: ' + err.message + '</h1></div>';
  }
}
