(function () {
  var is_media = function (t) {
    return !!(t && t.closest && t.closest('img, video, picture, image-slot, canvas, [data-noimg]'));
  };
  document.addEventListener('contextmenu', function (e) { if (is_media(e.target)) e.preventDefault(); }, { capture: true });
  document.addEventListener('dragstart', function (e) { e.preventDefault(); }, { capture: true });
  document.addEventListener('keydown', function (e) {
    var k = (e.key || '').toLowerCase();
    if ((e.ctrlKey || e.metaKey) && (k === 's' || k === 'p')) e.preventDefault();
  }, { capture: true });
})();
