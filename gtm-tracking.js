// Conversion tracking — loaded on every page.
//
// Every event goes to two places through one helper, so nothing is counted twice:
//   1. GTM dataLayer (existing event names kept, so current GTM tags keep working)
//   2. Vercel Web Analytics custom events (window.va), shown under Events in Vercel
//
// Events:
//   phone_call_click   any tel: link            { location, page }
//   portfolio_click    any link to the portfolio { location, destination, page }
//   form_start         first input in a tracked form (once per form per page view)
//   form_submission    lead accepted by the server   (fired by the form's own code)
//   form_submit_failed lead NOT delivered            (fired by the form's own code)
//
// No visitor-entered values (names, phone numbers, emails) are ever sent.
(function () {
  window.dataLayer = window.dataLayer || [];
  window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };

  function page() { return window.location.pathname; }

  // Where on the page the click happened: an explicit data-track-location,
  // else the id of the enclosing section/nav/footer.
  function locationOf(el) {
    var tagged = el.closest('[data-track-location]');
    if (tagged) return tagged.getAttribute('data-track-location');
    var region = el.closest('section[id], nav[id], footer[id], header[id], [id="mobileMenu"]');
    return region ? region.id : 'unknown';
  }

  function track(name, data) {
    data = data || {};
    if (!data.page) data.page = page();
    var dl = { event: name };
    for (var k in data) if (Object.prototype.hasOwnProperty.call(data, k)) dl[k] = data[k];
    window.dataLayer.push(dl);
    try { window.va('event', { name: name, data: data }); } catch (e) { /* analytics must never break the page */ }
  }
  window.aiTrack = track;

  document.addEventListener('click', function (e) {
    var link = e.target.closest && e.target.closest('a[href]');
    if (!link) return;
    var href = link.getAttribute('href');

    if (href.indexOf('tel:') === 0) {
      track('phone_call_click', {
        phone_number: href.replace('tel:', ''),
        link_text: link.textContent.trim(),
        location: locationOf(link)
      });
      return;
    }

    if (href === '#portfolio') {
      track('portfolio_click', { location: locationOf(link), destination: 'homepage_projects' });
      return;
    }
    if (link.hostname === window.location.hostname &&
        /\/portfolio(\.html)?$/.test(link.pathname)) {
      track('portfolio_click', { location: locationOf(link), destination: 'portfolio_page' });
    }
  });

  // Form start: the first real input (typing, picking an option), not just focus.
  var started = {};
  function onFormInput(e) {
    var form = e.target.closest && e.target.closest('form[data-track-form]');
    if (!form) return;
    var id = form.getAttribute('data-track-form');
    if (started[id]) return;
    started[id] = true;
    track('form_start', { form: id });
  }
  document.addEventListener('input', onFormInput);
  document.addEventListener('change', onFormInput);

  // Scroll depth — shows where mobile visitors drop off before the CTA
  // (GTM only; kept out of Vercel to stay within its custom-event limits)
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
        window.dataLayer.push({ event: 'scroll_depth', percent: m, page: page() });
      }
    }
  }

  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(checkDepth);
  }, { passive: true });
})();
