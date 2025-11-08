import './css/styles.css';
import Accordion from 'accordion-js';
import { initFaqAccordion } from './js/faq.js';
window.Accordion = Accordion;

// ініціалізація
document.addEventListener('DOMContentLoaded', () => {
  initFaqAccordion(); // це фунція з FAQ
});
