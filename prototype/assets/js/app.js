document.querySelectorAll('.card').forEach((card) => {
  const knob = card.querySelector('.knob');
  const details = card.querySelectorAll('.card__detail');

  if (!knob || details.length < 2) return;

  knob.addEventListener('click', (e) => {
    e.preventDefault();

    const currentIndex = Array.from(details).findIndex(
      (el) => el.dataset.active === 'true'
    );

    if (currentIndex !== -1) {
      details[currentIndex].removeAttribute('data-active');
    }

    const nextIndex = (currentIndex + 1) % details.length;
    details[nextIndex].dataset.active = 'true';

    // Update knob level for styling or ARIA
    knob.dataset.level = nextIndex.toString();
  });
});
