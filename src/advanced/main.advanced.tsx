import { createRoot } from 'react-dom/client';
import { App } from './components/App';

/**
 * React 애플리케이션 진입점
 */
function main() {
  const rootElement = document.getElementById('root');

  if (!rootElement) {
    throw new Error('Root element not found');
  }

  const root = createRoot(rootElement);
  root.render(<App />);
}

// DOM이 로드되면 애플리케이션 시작
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}

export default main;
