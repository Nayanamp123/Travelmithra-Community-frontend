const loginCard = document.getElementById('login-card');
const registerCard = document.getElementById('register-card');
const authSection = document.getElementById('auth-section');
const dashboardSection = document.getElementById('dashboard');
const profileName = document.getElementById('profile-name');
const showLoginButton = document.getElementById('show-login');
const showRegisterButton = document.getElementById('show-register');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

showLoginButton.addEventListener('click', () => {
  loginCard.classList.remove('hidden');
  registerCard.classList.add('hidden');
  loginCard.scrollIntoView({ behavior: 'smooth' });
});

showRegisterButton.addEventListener('click', () => {
  registerCard.classList.remove('hidden');
  loginCard.classList.add('hidden');
  registerCard.scrollIntoView({ behavior: 'smooth' });
});

loginForm.addEventListener('submit', event => {
  event.preventDefault();
  const email = document.getElementById('login-email').value;
  const name = email.split('@')[0] || 'Traveler';
  profileName.textContent = name;
  authSection.classList.add('hidden');
  dashboardSection.classList.remove('hidden');
});

registerForm.addEventListener('submit', event => {
  event.preventDefault();
  const name = document.getElementById('register-name').value || 'Traveler';
  profileName.textContent = name;
  authSection.classList.add('hidden');
  dashboardSection.classList.remove('hidden');
});

// Default initial state
registerCard.classList.add('hidden');
