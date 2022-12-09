$(() => {
  const headerRightNav = $('.header-right-nav');
  const logInButton = $('<a>', {
    class: 'nav-link',
    href: '/login.html',
    text: 'Log In',
  });
  const logOutButton = $('<span>', {
    class: 'nav-link',
    text: 'Log out',
    style: 'cursor: pointer',
  });

  logOutButton.click(logout);

  if (!window.localStorage.getItem('token')) {
    headerRightNav.append(logInButton);
  } else {
    if (!window.localStorage.getItem('loggedIn')) {
      (async () => {
        const response = await axios.get('/api/auth_home', {
          headers: { 'x-auth': window.localStorage.getItem('token') },
        });
        if (!response.data.success) {
          headerRightNav.append(logInButton);
        } else {
          localStorage.setItem('loggedIn', true);
          headerRightNav.append(logOutButton);
        }
      })();
    } else {
      headerRightNav.append(logOutButton);
    }
  }
});

function logout() {
  localStorage.removeItem('token');
  window.location.replace('index.html');
}
