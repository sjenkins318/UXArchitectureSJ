import '@addepar/design-tokens/build/tokens.custom-properties.css';
import './style.css';

for (const toggle of document.querySelectorAll<HTMLButtonElement>('.left-nav__section-toggle')) {
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
  });
}

for (const item of document.querySelectorAll<HTMLAnchorElement>('.left-nav__item')) {
  item.addEventListener('click', (event) => {
    event.preventDefault();
    const panel = item.closest<HTMLElement>('.left-nav__panel') ?? document;
    for (const sibling of panel.querySelectorAll<HTMLAnchorElement>('.left-nav__item')) {
      sibling.classList.toggle('left-nav__item--active', sibling === item);
    }
    const label = item.querySelector('span')?.textContent?.trim();
    if (label) {
      currentLeftNavItemLabel = label;
      if (canvasTitlePage) {
        canvasTitlePage.textContent = label;
      }
    }
  });
}

const iconRail = document.querySelector<HTMLElement>('.icon-rail');
const iconRailToggle = document.querySelector<HTMLButtonElement>('.icon-rail__toggle');

iconRailToggle?.addEventListener('click', () => {
  const expanded = iconRail?.classList.toggle('icon-rail--expanded') ?? false;
  iconRailToggle.setAttribute('aria-expanded', String(expanded));
  iconRailToggle.setAttribute('aria-label', expanded ? 'Collapse navigation' : 'Expand navigation');
  appRoot?.classList.toggle('rail-expanded', expanded);
  updateRailPointer();
});

const portfolioSelector = document.querySelector<HTMLElement>('[data-portfolio-selector]');
const portfolioSelectorLabel = document.querySelector<HTMLElement>('[data-portfolio-selector-label]');
const globalNav = document.querySelector<HTMLElement>('.global-nav');
const PORTFOLIO_SELECTOR_TRIGGER_SELECTOR =
  '.filter-chip__chevron, .top-rail__tab-chevron, [data-portfolio-selector-trigger]';

let activePortfolioSelectorTrigger: HTMLElement | null = null;

function closePortfolioSelector() {
  if (!portfolioSelector) {
    return;
  }
  portfolioSelector.hidden = true;
  activePortfolioSelectorTrigger?.classList.remove('is-menu-open');
  activePortfolioSelectorTrigger = null;
}

function togglePortfolioSelector(anchorEl: HTMLElement, anchorKey: string, label: string) {
  if (!portfolioSelector || !globalNav) {
    return;
  }

  const isOpenForThisAnchor = !portfolioSelector.hidden && portfolioSelector.dataset.anchor === anchorKey;
  if (isOpenForThisAnchor) {
    closePortfolioSelector();
    return;
  }

  const anchorRect = anchorEl.getBoundingClientRect();
  const navRect = globalNav.getBoundingClientRect();
  portfolioSelector.style.left = `${anchorRect.left - navRect.left}px`;
  portfolioSelector.style.top = `${anchorRect.bottom - navRect.top + 8}px`;
  portfolioSelector.dataset.anchor = anchorKey;
  if (portfolioSelectorLabel) {
    portfolioSelectorLabel.textContent = label;
  }
  refreshPortfolioSelectorChecks();
  portfolioSelector.hidden = false;

  activePortfolioSelectorTrigger?.classList.remove('is-menu-open');
  activePortfolioSelectorTrigger = anchorEl;
  anchorEl.classList.add('is-menu-open');
}

function attachChevronBehavior(chevron: SVGElement) {
  chevron.addEventListener('click', (event) => {
    event.stopPropagation();
    const chip = chevron.closest<HTMLElement>('.filter-chip, .top-rail__tab');
    if (chip) {
      togglePortfolioSelector(chip, chip.dataset.view ?? '', 'Switch portfolio');
    }
  });
}

for (const chevron of document.querySelectorAll<SVGElement>('.filter-chip__chevron, .top-rail__tab-chevron')) {
  attachChevronBehavior(chevron);
}

function animateChipRemoval(el: HTMLElement | null) {
  if (!el) {
    return;
  }
  const width = el.getBoundingClientRect().width;
  el.style.width = `${width}px`;
  el.style.flexShrink = '0';
  el.classList.add('chip-removing');

  const finish = () => {
    el.remove();
    updateAddSlotVisibility();
  };
  el.addEventListener('transitionend', finish, { once: true });
  setTimeout(finish, 350);

  requestAnimationFrame(() => {
    el.style.width = '0px';
    el.style.opacity = '0';
    el.style.marginLeft = '0px';
    el.style.marginRight = '0px';
    el.style.paddingLeft = '0px';
    el.style.paddingRight = '0px';
    el.style.borderWidth = '0px';
  });
}

function animateChipInsertion(el: HTMLElement | null) {
  if (!el) {
    return;
  }
  const targetWidth = el.getBoundingClientRect().width;
  el.style.width = '0px';
  el.style.flexShrink = '0';
  el.style.opacity = '0';
  el.style.marginLeft = '0px';
  el.style.marginRight = '0px';
  el.style.paddingLeft = '0px';
  el.style.paddingRight = '0px';
  el.style.borderWidth = '0px';
  el.classList.add('chip-entering');

  const finish = () => {
    el.style.width = '';
    el.style.flexShrink = '';
    el.style.opacity = '';
    el.classList.remove('chip-entering');
  };
  el.addEventListener('transitionend', finish, { once: true });
  setTimeout(finish, 350);

  requestAnimationFrame(() => {
    el.style.width = `${targetWidth}px`;
    el.style.opacity = '1';
    el.style.marginLeft = '';
    el.style.marginRight = '';
    el.style.paddingLeft = '';
    el.style.paddingRight = '';
    el.style.borderWidth = '';
  });
}

function updateAddSlotVisibility() {
  const hasPortfolios =
    document.querySelectorAll('.filter-chip[data-view]:not([data-view="book-of-business"])').length > 0;
  for (const ghost of document.querySelectorAll<HTMLElement>('[data-add-ghost]')) {
    ghost.hidden = hasPortfolios;
  }
  for (const iconBtn of document.querySelectorAll<HTMLElement>('[data-add-icon]')) {
    iconBtn.hidden = !hasPortfolios;
  }
}

function removePortfolioChip(view: string) {
  animateChipRemoval(document.querySelector<HTMLElement>(`.filter-chip[data-view="${view}"]`));
  animateChipRemoval(document.querySelector<HTMLElement>(`.top-rail__tab[data-view="${view}"]`));

  if (currentChipView === view) {
    currentChipView = 'book-of-business';
    render(true);
    syncMessagesPanelToChipView();
  }
}

function attachCloseBehavior(closeIcon: SVGElement) {
  closeIcon.addEventListener('click', (event) => {
    event.stopPropagation();
    const chip = closeIcon.closest<HTMLElement>('.filter-chip');
    const view = chip?.dataset.view;
    if (view) {
      removePortfolioChip(view);
    }
  });
}

for (const closeIcon of document.querySelectorAll<SVGElement>('.filter-chip__close')) {
  attachCloseBehavior(closeIcon);
}

for (const addTrigger of document.querySelectorAll<HTMLButtonElement>('[data-portfolio-selector-trigger="add"]')) {
  addTrigger.addEventListener('click', (event) => {
    event.stopPropagation();
    togglePortfolioSelector(addTrigger, 'add-portfolio', 'Add portfolio');
  });
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

type PortfolioType = 'household' | 'client' | 'prospect' | 'managed-fund' | 'legal-entity' | 'account' | 'investment';

const portfolioTypeLabels: Record<PortfolioType, string> = {
  household: 'Household',
  client: 'Client',
  prospect: 'Prospect',
  'managed-fund': 'Managed fund',
  'legal-entity': 'Legal entity',
  account: 'Account',
  investment: 'Investment',
};

const portfolioTypeIcons: Record<PortfolioType, string> = {
  household: 'house',
  client: 'user',
  prospect: 'user-plus',
  'managed-fund': 'database',
  'legal-entity': 'building-columns',
  account: 'wallet',
  investment: 'coins',
};

const portfolioTypesBySlug: Record<string, PortfolioType> = {
  'smith-family': 'household',
  'davis-family': 'household',
  'adam-smith': 'client',
  'adam-smith-ira-account': 'account',
  'adam-smith-401k-ira': 'account',
  'adam-smith-revocable-trust': 'legal-entity',
  'adam-smith-trust-2': 'legal-entity',
  'ami-smith-ira': 'investment',
  'smith-family-household': 'household',
  'diane-davis': 'client',
  'davis-family-trust': 'legal-entity',
  'greenfield-partners': 'managed-fund',
  'northgate-capital': 'managed-fund',
  'westside-endowment': 'legal-entity',
  'harrington-trust': 'legal-entity',
  'oakwood-family-office': 'prospect',
};

function getPortfolioIconName(view: string): string {
  const type = portfolioTypesBySlug[view];
  return type ? portfolioTypeIcons[type] : 'coins';
}

function decoratePortfolioSelectorItem(item: HTMLButtonElement) {
  if (item.dataset.decorated === 'true') {
    return;
  }
  const label = item.textContent?.trim() ?? '';
  const view = slugify(label);
  const type = portfolioTypesBySlug[view];
  const iconName = type ? portfolioTypeIcons[type] : 'circle';
  const typeLabel = type ? portfolioTypeLabels[type] : '';
  item.dataset.decorated = 'true';
  item.dataset.portfolioType = type ?? '';
  item.innerHTML = `<svg class="portfolio-selector__item-icon" aria-hidden="true"><use href="${import.meta.env.BASE_URL}assets/apl/icons.svg#${iconName}"></use></svg><span class="portfolio-selector__item-label">${label}</span><span class="portfolio-selector__item-type">${typeLabel}</span><svg class="portfolio-selector__item-check" aria-hidden="true"><use href="${import.meta.env.BASE_URL}assets/apl/icons.svg#check"></use></svg>`;
}

function getPortfolioSelectorItemLabel(item: HTMLButtonElement): string {
  return item.querySelector('.portfolio-selector__item-label')?.textContent?.trim() ?? '';
}

for (const item of document.querySelectorAll<HTMLButtonElement>('.portfolio-selector__item')) {
  decoratePortfolioSelectorItem(item);
}

function refreshPortfolioSelectorChecks() {
  for (const item of document.querySelectorAll<HTMLButtonElement>('.portfolio-selector__item')) {
    const view = slugify(getPortfolioSelectorItemLabel(item));
    const exists = !!document.querySelector(`.filter-chip[data-view="${view}"]`);
    item.classList.toggle('portfolio-selector__item--added', exists);
  }
}

const filterToggle = document.querySelector<HTMLButtonElement>('[data-filter-toggle]');
const filterMenu = document.querySelector<HTMLElement>('[data-filter-menu]');

filterToggle?.addEventListener('click', (event) => {
  event.stopPropagation();
  if (!filterMenu) {
    return;
  }
  const isOpen = !filterMenu.hidden;
  filterMenu.hidden = isOpen;
  filterToggle.setAttribute('aria-expanded', String(!isOpen));
});

function applyPortfolioTypeFilter() {
  const checked = Array.from(
    document.querySelectorAll<HTMLInputElement>('.portfolio-selector__filter-option input:checked'),
  ).map((input) => input.value);

  for (const item of document.querySelectorAll<HTMLButtonElement>('.portfolio-selector__item')) {
    const matches = checked.length === 0 || checked.includes(item.dataset.portfolioType ?? '');
    item.hidden = !matches;
  }
}

for (const filterInput of document.querySelectorAll<HTMLInputElement>('.portfolio-selector__filter-option input')) {
  filterInput.addEventListener('change', applyPortfolioTypeFilter);
}

document.addEventListener('click', (event) => {
  if (!filterMenu || filterMenu.hidden) {
    return;
  }
  const target = event.target as Element;
  if (!filterMenu.contains(target) && target !== filterToggle && !filterToggle?.contains(target)) {
    filterMenu.hidden = true;
    filterToggle?.setAttribute('aria-expanded', 'false');
  }
});

function switchPortfolioChip(oldView: string, newView: string, newLabel: string) {
  if (document.querySelector(`.filter-chip[data-view="${newView}"]`)) {
    removePortfolioChip(oldView);
    currentChipView = newView;
    render(true);
    syncMessagesPanelToChipView();
    return;
  }

  chipLabels[newView] = newLabel;
  const iconHref = `${import.meta.env.BASE_URL}assets/apl/icons.svg#${getPortfolioIconName(newView)}`;

  const pill = document.querySelector<HTMLElement>(`.filter-chip[data-view="${oldView}"]`);
  const tab = document.querySelector<HTMLElement>(`.top-rail__tab[data-view="${oldView}"]`);

  if (pill) {
    pill.dataset.view = newView;
    pill.querySelector('.filter-chip__icon use')?.setAttribute('href', iconHref);
    const labelEl = pill.querySelector('.filter-chip__label');
    if (labelEl) {
      labelEl.textContent = newLabel;
    }
  }
  if (tab) {
    tab.dataset.view = newView;
    tab.querySelector('.icon use')?.setAttribute('href', iconHref);
    const labelEl = tab.querySelector('.top-rail__tab-label');
    if (labelEl) {
      labelEl.textContent = newLabel;
    }
  }

  currentChipView = newView;
  render(true);
  syncMessagesPanelToChipView();
}

for (const item of document.querySelectorAll<HTMLButtonElement>('.portfolio-selector__item')) {
  item.addEventListener('click', () => {
    if (!portfolioSelector) {
      return;
    }
    const anchor = portfolioSelector.dataset.anchor;
    const label = getPortfolioSelectorItemLabel(item);
    if (!label) {
      return;
    }
    const view = slugify(label);

    if (anchor === 'add-portfolio') {
      addPortfolioChip(view, label);
      const selector =
        appRoot?.dataset.layout === 'tabs-top-rail'
          ? `.top-rail__tab[data-view="${view}"]`
          : `.filter-chip[data-view="${view}"]`;
      document.querySelector<HTMLButtonElement>(selector)?.click();
      closePortfolioSelector();
      return;
    }

    if (anchor && anchor !== view) {
      switchPortfolioChip(anchor, view, label);
    }
    closePortfolioSelector();
  });
}

document.addEventListener('click', (event) => {
  if (!portfolioSelector || portfolioSelector.hidden) {
    return;
  }
  const target = event.target as Element;
  if (!portfolioSelector.contains(target) && !target.closest(PORTFOLIO_SELECTOR_TRIGGER_SELECTOR)) {
    closePortfolioSelector();
  }
});

const leftNavCollapseButton = document.querySelector<HTMLButtonElement>('.left-nav__collapse');

leftNavCollapseButton?.addEventListener('click', () => {
  const collapsed = leftNavCollapseButton.closest('.left-nav')?.classList.toggle('left-nav--collapsed') ?? false;
  leftNavCollapseButton.setAttribute('aria-expanded', String(!collapsed));
  leftNavCollapseButton.setAttribute('aria-label', collapsed ? 'Expand navigation' : 'Collapse navigation');
});

const playgroundDrawer = document.querySelector<HTMLElement>('[data-playground-drawer]');
const playgroundToggle = document.querySelector<HTMLButtonElement>('[data-playground-toggle]');

playgroundToggle?.addEventListener('click', (event) => {
  event.stopPropagation();
  const isOpen = playgroundDrawer?.classList.toggle('playground-drawer--open') ?? false;
  playgroundToggle.setAttribute('aria-expanded', String(isOpen));
});

document.addEventListener('click', (event) => {
  if (!playgroundDrawer?.classList.contains('playground-drawer--open')) {
    return;
  }
  const target = event.target as Element;
  if (!playgroundDrawer.contains(target)) {
    playgroundDrawer.classList.remove('playground-drawer--open');
    playgroundToggle?.setAttribute('aria-expanded', 'false');
  }
});

for (const radio of document.querySelectorAll<HTMLInputElement>('input[name="console-mode"]')) {
  radio.addEventListener('change', (event) => {
    event.stopPropagation();
    if (radio.checked) {
      playgroundDrawer?.classList.toggle('playground-drawer--inline', radio.value === 'inline');
    }
  });
}

const appRoot = document.querySelector<HTMLElement>('#app');

const radioGroupSyncFns: Array<() => void> = [];

for (const group of document.querySelectorAll<HTMLElement>('[data-radio-group]')) {
  const nestKeyRadios = group.querySelectorAll<HTMLInputElement>('[data-radio-nest-key]');
  const syncNesting = () => {
    for (const keyRadio of nestKeyRadios) {
      // Nested targets may live in a different [data-radio-group] column
      // (e.g. Management App UX gating the whole Agnostic app style column).
      const nested = document.querySelector<HTMLElement>(`[data-radio-nested-for="${keyRadio.dataset.radioNestKey}"]`);
      if (!nested) continue;
      const isSelected = keyRadio.checked;
      const nestedInputs = [...nested.querySelectorAll<HTMLInputElement>('input')];
      for (const nestedInput of nestedInputs) {
        nestedInput.disabled = !isSelected;
        if (!isSelected && (nestedInput.type === 'radio' || nestedInput.type === 'checkbox')) {
          nestedInput.checked = false;
        }
      }
      if (isSelected) {
        // Only auto-pick a default among radios directly inside this nested
        // block — radios inside a deeper [data-radio-nested-for] block cascade
        // on their own once their own parent choice gets checked below.
        const directRadios = nestedInputs.filter(
          (input) => input.type === 'radio' && input.closest('[data-radio-nested-for]') === nested,
        );
        const nestedRadiosByName = new Map<string, HTMLInputElement[]>();
        for (const input of directRadios) {
          const radios = nestedRadiosByName.get(input.name) ?? [];
          radios.push(input);
          nestedRadiosByName.set(input.name, radios);
        }
        for (const radios of nestedRadiosByName.values()) {
          if (!radios.some((input) => input.checked)) {
            radios[0].checked = true;
            radios[0].dispatchEvent(new Event('change', { bubbles: true }));
          }
        }
      }
    }
  };
  radioGroupSyncFns.push(syncNesting);
  for (const radio of group.querySelectorAll<HTMLInputElement>('.playground-radio-group__radio')) {
    radio.addEventListener('change', () => {
      for (const fn of radioGroupSyncFns) {
        fn();
      }
    });
  }
}

for (const fn of radioGroupSyncFns) {
  fn();
}

for (const radio of document.querySelectorAll<HTMLInputElement>('[data-layout-mode]')) {
  radio.addEventListener('change', () => {
    if (appRoot && radio.checked && radio.dataset.layoutMode) {
      appRoot.dataset.layout = radio.dataset.layoutMode;
      updateRailPointer();
    }
  });
}

for (const radio of document.querySelectorAll<HTMLInputElement>('input[name="agnostic-app-style"]')) {
  radio.addEventListener('change', () => {
    if (appRoot && radio.checked) {
      appRoot.dataset.agnosticStyle = radio.value;
      updateRailPointer();
      updatePillZoneState();
    }
  });
}

for (const radio of document.querySelectorAll<HTMLInputElement>('input[name="agnostic-utility-mode"]')) {
  radio.addEventListener('change', () => {
    if (appRoot && radio.checked) {
      appRoot.dataset.agnosticUtilityMode = radio.value;
    }
  });
}

for (const radio of document.querySelectorAll<HTMLInputElement>('input[name="agnostic-rail-mode"]')) {
  radio.addEventListener('change', () => {
    if (appRoot && radio.checked) {
      appRoot.dataset.agnosticRailMode = radio.value;
      updateRailPointer();
      updatePillZoneState();
    }
  });
}

for (const radio of document.querySelectorAll<HTMLInputElement>('input[name="agnostic-pill-visual"]')) {
  radio.addEventListener('change', () => {
    if (appRoot && radio.checked) {
      appRoot.dataset.agnosticPillVisual = radio.value;
      updatePillZoneState();
    }
  });
}

for (const radio of document.querySelectorAll<HTMLInputElement>('input[name="management-app-ux"]')) {
  radio.addEventListener('change', () => {
    if (!appRoot || !radio.checked) {
      return;
    }
    appRoot.dataset.managementAppUx = radio.value;
    if (radio.value === 'portfolio-centric') {
      delete appRoot.dataset.agnosticStyle;
      delete appRoot.dataset.agnosticUtilityMode;
      delete appRoot.dataset.agnosticRailMode;
      delete appRoot.dataset.agnosticPillVisual;
    }
    updateRailPointer();
    updatePillZoneState();
  });
}

const assetMenuTrigger = document.querySelector<HTMLButtonElement>('[data-asset-menu-trigger]');
const assetMenuDropdown = document.querySelector<HTMLElement>('[data-asset-menu-dropdown]');

assetMenuTrigger?.addEventListener('click', (event) => {
  event.stopPropagation();
  const isOpen = assetMenuDropdown?.toggleAttribute('hidden') === false;
  assetMenuTrigger.setAttribute('aria-expanded', String(isOpen));
});

for (const item of document.querySelectorAll<HTMLElement>('[data-asset-menu-item]')) {
  item.addEventListener('click', () => {
    assetMenuDropdown?.setAttribute('hidden', '');
    assetMenuTrigger?.setAttribute('aria-expanded', 'false');
  });
}

document.addEventListener('click', (event) => {
  if (assetMenuDropdown?.hasAttribute('hidden')) {
    return;
  }
  const target = event.target as Element;
  if (!target.closest('.nav-asset-menu')) {
    assetMenuDropdown?.setAttribute('hidden', '');
    assetMenuTrigger?.setAttribute('aria-expanded', 'false');
  }
});

const SCROLLBAR_THUMB_ON_LIGHT_BG = { thumb: 'rgba(14, 15, 17, 0.22)', hover: 'rgba(14, 15, 17, 0.35)' };
const SCROLLBAR_THUMB_ON_DARK_BG = { thumb: 'rgba(255, 255, 255, 0.25)', hover: 'rgba(255, 255, 255, 0.4)' };

function setLeftNavScrollbarThumb(thumb: string, hover: string) {
  const panels = document.querySelector<HTMLElement>('.left-nav__panels');
  if (!panels) {
    return;
  }
  // Chromium doesn't reliably repaint an already-created scroller's native
  // scrollbar when scrollbar-color only changes via a CSS variable, so set
  // it inline directly and force a reflow to make it take effect.
  panels.style.setProperty('--scrollbar-thumb', thumb);
  panels.style.setProperty('--scrollbar-thumb-hover', hover);
  panels.style.overflowY = 'hidden';
  void panels.offsetHeight;
  panels.style.overflowY = '';
}

for (const radio of document.querySelectorAll<HTMLInputElement>('[data-left-nav-theme-option]')) {
  radio.addEventListener('change', () => {
    if (appRoot && radio.checked && radio.dataset.leftNavThemeOption) {
      appRoot.dataset.leftNavTheme = radio.dataset.leftNavThemeOption;
      if (radio.dataset.leftNavThemeOption === 'dark') {
        setLeftNavScrollbarThumb(SCROLLBAR_THUMB_ON_DARK_BG.thumb, SCROLLBAR_THUMB_ON_DARK_BG.hover);
      } else if (radio.dataset.leftNavThemeOption === 'light') {
        setLeftNavScrollbarThumb(SCROLLBAR_THUMB_ON_LIGHT_BG.thumb, SCROLLBAR_THUMB_ON_LIGHT_BG.hover);
      }
    }
  });
}

const viewSelectorChips = document.querySelectorAll<HTMLButtonElement>(
  '.filter-chip[data-view], .top-rail__tab[data-view]',
);
const sectionButtons = document.querySelectorAll<HTMLElement>(
  '.icon-rail__item[data-section], .top-rail__pill[data-section], .nav-icon-button[data-section], .nav-asset-menu__item[data-section], .left-nav__item[data-section]',
);
const leftNav = document.querySelector<HTMLElement>('.left-nav');
const leftNavTitle = document.querySelector<HTMLElement>('[data-left-nav-title]');
const leftNavTitleText = document.querySelector<HTMLElement>('[data-left-nav-title-text]');
const leftNavTitleIconUse = document.querySelector<SVGUseElement>('[data-left-nav-title-icon] use');
const leftNavPanels = document.querySelectorAll<HTMLElement>('[data-left-nav-panel]');
const viewPanels = document.querySelectorAll<HTMLElement>('[data-view-panel]');
const fallbackPanel = document.querySelector<HTMLElement>('[data-view-panel-fallback]');
const fallbackPanelLabel = document.querySelector<HTMLElement>('[data-view-panel-fallback-label]');
const fallbackPanelTitle = document.querySelector<HTMLElement>('[data-view-panel-fallback-title]');
const messagesButton = document.querySelector<HTMLButtonElement>('[data-messages-button]');
const messagesBadge = document.querySelector<HTMLElement>('[data-messages-badge]');
const canvasTitleSection = document.querySelector<HTMLElement>('[data-canvas-title-section]');
const canvasTitlePage = document.querySelector<HTMLElement>('[data-canvas-title-page]');
const railPointer = document.querySelector<HTMLElement>('[data-rail-pointer]');
const iconRailEl = document.querySelector<HTMLElement>('.icon-rail');

function updateRailPointer() {
  if (!railPointer || !iconRailEl) {
    return;
  }
  // Several rail items can share the same data-section (default position,
  // pinned-bottom copy, aggregated "asset management" group item) with only
  // one actually rendered at a time via CSS display, not the hidden
  // attribute — so pick the first candidate that has real, non-zero layout.
  let activeItem: HTMLElement | null = null;
  for (const candidate of iconRailEl.querySelectorAll<HTMLElement>('.icon-rail__item--active')) {
    const rect = candidate.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      activeItem = candidate;
      break;
    }
  }
  if (!activeItem) {
    return;
  }
  const railRect = iconRailEl.getBoundingClientRect();
  const itemRect = activeItem.getBoundingClientRect();
  const centerY = itemRect.top - railRect.top + itemRect.height / 2;
  railPointer.style.transform = `translateY(${centerY}px)`;
}

const customLeftNavColorInput = document.querySelector<HTMLInputElement>('[data-custom-left-nav-color]');

const LIGHT_TEXT_ON_DARK = {
  border: 'rgba(219, 231, 255, 0.31)',
  borderRight: 'rgba(255, 255, 255, 0.1)',
  text: 'rgba(250, 250, 250, 1)',
  textSecondary: 'rgba(205, 207, 212, 1)',
  icon: 'rgba(205, 207, 212, 1)',
  iconActive: 'rgba(250, 250, 250, 1)',
  hover: 'rgba(219, 231, 255, 0.1)',
  active: 'rgba(219, 231, 255, 0.15)',
  titleBg: 'rgba(219, 231, 255, 0.05)',
  divider: 'rgba(255, 255, 255, 0.1)',
  scrollbarThumb: 'rgba(255, 255, 255, 0.25)',
  scrollbarThumbHover: 'rgba(255, 255, 255, 0.4)',
};

const DARK_TEXT_ON_LIGHT = {
  border: 'rgba(219, 231, 255, 0.31)',
  borderRight: 'rgba(229, 231, 235, 1)',
  text: 'rgba(14, 15, 17, 1)',
  textSecondary: 'rgba(97, 102, 112, 1)',
  icon: 'rgba(97, 102, 112, 1)',
  iconActive: 'rgba(14, 15, 17, 1)',
  hover: 'rgba(14, 15, 17, 0.06)',
  active: 'rgba(14, 15, 17, 0.1)',
  titleBg: 'rgba(14, 15, 17, 0.04)',
  divider: 'rgba(14, 15, 17, 0.12)',
  scrollbarThumb: 'rgba(14, 15, 17, 0.22)',
  scrollbarThumbHover: 'rgba(14, 15, 17, 0.35)',
};

const BRIGHTNESS_THRESHOLD = 128;

function applyCustomLeftNavColor(hex: string) {
  if (!appRoot) {
    return;
  }
  const parsed = hex.replace('#', '');
  const r = parseInt(parsed.slice(0, 2), 16);
  const g = parseInt(parsed.slice(2, 4), 16);
  const b = parseInt(parsed.slice(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  const palette = brightness > BRIGHTNESS_THRESHOLD ? DARK_TEXT_ON_LIGHT : LIGHT_TEXT_ON_DARK;

  appRoot.style.setProperty('--custom-leftnav-bg', hex);
  appRoot.style.setProperty('--custom-leftnav-border', palette.border);
  appRoot.style.setProperty('--custom-leftnav-border-right', palette.borderRight);
  appRoot.style.setProperty('--custom-leftnav-text', palette.text);
  appRoot.style.setProperty('--custom-leftnav-text-secondary', palette.textSecondary);
  appRoot.style.setProperty('--custom-leftnav-icon', palette.icon);
  appRoot.style.setProperty('--custom-leftnav-icon-active', palette.iconActive);
  appRoot.style.setProperty('--custom-leftnav-hover', palette.hover);
  appRoot.style.setProperty('--custom-leftnav-active', palette.active);
  appRoot.style.setProperty('--custom-leftnav-title-bg', palette.titleBg);
  appRoot.style.setProperty('--custom-leftnav-divider', palette.divider);
  appRoot.style.setProperty('--custom-leftnav-scrollbar-thumb', palette.scrollbarThumb);
  appRoot.style.setProperty('--custom-leftnav-scrollbar-thumb-hover', palette.scrollbarThumbHover);
  setLeftNavScrollbarThumb(palette.scrollbarThumb, palette.scrollbarThumbHover);
}

customLeftNavColorInput?.addEventListener('input', () => {
  applyCustomLeftNavColor(customLeftNavColorInput.value);
});

if (customLeftNavColorInput) {
  applyCustomLeftNavColor(customLeftNavColorInput.value);
}

const chipLabels: Record<string, string> = {};

const messageCounts: Record<string, number> = {
  'book-of-business': 23,
  'smith-family': 9,
  'davis-family': 4,
  'greenfield-partners': 3,
  'northgate-capital': 2,
  'westside-endowment': 5,
  'harrington-trust': 1,
};

const sectionTitles: Record<string, string> = {
  'portfolio-analysis': 'Portfolio analysis',
  'meeting-prep': 'Meeting prep',
  'client-engagement': 'Client engagement',
  'report-management': 'Report management',
  'data-integrity': 'Data integrity',
  billing: 'Billing',
  compliance: 'Compliance',
  trading: 'Trading',
  files: 'File management',
  'asset-management': 'Asset management',
  'content-management': 'Content management',
};

const sectionIcons: Record<string, string> = {
  'portfolio-analysis': 'chart-line',
  'meeting-prep': 'calendar',
  'client-engagement': 'users',
  'report-management': 'chart-bar',
  'data-integrity': 'files',
  billing: 'dollar-sign',
  trading: 'scale-unbalanced',
  compliance: 'triangle-exclamation',
  files: 'folder',
  'asset-management': 'briefcase',
  'content-management': 'file-lines',
};

const canvasSectionLabels: Record<string, string> = {
  'portfolio-analysis': 'Portfolio Analysis',
  'meeting-prep': 'Meeting Prep',
  'client-engagement': 'Client Engagement',
  'report-management': 'Report Management',
  'data-integrity': 'Data Integrity',
  billing: 'Billing',
  compliance: 'Compliance',
  trading: 'Trading',
  files: 'File Management',
  'asset-management': 'Asset Management',
  'content-management': 'Content Management',
};

let currentLeftNavItemLabel = 'Overview';

const BASE_SECTION = 'portfolio-analysis';

let currentChipView = 'book-of-business';
let currentSection = BASE_SECTION;
let loadingTimeoutId: ReturnType<typeof setTimeout> | undefined;

function render(withLoadingState = false) {
  const activeViewPanel =
    currentSection === BASE_SECTION ? currentChipView : `${currentChipView}-${currentSection}`;

  let activePanel: HTMLElement | null = null;
  for (const panel of viewPanels) {
    const isActive = panel.dataset.viewPanel === activeViewPanel;
    panel.hidden = !isActive;
    if (isActive) {
      activePanel = panel;
    }
  }

  if (!activePanel && fallbackPanel) {
    activePanel = fallbackPanel;
    fallbackPanel.hidden = false;
    if (fallbackPanelLabel) {
      fallbackPanelLabel.textContent = chipLabels[currentChipView] ?? '';
    }
    if (fallbackPanelTitle) {
      fallbackPanelTitle.textContent = `${canvasSectionLabels[currentSection] ?? sectionTitles[currentSection] ?? ''} Overview`;
    }
  } else if (fallbackPanel) {
    fallbackPanel.hidden = true;
  }

  for (const panel of leftNavPanels) {
    panel.hidden = panel.dataset.leftNavPanel !== currentSection;
  }

  if (leftNavTitle) {
    const title = sectionTitles[currentSection];
    leftNavTitle.hidden = !title;
    if (leftNavTitleText) {
      leftNavTitleText.textContent = title;
    }
    if (leftNavTitleIconUse) {
      leftNavTitleIconUse.setAttribute('href', `${import.meta.env.BASE_URL}assets/apl/icons.svg#${sectionIcons[currentSection]}`);
    }
  }

  for (const chip of document.querySelectorAll<HTMLButtonElement>('.filter-chip[data-view], .top-rail__tab[data-view]')) {
    const isSelected = chip.dataset.view === currentChipView;
    if (chip.classList.contains('filter-chip')) {
      chip.classList.toggle('filter-chip--active', isSelected);
      chip.classList.toggle('filter-chip--secondary', !isSelected);
    } else {
      chip.classList.toggle('top-rail__tab--active', isSelected);
    }
    chip.setAttribute('aria-pressed', String(isSelected));
  }

  for (const button of sectionButtons) {
    const isSelected =
      button.dataset.section === currentSection ||
      (button.dataset.sectionGroup?.split(',').includes(currentSection) ?? false);
    if (button.classList.contains('icon-rail__item')) {
      button.classList.toggle('icon-rail__item--active', isSelected);
    } else if (button.classList.contains('top-rail__pill')) {
      button.classList.toggle('top-rail__pill--active', isSelected);
    } else if (button.classList.contains('left-nav__item')) {
      button.classList.toggle('left-nav__item--active', isSelected);
    }
  }

  if (canvasTitleSection) {
    canvasTitleSection.textContent = `${canvasSectionLabels[currentSection] ?? ''} /`;
  }
  if (canvasTitlePage) {
    canvasTitlePage.textContent = currentLeftNavItemLabel;
  }
  updateRailPointer();
  updatePillZoneState();

  leftNav?.classList.toggle('left-nav--book-of-business', currentChipView === 'book-of-business');
  leftNav?.classList.toggle('left-nav--household', portfolioTypesBySlug[currentChipView] === 'household');

  const messageCount = messageCounts[currentChipView] ?? 0;
  if (messagesBadge) {
    messagesBadge.textContent = String(messageCount);
    messagesBadge.classList.toggle('icon-rail__badge--green', currentChipView === 'book-of-business');
  }

  if (withLoadingState) {
    const container = activePanel?.querySelector<HTMLElement>('.content-container');
    if (container) {
      if (loadingTimeoutId !== undefined) {
        clearTimeout(loadingTimeoutId);
      }
      container.classList.add('is-loading');
      loadingTimeoutId = setTimeout(() => {
        container.classList.remove('is-loading');
        loadingTimeoutId = undefined;
      }, 500);
    }
  }
}

const MANAGEMENT_APP_SECTIONS = new Set(['content-management', 'report-management', 'files', 'asset-management']);

function updatePillZoneState() {
  const agnosticModeActive =
    appRoot?.dataset.managementAppUx === 'portfolio-agnostic' && appRoot?.dataset.agnosticStyle === 'left-rail';
  const pillVisual = appRoot?.dataset.agnosticPillVisual;
  const onManagementApp = MANAGEMENT_APP_SECTIONS.has(currentSection);

  for (const zone of document.querySelectorAll<HTMLElement>('.filter-chips, .top-rail__tabs')) {
    zone.classList.toggle(
      'filter-chips--disabled',
      Boolean(agnosticModeActive && pillVisual === 'disable' && onManagementApp),
    );
    zone.classList.toggle(
      'filter-chips--offscreen',
      Boolean(agnosticModeActive && pillVisual === 'animate' && onManagementApp),
    );
  }
}

for (const chip of viewSelectorChips) {
  attachChipBehavior(chip);
}

for (const button of sectionButtons) {
  button.addEventListener('click', () => {
    if (button.dataset.section !== currentSection) {
      currentLeftNavItemLabel = 'Overview';
    }
    currentSection = button.dataset.section ?? currentSection;
    render(true);
  });
}

render();
updateAddSlotVisibility();

for (const tab of document.querySelectorAll<HTMLButtonElement>('.table-tab')) {
  tab.addEventListener('click', () => {
    for (const otherTab of document.querySelectorAll<HTMLButtonElement>('.table-tab')) {
      otherTab.classList.toggle('table-tab--active', otherTab === tab);
    }
  });
}

for (const tabGroup of document.querySelectorAll<HTMLElement>('.page-tabs')) {
  const tabs = tabGroup.querySelectorAll<HTMLButtonElement>('.page-tab');
  for (const tab of tabs) {
    tab.addEventListener('click', () => {
      for (const otherTab of tabs) {
        otherTab.classList.toggle('page-tab--active', otherTab === tab);
      }
    });
  }
}

const firmAdminOverlay = document.querySelector<HTMLElement>('[data-firm-admin-overlay]');
const firmAdminTrigger = document.querySelector<HTMLButtonElement>('[data-tooltip="Firm Administration"]');
const firmAdminClose = document.querySelector<HTMLButtonElement>('[data-firm-admin-close]');
const firmAdminOpen = document.querySelector<HTMLButtonElement>('[data-firm-admin-open]');

firmAdminTrigger?.addEventListener('click', () => {
  firmAdminOverlay?.removeAttribute('hidden');
});

firmAdminClose?.addEventListener('click', () => {
  firmAdminOverlay?.setAttribute('hidden', '');
});

firmAdminOverlay?.addEventListener('click', (event) => {
  if (event.target === firmAdminOverlay) {
    firmAdminOverlay.setAttribute('hidden', '');
  }
});

firmAdminOpen?.addEventListener('click', () => {
  window.open(window.location.href, '_blank');
});

const contentManagementOverlay = document.querySelector<HTMLElement>('[data-content-management-overlay]');
const contentManagementTriggers = document.querySelectorAll<HTMLElement>('[data-content-management-trigger]');
const contentManagementClose = document.querySelector<HTMLButtonElement>('[data-content-management-close]');
const contentManagementOpen = document.querySelector<HTMLButtonElement>('[data-content-management-open]');

for (const trigger of contentManagementTriggers) {
  trigger.addEventListener('click', (event) => {
    event.preventDefault();
    contentManagementOverlay?.removeAttribute('hidden');
  });
}

contentManagementClose?.addEventListener('click', () => {
  contentManagementOverlay?.setAttribute('hidden', '');
});

contentManagementOverlay?.addEventListener('click', (event) => {
  if (event.target === contentManagementOverlay) {
    contentManagementOverlay.setAttribute('hidden', '');
  }
});

contentManagementOpen?.addEventListener('click', () => {
  window.open(window.location.href, '_blank');
});

function wireModal(prefix: string) {
  const overlay = document.querySelector<HTMLElement>(`[data-${prefix}-overlay]`);
  const triggers = document.querySelectorAll<HTMLElement>(`[data-${prefix}-trigger]`);
  const close = document.querySelector<HTMLButtonElement>(`[data-${prefix}-close]`);
  const open = document.querySelector<HTMLButtonElement>(`[data-${prefix}-open]`);

  for (const trigger of triggers) {
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      overlay?.removeAttribute('hidden');
    });
  }

  close?.addEventListener('click', () => {
    overlay?.setAttribute('hidden', '');
  });

  overlay?.addEventListener('click', (event) => {
    if (event.target === overlay) {
      overlay.setAttribute('hidden', '');
    }
  });

  open?.addEventListener('click', () => {
    window.open(window.location.href, '_blank');
  });
}

wireModal('report-management');
wireModal('files');

for (const option of document.querySelectorAll<HTMLButtonElement>('.content-mgmt-viewby__option')) {
  option.addEventListener('click', () => {
    for (const otherOption of document.querySelectorAll<HTMLButtonElement>('.content-mgmt-viewby__option')) {
      otherOption.classList.toggle('content-mgmt-viewby__option--active', otherOption === option);
    }
  });
}

interface ConversationMessage {
  sender: string;
  text: string;
  self?: boolean;
}

interface Conversation {
  sender: string;
  tag: string;
  messages: ConversationMessage[];
}

const conversations: Record<string, Conversation> = {
  smith: {
    sender: 'Adam Smith',
    tag: 'Smith Family',
    messages: [
      { sender: 'Adam Smith', text: 'Hi, do you have a minute to talk through the portfolio rebalance?' },
      { sender: 'You', text: 'Of course, I have some time this afternoon.', self: true },
      { sender: 'Adam Smith', text: 'Great, can we move the meeting to Thursday instead?' },
      { sender: 'You', text: "Thursday works, I'll send a new invite.", self: true },
    ],
  },
  davis: {
    sender: 'Diane Davis',
    tag: 'Davis Family',
    messages: [
      { sender: 'Diane Davis', text: 'Thanks for sending over the report.' },
      { sender: 'You', text: 'Happy to help, let me know if you have questions.', self: true },
      { sender: 'Diane Davis', text: 'Just one, can we review the cash flow section together?' },
    ],
  },
  greenfield: {
    sender: 'Robert Greenfield',
    tag: 'Greenfield Partners',
    messages: [
      { sender: 'Robert Greenfield', text: 'Following up on the rebalance request from last week.' },
      { sender: 'You', text: "It's in progress, should be complete by Friday.", self: true },
    ],
  },
  northgate: {
    sender: 'Priya Narang',
    tag: 'Northgate Capital',
    messages: [
      { sender: 'Priya Narang', text: 'Can you confirm the wire went through?' },
      { sender: 'You', text: 'Confirmed, it settled this morning.', self: true },
      { sender: 'Priya Narang', text: 'Perfect, thank you!' },
    ],
  },
  westside: {
    sender: 'Lauren Westfield',
    tag: 'Westside Endowment',
    messages: [
      { sender: 'Lauren Westfield', text: "Let's schedule the quarterly review." },
      { sender: 'You', text: 'How does next Tuesday at 10am sound?', self: true },
    ],
  },
  harrington: {
    sender: 'Marcus Harrington',
    tag: 'Harrington Trust',
    messages: [
      { sender: 'Marcus Harrington', text: 'Attaching the signed documents.' },
      { sender: 'You', text: "Received, thank you, I'll process these today.", self: true },
    ],
  },
};

const messagesPanel = document.querySelector<HTMLElement>('[data-messages-panel]');
const messagesListView = document.querySelector<HTMLElement>('[data-messages-list]');
const messagesThreadView = document.querySelector<HTMLElement>('[data-messages-thread]');
const messagesBackButton = document.querySelector<HTMLButtonElement>('[data-messages-back]');
const threadSender = document.querySelector<HTMLElement>('[data-thread-sender]');
const threadTag = document.querySelector<HTMLButtonElement>('[data-thread-tag]');
const threadTagText = document.querySelector<HTMLElement>('[data-thread-tag-text]');
const threadMessages = document.querySelector<HTMLElement>('[data-thread-messages]');

const chipConversationMap: Record<string, string> = {
  'smith-family': 'smith',
  'davis-family': 'davis',
  'greenfield-partners': 'greenfield',
  'northgate-capital': 'northgate',
  'westside-endowment': 'westside',
  'harrington-trust': 'harrington',
};

const conversationChipMap: Record<string, string> = {
  smith: 'smith-family',
  davis: 'davis-family',
  greenfield: 'greenfield-partners',
  northgate: 'northgate-capital',
  westside: 'westside-endowment',
  harrington: 'harrington-trust',
};

interface NewPortfolio {
  view: string;
  label: string;
}

const newPortfolios: Record<string, NewPortfolio> = {
  greenfield: { view: 'greenfield-partners', label: 'Greenfield Partners' },
  northgate: { view: 'northgate-capital', label: 'Northgate Capital' },
  westside: { view: 'westside-endowment', label: 'Westside Endowment' },
  harrington: { view: 'harrington-trust', label: 'Harrington Trust' },
};

let currentThreadKey: string | null = null;

function setActiveConversation(key: string | null) {
  for (const button of document.querySelectorAll<HTMLButtonElement>('[data-conversation]')) {
    button.classList.toggle('messages-panel__conversation--active', button.dataset.conversation === key);
  }
}

function renderThread(key: string) {
  const conversation = conversations[key];
  if (!conversation || !threadMessages) {
    return;
  }

  if (threadSender) {
    threadSender.textContent = conversation.sender;
  }
  if (threadTagText) {
    threadTagText.textContent = conversation.tag;
  }
  const threadTagIconUse = threadTag?.querySelector('use');
  if (threadTagIconUse) {
    threadTagIconUse.setAttribute(
      'href',
      `${import.meta.env.BASE_URL}assets/apl/icons.svg#${getPortfolioIconName(slugify(conversation.tag))}`,
    );
  }

  threadMessages.replaceChildren(
    ...conversation.messages.map((message) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'messages-panel__message';
      if (message.self) {
        wrapper.classList.add('messages-panel__message--self');
      }
      const sender = document.createElement('span');
      sender.className = 'messages-panel__message-sender';
      sender.textContent = message.sender;
      const text = document.createElement('p');
      text.className = 'messages-panel__message-text';
      text.textContent = message.text;
      wrapper.append(sender, text);
      return wrapper;
    }),
  );

  if (messagesThreadView) {
    messagesThreadView.hidden = false;
  }
}

threadTag?.addEventListener('click', (event) => {
  event.stopPropagation();
  if (!currentThreadKey) {
    return;
  }
  const chipView = conversationChipMap[currentThreadKey];
  if (!chipView) {
    return;
  }
  const portfolio = newPortfolios[currentThreadKey];
  if (portfolio) {
    addPortfolioChip(portfolio.view, portfolio.label);
  }
  const selector =
    appRoot?.dataset.layout === 'tabs-top-rail'
      ? `.top-rail__tab[data-view="${chipView}"]`
      : `.filter-chip[data-view="${chipView}"]`;
  document.querySelector<HTMLButtonElement>(selector)?.click();
});

for (const conversationButton of document.querySelectorAll<HTMLButtonElement>('[data-conversation]')) {
  conversationButton.addEventListener('click', () => {
    const key = conversationButton.dataset.conversation ?? '';
    currentThreadKey = key;
    renderThread(key);
    setActiveConversation(key);
    if (messagesBackButton) {
      messagesBackButton.hidden = false;
    }
  });
}

messagesBackButton?.addEventListener('click', () => {
  currentThreadKey = null;
  if (messagesThreadView) {
    messagesThreadView.hidden = true;
  }
  setActiveConversation(null);
});

function syncMessagesPanelToChipView() {
  if (!messagesPanel || messagesPanel.hidden) {
    return;
  }

  const directConversationKey = chipConversationMap[currentChipView];
  if (directConversationKey) {
    messagesListView?.classList.add('messages-panel__list--collapsed');
    if (messagesBackButton) {
      messagesBackButton.hidden = true;
    }
    setActiveConversation(null);
    currentThreadKey = directConversationKey;
    renderThread(directConversationKey);
  } else {
    messagesListView?.classList.remove('messages-panel__list--collapsed');
    if (currentThreadKey) {
      setActiveConversation(currentThreadKey);
      if (messagesBackButton) {
        messagesBackButton.hidden = false;
      }
      renderThread(currentThreadKey);
    } else {
      setActiveConversation(null);
      if (messagesThreadView) {
        messagesThreadView.hidden = true;
      }
    }
  }
}

function attachChipBehavior(chip: HTMLButtonElement) {
  chip.addEventListener('click', () => {
    currentChipView = chip.dataset.view ?? currentChipView;
    render(true);
    syncMessagesPanelToChipView();
  });
}

function addPortfolioChip(view: string, label: string) {
  chipLabels[view] = label;

  if (document.querySelector(`.filter-chip[data-view="${view}"]`)) {
    return;
  }

  const iconHref = `${import.meta.env.BASE_URL}assets/apl/icons.svg#${getPortfolioIconName(view)}`;
  const chevronHref = `${import.meta.env.BASE_URL}assets/apl/icons.svg#angle-down`;
  const closeHref = `${import.meta.env.BASE_URL}assets/apl/icons.svg#xmark`;

  const pillChip = document.createElement('button');
  pillChip.className = 'filter-chip filter-chip--secondary';
  pillChip.type = 'button';
  pillChip.dataset.view = view;
  pillChip.setAttribute('aria-pressed', 'false');
  pillChip.innerHTML = `<svg class="filter-chip__icon" aria-hidden="true"><use href="${iconHref}"></use></svg><span class="filter-chip__label">${label}</span><svg class="filter-chip__chevron" aria-hidden="true"><use href="${chevronHref}"></use></svg><svg class="filter-chip__close" aria-hidden="true"><use href="${closeHref}"></use></svg>`;
  attachChipBehavior(pillChip);
  const pillChevron = pillChip.querySelector<SVGElement>('.filter-chip__chevron');
  if (pillChevron) {
    attachChevronBehavior(pillChevron);
  }
  const pillClose = pillChip.querySelector<SVGElement>('.filter-chip__close');
  if (pillClose) {
    attachCloseBehavior(pillClose);
  }
  document.querySelector('.filter-chips .chip-add-slot')?.insertAdjacentElement('beforebegin', pillChip);
  animateChipInsertion(pillChip);

  const tabChip = document.createElement('button');
  tabChip.className = 'top-rail__tab';
  tabChip.type = 'button';
  tabChip.dataset.view = view;
  tabChip.setAttribute('aria-pressed', 'false');
  tabChip.innerHTML = `<svg class="icon" aria-hidden="true"><use href="${iconHref}"></use></svg><span class="top-rail__tab-label">${label}</span><svg class="icon top-rail__tab-chevron" aria-hidden="true"><use href="${chevronHref}"></use></svg>`;
  attachChipBehavior(tabChip);
  const tabChevron = tabChip.querySelector<SVGElement>('.top-rail__tab-chevron');
  if (tabChevron) {
    attachChevronBehavior(tabChevron);
  }
  document.querySelector('.top-rail__tabs .chip-add-slot')?.insertAdjacentElement('beforebegin', tabChip);
  animateChipInsertion(tabChip);

  updateAddSlotVisibility();
}

function closeMessagesPanel() {
  if (!messagesPanel) {
    return;
  }
  messagesPanel.hidden = true;
  messagesButton?.classList.remove('is-menu-open');
}

messagesButton?.addEventListener('click', (event) => {
  event.stopPropagation();
  if (!messagesPanel) {
    return;
  }
  const isOpen = !messagesPanel.hidden;
  if (isOpen) {
    closeMessagesPanel();
    return;
  }

  currentThreadKey = null;
  const rect = messagesButton.getBoundingClientRect();
  messagesPanel.style.left = `${rect.right + 8}px`;
  messagesPanel.style.bottom = `${window.innerHeight - rect.bottom}px`;
  messagesPanel.hidden = false;
  messagesButton.classList.add('is-menu-open');
  syncMessagesPanelToChipView();
});

document.addEventListener('click', (event) => {
  if (!messagesPanel || messagesPanel.hidden) {
    return;
  }
  const target = event.target as Element;
  const isChipClick = target.closest('.filter-chip[data-view], .top-rail__tab[data-view]');
  if (!messagesPanel.contains(target) && !target.closest('[data-messages-button]') && !isChipClick) {
    closeMessagesPanel();
  }
});
