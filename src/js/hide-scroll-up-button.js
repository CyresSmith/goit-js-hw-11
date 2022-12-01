export { hideScrollUpBtn };

function hideScrollUpBtn() {
  let scroll = window.pageYOffset;

  const scrollUpButton = document.querySelector('.scroll-up-btn');

  if (scroll > 300) {
    scrollUpButton.classList.remove('scroll-up-btn--remove');
  }
  if (scroll < 300) {
    scrollUpButton.classList.add('scroll-up-btn--remove');
  }
}
