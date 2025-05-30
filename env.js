// Çevre değişkenleri
let BASE_URL = "https://chat-bot-api-126af91abc14.herokuapp.com";
// let BASE_URL = "http://localhost:8080";

// Geliştirme ortamında CORS sorunlarını önlemek için
// Eğer localhost veya 127.0.0.1 üzerinde çalışıyorsa, CORS proxy kullanabiliriz
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Giriş sistemi için gerekli bilgiler
const LOGIN_PASSWORD = "HelalBorder2025";
const AUTH_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkhlbGFsQm9yZGVyVXNlciIsImlhdCI6MTY4NTEyMzQ1Njc4OSwiZXhwIjoxNzE2NjU5NDU2Nzg5LCJyb2xlIjoiYWRtaW4iLCJwZXJtaXNzaW9ucyI6WyJyZWFkIiwid3JpdGUiLCJ1cGRhdGUiLCJkZWxldGUiXX0.ZXlKaGJHY2lPaUprYVhJaUxDSmxlSEFpT2lKS1YxUWlmUT09";

// Service start
//python -m http.server 8080