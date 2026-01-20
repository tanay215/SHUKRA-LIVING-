// Debug localStorage - paste this in browser console
console.log('=== LocalStorage Debug ===');
console.log('All localStorage keys:', Object.keys(localStorage));
console.log('auth_token:', localStorage.getItem('auth_token'));
console.log('token:', localStorage.getItem('token'));
console.log('user:', localStorage.getItem('user'));
console.log('token_expiry:', localStorage.getItem('token_expiry'));
console.log('is_admin:', localStorage.getItem('is_admin'));

// Test AuthUtils
console.log('=== AuthUtils Test ===');
console.log('AuthUtils.getToken():', window.AuthUtils?.getToken());
console.log('AuthUtils.isAuthenticated():', window.AuthUtils?.isAuthenticated());

// Manual token test
const testToken = localStorage.getItem('token') || localStorage.getItem('auth_token');
if (testToken) {
  console.log('Found token, testing API call...');
  fetch('http://localhost:30011/api/users/orders', {
    headers: { 'Authorization': `Bearer ${testToken}` }
  })
  .then(r => r.json())
  .then(data => console.log('API test result:', data))
  .catch(err => console.error('API test error:', err));
}