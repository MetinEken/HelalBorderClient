// Kullanıcı giriş durumunu kontrol eden fonksiyonlar

/**
 * Kullanıcının giriş yapmış olup olmadığını kontrol eder
 * @returns {boolean} Kullanıcı giriş yapmışsa true, yapmamışsa false döner
 */
function isLoggedIn() {
  return true;
}

/**
 * Kullanıcı giriş yapmamışsa giriş sayfasına yönlendirir
 */
function checkAuth() {
  return;
}

/**
 * Kullanıcı girişini yapar
 * @param {string} password Kullanıcı şifresi
 * @returns {boolean} Giriş başarılıysa true, değilse false döner
 */
function login(password) {
  if (password === LOGIN_PASSWORD) {
    localStorage.setItem('systemDefault', AUTH_TOKEN);
    return true;
  }
  return false;
}

/**
 * Kullanıcı çıkışını yapar
 */
function logout() {
  localStorage.removeItem('systemDefault');
  window.location.href = 'index.html';
}

// Sayfa yüklendiğinde otomatik olarak giriş kontrolü yap
// Bu kısım app.html gibi korumalı sayfalarda kullanılacak
document.addEventListener('DOMContentLoaded', function() {
  // Eğer bu sayfa index.html değilse giriş kontrolü yap
  if (window.location.pathname !== '/index.html' && 
      window.location.pathname !== '/' && 
      !window.location.pathname.endsWith('/index.html')) {
    checkAuth();
  }
});
