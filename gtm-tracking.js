// GTM conversion tracking
(function () {
  function push(payload) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);
  }

  // Phone call clicks — any tel: link, anywhere on the page
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href^="tel:"]');
    if (!link) return;
    push({
      event: 'phone_call_click',
      phone_number: link.href.replace('tel:', ''),
      link_text: link.textContent.trim(),
      page: window.location.pathname
    });
  });

  // Scroll depth — shows where mobile visitors drop off before the CTA
  var marks = [25, 50, 75, 90];
  var fired = {};
  var ticking = false;

  function checkDepth() {
    ticking = false;
    var doc = document.documentElement;
    var scrollable = doc.scrollHeight - window.innerHeight;
    if (scrollable <= 0) return;
    var pct = (window.pageYOffset / scrollable) * 100;
    for (var i = 0; i < marks.length; i++) {
      var m = marks[i];
      if (pct >= m && !fired[m]) {
        fired[m] = true;
        push({ event: 'scroll_depth', percent: m, page: window.location.pathname });
      }
    }
  }

  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(checkDepth);
  }, { passive: true });
})();
