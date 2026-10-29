/* =========================================================
   Find Events page
   Cards, search and filters, list or map view, compare tray (max 3),
   save bookmarks, one-tap "Add to deadlines".
   ========================================================= */

var FE = {
  query: "",
  cat: "all",
  maxFee: 450,
  area: "all",
  sort: "closing",
  view: "list",
  savedOnly: false,
  selectedPin: 1,
  compare: BB.read("sessionStorage", "bb_compare", []),
  saved: BB.read("localStorage", "bb_saved", [])
};

/* ---------- Helpers ---------- */
FE.daysUntil = function (dateText) {
  return Math.round((new Date(dateText + "T00:00:00") - new Date(BB_TODAY + "T00:00:00")) / 86400000);
};

FE.closingText = function (ev) {
  var d = FE.daysUntil(ev.closes);
  if (d <= 0) { return "Closes today"; }
  if (d === 1) { return "Closes tomorrow"; }
  return "Closes in " + d + " days";
};

FE.deadlineTitle = function (ev) { return "Application closes: " + ev.name; };

FE.isInDeadlines = function (ev) {
  var list = BB.getDeadlines();
  for (var i = 0; i < list.length; i++) {
    if (list[i].title === FE.deadlineTitle(ev)) { return true; }
  }
  return false;
};

FE.matches = function (ev) {
  var text = (ev.name + " " + ev.venue).toLowerCase();
  if (FE.query && text.indexOf(FE.query.toLowerCase()) === -1) { return false; }
  if (FE.cat !== "all" && ev.cats.indexOf(FE.cat) === -1) { return false; }
  if (FE.savedOnly && FE.saved.indexOf(ev.id) === -1) { return false; }
  if (BB.priceFrom(ev) > FE.maxFee) { return false; }
  if (FE.area !== "all" && ev.area !== FE.area) { return false; }
  return true;
};

FE.visibleEvents = function () {
  var list = BB_EVENTS.filter(FE.matches);
  list.sort(function (a, b) {
    if (FE.sort === "fee") { return BB.priceFrom(a) - BB.priceFrom(b); }
    if (FE.sort === "footfall") { return b.footfall - a.footfall; }
    return a.closes < b.closes ? -1 : 1;
  });
  return list;
};

FE.updateSavedBtn = function () {
  var b = document.getElementById("saved-btn");
  b.classList.toggle("is-active", FE.savedOnly);
  document.getElementById("saved-count").textContent = FE.saved.length;
};

/* category chips inside Filters, and a count on the Filters button when something is filtered */
FE.syncCats = function () {
  document.querySelectorAll("#cat-chips .fp-cat").forEach(function (b) { b.classList.toggle("is-active", b.getAttribute("data-cat") === FE.cat); });
};
FE.updateFilterCount = function () {
  var n = (FE.cat !== "all") + (FE.maxFee < 450) + (FE.area !== "all") + (FE.sort !== "closing"), el = document.getElementById("filter-count");
  if (!el) { return; }
  el.hidden = !n; el.textContent = n;
  document.getElementById("filters-btn").classList.toggle("is-active", n > 0);
};

FE.formatFootfall = function (n) { return (n / 1000).toFixed(1) + "k"; };

/* ---------- Card pieces ---------- */
FE.flagsHtml = function (ev) {
  var html = "";
  if (!ev.status && FE.daysUntil(ev.closes) <= 7) {
    html += '<span class="chip chip-warm">' + BB.icon("clock", 14) + " " + FE.closingText(ev) + "</span>";
    if (FE.isInDeadlines(ev)) {
      html += '<button class="add-dl is-added" data-adddl="' + ev.id + '" disabled>' + BB.icon("check", 14) + " Added</button>";
    } else {
      html += '<button class="add-dl" data-adddl="' + ev.id + '">' + BB.icon("plus", 14) + " Add to deadlines</button>";
    }
  }
  return html;
};

FE.actionHtml = function (ev) {
  if (ev.status === "Accepted") { return '<span class="status-pill chip-good">' + BB.icon("check", 16) + " Accepted</span>"; }
  if (ev.status === "Applied") { return '<span class="status-pill chip-gold">' + BB.icon("clock", 16) + " Applied</span>"; }
  return '<a class="btn btn-primary" href="apply.html?event=' + ev.id + '">Apply</a>';
};

FE.cardHtml = function (ev) {
  var saved = FE.saved.indexOf(ev.id) !== -1;
  var inCompare = FE.compare.indexOf(ev.id) !== -1;
  return '<article class="event-card glass" tabindex="0" data-href="event-detail.html?event=' + ev.id + '" aria-label="' + ev.name + '">' +
    '<div class="card-img" style="' + BB.bg(ev) + '">' +
      '<span class="chip on-image"><span class="event-dot" style="background:' + ev.color + '"></span>' + ev.short + "</span>" +
      '<div class="img-actions"><button class="icon-btn save-btn' + (saved ? " is-saved" : "") + '" data-save="' + ev.id + '" aria-label="Save event">' + BB.icon("bookmark") + "</button></div>" +
    "</div>" +
    '<div class="card-body">' +
      "<h3>" + ev.name + "</h3>" +
      '<div class="card-meta">' + BB.icon("pin") + "<span>" + ev.venue + " · " + ev.dates + "</span></div>" +
      '<div class="card-stats"><div class="stat"><b><small class="from">From </small>$' + BB.priceFrom(ev) + "<small>/day</small></b><span>Booth fee</span></div></div>" +
      '<div class="card-flags">' + FE.flagsHtml(ev) + "</div>" +
      '<div class="card-actions">' +
        '<a class="view-link" href="event-detail.html?event=' + ev.id + '">View' + BB.icon("chevRight", 16) + "</a>" +
        '<span class="spacer"></span>' +
        '<button class="cmp-check' + (inCompare ? " is-on" : "") + '" data-compare="' + ev.id + '" role="checkbox" aria-checked="' + inCompare + '"><span class="box">' + (inCompare ? BB.icon("check", 14) : "") + "</span>Compare</button>" +
        FE.actionHtml(ev) +
      "</div>" +
    "</div></article>";
};

/* ---------- Render list ---------- */
FE.renderGrid = function () {
  var list = FE.visibleEvents();
  FE.updateFilterCount();
  document.getElementById("count-num").textContent = list.length;
  document.getElementById("events-grid").innerHTML = list.map(FE.cardHtml).join("");
  document.getElementById("empty-state").hidden = list.length > 0;
  FE.renderMap(list);
  FE.renderTray();
};

/* ---------- Render map (Google Maps) ----------
   With BB_MAPS_KEY set: one interactive Google map with a price pin for every event.
   Without a key: the free Google Maps embed, centred on the event you pick from the list. */
FE.gmap = null; FE.gmarkers = [];

FE.renderMap = function (list) {
  if (list.length && !list.some(function (e) { return e.id === FE.selectedPin; })) { FE.selectedPin = list[0].id; }
  document.getElementById("map-list").innerHTML = list.map(function (ev) {
    return '<button class="map-item' + (ev.id === FE.selectedPin ? " is-selected" : "") + '" data-pin="' + ev.id + '"><span class="ev-letter" style="background:' + ev.color + '">' + BB.letter(ev) + "</span>" +
      '<span class="mi-txt"><b>' + ev.name + "</b><small>" + ev.area + " · " + ev.dates + '</small></span><span class="mi-fee"><small>from</small> $' + BB.priceFrom(ev) + "</span></button>";
  }).join("") || '<p class="muted" style="padding:16px">No events match your filters.</p>';
  var ev = BB.eventById(FE.selectedPin);
  var card = document.getElementById("map-card");
  if (!ev || list.indexOf(ev) === -1) { card.style.display = "none"; return; }
  card.style.display = "block";
  card.innerHTML = '<div class="row" style="justify-content:space-between;margin-bottom:8px"><span class="chip"><span class="event-dot" style="background:' + ev.color + '"></span>' + ev.short + '</span><a class="link-btn" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=' + ev.geo.lat + "," + ev.geo.lng + '">Open in Google Maps</a></div>' +
    "<h3>" + ev.name + "</h3>" +
    '<div class="card-meta">' + BB.icon("pin") + "<span>" + ev.venue + "</span></div>" +
    '<div class="card-stats"><div class="stat"><b><small class="from">From </small>$' + BB.priceFrom(ev) + "<small>/day</small></b><span>Booth fee</span></div></div>" +
    '<div class="card-actions"><a class="link-btn" href="event-detail.html?event=' + ev.id + '">View</a><span class="spacer"></span>' + FE.actionHtml(ev) + "</div>";
  if (FE.view === "map") { FE.drawGoogle(list, ev); }
};

FE.drawGoogle = function (list, ev) {
  var box = document.getElementById("gmap");
  if (BB_MAPS_KEY) {
    if (!window.google || !window.google.maps) {
      if (!FE.gLoading) {
        FE.gLoading = true;
        window.FE_gmapReady = function () { FE.renderMap(FE.visibleEvents()); };
        var sc = document.createElement("script");
        sc.src = "https://maps.googleapis.com/maps/api/js?key=" + encodeURIComponent(BB_MAPS_KEY) + "&callback=FE_gmapReady";
        sc.async = true; document.head.appendChild(sc);
      }
      return;
    }
    if (!FE.gmap) { FE.gmap = new google.maps.Map(box, { center: { lat: 1.3521, lng: 103.8198 }, zoom: 11, disableDefaultUI: true, zoomControl: true }); }
    FE.gmarkers.forEach(function (m) { m.setMap(null); }); FE.gmarkers = [];
    list.forEach(function (e) {
      var m = new google.maps.Marker({ position: { lat: e.geo.lat, lng: e.geo.lng }, map: FE.gmap, title: e.name, label: { text: "$" + BB.priceFrom(e) + "+", color: "#fff", fontSize: "12px", fontWeight: "600" } });
      m.addListener("click", function () { FE.selectedPin = e.id; FE.renderMap(FE.visibleEvents()); });
      FE.gmarkers.push(m);
    });
    FE.gmap.panTo({ lat: ev.geo.lat, lng: ev.geo.lng });
    return;
  }
  var src = "https://maps.google.com/maps?q=" + encodeURIComponent(ev.geo.q) + "&z=15&output=embed";
  var frame = box.querySelector("iframe");
  if (!frame) { box.innerHTML = '<iframe title="Google map" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>'; frame = box.querySelector("iframe"); }
  if (frame.getAttribute("src") !== src) { frame.setAttribute("src", src); }
};

/* ---------- Compare bar (bottom) ---------- */
FE.renderTray = function () {
  var tray = document.getElementById("tray");
  if (!FE.compare.length) { tray.hidden = true; return; }
  tray.hidden = false;
  var n = FE.compare.length, ready = n >= 2;
  var letters = FE.compare.map(function (id) {
    var ev = BB.eventById(id);
    return '<button class="cb-letter" style="background:' + ev.color + '" data-remove="' + id + '" title="Remove ' + ev.short + '">' + BB.letter(ev) + '<span class="cb-x">' + BB.icon("x", 12) + "</span></button>";
  }).join("");
  tray.innerHTML = '<div class="cb-letters">' + letters + "</div>" +
    '<div class="cb-text"><b>' + n + " event" + (n > 1 ? "s" : "") + " selected</b><small>" + (ready ? "Select up to 3 to compare" : "Pick one more to compare") + "</small></div>" +
    '<a class="cb-go' + (ready ? "" : " is-off") + '" ' + (ready ? 'href="compare.html?ids=' + FE.compare.join(",") + '"' : 'aria-disabled="true"') + ">" + BB.icon("compare", 18) + " Compare events " + BB.icon("chevRight", 18) + "</a>" +
    '<button class="cb-close" id="tray-clear" aria-label="Clear selection">' + BB.icon("x", 18) + "</button>";
};

FE.saveCompare = function () { BB.write("sessionStorage", "bb_compare", FE.compare); };

FE.toggleCompare = function (id) {
  var at = FE.compare.indexOf(id);
  if (at !== -1) { FE.compare.splice(at, 1); }
  else if (FE.compare.length >= 3) { BB.toast("You can compare up to 3 events."); return; }
  else { FE.compare.push(id); }
  FE.saveCompare();
  FE.renderGrid();
};

/* ---------- Events ---------- */
FE.wire = function () {
  document.getElementById("search-input").addEventListener("input", function (e) { FE.query = e.target.value; FE.renderGrid(); });

  /* category now lives inside Filters */
  document.getElementById("cat-chips").addEventListener("click", function (e) {
    var btn = e.target.closest(".fp-cat");
    if (!btn) { return; }
    FE.cat = btn.getAttribute("data-cat");
    FE.syncCats();
    FE.renderGrid();
  });

  document.getElementById("view-seg").addEventListener("click", function (e) {
    var btn = e.target.closest(".seg-btn");
    if (!btn) { return; }
    FE.view = btn.getAttribute("data-view");
    document.querySelectorAll("#view-seg .seg-btn").forEach(function (b) { b.classList.toggle("is-active", b === btn); });
    document.getElementById("events-grid").hidden = FE.view === "map";
    document.getElementById("map-view").hidden = FE.view === "list";
    if (FE.view === "map") { FE.renderMap(FE.visibleEvents()); }
  });

  /* filters popover */
  var pop = document.getElementById("filters-pop");
  document.getElementById("filters-btn").addEventListener("click", function (e) { e.stopPropagation(); pop.classList.toggle("is-open"); });
  pop.addEventListener("click", function (e) { e.stopPropagation(); });
  document.addEventListener("click", function () { pop.classList.remove("is-open"); });

  document.getElementById("fee-range").addEventListener("input", function (e) {
    FE.maxFee = parseInt(e.target.value, 10);
    document.getElementById("fee-label").textContent = "$" + FE.maxFee;
    FE.renderGrid();
  });
  document.getElementById("area-select").addEventListener("change", function (e) { FE.area = e.target.value; FE.renderGrid(); });
  document.getElementById("sort-select").addEventListener("change", function (e) { FE.sort = e.target.value; FE.renderGrid(); });
  document.getElementById("filters-reset").addEventListener("click", function () {
    FE.maxFee = 450; FE.area = "all"; FE.sort = "closing"; FE.cat = "all"; FE.syncCats();
    document.getElementById("fee-range").value = 450;
    document.getElementById("fee-label").textContent = "$450";
    document.getElementById("area-select").value = "all";
    document.getElementById("sort-select").value = "closing";
    FE.renderGrid();
  });

  /* Saved button in the toolbar: shows only the events you bookmarked */
  document.getElementById("saved-btn").addEventListener("click", function () {
    FE.savedOnly = !FE.savedOnly;
    FE.updateSavedBtn();
    FE.renderGrid();
  });
  FE.updateSavedBtn();

  /* clicks inside the grid, map and tray */
  document.getElementById("events-grid").addEventListener("click", function (e) {
    var save = e.target.closest("[data-save]");
    var cmp = e.target.closest("[data-compare]");
    var add = e.target.closest("[data-adddl]");
    if (save) {
      var id = parseInt(save.getAttribute("data-save"), 10);
      var at = FE.saved.indexOf(id);
      if (at === -1) { FE.saved.push(id); BB.toast("Event saved."); } else { FE.saved.splice(at, 1); }
      BB.write("localStorage", "bb_saved", FE.saved);
      FE.updateSavedBtn();
      FE.renderGrid();
    } else if (cmp) {
      FE.toggleCompare(parseInt(cmp.getAttribute("data-compare"), 10));
    } else if (add) {
      var ev = BB.eventById(parseInt(add.getAttribute("data-adddl"), 10));
      BB.addAutoDeadline({ title: FE.deadlineTitle(ev), date: ev.closes, from: "12:00", to: "23:59", eventId: ev.id, link: "find-events.html" });
      BB.toast("Added to your deadlines.");
      FE.renderGrid();
    }
  });

  /* tap anywhere on a card (not on its buttons) to open the event */
  var grid = document.getElementById("events-grid");
  grid.addEventListener("click", function (e) {
    if (e.target.closest("button, a, input, select")) { return; }
    var card = e.target.closest("[data-href]"); if (card) { window.location.href = card.getAttribute("data-href"); }
  });
  grid.addEventListener("keydown", function (e) {
    if (e.key !== "Enter" || !e.target.matches("[data-href]")) { return; }
    window.location.href = e.target.getAttribute("data-href");
  });

  document.getElementById("map-list").addEventListener("click", function (e) {
    var pin = e.target.closest("[data-pin]");
    if (!pin) { return; }
    FE.selectedPin = parseInt(pin.getAttribute("data-pin"), 10);
    FE.renderMap(FE.visibleEvents());
  });

  document.getElementById("tray").addEventListener("click", function (e) {
    var rm = e.target.closest("[data-remove]");
    if (rm) { FE.toggleCompare(parseInt(rm.getAttribute("data-remove"), 10)); return; }
    if (e.target.closest("#tray-clear")) { FE.compare = []; FE.saveCompare(); FE.renderGrid(); }
  });
};

document.addEventListener("DOMContentLoaded", function () {
  FE.wire();
  FE.renderGrid();
});
