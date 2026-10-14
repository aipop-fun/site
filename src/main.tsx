import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { variant } from '../site.config';
import App from './App';
import './styles/fonts.css';
import './styles/tokens.css';
import './styles/base.css';

document.documentElement.dataset.variant = variant.id;
document.documentElement.lang = 'en';

const container = document.getElementById('root');
if (!container) throw new Error('#root is missing from index.html');

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
