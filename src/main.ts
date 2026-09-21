import '@addepar/design-tokens/build/tokens.custom-properties.css';
import './style.css';

for (const toggle of document.querySelectorAll<HTMLButtonElement>('.left-nav__section-toggle')) {
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
  });
}

const iconRail = document.querySelector<HTMLElement>('.icon-rail');
const iconRailToggle = document.querySelector<HTMLButtonElement>('.icon-rail__toggle');

iconRailToggle?.addEventListener('click', () => {
  const expanded = iconRail?.classList.toggle('icon-rail--expanded') ?? false;
  iconRailToggle.setAttribute('aria-expanded', String(expanded));
  iconRailToggle.setAttribute('aria-label', expanded ? 'Collapse navigation' : 'Expand navigation');
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
  portfolioSelector.hidden = false;

  activePortfolioSelectorTrigger?.classList.remove('is-menu-open');
  activePortfolioSelectorTrigger = anchorEl;
  anchorEl.classList.add('is-menu-open');
}

for (const chevron of document.querySelectorAll<SVGElement>('.filter-chip__chevron, .top-rail__tab-chevron')) {
  chevron.addEventListener('click', (event) => {
    event.stopPropagation();
    const chip = chevron.closest<HTMLElement>('.filter-chip, .top-rail__tab');
    if (chip) {
      togglePortfolioSelector(chip, chip.dataset.view ?? '', 'Switch portfolio');
    }
  });
}

for (const addTrigger of document.querySelectorAll<HTMLButtonElement>('[data-portfolio-selector-trigger="add"]')) {
  addTrigger.addEventListener('click', (event) => {
    event.stopPropagation();
    togglePortfolioSelector(addTrigger, 'add-portfolio', 'Add portfolio');
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

const appRoot = document.querySelector<HTMLElement>('#app');
const layoutSwitchOptions = document.querySelectorAll<HTMLButtonElement>('.layout-switch__option');

for (const option of layoutSwitchOptions) {
  option.addEventListener('click', () => {
    for (const otherOption of layoutSwitchOptions) {
      otherOption.classList.toggle('layout-switch__option--active', otherOption === option);
    }
    if (appRoot && option.dataset.layoutMode) {
      appRoot.dataset.layout = option.dataset.layoutMode;
    }
  });
}

const viewSelectorChips = document.querySelectorAll<HTMLButtonElement>(
  '.filter-chip[data-view], .top-rail__tab[data-view]',
);
const sectionButtons = document.querySelectorAll<HTMLButtonElement>(
  '.icon-rail__item[data-section], .top-rail__pill[data-section]',
);
const leftNav = document.querySelector<HTMLElement>('.left-nav');
const leftNavTitle = document.querySelector<HTMLElement>('[data-left-nav-title]');
const leftNavTitleText = document.querySelector<HTMLElement>('[data-left-nav-title-text]');
const leftNavTitleIconUse = document.querySelector<SVGUseElement>('[data-left-nav-title-icon] use');
const leftNavPanels = document.querySelectorAll<HTMLElement>('[data-left-nav-panel]');
const viewPanels = document.querySelectorAll<HTMLElement>('[data-view-panel]');
const messagesButton = document.querySelector<HTMLButtonElement>('[data-messages-button]');
const messagesBadge = document.querySelector<HTMLElement>('[data-messages-badge]');

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
  'report-management': 'Report management',
  'data-integrity': 'Data integrity',
  billing: 'Billing',
  compliance: 'Compliance',
  trading: 'Trading',
};

const sectionIcons: Record<string, string> = {
  'portfolio-analysis': 'chart-line',
  'meeting-prep': 'calendar',
  'report-management': 'chart-bar',
  'data-integrity': 'files',
  billing: 'dollar-sign',
  trading: 'scale-unbalanced',
  compliance: 'triangle-exclamation',
};

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
    const isSelected = button.dataset.section === currentSection;
    if (button.classList.contains('icon-rail__item')) {
      button.classList.toggle('icon-rail__item--active', isSelected);
    } else {
      button.classList.toggle('top-rail__pill--active', isSelected);
    }
  }

  leftNav?.classList.toggle('left-nav--book-of-business', currentChipView === 'book-of-business');

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

for (const chip of viewSelectorChips) {
  attachChipBehavior(chip);
}

for (const button of sectionButtons) {
  button.addEventListener('click', () => {
    currentSection = button.dataset.section ?? currentSection;
    render(true);
  });
}

render();

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
const firmAdminTrigger = document.querySelector<HTMLButtonElement>('[data-tooltip="Firm administration"]');
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
  if (document.querySelector(`.filter-chip[data-view="${view}"]`)) {
    return;
  }

  const iconHref = `${import.meta.env.BASE_URL}assets/apl/icons.svg#coins`;

  const pillChip = document.createElement('button');
  pillChip.className = 'filter-chip filter-chip--secondary';
  pillChip.type = 'button';
  pillChip.dataset.view = view;
  pillChip.setAttribute('aria-pressed', 'false');
  pillChip.innerHTML = `<svg class="filter-chip__icon" aria-hidden="true"><use href="${iconHref}"></use></svg>${label}`;
  attachChipBehavior(pillChip);
  document.querySelector('.filter-chips [data-portfolio-selector-trigger="add"]')?.insertAdjacentElement('beforebegin', pillChip);

  const tabChip = document.createElement('button');
  tabChip.className = 'top-rail__tab';
  tabChip.type = 'button';
  tabChip.dataset.view = view;
  tabChip.setAttribute('aria-pressed', 'false');
  tabChip.innerHTML = `<svg class="icon" aria-hidden="true"><use href="${iconHref}"></use></svg>${label}`;
  attachChipBehavior(tabChip);
  document.querySelector('.top-rail__tabs [data-portfolio-selector-trigger="add"]')?.insertAdjacentElement('beforebegin', tabChip);
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
