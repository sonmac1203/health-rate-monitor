const navigationChips = $('.navigation-chip');
const mobileNavigationChips = $('.mobile-navigation-chip');
const masterCards = $('.master-cards');

navigationChips.click(function () {
  const chipId = $(this).attr('id');
  const correspondingCard = $(`#${chipId.replace('nav-chip', 'card')}`);
  navigationChips.removeClass('navigation-chip-active');
  mobileNavigationChips.removeClass('navigation-chip-active');
  $(this).addClass('navigation-chip-active');
  $(`#${chipId}-mobile`).addClass('navigation-chip-active');

  masterCards.addClass('hidden');
  correspondingCard.removeClass('hidden');
});

mobileNavigationChips.click(function () {
  const chipId = $(this).attr('id');
  const correspondingCard = $(`#${chipId.replace('nav-chip-mobile', 'card')}`);
  mobileNavigationChips.removeClass('navigation-chip-active');
  navigationChips.removeClass('navigation-chip-active');
  $(this).addClass('navigation-chip-active');
  $(`#${chipId.replace('-mobile', '')}`).addClass('navigation-chip-active');
  masterCards.addClass('hidden');
  correspondingCard.removeClass('hidden');
});
