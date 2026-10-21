/* Booth Planner
   - Full-screen 3D stage with floating glass panels (objects, 2D plan, summary) and a bottom bar.
   - Tap an object for Rotate, Style (three designs), Colour and Remove.
   - Rice cookers, ovens, cake stands and decor sit on top of a table or cart and move with it.
   - Bottom bar: Look (3 looks), Colours (walls, floor), Suggestions (ready layouts), History.
   - The 2D plan stays in sync. The packing checklist lives in My Events and is filled from this plan.
   The 3D objects themselves are in planner-objects.js. Units in 3D are metres. 1 grid cell = 0.5 m. */
var BP = { ev: null, plan: null, sel: 0, t: null, sketch: false, walking: null, drag: null, drag2d: null, dock: "objects", paneOpen: true, popTab: "", thumbs: {}, looks: {} };
var C = PL.CELL_M, BW = PL.W * C, BD = PL.H * C, WH = 2.5, TH = 0.1;

BB.icons.brush = '<path d="M14 4l6 6-8.5 8.5a3 3 0 0 1-2.1.9H6v-3.4a3 3 0 0 1 .9-2.1z"/><path d="M12 6l6 6"/>';
BB.icons.wand = '<path d="M4 20L15 9M14 4v2M18 6l-1.5 1.5M20 10h-2M10 6l1 1"/>';
BB.icons.history = '<path d="M4 12a8 8 0 1 0 2.4-5.7L4 8.5"/><path d="M4 4v4.5h4.5M12 8v4l3 2"/>';
BB.icons.layers = '<path d="M12 4l8 4-8 4-8-4z"/><path d="M4 12l8 4 8-4M4 16l8 4 8-4"/>';
BB.icons.panel = '<rect x="3.5" y="4" width="17" height="16" rx="2.5"/><path d="M9.5 4v16"/>';
BB.icons.shapes = '<rect x="3.5" y="12" width="8" height="8" rx="1.5"/><circle cx="16.5" cy="16" r="4"/><path d="M12 3.5l4.5 6.5h-9z"/>';
BB.icons.table = BB.icons.table || '<path d="M3 9h18M5 9v11M19 9v11M3 9l2-3h14l2 3"/>';
BB.icons.unlock = '<rect x="5" y="11" width="14" height="9" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 7.5-2"/>';
BB.icons.play = '<path d="M8 5.5v13l10-6.5z"/>';
BB.icons.pause = '<path d="M9 5v14M15 5v14"/>';
BB.icons.user = '<circle cx="12" cy="7.5" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/>';
BB.icons.flame = '<path d="M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2.5 1.5-3.5 2.5-5 .5 1.5 1.5 2 2.5 2 0-2.5-1-4.5 0-7z"/>';
BB.icons.drop = '<path d="M12 3.5c3 4 6 7.3 6 10.5a6 6 0 0 1-12 0c0-3.2 3-6.5 6-10.5z"/>';
BB.icons.cup = '<path d="M5 9h11v5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5z"/><path d="M16 11h1.5a2 2 0 0 1 0 4H16"/>';
BB.icons.plate = '<ellipse cx="12" cy="15" rx="9" ry="3.5"/><path d="M7 13.5a5 5 0 0 1 10 0"/>';
BB.icons.card = '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18M7 15h4"/>';
BB.icons.expand = '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>';
BB.icons.shrink = '<path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/>';
BB.icons.plug = '<path d="M9 3v5M15 3v5M7 8h10v3a5 5 0 0 1-10 0zM12 16v5"/>';

BP.save = function () { PL.save(BP.ev.id, BP.plan); };
BP.cat = function (it) { return PL.catalog[it.type]; };

/* =========================================================
   Looks: three styles, like picking a skin in a game
   ========================================================= */
BP.STYLES = {
  minimal: { name: "Modern minimal", note: "Crisp white and cool grey with black lines", wall: "#F4F4F2", back: "#DDE2E8", floor: "#D8D2C8", plinth: "#EDEDEB", aisle: "#E1E1DE", trim: "#232325", body: "#FFFFFF", wood: "#CDB89C", fabric: "#8E9AA8", accent: "#232325" },
  warm: { name: "Warm wood", note: "Terracotta, walnut and mustard, a cosy market feel", wall: "#F1E2CF", back: "#C4704E", floor: "#8C5E3C", plinth: "#EADBC8", aisle: "#DCCDBB", trim: "#4A3021", body: "#F6EADB", wood: "#7B4B2A", fabric: "#D9A441", accent: "#4A3021" },
  pastel: { name: "Pastel pop", note: "Lavender, mint and blush, playful and bright", wall: "#F9E1E8", back: "#C7B3EC", floor: "#CFE8DC", plinth: "#F6EEF2", aisle: "#EBE3EF", trim: "#5E4596", body: "#FFF9F6", wood: "#F2C9A0", fabric: "#F49E8C", accent: "#5E4596" }
};
/* Standard booth: white system panels and a light grey floor, like most real booths.
   Colours and looks are no longer something sellers change, so every plan uses this one. */
BP.STYLES.standard = Object.assign({}, BP.STYLES.minimal, { name: "Standard booth", note: "White panels and a light grey floor", wall: "#FFFFFF", back: "#FFFFFF", floor: "#E7E4DF", trim: "#A9AEB4", plinth: "#F1EFEC", aisle: "#E4E2DE" });
/* the seller's own look, made from a palette they upload */
BP.syncMyLook = function () {
  if (BP.plan.myLook) { BP.STYLES.custom = Object.assign({ name: "Your palette", note: "Made from the colours you uploaded" }, BP.plan.myLook); }
  else { delete BP.STYLES.custom; if (BP.plan.style === "custom") { BP.plan.style = "minimal"; } }
};
BP.SWATCH = {
  wall: ["#F5F3EF", "#F4EADF", "#EDEFF2", "#E6EEE6", "#F3E3E3", "#3A3540"],
  back: ["#ECE9E4", "#D9C6E0", "#D9A88B", "#BFD3C8", "#C9D6E8", "#E9BAA5", "#3A3540"],
  floor: ["#E6D8C3", "#EADCC8", "#B98B63", "#8A6448", "#D7D4CF", "#9A9590"],
  object: ["#FAF9F7", "#2B2A2C", "#D9C2A0", "#9C6B45", "#C3A7CB", "#E9BAA5", "#BFD3C8", "#C9D6E8", "#C8673F", "#503A6B"]
};
/* which part of each object takes the object colour (table-top objects use P.main) */
BP.MAIN = { table: "body", shelf: "wood", cashier: "body", chiller: "body", banner: "fabric", storage: "kraft", storage_crate: "crate", storage_cart: "body", chair: "fabric" };
BP.mainKey = function (type) { var c = PL.catalog[type]; return BP.MAIN[type] || BP.MAIN[c.group] || "main"; };
BP.pal = function () { return Object.assign({}, BP.STYLES.standard); };

/* =========================================================
   Geometry, textures and materials
   ========================================================= */
/* box with soft rounded edges, centred on 0,0,0 */
BP.rgeo = function (w, h, d, r) {
  var b = Math.max(0.003, Math.min(r || 0.02, w / 2 - 0.002, h / 2 - 0.002, d / 2 - 0.002) * 0.75), rr = b * 0.6;
  var iw = w - 2 * b, ih = h - 2 * b, x = -iw / 2, y = -ih / 2, sh = new THREE.Shape();
  rr = Math.max(0, Math.min(rr, iw / 2 - 0.0005, ih / 2 - 0.0005));
  sh.moveTo(x + rr, y); sh.lineTo(x + iw - rr, y); sh.quadraticCurveTo(x + iw, y, x + iw, y + rr);
  sh.lineTo(x + iw, y + ih - rr); sh.quadraticCurveTo(x + iw, y + ih, x + iw - rr, y + ih);
  sh.lineTo(x + rr, y + ih); sh.quadraticCurveTo(x, y + ih, x, y + ih - rr); sh.lineTo(x, y + rr); sh.quadraticCurveTo(x, y, x + rr, y);
  var g = new THREE.ExtrudeGeometry(sh, { depth: Math.max(0.001, d - 2 * b), bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelSegments: 3, curveSegments: 4 });
  g.center(); return g;
};
BP.mesh = function (geo, m, x, y, z, p) { var o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; p.add(o); return o; };
BP.rb = function (p, w, h, d, r, m, x, y, z) { return BP.mesh(BP.rgeo(w, h, d, r), m, x, y, z, p); };
BP.cy = function (p, r1, r2, h, m, x, y, z, seg) { return BP.mesh(new THREE.CylinderGeometry(r1, r2, h, seg || 24), m, x, y, z, p); };
BP.sp = function (p, r, m, x, y, z, sx, sy, sz) { var o = BP.mesh(new THREE.SphereGeometry(r, 20, 14), m, x, y, z, p); o.scale.set(sx || 1, sy || 1, sz || 1); o.userData.noEdge = true; return o; };

BP.ctex = function (w, h, draw, rep) {
  var cv = document.createElement("canvas"); cv.width = w; cv.height = h; draw(cv.getContext("2d"), w, h);
  var t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4;
  if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); }
  return t;
};
BP.makeTextures = function () {
  BP.tex = {
    planks: BP.ctex(512, 512, function (g, w, h) {
      g.fillStyle = "#FFFFFF"; g.fillRect(0, 0, w, h);
      for (var i = 0; i < 8; i++) {
        g.fillStyle = ["#FBFAF8", "#F2F0EC", "#F7F5F1", "#EEEBE6"][i % 4]; g.fillRect(0, i * 64 + 1, w, 62);
        for (var k = 0; k < 18; k++) { g.fillStyle = "rgba(120,100,80,0.05)"; g.fillRect(Math.random() * w, i * 64 + Math.random() * 60, 60 + Math.random() * 120, 1); }
        g.fillStyle = "rgba(90,70,50,0.22)"; g.fillRect(0, i * 64, w, 1.5);
        g.fillRect((i * 173) % w, i * 64, 1.5, 64); g.fillRect((i * 173 + 260) % w, i * 64, 1.5, 64);
      }
    }, [2, 1.5]),
    tile: BP.ctex(256, 256, function (g, w, h) {
      g.fillStyle = "#FFFFFF"; g.fillRect(0, 0, w, h);
      g.strokeStyle = "rgba(80,70,70,0.12)"; g.lineWidth = 2;
      for (var i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, h); g.stroke(); g.beginPath(); g.moveTo(0, i * 64); g.lineTo(w, i * 64); g.stroke(); }
    }, [7, 2.5]),
    sign: BP.ctex(1024, 128, function (g, w, h) {
      g.fillStyle = "#FFFFFF"; g.fillRect(0, 0, w, h);
      g.fillStyle = "#2B2A2C"; g.beginPath(); g.arc(70, h / 2, 26, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#FFFFFF"; g.beginPath(); g.arc(70, h / 2, 10, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#2B2A2C"; g.font = "500 52px Outfit, Arial"; g.textBaseline = "middle"; g.fillText((BB_USER.business || "My booth").toUpperCase(), 120, h / 2 + 2);
    }),
    qsign: BP.ctex(256, 160, function (g, w, h) {
      g.fillStyle = "#FFFFFF"; g.fillRect(0, 0, w, h);
      g.fillStyle = "#2B2A2C"; g.textAlign = "center"; g.textBaseline = "middle";
      g.font = "600 38px Outfit, Arial"; g.fillText("Queue", w / 2, 60); g.font = "400 26px Outfit, Arial"; g.fillText("starts here", w / 2, 104);
    }),
    banner: BP.ctex(256, 1024, function (g, w, h) {
      var gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#FFFFFF"); gr.addColorStop(1, "#E9E1D8"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      g.fillStyle = "#2B2A2C"; g.beginPath(); g.arc(w / 2, 240, 60, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#FFFFFF"; g.beginPath(); g.arc(w / 2, 240, 24, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#2B2A2C"; g.textAlign = "center"; g.font = "500 40px Outfit, Arial";
      var words = (BB_USER.business || "My booth").split(" ");
      words.forEach(function (wd, i) { g.fillText(wd, w / 2, 390 + i * 48); });
      g.font = "400 22px Outfit, Arial"; g.fillText("Fresh bakes daily", w / 2, 420 + words.length * 48);
    })
  };
};

BP.makeMaterials = function () {
  var S = function (o) { o.roughness = o.roughness === undefined ? 0.75 : o.roughness; return new THREE.MeshStandardMaterial(o); };
  BP.M = {
    wall: S({ color: 0xffffff, roughness: 0.92 }), back: S({ color: 0xffffff, roughness: 0.92 }),
    floor: S({ map: BP.tex.planks, roughness: 0.7 }), plinth: S({ color: 0xffffff, roughness: 0.9 }), plinthEdge: S({ color: 0xDAD4CC, roughness: 0.9 }),
    aisle: S({ map: BP.tex.tile, roughness: 0.6 }), trim: S({ color: 0x222222, roughness: 0.5 }),
    body: S({ color: 0xffffff, roughness: 0.55 }), wood: S({ color: 0xffffff, roughness: 0.6 }), fabric: S({ color: 0xffffff, roughness: 0.9 }), accent: S({ color: 0x222222, roughness: 0.5 }),
    kraft: S({ color: 0xC9A27A, roughness: 0.95 }), tape: S({ color: 0xE9DDC9, roughness: 0.8 }), crate: S({ color: 0xBFD9C8, roughness: 0.45 }),
    metal: S({ color: 0xD9DCE0, roughness: 0.25, metalness: 0.8 }), black: S({ color: 0x222124, roughness: 0.45, metalness: 0.3 }),
    white: S({ color: 0xFFFFFF, roughness: 0.5 }), glass: S({ color: 0xE8F2F6, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.3, depthWrite: false }),
    glow: S({ color: 0xFFF7E6, emissive: 0xFFE9B8, emissiveIntensity: 0.9 }), fridgeIn: S({ color: 0xF4F8FA, emissive: 0xD8EAF2, emissiveIntensity: 0.35 }),
    hot: S({ color: 0xE0574F, emissive: 0xE0574F, emissiveIntensity: 0.6 }), chalk: S({ color: 0x2E3330, roughness: 0.95 }), coffee: S({ color: 0x4A2E1F, roughness: 0.3 }),
    screen: S({ color: 0x20262C, roughness: 0.2, emissive: 0x7FB8E0, emissiveIntensity: 0.45 }),
    sign: S({ map: BP.tex.sign, roughness: 0.8 }), backdrop: S({ color: 0xffffff, roughness: 0.9 }), qsign: S({ map: BP.tex.qsign, roughness: 0.8 }), banner: S({ map: BP.tex.banner, roughness: 0.75 }),
    bread: S({ color: 0xC98C52, roughness: 0.8 }), peach: S({ color: 0xF0B49C }), lav: S({ color: 0xC9B2D6 }), cream: S({ color: 0xF7E7CF }), mint: S({ color: 0xBFD9C8 }), red: S({ color: 0xD9444E, roughness: 0.4 }),
    water: S({ color: 0x9CCBE8, roughness: 0.1 }), skin: S({ color: 0xD9A584, roughness: 0.7 }), hair: S({ color: 0x3A2A24, roughness: 0.8 }),
    trousers: S({ color: 0x3B3540, roughness: 0.8 }), shirtO: S({ color: 0x6E4F8C, roughness: 0.85 }), shirtH: S({ color: 0xD5714D, roughness: 0.85 }), apron: S({ color: 0x4A4250, roughness: 0.9 }),
    leaf: S({ color: 0x7FA98A }), leaf2: S({ color: 0x96BFA0 }), pot: S({ color: 0xE8E2DA }), soil: S({ color: 0x5E4A3C }), plug: S({ color: 0xF3C95B, roughness: 0.5 })
  };
  BP.lineMat = new THREE.LineBasicMaterial({ color: 0x2B2A2C, transparent: true, opacity: 0.75 });
  BP.lineMat.visible = false;
};

/* colour every shared material from the current look and custom colours */
BP.applyStyle = function () {
  var p = BP.pal(), M = BP.M;
  ["wall", "back", "floor", "plinth", "aisle", "trim", "body", "wood", "fabric", "accent"].forEach(function (k) { M[k].color.set(p[k]); });
  M.plinthEdge.color.set(p.plinth).multiplyScalar(0.9);
  BP.matCache = {};
};
/* materials for one item: the shared ones, with the main part swapped when the seller picked a colour */
BP.matCache = {};
BP.matsFor = function (it) {
  if (!it.color || BP.STYLES.standard) { return BP.M; }  /* no colour picker any more: objects keep their own colours */
  var key = it.type + it.color;
  if (!BP.matCache[key]) {
    var P = Object.assign({}, BP.M), mk = BP.mainKey(it.type), m = (BP.M[mk] || BP.M.body).clone();
    m.map = null; m.transparent = false; m.opacity = 1; m.depthWrite = true; m.color.set(it.color);
    P[mk] = m; P.main = m; P.tint = it.color;
    BP.matCache[key] = P;
  }
  return BP.matCache[key];
};
/* build one object into a group */
BP.buildItem = function (g, type, P, bare, form, it) {
  var c = PL.catalog[type];
  if (c.custom) { BP.buildCustom(g, c.w * C, c.h * C, form ? Object.assign({}, c, { form: form }) : c, P); }
  else { BP.build[c.group](g, c.w * C, c.h * C, P, { v: c.v, bare: bare, it: it }); }
};

/* line drawing for Sketch mode (one shared material shows or hides every line) */
BP.addEdges = function (root) {
  var list = [];
  root.traverse(function (m) { if (m.isMesh && !m.userData.noEdge && !m.userData.edged) { list.push(m); } });
  list.forEach(function (m) { var e = new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry, 35), BP.lineMat); e.raycast = function () {}; m.add(e); m.userData.edged = true; });
};

/* =========================================================
   Little 3D previews for the Style menu and the Look cards
   ========================================================= */
BP.thumbRenderer = function (w, h) {
  if (!BP._tr) {
    var r = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    r.outputEncoding = THREE.sRGBEncoding; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.12;
    r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap; r.setPixelRatio(1);
    BP._tr = r;
  }
  BP._tr.setSize(w, h, false);
  return BP._tr;
};
BP.disposeTree = function (g) { g.traverse(function (m) { if (m.geometry) { m.geometry.dispose(); } }); };

/* one object, seen at an angle (table-top objects stand on a small board) */
BP.objThumb = function (type, color, form, who) {
  who = who && typeof who === "object" ? who : {};
  var c = PL.catalog[type], key = [type, color || "", form || "", [who.role, who.gender, who.skin, who.hair].join(","), BP.plan.style, JSON.stringify(BP.plan.colors)].join("|");
  if (BP.thumbs[key]) { return BP.thumbs[key]; }
  var scene = new THREE.Scene(), g = new THREE.Group(), P = BP.matsFor({ type: type, color: color });
  scene.add(new THREE.HemisphereLight(0xFFFFFF, 0xE6DED6, 0.8));
  var l = new THREE.DirectionalLight(0xFFF3E6, 1.0); l.position.set(-2, 5, 4); scene.add(l);
  BP.buildItem(g, type, P, false, form, who);
  if (c.top) { BP.rb(g, 0.5, 0.03, 0.5, 0.012, BP.M.wood, 0, -0.016, 0); }
  scene.add(g);
  var box = new THREE.Box3().setFromObject(g), ctr = box.getCenter(new THREE.Vector3()), R = box.getSize(new THREE.Vector3()).length() / 2;
  var cam = new THREE.PerspectiveCamera(26, 1.25, 0.01, 50), dir = new THREE.Vector3(-0.55, 0.55, 1).normalize();
  cam.position.copy(ctr).addScaledVector(dir, R / Math.sin(0.2)); cam.lookAt(ctr);
  var r = BP.thumbRenderer(250, 200); r.render(scene, cam);
  var url = r.domElement.toDataURL("image/png");
  BP.disposeTree(g);
  var ready = !c.custom || [c.image, c.cutout].filter(Boolean).every(function (u) { return (BP.texFor(u).image || {}).complete; });
  if (ready) { BP.thumbs[key] = url; } else { setTimeout(function () { if (BP.popTab === "style") { BP.showPop(); } }, 300); }
  return url;
};

/* the whole booth in one of the three looks */
BP.sceneKey = function () { return JSON.stringify([BP.plan.items, BP.plan.queue, BP.plan.colors, BP.plan.style, BP.plan.myLook || 0, (BP.plan.backdrop || "").length, (BP.plan.bannerImg || "").length]); };
BP.lookThumb = function (k) {
  var t = BP.t; if (!t) { return ""; }
  var key = k + BP.sceneKey(); if (BP.looks[key]) { return BP.looks[key]; }
  var keep = { style: BP.plan.style, colors: BP.plan.colors };
  BP.plan.style = k; BP.plan.colors = k === keep.style ? keep.colors : {}; BP.applyStyle();
  var cam = new THREE.PerspectiveCamera(30, 300 / 170, 0.05, 80), th = -0.6, ph = 0.98, d = 12.2;
  cam.position.set(t.target.x + d * Math.sin(ph) * Math.sin(th), t.target.y + d * Math.cos(ph), t.target.z + d * Math.sin(ph) * Math.cos(th)); cam.lookAt(t.target);
  t.selFx.visible = false;
  var r = BP.thumbRenderer(600, 340); r.setClearColor(document.documentElement.getAttribute("data-theme") === "dark" ? 0x3E3346 : 0xF6EDE4, 1); r.render(t.scene, cam);
  BP.looks[key] = r.domElement.toDataURL("image/jpeg", 0.85); r.setClearColor(0x000000, 0);
  t.selFx.visible = true;
  BP.plan.style = keep.style; BP.plan.colors = keep.colors; BP.applyStyle();
  return BP.looks[key];
};

/* =========================================================
   Scene
   ========================================================= */
BP.init3d = function () {
  var host = document.getElementById("view3d");
  try {
    var r = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
    r.outputEncoding = THREE.sRGBEncoding;
    r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.12;
    if (THREE.ColorManagement) { THREE.ColorManagement.legacyMode = false; }
    host.appendChild(r.domElement);
  } catch (err) {
    host.innerHTML = '<p class="muted" style="padding:120px 40px;text-align:center">3D could not start in this browser. You can still use the 2D plan.</p>';
    return false;
  }
  BP.makeTextures(); BP.makeMaterials(); BP.applyStyle(); BP.applyBranding();
  var scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(30, 1, 0.05, 80);
  scene.add(new THREE.HemisphereLight(0xFFFFFF, 0xE6DED6, 0.55));
  var sun = new THREE.DirectionalLight(0xFFF3E6, 1.15);
  sun.position.set(BW / 2 - 4.5, 9, 7.5); sun.target.position.set(BW / 2, 0, BD / 2);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.02; sun.shadow.radius = 5;
  var sc = sun.shadow.camera; sc.left = -7; sc.right = 7; sc.top = 7; sc.bottom = -7; sc.near = 1; sc.far = 30;
  scene.add(sun); scene.add(sun.target);
  var fill = new THREE.DirectionalLight(0xE8ECFF, 0.32); fill.position.set(BW + 6, 5, -2); scene.add(fill);
  BP.t = {
    r: r, scene: scene, cam: cam, host: host,
    env: new THREE.Group(), sketchGrp: new THREE.Group(), items: new THREE.Group(), queue: new THREE.Group(), selFx: new THREE.Group(),
    theta: -0.6, phi: 0.98, dist: 12.5, thetaT: -0.6, phiT: 0.98, distT: 12.5, D0: 12.5, shift: 0,
    target: new THREE.Vector3(BW / 2, 0.45, BD / 2 + 0.55), ray: new THREE.Raycaster(),
    groups: {}, orbit: null, walls: []
  };
  var t = BP.t;
  [t.env, t.sketchGrp, t.items, t.queue, t.selFx].forEach(function (g) { scene.add(g); });
  BP.buildEnv(); BP.wire3d(); BP.resize3d();
  if (window.ResizeObserver) { new ResizeObserver(BP.resize3d).observe(host); } else { window.addEventListener("resize", BP.resize3d); }
  BP.loop();
  return true;
};

BP.resize3d = function () {
  var t = BP.t; if (!t || !t.host.clientWidth) { return; }
  t.r.setSize(t.host.clientWidth, t.host.clientHeight); t.cam.aspect = t.host.clientWidth / t.host.clientHeight; t.cam.updateProjectionMatrix();
  BP.fitView();
};

/* centre the booth in the free space between the left and right panels, and zoom so it fits */
BP.fitView = function () {
  var t = BP.t; if (!t || !t.host.clientWidth) { return; }
  var hr = t.host.getBoundingClientRect(), L = document.getElementById("pl-left"), S = document.querySelector(".pl-side"), l = 0, r = 0;
  if (window.innerWidth > 900 && !BP.walking) {
    if (L) { l = Math.max(0, L.getBoundingClientRect().right - hr.left); }
    if (S) { r = Math.max(0, hr.right - S.getBoundingClientRect().left); }
    var K = document.querySelector(".pl-ctrl"); if (K && K.offsetParent) { r = Math.max(r, hr.right - K.getBoundingClientRect().left + 4); }
  }
  t.viewXT = (r - l) / 2;
  var st = document.getElementById("stage"); if (st) { st.style.setProperty("--mid", (l + (hr.width - r)) / 2 + "px"); st.style.setProperty("--free", Math.max(300, hr.width - l - r - 24) + "px"); }
  var aspect = Math.max(0.5, (hr.width - l - r) / hr.height);
  var sizeK = Math.max(0.62, Math.min(2.2, Math.max(BW / 4, BD / 3)));  /* smaller booths come closer, bigger ones move back */
  var d0 = 12.5 * sizeK * Math.max(0.85, 1.15 / aspect);
  if (Math.abs(d0 - t.D0) > 0.01) { t.distT *= d0 / t.D0; t.D0 = d0; BP.zoomLabel(); }
};

/* floating plinth with the booth and its aisle, walls that cut away when they face you, name board, lights */
BP.buildEnv = function () {
  var t = BP.t, M = BP.M, e = t.env;
  var x0 = -1.65, x1 = BW + 1.65, z0 = -0.4, z1 = BD + 1.35;
  BP.rb(e, x1 - x0, 0.26, z1 - z0, 0.1, M.plinth, (x0 + x1) / 2, -0.14, (z0 + z1) / 2);
  BP.rb(e, x1 - x0 - 0.08, 0.06, z1 - z0 - 0.08, 0.03, M.plinthEdge, (x0 + x1) / 2, -0.29, (z0 + z1) / 2);
  var sh = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.ShadowMaterial({ opacity: 0.13 }));
  sh.rotation.x = -Math.PI / 2; sh.position.set(BW / 2, -1.1, BD / 2); sh.receiveShadow = true; e.add(sh);
  BP.rb(e, x1 - x0 - 0.3, 0.02, z1 - BD - 0.2, 0.008, M.aisle, (x0 + x1) / 2, -0.003, BD + (z1 - BD - 0.2) / 2 + 0.03).castShadow = false;
  BP.rb(e, BW, 0.03, BD, 0.006, M.floor, BW / 2, -0.012, BD / 2).castShadow = false;

  var wall = function (w, d, m, x, z, n) {
    var g = new THREE.Group(); g.position.set(x, 0, z); e.add(g);
    var geo = BP.rgeo(w, WH, d, 0.04); geo.translate(0, WH / 2, 0);
    var body = new THREE.Mesh(geo, m); body.castShadow = true; body.receiveShadow = true; g.add(body);
    var cap = new THREE.Mesh(BP.rgeo(w + 0.012, 0.035, d + 0.012, 0.012), M.trim); cap.position.y = WH; g.add(cap);
    var rec = { g: g, body: body, cap: cap, n: n, k: 1, items: [] }; t.walls.push(rec); return rec;
  };
  var back = wall(BW + TH * 2, TH, M.back, BW / 2, -TH / 2, new THREE.Vector3(0, 0, -1));
  wall(TH, BD, M.wall, -TH / 2, BD / 2, new THREE.Vector3(-1, 0, 0));
  if (!PL.booth || PL.booth.open !== 2) { wall(TH, BD, M.wall, BW + TH / 2, BD / 2, new THREE.Vector3(1, 0, 0)); }  /* corner booths are open on the right */
  /* name board and a light track on the feature wall (open front, like a diorama) */
  var sw = Math.min(2.3, BW - 0.3), board = BP.rb(e, sw, sw / 8 + 0.08, 0.04, 0.02, M.white, BW / 2, WH - 0.36, 0.02);
  var sign = new THREE.Mesh(new THREE.PlaneGeometry(sw - 0.1, (sw - 0.1) / 8), M.sign); sign.position.set(BW / 2, WH - 0.36, 0.042); sign.userData.noEdge = true; e.add(sign);
  back.items.push(board, sign);
  var bd = new THREE.Mesh(new THREE.PlaneGeometry(BW, WH - 0.06), M.backdrop); bd.position.set(BW / 2, (WH - 0.06) / 2, 0.004); bd.receiveShadow = true; bd.userData.noEdge = true; bd.visible = false; e.add(bd);
  t.backdrop = bd; back.items.push(bd);
  back.items.push(BP.rb(e, BW - 0.4, 0.03, 0.03, 0.012, M.black, BW / 2, WH - 0.08, 0.1));
  var nl = Math.max(2, Math.round(BW / 1)), lights = [];
  for (var li = 0; li < nl; li++) { lights.push(0.4 + li * (BW - 0.8) / (nl - 1)); }
  lights.forEach(function (lx) {
    var l = BP.cy(e, 0.035, 0.05, 0.12, M.black, lx, WH - 0.15, 0.14, 18); l.rotation.x = 0.5; back.items.push(l);
    var gl = BP.cy(e, 0.04, 0.04, 0.008, M.glow, lx, WH - 0.2, 0.17, 18); gl.rotation.x = 0.5; back.items.push(gl);
  });
  /* power outlet on the back wall (matches the 2D plan) */
  if (!PL.booth || PL.booth.power) {
    back.items.push(BP.rb(e, 0.13, 0.13, 0.025, 0.02, M.plug, 0.25, 0.32, 0.012));
    back.items.push(BP.rb(e, 0.13, 0.13, 0.025, 0.02, M.plug, 0.45, 0.32, 0.012));
  }

  /* sketch layer */
  var s = t.sketchGrp;
  var grid = new THREE.GridHelper(12, 24, 0x6F6A66, 0xC8C2BB); grid.position.set(BW / 2, 0.01, BD / 2 + 0.5); grid.material.transparent = true; grid.material.opacity = 0.5; s.add(grid);
  s.visible = false;
  BP.addEdges(e);
};

/* height an item stands at: 0 on the floor, or the table surface for table-top objects */
BP.baseY = function (it) { var h = PL.hostOf(BP.plan, it); return h ? PL.catalog[h.type].surface : 0; };

/* items and queue (rebuilt after each change) */
BP.build3d = function () {
  var t = BP.t; if (!t) { return; }
  while (t.items.children.length) { var old = t.items.children[0]; t.items.remove(old); BP.disposeTree(old); }
  t.groups = {};
  BP.plan.items.forEach(function (it) {
    var c = BP.cat(it), g = new THREE.Group(), bare = !!c.surface && PL.topsOn(BP.plan, it).length > 0;
    BP.buildItem(g, it.type, BP.matsFor(it), bare, null, it);
    g.userData.itemId = it.id;
    g.userData.h = new THREE.Box3().setFromObject(g).max.y;
    var p = BP.center3d(it), by = BP.baseY(it);
    g.position.set(p.x, by, p.z); g.userData.baseY = by; g.userData.goal = new THREE.Vector3(p.x, by, p.z);
    g.rotation.y = -it.r * Math.PI / 2;
    if (c.person) { BP.dressPerson(g, it); }
    t.items.add(g); t.groups[it.id] = g;
  });
  BP.addEdges(t.items);
  BP.buildQueue(); BP.buildSelFx();
};

/* move every object's target to where the plan says it is (used while dragging a table with things on it) */
BP.syncGoals = function (skip) {
  var t = BP.t; if (!t) { return; }
  BP.plan.items.forEach(function (it) {
    var g = t.groups[it.id]; if (!g || it.id === skip) { return; }
    var p = BP.center3d(it), by = BP.baseY(it); g.userData.baseY = by; g.userData.goal.set(p.x, by, p.z);
  });
};

BP.center3d = function (it) { var s = PL.size(it.type, it.r); return { x: (it.x + s.w / 2) * C, z: (it.y + s.h / 2) * C }; };

BP.buildQueue = function () {
  var t = BP.t, q = t.queue, M = BP.M;
  while (q.children.length) { q.remove(q.children[0]); }
  var path = PL.path(BP.plan).map(function (p) { return new THREE.Vector3(p.x * C, 0, p.y * C); });
  var sh = new THREE.Shape(); sh.moveTo(0, 0.12); sh.lineTo(0.1, -0.02); sh.lineTo(0.045, -0.02); sh.lineTo(0.045, -0.11); sh.lineTo(-0.045, -0.11); sh.lineTo(-0.045, -0.02); sh.lineTo(-0.1, -0.02); sh.closePath();
  var ag = new THREE.ShapeGeometry(sh), am = new THREE.MeshStandardMaterial({ color: M.accent.color, roughness: 0.6, transparent: true, opacity: 0.75 });
  var posts = [];
  for (var i = 0; i < path.length - 1; i++) {
    var a = path[i], b = path[i + 1], len = a.distanceTo(b), dir = b.clone().sub(a).normalize(), side = new THREE.Vector3(-dir.z, 0, dir.x).multiplyScalar(0.4);
    for (var d = 0.35; d < len - 0.15; d += 0.6) {
      var p = a.clone().add(dir.clone().multiplyScalar(d)), ar = new THREE.Mesh(ag, am); ar.rotation.x = -Math.PI / 2;
      var hold = new THREE.Group(); hold.position.set(p.x, 0.012, p.z); hold.rotation.y = Math.atan2(-dir.x, -dir.z); hold.add(ar); q.add(hold);
    }
    if (i === 0) { for (var dd = 0.6; dd < len - 0.3; dd += 0.9) { posts.push(a.clone().add(dir.clone().multiplyScalar(dd)).add(side)); } }
  }
  posts.forEach(function (p, k) {
    BP.cy(q, 0.075, 0.085, 0.022, M.black, p.x, 0.011, p.z, 24);
    BP.cy(q, 0.018, 0.018, 0.9, M.metal, p.x, 0.46, p.z, 12);
    BP.sp(q, 0.026, M.metal, p.x, 0.92, p.z);
    if (k > 0) { var o = posts[k - 1], mid = o.clone().add(p).multiplyScalar(0.5), L = o.distanceTo(p); var belt = BP.rb(q, L, 0.045, 0.005, 0.002, M.accent, mid.x, 0.86, mid.z); belt.rotation.y = -Math.atan2(p.z - o.z, p.x - o.x); }
  });
  var s = new THREE.Group(), st = path[0];
  BP.cy(s, 0.12, 0.13, 0.03, M.black, 0, 0.015, 0, 28);
  BP.cy(s, 0.016, 0.016, 1.2, M.metal, 0, 0.62, 0, 12);
  BP.mesh(new THREE.BoxGeometry(0.42, 0.27, 0.014), [M.white, M.white, M.white, M.white, M.qsign, M.qsign], 0, 1.32, 0, s);
  s.position.set(st.x, 0, st.z);
  var nd = path[1].clone().sub(path[0]); s.rotation.y = Math.abs(nd.x) > 0.01 ? (nd.x > 0 ? -0.5 : 0.5) : 0;
  s.userData.queue = true; s.userData.h = 1.5; q.add(s); t.qsign = s;
  var end = path[path.length - 1], mark = new THREE.Mesh(new THREE.RingGeometry(0.15, 0.19, 36), am); mark.rotation.x = -Math.PI / 2; mark.position.set(end.x, 0.014, end.z); q.add(mark);
};

BP.buildSelFx = function () {
  var t = BP.t, fx = t.selFx;
  while (fx.children.length) { fx.remove(fx.children[0]); }
  var it = typeof BP.sel === "number" ? PL.find(BP.plan, BP.sel) : null;
  if (!it) { return; }
  var s = PL.size(it.type, it.r), w = s.w * C, d = s.h * C;
  var plane = new THREE.Mesh(new THREE.PlaneGeometry(w + 0.08, d + 0.08), new THREE.MeshBasicMaterial({ color: 0x8E73A6, transparent: true, opacity: 0.22, depthWrite: false }));
  plane.rotation.x = -Math.PI / 2; plane.position.y = 0.022; plane.renderOrder = 2; fx.add(plane);
  var edge = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(w + 0.08, d + 0.08)), new THREE.LineBasicMaterial({ color: 0x503A6B }));
  edge.rotation.x = -Math.PI / 2; edge.position.y = 0.024; edge.renderOrder = 3; fx.add(edge);
  var p = BP.center3d(it); fx.position.set(p.x, BP.baseY(it), p.z); t.selPlane = plane;
};

/* =========================================================
   Camera, picking and dragging
   ========================================================= */
BP.pointer = function (e) {
  var rect = BP.t.r.domElement.getBoundingClientRect();
  return new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
};
/* where the pointer meets a flat plane at height y (the floor, or a table top) */
BP.floorAt = function (e, y) {
  var t = BP.t, hit = new THREE.Vector3(); t.ray.setFromCamera(BP.pointer(e), t.cam);
  return t.ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), -(y || 0)), hit) ? hit : null;
};
BP.pick = function (e) {
  var t = BP.t; t.ray.setFromCamera(BP.pointer(e), t.cam);
  var hits = t.ray.intersectObjects([t.items, t.qsign], true);
  for (var i = 0; i < hits.length; i++) { var o = hits[i].object; while (o) { if (o.userData.itemId) { return { id: o.userData.itemId }; } if (o.userData.queue) { return { id: "queue" }; } o = o.parent; } }
  return null;
};

BP.wire3d = function () {
  var t = BP.t, el = t.r.domElement;
  el.addEventListener("pointerdown", function (e) {
    if (BP.walking) { return; }
    el.setPointerCapture(e.pointerId);
    var hit = BP.pick(e);
    if (hit) {
      var g = hit.id === "queue" ? t.qsign : t.groups[hit.id], y = hit.id === "queue" ? 0 : g.userData.baseY, pt = BP.floorAt(e, y);
      if (pt) {
        BP.drag = { id: hit.id, y: y, x0: e.clientX, y0: e.clientY, moved: false, off: new THREE.Vector3(g.position.x - pt.x, 0, g.position.z - pt.z), valid: true };
        el.style.cursor = "grabbing"; return;
      }
    }
    t.orbit = { x: e.clientX, y: e.clientY, moved: false, locked: BP.locked };
  });
  el.addEventListener("pointermove", function (e) {
    if (BP.drag) { BP.dragMove(e); return; }
    if (t.orbit && t.orbit.locked) {
      if (!t.orbit.moved && Math.abs(e.clientX - t.orbit.x) + Math.abs(e.clientY - t.orbit.y) > 12) { t.orbit.moved = true; if (!BP.lockTip) { BP.lockTip = true; BB.toast("Use the turn and zoom buttons on the right to look around the booth."); } }
      return;
    }
    if (t.orbit) {
      var dx = e.clientX - t.orbit.x, dy = e.clientY - t.orbit.y;
      if (Math.abs(dx) + Math.abs(dy) > 3) { t.orbit.moved = true; }
      t.thetaT -= dx * 0.006; t.phiT = Math.max(0.15, Math.min(1.4, t.phiT - dy * 0.005));
      t.orbit.x = e.clientX; t.orbit.y = e.clientY; return;
    }
    if (!BP.walking) { el.style.cursor = BP.pick(e) ? "grab" : "default"; }
  });
  var up = function () {
    if (BP.drag) {
      var d = BP.drag; BP.drag = null; el.style.cursor = "grab";
      if (!d.moved) { BP.select(d.id); }
      else {
        var di = d.id !== "queue" ? PL.find(BP.plan, d.id) : null;
        if (!d.valid && di && BP.dropOnTable(di, d.topCell)) { BP.commit("Put on a table: " + BP.nameOf(d.id)); BP.refresh(); return; }
        if (!d.valid && di && BP.cat(di).top) { BB.toast("Table items need to sit on a table or cart."); }
        BP.commit(d.id === "queue" ? "Moved the queue" : "Moved " + BP.nameOf(d.id)); BP.refresh();
      }
      return;
    }
    if (t.orbit) { if (!t.orbit.moved) { BP.select(0); } t.orbit = null; }
  };
  el.addEventListener("pointerup", up); el.addEventListener("pointercancel", up);
  el.addEventListener("wheel", function (e) { e.preventDefault(); if (BP.locked) { return; } t.distT = Math.max(5, Math.min(18, t.distT * (e.deltaY > 0 ? 1.08 : 0.93))); BP.zoomLabel(); }, { passive: false });
};

BP.label = function (it) { return BP.cat(it).person ? PL.personName(it) : BP.cat(it).label; };
BP.nameOf = function (id) { var it = PL.find(BP.plan, id); return it ? BP.label(it) : "item"; };

BP.dragMove = function (e) {
  var d = BP.drag, t = BP.t;
  if (!d.moved && Math.abs(e.clientX - d.x0) + Math.abs(e.clientY - d.y0) < 5) { return; }
  if (!d.moved) { d.moved = true; BP.sel = d.id; BP.popTab = ""; BP.showPop(); BP.buildSelFx(); }
  var pt = BP.floorAt(e, d.y); if (!pt) { return; }
  var px = pt.x + d.off.x, pz = pt.z + d.off.z, tp = BP.floorAt(e, 0.85);
  d.topCell = tp ? { x: Math.floor(tp.x / C), y: Math.floor(tp.z / C) } : null;
  if (d.id === "queue") {
    var sx = Math.max(-2.5, Math.min(PL.W + 2.5, Math.round(px / C * 2) / 2));
    if (sx !== BP.plan.queue.sx) { BP.plan.queue.sx = sx; BP.buildQueue(); BP.draw2d(); }
    return;
  }
  var it = PL.find(BP.plan, d.id), s = PL.size(it.type, it.r), g = t.groups[d.id];
  var nx = Math.round(px / C - s.w / 2), ny = Math.round(pz / C - s.h / 2);
  if (PL.fits(BP.plan, it.id, it.type, nx, ny, it.r)) {
    d.valid = true;
    if (nx !== it.x || ny !== it.y) { PL.shift(BP.plan, it, nx, ny); BP.draw2d(); BP.buildQueue(); BP.syncGoals(it.id); }
    var c = BP.center3d(it), by = BP.baseY(it); g.userData.baseY = by; g.userData.goal.set(c.x, by + 0.06, c.z);
  } else { d.valid = false; g.userData.goal.set(px, g.userData.baseY + 0.06, pz); }
  if (t.selPlane) {
    var cc = BP.center3d(it);
    t.selFx.position.set(d.valid ? cc.x : px, g.userData.baseY, d.valid ? cc.z : pz); t.selPlane.material.color.set(d.valid ? 0x8E73A6 : 0xE5484D);
  }
};

BP.cam = function (what) {
  var t = BP.t; if (!t) { return; }
  if (what === "left") { t.thetaT -= 0.45; }
  if (what === "right") { t.thetaT += 0.45; }
  if (what === "zin") { t.distT = Math.max(5, t.distT * 0.86); }
  if (what === "zout") { t.distT = Math.min(18, t.distT * 1.16); }
  if (what === "top") { t.thetaT = 0; t.phiT = 0.15; t.distT = 10; }
  if (what === "reset") { t.thetaT = -0.6; t.phiT = 0.98; t.distT = t.D0; }
  BP.zoomLabel();
};
BP.zoomLabel = function () { var z = document.getElementById("zoom-val"); if (z && BP.t) { z.textContent = Math.round(BP.t.D0 / BP.t.distT * 100) + "%"; } };

BP.loop = function () {
  var t = BP.t;
  requestAnimationFrame(BP.loop);
  var now = performance.now(), dt = Math.min(0.05, (now - (t.last || now)) / 1000); t.last = now;
  Object.keys(t.groups).forEach(function (id) { var g = t.groups[id]; if (!g.userData.rig || (BP.drag && String(BP.drag.id) === id)) { g.position.lerp(g.userData.goal, 0.3); } });
  BP.crewStep(dt, now / 1000);
  if (BP.walking) { BP.walkStep(); }
  else {
    t.theta += (t.thetaT - t.theta) * 0.14; t.phi += (t.phiT - t.phi) * 0.14; t.dist += (t.distT - t.dist) * 0.14;
    t.cam.position.set(t.target.x + t.dist * Math.sin(t.phi) * Math.sin(t.theta), t.target.y + t.dist * Math.cos(t.phi), t.target.z + t.dist * Math.sin(t.phi) * Math.cos(t.theta));
    t.cam.lookAt(t.target);
  }
  /* keep the booth centred in the space the panels leave free */
  var vw = t.host.clientWidth, vh = t.host.clientHeight, wantX = BP.walking ? 0 : (t.viewXT || 0);
  t.viewX = (t.viewX || 0) + (wantX - (t.viewX || 0)) * 0.15;
  if (Math.abs(t.viewX) > 0.5) { t.cam.setViewOffset(vw, vh, t.viewX, 0, vw, vh); } else if (t.cam.view && t.cam.view.enabled) { t.cam.clearViewOffset(); }
  /* dollhouse cut: walls between you and the booth drop to a low stub so you can see in */
  var cp = t.cam.position, dir = new THREE.Vector3(cp.x - BW / 2, 0, cp.z - BD / 2).normalize();
  t.walls.forEach(function (wl) {
    var wantK = dir.dot(wl.n) > 0.3 && (t.phi > 0.3 || BP.walking) ? 0.06 : 1;
    wl.k += (wantK - wl.k) * 0.15; wl.body.scale.y = wl.k; wl.cap.position.y = WH * wl.k;
    var on = BP.plan.walls !== false;
    wl.g.visible = on;
    wl.items.forEach(function (it) { it.visible = on && wl.k > 0.7 && (it !== t.backdrop || !!BP.plan.backdrop); });
  });
  t.r.render(t.scene, t.cam);
  BP.placePop();
};

/* =========================================================
   Glass menu on the selected object: Rotate, Style, Colour, Queue, Remove
   ========================================================= */
BP.select = function (id) {
  if (id !== BP.sel) { BP.popTab = ""; }
  BP.sel = id || 0;
  BP.showPop(); if (BP.t) { BP.buildSelFx(); }
  BP.draw2d(); BP.drawLists();
  if (BP.paneOpen && (BP.dock === "colours" || BP.dock === "team")) { BP.renderDock(); }
};

BP.popBtn = function (act, icon, label, cls) { return '<button class="pop-b' + (cls ? " " + cls : "") + '" data-pop="' + act + '" title="' + label + '">' + BB.icon(icon, 16) + "<span>" + label + "</span></button>"; };

/* the small menu floats above the object; its options (Actions, Style, Colour) open in the bar at the bottom,
   so they never cover the booth */
BP.showOpts = function (html, title) {
  var o = document.getElementById("pl-opts"); if (!o) { return; }
  if (!html) { o.classList.remove("is-open"); o.innerHTML = ""; return; }
  o.innerHTML = '<button class="opt-x" data-pop="closetab" aria-label="Close options">' + BB.icon("x", 15) + "</button>" + html;
  o.classList.add("is-open");
};
BP.showPop = function () {
  var pop = document.getElementById("obj-pop");
  if (!BP.sel) { pop.classList.remove("is-open"); BP.showOpts(""); return; }
  var main, sub = "";
  if (BP.sel === "queue") {
    main = "<b>Queue</b>" + BP.popBtn("flip", "flip", "Flip side") + '<span class="pop-tip">Drag the sign along the aisle</span>';
  } else {
    var it = PL.find(BP.plan, BP.sel); if (!it) { pop.classList.remove("is-open"); BP.showOpts(""); return; }
    var c = BP.cat(it), isEnd = PL.counter(BP.plan) && PL.counter(BP.plan).id === it.id;
    var styles = c.custom ? BP.FORMS.length > 1 : PL.designs(it.type).length > 1;
    main = "<b>" + BB.escape(BP.label(it)) + "</b>" +
      (c.person ? BP.popBtn("acts", "walk", "Actions", BP.popTab === "acts" ? "on" : "") : "") +
      BP.popBtn("rotate", "rotate", c.person ? "Turn" : "Rotate") +
      (c.custom ? BP.popBtn("place", c.top ? "cube" : "table", c.top ? "Put on floor" : "Put on table") : "") +
      (styles ? BP.popBtn("style", "shapes", "Style", BP.popTab === "style" ? "on" : "") : "") +
      (c.counter && !c.person ? BP.popBtn("queue", "users", isEnd ? "Queue ends here" : "Queue here", isEnd ? "set" : "") : "") +
      BP.popBtn("remove", "trash", "Remove", "danger");
    if (BP.popTab === "style") { sub = BP.styleSub(it); }
    if (BP.popTab === "acts") { sub = BP.actionsSub(it); }
  }
  pop.innerHTML = '<div class="pop-main">' + main + '<button class="pop-x" data-pop="close" aria-label="Close">' + BB.icon("x", 14) + "</button></div>";
  pop.classList.add("is-open");
  BP.showOpts(sub);
  var opts = document.getElementById("pl-opts");
  [pop, opts].forEach(function (root) {
    if (!root) { return; }
    root.querySelectorAll("button, input, label").forEach(function (b) { b.addEventListener("pointerdown", function (e) { e.stopPropagation(); }); });
    root.querySelectorAll("[data-pop]").forEach(function (b) { b.addEventListener("click", function (e) { e.stopPropagation(); BP.popAction(b.getAttribute("data-pop")); }); });
    root.querySelectorAll("[data-ocol]").forEach(function (b) { b.addEventListener("click", function () { BP.setColour(b.getAttribute("data-ocol"), true); }); });
    root.querySelectorAll("[data-design]").forEach(function (b) { b.addEventListener("click", function () { BP.setDesign(b.getAttribute("data-design")); }); });
    root.querySelectorAll("[data-form]").forEach(function (b) { b.addEventListener("click", function () { BP.setForm(b.getAttribute("data-form")); }); });
  });
  if (opts) { BP.wireActions(opts); }
  var pick = document.getElementById("ocol-pick");
  if (pick) {
    pick.addEventListener("input", function () { BP.setColour(pick.value, false); });
    pick.addEventListener("change", function () { BP.setColour(pick.value, true); });
  }
};

BP.colourSub = function (it) {
  var cur = (it.color || "").toLowerCase();
  return '<div class="pop-sub"><div class="ps-head"><b>Colour</b><span>Changes the main part of the ' + BB.escape(BP.cat(it).person ? "outfit" : BP.cat(it).label.toLowerCase()) + "</span></div><div class=\"pop-sw\">" +
    BP.SWATCH.object.map(function (c) { return '<button class="sw' + (cur === c.toLowerCase() ? " is-on" : "") + '" style="background:' + c + '" data-ocol="' + c + '" aria-label="Colour ' + c + '"></button>'; }).join("") +
    '<label class="sw sw-pick' + (cur && BP.SWATCH.object.map(function (x) { return x.toLowerCase(); }).indexOf(cur) === -1 ? " is-on" : "") + '" title="Pick any colour"><input type="color" id="ocol-pick" value="' + (it.color || "#C3A7CB") + '" aria-label="Pick any colour"></label>' +
    '<button class="pop-reset" data-ocol="">Default</button></div></div>';
};

BP.styleSub = function (it) {
  var c = BP.cat(it), cards;
  if (c.custom) {
    cards = BP.FORMS.filter(function (f) { return f[0] === "box" || c.cutout; }).map(function (f) {
      return '<button class="ds-card' + (c.form === f[0] ? " is-on" : "") + '" data-form="' + f[0] + '"><img src="' + BP.objThumb(it.type, it.color, f[0]) + '" alt=""><span>' + (c.top ? BP.FORMS_TOP[f[0]] : f[1]) + "</span><small>" + (c.form === f[0] ? "In use" : "Tap to use") + "</small></button>";
    }).join("");
  } else {
    cards = PL.designs(it.type).map(function (k) {
      var d = PL.catalog[k];
      return '<button class="ds-card' + (k === it.type ? " is-on" : "") + '" data-design="' + k + '"><img src="' + BP.objThumb(k, it.color, null, it) + '" alt=""><span>' + d.vname + "</span><small>" + (d.w * C) + " x " + (d.h * C) + " m" + (d.surface ? " · holds items" : "") + "</small></button>";
    }).join("");
  }
  return '<div class="pop-sub"><div class="ps-head"><b>' + (c.person ? "Choose an outfit" : "Choose a design") + "</b><span>" + (c.person ? "Same person, different look" : (c.top ? "Stays on the same table" : "Swaps in place if there is room")) + '</span></div><div class="ds-cards">' + cards + "</div></div>";
};

BP.setColour = function (v, done) {
  var it = PL.find(BP.plan, BP.sel); if (!it) { return; }
  it.color = v; BP.matCache = {};
  if (!done) { BP.build3d(); return; }
  BP.commit("Recoloured " + BP.cat(it).label); BP.refresh();
};

BP.setDesign = function (type) {
  var it = PL.find(BP.plan, BP.sel); if (!it || it.type === type) { return; }
  var res = PL.setDesign(BP.plan, it.id, type);
  if (!res) { BB.toast("There is not enough room for that design here. Move it to a clearer spot first."); return; }
  if (res.lost) { BB.toast(res.lost + " item" + (res.lost > 1 ? "s" : "") + " on top did not fit, so " + (res.lost > 1 ? "they were" : "it was") + " taken off."); }
  BP.commit("Changed to " + PL.catalog[type].vname); BP.refresh();
};

BP.setForm = function (form) {
  var it = PL.find(BP.plan, BP.sel); if (!it) { return; }
  BP.plan.customs.forEach(function (c) { if (c.key === it.type) { c.form = form; } });
  PL.registerCustoms(BP.plan); BP.commit("Changed " + BP.cat(it).label + " shape"); BP.refresh();
};

BP.popAction = function (a) {
  var id = BP.sel;
  if (a === "close") { BP.select(0); return; }
  if (a === "closetab") { BP.popTab = ""; BP.showPop(); return; }
  if (a === "colour" || a === "style" || a === "acts") { BP.popTab = BP.popTab === a ? "" : a; BP.showPop(); return; }
  if (a === "place") {
    var ci = PL.find(BP.plan, id), up = !BP.cat(ci).top;
    if (!BP.moveCustom(ci.type, up)) { BB.toast(up ? (BP.hasTable() ? "Your tables are full. Move something off a table first." : "Add a table first, then put it on top.") : "There is no free floor space for it. Move something first."); return; }
    BP.commit((up ? "Put on a table: " : "Put on the floor: ") + BP.nameOf(id)); BB.toast(up ? "It now sits on the table and moves with it." : "It is back on the floor.");
  }
  if (a === "flip") { BP.plan.queue.sx = Math.round((PL.W - BP.plan.queue.sx) * 2) / 2; BP.commit("Flipped the queue"); }
  if (a === "rotate") { if (!PL.rotate(BP.plan, id)) { BB.toast("Not enough space to rotate it here. Move it first."); return; } BP.commit("Rotated " + BP.nameOf(id)); }
  if (a === "remove") {
    var nm = BP.nameOf(id), lost = PL.remove(BP.plan, id); BP.sel = 0; BP.popTab = "";
    if (lost) { BB.toast("Removed the " + nm.toLowerCase() + " and the " + lost + " item" + (lost > 1 ? "s" : "") + " on it."); }
    BP.commit("Removed " + nm);
  }
  if (a === "queue") { BP.plan.queue.target = id; BP.commit("Queue to " + BP.nameOf(id)); BB.toast("Customers now queue to this " + BP.nameOf(id).toLowerCase() + "."); }
  BP.refresh();
};

/* The object menu sits just above the selected object, so it is clear which object it belongs to.
   To stop it shaking: it eases towards its spot instead of jumping, positions are whole pixels,
   it only moves when the spot changes by more than a pixel, and it never jumps between rules.
   If there is no room above the object (under the toolbar), it sits below the object instead. */
BP.popPos = null;
BP.placePop = function () {
  var pop = document.getElementById("obj-pop"), t = BP.t;
  if (!pop || !t) { return; }
  if (!BP.sel || BP.walking) { pop.style.opacity = BP.walking ? 0 : ""; BP.popPos = null; return; }
  var g = BP.sel === "queue" ? t.qsign : t.groups[BP.sel]; if (!g) { return; }
  var hr = t.host.getBoundingClientRect(), w = t.host.clientWidth, h = t.host.clientHeight;
  var topP = new THREE.Vector3(g.position.x, g.position.y + (g.userData.h || 1) + 0.08, g.position.z).project(t.cam);
  var botP = new THREE.Vector3(g.position.x, g.position.y, g.position.z).project(t.cam);
  var ax = (topP.x + 1) / 2 * w, ay = (1 - topP.y) / 2 * h, by = (1 - botP.y) / 2 * h;
  /* free area between the panels */
  var lo = 8, hi = w - 8, ceil = 8, floorY = h - 8;
  if (window.innerWidth > 900) {
    var L = document.getElementById("pl-left"), S = document.querySelector(".pl-side"), K = document.querySelector(".pl-ctrl"), T = document.querySelector(".pl-tools"), O = document.getElementById("pl-opts");
    if (L) { lo = L.getBoundingClientRect().right - hr.left + 10; }
    if (S) { hi = S.getBoundingClientRect().left - hr.left - 10; }
    if (K) { hi = Math.min(hi, K.getBoundingClientRect().left - hr.left - 10); }
    var TT = document.querySelector(".pl-title");
    if (T) { ceil = T.getBoundingClientRect().bottom - hr.top + 10; }
    if (TT) { ceil = Math.max(ceil, TT.getBoundingClientRect().bottom - hr.top + 10); }
    if (O && O.classList.contains("is-open")) { floorY = O.getBoundingClientRect().top - hr.top - 8; }
  }
  /* compact icons only when it really does not fit (with a margin so it does not flip back and forth) */
  var room = hi - lo;
  if (!pop.classList.contains("is-compact") && pop.offsetWidth > room) { pop.classList.add("is-compact"); pop.dataset.full = pop.offsetWidth; }
  else if (pop.classList.contains("is-compact") && +pop.dataset.full + 40 < room) { pop.classList.remove("is-compact"); }
  var pw = pop.offsetWidth, ph = pop.offsetHeight, below = ay - ph - 14 < ceil;
  var tx = Math.round(Math.max(lo, Math.min(hi - pw, ax - pw / 2)));
  var ty = Math.round(below ? Math.min(floorY - ph, by + 14) : ay - ph - 14);
  pop.classList.toggle("is-below", below);
  /* arrow points at the object even when the menu is pushed sideways */
  pop.style.setProperty("--ax", Math.round(Math.max(18, Math.min(pw - 18, ax - tx))) + "px");
  if (!BP.popPos || BP.popPos.id !== BP.sel) { BP.popPos = { id: BP.sel, x: tx, y: ty }; }
  else { BP.popPos.x += (tx - BP.popPos.x) * 0.35; BP.popPos.y += (ty - BP.popPos.y) * 0.35; }
  var nx = Math.round(BP.popPos.x + t.host.offsetLeft), ny = Math.round(BP.popPos.y + t.host.offsetTop);
  if (pop._x !== nx || pop._y !== ny) { pop._x = nx; pop._y = ny; pop.style.left = nx + "px"; pop.style.top = ny + "px"; }
  if (pop.style.opacity !== "1") { pop.style.opacity = 1; }
};

/* =========================================================
   2D plan (synced)
   ========================================================= */
BP.draw2d = function () { var host = document.getElementById("plan2d"); if (host) { host.innerHTML = PL.svg(BP.plan, { sel: BP.sel }); } };
BP.svgCell = function (e) {
  var svg = document.querySelector("#plan2d svg"), pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
  var p = pt.matrixTransform(svg.getScreenCTM().inverse()); return { x: p.x / PL.U, y: p.y / PL.U };
};
BP.wire2d = function () {
  var host = document.getElementById("plan2d");
  host.addEventListener("pointerdown", function (e) {
    var g = e.target.closest("[data-obj], [data-queue]"); if (!g) { if (BP.sel) { BP.select(0); } return; }
    e.preventDefault();
    var p = BP.svgCell(e);
    if (g.hasAttribute("data-queue")) { BP.drag2d = { id: "queue", x0: e.clientX, y0: e.clientY, moved: false }; return; }
    var it = PL.find(BP.plan, parseInt(g.getAttribute("data-obj"), 10));
    BP.drag2d = { id: it.id, x0: e.clientX, y0: e.clientY, moved: false, ox: p.x - it.x, oy: p.y - it.y };
  });
  window.addEventListener("pointermove", function (e) {
    var d = BP.drag2d; if (!d) { return; }
    if (!d.moved && Math.abs(e.clientX - d.x0) + Math.abs(e.clientY - d.y0) < 4) { return; }
    if (!d.moved) { d.moved = true; BP.sel = d.id; BP.popTab = ""; BP.showPop(); }
    var p = BP.svgCell(e);
    if (d.id === "queue") { var sx = Math.max(-2.5, Math.min(PL.W + 2.5, Math.round(p.x * 2) / 2)); if (sx !== BP.plan.queue.sx) { BP.plan.queue.sx = sx; BP.draw2d(); if (BP.t) { BP.buildQueue(); } } return; }
    var it = PL.find(BP.plan, d.id), nx = Math.round(p.x - d.ox), ny = Math.round(p.y - d.oy);
    d.cell = { x: Math.floor(p.x), y: Math.floor(p.y) };
    if ((nx !== it.x || ny !== it.y) && PL.fits(BP.plan, it.id, it.type, nx, ny, it.r)) {
      PL.shift(BP.plan, it, nx, ny); BP.draw2d();
      if (BP.t) { BP.syncGoals(); BP.buildQueue(); BP.buildSelFx(); }
    }
  });
  window.addEventListener("pointerup", function () {
    var d = BP.drag2d; if (!d) { return; }
    BP.drag2d = null;
    if (!d.moved) { BP.select(d.id); return; }
    var di = d.id !== "queue" ? PL.find(BP.plan, d.id) : null;
    if (di && BP.dropOnTable(di, d.cell)) { BP.commit("Put on a table: " + BP.nameOf(d.id)); BP.refresh(); return; }
    BP.commit(d.id === "queue" ? "Moved the queue" : "Moved " + BP.nameOf(d.id)); BP.refresh();
  });
};

/* =========================================================
   Customer walkthrough
   ========================================================= */
BP.pointAt = function (pts, u) {
  var total = 0, lens = [];
  for (var i = 0; i < pts.length - 1; i++) { var l = Math.hypot(pts[i + 1].x - pts[i].x, pts[i + 1].y - pts[i].y); lens.push(l); total += l; }
  var d = u * total;
  for (var j = 0; j < lens.length; j++) { if (d <= lens[j] || j === lens.length - 1) { var k = lens[j] ? Math.min(1, d / lens[j]) : 1; return { x: pts[j].x + (pts[j + 1].x - pts[j].x) * k, y: pts[j].y + (pts[j + 1].y - pts[j].y) * k }; } d -= lens[j]; }
  return pts[pts.length - 1];
};
BP.walk = function () {
  if (BP.walking) { BP.stopWalk(); return; }
  var pts = PL.path(BP.plan), start = pts[0], side = start.x < PL.W / 2 ? -1 : 1;
  pts = [{ x: start.x + side * 1.2, y: start.y }].concat(pts);
  var end = pts[pts.length - 1];
  BP.walking = { pts: pts, start: performance.now(), dur: 9000, look: new THREE.Vector3(1, 0, -0.6).normalize(), focus: new THREE.Vector3(end.x * C, 0.9, (end.y - 1.2) * C) };
  BP.t.cam.fov = 62; BP.t.cam.updateProjectionMatrix();
  document.getElementById("walk-btn").innerHTML = BB.icon("x", 17) + " Stop";
  document.getElementById("stage").classList.add("is-walking"); BP.fitView();
};
BP.stopWalk = function () {
  BP.walking = null;
  if (BP.t) { BP.t.cam.fov = 30; BP.t.cam.updateProjectionMatrix(); }
  document.getElementById("walk-btn").innerHTML = BB.icon("walk", 17) + " Walkthrough";
  document.getElementById("stage").classList.remove("is-walking"); BP.fitView();
  var w = document.getElementById("pg-walker"); if (w) { w.setAttribute("cx", -999); }
};
BP.walkStep = function () {
  var wk = BP.walking, t = BP.t, u = Math.min(1, (performance.now() - wk.start) / wk.dur);
  var pos = BP.pointAt(wk.pts, u), ahead = BP.pointAt(wk.pts, Math.min(1, u + 0.05));
  var dir = new THREE.Vector3(ahead.x - pos.x, 0, ahead.y - pos.y), eye = new THREE.Vector3(pos.x * C, 1.6, pos.y * C);
  var toFocus = wk.focus.clone().sub(eye).setY(0).normalize();
  if (dir.length() > 0.0001) { dir.normalize(); wk.look.lerp(dir.multiplyScalar(0.45).add(toFocus.multiplyScalar(0.55)).normalize(), 0.06); }
  t.cam.position.copy(eye); t.cam.lookAt(eye.x + wk.look.x * 2, 1.15, eye.z + wk.look.z * 2);
  var w = document.getElementById("pg-walker"); if (w) { w.setAttribute("cx", pos.x * PL.U); w.setAttribute("cy", pos.y * PL.U); }
  if (u >= 1) { BP.stopWalk(); }
};

/* =========================================================
   History: every change is saved, and you can go back to any earlier set-up
   ========================================================= */
BP.snap = function () { return JSON.parse(JSON.stringify({ items: BP.plan.items, queue: BP.plan.queue, style: BP.plan.style, colors: BP.plan.colors, walls: BP.plan.walls !== false })); };
BP.commit = function (label) {
  var h = BP.plan.history, s = BP.snap(); s.at = Date.now(); s.label = label;
  if (h.length && s.at - h[0].at < 1500 && h[0].label === label) { h[0] = s; } else { h.unshift(s); }
  if (h.length > 12) { h.length = 12; }
  if (BP.dock === "history") { setTimeout(BP.renderDock, 0); }
};
BP.ago = function (t) {
  var s = Math.round((Date.now() - t) / 1000);
  if (s < 45) { return "just now"; } if (s < 3600) { return Math.round(s / 60) + " min ago"; } if (s < 86400) { return Math.round(s / 3600) + " h ago"; }
  return Math.round(s / 86400) + " days ago";
};
BP.restore = function (i) {
  var s = BP.plan.history[i]; if (!s) { return; }
  BP.plan.items = s.items.filter(function (it) { return PL.catalog[it.type]; }).map(function (it) { return Object.assign({}, it); });
  BP.plan.queue = Object.assign({}, s.queue); BP.plan.style = s.style; BP.plan.colors = Object.assign({}, s.colors || {});
  if (s.walls !== undefined) { BP.setWalls(s.walls, true); }
  BP.sel = 0; BP.plan.style = "standard"; if (BP.M) { BP.applyStyle(); }
  BP.commit("Went back to: " + s.label); BP.refresh(); BB.toast("Set-up restored. You can switch back from History any time.");
};

/* =========================================================
   Left panel: Objects, Look, Colours, Team, Suggestions and History in one place,
   so nothing pops up over the booth. The tabs stay visible when the panel is folded.
   ========================================================= */
BP.TABS = [["objects", "cube", "Objects"], ["team", "users", "Team"], ["suggest", "wand", "Suggest"], ["history", "history", "History"]];
BP.trayIcon = function (k) {
  var c = PL.catalog[k];
  if (c.custom) { return '<span class="tray-ic is-img" style="background-color:' + c.tint + ";background-image:url('" + (c.cutout || c.image) + "')\"></span>"; }
  return '<span class="tray-ic' + (c.top ? " is-top" : "") + '">' + PL.icon(k, 20) + "</span>";
};
BP.tray = function () {
  var row = function (k) {
    var c = PL.catalog[k], sub = c.custom ? (c.top ? "On a table · yours" : (c.w * C) + " x " + (c.h * C) + " m · yours") : (c.top ? (c.power ? "Plugs in · 3 designs" : "Table-top · 3 designs") : (c.w * C) + " x " + (c.h * C) + " m · 3 designs");
    return '<div class="tray-item" draggable="true" data-type="' + k + '" title="' + BB.escape(c.label) + '">' + BP.trayIcon(k) + '<span class="tray-txt">' + BB.escape(c.label) + "<small>" + sub + "</small></span>" +
      (c.custom ? '<button class="plus del" data-delcustom="' + k + '" aria-label="Delete ' + BB.escape(c.label) + '">' + BB.icon("trash", 14) + "</button>" : "") +
      '<button class="plus" data-add="' + k + '" aria-label="Add ' + BB.escape(c.label) + '">' + BB.icon("plus", 14) + "</button></div>";
  };
  var keys = Object.keys(PL.catalog), floor = keys.filter(function (k) { var c = PL.catalog[k]; return !c.custom && !c.top && !c.person && c.v === 0; });
  var tops = keys.filter(function (k) { var c = PL.catalog[k]; return c.top && c.v === 0; }), mine = keys.filter(function (k) { return PL.catalog[k].custom; });
  var person = function (role, label, sub) {
    return '<div class="tray-item" draggable="true" data-type="person:' + role + '" title="' + label + '"><span class="tray-ic is-person ' + role + '">' + PL.icon("person", 20) + '</span><span class="tray-txt">' + label + "<small>" + sub + '</small></span><button class="plus" data-add="person:' + role + '" aria-label="Add ' + label + '">' + BB.icon("plus", 14) + "</button></div>";
  };
  /* objects for this kind of booth first, then the basics, then everything else folded away */
  var cat = PL.booth ? PL.booth.cat : "fnb", kind = function (k) { return (PL.GROUP_CATS[PL.catalog[k].group || k] || "all"); };
  var mineFirst = function (list) { return list.filter(function (k) { return kind(k).indexOf(cat) > -1; }); };
  var basics = function (list) { return list.filter(function (k) { return kind(k) === "all"; }); };
  var others = function (list) { return list.filter(function (k) { var c = kind(k); return c !== "all" && c.indexOf(cat) === -1; }); };
  var catName = { fnb: "food and drink", retail: "retail", workshop: "workshop" }[cat] || cat;
  return '<div class="tray-sub">People</div>' + person("owner", "Business owner", "You · pick what you do") + person("helper", "Helper", "Add as many as you need") +
    '<div class="tray-sub">For your ' + catName + " booth</div>" + mineFirst(floor).concat(mineFirst(tops)).map(row).join("") +
    '<div class="tray-sub">Basics</div>' + basics(floor).concat(basics(tops)).map(row).join("") +
    '<details class="tray-more"><summary>' + BB.icon("chevDown", 15) + " More objects</summary>" + others(floor).concat(others(tops)).map(row).join("") + "</details>" +
    (mine.length ? '<div class="tray-sub">Your photo objects</div>' + mine.map(row).join("") : "") +
  '<button class="custom-btn" id="custom-open" title="Make an object from a photo">' + BB.icon("sparkle", 16) + "<span>Make an object from a photo</span></button>" +
  '<form class="custom-form" id="custom-form" hidden><label class="cf-drop" id="cf-drop"><input type="file" id="cf-file" accept="image/*" hidden><span id="cf-preview">' + BB.icon("plus", 18) + "<b>Upload a photo</b><small>A product, display or sign. A plain background works best.</small></span></label>" +
    '<p class="cf-note" id="cf-note" hidden></p>' +
    '<input class="input" id="cf-name" placeholder="Name, e.g. Cake display" maxlength="28">' +
    '<div class="cf-place" role="group" aria-label="Where it goes"><button type="button" class="is-on" data-cfplace="floor">' + BB.icon("cube", 15) + ' On the floor</button><button type="button" data-cfplace="table">' + PL.icon("table", 15) + " On a table</button></div>" +
    '<label class="cf-lbl">Make it as<select class="select" id="cf-form"><option value="auto">Best match</option><option value="stand">Product on a stand</option><option value="box">Display box</option><option value="round">Round stand</option><option value="standee">Standee</option></select></label>' +
    '<div class="cf-row" id="cf-size"><label>Width<select class="select" id="cf-w"><option value="1">0.5 m</option><option value="2" selected>1 m</option><option value="3">1.5 m</option><option value="4">2 m</option></select></label>' +
    '<label>Depth<select class="select" id="cf-h"><option value="1" selected>0.5 m</option><option value="2">1 m</option></select></label></div>' +
    '<div class="cf-row"><button type="button" class="btn btn-small" id="cf-cancel">Cancel</button><button class="btn btn-small btn-primary" id="cf-save">Build in 3D</button></div></form>';
};
BP.renderTray = function () { var el = document.getElementById("tray-list"); if (!el) { return; } el.innerHTML = BP.tray(); BP.wireTrayItems(); };

BP.readImage = function (file, done, max) {
  var r = new FileReader();
  r.onload = function () { var im = new Image(); im.onload = function () { var k = Math.min(1, (max || 512) / Math.max(im.width, im.height)), cv = document.createElement("canvas"); cv.width = Math.round(im.width * k); cv.height = Math.round(im.height * k); cv.getContext("2d").drawImage(im, 0, 0, cv.width, cv.height); done(cv.toDataURL("image/jpeg", 0.85)); }; im.src = r.result; };
  r.readAsDataURL(file);
};

/* draw a picture into a frame of the given shape: "cover" fills it, "contain" shows all of it */
BP.fitTexCache = {};
BP.fitTex = function (url, aspect, mode, bg, done) {
  var key = url.length + url.slice(-40) + aspect + mode;
  if (BP.fitTexCache[key]) { done(BP.fitTexCache[key]); return; }
  var im = new Image();
  im.onload = function () {
    var H = 1024, W = Math.round(H * aspect), cv = document.createElement("canvas"); cv.width = W; cv.height = H;
    var g = cv.getContext("2d"), ia = im.width / im.height, dw, dh;
    g.fillStyle = bg || "#FFFFFF"; g.fillRect(0, 0, W, H);
    if ((mode === "cover") === (ia > aspect)) { dh = H; dw = H * ia; } else { dw = W; dh = W / ia; }
    g.drawImage(im, (W - dw) / 2, (H - dh) / 2, dw, dh);
    var t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4;
    BP.fitTexCache[key] = t; done(t);
  };
  im.src = url;
};
/* the seller's own feature-wall background and banner poster */
BP.applyBranding = function () {
  if (!BP.M) { return; }
  var M = BP.M;
  if (BP.plan.backdrop) { BP.fitTex(BP.plan.backdrop, BW / (WH - 0.06), "cover", "#FFFFFF", function (tx) { M.backdrop.map = tx; M.backdrop.needsUpdate = true; }); }
  if (BP.plan.bannerImg) { BP.fitTex(BP.plan.bannerImg, 0.4 / 1.82, "contain", "#FFFFFF", function (tx) { M.banner.map = tx; M.banner.needsUpdate = true; }); }
  else { M.banner.map = BP.tex.banner; M.banner.needsUpdate = true; }
};

/* pick the main colours out of an uploaded palette, logo or mood board */
BP.hex = function (c) { return "#" + c.map(function (v) { return ("0" + Math.round(Math.max(0, Math.min(255, v))).toString(16)).slice(-2); }).join(""); };
BP.rgb = function (h) { var n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
BP.mix = function (a, b, k) { var x = BP.rgb(a), y = BP.rgb(b); return BP.hex([0, 1, 2].map(function (i) { return x[i] * (1 - k) + y[i] * k; })); };
BP.paletteFrom = function (url, done) {
  var im = new Image();
  im.onload = function () {
    var cv = document.createElement("canvas"); cv.width = 64; cv.height = 64; var g = cv.getContext("2d"); g.drawImage(im, 0, 0, 64, 64);
    var d = g.getImageData(0, 0, 64, 64).data, px = [];
    for (var i = 0; i < d.length; i += 4) { if (d[i + 3] > 128) { px.push([d[i], d[i + 1], d[i + 2]]); } }
    if (!px.length) { done([]); return; }
    var lum = function (c) { return 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]; };
    px.sort(function (a, b) { return lum(a) - lum(b); });
    var K = 6, cen = [], cnt = [];
    for (var k = 0; k < K; k++) { cen.push(px[Math.floor((k + 0.5) / K * px.length)].slice()); }
    for (var it = 0; it < 10; it++) {
      var sum = cen.map(function () { return [0, 0, 0]; }); cnt = cen.map(function () { return 0; });
      px.forEach(function (c) {
        var best = 0, bd = 1e9;
        cen.forEach(function (m, j) { var dd = (c[0] - m[0]) * (c[0] - m[0]) + (c[1] - m[1]) * (c[1] - m[1]) + (c[2] - m[2]) * (c[2] - m[2]); if (dd < bd) { bd = dd; best = j; } });
        sum[best][0] += c[0]; sum[best][1] += c[1]; sum[best][2] += c[2]; cnt[best]++;
      });
      cen = cen.map(function (m, j) { return cnt[j] ? [sum[j][0] / cnt[j], sum[j][1] / cnt[j], sum[j][2] / cnt[j]] : m; });
    }
    var out = cen.map(function (c, j) { return { c: BP.hex(c), n: cnt[j] }; }).filter(function (o) { return o.n > px.length * 0.02; });
    out = out.filter(function (o, j) { return !out.slice(0, j).some(function (q) { var a = BP.rgb(o.c), b = BP.rgb(q.c); return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]) < 30; }); });
    done(out.sort(function (a, b) { return b.n - a.n; }).map(function (o) { return o.c; }));
  };
  im.src = url;
};
/* turn a palette into a full look: light colours for walls, the boldest for the feature wall, the darkest for lines */
BP.lookFromPalette = function (cols) {
  var info = cols.map(function (h) { var c = BP.rgb(h), mx = Math.max.apply(null, c), mn = Math.min.apply(null, c); return { h: h, l: (0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]) / 255, s: mx ? (mx - mn) / mx : 0 }; });
  var byL = info.slice().sort(function (a, b) { return b.l - a.l; }), byS = info.slice().sort(function (a, b) { return b.s - a.s; });
  var light = byL[0].h, dark = byL[byL.length - 1], mid = byL[Math.floor(byL.length / 2)].h;
  var wall = BP.mix(light, "#FFFFFF", 0.55), accent = dark.l < 0.35 ? dark.h : BP.mix(dark.h, "#2B2A2C", 0.6);
  return {
    swatches: cols.slice(0, 6), wall: wall, back: byS[0].h, floor: BP.mix(mid, "#D8C8B0", 0.45), plinth: BP.mix(wall, "#EEEBE6", 0.5), aisle: BP.mix(wall, "#DAD6D0", 0.6),
    trim: accent, body: BP.mix(light, "#FFFFFF", 0.75), wood: BP.mix(byL[Math.min(byL.length - 1, 2)].h, "#B08560", 0.4), fabric: (byS[1] || byS[0]).h, accent: accent
  };
};
BP.PAL_KEYS = [["wall", "Walls"], ["back", "Feature wall"], ["floor", "Floor"], ["wood", "Wood"], ["fabric", "Fabric"], ["accent", "Lines"]];

BP.drawLists = function () {
  var host = document.getElementById("placed");
  if (host) {
    var floor = BP.plan.items.filter(function (it) { return !BP.cat(it).top; });
    var h = floor.map(function (it) {
      var line = function (x, top) {
        var c = BP.cat(x);
        return '<button class="placed' + (top ? " is-top" : "") + (x.id === BP.sel ? " is-sel" : "") + '" data-pick="' + x.id + '">' + (c.custom ? '<span class="pl-ic is-img" style="background-image:url(\'' + (c.cutout || c.image) + "')\"></span>" : '<span class="pl-ic">' + PL.icon(x.type, 15) + "</span>") + BB.escape(BP.label(x)) + "</button>";
      };
      return line(it) + (BP.cat(it).surface ? PL.topsOn(BP.plan, it).map(function (t) { return line(t, true); }).join("") : "");
    }).join("");
    host.innerHTML = h || '<p class="muted" style="font-size:14.5px">Nothing yet. Drag an object into the plan.</p>';
    host.querySelectorAll("[data-pick]").forEach(function (b) { b.addEventListener("click", function () { BP.select(parseInt(b.getAttribute("data-pick"), 10)); }); });
  }
  BP.drawSummary();
};

BP.drawSummary = function () {
  var used = 0, plugs = 0;
  BP.plan.items.forEach(function (it) { var c = BP.cat(it); if (c.power) { plugs++; } if (c.top || c.person) { return; } var s = PL.size(it.type, it.r); used += s.w * s.h; });
  var pct = Math.round(used / (PL.W * PL.H) * 100), list = PL.packing(BP.plan), fromPlan = list.length - PL.baseCheck.length - (BP.plan.extraPack || []).length;
  document.getElementById("pl-sum").innerHTML = '<div class="side-h"><b>Booth summary</b></div>' +
    '<div class="sum-grid"><div><small>Objects</small><b>' + BP.plan.items.length + '</b></div><div><small>Floor used</small><b>' + pct + '%</b></div><div><small>Walls</small><b>' + (BP.plan.walls === false ? "Off" : "On") + "</b></div></div>" +
    '<div class="sum-bar"><i style="width:' + Math.min(100, pct) + '%"></i></div>' +
    BP.teamLine() +
    (plugs ? '<p class="sum-note' + (PL.booth && !PL.booth.power ? " is-warn" : "") + '">' + BB.icon("plug", 15) + "<span>" + plugs + " appliance" + (plugs > 1 ? "s need" : " needs") + " power. " + (PL.booth && !PL.booth.power ? "This booth type has no power point, so bring battery items or ask the organiser.</span></p>" : "Plug points are on the back wall.</span></p>") : "") +
    '<a class="pack-link" href="my-events.html?event=' + BP.ev.id + '#pack">' + BB.icon("check", 16) + "<span><b>Packing list · " + list.length + " items</b><small>" + Math.max(0, fromPlan) + " from this plan. Tick them off in My Events.</small></span>" + BB.icon("chevRight", 16) + "</a>";
};

/* open a tab; tapping the open tab folds the panel */
BP.openDock = function (name) {
  if (BP.dock === name && BP.paneOpen) { BP.setPane(false); return; }
  BP.dock = name; BP.setPane(true);
};
BP.closeDock = function () { BP.setPane(false); };
BP.setPane = function (v) {
  BP.paneOpen = v;
  try { localStorage.setItem("bb_tray_collapsed", v ? "" : "1"); } catch (e) {}
  var L = document.getElementById("pl-left"); if (L) { L.classList.toggle("is-folded", !v); }
  BP.renderDock();
  setTimeout(BP.fitView, 320);
};
BP.paneHead = function (title, note) {
  return '<div class="sp-head"><b>' + title + "</b>" + (note ? "<span>" + note + "</span>" : "") + "</div>";
};
BP.renderDock = function () {
  document.querySelectorAll("[data-dock]").forEach(function (b) { b.classList.toggle("is-on", b.getAttribute("data-dock") === BP.dock && BP.paneOpen); });
  var pane = document.getElementById("side-pane"), h = "", keepScroll = pane ? pane.scrollTop : 0, same = pane && pane.getAttribute("data-tab") === BP.dock;
  if (!pane) { return; }
  if (!BP.paneOpen) { pane.innerHTML = ""; pane.removeAttribute("data-tab"); return; }
  if (BP.dock === "objects") {
    h = BP.paneHead("Objects", "Drag into the booth, or tap +") + '<div id="tray-list"></div><div class="tray-sub">In your booth</div><div class="placed-list" id="placed"></div>';
  } else if (BP.dock === "style") {
    h = BP.paneHead("Look", "Point at a look to preview it. Tap to use it.") + '<div class="look-list">' +
      Object.keys(BP.STYLES).map(function (k) {
        var st = BP.STYLES[k], on = BP.plan.style === k;
        return '<button class="pick-card look-card' + (on ? " is-on" : "") + '" data-style="' + k + '"><span class="pc-img"><img src="' + BP.lookThumb(k) + '" alt=""></span>' +
          '<span class="pc-txt"><b>' + st.name + "</b><small>" + st.note + '</small><span class="look-dots">' + [st.wall, st.back, st.floor, st.wood, st.fabric, st.accent].map(function (c) { return '<i style="background:' + c + '"></i>'; }).join("") + "</span></span>" +
          (on ? '<span class="pc-badge">' + BB.icon("check", 12) + " In use</span>" : "") + "</button>";
      }).join("") + "</div>" +
      (BP.plan.myLook ? '<div class="pal-edit"><b>Fine-tune your palette</b><small>Tap a colour to change it.</small><div class="pal-grid">' +
        BP.PAL_KEYS.map(function (k) { return '<label class="pal-cell"><span class="pal-sw" style="background:' + BP.plan.myLook[k[0]] + '"><input type="color" data-pal="' + k[0] + '" value="' + BP.plan.myLook[k[0]] + '"></span><small>' + k[1] + "</small></label>"; }).join("") +
        '</div><button class="bc-del" data-undo="myLook">Remove your palette</button></div>' : "") +
      '<div class="brand-card is-palette"><span class="bc-img">' + BB.icon("brush", 18) + '</span><span class="bc-txt"><b>' + (BP.plan.myLook ? "Use another palette" : "Make a look from your colours") + "</b><small>Upload your brand palette, logo or a mood board. We pick out the main colours and build a look from them.</small>" +
        '<span class="bc-acts"><label class="bc-btn">' + BB.icon("plus", 13) + ' Upload palette<input type="file" accept="image/*" data-up="palette" hidden></label></span></span></div>' +
      '<button class="link-btn sp-more" data-goto="colours">' + BB.icon("brush", 14) + " Fine-tune wall and floor colours</button>";
  } else if (BP.dock === "colours") {
    var p = BP.pal(), it = typeof BP.sel === "number" ? PL.find(BP.plan, BP.sel) : null;
    var row = function (key, label, list, cur) {
      var known = list.map(function (c) { return c.toLowerCase(); }), custom = cur && known.indexOf(cur.toLowerCase()) === -1;
      return '<div class="sw-row"><span>' + label + '</span><div class="sw-list">' + list.map(function (c) { return '<button class="sw' + (cur && cur.toLowerCase() === c.toLowerCase() ? " is-on" : "") + '" style="background:' + c + '" data-col="' + key + '" data-v="' + c + '" aria-label="' + c + '"></button>'; }).join("") +
        '<label class="sw sw-pick' + (custom ? " is-on" : "") + '" title="Pick any colour"' + (custom ? ' style="background:' + cur + '"' : "") + '><input type="color" data-colpick="' + key + '" value="' + (cur || "#C3A7CB") + '" aria-label="Pick any colour for ' + label + '"></label></div></div>';
    };
    var brand = function (key, title, note, url) {
      return '<div class="brand-card"><span class="bc-img"' + (url ? ' style="background-image:url(\'' + url + '\')"' : "") + ">" + (url ? "" : BB.icon("plus", 18)) + '</span><span class="bc-txt"><b>' + title + "</b><small>" + note + "</small>" +
        '<span class="bc-acts"><label class="bc-btn">' + BB.icon("plus", 13) + (url ? " Change" : " Upload") + '<input type="file" accept="image/*" data-up="' + key + '" hidden></label>' + (url ? '<button class="bc-del" data-undo="' + key + '">Remove</button>' : "") + "</span></span></div>";
    };
    h = BP.paneHead("Colours", "Walls, floor and your own branding") +
      row("wall", "Side walls", BP.SWATCH.wall, p.wall) + row("back", "Feature wall", BP.SWATCH.back, p.back) + row("floor", "Floor", BP.SWATCH.floor, p.floor) +
      (it ? row("object", BB.escape(BP.label(it)), BP.SWATCH.object, it.color || "") : '<div class="sw-row muted"><span>Objects</span><em>Tap an object in the booth, then Colour</em></div>') +
      '<button class="link-btn sp-more" id="col-reset">' + BB.icon("sync", 14) + " Reset to the look</button>" +
      '<div class="tray-sub">Your branding</div>' +
      brand("backdrop", "Feature wall background", "A photo, pattern or mural that covers the back wall.", BP.plan.backdrop) +
      brand("bannerImg", "Banner poster", "Your real roll-up poster. It shows on every roll-up banner.", BP.plan.bannerImg);

  } else if (BP.dock === "team") {
    h = BP.teamPane();
  } else if (BP.dock === "suggest") {
    h = BP.paneHead("Suggested set-ups", "Your people and photo objects are kept") + '<div class="look-list">' +
      PL.SUGGEST.map(function (sg) {
        return '<button class="pick-card sg-card" data-sg="' + sg.id + '"><span class="pc-img is-plan">' + PL.svg(PL.suggestPlan(sg), { mini: true }) + '</span><span class="pc-txt"><span class="pc-tag">' + sg.tag + "</span><b>" + sg.name + "</b><small>" + sg.note + "</small></span></button>";
      }).join("") + "</div>";
  } else if (BP.dock === "history") {
    var hist = BP.plan.history;
    h = BP.paneHead("History", "Saved automatically. Go back to any set-up.") + '<div class="hist">' +
      hist.map(function (s, i) {
        var plan = { items: s.items.filter(function (x) { return PL.catalog[x.type]; }), queue: s.queue };
        return '<div class="hist-item' + (i === 0 ? " is-now" : "") + '"><span class="hist-plan">' + PL.svg(plan, { mini: true }) + "</span><span class=\"hist-txt\"><b>" + BB.escape(s.label) + "</b><small>" + BP.ago(s.at) + " · " + (BP.STYLES[s.style] || BP.STYLES.minimal).name + "</small>" +
          (i === 0 ? '<span class="chip">Current</span>' : '<button class="hist-go" data-restore="' + i + '">' + BB.icon("history", 13) + " Go back</button>") + "</span></div>";
      }).join("") + "</div>";
  }
  pane.innerHTML = h; pane.setAttribute("data-tab", BP.dock);
  pane.scrollTop = same ? keepScroll : 0;
  if (BP.dock === "objects") { BP.renderTray(); BP.drawLists(); }
  pane.querySelectorAll("[data-goto]").forEach(function (b) { b.addEventListener("click", function () { BP.openDock(b.getAttribute("data-goto")); }); });
  pane.querySelectorAll("[data-style]").forEach(function (b) {
    var k = b.getAttribute("data-style");
    b.addEventListener("mouseenter", function () { BP.previewLook(k); });
    b.addEventListener("mouseleave", function () { BP.previewLook(""); });
    b.addEventListener("click", function () {
      BP.previewLook(""); if (BP.plan.style === k) { return; }
      BP.plan.style = k; BP.plan.colors = {}; BP.applyStyle(); BP.commit("Look: " + BP.STYLES[k].name); BP.refresh(); BP.renderDock();
      BB.toast(BP.STYLES[k].name + " is on. Your earlier look is in History.");
    });
  });
  /* any colour, from the picker next to the swatches */
  pane.querySelectorAll("[data-colpick]").forEach(function (inp) { inp.addEventListener("change", function () {
    var k = inp.getAttribute("data-colpick"), v = inp.value;
    if (k === "object") { var io = PL.find(BP.plan, BP.sel); if (!io) { return; } io.color = v; BP.matCache = {}; BP.commit("Recoloured " + BP.label(io)); }
    else { BP.plan.colors[k] = v; BP.applyStyle(); BP.commit("Changed " + (k === "back" ? "feature wall" : k) + " colour"); }
    BP.refresh(); BP.renderDock();
  }); });
  /* uploads: feature-wall background, banner poster, colour palette */
  pane.querySelectorAll("[data-up]").forEach(function (inp) { inp.addEventListener("change", function () {
    var k = inp.getAttribute("data-up"), f = inp.files[0]; if (!f) { return; }
    BP.readImage(f, function (url) {
      if (k === "palette") {
        BP.paletteFrom(url, function (cols) {
          if (cols.length < 2) { BB.toast("We could not find enough colours in that image. Try one with clear colour blocks."); return; }
          BP.plan.myLook = BP.lookFromPalette(cols); BP.syncMyLook(); BP.plan.style = "custom"; BP.plan.colors = {}; BP.applyStyle();
          BP.commit("Look: your palette"); BP.refresh(); BP.renderDock(); BB.toast("Your palette is on. Tap a colour below to fine-tune it.");
        });
        return;
      }
      var keep = BP.plan[k]; BP.plan[k] = url;
      try { BP.save(); } catch (err) { BP.plan[k] = keep; BB.toast("That picture is too large to save. Try a smaller one."); return; }
      BP.applyBranding(); BP.commit(k === "backdrop" ? "New feature wall background" : "New banner poster"); BP.refresh(); BP.renderDock();
      if (k === "bannerImg" && !BP.plan.items.some(function (x) { return x.type === "banner"; })) { BB.toast("Poster saved. Add a roll-up banner from Objects to see it."); }
    }, k === "palette" ? 400 : 1400);
  }); });
  pane.querySelectorAll("[data-undo]").forEach(function (b) { b.addEventListener("click", function () {
    var k = b.getAttribute("data-undo");
    if (k === "myLook") { delete BP.plan.myLook; BP.syncMyLook(); BP.applyStyle(); BP.commit("Removed your palette"); }
    else { delete BP.plan[k]; BP.applyBranding(); BP.commit(k === "backdrop" ? "Removed feature wall background" : "Removed banner poster"); }
    BP.refresh(); BP.renderDock();
  }); });
  pane.querySelectorAll("[data-pal]").forEach(function (inp) {
    inp.addEventListener("input", function () { inp.parentNode.style.background = inp.value; });
    inp.addEventListener("change", function () {
      var k = inp.getAttribute("data-pal"); BP.plan.myLook[k] = inp.value; if (k === "accent") { BP.plan.myLook.trim = inp.value; }
      if (k === "wall") { BP.plan.myLook.plinth = BP.mix(inp.value, "#EEEBE6", 0.5); BP.plan.myLook.aisle = BP.mix(inp.value, "#DAD6D0", 0.6); BP.plan.myLook.body = BP.mix(inp.value, "#FFFFFF", 0.5); }
      BP.syncMyLook(); BP.plan.style = "custom"; BP.applyStyle(); BP.commit("Tuned your palette"); BP.refresh(); BP.renderDock();
    });
  });
  pane.querySelectorAll("[data-col]").forEach(function (b) { b.addEventListener("click", function () {
    var k = b.getAttribute("data-col"), v = b.getAttribute("data-v");
    if (k === "object") { var it2 = PL.find(BP.plan, BP.sel); if (!it2) { return; } it2.color = it2.color === v ? "" : v; BP.matCache = {}; BP.commit("Recoloured " + BP.label(it2)); }
    else { BP.plan.colors[k] = v; BP.applyStyle(); BP.commit("Changed " + (k === "back" ? "feature wall" : k) + " colour"); }
    BP.refresh(); BP.renderDock();
  }); });
  var cr = document.getElementById("col-reset"); if (cr) { cr.addEventListener("click", function () { BP.plan.colors = {}; BP.plan.items.forEach(function (x) { x.color = ""; }); BP.applyStyle(); BP.commit("Reset colours"); BP.refresh(); BP.renderDock(); }); }
  pane.querySelectorAll("[data-sg]").forEach(function (b) { b.addEventListener("click", function () {
    var sg = PL.SUGGEST.filter(function (x) { return x.id === b.getAttribute("data-sg"); })[0], np = PL.suggestPlan(sg);
    var mine = BP.plan.items.filter(function (it) { return BP.cat(it).custom || BP.cat(it).person; });
    BP.plan.items = np.items; BP.plan.queue = np.queue; BP.sel = 0;
    mine.forEach(function (it) { var n = PL.add(BP.plan, it.type, it.x, it.y); if (n) { ["role", "name", "acts", "color", "gender", "skin", "hair"].forEach(function (k) { if (it[k] !== undefined) { n[k] = it[k]; } }); n.id = it.id; } });
    BP.commit("Suggested: " + sg.name); BP.refresh(); BB.toast(sg.name + " set up. Your earlier layout is in History.");
  }); });
  pane.querySelectorAll("[data-restore]").forEach(function (b) { b.addEventListener("click", function () { BP.restore(parseInt(b.getAttribute("data-restore"), 10)); }); });
  if (BP.dock === "team") { BP.wireTeam(pane); }
};

/* try a look on the booth without saving it (empty key puts the real one back) */
BP.previewLook = function (k) {
  if (!BP.M) { return; }
  if (k && !BP.preview) { BP.preview = { style: BP.plan.style, colors: BP.plan.colors }; }
  if (!BP.preview) { return; }
  if (k) { BP.plan.style = k; BP.plan.colors = k === BP.preview.style ? BP.preview.colors : {}; }
  else { BP.plan.style = BP.preview.style; BP.plan.colors = BP.preview.colors; BP.preview = null; }
  BP.applyStyle();
};

BP.refresh = function () {
  BP.save();
  if (BP.t) { BP.build3d(); }
  BP.draw2d(); BP.drawLists(); BP.showPop();
};

/* photo objects can stand on the floor or sit on a table. Switching moves every copy of it */
BP.hasTable = function () { return BP.plan.items.some(function (x) { return BP.cat(x).surface; }); };
BP.moveCustom = function (key, top, x, y) {
  var list = BP.plan.customs, i = list.map(function (c) { return c.key; }).indexOf(key); if (i === -1) { return false; }
  var before = JSON.parse(JSON.stringify(list[i])), c = list[i], keep = BP.plan.items.slice();
  var copies = BP.plan.items.filter(function (it) { return it.type === key; });
  if (top) { if (!c.top) { c.fw = c.w; c.fh = c.h; } c.top = true; c.w = 1; c.h = 1; }
  else { c.top = false; c.w = c.fw || 2; c.h = c.fh || 1; }
  PL.registerCustoms(BP.plan);
  BP.plan.items = BP.plan.items.filter(function (it) { return it.type !== key; });
  var ok = copies.every(function (it, k) {
    var n = PL.add(BP.plan, key, k === 0 && x !== undefined ? x : it.x, k === 0 && y !== undefined ? y : it.y);
    if (!n) { return false; }
    n.id = it.id; n.color = it.color; return true;
  });
  if (!ok) { list[i] = before; PL.registerCustoms(BP.plan); BP.plan.items = keep; return false; }
  return true;
};
/* dragged a floor photo object over a table: put it on the table instead */
BP.dropOnTable = function (it, cell) {
  var c = BP.cat(it); if (!c.custom || c.top || !cell || !PL.hostAt(BP.plan, cell.x, cell.y, 1, 1)) { return false; }
  if (!BP.moveCustom(it.type, true, cell.x, cell.y)) { BB.toast("That table is full. Move something off it first."); return false; }
  BB.toast("Put on the table. It now moves with the table."); return true;
};
/* dropped from the panel onto a table */
BP.trayToTable = function (key, x, y) {
  if (!PL.hostAt(BP.plan, x, y, 1, 1) || !BP.moveCustom(key, true)) { return false; }
  BP.renderTray(); BP.addItem(key, x, y); return true;
};

BP.addItem = function (type, cx, cy) {
  var role = "";
  if (type.indexOf(":") > -1) { role = type.split(":")[1]; type = type.split(":")[0]; }
  var c = PL.catalog[type], it = PL.add(BP.plan, type, cx, cy);
  if (!it) {
    if (c.top && !BP.plan.items.some(function (x) { return BP.cat(x).surface; })) { BB.toast("Add a table first. The " + c.label.toLowerCase() + " sits on top of a table or rolling cart."); }
    else if (c.top) { BB.toast("Your tables are full. Add another table or move something off first."); }
    else { BB.toast("No space left for that item. Remove or move something first."); }
    return;
  }
  if (c.person) { BP.newPerson(it, role || "helper"); }
  if (c.power && PL.booth && !PL.booth.power) { BB.toast("Heads up: this booth type has no power point. Bring a battery-powered " + c.label.toLowerCase() + " or ask the organiser."); }
  BP.sel = it.id; BP.popTab = c.person ? "acts" : ""; BP.commit("Added " + BP.label(it)); BP.refresh();
};

BP.wireTrayItems = function () {
  document.querySelectorAll("[data-add]").forEach(function (b) { b.addEventListener("click", function () { BP.addItem(b.getAttribute("data-add")); }); });
  document.querySelectorAll(".tray-item").forEach(function (el) {
    el.addEventListener("dragstart", function (e) { e.dataTransfer.setData("text/plain", el.getAttribute("data-type")); e.dataTransfer.effectAllowed = "copy"; });
  });
  document.querySelectorAll("[data-delcustom]").forEach(function (b) { b.addEventListener("click", function () {
    var k = b.getAttribute("data-delcustom");
    BP.plan.customs = BP.plan.customs.filter(function (c) { return c.key !== k; });
    BP.plan.items = BP.plan.items.filter(function (it) { return it.type !== k; });
    PL.registerCustoms(BP.plan); BP.sel = 0; BP.commit("Deleted a photo object"); BP.renderTray(); BP.refresh();
  }); });
  var form = document.getElementById("custom-form"), open = document.getElementById("custom-open"), file = document.getElementById("cf-file"), img = "", info = null;
  open.addEventListener("click", function () { form.hidden = false; open.hidden = true; var sp = document.getElementById("side-pane"); sp.scrollTop = form.offsetTop - 70; });
  document.getElementById("cf-cancel").addEventListener("click", function () { form.hidden = true; open.hidden = false; });
  var onTable = false;
  form.querySelectorAll("[data-cfplace]").forEach(function (b) { b.addEventListener("click", function () {
    onTable = b.getAttribute("data-cfplace") === "table";
    form.querySelectorAll("[data-cfplace]").forEach(function (x) { x.classList.toggle("is-on", x === b); });
    document.getElementById("cf-size").hidden = onTable;
    var opts = document.getElementById("cf-form").options, names = onTable ? ["Best match", "On a plate", "Display tray", "Cake stand", "Table sign"] : ["Best match", "Product on a stand", "Display box", "Round stand", "Standee"];
    for (var i = 0; i < opts.length; i++) { opts[i].textContent = names[i]; }
  }); });
  file.addEventListener("change", function () {
    if (!file.files[0]) { return; }
    var nm = file.files[0].name.replace(/\.[^.]+$/, "").slice(0, 28);
    BP.readImage(file.files[0], function (url) {
      img = url;
      BP.analyse(url, function (r) {
        info = r;
        document.getElementById("cf-preview").innerHTML = '<span class="cf-pair"><img src="' + url + '" alt=""><span class="cf-arrow">' + BB.icon("chevRight", 16) + '</span><img class="cut" src="' + (r.cutout || url) + '" alt="" style="background:' + r.tint + '"></span>';
        var note = document.getElementById("cf-note"); note.hidden = false;
        note.innerHTML = '<i style="background:' + r.tint + '"></i>' + (r.plain ? "Background removed. Main colour picked for the stand." : "Busy background, so it will go on the front of a display box.");
        document.getElementById("cf-form").value = "auto";
        var n = document.getElementById("cf-name"); if (!n.value) { n.value = nm; }
      });
    });
  });
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!img || !info) { BB.toast("Upload a photo first."); return; }
    var pick = document.getElementById("cf-form").value, formV = pick === "auto" ? info.form : pick;
    if (formV !== "box" && !info.cutout) { formV = "box"; BB.toast("The background is too busy to cut out, so it is a display box."); }
    if (onTable && !BP.hasTable()) { BB.toast("Add a table first, then put your photo object on it."); return; }
    var c = { key: "c_" + Date.now(), label: document.getElementById("cf-name").value.trim() || "My object", w: parseInt(document.getElementById("cf-w").value, 10), h: parseInt(document.getElementById("cf-h").value, 10), image: img, cutout: info.cutout, tint: info.tint, tall: info.tall, form: formV };
    if (onTable) { c.fw = c.w; c.fh = c.h; c.w = 1; c.h = 1; c.top = true; if (pick === "auto" && formV !== "box") { c.form = "stand"; } }
    BP.plan.customs.push(c); PL.registerCustoms(BP.plan);
    try { BP.save(); } catch (err) { BB.toast("That photo is too large to save. Try a smaller one."); BP.plan.customs.pop(); PL.registerCustoms(BP.plan); return; }
    BP.renderTray(); BP.addItem(c.key);
  });
};

BP.wireDrop = function () {
  var v3 = document.getElementById("view3d"), v2 = document.getElementById("plan2d");
  [v3, v2].forEach(function (zone) {
    zone.addEventListener("dragover", function (e) { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; zone.classList.add("is-drop"); });
    zone.addEventListener("dragleave", function () { zone.classList.remove("is-drop"); });
  });
  v3.addEventListener("drop", function (e) {
    e.preventDefault(); v3.classList.remove("is-drop");
    var raw = e.dataTransfer.getData("text/plain"), type = raw.split(":")[0]; if (!PL.catalog[type]) { return; }
    var c = PL.catalog[type], pt = BP.t ? BP.floorAt(e, c.top ? 0.85 : 0) : null, tp = BP.t ? BP.floorAt(e, 0.85) : null;
    if (c.custom && !c.top && tp && BP.trayToTable(type, Math.floor(tp.x / C), Math.floor(tp.z / C))) { return; }
    if (pt) { BP.addItem(raw, Math.round(pt.x / C - c.w / 2), Math.round(pt.z / C - c.h / 2)); } else { BP.addItem(raw); }
  });
  v2.addEventListener("drop", function (e) {
    e.preventDefault(); v2.classList.remove("is-drop");
    var raw = e.dataTransfer.getData("text/plain"), type = raw.split(":")[0]; if (!PL.catalog[type]) { return; }
    var p = BP.svgCell(e), c = PL.catalog[type];
    if (c.custom && !c.top && BP.trayToTable(type, Math.floor(p.x), Math.floor(p.y))) { return; }
    BP.addItem(raw, Math.round(p.x - c.w / 2), Math.round(p.y - c.h / 2));
  });
};

BP.wireKeys = function () {
  document.addEventListener("keydown", function (e) {
    if (/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { return; }
    if (e.key === "Escape" && BP.popTab) { BP.popTab = ""; BP.showPop(); return; }
    if (!BP.sel) { return; }
    var k = e.key, id = BP.sel, moves = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    if (moves[k] && id !== "queue") { e.preventDefault(); if (PL.move(BP.plan, id, moves[k][0], moves[k][1])) { BP.commit("Moved " + BP.nameOf(id)); BP.refresh(); } }
    else if (moves[k]) { e.preventDefault(); BP.plan.queue.sx = Math.max(-2.5, Math.min(PL.W + 2.5, BP.plan.queue.sx + moves[k][0] * 0.5)); BP.commit("Moved the queue"); BP.refresh(); }
    else if ((k === "r" || k === "R") && id !== "queue") { BP.popAction("rotate"); }
    else if ((k === "Delete" || k === "Backspace") && id !== "queue") { e.preventDefault(); BP.popAction("remove"); }
    else if (k === "Escape") { BP.select(0); }
  });
};

/* =========================================================
   Page
   ========================================================= */
BP.render = function () {
  var ev = BP.ev;
  document.getElementById("root").innerHTML =
    '<section class="pl-stage" id="stage"><div id="view3d"></div>' +
      '<div class="pl-title fl"><a class="pl-back" href="my-events.html?event=' + ev.id + '">' + BB.icon("chevLeft", 14) + ' My events</a><h1>Booth Planner</h1><p title="' + ev.name + " · " + ev.dates + '">' + ev.name + " · " + ev.dates + "</p>" +
        (PL.booth && PL.booth.label ? '<span class="pl-booth">' + BB.icon("booth", 14) + " " + PL.booth.label + (PL.booth.n > 1 ? " x " + PL.booth.n + " joined" : "") + " · " + PL.booth.w + "m x " + PL.booth.d + "m" + (PL.booth.power ? "" : " · no power point") + "</span>" : "") + "</div>" +
      '<div class="pl-tools fl"><button class="st-btn" data-cam="top">' + BB.icon("target", 17) + '<span>Top</span></button>' +
        '<button class="st-btn" id="reset-btn" title="Go back to the default booth">' + BB.icon("sync", 17) + '<span>Reset</span></button>' +
        '<button class="st-btn wall-btn" id="walls-btn" aria-pressed="true"></button>' +
        '<button class="st-btn" id="fs-btn"></button><button class="st-btn' + (BP.ver ? "" : " primary") + '" id="walk-btn">' + BB.icon("walk", 17) + " Walkthrough</button>" +
        (BP.ver ? '<button class="st-btn primary" id="save-btn">' + BB.icon("check", 17) + " Save layout</button>" : "") + "</div>" +
      '<aside class="pl-left fl' + (BP.paneOpen ? "" : " is-folded") + '" id="pl-left"><nav class="pl-rail" aria-label="Planner tools">' +
        BP.TABS.map(function (tb) { return '<button data-dock="' + tb[0] + '" title="' + tb[2] + '">' + BB.icon(tb[1], 19) + "<span>" + tb[2] + "</span></button>"; }).join("") +
        '<i class="rail-gap"></i><button class="rail-fold" id="rail-fold" title="Fold the panel">' + BB.icon("panel", 18) + "</button></nav>" +
        '<div class="pl-pane" id="side-pane"></div></aside>' +
      '<aside class="pl-side"><section class="fl side-card is-plan"><div class="side-h"><b>2D plan</b><span class="chip">' + BB.icon("sync", 13) + ' Synced</span></div><div id="plan2d"></div></section>' +
        '<section class="fl side-card" id="pl-sum"></section></aside>' +
      '<div class="pl-ctrl fl">' +
        '<button class="ctrl-ic" data-cam="left" aria-label="Turn left" title="Turn left">' + BB.icon("rotate", 17) + '</button><button class="ctrl-ic flip-x" data-cam="right" aria-label="Turn right" title="Turn right">' + BB.icon("rotate", 17) + "</button><i class=\"ctrl-sep\"></i>" +
        '<button class="ctrl-ic" data-cam="zout" aria-label="Zoom out">' + BB.icon("minus", 16) + '</button><b id="zoom-val">100%</b><button class="ctrl-ic" data-cam="zin" aria-label="Zoom in">' + BB.icon("plus", 16) + "</button></div>" +
      '<div class="pl-opts fl" id="pl-opts"></div>' +
      '<div class="obj-pop" id="obj-pop"></div>' +
    "</section>";

  document.getElementById("walk-btn").addEventListener("click", function () { if (!BP.t) { BB.toast("3D is not available in this browser."); return; } BP.select(0); BP.walk(); });
  document.querySelectorAll("[data-cam]").forEach(function (b) { b.addEventListener("click", function () { BP.cam(b.getAttribute("data-cam")); }); });
  document.querySelectorAll("[data-dock]").forEach(function (b) { b.addEventListener("click", function () { BP.openDock(b.getAttribute("data-dock")); }); });
  document.getElementById("rail-fold").addEventListener("click", function () { BP.setPane(!BP.paneOpen); });
  document.getElementById("reset-btn").addEventListener("click", BP.resetBooth);
  document.getElementById("walls-btn").addEventListener("click", function () { BP.setWalls(BP.plan.walls === false); });
  document.getElementById("fs-btn").addEventListener("click", BP.toggleFull);
  var sv = document.getElementById("save-btn"); if (sv) { sv.addEventListener("click", function () { BP.save(); EXP.finish(BP.plan); }); }
  if (BP.ver === "a") { BP.setupToggle(); }
  BP.setLock(false); BP.setPlay(true); BP.setFullBtn(); BP.setWalls(BP.plan.walls !== false, true);
  BP.wireDrop(); BP.wire2d(); BP.wireKeys();
  BP.init3d();
  if (!BP.plan.history.length) { BP.commit("Starting layout"); }
  BP.renderDock(); BP.refresh(); BP.zoomLabel();
  document.body.classList.add("is-planner");
  BP.fit(); window.addEventListener("resize", BP.fit);
  document.addEventListener("fullscreenchange", function () { document.body.classList.toggle("pl-full", !!document.fullscreenElement); BP.setFullBtn(); setTimeout(BP.fit, 60); });
  window.addEventListener("scroll", function () { if (window.innerWidth > 900 && window.scrollY) { window.scrollTo(0, 0); } });
};

/* Version A of the A/B test: one view at a time, switched with a 3D / 2D toggle (no plan beside the 3D view) */
BP.setupToggle = function () {
  var st = document.getElementById("stage"), card = document.querySelector(".side-card.is-plan");
  document.body.classList.add("ver-a");
  st.appendChild(card); card.classList.add("pl-2dfull");
  card.querySelector(".chip").innerHTML = BB.icon("grid", 13) + " Top-down view";
  var tools = document.querySelector(".pl-tools"), seg = document.createElement("div");
  seg.className = "view-seg"; seg.innerHTML = '<button data-view="3d">3D view</button><button data-view="2d">2D plan</button>';
  tools.insertBefore(seg, tools.firstChild);
  seg.querySelectorAll("[data-view]").forEach(function (b) { b.addEventListener("click", function () { BP.setView(b.getAttribute("data-view")); }); });
  BP.setView("3d");
};
BP.setView = function (v) {
  BP.view = v;
  document.getElementById("stage").classList.toggle("show-2d", v === "2d");
  document.querySelectorAll("[data-view]").forEach(function (b) { b.classList.toggle("is-on", b.getAttribute("data-view") === v); });
  if (v === "2d") { BP.popTab = ""; BP.showOpts(""); }
  BP.draw2d();
};

/* full screen: hides the browser bars and the menu bar so the planner gets the whole screen */
BP.toggleFull = function () {
  var on = document.body.classList.contains("pl-full");
  if (!on) {
    document.body.classList.add("pl-full");
    var de = document.documentElement; if (de.requestFullscreen) { de.requestFullscreen().catch(function () {}); }
  } else {
    document.body.classList.remove("pl-full");
    if (document.fullscreenElement && document.exitFullscreen) { document.exitFullscreen(); }
  }
  BP.setFullBtn(); setTimeout(BP.fit, 60);
};
BP.setFullBtn = function () {
  var b = document.getElementById("fs-btn"), on = document.body.classList.contains("pl-full"); if (!b) { return; }
  b.innerHTML = BB.icon(on ? "shrink" : "expand", 17) + "<span>" + (on ? "Exit full screen" : "Full screen") + "</span>";
};

/* keep the whole planner on one screen: the stage fills the window below the menu bar */
BP.fit = function () {
  var st = document.getElementById("stage"); if (!st) { return; }
  /* the left panel starts just below the title card, whatever its height */
  var tt = st.querySelector(".pl-title"), lp = document.getElementById("pl-left");
  if (tt && lp && window.innerWidth > 900) { lp.style.top = (tt.offsetTop + tt.offsetHeight + 12) + "px"; }
  if (window.innerWidth <= 900) { st.style.height = ""; return; }
  window.scrollTo(0, 0);
  var top = st.getBoundingClientRect().top;
  st.style.height = Math.max(460, window.innerHeight - top - (document.body.classList.contains("pl-full") ? 0 : 14)) + "px";
  BP.fitView();
};
/* Walls on or off: some booths are only a floor space */
BP.setWalls = function (on, quiet) {
  BP.plan.walls = on;
  var b = document.getElementById("walls-btn");
  if (b) { b.innerHTML = '<span class="wsw"><i></i></span><span>Walls ' + (on ? "on" : "off") + "</span>"; b.classList.toggle("is-on", on); b.setAttribute("aria-pressed", String(on)); }
  if (quiet) { return; }
  BP.save(); BP.commit(on ? "Walls on" : "Walls off"); BP.refresh();
};

/* Reset: back to the default booth, after a quick check */
BP.resetBooth = function () {
  var box = document.createElement("div");
  box.className = "confirm-back";
  box.innerHTML = '<div class="confirm-box" role="dialog" aria-modal="true"><span class="confirm-ic">' + BB.icon("sync", 22) + "</span><h3>Reset to the default booth?</h3>" +
    "<p>Your objects and team are replaced with the starting booth. You can still go back to this set-up from History.</p>" +
    '<div class="confirm-actions"><button class="btn" data-c="no">Cancel</button><button class="btn btn-primary" data-c="yes">Reset booth</button></div></div>';
  document.body.appendChild(box);
  box.addEventListener("click", function (e) {
    var b = e.target.closest("[data-c]");
    if (e.target === box || (b && b.getAttribute("data-c") === "no")) { box.remove(); return; }
    if (!b) { return; }
    var d = PL.defaultPlan();
    BP.plan.items = d.items; BP.plan.queue = d.queue; BP.plan.walls = true;
    BP.sel = 0; BP.popTab = ""; BP.showPop(); BP.setWalls(true, true);
    BP.cam("reset"); BP.commit("Reset to the default booth"); BP.save(); BP.refresh();
    box.remove(); BB.toast("Back to the default booth.");
  });
};

BP.setLock = function (v) {
  BP.locked = v;
  try { localStorage.setItem("bb_view_free", v ? "" : "1"); } catch (e) {}
  var b = document.getElementById("lock-btn"); if (!b) { return; }
  b.innerHTML = BB.icon(v ? "lock" : "unlock", 17) + "<span>" + (v ? "Unlock view" : "Lock view") + "</span>";
  b.title = v ? "The view is locked. Unlock to drag around and zoom with the mouse." : "Lock the view so the booth stays still";
  b.classList.toggle("is-soft", !v);
};
BP.setPlay = function (v) {
  BP.playing = v;
  var b = document.getElementById("play-btn"); if (!b) { return; }
  b.innerHTML = BB.icon(v ? "pause" : "play", 17) + "<span>" + (v ? "Pause" : "Play") + "</span>";
  b.classList.toggle("is-paused", !v);
  b.setAttribute("aria-label", v ? "Pause the team" : "Play the team");
  b.title = v ? "Pause the team" : "Play the team: people move between their tasks";
};

document.addEventListener("DOMContentLoaded", function () {
  BP.ev = BB.eventById(parseInt(BB.param("event"), 10)) || BB_EVENTS[0];
  BP.plan = PL.load(BP.ev.id); BP.syncMyLook();
  BW = PL.W * C; BD = PL.H * C;  /* booth size follows the booth type picked for this event */
  if (!BP.STYLES[BP.plan.style]) { BP.plan.style = "minimal"; }
  BP.dock = "objects";
  /* start with the preset booth on show and the side panel folded; open a tab to edit */
  BP.paneOpen = false; BP.locked = false;  /* drag empty space to turn the booth, scroll to zoom */
  BP.plan.style = "standard"; BP.plan.colors = {};
  BP.plan.items.forEach(function (it) { delete it.color; });
  BP.playing = true;
  BP.ver = typeof EXP !== "undefined" ? EXP.version() : "";
  BP.render();
});
