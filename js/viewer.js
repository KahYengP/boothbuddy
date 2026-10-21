/* Photo viewer: opens a photo full screen.
   - Left and right arrows (buttons, keyboard arrows, or swipe) show the previous and next photo
   - Zoom with the + and - buttons, the mouse wheel, a double click, or two fingers
   - When zoomed in, drag to move around the photo
   - Esc or the X closes it

   Use: BB.viewer.open([{ src: "a.jpg", fallback: "a.svg", caption: "Venue photo" }, ...], startIndex) */
BB.viewer = { list: [], i: 0, z: 1, x: 0, y: 0, MAX: 4 };

BB.viewer.open = function (list, start) {
  var V = BB.viewer;
  V.list = list; V.i = start || 0;
  var el = document.createElement("div");
  el.className = "pv";
  el.setAttribute("role", "dialog");
  el.setAttribute("aria-modal", "true");
  el.setAttribute("aria-label", "Photo viewer");
  el.innerHTML =
    '<div class="pv-top"><span class="pv-count" id="pv-count"></span><span class="pv-cap" id="pv-cap"></span>' +
      '<div class="pv-tools"><button class="pv-btn" data-pv="out" aria-label="Zoom out">' + BB.icon("zoomOut", 20) + '</button>' +
      '<button class="pv-zoom" data-pv="fit" id="pv-zoom" title="Fit to screen">100%</button>' +
      '<button class="pv-btn" data-pv="in" aria-label="Zoom in">' + BB.icon("zoomIn", 20) + '</button>' +
      '<button class="pv-btn" data-pv="close" aria-label="Close">' + BB.icon("x", 20) + "</button></div></div>" +
    '<div class="pv-stage" id="pv-stage"><img class="pv-img" id="pv-img" alt="" draggable="false"></div>' +
    '<button class="pv-arrow prev" data-pv="prev" aria-label="Previous photo">' + BB.icon("chevLeft", 26) + "</button>" +
    '<button class="pv-arrow next" data-pv="next" aria-label="Next photo">' + BB.icon("chevRight", 26) + "</button>" +
    '<div class="pv-thumbs" id="pv-thumbs">' + list.map(function (p, n) {
      return '<button class="pv-thumb" data-pvi="' + n + '" aria-label="Photo ' + (n + 1) + '"><img src="' + p.src + '" alt="" onerror="this.onerror=null;this.src=\'' + (p.fallback || p.src) + '\'"></button>';
    }).join("") + "</div>" +
    '<p class="pv-hint">Scroll or double click to zoom · drag to move · arrow keys for next photo</p>';
  document.body.appendChild(el);
  document.body.classList.add("pv-open");
  V.el = el;
  V.img = el.querySelector("#pv-img");
  V.stage = el.querySelector("#pv-stage");
  V.wire();
  V.show(V.i);
  el.querySelector('[data-pv="close"]').focus();
};

BB.viewer.close = function () {
  var V = BB.viewer;
  if (!V.el) { return; }
  V.el.remove(); V.el = null;
  document.body.classList.remove("pv-open");
  document.removeEventListener("keydown", V.onKey);
};

BB.viewer.show = function (n) {
  var V = BB.viewer, total = V.list.length, p;
  V.i = (n + total) % total;
  p = V.list[V.i];
  V.img.onerror = function () { V.img.onerror = null; if (p.fallback) { V.img.src = p.fallback; } };
  V.img.src = p.src;
  V.el.querySelector("#pv-count").textContent = (V.i + 1) + " / " + total;
  V.el.querySelector("#pv-cap").textContent = p.caption || "";
  V.el.querySelectorAll(".pv-thumb").forEach(function (t, k) { t.classList.toggle("is-on", k === V.i); });
  V.el.classList.toggle("is-single", total < 2);
  V.zoom(1, true);
};

/* z = zoom level. cx, cy = the screen point to zoom around (optional) */
BB.viewer.zoom = function (z, reset, cx, cy) {
  var V = BB.viewer, old = V.z;
  z = Math.max(1, Math.min(V.MAX, z));
  if (reset || z === 1) { V.x = 0; V.y = 0; }
  else if (cx !== undefined) {
    var r = V.stage.getBoundingClientRect(), ox = cx - (r.left + r.width / 2), oy = cy - (r.top + r.height / 2);
    V.x = ox - (ox - V.x) * (z / old);
    V.y = oy - (oy - V.y) * (z / old);
  }
  V.z = z;
  V.clamp(); V.apply();
};

/* keep the zoomed photo from sliding off screen */
BB.viewer.clamp = function () {
  var V = BB.viewer, w = V.img.offsetWidth * V.z, h = V.img.offsetHeight * V.z, r = V.stage.getBoundingClientRect();
  var mx = Math.max(0, (w - r.width) / 2), my = Math.max(0, (h - r.height) / 2);
  V.x = Math.max(-mx, Math.min(mx, V.x));
  V.y = Math.max(-my, Math.min(my, V.y));
};

BB.viewer.apply = function () {
  var V = BB.viewer;
  V.img.style.transform = "translate(" + V.x + "px," + V.y + "px) scale(" + V.z + ")";
  V.el.querySelector("#pv-zoom").textContent = Math.round(V.z * 100) + "%";
  V.el.classList.toggle("is-zoomed", V.z > 1);
  V.el.querySelector('[data-pv="out"]').disabled = V.z <= 1;
  V.el.querySelector('[data-pv="in"]').disabled = V.z >= V.MAX;
};

BB.viewer.wire = function () {
  var V = BB.viewer, el = V.el, stage = V.stage;

  el.addEventListener("click", function (e) {
    var b = e.target.closest("[data-pv]"), t = e.target.closest("[data-pvi]");
    if (t) { V.show(parseInt(t.getAttribute("data-pvi"), 10)); return; }
    if (!b) { if (e.target === el || e.target === stage) { if (V.z === 1 && !V.moved) { V.close(); } } return; }
    var a = b.getAttribute("data-pv");
    if (a === "close") { V.close(); }
    else if (a === "prev") { V.show(V.i - 1); }
    else if (a === "next") { V.show(V.i + 1); }
    else if (a === "in") { V.zoom(V.z + 0.5); }
    else if (a === "out") { V.zoom(V.z - 0.5); }
    else if (a === "fit") { V.zoom(1, true); }
  });

  V.onKey = function (e) {
    if (e.key === "Escape") { V.close(); }
    else if (e.key === "ArrowLeft") { V.show(V.i - 1); }
    else if (e.key === "ArrowRight") { V.show(V.i + 1); }
    else if (e.key === "+" || e.key === "=") { V.zoom(V.z + 0.5); }
    else if (e.key === "-") { V.zoom(V.z - 0.5); }
  };
  document.addEventListener("keydown", V.onKey);

  stage.addEventListener("wheel", function (e) {
    e.preventDefault();
    V.zoom(V.z * (e.deltaY < 0 ? 1.15 : 1 / 1.15), false, e.clientX, e.clientY);
  }, { passive: false });

  V.img.addEventListener("dblclick", function (e) {
    if (V.z > 1) { V.zoom(1, true); } else { V.zoom(2.5, false, e.clientX, e.clientY); }
  });

  /* drag to move when zoomed, swipe to change photo when not, two fingers to zoom */
  var pts = {}, start = null, pinch = null;
  stage.addEventListener("pointerdown", function (e) {
    pts[e.pointerId] = { x: e.clientX, y: e.clientY };
    stage.setPointerCapture(e.pointerId);
    V.el.classList.add("is-drag");
    var ids = Object.keys(pts);
    V.moved = false;
    if (ids.length === 2) {
      var a = pts[ids[0]], b = pts[ids[1]];
      pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), z: V.z, cx: (a.x + b.x) / 2, cy: (a.y + b.y) / 2 };
      start = null;
    } else {
      start = { x: e.clientX, y: e.clientY, ox: V.x, oy: V.y };
    }
  });
  stage.addEventListener("pointermove", function (e) {
    if (!pts[e.pointerId]) { return; }
    pts[e.pointerId] = { x: e.clientX, y: e.clientY };
    var ids = Object.keys(pts);
    if (pinch && ids.length === 2) {
      var a = pts[ids[0]], b = pts[ids[1]];
      V.zoom(pinch.z * Math.hypot(a.x - b.x, a.y - b.y) / pinch.d, false, pinch.cx, pinch.cy);
      V.moved = true;
      return;
    }
    if (!start) { return; }
    var dx = e.clientX - start.x, dy = e.clientY - start.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) { V.moved = true; }
    if (V.z > 1) { V.x = start.ox + dx; V.y = start.oy + dy; V.clamp(); V.apply(); }
  });
  var end = function (e) {
    if (start && V.z === 1 && e.type === "pointerup") {
      var dx = e.clientX - start.x;
      if (Math.abs(dx) > 60 && V.list.length > 1) { V.show(V.i + (dx < 0 ? 1 : -1)); }
    }
    delete pts[e.pointerId];
    if (Object.keys(pts).length < 2) { pinch = null; }
    if (!Object.keys(pts).length) { start = null; if (V.el) { V.el.classList.remove("is-drag"); } setTimeout(function () { V.moved = false; }, 0); }
  };
  stage.addEventListener("pointerup", end);
  stage.addEventListener("pointercancel", end);

  window.addEventListener("resize", function () { if (V.el) { V.clamp(); V.apply(); } });
};
