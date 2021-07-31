export function isLogin() {
  const token = sessionStorage.getItem('token') || '';
  return token !== '';
}