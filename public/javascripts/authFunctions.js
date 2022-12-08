export const logout = () => {
  localStorage.clear();
  window.location.replace('index.html');
};
