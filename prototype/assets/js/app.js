document.addEventListener('DOMContentLoaded', () => {
  console.log('App loaded');

  const cards = document.querySelectorAll('.card[data-card-id]');
  const cardDetailsCache = new Map(); // Cache for ALL detail elements per card

  // Function to apply state (level) to a card, treating all details equally
  const applyCardLevel = (card, level, allDetails) => {
    // Renamed availableDetails -> allDetails
    const knob = card.querySelector('.knob');
    if (!knob) return;

    const numTotalDetails = allDetails.length;
    if (numTotalDetails === 0) {
      console.warn(`Card ${card.dataset.cardId} has no details to cycle.`);
      knob.dataset.level = 0; // Set level to 0 if no details
      return; // Nothing to activate
    }

    // Cycle level based on the total number of details (0 to N-1)
    const actualLevel = level % numTotalDetails;

    console.log(
      `Applying level ${actualLevel} (index ${actualLevel}) to card ${card.dataset.cardId}`
    );

    // Apply level to knob
    knob.dataset.level = actualLevel;

    // Deactivate all details first
    const allDetailElements = card.querySelectorAll('.card__detail'); // Use the general selector here too
    allDetailElements.forEach((detail) =>
      detail.removeAttribute('data-active')
    );

    // Activate the correct detail based on the 0-based index (actualLevel)
    if (allDetails[actualLevel]) {
      allDetails[actualLevel].dataset.active = 'true';
      console.log(`Activated detail index ${actualLevel}`);
    } else {
      // Should not happen if cache is correct and numTotalDetails > 0
      console.error(
        `Consistency error: Could not find detail at index ${actualLevel} for card ${card.dataset.cardId}`
      );
    }

    // The visual dial rotation is handled by CSS based on knob[data-level]
  };

  // Initialize cards: cache ALL details and load initial state
  cards.forEach((card) => {
    const cardId = card.dataset.cardId;

    // Query for ALL details and cache them
    const allDetails = Array.from(
      card.querySelectorAll('.card__detail') // Simple selector: grab all details
    );
    cardDetailsCache.set(card, allDetails); // Cache the list of all details

    // Load saved level
    const savedStateJSON = localStorage.getItem(`cardState-${cardId}`);
    let initialLevel = 0; // Default level (will map to the first detail, index 0)

    if (savedStateJSON) {
      try {
        const savedState = JSON.parse(savedStateJSON);
        if (typeof savedState.knobLevel === 'number') {
          initialLevel = savedState.knobLevel;
          console.log(`Loaded level ${initialLevel} for card ${cardId}`);
        } else {
          console.warn(
            `Invalid saved state structure for card ${cardId}:`,
            savedState
          );
          localStorage.removeItem(`cardState-${cardId}`);
        }
      } catch (e) {
        console.error(`Error parsing saved state for card ${cardId}:`, e);
        localStorage.removeItem(`cardState-${cardId}`);
      }
    }

    // Apply the initial or loaded level using the list of all details
    applyCardLevel(card, initialLevel, allDetails);

    // *** Listener is no longer added here ***
  });

  // *** Add delegated event listener for all knob clicks ***
  document.addEventListener('click', (event) => {
    // Check if the clicked element or its ancestor is a knob inside a card
    const clickedKnob = event.target.closest('.card[data-card-id] .knob');

    if (!clickedKnob) {
      return; // Click was not on a knob within a card
    }

    event.preventDefault(); // Prevent default link behavior if knob is an <a>

    const currentCard = clickedKnob.closest('.card[data-card-id]');
    const currentCardId = currentCard?.dataset.cardId;
    const detailsForThisCard = cardDetailsCache.get(currentCard); // Get the list of ALL details

    if (!currentCard || !currentCardId || !detailsForThisCard) {
      console.error(
        'Event Delegation Error: Could not find card, cardId, or cached details for knob click:',
        clickedKnob
      );
      return;
    }

    const numTotalDetails = detailsForThisCard.length;
    if (numTotalDetails === 0) return; // Cannot cycle if no details

    const currentLevel = parseInt(clickedKnob.dataset.level || '0', 10);
    // Cycle based on total details (0 to N-1)
    const nextLevel = (currentLevel + 1) % numTotalDetails;

    // Apply the new level visually
    applyCardLevel(currentCard, nextLevel, detailsForThisCard);

    // Save the new state (only the level)
    const stateToSave = { knobLevel: nextLevel };
    localStorage.setItem(
      `cardState-${currentCardId}`,
      JSON.stringify(stateToSave)
    );
    console.log(
      `Saved level ${nextLevel} for card ${currentCardId} via delegation`
    );
  });

  // Scroll marker to show/hide nav border
  const marker = document.querySelector('.scroll-marker');
  const nav = document.querySelector('.nav__bar');

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) {
        nav.classList.add('nav__bar--scrolled');
      } else {
        nav.classList.remove('nav__bar--scrolled');
      }
    },
    { threshold: 0 }
  );

  observer.observe(marker);
});
