/* Event detail page: hero, floor plan, documents, logistics, tips, reviews */
var ED = { ev: null, det: null, sel: null, drawerTab: "docs", open: false };


ED.dots = function (n) {
  var h = "";
  for (var i = 1; i <= 5; i++) { h += '<i class="' + (i <= n ? "on" : "") + '"></i>'; }
  return '<span class="dots">' + h + "</span>";
};

ED.tags = function () {
  var ev = ED.ev;
  if (!ev.tags.length) { return '<span class="chip">No reviews yet</span>'; }
  return ev.tags.map(function (t) { return '<span class="chip ' + (t.good ? "chip-good" : "chip-bad") + '">' + t.t + "</span>"; }).join("");
};

/* what the Add to deadlines button adds: the closing date while applications are open, otherwise the event day */
ED.deadlineItem = function () {
  var ev = ED.ev;
  if (!ev.status) { return { title: "Application closes: " + ev.name, date: ev.closes, from: "12:00", to: "23:59", eventId: ev.id, link: "find-events.html", label: "Add closing date" }; }
  return { title: ev.short + " event day", date: BB_START[ev.id], from: "08:00", to: "20:00", eventId: ev.id, link: "my-events.html?event=" + ev.id, label: "Add event day" };
};
ED.hasDeadline = function (title) {
  return BB.getDeadlines().some(function (d) { return d.title === title; });
};
ED.isSaved = function () { return BB.read("localStorage", "bb_saved", []).indexOf(ED.ev.id) !== -1; };

/* Save sits at the top right of the event info */
ED.saveBtn = function () {
  var on = ED.isSaved();
  return '<button class="hero-save' + (on ? " is-on" : "") + '" id="d-save" aria-pressed="' + on + '" title="' + (on ? "Remove from saved events" : "Save this event") + '">' + BB.icon("bookmark", 17) + "<span>" + (on ? "Saved" : "Save") + "</span></button>";
};

ED.mailto = function () {
  return "mailto:" + ED.det.email + "?subject=" + encodeURIComponent("Question about " + ED.ev.name);
};

ED.actions = function () {
  var ev = ED.ev, h = "", item = ED.deadlineItem(), added = ED.hasDeadline(item.title);
  if (ev.status === "Accepted") { h += '<span class="status-pill chip-good">' + BB.icon("check", 16) + " Accepted</span>"; }
  else if (ev.status === "Applied") { h += '<span class="status-pill chip-gold">' + BB.icon("clock", 16) + " Applied</span>"; }
  else { h += '<a class="btn btn-primary" href="apply.html?event=' + ev.id + '">Apply now</a>'; }
  h += '<button class="btn" id="d-deadline"' + (added ? " disabled" : "") + ">" + BB.icon(added ? "check" : "plus", 18) + (added ? " Added to deadlines" : " " + item.label) + "</button>";
  /* contact organiser: opens the person's email app with the subject filled in */
  h += '<a class="btn" id="d-contact" href="' + ED.mailto() + '" title="Email ' + BB.escape(ED.det.organiser) + " at " + ED.det.email + '">' + BB.icon("mail", 18) + " Contact organiser</a>";
  return h;
};

ED.hero = function () {
  var ev = ED.ev, det = ED.det;
  return '<section class="hero glass">' +
    '<div class="hero-img" style="' + BB.bg(ev) + '">' +
      '<div class="callout c2"><small>Booth fee from</small><b>$' + BB.priceFrom(ev) + '</b><small>per day</small></div>' +
      '<div class="callout c1"><b>' + (ev.footfall / 1000).toFixed(1) + 'k</b><small>Expected footfall per day</small></div>' +
      '<div class="callout c3"><small>Peak hours</small><b style="font-size:18px">' + det.peak + "</b></div>" +
    "</div>" +
    '<div class="hero-info">' +
      '<div class="row"><span class="chip"><span class="event-dot" style="background:' + ev.color + '"></span>' + ev.short + "</span>" +
        (ev.visited ? '<span class="chip">Visited before</span>' : "") +
        (BB.daysUntil(ev.closes) <= 7 && !ev.status ? '<span class="chip chip-warm">' + BB.icon("clock", 14) + " " + BB.closingText(ev) + "</span>" : "") +
        ED.saveBtn() + "</div>" +
      "<h1>" + ev.name + "</h1>" +
      '<div class="meta-list"><div>' + BB.icon("pin", 18) + ev.venue + "</div><div>" + BB.icon("calendar", 18) + ev.dates + "</div><div>" + BB.icon("users", 18) + det.organiser + " · " + det.booths + " booths</div></div>" +
      "<p>" + det.about + "</p>" +
      '<div><div class="muted" style="font-size:14px;margin-bottom:6px">Vendor mix</div>' + BB.mixBar(ev) + "</div>" +
      '<div class="tag-row">' + ED.tags() + "</div>" +
      '<div class="hero-actions">' + ED.actions() + "</div>" +
    "</div></section>";
};

ED.days = function () {
  var m = ED.ev.dates.match(/^(\d+)\s+to\s+(\d+)/);
  return m ? parseInt(m[2], 10) - parseInt(m[1], 10) + 1 : 1;
};

/* ---------- Booth types: pick a type, see it in 3D, as a small 2D plan, with what comes with it ---------- */
ED.types = function () { return BB.boothTypesFor(ED.ev); };

ED.boothInfo = function () {
  var t = BB.boothType(ED.bt), ev = ED.ev, price = BB.boothPrice(ev, t.id), days = ED.days();
  return '<div class="bx-col amen"><div class="bx-head"><span class="chip">' + BB_CATS[t.cat].label + "</span><h3>" + t.label + "</h3><p class=\"muted\">" + t.note + "</p></div>" +
    BB.amenityHtml(t) + '</div><div class="bx-col buy bx-buy">' +
    '<div class="bx-type"><b>Booth type</b><span>' + t.w + "m x " + t.d + "m system panel booth</span></div>" +
    '<div class="bx-qty"><span>Number of booths</span><div class="qty"><button type="button" data-bq="-1"' + (ED.qty <= 1 ? " disabled" : "") + ' aria-label="Fewer booths">' + BB.icon("minus", 16) + "</button><b>" + ED.qty + '</b><button type="button" data-bq="1"' + (ED.qty >= BB.MAX_BOOTHS ? " disabled" : "") + ' aria-label="More booths">' + BB.icon("plus", 16) + "</button></div></div>" +
    '<div class="bx-total"><small>Total for ' + days + " day" + (days > 1 ? "s" : "") + (ED.qty > 1 ? " · " + ED.qty + " booths" : "") + "</small><b>" + BB.money(price * days * ED.qty) + "</b><span>" + BB.money(price) + "/day per booth · before GST</span></div>" +
    (ev.status ? "" : '<a class="btn btn-primary bx-apply" href="apply.html?event=' + ev.id + "&booth=" + t.id + "&qty=" + ED.qty + '">Apply with ' + (ED.qty > 1 ? ED.qty + " booths" : "this booth") + "</a>") + "</div>";
};

ED.boothPanel = function () {
  var types = ED.types();
  if (!ED.bt || !types.some(function (t) { return t.id === ED.bt; })) { ED.bt = types[0].id; }
  var tabs = types.map(function (t) {
    return '<button class="bx-tab' + (t.id === ED.bt ? " is-active" : "") + '" data-bt="' + t.id + '"><span>' + t.label + "</span><small>$" + BB.boothPrice(ED.ev, t.id) + "/day</small></button>";
  }).join("");
  return '<div class="panel glass booth-x"><div class="section-title"><span>Booth types</span><span class="chip">' + types.length + " types · from $" + BB.priceFrom(ED.ev) + "/day</span></div>" +
    '<div class="bx-tabs">' + tabs + "</div>" +
    '<div class="bx-body"><div class="bx-visual"><div class="bx-3d" id="bx-3d"><span class="bx-hint">Drag to turn · scroll to zoom</span></div>' +
      '<div class="bx-plan"><div class="bx-plan-title" id="bx-plan-title">' + BB.icon("map", 15) + ' Floor plan</div><div id="bx-plan">' + BB.boothPlanSvg(BB.boothType(ED.bt)) + "</div></div></div>" +
    '<div class="bx-info" id="bx-info">' + ED.boothInfo() + "</div></div></div>";
};

ED.pickBooth = function (id) {
  ED.bt = id;
  document.querySelectorAll("[data-bt]").forEach(function (b) { b.classList.toggle("is-active", b.getAttribute("data-bt") === id); });
  ED.drawBooth();
};
/* 2 or more booths are shown joined side by side, in the plan and in 3D */
ED.drawBooth = function () {
  var t = BB.boothType(ED.bt);
  document.getElementById("bx-info").innerHTML = ED.boothInfo();
  document.getElementById("bx-plan").innerHTML = BB.boothPlanSvg(t, ED.qty);
  document.getElementById("bx-plan-title").innerHTML = BB.icon("map", 15) + (ED.qty > 1 ? " Floor plan · " + ED.qty + " booths joined, " + t.w * ED.qty + "m x " + t.d + "m" : " Floor plan");
  BB.Booth3D.show(t, ED.qty);
};

/* what each document is, in one short line */
ED.DOC_HINTS = {
  acra: "Your UEN business profile from ACRA BizFile",
  nea: "Needed for any food or drinks you sell",
  halal: "Copy of your MUIS halal certificate",
  insurance: "Public liability cover of at least $1 million",
  menu: "The items you plan to sell, with prices",
  layout: "A simple drawing of your booth set-up"
};
ED.docTable = function () {
  var rows = ED.det.required.map(function (id) {
    return '<div class="req-row"><span class="req-ic">' + BB.icon("file", 17) + "</span><span><b>" + BB_DOC_NAMES[id] + "</b><small>" + (ED.DOC_HINTS[id] || "") + "</small></span></div>";
  }).join("");
  return '<div class="panel glass compact req-card"><div class="section-title"><span>Required documents</span><span class="chip">' + ED.det.required.length + "</span></div>" + rows +
    '<p class="muted req-note">' + BB.icon("upload", 14) + " You upload these when you apply. Files you upload once are saved for your next event.</p></div>";
};


/* Crowd and getting there: fills the left column under Venue tips */
ED.TRAVEL = {
  1: { mrt: "Clementi MRT (EW23)", walk: "2 min walk, linked by the bridge", park: "Mall carpark B1 to B3" },
  2: { mrt: "Toa Payoh MRT (NS19)", walk: "3 min walk via the bus interchange", park: "HDB Hub carpark, Block 480" },
  3: { mrt: "Tampines MRT (EW2 / DT32)", walk: "5 min walk", park: "Our Tampines Hub basement" },
  4: { mrt: "Jurong East MRT (EW24 / NS1)", walk: "4 min walk via the JEM link", park: "JEM carpark, Level B2" },
  5: { mrt: "Chinatown MRT (NE4 / DT19)", walk: "Exit A opens onto Pagoda Street", park: "People's Park Complex" },
  6: { mrt: "Bishan MRT (NS17 / CC15)", walk: "6 min walk", park: "Bishan CC open-air lots" }
};

/* turn "12pm to 3pm, 6pm to 8pm" into busy levels for 10am to 9pm */
ED.crowd = function (peak) {
  var hours = [], i, toH = function (t) { var m = t.trim().match(/(\d+)(am|pm)/); if (!m) { return 0; } var h = parseInt(m[1], 10) % 12; return m[2] === "pm" ? h + 12 : h; };
  for (i = 10; i <= 21; i++) { hours.push({ h: i, v: 0.3 + ((i * 7) % 5) * 0.03 }); }
  (peak || "").split(",").forEach(function (r) {
    var p = r.split("to"); if (p.length < 2) { return; }
    var a = toH(p[0]), b = toH(p[1]);
    hours.forEach(function (x) { if (x.h >= a && x.h < b) { x.v = 0.85 + ((x.h * 3) % 4) * 0.04; } else if (x.h === a - 1 || x.h === b) { x.v = Math.max(x.v, 0.58); } });
  });
  return hours;
};

/* venue photos, for the grid and the photo viewer */
ED.photos = function () {
  var ev = ED.ev, list = ev.gallery && ev.gallery.length ? ev.gallery : [ev.image, ev.image, ev.image];
  return list.map(function (src, n) { return { src: src, fallback: ev.image, caption: ev.name + " · venue photo " + (n + 1) + " of " + list.length }; });
};

ED.crowdHtml = function () {
  var ev = ED.ev, det = ED.det, tr = ED.TRAVEL[ev.id] || ED.TRAVEL[1], hours = ED.crowd(det.peak);
  var lbl = function (h) { return h === 12 ? "12p" : (h > 12 ? (h - 12) + "p" : h + "a"); };
  var bars = hours.map(function (x) { return '<div class="cb' + (x.v > 0.8 ? " hot" : "") + '" title="' + lbl(x.h) + '"><i style="height:' + Math.round(x.v * 100) + '%"></i><small>' + (x.h % 2 === 0 ? lbl(x.h) : "") + "</small></div>"; }).join("");
  var pics = ED.photos().map(function (p, n) { return '<button class="vp" data-vp="' + n + '" aria-label="Open venue photo ' + (n + 1) + '" style="background-image:url(\'' + p.src + "'),url('" + ev.image + "')\"><span class=\"vp-zoom\">" + BB.icon("zoomIn", 16) + "</span></button>"; }).join("");
  return '<div class="panel glass crowd-card"><div class="section-title"><span>Crowd and getting there</span><span class="chip">' + BB.icon("users", 14) + " " + det.booths + " booths</span></div>" +
    '<div class="crowd-grid"><div><p class="muted" style="font-size:14.5px;margin-bottom:10px">Busiest: <b style="color:var(--ink);font-weight:500">' + det.peak + "</b></p>" +
      '<div class="crowd-bars">' + bars + "</div></div>" +
      '<div class="travel"><div class="tr-row">' + BB.icon("pin", 18) + "<div><b>" + tr.mrt + "</b><small>" + tr.walk + "</small></div></div>" +
        '<div class="tr-row">' + BB.icon("bolt", 18) + "<div><b>Parking and loading</b><small>" + tr.park + "</small></div></div>" +
        '<div class="tr-row">' + BB.icon("people", 18) + "<div><b>" + (ev.footfall / 1000).toFixed(1) + "k visitors a day</b><small>Expected footfall from the organiser</small></div></div></div></div>" +
    '<div class="section-title" style="font-size:16px;margin-top:18px"><span>Venue photos</span></div><div class="venue-pics">' + pics + "</div></div>";
};

/* Reviews: folded by default, with the average rating in the summary */
ED.reviewsHtml = function () {
  var det = ED.det, ev = ED.ev, n = det.reviews.length;
  var avg = n ? det.reviews.reduce(function (t, r) { return t + r.stars; }, 0) / n : 0;
  var head = '<details class="panel glass compact fold rv-fold" open><summary><span class="fold-t"><b>Reviews from sellers</b><small>' +
    (n ? BB.stars(Math.round(avg)) + " " + avg.toFixed(1) + " from " + n + " review" + (n > 1 ? "s" : "") : "No reviews yet") + "</small></span>" + BB.icon("chevDown", 18) + '</summary><div class="fold-body">';
  if (!n) { return head + '<p class="muted" style="padding:6px 0">Be the first to review after you visit.</p></div></details>'; }
  return head + det.reviews.map(function (r) {
    return '<div class="review"><div class="who"><span class="avatar" style="width:32px;height:32px;font-size:14px">' + r.who.split(" ").map(function (p) { return p[0]; }).join("") + "</span><b style=\"font-weight:500\">" + r.who + "</b>" +
      '<span class="spacer"></span>' + BB.stars(r.stars) + "</div><p>" + r.text + '</p><small class="muted">' + r.date + "</small></div>";
  }).join("") + '<a class="btn btn-small rv-more" href="community.html">More reviews in Community</a></div></details>';
};

ED.render = function () {
  document.getElementById("root").innerHTML =
    '<a class="back-link" href="find-events.html">' + BB.icon("chevLeft", 18) + " Find events</a>" +
    ED.hero() +
    /* row 1: crowd and required documents, same height. row 2: booth types full width. row 3: reviews */
    '<div class="ed-row">' + ED.crowdHtml() + ED.docTable() + "</div>" + ED.boothPanel() + ED.reviewsHtml();
  ED.wire();
  var host = document.getElementById("bx-3d");
  if (window.THREE && BB.Booth3D.init(host)) { BB.Booth3D.show(BB.boothType(ED.bt)); } else { host.classList.add("no-3d"); host.innerHTML = '<p class="muted">3D preview is not available in this browser. The floor plan below shows the layout.</p>'; }
};

ED.wireSave = function () {
  var ev = ED.ev;
  var sv = document.getElementById("d-save");
  if (sv) { sv.addEventListener("click", function () {
    var saved = BB.read("localStorage", "bb_saved", []);
    var i = saved.indexOf(ev.id);
    if (i === -1) { saved.push(ev.id); BB.toast("Saved. Find it under Saved on Find Events."); } else { saved.splice(i, 1); BB.toast("Removed from saved."); }
    BB.write("localStorage", "bb_saved", saved);
    sv.outerHTML = ED.saveBtn();
    ED.wireSave();
  }); }
};

ED.wire = function () {
  document.querySelectorAll("[data-vp]").forEach(function (b) {
    b.addEventListener("click", function () { BB.viewer.open(ED.photos(), parseInt(b.getAttribute("data-vp"), 10)); });
  });
  var ev = ED.ev;
  document.querySelectorAll("[data-bt]").forEach(function (b) { b.addEventListener("click", function () { ED.pickBooth(b.getAttribute("data-bt")); }); });
  var info = document.getElementById("bx-info");
  if (info) { info.addEventListener("click", function (e) { var q = e.target.closest("[data-bq]"); if (!q) { return; } ED.qty = Math.max(1, Math.min(BB.MAX_BOOTHS, ED.qty + parseInt(q.getAttribute("data-bq"), 10))); ED.drawBooth(); }); }
  document.querySelectorAll("[data-toast]").forEach(function (b) { b.addEventListener("click", function () { BB.toast(b.getAttribute("data-toast")); }); });
  var c = document.getElementById("d-compare");
  if (c) { c.addEventListener("click", function () {
    var ids = BB.read("sessionStorage", "bb_compare", []);
    if (ids.indexOf(ev.id) === -1) { if (ids.length >= 3) { BB.toast("You can compare up to 3 events."); return; } ids.push(ev.id); BB.write("sessionStorage", "bb_compare", ids); }
    window.location.href = "compare.html?ids=" + ids.join(",");
  }); }
  ED.wireSave();
  var d = document.getElementById("d-deadline");
  if (d) { d.addEventListener("click", function () {
    var item = ED.deadlineItem(); delete item.label;
    BB.addAutoDeadline(item);
    d.disabled = true; d.innerHTML = BB.icon("check", 18) + " Added to deadlines"; BB.toast("Added to your deadlines.");
  }); }
};

document.addEventListener("DOMContentLoaded", function () {
  var ev = BB.eventById(parseInt(BB.param("event"), 10)) || BB_EVENTS[0];
  ED.ev = ev; ED.det = BB_DETAILS[ev.id]; ED.bt = BB.param("booth") || ""; ED.qty = 1;
  ED.render();
});
