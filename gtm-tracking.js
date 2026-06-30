// GTM conversion tracking
// Pushes phone_call_click events to dataLayer when any tel: link is clicked
(function () {
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href^="tel:"]');
    if (!link) return;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'phone_call_click',
      phone_number: link.href.replace('tel:', ''),
      link_text: link.textContent.trim(),
      page: window.location.pathname
    });
  });
})();
