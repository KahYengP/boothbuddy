/* Booth Planner: people.
   The business owner and staff stand in the booth and act out what they do:
   walk around, stand, cook, wash, make coffee or work the cashier.
   Pick more than one action and the person takes turns, walking between the stations.
   (This is a simple animation for planning. People walk in straight lines and do not avoid furniture.) */
BB.icons.info = BB.icons.info || '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8v.5"/>';
BP.crew = {};
BP.teamSel = [];
BP.tf = { role: "helper", gender: "female", color: "", style: "person", name: "" };
/* shirt styles: each is a person design in the catalog */
BP.OUTFITS = [["person", "Apron"], ["person_casual", "Vest"], ["person_chef", "Chef whites"]];
BP.SHIRTS = ["#7A5E94", "#E58A5F", "#4F7BD1", "#3E9A7A", "#E2B33C", "#C2444F", "#2E2A30"];

/* a sensible default name that is not already taken */
BP.freeName = function (role) {
  var used = PL.people(BP.plan).map(function (p) { return (p.name || "").toLowerCase(); }), first = (BB_USER.name || "Owner").split(" ")[0];
  if (role === "owner" && used.indexOf(first.toLowerCase()) === -1) { return first; }
  var base = role === "owner" ? "Owner " : "Staff ", n = 1;
  while (used.indexOf((base + n).toLowerCase()) > -1) { n++; }
  return base + n;
};
BP.newPerson = function (it, role, who) {
  who = who || {};
  var helpers = PL.people(BP.plan).filter(function (p) { return p.role !== "owner"; }).length;
  it.role = role;
  it.name = (who.name || "").trim() || BP.freeName(role);
  it.gender = who.gender || (role === "owner" ? "female" : (helpers % 2 ? "female" : "male"));
  it.skin = helpers % 3;
  if (who.color) { it.color = who.color; }
  it.hair = it.id % 4;
  it.acts = role === "owner" ? ["cashier"] : ["cook"];
};
BP.roleColor = function (it) { return it.color || (it.role === "owner" ? "#7A5E94" : "#E58A5F"); };
BP.who = function (it) { return (it.role === "owner" ? "Owner" : "Staff") + " · " + (it.gender === "male" ? "Male" : "Female"); };
BP.angle = function (a, b, k) { var d = Math.atan2(Math.sin(b - a), Math.cos(b - a)); return a + d * k; };

/* the name tag above each person: name and what they are doing */
BP.tagTex = {};
BP.tagFor = function (text, color) {
  var key = text + color;
  if (!BP.tagTex[key]) {
    BP.tagTex[key] = BP.ctex(640, 128, function (g, w, h) {
      g.font = "600 42px Outfit, Arial";
      var tw = Math.min(w - 20, g.measureText(text).width + 92), x = (w - tw) / 2;
      g.fillStyle = "rgba(255,255,255,0.94)"; g.beginPath(); g.moveTo(x + 46, 16); g.arcTo(x + tw, 16, x + tw, h - 16, 48); g.arcTo(x + tw, h - 16, x, h - 16, 48); g.arcTo(x, h - 16, x, 16, 48); g.arcTo(x, 16, x + tw, 16, 48); g.fill();
      g.fillStyle = color; g.beginPath(); g.arc(x + 44, h / 2, 13, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#2E2233"; g.textBaseline = "middle"; g.fillText(text, x + 70, h / 2 + 2);
    });
  }
  return BP.tagTex[key];
};

BP.dressPerson = function (g, it) {
  var tag = new THREE.Sprite(new THREE.SpriteMaterial({ depthTest: false, transparent: true }));
  tag.scale.set(1.25, 0.25, 1); tag.position.y = it.type === "person_chef" ? 2.2 : 2.05; tag.renderOrder = 20; g.add(tag);
  g.userData.tag = tag;
  var st = BP.crew[it.id];
  if (st && st.hx === it.x && st.hy === it.y) { g.position.set(st.pos.x, 0, st.pos.z); g.rotation.y = st.face; }
};

/* where a person goes for an action: behind the nearest matching station, facing it */
BP.spotFor = function (it, act, st, idx, home) {
  var a = PL.action(act), homeP = new THREE.Vector3(home.x, 0, home.z), standFace = -it.r * Math.PI / 2;
  if (act === "walk") {
    if (!BP.playing) { return { p: homeP, face: standFace }; }
    if (!st.wander) { st.wander = BP.navWander(); }
    return { p: st.wander, face: null };
  }
  if (!a || !a.at) { return { p: homeP, face: standFace }; }
  var best = null, bd = 1e9;
  BP.plan.items.forEach(function (o) {
    if (a.at.indexOf(PL.catalog[o.type].group) === -1) { return; }
    var oc = BP.center3d(o), d = Math.hypot(oc.x - home.x, oc.z - home.z);
    if (d < bd) { bd = d; best = o; }
  });
  if (!best) { return { p: homeP, face: standFace }; }
  var host = PL.hostOf(BP.plan, best) || best, hc = BP.center3d(host), depth = PL.size(host.type, host.r).h * C, sc = BP.center3d(best);
  var z = hc.z - depth / 2 - 0.28, face = 0;
  if (z < 0.3) { z = hc.z + depth / 2 + 0.28; face = Math.PI; }
  var x = Math.max(0.3, Math.min(BW - 0.3, sc.x + ((idx % 3) - 1) * 0.14));
  return { p: new THREE.Vector3(x, 0, Math.min(BD + 0.6, z)), face: face };
};

/* ---------- Walking around furniture ----------
   The booth floor (plus a strip of the aisle) is split into 12.5 cm squares. Squares under or right next to
   furniture are blocked, and people follow the shortest path through the free ones. */
BP.nav = function () {
  var key = JSON.stringify(BP.plan.items.map(function (i) { return [i.type, i.x, i.y, i.r]; }));
  if (BP._nav && BP._nav.key === key) { return BP._nav; }
  var S = 0.125, cols = Math.round(BW / S), rows = Math.round((BD + 1.0) / S), R = 0.13, blocked = new Uint8Array(cols * rows);
  for (var j = 0; j < rows; j++) {
    for (var i = 0; i < cols; i++) {
      var cx = (i + 0.5) * S, cz = (j + 0.5) * S, b = cx < R || cx > BW - R || cz < R;
      BP.plan.items.forEach(function (it) {
        var c = PL.catalog[it.type]; if (b || c.top || c.person) { return; }
        var sz = PL.size(it.type, it.r);
        if (cx > it.x * C - R && cx < (it.x + sz.w) * C + R && cz > it.y * C - R && cz < (it.y + sz.h) * C + R) { b = true; }
      });
      blocked[j * cols + i] = b ? 1 : 0;
    }
  }
  BP._nav = { key: key, S: S, cols: cols, rows: rows, blocked: blocked };
  return BP._nav;
};
BP.navCell = function (n, x, z) { return [Math.max(0, Math.min(n.cols - 1, Math.floor(x / n.S))), Math.max(0, Math.min(n.rows - 1, Math.floor(z / n.S)))]; };
BP.navFree = function (n, i, j) { return i >= 0 && j >= 0 && i < n.cols && j < n.rows && !n.blocked[j * n.cols + i]; };
BP.navCentre = function (n, c) { return new THREE.Vector3((c[0] + 0.5) * n.S, 0, (c[1] + 0.5) * n.S); };
/* the free square closest to a point */
BP.navNearest = function (n, x, z) {
  var c = BP.navCell(n, x, z), best = null, bd = 1e9;
  if (BP.navFree(n, c[0], c[1])) { return c; }
  for (var j = 0; j < n.rows; j++) { for (var i = 0; i < n.cols; i++) {
    if (!BP.navFree(n, i, j)) { continue; }
    var d = Math.hypot((i + 0.5) * n.S - x, (j + 0.5) * n.S - z); if (d < bd) { bd = d; best = [i, j]; }
  } }
  return best || c;
};
/* can someone walk in a straight line from a to b without touching furniture? */
BP.navClear = function (n, a, b) {
  var L = a.distanceTo(b), steps = Math.max(1, Math.ceil(L / 0.08));
  for (var k = 0; k <= steps; k++) {
    var x = a.x + (b.x - a.x) * k / steps, z = a.z + (b.z - a.z) * k / steps, c = BP.navCell(n, x, z);
    if (!BP.navFree(n, c[0], c[1])) { return false; }
  }
  return true;
};
/* shortest path (A star on the squares), then straightened where the way is clear */
BP.navPath = function (from, to) {
  var n = BP.nav(), s = BP.navNearest(n, from.x, from.z), g = BP.navNearest(n, to.x, to.z), goal = BP.navCentre(n, g);
  var gc = BP.navCell(n, to.x, to.z); if (gc[0] === g[0] && gc[1] === g[1]) { goal = to.clone(); }
  var id = function (c) { return c[1] * n.cols + c[0]; }, open = [s], came = {}, gs = {}, fs = {};
  gs[id(s)] = 0; fs[id(s)] = Math.hypot(g[0] - s[0], g[1] - s[1]);
  var found = false, guard = 0, closest = s, cd = 1e9;
  while (open.length && guard++ < 4000) {
    open.sort(function (a, b) { return fs[id(a)] - fs[id(b)]; });
    var cur = open.shift(), h = Math.hypot(g[0] - cur[0], g[1] - cur[1]);
    if (h < cd) { cd = h; closest = cur; }
    if (cur[0] === g[0] && cur[1] === g[1]) { found = true; break; }
    for (var dx = -1; dx <= 1; dx++) { for (var dz = -1; dz <= 1; dz++) {
      if (!dx && !dz) { continue; }
      var nb = [cur[0] + dx, cur[1] + dz];
      if (!BP.navFree(n, nb[0], nb[1])) { continue; }
      if (dx && dz && (!BP.navFree(n, cur[0] + dx, cur[1]) || !BP.navFree(n, cur[0], cur[1] + dz))) { continue; }
      var t = gs[id(cur)] + (dx && dz ? 1.414 : 1);
      if (gs[id(nb)] === undefined || t < gs[id(nb)]) {
        came[id(nb)] = cur; gs[id(nb)] = t; fs[id(nb)] = t + Math.hypot(g[0] - nb[0], g[1] - nb[1]);
        if (!open.some(function (o) { return o[0] === nb[0] && o[1] === nb[1]; })) { open.push(nb); }
      }
    } }
  }
  /* no way through? go as close as possible instead of walking through furniture */
  if (!found) { g = closest; goal = BP.navCentre(n, g); }
  var cells = [], c = g; while (c) { cells.unshift(c); c = came[id(c)]; }
  var pts = cells.map(function (q) { return BP.navCentre(n, q); }); pts[pts.length - 1] = goal;
  if (!BP.navFree(n, BP.navCell(n, from.x, from.z)[0], BP.navCell(n, from.x, from.z)[1])) { pts.unshift(BP.navCentre(n, s)); }
  var out = [], at = from.clone(), i = 0;
  while (i < pts.length) {
    var far = i;
    for (var k = pts.length - 1; k > i; k--) { if (BP.navClear(n, at, pts[k])) { far = k; break; } }
    out.push(pts[far]); at = pts[far]; i = far + 1;
  }
  return out;
};
BP.navWander = function () {
  var n = BP.nav(), free = [];
  for (var j = 0; j < n.rows; j++) { for (var i = 0; i < n.cols; i++) { if (BP.navFree(n, i, j) && (j + 0.5) * n.S < BD) { free.push([i, j]); } } }
  var c = free[Math.floor(Math.random() * free.length)]; return c ? BP.navCentre(n, c) : new THREE.Vector3(BW / 2, 0, BD / 2);
};

/* arms and legs for each action */
BP.pose = function (r, act, moving, tm) {
  var s = Math.sin, sw = moving ? s(tm * 8) : 0, aL = 0, aR = 0, ry = 0;
  if (act === "cook") { aR = -1.05 + s(tm * 6) * 0.18; ry = s(tm * 6) * 0.25; aL = -0.55; }
  else if (act === "wash") { aL = -0.85 + s(tm * 10) * 0.12; aR = -0.85 - s(tm * 10) * 0.12; }
  else if (act === "coffee") { aR = -1.15 + s(tm * 2) * 0.05; aL = -0.45; }
  else if (act === "cashier") { aR = -0.95 + Math.max(0, s(tm * 5)) * 0.15; aL = -0.35; }
  if (moving) { aL = -sw * 0.45; aR = sw * 0.45; ry = 0; }
  r.legL.rotation.x = sw * 0.5; r.legR.rotation.x = -sw * 0.5;
  r.armL.rotation.x = aL; r.armR.rotation.x = aR; r.armR.rotation.y = ry;
  r.armL.rotation.z = -0.08; r.armR.rotation.z = 0.08;
  r.torso.scale.y = 1 + s(tm * 2.2) * 0.008;
  r.head.rotation.y = (act === "stand" || act === "walk") && !moving ? s(tm * 0.6) * 0.3 : 0;
  r.head.rotation.x = !moving && (act === "cook" || act === "wash" || act === "cashier" || act === "coffee") ? 0.22 : 0;
};

/* runs every frame */
BP.crewStep = function (dt, tm) {
  var t = BP.t; if (!t) { return; }
  PL.people(BP.plan).forEach(function (it, idx) {
    var g = t.groups[it.id]; if (!g || !g.userData.rig) { return; }
    if (BP.drag && String(BP.drag.id) === String(it.id)) { BP.pose(g.userData.rig, "stand", false, tm); return; }
    var home = BP.center3d(it), st = BP.crew[it.id];
    if (!st || st.hx !== it.x || st.hy !== it.y) { st = BP.crew[it.id] = { pos: new THREE.Vector3(home.x, 0, home.z), i: 0, dwell: 0, face: -it.r * Math.PI / 2, hx: it.x, hy: it.y, wander: null, walks: 0 }; }
    var acts = it.acts && it.acts.length ? it.acts : ["stand"];
    if (st.i >= acts.length) { st.i = 0; }
    var act = BP.playing ? acts[st.i] : acts[0], spot = BP.spotFor(it, act, st, idx, home), moving = false;
    var n = BP.nav(), dc = BP.navNearest(n, spot.p.x, spot.p.z), dcc = BP.navCell(n, spot.p.x, spot.p.z);
    var dest = dc[0] === dcc[0] && dc[1] === dcc[1] ? spot.p.clone() : BP.navCentre(n, dc);
    if (!BP.playing) { st.pos.copy(dest); st.path = []; st.dest = dest; if (spot.face !== null) { st.face = spot.face; } }
    else {
      if (!st.dest || st.dest.distanceTo(dest) > 0.05 || st.navKey !== n.key) { st.dest = dest; st.navKey = n.key; st.path = BP.navPath(st.pos, dest); }
      while (st.path.length && st.path[0].distanceTo(st.pos) < 0.03) { st.path.shift(); }
      if (st.path.length) {
        var d = st.path[0].clone().sub(st.pos); d.y = 0; var L = d.length();
        moving = true; st.pos.addScaledVector(d.normalize(), Math.min(L, 1.1 * dt)); st.face = BP.angle(st.face, Math.atan2(d.x, d.z), 0.2);
      } else {
        st.dwell += dt;
        if (spot.face !== null) { st.face = BP.angle(st.face, spot.face, 0.1); }
        if (act === "walk") { if (st.dwell > 1.2) { st.wander = null; st.walks++; st.dwell = 0; if (st.walks >= 3 && acts.length > 1) { st.walks = 0; st.i++; } } }
        else if (acts.length > 1 && st.dwell > 4.5) { st.i++; st.dwell = 0; }
      }
    }
    g.position.set(st.pos.x, moving ? Math.abs(Math.sin(tm * 8)) * 0.02 : 0, st.pos.z);
    g.rotation.y = st.face;
    BP.pose(g.userData.rig, act, moving, BP.playing ? tm : 0);
    var label = PL.personName(it) + " · " + PL.action(act).label + (acts.length > 1 ? " +" + (acts.length - 1) : "");
    if (g.userData.act !== act || g.userData.label !== label) {
      g.userData.act = act; g.userData.label = label;
      BP.prop(g.userData.rig.hand, act);
      g.userData.tag.material.map = BP.tagFor(label, BP.roleColor(it)); g.userData.tag.material.needsUpdate = true;
    }
  });
};

/* ---------- small building blocks shared by the menu and the Team tab ---------- */
BP.seg = function (name, value, opts) {
  return '<div class="seg" data-seg="' + name + '">' + opts.map(function (o) { return '<button type="button" class="' + (o[0] === value ? "is-on" : "") + '" data-v="' + o[0] + '">' + o[1] + "</button>"; }).join("") + "</div>";
};
/* shirt colour: a few ready colours plus a picker for any colour */
BP.shirtPick = function (name, value) {
  var cur = (value || "").toLowerCase(), known = BP.SHIRTS.map(function (c) { return c.toLowerCase(); });
  return '<div class="skin-pick" data-seg="' + name + '">' + BP.SHIRTS.map(function (c) { return '<button type="button" class="' + (c.toLowerCase() === cur ? "is-on" : "") + '" data-v="' + c + '" style="background:' + c + '" aria-label="Shirt ' + c + '"></button>'; }).join("") +
    '<label class="sw-pick is-small' + (cur && known.indexOf(cur) === -1 ? " is-on" : "") + '" title="Pick any colour"><input type="color" data-pick="' + name + '" value="' + (value || "#7A5E94") + '" aria-label="Pick any shirt colour"></label></div>';
};
BP.avatar = function (it, size) {
  return '<span class="t-av" style="width:' + size + "px;height:" + size + 'px"><img src="' + BP.objThumb(it.type, it.color, null, it) + '" alt=""></span>';
};

/* ---------- Actions menu for one person (opens from the glass menu) ---------- */
BP.missingFor = function (acts) {
  var names = { cook: "a cooker, oven or rice cooker", wash: "a wash station", coffee: "a coffee maker", cashier: "a cashier counter" };
  return acts.filter(function (id) {
    var a = PL.action(id); if (!a || !a.at) { return false; }
    return !BP.plan.items.some(function (o) { return a.at.indexOf(PL.catalog[o.type].group) > -1; });
  }).map(function (id) { return PL.action(id).label + " needs " + names[id]; });
};
BP.actionsSub = function (it) {
  var acts = it.acts || [], miss = BP.missingFor(acts);
  return '<div class="pop-sub"><div class="ps-head"><b>About ' + BB.escape(PL.personName(it)) + "</b><span>Pick one or more jobs. They take turns.</span></div>" +
    '<div class="act-who"><input class="input act-name" id="act-name" value="' + BB.escape(it.name || "") + '" maxlength="20" aria-label="Name" placeholder="Name">' +
    BP.seg("prole", it.role === "owner" ? "owner" : "helper", [["owner", "Owner"], ["helper", "Staff"]]) + BP.seg("pgender", it.gender || "female", [["female", "Female"], ["male", "Male"]]) + "</div>" +
    '<div class="act-shirt"><span>Shirt</span>' + BP.shirtPick("pshirt", it.color || BP.roleColor(it)) + "</div>" +
    '<div class="act-chips">' + PL.ACTIONS.map(function (a) { return '<button class="act-chip' + (acts.indexOf(a.id) > -1 ? " is-on" : "") + '" data-pact="' + a.id + '">' + BB.icon(a.icon, 15) + a.label + "</button>"; }).join("") + "</div>" +
    (miss.length ? '<p class="act-miss">' + BB.icon("info", 14) + "<span>" + miss.join(". ") + ". Until then they act it out where they stand.</span></p>" : "") + "</div>";
};
BP.setPersonField = function (it, k, v, label) {
  if (it[k] === v) { return; }
  it[k] = v; BP.thumbs = {};
  BP.commit(label + " " + PL.personName(it)); BP.refresh(); if (BP.dock === "team") { BP.renderDock(); }
};
BP.wireActions = function (root) {
  var it = PL.find(BP.plan, BP.sel); if (!it || !BP.cat(it).person) { return; }
  root.querySelectorAll("[data-pact]").forEach(function (b) { b.addEventListener("click", function () {
    var id = b.getAttribute("data-pact"), acts = (it.acts || []).slice(), i = acts.indexOf(id);
    if (i > -1) { if (acts.length === 1) { BB.toast("Keep at least one job."); return; } acts.splice(i, 1); } else { acts.push(id); }
    it.acts = acts; if (BP.crew[it.id]) { BP.crew[it.id].i = 0; BP.crew[it.id].dwell = 0; }
    BP.commit("Jobs for " + PL.personName(it)); BP.refresh(); if (BP.dock === "team") { BP.renderDock(); }
  }); });
  root.querySelectorAll('[data-seg="prole"] button').forEach(function (b) { b.addEventListener("click", function () { BP.setPersonField(it, "role", b.getAttribute("data-v"), "Role for"); }); });
  root.querySelectorAll('[data-seg="pgender"] button').forEach(function (b) { b.addEventListener("click", function () { BP.setPersonField(it, "gender", b.getAttribute("data-v"), "Updated"); }); });
  root.querySelectorAll('[data-seg="pshirt"] button').forEach(function (b) { b.addEventListener("click", function () { BP.matCache = {}; BP.setPersonField(it, "color", b.getAttribute("data-v"), "New shirt for"); }); });
  var sp = root.querySelector('[data-pick="pshirt"]');
  if (sp) { sp.addEventListener("change", function () { BP.matCache = {}; BP.setPersonField(it, "color", sp.value, "New shirt for"); }); }
  var nm = root.querySelector("#act-name");
  if (nm) {
    nm.addEventListener("keydown", function (e) { e.stopPropagation(); if (e.key === "Enter") { nm.blur(); } });
    nm.addEventListener("change", function () { var v = nm.value.trim(); if (!v) { nm.value = it.name; return; } BP.setPersonField(it, "name", v, "Renamed"); });
  }
};

/* ---------- Team tab: everyone in the booth, add or remove staff, change several at once ---------- */
BP.teamLine = function () {
  var ppl = PL.people(BP.plan); if (!ppl.length) { return ""; }
  return '<p class="sum-note is-team">' + BB.icon("users", 15) + "<span>Team: " + ppl.map(function (p) { return BB.escape(PL.personName(p)); }).join(", ") + "</span></p>";
};
BP.addPerson = function (role, who) {
  var it = PL.add(BP.plan, (who && who.style) || "person"); if (!it) { BB.toast("There is no free floor space for another person. Move something first."); return null; }
  BP.newPerson(it, role, who);
  BP.commit("Added " + PL.personName(it)); BP.refresh();
  return it;
};
BP.teamPane = function () {
  var ppl = PL.people(BP.plan), ids = ppl.map(function (p) { return p.id; });
  BP.teamSel = BP.teamSel.filter(function (id) { return ids.indexOf(id) > -1; });
  var sel = ppl.filter(function (p) { return BP.teamSel.indexOf(p.id) > -1; }), tf = BP.tf;
  var h = BP.paneHead("Team", "Who works in the booth and what they do");
  if (!ppl.length) { h += '<p class="team-empty">No one in the booth yet. Add yourself and your staff below.</p>'; }
  else {
    h += '<label class="team-all"><input type="checkbox" id="team-all"' + (sel.length === ppl.length ? " checked" : "") + "> Select everyone</label>";
    h += '<div class="team-list">' + ppl.map(function (p) {
      var on = BP.teamSel.indexOf(p.id) > -1;
      return '<div class="team-row' + (on ? " is-sel" : "") + (p.id === BP.sel ? " is-focus" : "") + '"><div class="tr-top"><input type="checkbox" data-tsel="' + p.id + '"' + (on ? " checked" : "") + ' aria-label="Select ' + BB.escape(PL.personName(p)) + '">' +
        BP.avatar(p, 38) + '<span class="t-txt"><b>' + BB.escape(PL.personName(p)) + "</b><small>" + BP.who(p) + "</small></span>" +
        '<button class="t-ic" data-tfind="' + p.id + '" title="Find in the booth" aria-label="Find ' + BB.escape(PL.personName(p)) + '">' + BB.icon("target", 15) + "</button>" +
        '<button class="t-ic danger" data-tdel="' + p.id + '" title="Remove" aria-label="Remove ' + BB.escape(PL.personName(p)) + '">' + BB.icon("trash", 15) + "</button></div>" +
        '<div class="t-acts">' + (p.acts || []).map(function (a) { return "<i>" + BB.icon(PL.action(a).icon, 12) + PL.action(a).label + "</i>"; }).join("") + "</div></div>";
    }).join("") + "</div>";
    if (sel.length) {
      h += '<div class="team-bar"><span>Jobs for ' + (sel.length === 1 ? BB.escape(PL.personName(sel[0])) : sel.length + " people") + '</span><div class="act-chips">' + PL.ACTIONS.map(function (a) {
        var all = sel.every(function (p) { return (p.acts || []).indexOf(a.id) > -1; });
        return '<button class="act-chip' + (all ? " is-on" : "") + '" data-tact="' + a.id + '">' + BB.icon(a.icon, 15) + a.label + "</button>";
      }).join("") + "</div></div>";
    } else { h += '<p class="team-hint">Tick people to give several of them the same job at once.</p>'; }
  }
  return h + '<form class="team-form" id="team-form"><b>Add staff</b>' +
    '<input class="input" id="tf-name" maxlength="20" placeholder="Name, e.g. Aisyah" value="' + BB.escape(tf.name || "") + '">' +
    '<div class="tf-row"><span>Role</span>' + BP.seg("tfrole", tf.role, [["helper", "Staff"], ["owner", "Owner"]]) + "</div>" +
    '<div class="tf-row"><span>Gender</span>' + BP.seg("tfgender", tf.gender, [["female", "Female"], ["male", "Male"]]) + "</div>" +
    '<div class="tf-row is-stack"><span>Shirt colour</span>' + BP.shirtPick("tfshirt", tf.color || (tf.role === "owner" ? "#7A5E94" : "#E58A5F")) + "</div>" +
    '<div class="tf-row is-stack"><span>Shirt style</span>' + BP.outfitPick(tf) + "</div>" +
    '<button class="btn btn-primary btn-small">' + BB.icon("plus", 14) + " Add to booth</button></form>";
};
/* shirt style cards with a small preview of the person */
BP.outfitPick = function (tf) {
  var color = tf.color || (tf.role === "owner" ? "#7A5E94" : "#E58A5F"), who = { role: tf.role, gender: tf.gender, skin: 1, hair: 1, color: color };
  return '<div class="outfit-pick">' + BP.OUTFITS.map(function (o) {
    var src = ""; try { src = BP.t ? BP.objThumb(o[0], null, null, who) : ""; } catch (e) {}
    return '<button type="button" class="outfit' + (tf.style === o[0] ? " is-on" : "") + '" data-outfit="' + o[0] + '">' + (src ? '<img src="' + src + '" alt="">' : "") + "<span>" + o[1] + "</span></button>";
  }).join("") + "</div>";
};
BP.wireOutfits = function (pane) {
  pane.querySelectorAll("[data-outfit]").forEach(function (b) { b.addEventListener("click", function () {
    BP.tf.style = b.getAttribute("data-outfit");
    pane.querySelectorAll("[data-outfit]").forEach(function (x) { x.classList.toggle("is-on", x === b); });
  }); });
};
BP.wireTeam = function (pane) {
  var ppl = PL.people(BP.plan);
  pane.querySelectorAll("[data-tsel]").forEach(function (b) { b.addEventListener("change", function () {
    var id = parseInt(b.getAttribute("data-tsel"), 10), i = BP.teamSel.indexOf(id);
    if (b.checked && i === -1) { BP.teamSel.push(id); } if (!b.checked && i > -1) { BP.teamSel.splice(i, 1); }
    BP.renderDock();
  }); });
  var all = document.getElementById("team-all");
  if (all) { all.addEventListener("change", function () { BP.teamSel = all.checked ? ppl.map(function (p) { return p.id; }) : []; BP.renderDock(); }); }
  pane.querySelectorAll("[data-tact]").forEach(function (b) { b.addEventListener("click", function () {
    var id = b.getAttribute("data-tact"), sel = ppl.filter(function (p) { return BP.teamSel.indexOf(p.id) > -1; });
    var everyone = sel.every(function (p) { return (p.acts || []).indexOf(id) > -1; });
    sel.forEach(function (p) {
      var acts = (p.acts || []).filter(function (a) { return a !== id; });
      if (!everyone) { acts.push(id); }
      p.acts = acts.length ? acts : ["stand"];
      if (BP.crew[p.id]) { BP.crew[p.id].i = 0; BP.crew[p.id].dwell = 0; }
    });
    BP.commit((everyone ? "Took off " : "Added ") + PL.action(id).label.toLowerCase() + " for " + sel.length + (sel.length > 1 ? " people" : " person")); BP.refresh(); BP.renderDock();
  }); });
  pane.querySelectorAll("[data-tfind]").forEach(function (b) { b.addEventListener("click", function () { BP.select(parseInt(b.getAttribute("data-tfind"), 10)); }); });
  pane.querySelectorAll("[data-tdel]").forEach(function (b) { b.addEventListener("click", function () {
    var id = parseInt(b.getAttribute("data-tdel"), 10), nm = BP.nameOf(id);
    PL.remove(BP.plan, id); delete BP.crew[id]; if (BP.sel === id) { BP.sel = 0; BP.popTab = ""; }
    BP.commit("Removed " + nm); BP.refresh(); BP.renderDock(); BB.toast(nm + " was removed. You can bring them back from History.");
  }); });
  var tp = pane.querySelector('[data-pick="tfshirt"]');
  if (tp) { tp.addEventListener("change", function () { BP.tf.color = tp.value; tp.parentNode.parentNode.querySelectorAll(".is-on").forEach(function (x) { x.classList.remove("is-on"); }); tp.parentNode.classList.add("is-on"); var op = pane.querySelector(".outfit-pick"); if (op) { op.outerHTML = BP.outfitPick(BP.tf); BP.wireOutfits(pane); } }); }
  [["tfrole", "role"], ["tfgender", "gender"], ["tfshirt", "color"]].forEach(function (q) {
    pane.querySelectorAll('[data-seg="' + q[0] + '"] button').forEach(function (b) { b.addEventListener("click", function () {
      BP.tf[q[1]] = b.getAttribute("data-v");
      b.parentNode.querySelectorAll("button, label").forEach(function (x) { x.classList.toggle("is-on", x === b); });
      var op = pane.querySelector(".outfit-pick"); if (op) { op.outerHTML = BP.outfitPick(BP.tf); BP.wireOutfits(pane); }
    }); });
  });
  BP.wireOutfits(pane);
  var f = document.getElementById("team-form");
  if (f) {
    f.querySelector("#tf-name").addEventListener("input", function (e) { BP.tf.name = e.target.value; });
    f.querySelector("#tf-name").addEventListener("keydown", function (e) { e.stopPropagation(); });
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var it = BP.addPerson(BP.tf.role, { name: f.querySelector("#tf-name").value, gender: BP.tf.gender, color: BP.tf.color, style: BP.tf.style });
      if (it) { BP.tf.name = ""; BB.toast(PL.personName(it) + " joined the booth. Pick their jobs in the list."); BP.renderDock(); }
    });
  }
};
