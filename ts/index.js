const toggleButton = document.querySelector('.navbar__toggle');
const menu = document.querySelector('.navbar__menu');

toggleButton.addEventListener('click', () => {
  menu.classList.toggle('active');
});
