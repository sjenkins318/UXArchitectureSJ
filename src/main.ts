import '@addepar/design-tokens/build/tokens.custom-properties.css';
import './style.css';

for (const toggle of document.querySelectorAll<HTMLButtonElement>('.left-nav__section-toggle')) {
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
  });
}
