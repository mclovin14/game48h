import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles.css';

// erro que trava o jogo aparece na tela: no celular não há console para ler
function showError(msg: string): void {
  let el = document.getElementById('fatal');
  if (!el) {
    el = document.createElement('pre');
    el.id = 'fatal';
    el.style.cssText =
      'position:fixed;left:0;right:0;bottom:0;z-index:999;margin:0;padding:8px;max-height:40%;overflow:auto;font:12px monospace;color:#fff;background:rgba(120,0,0,.9);white-space:pre-wrap';
    document.body.appendChild(el);
  }
  el.textContent += msg + '\n';
}
window.addEventListener('error', (e) => showError(`${e.message} @ ${e.filename?.split('/').pop()}:${e.lineno}`));
window.addEventListener('unhandledrejection', (e) => showError(`promise: ${String(e.reason)}`));

createRoot(document.getElementById('root')!).render(<App />);
