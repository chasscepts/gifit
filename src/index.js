import './assets/css/style.scss';

// Setup Sidebar Open / Close

(() => {
  const hamburger = document.querySelector('#hamburger');
  const sidebar = document.querySelector('#sidebar');
  let open = true;

  hamburger.addEventListener('click', () => {
    if (open) {
      hamburger.classList.remove('open');
      sidebar.classList.remove('open');
    } else {
      hamburger.classList.add('open');
      sidebar.classList.add('open');
    }
    open = !open;
  });
})();

// Setup Video / Canvas TabControl
(() => {
  const tabHeaders = document.querySelectorAll('.tab-header');
  let activeTabHeader;
  let activeTabItem;

  tabHeaders.forEach((header) => {
    header.addEventListener('click', () => {
      if (activeTabHeader === header) {
        return;
      }

      if (activeTabHeader) {
        activeTabHeader.classList.remove('active');
      }
      if (activeTabItem) {
        activeTabItem.classList.remove('active');
      }

      activeTabHeader = header;
      activeTabItem = document.querySelector(header.getAttribute('data-tab'));
      activeTabItem.classList.add('active');
      header.classList.add('active');
    });

    if (header.classList.contains('active')) {
      header.click();
    }
  });
})();
