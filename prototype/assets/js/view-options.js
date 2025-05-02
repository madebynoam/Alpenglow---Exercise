document.addEventListener('DOMContentLoaded', () => {
  // --- Constants ---
  const SELECTORS = {
    viewOptions: '.view-options',
    cardGrid: '.card-grid--projects',
    optionsList: '.view-options__menu',
    optionItem: '.view-options__item',
  };
  const CLASSES = {
    selected: 'selected',
    cardGridPrefix: 'card-grid--',
  };
  const STORAGE_KEY = 'cardGridRatio';
  const DEFAULT_RATIO = '16-9';
  const DATA_ATTRIBUTE = 'data-ratio';

  // --- Element References ---
  const viewOptions = document.querySelector(SELECTORS.viewOptions);
  const cardGrid = document.querySelector(SELECTORS.cardGrid);

  // Exit if essential elements are not found
  if (!viewOptions) {
    console.warn(
      `Initialization failed: Element with selector "${SELECTORS.viewOptions}" not found.`
    );
    return;
  }
  if (!cardGrid) {
    console.warn(
      `Initialization failed: Element with selector "${SELECTORS.cardGrid}" not found.`
    );
    return;
  }

  const optionsList = viewOptions.querySelector(SELECTORS.optionsList);
  const options = viewOptions.querySelectorAll(SELECTORS.optionItem);

  // Exit if options list or options themselves are not found
  if (!optionsList) {
    console.warn(
      `Initialization failed: Element with selector "${SELECTORS.optionsList}" not found within viewOptions.`
    );
    return;
  }
  if (options.length === 0) {
    console.warn(
      `Initialization failed: No elements with selector "${SELECTORS.optionItem}" found within viewOptions.`
    );
    return;
  }

  // --- Ratio Logic ---
  // Get all possible ratio values from the data attributes. Relies on `data-ratio` attribute.
  const possibleRatios = Array.from(options)
    .map((opt) => opt.getAttribute(DATA_ATTRIBUTE))
    .filter(Boolean); // Filter out null/empty values

  if (possibleRatios.length === 0) {
    console.warn(
      `Initialization failed: No valid "${DATA_ATTRIBUTE}" attributes found on option items.`
    );
    return;
  }

  const cardGridRatioClasses = possibleRatios.map(
    (ratio) => `${CLASSES.cardGridPrefix}${ratio}`
  );

  // Function to apply a ratio preference
  const applyRatio = (ratio) => {
    // Remove all known ratio classes explicitly
    cardGrid.classList.remove(...cardGridRatioClasses);
    // Add the new ratio class (ensure it's a valid one)
    if (possibleRatios.includes(ratio)) {
      cardGrid.classList.add(`${CLASSES.cardGridPrefix}${ratio}`);
    } else {
      console.warn(
        `Attempted to apply invalid ratio: ${ratio}. Applying default: ${DEFAULT_RATIO}`
      );
      cardGrid.classList.add(`${CLASSES.cardGridPrefix}${DEFAULT_RATIO}`);
      ratio = DEFAULT_RATIO; // Correct the ratio for menu update and storage
    }

    // Update selected state in menu
    options.forEach((opt) => {
      opt.classList.toggle(
        CLASSES.selected,
        opt.getAttribute(DATA_ATTRIBUTE) === ratio
      );
    });

    // Save preference to local storage
    localStorage.setItem(STORAGE_KEY, ratio);
  };

  // --- Initial Load ---
  const savedRatio = localStorage.getItem(STORAGE_KEY);
  // Validate saved ratio is one of the possible ratios
  const initialRatio =
    savedRatio && possibleRatios.includes(savedRatio)
      ? savedRatio
      : DEFAULT_RATIO;
  applyRatio(initialRatio); // Apply initial or default ratio

  // --- Event Delegation for Clicks ---
  optionsList.addEventListener('click', (event) => {
    const clickedOption = event.target.closest(SELECTORS.optionItem);

    // Ensure the click was on a valid option item within our list
    if (clickedOption && optionsList.contains(clickedOption)) {
      event.preventDefault();

      const selectedRatio = clickedOption.getAttribute(DATA_ATTRIBUTE);

      if (selectedRatio && possibleRatios.includes(selectedRatio)) {
        applyRatio(selectedRatio); // Apply selected ratio

        // Close the dropdown
        const detailsElement = clickedOption.closest('details');
        if (detailsElement) {
          detailsElement.removeAttribute('open');
        }
      } else {
        console.warn(
          `Clicked option lacks a valid "${DATA_ATTRIBUTE}" or it's not recognized:`,
          clickedOption
        );
      }
    }
  });
});
