/* My Events: collapsible event rail, next-event card, application, then deadlines and the packing list side by side.
   (The Booth Planner opens from the Open Booth Planner button on the event card.) */
var ME = { id: 0, collapsed: false };

ME.events = function () { return BB_EVENTS.filter(function (e) { return e.status; }); };

ME.rail = function () {
  var h = '<div class="rail-head"><span class="rail-title">Your events</span><button class="icon-btn rail-toggle" id="rail-toggle" aria-label="Collapse events list">' + BB.icon("menu", 18) + "</button></div>";
  ME.events().forEach(function (ev) {
    h += '<button class="rail-item' + (ev.id === ME.id ? " is-active" : "") + '" data-ev="' + ev.id + '" title="' + ev.name + '"><span class="ev-letter" style="background:' + ev.color + '">' + BB.letter(ev) + "</span>" +
      '<span class="nm">' + ev.short + "<small>" + ev.dates + '</small></span><span class="chip st ' + (ev.status === "Accepted" ? "chip-good" : "chip-gold") + '">' + ev.status + "</span></button>";
  });
  if (!ME.events().length) { h += '<p class="muted" style="padding:10px;font-size:15px">No applications yet.</p>'; }
  return h + '<a class="rail-link" href="find-events.html">' + BB.icon("plus", 18) + "<span>Find more events</span></a>";
};

ME.prep = function (ev) {
  var det = BB_DETAILS[ev.id], issues = 0;
  var plan = BB.read("localStorage", "bb_plan_" + ev.id, null);
  var pack = PL.load(ev.id), list = PL.packing(pack), done = list.filter(function (p) { return pack.checked[p]; }).length;
  var rows = [
    { s: issues ? "warn" : "ok", t: "Documents submitted" },
    { s: plan ? "ok" : "warn", t: plan ? "Booth layout planned" : "Booth layout not planned" },
    { s: done === list.length ? "ok" : "", t: '<a class="prep-link" href="#pack">Packing list ' + done + " of " + list.length + "</a>" }
  ];
  return rows.map(function (r) { return '<div class="prep-row"><span class="tick ' + r.s + '">' + BB.icon(r.s === "ok" ? "check" : "clock") + "</span>" + r.t + "</div>"; }).join("");
};

ME.next = function (ev) {
  var det = BB_DETAILS[ev.id], target = ev.id === 1 ? "2026-11-06" : "2026-11-14";
  var days = BB.daysUntil(target), pct = Math.max(4, Math.min(100, 100 - days * 2.2)), r = 64, c = 2 * Math.PI * r;
  var accepted = ev.status === "Accepted";
  return '<section class="next-card glass"><div class="count-ring"><svg viewBox="0 0 150 150"><circle cx="75" cy="75" r="' + r + '" stroke="var(--line)"/><circle cx="75" cy="75" r="' + r + '" stroke="var(--accent)" stroke-dasharray="' + (c * pct / 100).toFixed(1) + " " + c.toFixed(1) + '" transform="rotate(-90 75 75)"/></svg>' +
    '<div class="count-center"><b>' + days + "</b><small>days to go</small></div></div>" +
    '<div><span class="chip ' + (accepted ? "chip-good" : "chip-gold") + '">' + (accepted ? "Accepted" : "Waiting for result") + "</span><h2>" + ev.name + "</h2>" +
    '<div class="next-meta"><span>' + BB.icon("calendar", 18) + ev.dates + "</span><span>" + BB.icon("pin", 18) + ev.venue + "</span><span>" + BB.icon("clock", 18) + "Load-in " + det.loadIn + "</span></div>" +
    '<div class="row" style="margin-top:18px"><a class="btn btn-primary" href="booth-planner.html?event=' + ev.id + '">Open Booth Planner</a><a class="btn" href="event-detail.html?event=' + ev.id + '">View event</a></div></div>' +
    '<div class="prep">' + ME.prep(ev) + "</div></section>";
};


ME.deadlines = function (ev) {
  var list = BB.getDeadlines().filter(function (d) { return d.eventId === ev.id || d.eventId === 0; }).sort(function (a, b) { return a.date < b.date ? -1 : 1; });
  var done = BB.read("localStorage", "bb_dl_done", {});
  if (!list.length) { return '<p class="muted">Nothing due. Add deadlines from the calendar.</p>'; }
  return list.map(function (d) {
    var left = BB.daysUntil(d.date), p = d.date.split("-");
    return '<div class="dl-item' + (done[d.id] ? " is-done" : "") + '"><div class="dl-date' + (left <= 3 && left >= 0 ? " soon" : "") + '"><b>' + parseInt(p[2], 10) + "</b><small>" + BB.shortDate(d.date).split(" ")[1] + "</small></div>" +
      '<div class="dl-body"><a href="' + d.link + '">' + BB.escape(d.title) + "</a><small>" + (left < 0 ? "Overdue" : (left === 0 ? "Due today" : "In " + left + " days")) + " · " + BB.timeText(d) + (d.eventId === 0 ? " · General" : "") + "</small></div>" +
      '<button class="round-check' + (done[d.id] ? " on" : "") + '" data-done="' + d.id + '" aria-label="Mark done">' + (done[d.id] ? BB.icon("check") : "") + "</button></div>";
  }).join("");
};

/* Packing checklist: one simple list in three short sections.
   Every event (the basics), For your booth (from the objects in your booth plan) and Your own items.
   Tap an item to tick it. */

ME.packSections = function (plan) {
  var base = PL.baseCheck, seen = base.slice(), booth = [];
  plan.items.forEach(function (it) {
    var c = PL.catalog[it.type]; if (!c || !c.pack) { return; }
    c.pack.forEach(function (p) { if (seen.indexOf(p) === -1) { seen.push(p); booth.push(p); } });
  });
  var own = (plan.extraPack || []).filter(function (p) { return seen.indexOf(p) === -1; });
  return [
    { title: "Every event", items: base.slice() },
    { title: "For your booth", items: booth, empty: "Add objects in the Booth Planner and what they need shows up here." },
    { title: "Your own items", items: own, mine: true }
  ];
};

ME.packCard = function (ev) {
  var plan = PL.load(ev.id), secs = ME.packSections(plan), all = [];
  secs.forEach(function (sc) { all = all.concat(sc.items); });
  ME.packList = all;
  var done = all.filter(function (p) { return plan.checked[p]; }).length, pct = all.length ? Math.round(done / all.length * 100) : 0;

  var item = function (p, mine) {
    var i = all.indexOf(p), on = !!plan.checked[p];
    return '<li class="pc-item' + (on ? " is-done" : "") + '"><button class="pc-tick" data-pk="' + i + '" aria-pressed="' + on + '"><span class="pc-box">' + (on ? BB.icon("check") : "") + "</span>" + BB.escape(p) + "</button>" +
      (mine ? '<button class="pc-del" data-pkdel="' + i + '" aria-label="Remove ' + BB.escape(p) + '">' + BB.icon("x", 13) + "</button>" : "") + "</li>";
  };
  var section = function (sc) {
    var n = sc.items.filter(function (p) { return plan.checked[p]; }).length, rows = sc.items.map(function (p) { return item(p, sc.mine); }).join("");
    if (!sc.items.length && !sc.mine && !sc.empty) { return ""; }
    var note = !sc.items.length ? '<p class="pc-note">' + (sc.empty || "") + "</p>" : (!rows ? '<p class="pc-note">' + BB.icon("check", 14) + " All packed</p>" : "");
    return '<div class="pc-sec"><h4>' + sc.title + (sc.items.length ? "<span>" + n + "/" + sc.items.length + "</span>" : "") + "</h4>" + (rows ? '<ul class="pc-list">' + rows + "</ul>" : "") + note +
      (sc.mine ? '<form class="pc-add" id="pack-add"><input class="input" id="pack-new" placeholder="Add your own item, e.g. Napkins" maxlength="40" aria-label="New packing item"><button class="btn btn-small btn-primary" aria-label="Add item">' + BB.icon("plus", 15) + " Add</button></form>" : "") + "</div>";
  };

  return '<section class="panel glass pack-card" id="pack">' +
    '<div class="pc-head"><div><h3>Packing list</h3><p>' + (done === all.length && all.length ? BB.icon("check", 15) + " Everything is packed" : done + " of " + all.length + " packed") + "</p></div></div>" +
    '<div class="pc-bar"><i style="width:' + pct + '%"></i></div>' +
    secs.map(section).join("") + "</section>";
};

ME.renderPack = function () {
  var ev = BB.eventById(ME.id), old = document.getElementById("pack"); if (!old) { return; }
  var focusAdd = document.activeElement && document.activeElement.id === "pack-new";
  old.outerHTML = ME.packCard(ev);
  var prep = document.querySelector(".prep"); if (prep) { prep.innerHTML = ME.prep(ev); }
  ME.wirePack();
  if (focusAdd) { var n = document.getElementById("pack-new"); if (n) { n.focus(); } }
};

ME.wirePack = function () {
  var ev = BB.eventById(ME.id);
  document.querySelectorAll("[data-pk]").forEach(function (b) { b.addEventListener("click", function () {
    var plan = PL.load(ev.id), p = ME.packList[parseInt(b.getAttribute("data-pk"), 10)];
    plan.checked[p] = !plan.checked[p]; PL.save(ev.id, plan); ME.renderPack();
  }); });
  document.querySelectorAll("[data-pkdel]").forEach(function (b) { b.addEventListener("click", function () {
    var plan = PL.load(ev.id), p = ME.packList[parseInt(b.getAttribute("data-pkdel"), 10)];
    plan.extraPack = plan.extraPack.filter(function (x) { return x !== p; }); delete plan.checked[p]; PL.save(ev.id, plan); ME.renderPack();
  }); });
  var f = document.getElementById("pack-add");
  if (f) { f.addEventListener("submit", function (e) {
    e.preventDefault();
    var v = document.getElementById("pack-new").value.trim(); if (!v) { return; }
    var plan = PL.load(ev.id);
    if (PL.packing(plan).map(function (x) { return x.toLowerCase(); }).indexOf(v.toLowerCase()) !== -1) { BB.toast("That is already on your list."); return; }
    plan.extraPack = plan.extraPack || []; plan.extraPack.push(v); PL.save(ev.id, plan);
    ME.renderPack();
    var n = document.getElementById("pack-new"); if (n) { n.focus(); }
  }); }
  var link = document.querySelector(".prep-link");
  if (link) { link.addEventListener("click", function (e) { e.preventDefault(); ME.goPack(); }); }
};

ME.goPack = function () {
  var c = document.getElementById("pack"); if (!c) { return; }
  c.scrollIntoView({ behavior: "smooth", block: "start" });
  c.classList.remove("flash"); void c.offsetWidth; c.classList.add("flash");
};

/* Your application: what you sent, the total, and Edit or Withdraw until applications close */
ME.appCard = function (ev) {
  var a = BB.application(ev); if (!a) { return ""; }
  var t = BB.boothType(a.booth), q = BB.quote(ev, a.booth, a.qty), req = BB.docsFor(ev, a.category);
  var up = req.filter(function (id) { return a.files[id]; }).length, open = BB.canEdit(ev), left = BB.daysUntil(ev.closes);
  var docs = req.map(function (id) { var f = a.files[id]; return '<li class="' + (f ? "ok" : "miss") + '">' + BB.icon(f ? "check" : "x", 14) + "<span>" + BB_DOC_NAMES[id] + "<small>" + (f ? BB.escape(f.name) : "Not uploaded") + "</small></span></li>"; }).join("");
  return '<section class="panel glass app-card"><div class="section-title"><span>Your application</span>' +
      (open ? '<span class="chip chip-warm">' + BB.icon("clock", 13) + " Free changes for " + (left === 0 ? "today only" : left + " more day" + (left > 1 ? "s" : "")) + "</span>" : (ev.status === "Accepted" ? '<span class="chip chip-good">' + BB.icon("check", 13) + " Booking confirmed</span>" : '<span class="chip">' + BB.icon("lock", 13) + " Locked</span>")) + "</div>" +
    '<div class="app-grid">' +
      '<div class="app-booth"><small>Booth</small><b>' + (t ? t.label : "Not chosen") + "</b><span>" + (t ? t.w + "m x " + t.d + "m" : "") + " · " + a.qty + " booth" + (a.qty > 1 ? "s" : "") + (a.qty > 1 ? (a.together === false ? ", separate spots" : ", side by side") : "") + " · " + BB_CATS[a.category].label + "</span></div>" +
      '<div class="app-docs"><small>Documents · ' + up + " of " + req.length + "</small><ul>" + docs + "</ul></div>" +
      '<div class="app-total"><small>Total payable</small><b>' + BB.money(q.total) + "</b><span>" + BB.money(q.sub) + " booths + GST + " + BB.money(q.deposit) + " refundable deposit</span></div>" +
    "</div>" +
    ME.appActions(ev, open) +
    "</section>";
};

ME.appActions = function (ev, open) {
  var req = BB.cancelReq(ev);
  if (open) {
    return '<div class="app-actions"><span class="muted">Waiting for approval (3 to 5 working days). You can change documents, booth type or number of booths, or withdraw for free, until ' + BB.shortDate(ev.closes) + '.</span><a class="btn" href="apply.html?event=' + ev.id + '">' + BB.icon("file", 16) + ' Edit application</a><button class="btn danger" id="me-withdraw">Withdraw</button></div>';
  }
  if (ev.status === "Accepted") {
    if (req) {
      return '<div class="app-actions"><div class="cancel-sent">' + BB.icon("clock", 16) + "<span><b>Cancellation request sent " + BB.shortDate(req.date) + "</b><small>Reason: " + BB.escape(req.reason) + ". The organiser decides, usually in 3 to 5 working days. Your booth stays booked until they reply.</small></span></div></div>";
    }
    return '<div class="app-actions"><span class="muted">Your booking is confirmed, so it cannot be changed or cancelled. You can ask the organiser to cancel it. There is no cash refund unless they accept your reason. Not turning up means losing the booth with no refund.</span><a class="btn" href="apply.html?event=' + ev.id + '">View application</a><button class="btn danger" id="me-cancelreq">Request cancellation</button></div>';
  }
  return '<div class="app-actions"><span class="muted">Applications closed on ' + BB.shortDate(ev.closes) + '. Your application is being reviewed. If you are not approved, you get a full refund.</span><a class="btn" href="apply.html?event=' + ev.id + '">View application</a></div>';
};

ME.render = function () {
  var ev = BB.eventById(ME.id), root = document.getElementById("root");
  if (!ev) { root.innerHTML = '<div class="panel glass"><h1 class="page-title">No events yet</h1><p class="page-sub">Apply to an event and it will show up here.</p><a class="btn btn-primary" style="margin-top:16px" href="find-events.html">Find events</a></div>'; return; }
  root.innerHTML = '<div class="me-wrap' + (ME.collapsed ? " is-collapsed" : "") + '"><aside class="rail glass">' + ME.rail() + "</aside><div>" +
    ME.next(ev) + ME.appCard(ev) +
    '<div class="me-cols"><section class="panel glass"><div class="section-title"><span>Upcoming deadlines</span><button class="btn btn-small" id="open-cal">' + BB.icon("plus", 16) + " Add</button></div>" + ME.deadlines(ev) + "</section>" +
    ME.packCard(ev) + "</div></div></div>";
  ME.wire();
};

ME.wire = function () {
  document.querySelectorAll("[data-ev]").forEach(function (b) { b.addEventListener("click", function () { ME.id = parseInt(b.getAttribute("data-ev"), 10); ME.render(); }); });
  document.querySelectorAll("[data-done]").forEach(function (b) { b.addEventListener("click", function () {
    var done = BB.read("localStorage", "bb_dl_done", {}), id = b.getAttribute("data-done");
    done[id] = !done[id]; BB.write("localStorage", "bb_dl_done", done); ME.render();
  }); });
  var cr = document.getElementById("me-cancelreq");
  if (cr) { cr.addEventListener("click", function () { BB.requestCancel(BB.eventById(ME.id), ME.render); }); }
  var wd = document.getElementById("me-withdraw");
  if (wd) { wd.addEventListener("click", function () { BB.withdraw(BB.eventById(ME.id), function () { var list = ME.events(); ME.id = list[0] ? list[0].id : 0; ME.render(); }); }); }
  ME.wirePack();
  var rt = document.getElementById("rail-toggle");
  if (rt) { rt.addEventListener("click", function () { ME.collapsed = !ME.collapsed; var w = document.querySelector(".me-wrap"); if (w) { w.classList.toggle("is-collapsed", ME.collapsed); } }); }
  var oc = document.getElementById("open-cal"); if (oc) { oc.addEventListener("click", function (e) { e.stopPropagation(); BB.cal.formOpen = true; BB.renderCalendar(); document.getElementById("btn-cal").click(); }); }
};

document.addEventListener("DOMContentLoaded", function () {
  var list = ME.events();
  ME.id = parseInt(BB.param("event"), 10) || (list[0] ? list[0].id : 0);
  ME.render();
  if (location.hash === "#pack") { setTimeout(ME.goPack, 250); }
});
