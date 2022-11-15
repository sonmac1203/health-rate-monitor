$(() => {
  if (!window.localStorage.getItem('token')) {
    window.location.replace('unauthorized.html');
  }

  $('#btnLogOut').click(logout);

  (async () => {
    const response = await axios.get('/api/auth', {
      headers: { 'x-auth': window.localStorage.getItem('token') },
    });
    console.log(response.data);
    if (response.data.success) {
    } else {
      window.location.replace('unauthorized.html');
    }
  })();
});

function logout() {
  localStorage.removeItem('token');
  window.location.replace('index.html');
}
