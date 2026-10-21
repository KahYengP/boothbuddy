/* Compare Events: up to 3 events side by side, best value tinted */
var CP = { ids: [] };

CP.load = function () {
  var q = BB.param("ids");
  var ids = q ? q.split(",").map(function (n) { return parseInt(n, 10); }) : BB.read("sessionStorage", "bb_compare", []);
  CP.ids = ids.filter(function (id) { return BB.eventById(id); }).slice(0, 3);
  BB.write("sessionStorage", "bb_compare", CP.ids);
};

CP.perK = function (ev) { return ev.fee / (ev.footfall / 1000); };

CP.watch = function (ev) {
  var out = [];
  ev.tags.forEach(function (t) { if (!t.good) { out.push(t.t); } });
  var issues = BB.eventDocIssues(ev);
  if (issues) { out.push(issues + " document" + (issues > 1 ? "s" : "") + " to fix"); }
  if (!ev.mix) { out.push("Vendor mix not shared"); }
  if (BB.daysUntil(ev.closes) <= 3 && !ev.status) { out.push(BB.closingText(ev)); }
  return out;
};

CP.cell = function (label, val, win, txt) {
  return '<div class="cmp-row' + (win ? " is-win" : "") + '"><div class="lbl">' + label + '</div><div class="val' + (txt ? " txt" : "") + '">' + val + "</div></div>";
};

CP.render = function () {
  var evs = CP.ids.map(BB.eventById);
  var root = document.getElementById("root");
  var h = '<a class="back-link" href="find-events.html">' + BB.icon("chevLeft", 18) + ' Find events</a>' +
    '<div class="cmp-head"><div><h1 class="page-title">Compare events</h1><p class="page-sub">Pick up to 3 and see which one is worth your booth fee.</p></div>' +
    '<button class="btn btn-small" id="clear-all">Clear all</button></div>';
  if (!evs.length) {
    root.innerHTML = h + '<div class="cmp-empty glass"><p class="page-sub" style="margin-bottom:18px">Nothing to compare yet. Pick events from Find Events, or add one here.</p><button class="btn btn-primary" id="add-event">' + BB.icon("plus", 18) + " Add event</button></div>";
    CP.wire(); return;
  }
  var bestK = Math.min.apply(null, evs.map(CP.perK));
  var minFee = Math.min.apply(null, evs.map(BB.priceFrom));
  var maxFoot = Math.max.apply(null, evs.map(function (e) { return e.footfall; }));
  var minClose = evs.map(function (e) { return e.closes; }).sort()[0];
  var cols = evs.length + (evs.length < 3 ? 1 : 0);
  h += '<div class="cmp-grid" style="grid-template-columns:repeat(' + cols + ',1fr)">';
  evs.forEach(function (ev) {
    var best = evs.length > 1 && CP.perK(ev) === bestK;
    var det = BB_DETAILS[ev.id];
    h += '<article class="cmp-col glass' + (best ? " is-best" : "") + '">' + (best ? '<span class="best-flag">Best value</span>' : "") +
      '<div class="cmp-img" style="' + BB.bg(ev) + '"><button class="icon-btn" data-remove="' + ev.id + '" aria-label="Remove">' + BB.icon("x", 16) + "</button></div>" +
      '<div class="cmp-title"><h3>' + ev.name + "</h3><small>" + ev.venue + " · " + ev.dates + "</small></div>" +
      CP.cell("Booth fee", "<small>from </small>$" + BB.priceFrom(ev) + "<small>/day</small>", evs.length > 1 && BB.priceFrom(ev) === minFee) +
      CP.cell("Expected footfall", (ev.footfall / 1000).toFixed(1) + "k<small>/day</small>", evs.length > 1 && ev.footfall === maxFoot) +
      '<div class="cmp-row"><div class="lbl">Booth types and prices</div><div class="bt-mini">' + BB.boothTypesFor(ev).map(function (t) { return '<div><span>' + t.label + " <small>" + t.w + "m x " + t.d + "m</small></span><b>$" + BB.boothPrice(ev, t.id) + "</b></div>"; }).join("") + "</div></div>" +
      '<div class="cmp-row"><div class="lbl">Vendor mix</div>' + BB.mixBar(ev) + "</div>" +
      '<div class="cmp-row"><div class="lbl">Categories accepted</div><div class="val txt">' + ev.cats.map(function (c) { return BB_CATS[c].label; }).join(", ") + "</div></div>" +
      CP.cell("Application closes", BB.shortDate(ev.closes) + "<small>" + BB.closingText(ev).replace("Closes ", "") + "</small>", evs.length > 1 && ev.closes === minClose && evs.filter(function (e) { return e.closes === minClose; }).length === 1 ? false : false) +
      CP.cell("Power and setup", det.power + "<br><span class='muted'>Load-in " + det.loadIn + "</span>", false, true) +
      '<div class="cmp-row"><div class="lbl">What past vendors say</div><div class="tag-row" style="display:flex;flex-wrap:wrap;gap:6px">' + (ev.tags.length ? ev.tags.map(function (t) { return '<span class="chip ' + (t.good ? "chip-good" : "chip-bad") + '">' + t.t + "</span>"; }).join("") : '<span class="chip">No reviews yet</span>') + "</div></div>" +
      '<div class="cmp-actions"><a class="btn" href="event-detail.html?event=' + ev.id + '">View</a>' +
        (ev.status ? '<span class="status-pill ' + (ev.status === "Accepted" ? "chip-good" : "chip-gold") + '" style="height:44px">' + ev.status + "</span>" : '<a class="btn btn-primary" href="apply.html?event=' + ev.id + '">Apply</a>') + "</div></article>";
  });
  if (evs.length < 3) { h += '<button class="cmp-add" id="add-event"><span><span class="circle">' + BB.icon("plus", 26) + "</span>Add another event<br><small>" + (3 - evs.length) + " more can fit</small></span></button>"; }
  h += "</div>";
  root.innerHTML = h;
  CP.wire();
};

/* ---------- Add an event: search, filter by area, tap cards to add (up to 3), then Done ---------- */
CP.pick = { q: "", area: "All" };

CP.pickCard = function (e) {
  var on = CP.ids.indexOf(e.id) !== -1, full = CP.ids.length >= 3 && !on;
  var days = BB.daysUntil(e.closes), closing = e.status ? e.status : (days < 0 ? "Closed" : BB.closingText(e));
  var tags = e.tags.slice(0, 2).map(function (t) { return '<span class="pk-tag ' + (t.good ? "good" : "bad") + '">' + t.t + "</span>"; }).join("");
  return '<button class="pick-card' + (on ? " is-on" : "") + (full ? " is-full" : "") + '" data-pick="' + e.id + '"' + (full ? ' aria-disabled="true"' : "") + ' aria-pressed="' + on + '">' +
    '<span class="pc-img"><img src="' + (e.photo || e.image) + '" alt="" loading="lazy" onerror="this.onerror=null;this.src=\'' + e.image + '\'"><span class="pc-area">' + e.area + "</span></span>" +
    '<span class="pc-body"><b>' + e.name + "</b><small>" + e.dates + " · " + e.venue.split(",")[0] + "</small>" +
      '<span class="pc-stats"><span><i>From</i>$' + BB.priceFrom(e) + "<em>/day</em></span><span><i>Footfall</i>" + (e.footfall / 1000).toFixed(1) + "k<em>/day</em></span></span>" +
      '<span class="pc-foot"><span class="pc-close">' + BB.icon("clock", 13) + " " + closing + "</span>" + tags + "</span></span>" +
    '<span class="pc-add" title="' + (on ? "Added. Tap to remove" : "Add to compare") + '">' + BB.icon(on ? "check" : "plus", 16) + "</span></button>";
};

CP.pickBody = function () {
  var q = CP.pick.q.toLowerCase(), area = CP.pick.area;
  var list = BB_EVENTS.filter(function (e) {
    return (area === "All" || e.area === area) && (!q || (e.name + " " + e.venue + " " + e.area).toLowerCase().indexOf(q) !== -1);
  });
  var left = 3 - CP.ids.length;
  return '<p class="pk-slots">' + (left ? BB.icon("compare", 15) + " " + CP.ids.length + " of 3 picked. You can add " + left + " more." : BB.icon("check", 15) + " 3 of 3 picked. Remove one to add a different event.") + "</p>" +
    (list.length ? '<div class="pick-grid">' + list.map(CP.pickCard).join("") + "</div>" : '<div class="pick-none">' + BB.icon("search", 22) + "<p>No events match “" + BB.escape(CP.pick.q) + "”.</p></div>");
};

CP.openPicker = function () {
  var m = document.getElementById("modal"), areas = ["All"];
  BB_EVENTS.forEach(function (e) { if (areas.indexOf(e.area) === -1) { areas.push(e.area); } });
  CP.pick = { q: "", area: "All" };
  m.hidden = false;
  m.innerHTML = '<div class="modal picker" role="dialog" aria-modal="true" aria-labelledby="pk-title">' +
    '<div class="pk-head"><div><h3 id="pk-title">Add events to compare</h3><small>Tap an event to add it. Pick up to 3.</small></div><button class="icon-btn" id="modal-close" aria-label="Close">' + BB.icon("x", 18) + "</button></div>" +
    '<div class="pk-tools"><label class="pk-search">' + BB.icon("search", 18) + '<input id="pk-q" placeholder="Search by name or place" autocomplete="off"></label>' +
      '<div class="pk-areas">' + areas.map(function (a) { return '<button class="pk-area' + (a === "All" ? " is-on" : "") + '" data-area="' + a + '">' + a + "</button>"; }).join("") + "</div></div>" +
    '<div class="pk-body" id="pk-body">' + CP.pickBody() + "</div>" +
    '<div class="pk-foot"><span class="muted">' + BB.icon("trend", 15) + " Best value is the lowest fee for every 1,000 visitors.</span><button class=\"btn btn-primary\" id=\"pk-done\">Done</button></div></div>";

  var close = function () { m.hidden = true; m.innerHTML = ""; document.removeEventListener("keydown", esc); CP.render(); };
  var esc = function (e) { if (e.key === "Escape") { close(); } };
  document.addEventListener("keydown", esc);
  var refresh = function () { document.getElementById("pk-body").innerHTML = CP.pickBody(); wireCards(); };
  var wireCards = function () {
    m.querySelectorAll("[data-pick]").forEach(function (b) {
      b.addEventListener("click", function () {
        var id = parseInt(b.getAttribute("data-pick"), 10), i = CP.ids.indexOf(id);
        if (i !== -1) { CP.ids.splice(i, 1); }
        else if (CP.ids.length < 3) { CP.ids.push(id); }
        else { BB.toast("You can compare up to 3. Remove one first."); return; }
        BB.write("sessionStorage", "bb_compare", CP.ids); refresh();
      });
    });
  };
  wireCards();
  m.querySelector("#modal-close").addEventListener("click", close);
  m.querySelector("#pk-done").addEventListener("click", close);
  m.onclick = function (e) { if (e.target === m) { close(); } };
  var input = m.querySelector("#pk-q");
  input.addEventListener("input", function () { CP.pick.q = input.value.trim(); refresh(); });
  m.querySelectorAll("[data-area]").forEach(function (b) {
    b.addEventListener("click", function () {
      CP.pick.area = b.getAttribute("data-area");
      m.querySelectorAll("[data-area]").forEach(function (x) { x.classList.toggle("is-on", x === b); });
      refresh();
    });
  });
  input.focus();
};

CP.wire = function () {
  document.querySelectorAll("[data-remove]").forEach(function (b) {
    b.addEventListener("click", function () { CP.ids = CP.ids.filter(function (i) { return i !== parseInt(b.getAttribute("data-remove"), 10); }); BB.write("sessionStorage", "bb_compare", CP.ids); CP.render(); });
  });
  var add = document.getElementById("add-event"); if (add) { add.addEventListener("click", CP.openPicker); }
  document.getElementById("clear-all").addEventListener("click", function () { CP.ids = []; BB.write("sessionStorage", "bb_compare", []); CP.render(); });
};

document.addEventListener("DOMContentLoaded", function () { CP.load(); CP.render(); });
