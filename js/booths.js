/* =========================================================
   Booth types: amenity list, small 2D floor plan, 3D preview.
   Used by Event Detail (all three) and Apply (2D plan + amenities).
   1 unit in 3D = 1 metre.
   ========================================================= */

BB.icons.chair = '<path d="M7 3v9M17 3v9M7 7h10"/><rect x="5" y="12" width="14" height="3" rx="1"/><path d="M7 15v6M17 15v6"/>';
BB.icons.table = '<path d="M3 9h18M5 9v11M19 9v11M3 9l2-3h14l2 3"/>';
BB.icons.bulb = '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z"/>';
BB.icons.plug = '<path d="M9 3v5M15 3v5M6 8h12v3a6 6 0 0 1-12 0zM12 17v4"/>';
BB.icons.water = '<path d="M3 9c2-2 4-2 6 0s4 2 6 0 4-2 6 0M3 15c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/>';
BB.icons.sink = '<path d="M4 11h16v2a6 6 0 0 1-6 6h-4a6 6 0 0 1-6-6zM12 11V6a2 2 0 0 1 4 0"/>';
BB.icons.booth = '<rect x="3" y="4" width="18" height="16" rx="1.5"/><path d="M3 9h18M7 9v11M17 9v11"/>';
BB.icons.file = '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>';
BB.icons.upload = '<path d="M12 16V4M7 9l5-5 5 5M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/>';
BB.icons.trash = BB.icons.trash || '<path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13"/>';
BB.icons.corner = '<path d="M4 4h16v16"/><path d="M4 4v16h16" stroke-dasharray="3 3"/>';

/* ---------- What comes with a booth ---------- */
BB.amenities = function (t) {
  var out = [
    { i: "booth", t: t.w + "m x " + t.d + "m booth" },
    { i: "ruler", t: t.h + "m panel height" },
    { i: "chair", t: t.chairs + " chairs" },
    { i: "table", t: "Table (" + t.table + ")" },
    { i: "bulb", t: "Basic lighting, 2 spotlights" }
  ];
  t.power.forEach(function (p) { out.push({ i: "plug", t: "Power point, 1 x " + p }); });
  if (!t.power.length) { out.push({ i: "plug", t: "No power point" }); }
  if (t.water) { out.push({ i: "water", t: "Water point" }); }
  if (t.sink) { out.push({ i: "sink", t: "1 x sink" }); }
  if (t.open === 2) { out.push({ i: "corner", t: "Open on 2 sides" }); }
  return out;
};

BB.amenityHtml = function (t, small) {
  return '<ul class="amenities' + (small ? " small" : "") + '">' + BB.amenities(t).map(function (a) {
    return '<li><span class="am-ic">' + BB.icon(a.i, small ? 15 : 17) + "</span>" + a.t + "</li>";
  }).join("") + "</ul>";
};

/* ---------- Small 2D floor plan (top view, front = aisle at the bottom) ----------
   n = how many booths joined side by side (the panels between them are taken out). */
BB.boothPlanSvg = function (t, n) {
  n = n || 1;
  var S = n > 2 ? 40 : (n > 1 ? 50 : 64), uw = t.w * S, W = uw * n, D = t.d * S, L = 54, T = 46, out = "";
  var vbW = W + L + 40, vbH = D + T + 54;
  out += '<svg class="bp-svg" viewBox="0 0 ' + vbW + " " + vbH + '" role="img" aria-label="Floor plan of ' + (n > 1 ? n + " joined " : "") + t.label + '">';
  out += '<defs><pattern id="bp-grid" width="' + (S / 2) + '" height="' + (S / 2) + '" patternUnits="userSpaceOnUse"><path d="M' + (S / 2) + ' 0H0V' + (S / 2) + '" fill="none" class="bp-gridline"/></pattern></defs>';
  out += '<rect class="bp-floor" x="' + L + '" y="' + T + '" width="' + W + '" height="' + D + '"/><rect x="' + L + '" y="' + T + '" width="' + W + '" height="' + D + '" fill="url(#bp-grid)"/>';
  /* walls: back and left always, right unless it is a corner booth */
  out += '<rect class="bp-wall" x="' + (L - 5) + '" y="' + (T - 5) + '" width="' + (W + 10) + '" height="5"/>';
  out += '<rect class="bp-wall" x="' + (L - 5) + '" y="' + T + '" width="5" height="' + D + '"/>';
  if (t.open !== 2) { out += '<rect class="bp-wall" x="' + (L + W) + '" y="' + T + '" width="5" height="' + D + '"/>'; }
  out += '<line class="bp-front" x1="' + L + '" y1="' + (T + D) + '" x2="' + (L + W) + '" y2="' + (T + D) + '"/>';
  if (t.open === 2) { out += '<line class="bp-front" x1="' + (L + W) + '" y1="' + T + '" x2="' + (L + W) + '" y2="' + (T + D) + '"/><text class="bp-side" x="' + (L + W + 14) + '" y="' + (T + D / 2) + '" transform="rotate(90 ' + (L + W + 14) + " " + (T + D / 2) + ')" text-anchor="middle">OPEN SIDE</text>'; }
  out += '<text class="bp-aisle" x="' + (L + W / 2) + '" y="' + (T + D + (n > 1 ? 30 : 22)) + '" text-anchor="middle">FRONT · AISLE</text>';
  for (var u = 0; u < n; u++) {
    var ox = L + u * uw;
    /* where two booths meet: no panel, just a dashed line on the floor */
    if (u > 0) { out += '<line class="bp-join" x1="' + ox + '" y1="' + T + '" x2="' + ox + '" y2="' + (T + D) + '"/>'; }
    if (n > 1) { out += '<text class="bp-unit" x="' + (ox + uw / 2) + '" y="' + (T + D + 12) + '" text-anchor="middle">BOOTH ' + (u + 1) + "</text>"; }
    if (t.sink) {
      out += '<g class="bp-sink"><rect x="' + (ox + 6) + '" y="' + (T + 4) + '" width="' + (0.6 * S) + '" height="' + (0.5 * S) + '" rx="4"/><rect class="bowl" x="' + (ox + 6 + 0.12 * S) + '" y="' + (T + 4 + 0.1 * S) + '" width="' + (0.36 * S) + '" height="' + (0.3 * S) + '" rx="5"/></g>';
      if (u === 0) { out += '<text class="bp-tag" x="' + (ox + 6 + 0.3 * S) + '" y="' + (T + 0.5 * S + 18) + '" text-anchor="middle">Sink</text>'; }
    }
    if (t.water) { out += '<g class="bp-water" transform="translate(' + (ox + 0.95 * S) + "," + (T + 2) + ')"><circle r="7"/><path d="M0 -4 C 3 0, 3 3, 0 4 C -3 3, -3 0, 0 -4z"/></g>'; }
    t.power.forEach(function (p, i) {
      var x = ox + uw - 0.35 * S - i * 0.55 * S;
      out += '<g class="bp-power" transform="translate(' + x + "," + (T + 2) + ')"><rect x="-9" y="-7" width="18" height="14" rx="3"/><path d="M1 -5 L-3 1 L0 1 L-1 5 L3 -1 L0 -1 Z"/></g>';
    });
    if (u === n - 1 && t.power.length) { out += '<text class="bp-tag" x="' + (ox + uw - 0.35 * S - (t.power.length - 1) * 0.275 * S) + '" y="' + (T + 22) + '" text-anchor="middle">' + t.power.join(" + ") + "</text>"; }
    /* workshop: class table in the middle with seats on both long sides, facing each other.
       other booths: counter at the front with the seller's chairs behind it. */
    var ws = t.cat === "workshop";
    var tw = t.tw * S, td = t.td * S, tx = ox + (uw - tw) / 2, ty = ws ? T + (D - td) / 2 : T + D - td - 0.22 * S;
    out += '<rect class="bp-table" x="' + tx + '" y="' + ty + '" width="' + tw + '" height="' + td + '" rx="3"/>';
    var row = ws ? Math.ceil(t.chairs / 2) : Math.min(t.chairs, t.tw > 1.5 ? 3 : 2);
    for (var i = 0; i < t.chairs; i++) {
      var r = Math.floor(i / row), k = i % row;
      var cx = tx + tw * (k + 1) / (row + 1);
      var cy = ws ? (r === 0 ? ty - 0.28 * S : ty + td + 0.28 * S) : (r === 0 ? ty - 0.28 * S : ty - 0.62 * S);
      out += '<circle class="bp-chair" cx="' + cx + '" cy="' + cy + '" r="' + (0.17 * S) + '"/>';
    }
  }
  /* dimensions: total width on top, depth on the left */
  out += '<g class="bp-dim"><line x1="' + L + '" y1="' + (T - 24) + '" x2="' + (L + W) + '" y2="' + (T - 24) + '"/><line x1="' + L + '" y1="' + (T - 30) + '" x2="' + L + '" y2="' + (T - 18) + '"/><line x1="' + (L + W) + '" y1="' + (T - 30) + '" x2="' + (L + W) + '" y2="' + (T - 18) + '"/>' +
    '<text x="' + (L + W / 2) + '" y="' + (T - 30) + '" text-anchor="middle">' + t.w * n + " m" + (n > 1 ? " (" + n + " x " + t.w + " m)" : "") + "</text>" +
    '<line x1="' + (L - 24) + '" y1="' + T + '" x2="' + (L - 24) + '" y2="' + (T + D) + '"/><line x1="' + (L - 30) + '" y1="' + T + '" x2="' + (L - 18) + '" y2="' + T + '"/><line x1="' + (L - 30) + '" y1="' + (T + D) + '" x2="' + (L - 18) + '" y2="' + (T + D) + '"/>' +
    '<text x="' + (L - 30) + '" y="' + (T + D / 2) + '" text-anchor="middle" transform="rotate(-90 ' + (L - 30) + " " + (T + D / 2) + ')">' + t.d + " m</text></g>";
  return out + "</svg>";
};

/* ---------- 3D preview of a booth, in a soft isometric "diorama" style ----------
   Floating plinth, thick rounded walls, toy-like rounded furniture, warm light.
   The wall nearest the camera is cut down (like a dollhouse) so you can always see inside. */
BB.Booth3D = {
  t: null, n: 1, ok: false,

  init: function (host) {
    var me = this;
    me.host = host;
    try { me.r = new THREE.WebGLRenderer({ antialias: true, alpha: true }); } catch (e) { me.ok = false; return false; }
    me.ok = true;
    var r = me.r;
    r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
    r.outputEncoding = THREE.sRGBEncoding;
    if (THREE.ColorManagement) { THREE.ColorManagement.legacyMode = false; }
    host.appendChild(r.domElement);
    me.scene = new THREE.Scene();
    me.cam = new THREE.OrthographicCamera(-5, 5, 5, -5, 0.1, 100);
    me.scene.add(new THREE.HemisphereLight(0xFFF8F0, 0xE8D8D0, 0.62));
    me.scene.add(new THREE.AmbientLight(0xFFFFFF, 0.12));
    me.sun = new THREE.DirectionalLight(0xFFF1E4, 0.95);
    me.sun.castShadow = true; me.sun.shadow.mapSize.set(2048, 2048); me.sun.shadow.radius = 6; me.sun.shadow.bias = -0.0006; me.sun.shadow.normalBias = 0.02;
    me.scene.add(me.sun); me.scene.add(me.sun.target);
    var fill = new THREE.DirectionalLight(0xE6E0FF, 0.25); fill.position.set(8, 5, -4); me.scene.add(fill);
    me.group = new THREE.Group(); me.scene.add(me.group);
    me.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg"); me.svg.setAttribute("class", "b3-lines"); host.appendChild(me.svg);
    me.pins = document.createElement("div"); me.pins.className = "b3-pins"; host.appendChild(me.pins);
    me.measure = false;
    /* "Measure" button, top left: shows width, depth and height as dimension lines */
    var mb = document.createElement("button"); mb.type = "button"; mb.className = "b3-measure"; mb.innerHTML = BB.icon("ruler", 15) + "<span>Measure</span>";
    mb.addEventListener("pointerdown", function (e) { e.stopPropagation(); });
    mb.addEventListener("click", function () { me.measure = !me.measure; mb.classList.toggle("is-on", me.measure); me.drawPins(); });
    /* "Walls" switch: some booths are just a floor space with no panels */
    me.wallsOn = true;
    var wb = document.createElement("button"); wb.type = "button"; wb.className = "b3-measure b3-walls is-on"; wb.setAttribute("aria-pressed", "true");
    var wlabel = function () { wb.innerHTML = '<span class="b3-sw"><i></i></span><span>Walls ' + (me.wallsOn ? "on" : "off") + "</span>"; };
    wlabel();
    wb.addEventListener("pointerdown", function (e) { e.stopPropagation(); });
    wb.addEventListener("click", function () { me.wallsOn = !me.wallsOn; wb.classList.toggle("is-on", me.wallsOn); wb.setAttribute("aria-pressed", String(me.wallsOn)); wlabel(); });
    var tools = document.createElement("div"); tools.className = "b3-tools"; tools.appendChild(mb); tools.appendChild(wb);
    host.appendChild(tools);
    me.theta = 0.62; me.phi = 0.98; me.zoom = 1; me.auto = true;

    var el = r.domElement, drag = null;
    el.addEventListener("pointerdown", function (e) { drag = { x: e.clientX, y: e.clientY }; me.auto = false; el.setPointerCapture(e.pointerId); el.style.cursor = "grabbing"; });
    el.addEventListener("pointermove", function (e) {
      if (!drag) { return; }
      me.theta -= (e.clientX - drag.x) * 0.008; me.phi = Math.max(0.3, Math.min(1.4, me.phi - (e.clientY - drag.y) * 0.006));
      drag = { x: e.clientX, y: e.clientY };
    });
    el.addEventListener("pointerup", function () { drag = null; el.style.cursor = "grab"; });
    el.addEventListener("wheel", function (e) { e.preventDefault(); me.zoom = Math.max(0.7, Math.min(2, me.zoom * (e.deltaY > 0 ? 0.92 : 1.08))); me.resize(); }, { passive: false });
    me.resize();
    if (window.ResizeObserver) { new ResizeObserver(function () { me.resize(); }).observe(host); }
    me.loop();
    return true;
  },

  resize: function () {
    var me = this, w = me.host.clientWidth, h = me.host.clientHeight; if (!w || !h) { return; }
    me.r.setSize(w, h);
    var half = (me.view || 5) / 2 / me.zoom, a = w / h;
    me.cam.left = -half * a; me.cam.right = half * a; me.cam.top = half; me.cam.bottom = -half;
    me.cam.updateProjectionMatrix();
  },

  /* ---- building blocks ---- */
  mat: function (color, extra) {
    var o = { color: color, roughness: 0.82, metalness: 0 }; for (var k in extra || {}) { o[k] = extra[k]; }
    return new THREE.MeshStandardMaterial(o);
  },
  add: function (mesh, x, y, z, parent) {
    mesh.position.set(x, y, z); mesh.castShadow = true; mesh.receiveShadow = true; (parent || this.group).add(mesh); return mesh;
  },
  /* box with soft rounded edges (base sits at y = 0 of the mesh when fromBase is true) */
  rgeo: function (w, h, d, r, fromBase) {
    var b = Math.max(0.004, Math.min(r || 0.03, w / 2 - 0.002, h / 2 - 0.002, d / 2 - 0.002) * 0.75), rr = b * 0.6;
    var iw = w - 2 * b, ih = h - 2 * b, x = -iw / 2, y = -ih / 2, sh = new THREE.Shape();
    rr = Math.min(rr, iw / 2 - 0.0005, ih / 2 - 0.0005); if (rr < 0) { rr = 0; }
    sh.moveTo(x + rr, y); sh.lineTo(x + iw - rr, y); sh.quadraticCurveTo(x + iw, y, x + iw, y + rr);
    sh.lineTo(x + iw, y + ih - rr); sh.quadraticCurveTo(x + iw, y + ih, x + iw - rr, y + ih);
    sh.lineTo(x + rr, y + ih); sh.quadraticCurveTo(x, y + ih, x, y + ih - rr); sh.lineTo(x, y + rr); sh.quadraticCurveTo(x, y, x + rr, y);
    var g = new THREE.ExtrudeGeometry(sh, { depth: Math.max(0.001, d - 2 * b), bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelSegments: 3, curveSegments: 5 });
    g.center(); if (fromBase) { g.translate(0, h / 2, 0); }
    return g;
  },
  rbox: function (w, h, d, r, m, x, y, z, parent) { return this.add(new THREE.Mesh(this.rgeo(w, h, d, r), m), x, y, z, parent); },
  cyl: function (r1, r2, h, m, x, y, z, seg) { return this.add(new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, seg || 28), m), x, y, z); },
  ball: function (r, m, x, y, z, sx, sy, sz) { var b = this.add(new THREE.Mesh(new THREE.SphereGeometry(r, 24, 16), m), x, y, z); b.scale.set(sx || 1, sy || 1, sz || 1); return b; },

  tex: function (w, h, draw) {
    var cv = document.createElement("canvas"); cv.width = w; cv.height = h; draw(cv.getContext("2d"), w, h);
    var t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4; return t;
  },
  planks: function () {
    if (this._planks) { return this._planks; }
    var t = this.tex(256, 256, function (g, w, h) {
      g.fillStyle = "#EADCC8"; g.fillRect(0, 0, w, h);
      for (var i = 0; i < 4; i++) {
        g.fillStyle = i % 2 ? "#E4D3BC" : "#EEE2D0"; g.fillRect(0, i * 64 + 1, w, 62);
        g.fillStyle = "rgba(120,90,60,0.25)"; g.fillRect(0, i * 64, w, 2);
        g.fillRect((i * 97) % w, i * 64, 2, 64);
      }
    });
    t.wrapS = t.wrapT = THREE.RepeatWrapping; this._planks = t; return t;
  },
  sign: function (text) {
    return this.tex(1024, 160, function (g, w, h) {
      g.fillStyle = "#FBF7F1"; g.fillRect(0, 0, w, h);
      g.fillStyle = "#503A6B"; g.beginPath(); g.arc(90, h / 2, 34, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#FBF7F1"; g.beginPath(); g.arc(90, h / 2, 14, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#2F2236"; g.font = "600 58px Outfit, Arial"; g.textBaseline = "middle"; g.fillText(text, 150, h / 2 + 3);
    });
  },
  poster: function () {
    if (this._poster) { return this._poster; }
    this._poster = this.tex(256, 340, function (g, w, h) {
      var gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#F6D7C6"); gr.addColorStop(1, "#C3A7CB"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      g.fillStyle = "#FFF7EE"; g.beginPath(); g.arc(w / 2, 130, 62, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#503A6B"; g.beginPath(); g.arc(w / 2, 130, 30, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#2F2236"; g.font = "600 34px Outfit, Arial"; g.textAlign = "center"; g.fillText("Your brand", w / 2, 255);
      g.font = "400 22px Outfit, Arial"; g.fillText("here", w / 2, 288);
    });
    return this._poster;
  },

  /* a small rounded potted plant */
  plant: function (x, z, s, M) {
    s = s || 1;
    this.cyl(0.13 * s, 0.1 * s, 0.24 * s, M.pot, x, 0.12 * s, z);
    this.cyl(0.11 * s, 0.11 * s, 0.02, M.soil, x, 0.245 * s, z);
    this.ball(0.15 * s, M.leaf, x, 0.5 * s, z, 1, 1.9, 1);
    this.ball(0.11 * s, M.leaf2, x - 0.12 * s, 0.4 * s, z + 0.03, 1, 1.7, 1);
    this.ball(0.1 * s, M.leaf2, x + 0.11 * s, 0.38 * s, z - 0.02, 1, 1.6, 1);
  },

  /* products on the counter, by seller category */
  goods: function (t, cx, top, cz, M) {
    var me = this;
    if (t.cat === "fnb") {
      me.cyl(0.13, 0.13, 0.02, M.white, cx - 0.3, top + 0.1, cz); me.cyl(0.02, 0.05, 0.1, M.white, cx - 0.3, top + 0.05, cz);
      me.ball(0.1, M.glass, cx - 0.3, top + 0.12, cz, 1, 0.9, 1);
      [[0.1, 0, M.peach], [0.2, 0.06, M.cream], [0.15, -0.08, M.lav]].forEach(function (c) { me.cyl(0.035, 0.028, 0.045, M.oak, cx + c[0], top + 0.023, cz + c[1]); me.ball(0.037, c[2], cx + c[0], top + 0.055, cz + c[1], 1, 0.8, 1); });
      me.rbox(0.14, 0.12, 0.14, 0.02, M.white, cx + 0.42, top + 0.06, cz - 0.02); me.rbox(0.145, 0.03, 0.145, 0.01, M.plum, cx + 0.42, top + 0.06, cz - 0.02);
    } else if (t.cat === "retail") {
      [[-0.3, M.lav], [-0.1, M.peach], [0.1, M.cream]].forEach(function (c, i) { me.rbox(0.16, 0.04, 0.12, 0.012, c[1], cx + c[0], top + 0.02, cz); me.rbox(0.16, 0.04, 0.12, 0.012, c[1], cx + c[0], top + 0.06, cz + 0.005); });
      me.cyl(0.05, 0.06, 0.16, M.pot, cx + 0.38, top + 0.08, cz);
      me.ball(0.05, M.leaf, cx + 0.38, top + 0.2, cz, 1, 1.4, 1);
    } else {
      [-0.5, -0.15, 0.2, 0.55].forEach(function (dx, i) { me.rbox(0.24, 0.01, 0.17, 0.005, [M.lav, M.peach, M.cream, M.lav][i], cx + dx, top + 0.005, cz); me.cyl(0.025, 0.02, 0.06, [M.peach, M.plum, M.leaf, M.peach][i], cx + dx + 0.08, top + 0.03, cz - 0.04); });
    }
  },

  show: function (t, n) {
    var me = this; if (!me.ok) { return; }
    n = n || 1; me.t = t; me.n = n;
    while (me.group.children.length) { me.group.remove(me.group.children[0]); }
    var UW = t.w, W = t.w * n, D = t.d, H = t.h, TH = 0.1, u, i;
    var M = {
      plinth: me.mat(0xF2E9DE), plinthEdge: me.mat(0xE3D4C3),
      floor: new THREE.MeshStandardMaterial({ map: me.planks(), roughness: 0.85 }),
      back: me.mat(0xD9C6E0), side: me.mat(0xF7F1EA), trim: me.mat(0x503A6B, { roughness: 0.6 }),
      rug: me.mat(0xF2C4AE), oak: me.mat(0xD6B38C, { roughness: 0.7 }), white: me.mat(0xFFFDF9),
      cloth: me.mat(0xFFFDF9), plum: me.mat(0x503A6B), lav: me.mat(0xC9B2D6), peach: me.mat(0xF0B49C), cream: me.mat(0xF7E7CF),
      seat: me.mat(0xEE9F86, { roughness: 0.55 }), steel: me.mat(0xDCE0E5, { roughness: 0.25, metalness: 0.7 }),
      pot: me.mat(0xD98B6A), soil: me.mat(0x6B4E3D), leaf: me.mat(0x7DB38D), leaf2: me.mat(0x93C4A0),
      plug: me.mat(0xFFCF5A, { roughness: 0.5 }), water: me.mat(0x6FB2DE, { roughness: 0.35 }),
      glass: me.mat(0xEAF4F8, { transparent: true, opacity: 0.45, roughness: 0.1 }),
      lamp: me.mat(0x3A2F42, { roughness: 0.5 }), glow: me.mat(0xFFF4D6, { emissive: 0xFFE7A8, emissiveIntensity: 0.9 }),
      poster: new THREE.MeshStandardMaterial({ map: me.poster(), roughness: 0.8 })
    };
    me.walls = [];

    /* floating plinth and its soft shadow far below */
    var pad = 0.35, PW = W + pad * 2 + TH, PD = D + pad * 2 + TH;
    me.add(new THREE.Mesh(me.rgeo(PW, 0.22, PD, 0.08), M.plinth), W / 2, -0.11, D / 2 - TH / 2);
    me.add(new THREE.Mesh(me.rgeo(PW - 0.06, 0.05, PD - 0.06, 0.03), M.plinthEdge), W / 2, -0.245, D / 2 - TH / 2);
    var shadowPlane = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.ShadowMaterial({ opacity: 0.14 }));
    shadowPlane.rotation.x = -Math.PI / 2; shadowPlane.position.set(W / 2, -0.9, D / 2); shadowPlane.receiveShadow = true; me.group.add(shadowPlane);
    /* wooden floor and a rug */
    me.planks().repeat.set(W, D);
    me.rbox(W, 0.04, D, 0.01, M.floor, W / 2, 0.02, D / 2);
    var rug = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.012, 48), M.rug);
    rug.scale.set(Math.min(W * 0.42, 1.6), 1, Math.min(D * 0.32, 0.9)); me.add(rug, W / 2, 0.047, D * 0.62);

    var frameStart = me.group.children.length;  /* walls, posts, name board and lights: hidden when Walls is off */
    /* walls: built from the floor up so they can be cut down when they face the camera */
    var wall = function (w, d, m, x, z, normal) {
      var g = new THREE.Group(); g.position.set(x, 0.04, z); me.group.add(g);
      var body = new THREE.Mesh(me.rgeo(w, H, d, 0.05, true), m); body.castShadow = true; body.receiveShadow = true; g.add(body);
      var cap = new THREE.Mesh(me.rgeo(w + 0.01, 0.04, d + 0.01, 0.015), M.trim); cap.position.y = H; cap.castShadow = true; g.add(cap);
      var rec = { g: g, body: body, cap: cap, n: normal, k: 1, items: [] }; me.walls.push(rec); return rec;
    };
    var backW = wall(W + TH * 2, TH, M.back, W / 2, -TH / 2, new THREE.Vector3(0, 0, -1));
    wall(TH, D, M.side, -TH / 2, D / 2, new THREE.Vector3(-1, 0, 0));
    if (t.open !== 2) { wall(TH, D, M.side, W + TH / 2, D / 2, new THREE.Vector3(1, 0, 0)); }

    /* front posts and the name board across the top */
    var posts = t.open === 2 ? [-TH / 2, W] : [-TH / 2, W + TH / 2];
    posts.forEach(function (px) { me.rbox(0.07, H, 0.07, 0.03, M.trim, px, 0.04 + H / 2, D - 0.035); });
    me.rbox(W + TH, 0.3, 0.08, 0.04, M.white, W / 2, H - 0.11, D - 0.04);
    var label = new THREE.Mesh(new THREE.PlaneGeometry(Math.min(W, 3.6) * 0.92, 0.22), new THREE.MeshStandardMaterial({ map: me.sign(t.label + "  ·  " + W + "m x " + D + "m"), roughness: 0.8 }));
    me.add(label, W / 2, H - 0.11, D + 0.002);
    me.frame = me.group.children.slice(frameStart);

    me.pinList = [];
    var pin = function (txt, icon, px, py, pz, cls) { me.pinList.push({ v: new THREE.Vector3(px, py, pz), label: txt, icon: icon, cls: cls || "" }); };

    for (u = 0; u < n; u++) {
      var ox = u * UW, cx = ox + UW / 2;
      if (u > 0) { me.rbox(0.03, 0.006, D, 0.002, M.plinthEdge, ox, 0.043, D / 2); }
      /* spotlights clipped to the top of the name board, pointing into the booth.
         (They used to hang under the board, where they covered the booth name and showed as dark blobs
         with a white smear on the side wall.) */
      var lampStart = me.group.children.length;
      [ox + UW * 0.28, ox + UW * 0.72].forEach(function (lx) {
        me.rbox(0.03, 0.03, 0.2, 0.01, M.lamp, lx, H + 0.07, D - 0.14);
        var head = me.cyl(0.045, 0.06, 0.12, M.lamp, lx, H + 0.03, D - 0.26); head.rotation.x = 0.6;
        var lens = me.cyl(0.042, 0.042, 0.012, M.glow, lx, H + 0.03 - 0.054, D - 0.26 - 0.037); lens.rotation.x = 0.6; lens.castShadow = false;
      });
      me.frame = me.frame.concat(me.group.children.slice(lampStart));
      /* counter at the front: white base, oak top, plum runner */
      var ws = t.cat === "workshop";
      var tw = t.tw, td = t.td, tz = ws ? D / 2 : D - td / 2 - 0.25;
      if (ws) {
        /* open class table on four legs, so people can sit on both sides */
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (c) { me.rbox(0.05, 0.7, 0.05, 0.015, M.steel, cx + c[0] * (tw / 2 - 0.08), 0.04 + 0.35, tz + c[1] * (td / 2 - 0.08)); });
      } else {
        me.rbox(tw, 0.7, td, 0.04, M.cloth, cx, 0.04 + 0.35, tz);
        me.rbox(0.28, 0.6, 0.012, 0.004, M.plum, cx, 0.04 + 0.37, tz + td / 2 + 0.006);
      }
      me.rbox(tw + 0.06, 0.05, td + 0.06, 0.02, M.oak, cx, 0.04 + 0.725, tz);
      me.goods(t, cx, 0.04 + 0.75, tz, M);
      /* chairs behind the counter: rounded seat on a steel stem */
      /* workshop: half the seats behind the table, half in front, facing each other */
      var row = ws ? Math.ceil(t.chairs / 2) : Math.min(t.chairs, tw > 1.5 ? 3 : 2);
      for (i = 0; i < t.chairs; i++) {
        var rr = Math.floor(i / row), k = i % row, chx = cx - tw / 2 + tw * (k + 1) / (row + 1);
        var face = ws && rr === 1 ? -1 : 1;  /* -1 = in front of the table, facing back */
        var chz = face === -1 ? tz + td / 2 + 0.33 : tz - td / 2 - (rr === 0 ? 0.33 : 0.82);
        me.cyl(0.16, 0.17, 0.02, M.steel, chx, 0.05, chz);
        me.cyl(0.02, 0.02, 0.4, M.steel, chx, 0.25, chz, 10);
        me.rbox(0.38, 0.07, 0.36, 0.035, M.seat, chx, 0.47, chz);
        var back = me.rbox(0.36, 0.3, 0.06, 0.03, M.seat, chx, 0.65, chz - 0.17 * face); back.rotation.x = -0.12 * face;
      }
      /* sink cabinet and water point at the back left */
      if (t.sink) {
        me.rbox(0.62, 0.86, 0.5, 0.04, M.white, ox + 0.38, 0.04 + 0.43, 0.3);
        me.rbox(0.66, 0.04, 0.54, 0.015, M.oak, ox + 0.38, 0.04 + 0.88, 0.3);
        me.rbox(0.36, 0.05, 0.28, 0.02, M.steel, ox + 0.38, 0.04 + 0.885, 0.3);
        me.cyl(0.015, 0.015, 0.24, M.steel, ox + 0.38, 0.04 + 1.02, 0.1, 10);
        var sp = me.cyl(0.012, 0.012, 0.13, M.steel, ox + 0.38, 0.04 + 1.13, 0.16, 10); sp.rotation.x = Math.PI / 2;
        if (u === 0) { pin(t.water ? "Sink + water point" : "Sink", "sink", ox + 0.38, 1.2, 0.3); }
      }
      if (t.water) {
        me.rbox(0.09, 0.09, 0.05, 0.02, M.water, ox + 0.85, 0.04 + 0.55, 0.03);
      }
      /* power sockets on the back wall */
      t.power.forEach(function (p, j) { var sk = me.rbox(0.13, 0.13, 0.03, 0.02, M.plug, ox + UW - 0.38 - j * 0.5, 0.04 + 0.42, 0.015); backW.items.push(sk); });
      if (u === n - 1 && t.power.length) { pin(t.power.join(" + ") + " power" + (n > 1 ? " in each booth" : ""), "plug", ox + UW - 0.38 - (t.power.length - 1) * 0.25, 0.6, 0.05); }
      /* wall shelf and a poster, for a lived-in look */
      if (!t.sink || UW >= 3) {
        var shx = t.sink ? ox + UW * 0.58 : ox + UW * 0.36;
        backW.items.push(me.rbox(0.7, 0.04, 0.2, 0.015, M.oak, shx, 1.45, 0.1));
        backW.items.push(me.rbox(0.14, 0.18, 0.12, 0.02, M.peach, shx - 0.2, 1.56, 0.08));
        backW.items.push(me.rbox(0.1, 0.12, 0.1, 0.02, M.lav, shx - 0.04, 1.53, 0.08));
        backW.items.push(me.cyl(0.05, 0.04, 0.09, M.pot, shx + 0.18, 1.515, 0.09));
        backW.items.push(me.ball(0.06, M.leaf, shx + 0.18, 1.6, 0.09, 1, 1.3, 1));
      }
      var postX = t.sink ? ox + UW * 0.82 : ox + UW * 0.76;
      if (UW >= 2) {
        backW.items.push(me.rbox(0.5, 0.64, 0.03, 0.01, M.white, postX, 1.55, 0.02));
        var pst = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.56), M.poster); me.add(pst, postX, 1.55, 0.037); backW.items.push(pst);
      }
    }
    /* a plant in the front corner (or on the open side of a corner booth) */
    me.plant(t.open === 2 ? W + 0.18 : 0.22, D - 0.25, UW >= 3 ? 1.15 : 0.9, M);

    /* dimension lines (shown with Measure): start, end, label. Offset just outside the booth */
    var sx = t.open === 2 ? -TH - 0.35 : W + TH + 0.35;
    me.dims = [
      { a: new THREE.Vector3(-TH, 0.04, D + 0.45), b: new THREE.Vector3(W + (t.open === 2 ? 0 : TH), 0.04, D + 0.45), e1: new THREE.Vector3(-TH, 0.04, D), e2: new THREE.Vector3(W + (t.open === 2 ? 0 : TH), 0.04, D), label: W + " m wide" + (n > 1 ? " (" + n + " booths)" : "") },
      { a: new THREE.Vector3(sx, 0.04, -TH), b: new THREE.Vector3(sx, 0.04, D), e1: new THREE.Vector3(t.open === 2 ? -TH : W + TH, 0.04, -TH), e2: new THREE.Vector3(t.open === 2 ? -TH : W + TH, 0.04, D), label: D + " m deep" },
      { a: new THREE.Vector3(-TH - 0.4, 0.04, D), b: new THREE.Vector3(-TH - 0.4, 0.04 + H, D), e1: new THREE.Vector3(-TH, 0.04, D), e2: new THREE.Vector3(-TH, 0.04 + H, D), label: H + " m high" }
    ];
    me.drawPins();

    me.target = new THREE.Vector3(W / 2, H * 0.3, D / 2);
    me.view = (W + D) * 0.66 + H * 0.55 + 1.05;
    me.sun.position.set(W / 2 - 5, 9, D / 2 + 6); me.sun.target.position.set(W / 2, 0, D / 2);
    var sc = me.sun.shadow.camera, ext = Math.max(W, D) + 3; sc.left = -ext; sc.right = ext; sc.top = ext; sc.bottom = -ext; sc.near = 1; sc.far = 30; sc.updateProjectionMatrix();
    me.resize();
  },

  /* labels: a white dot on the part, a dotted leader line, and a glass pill */
  drawPins: function () {
    var me = this;
    me.pins.innerHTML = me.pinList.map(function (p) { return '<span class="b3-pin">' + (p.icon ? BB.icon(p.icon, 13) : "") + p.label + "</span>"; }).join("") +
      (me.measure ? me.dims.map(function (d) { return '<span class="b3-pin dim">' + d.label + "</span>"; }).join("") : "");
  },

  proj: function (v) {
    var p = v.clone().project(this.cam);
    return { x: (p.x + 1) / 2 * this.host.clientWidth, y: (1 - p.y) / 2 * this.host.clientHeight };
  },

  loop: function () {
    var me = this;
    requestAnimationFrame(function () { me.loop(); });
    if (!me.t || !me.host.clientWidth) { return; }
    if (me.auto) { me.theta = 0.62 + Math.sin(performance.now() / 3600) * 0.22; }
    var tg = me.target, d = 30;
    me.cam.position.set(tg.x + d * Math.sin(me.phi) * Math.sin(me.theta), tg.y + d * Math.cos(me.phi), tg.z + d * Math.sin(me.phi) * Math.cos(me.theta));
    me.cam.lookAt(tg);
    /* dollhouse cut: walls between the camera and the inside drop to a low stub */
    var dir = new THREE.Vector3(Math.sin(me.theta), 0, Math.cos(me.theta));
    me.walls.forEach(function (w) {
      var want = dir.dot(w.n) > 0.3 ? 0.08 : 1;
      w.k += (want - w.k) * 0.15;
      w.body.scale.y = w.k; w.cap.position.y = me.t.h * w.k;
      w.items.forEach(function (it) { it.visible = me.wallsOn && w.k > 0.7; });
    });
    (me.frame || []).forEach(function (m) { m.visible = me.wallsOn; });
    me.r.render(me.scene, me.cam);
    var w = me.host.clientWidth, h = me.host.clientHeight, els = me.pins.children, svg = "", c = me.proj(me.target);
    svg += '<defs><marker id="b3a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 1 L9 5 L0 9 z" fill="#503A6B"/></marker></defs>';
    var used = [];  /* labels already placed on each side, so two labels never sit on top of each other */
    me.pinList.forEach(function (p, i) {
      var a = me.proj(p.v), el = els[i]; if (!el) { return; }
      var off = p.icon === "plug" && !me.wallsOn;  /* the power point sits on a wall */
      el.style.display = off ? "none" : ""; if (off) { return; }
      var pw = el.offsetWidth || 120, ph = el.offsetHeight || 32, side = a.x >= c.x ? 1 : -1;
      var lx = a.x + side * 46, ly = Math.max(80, a.y - 40);
      lx = side > 0 ? Math.min(lx, w - 8 - pw) : Math.max(lx, 8 + pw);
      used.forEach(function (u) { if (u.side === side && Math.abs(u.y - ly) < ph + 8) { ly = u.y + ph + 8; } });
      ly = Math.min(ly, h - ph / 2 - 8);
      used.push({ side: side, y: ly });
      svg += '<line class="ld" x1="' + a.x + '" y1="' + a.y + '" x2="' + lx + '" y2="' + ly + '"/><circle class="ldot" cx="' + a.x + '" cy="' + a.y + '" r="4.5"/>';
      el.style.transform = "translate(" + lx + "px," + ly + "px) translate(" + (side > 0 ? "0" : "-100%") + ", -50%)";
    });
    if (me.measure) {
      me.dims.forEach(function (d, j) {
        var A = me.proj(d.a), B = me.proj(d.b), E1 = me.proj(d.e1), E2 = me.proj(d.e2), el = els[me.pinList.length + j];
        svg += '<line class="ext" x1="' + E1.x + '" y1="' + E1.y + '" x2="' + A.x + '" y2="' + A.y + '"/><line class="ext" x1="' + E2.x + '" y1="' + E2.y + '" x2="' + B.x + '" y2="' + B.y + '"/>';
        svg += '<line class="dimln" x1="' + A.x + '" y1="' + A.y + '" x2="' + B.x + '" y2="' + B.y + '" marker-start="url(#b3a)" marker-end="url(#b3a)"/>';
        if (el) { el.style.transform = "translate(" + (A.x + B.x) / 2 + "px," + (A.y + B.y) / 2 + "px) translate(-50%, -50%)"; }
      });
    }
    me.svg.setAttribute("viewBox", "0 0 " + w + " " + h);
    me.svg.innerHTML = svg;
  }
};

/* rebuild the 3D when the theme changes (the scene keeps its own colours, the backdrop is CSS) */
