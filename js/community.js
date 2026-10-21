/* Community: seller-to-seller feed. Post types, Bulk Buy pools, Supplier SOS,
   Helpful / Used this votes, follow, badges, verified tag, report. */
var CM = { filter: "all", q: "", composeOpen: false, qty: {}, compose: { type: "supplier", sos: false, title: "", text: "", event: 0, stars: 5, image: "" }, st: BB.read("localStorage", "bb_comm", { helpful: {}, used: {}, joined: {}, following: { daniel: true, mei: true }, posts: [], reported: {} }) };

CM.save = function () { BB.write("localStorage", "bb_comm", CM.st); };
CM.all = function () { return CM.st.posts.concat(BB_POSTS); };

CM.avatar = function (p) { return '<span class="avatar" style="width:42px;height:42px;font-size:15px;background:linear-gradient(135deg,var(--brown),var(--accent))">' + p.initials + "</span>"; };

/* toolbar: search on the left, a filter button that slides the type chips open, Add post on the right */
/* Filters: the filter button opens a panel with a checkbox list (scales to any number of types).
   Ticks are a draft until "Show posts"; the chosen ones then show as removable chips under the toolbar. */
CM.filtersOpen = false;
CM.FILTERS = [["supplier", "Supplier Leads"], ["bulk", "Bulk Buys"], ["venue", "Venue Tips"], ["swap", "Leftover Swaps"], ["review", "Reviews"]];
CM.sel = [];
CM.draft = [];
CM.typeOf = function (p) { return p.type === "sos" ? "supplier" : p.type; };
CM.countFor = function (sel) { return CM.all().filter(function (p) { return !sel.length || sel.indexOf(CM.typeOf(p)) !== -1; }).length; };
CM.label = function (k) { return CM.FILTERS.filter(function (f) { return f[0] === k; })[0][1]; };

CM.panelBody = function () {
  var q = (CM.fq || "").toLowerCase();
  var rows = CM.FILTERS.filter(function (f) { return !q || f[1].toLowerCase().indexOf(q) !== -1; }).map(function (f) {
    var on = CM.draft.indexOf(f[0]) !== -1, n = CM.countFor([f[0]]), icon = BB_POST_TYPES[f[0] === "review" ? "review" : f[0]].icon;
    return '<label class="fp-row' + (on ? " is-on" : "") + '"><input type="checkbox" data-fk="' + f[0] + '"' + (on ? " checked" : "") + '><span class="fp-box">' + BB.icon("check", 13) + '</span><span class="fp-ic">' + BB.icon(icon, 16) + "</span><span class=\"fp-name\">" + f[1] + '</span><span class="fp-n">' + n + "</span></label>";
  }).join("") || '<p class="muted" style="padding:10px 4px;font-size:14.5px">No type matches.</p>';
  return rows;
};

CM.panelHtml = function () {
  var n = CM.countFor(CM.draft);
  return '<div class="filter-panel" id="filter-panel" role="dialog" aria-label="Filter posts">' +
    '<div class="fp-head"><b>Filter posts</b><button class="fp-clear" id="fp-clear">Clear</button></div>' +
    (CM.FILTERS.length > 6 ? '<input class="input fp-search" id="fp-q" placeholder="Find a type">' : "") +
    '<div class="fp-list" id="fp-list">' + CM.panelBody() + "</div>" +
    '<button class="btn btn-primary fp-apply" id="fp-apply">Show ' + n + " post" + (n === 1 ? "" : "s") + "</button></div>";
};

CM.filters = function () {
  var n = CM.sel.length;
  var chips = n ? '<div class="active-filters">' + CM.sel.map(function (k) { return '<span class="af-chip">' + CM.label(k) + '<button data-unfilter="' + k + '" aria-label="Remove ' + CM.label(k) + '">' + BB.icon("x", 13) + "</button></span>"; }).join("") +
    '<button class="af-clear" id="af-clear">Clear all</button></div>' : "";
  return '<div class="filter-row">' +
    '<label class="search glass cm-search">' + BB.icon("search", 18) + '<input id="cm-q" type="search" placeholder="Search posts or sellers" value="' + BB.escape(CM.q) + '" autocomplete="off"></label>' +
    '<div class="filter-wrap"><button class="filter-btn' + (CM.filtersOpen ? " is-open" : "") + (n ? " has-filter" : "") + '" id="filter-toggle" aria-expanded="' + CM.filtersOpen + '">' + BB.icon("sliders", 18) + "<span>Filter</span>" + (n ? '<i class="fb-count">' + n + "</i>" : "") + "</button>" +
      (CM.filtersOpen ? CM.panelHtml() : "") + "</div>" +
    '<button class="btn btn-primary add-post' + (CM.composeOpen ? " is-open" : "") + '" id="add-post">' + BB.icon("plus", 18) + "<span>" + (CM.composeOpen ? "Close" : "Add post") + "</span></button></div>" + chips;
};

CM.openFilters = function (open) {
  CM.filtersOpen = open;
  if (open) { CM.draft = CM.sel.slice(); CM.fq = ""; }
  CM.render();
};

CM.wireFilters = function () {
  document.getElementById("filter-toggle").addEventListener("click", function (e) { e.stopPropagation(); CM.openFilters(!CM.filtersOpen); });
  var panel = document.getElementById("filter-panel");
  if (panel) {
    panel.addEventListener("click", function (e) { e.stopPropagation(); });
    var refresh = function () {
      document.getElementById("fp-list").innerHTML = CM.panelBody(); wireRows();
      var n = CM.countFor(CM.draft); document.getElementById("fp-apply").textContent = "Show " + n + " post" + (n === 1 ? "" : "s");
    };
    var wireRows = function () {
      panel.querySelectorAll("[data-fk]").forEach(function (c) { c.addEventListener("change", function () {
        var k = c.getAttribute("data-fk"), i = CM.draft.indexOf(k);
        if (c.checked && i === -1) { CM.draft.push(k); } if (!c.checked && i !== -1) { CM.draft.splice(i, 1); }
        refresh();
      }); });
    };
    wireRows();
    var fq = document.getElementById("fp-q"); if (fq) { fq.addEventListener("input", function () { CM.fq = fq.value; refresh(); }); }
    document.getElementById("fp-clear").addEventListener("click", function () { CM.draft = []; refresh(); });
    document.getElementById("fp-apply").addEventListener("click", function () { CM.sel = CM.draft.slice(); CM.filtersOpen = false; CM.render(); });
  }
  document.querySelectorAll("[data-unfilter]").forEach(function (b) { b.addEventListener("click", function () { var k = b.getAttribute("data-unfilter"); CM.sel = CM.sel.filter(function (x) { return x !== k; }); CM.render(); }); });
  var ac = document.getElementById("af-clear"); if (ac) { ac.addEventListener("click", function () { CM.sel = []; CM.render(); }); }
};

/* close the panel when clicking outside or pressing Esc */
document.addEventListener("click", function () { if (CM.filtersOpen) { CM.filtersOpen = false; CM.render(); } });
document.addEventListener("keydown", function (e) { if (e.key === "Escape" && CM.filtersOpen) { CM.filtersOpen = false; CM.render(); } });

/* the event a review is about: picked automatically (the last event you were at) */
CM.reviewEvent = function () {
  var been = BB_EVENTS.filter(function (e) { return e.visited || e.status === "Accepted"; });
  return (been[0] || BB_EVENTS[0]).id;
};

/* ---------- Event picker for a post: a pop-up with photos and search, instead of a dropdown ---------- */
CM.wasThere = function (e) { return e.visited || e.status === "Accepted"; };
CM.evImg = function (e) { return '<img src="' + (e.cardPhoto || e.photo || e.image) + '" alt="" loading="lazy" onerror="this.onerror=null;this.src=\'' + e.image + '\'">'; };

/* what the button in the form shows */
CM.evFace = function (ev, isReview) {
  if (!ev) {
    return '<span class="ep-thumb ep-none">' + BB.icon(isReview ? "calendar" : "users", 18) + '</span><span class="ep-txt"><b>' + (isReview ? "Choose an event" : "General, not about one event") + "</b><small>Tap to pick an event</small></span>" +
      '<span class="ep-change">Choose ' + BB.icon("chevRight", 14) + "</span>";
  }
  return '<span class="ep-thumb">' + CM.evImg(ev) + '</span><span class="ep-txt"><b>' + ev.name + "</b><small>" + ev.dates + (CM.wasThere(ev) ? ' · <i class="ep-been">' + BB.icon("check", 12) + " You were there</i>" : "") + "</small></span>" +
    '<span class="ep-change">Change ' + BB.icon("chevRight", 14) + "</span>";
};

CM.openEventPicker = function () {
  var isReview = CM.compose.type === "review", st = { q: "", f: isReview ? "been" : "all" };
  var box = document.createElement("div");
  box.className = "confirm-back";
  var filters = [["all", "All events"], ["been", "You were there"], ["applied", "Applied"]];
  box.innerHTML = '<div class="confirm-box evp" role="dialog" aria-modal="true" aria-labelledby="evp-title">' +
    '<div class="evp-head"><div><h3 id="evp-title">' + (isReview ? "Which event are you reviewing?" : "Link an event") + "</h3><small>" + (isReview ? "Reviews help other sellers choose. Pick an event you went to." : "Optional. Linked posts show up for that event.") + "</small></div>" +
      '<button class="icon-btn" data-evp-close aria-label="Close">' + BB.icon("x", 18) + "</button></div>" +
    '<label class="evp-search">' + BB.icon("search", 18) + '<input id="evp-q" placeholder="Search events, places or dates" autocomplete="off"></label>' +
    '<div class="evp-filters">' + filters.map(function (f) { return '<button class="evp-f" data-evp-f="' + f[0] + '">' + f[1] + "</button>"; }).join("") + "</div>" +
    '<div class="evp-list" id="evp-list"></div></div>';
  document.body.appendChild(box);

  var list = function () {
    var q = st.q.toLowerCase();
    var evs = BB_EVENTS.filter(function (e) {
      if (st.f === "been" && !CM.wasThere(e)) { return false; }
      if (st.f === "applied" && !e.status) { return false; }
      return !q || (e.name + " " + e.short + " " + e.venue + " " + e.area + " " + e.dates).toLowerCase().indexOf(q) !== -1;
    });
    evs.sort(function (a, b) { return CM.wasThere(b) - CM.wasThere(a); });
    var rows = evs.map(function (e) {
      var on = CM.compose.event === e.id, badge = CM.wasThere(e) ? '<span class="evp-badge been">' + BB.icon("check", 12) + " You were there</span>" : (e.status ? '<span class="evp-badge">' + e.status + "</span>" : "");
      return '<button class="evp-row' + (on ? " is-on" : "") + '" data-evp="' + e.id + '"><span class="evp-img">' + CM.evImg(e) + "</span>" +
        '<span class="evp-txt"><b>' + e.name + "</b><small>" + BB.icon("calendar", 13) + " " + e.dates + "</small><small>" + BB.icon("pin", 13) + " " + e.venue + "</small>" + badge + "</span>" +
        '<span class="evp-tick">' + (on ? BB.icon("check", 16) : "") + "</span></button>";
    }).join("");
    var general = !isReview && !q ? '<button class="evp-row evp-general' + (!CM.compose.event ? " is-on" : "") + '" data-evp="0"><span class="evp-img ep-none">' + BB.icon("users", 22) + '</span><span class="evp-txt"><b>General</b><small>Not about one event</small></span><span class="evp-tick">' + (!CM.compose.event ? BB.icon("check", 16) : "") + "</span></button>" : "";
    var empty = '<div class="evp-empty">' + BB.icon("search", 22) + "<p>" + (q ? "No events match “" + BB.escape(st.q) + "”." : "No events here yet.") + "</p>" +
      (st.f !== "all" ? '<button class="link-btn" data-evp-f="all">Show all events</button>' : "") + "</div>";
    document.getElementById("evp-list").innerHTML = general + (rows || (general ? "" : empty));
    box.querySelectorAll(".evp-f").forEach(function (b) { b.classList.toggle("is-on", b.getAttribute("data-evp-f") === st.f); });
  };

  var close = function () { box.remove(); document.removeEventListener("keydown", esc); var b = document.getElementById("c-event-btn"); if (b) { b.focus(); } };
  var esc = function (e) { if (e.key === "Escape") { close(); } };
  document.addEventListener("keydown", esc);
  box.addEventListener("click", function (e) {
    if (e.target === box || e.target.closest("[data-evp-close]")) { close(); return; }
    var f = e.target.closest("[data-evp-f]");
    if (f) { st.f = f.getAttribute("data-evp-f"); list(); return; }
    var r = e.target.closest("[data-evp]");
    if (r) {
      CM.compose.event = parseInt(r.getAttribute("data-evp"), 10);
      var inp = document.getElementById("c-event"), btn = document.getElementById("c-event-btn");
      if (inp) { inp.value = CM.compose.event; }
      if (btn) { btn.innerHTML = CM.evFace(BB.eventById(CM.compose.event), isReview); }
      close();
    }
  });
  var input = box.querySelector("#evp-q");
  input.addEventListener("input", function () { st.q = input.value.trim(); list(); });
  list();
  input.focus();
};

CM.composeHtml = function () {
  var types = ["supplier", "bulk", "venue", "swap", "review"], c = CM.compose, isReview = c.type === "review";
  if (isReview && !c.event) { c.event = CM.reviewEvent(); }
  var stars = isReview ? '<div class="field"><span>Your rating</span><div class="star-pick" id="c-stars">' + [1, 2, 3, 4, 5].map(function (n) { return '<button type="button" class="' + (n <= c.stars ? "on" : "") + '" data-star="' + n + '" aria-label="' + n + ' stars">&#9733;</button>'; }).join("") + '<span class="muted">' + c.stars + " of 5</span></div></div>" : "";
  var img = c.image ? '<div class="c-img"><img src="' + c.image + '" alt="Attached photo"><button type="button" class="icon-btn" id="c-img-x" aria-label="Remove photo">' + BB.icon("x", 14) + "</button></div>" :
    '<label class="c-upload">' + BB.icon("plus", 16) + ' Add photo <span class="muted">(optional)</span><input type="file" id="c-img" accept="image/*" hidden></label>';
  return '<div class="compose-wrap' + (CM.composeOpen ? " is-open is-done" : "") + '" id="compose-wrap"><div class="compose-inner"><section class="compose glass"><div class="compose-title"><b>New post</b><span class="muted">Share with other sellers</span></div><div class="types">' + types.map(function (t) {
    return '<button class="fchip' + (c.type === t ? " is-active" : "") + '" data-ctype="' + t + '">' + BB.icon(BB_POST_TYPES[t].icon, 16) + BB_POST_TYPES[t].label + "</button>";
  }).join("") + "</div>" +
    '<div class="grid2"><label class="field"><span>Title</span><input class="input" id="c-title" value="' + BB.escape(c.title) + '" placeholder="' + (c.type === "bulk" ? "e.g. Icing sugar 20kg pool" : (isReview ? "e.g. Great crowd, bring small notes" : "What do you want to share?")) + '"></label>' +
    '<div class="field"><span>' + (isReview ? "Event you are reviewing" : "Event (optional)") + '</span><input type="hidden" id="c-event" value="' + (c.event || 0) + '">' +
      '<button type="button" class="ev-pick" id="c-event-btn" aria-haspopup="dialog">' + CM.evFace(BB.eventById(c.event), isReview) + "</button></div></div>" + stars +
    (c.type === "bulk" ? '<div class="grid3"><label class="field"><span>Pool size (kg)</span><input class="input" id="c-need" type="number" min="2" max="500" value="10"></label><label class="field"><span>Your share (kg)</span><input class="input" id="c-mine" type="number" min="1" value="2"></label><label class="field"><span>Pool closes</span><input class="input" id="c-closes" type="date" value="2026-10-22"></label></div>' : "") +
    '<label class="field"><span>Details</span><textarea class="input" id="c-text" rows="3" placeholder="Prices, location, delivery, anything others should know">' + BB.escape(c.text) + "</textarea></label>" + img +
    (isReview ? "" : '<label class="sos-toggle"><input type="checkbox" id="c-sos"' + (c.sos ? " checked" : "") + ' style="accent-color:var(--accent);width:18px;height:18px"> Mark as Supplier SOS (urgent, pinned to the top)</label>') +
    '<div class="compose-actions"><button class="btn" id="c-cancel">Cancel</button><button class="btn btn-primary" id="c-post">Post to community</button></div></section></div></div>';
};

/* shrink a photo before saving it in the browser */
CM.readImage = function (file, done) {
  var r = new FileReader();
  r.onload = function () {
    var im = new Image();
    im.onload = function () {
      var k = Math.min(1, 900 / Math.max(im.width, im.height)), cv = document.createElement("canvas");
      cv.width = Math.round(im.width * k); cv.height = Math.round(im.height * k);
      cv.getContext("2d").drawImage(im, 0, 0, cv.width, cv.height);
      done(cv.toDataURL("image/jpeg", 0.82));
    };
    im.src = r.result;
  };
  r.readAsDataURL(file);
};

CM.postHtml = function (p) {
  var a = BB.person(p.author), tp = BB_POST_TYPES[p.type], ev = BB.eventById(p.event);
  var joined = CM.st.joined[p.id], helpful = CM.st.helpful[p.id], used = CM.st.used[p.id];
  var h = '<article class="post glass' + (p.type === "sos" ? " is-sos" : "") + '" data-post="' + p.id + '"><div class="post-head">' + CM.avatar(a) +
    '<div class="who"><div class="who-line"><b>' + a.name + "</b>" + (a.verified ? '<span class="verified" title="Verified vendor">' + BB.icon("check") + "</span>" : "") +
      (a.badge ? '<span class="rank-chip">' + BB.icon("award", 12) + a.badge + "</span>" : "") +
      (a.id !== "rachel" ? '<button class="follow-mini' + (CM.st.following[a.id] ? " on" : "") + '" data-follow="' + a.id + '">' + (CM.st.following[a.id] ? BB.icon("check", 12) + "Following" : BB.icon("plus", 12) + "Follow") + "</button>" : "") + "</div>" +
    '<small>' + a.biz + " · " + p.time + "</small></div>" +
    '<span class="type-tag t-' + p.type + '">' + BB.icon(tp.icon, 14) + tp.label + "</span></div>" +
    '<h3>' + BB.escape(p.title) + "</h3>" + (p.text ? "<p>" + BB.escape(p.text) + "</p>" : "") +
    (p.image ? '<img class="post-img" src="' + p.image + '" alt="Photo from ' + a.name + '">' : "");
  if (p.type === "bulk") { h += CM.bulkHtml(p, a); }
  if (p.type === "review" && ev) {
    h += '<div class="rv"><div class="img" style="' + BB.bg(ev) + '"></div><div style="flex:1"><b style="font-weight:500">' + ev.name + "</b><div>" + BB.stars(p.stars) + '</div><div class="post-meta" style="margin-top:6px">' + (p.tags || []).map(function (t) { return '<span class="chip">' + t + "</span>"; }).join("") + '</div></div><a class="btn btn-small" href="event-detail.html?event=' + ev.id + '">See on event</a></div>';
  } else if (ev) { h += '<div class="post-meta"><a href="event-detail.html?event=' + ev.id + '">' + BB.eventChip(ev.id) + "</a></div>"; }
  h += '<div class="actions"><button class="abtn' + (helpful ? " on" : "") + '" data-helpful="' + p.id + '">' + BB.icon("check", 16) + " Helpful · " + (p.helpful + (helpful ? 1 : 0)) + "</button>" +
    '<button class="abtn' + (used ? " on" : "") + '" data-used="' + p.id + '">' + BB.icon("tag", 16) + " Used this · " + (p.used + (used ? 1 : 0)) + "</button>" +
    '<button class="abtn" data-reply="' + p.id + '">' + BB.icon("message", 16) + " Reply · " + p.replies + "</button>" +
    (p.type === "sos" ? '<button class="abtn" data-help="' + p.id + '">I can help</button>' : "") + '<span class="spacer"></span><button class="abtn quiet" data-report="' + p.id + '">' + (CM.st.reported[p.id] ? "Reported" : "Report") + "</button></div>" +
    '<div class="reply-box" hidden id="rb-' + p.id + '"><input class="input" placeholder="Write a reply"><button class="btn btn-small btn-primary" data-send="' + p.id + '">Send</button></div></article>';
  return h;
};

/* Bulk Buy pool: pick how many kg (1 up to what is left), join, change or leave */
CM.mine = function (id) { var j = CM.st.joined[id]; return j === true ? 2 : (j || 0); };
CM.bulkHtml = function (p, a) {
  var mine = CM.mine(p.id), have = p.have + mine, left = p.need - have, days = BB.daysUntil(p.closes), own = a.id === "rachel";
  var pct = Math.min(100, have / p.need * 100);
  var h = '<div class="bulk"><div class="row"><b style="font-weight:500">' + have + " of " + p.need + " " + p.unit + ' joined</b><span class="muted">Closes ' + BB.shortDate(p.closes) + " (" + (days <= 0 ? "today" : days + " days") + ')</span></div><div class="bar"><i style="width:' + pct + '%"></i></div><div class="row">';
  if (own) {
    return h + '<span class="muted">' + (left > 0 ? left + " " + p.unit + " still needed" : "Pool is full") + '</span><span class="own-tag">' + BB.icon("users", 15) + " You organise this pool · your share " + p.have + " " + p.unit + "</span></div></div>";
  }
  var max = mine ? left + mine : left;
  var q = CM.qty[p.id] || mine || 1; q = Math.max(1, Math.min(max, q)); CM.qty[p.id] = q;
  var msg = '<button class="abtn" data-msg="' + p.id + '">' + BB.icon("message", 16) + " Message organiser</button>";
  if (!mine && left <= 0) { return h + '<span class="muted">Pool is full</span><span class="row">' + msg + "</span></div></div>"; }
  var stepper = '<span class="stepper"><button data-qty="' + p.id + '" data-d="-1" aria-label="Less"' + (q <= 1 ? " disabled" : "") + ">" + BB.icon("minus", 16) + '</button><b>' + q + " " + p.unit + '</b><button data-qty="' + p.id + '" data-d="1" aria-label="More"' + (q >= max ? " disabled" : "") + ">" + BB.icon("plus", 16) + "</button></span>";
  h += '<span class="muted">' + (left > 0 ? left + " " + p.unit + " still needed · max " + max + " " + p.unit + " for you" : "Pool is full · you have " + mine + " " + p.unit) + '</span><span class="row bulk-actions">' + msg + stepper;
  if (!mine) { h += '<button class="abtn on" data-join="' + p.id + '">Join pool</button>'; }
  else if (q !== mine) { h += '<button class="abtn on" data-join="' + p.id + '">Update to ' + q + " " + p.unit + "</button>"; }
  else { h += '<span class="joined-tag">' + BB.icon("check", 15) + " Joined " + mine + " " + p.unit + '</span><button class="abtn quiet" data-leave="' + p.id + '">Leave</button>'; }
  return h + "</span></div></div>";
};

CM.peopleHtml = function (people) {
  if (!people.length) { return ""; }
  return '<div class="panel glass people-hits"><div class="section-title" style="font-size:17px"><span>Sellers</span></div>' + people.map(function (u) {
    return '<div class="person">' + CM.avatar(u) + '<div class="who">' + u.name + (u.verified ? '<span class="verified">' + BB.icon("check") + "</span>" : "") + "<small>" + u.biz + " · " + (u.badge || "Beginner") + '</small></div><button class="abtn" data-follow="' + u.id + '">' + (CM.st.following[u.id] ? "Following" : "Follow") + "</button></div>";
  }).join("") + "</div>";
};

CM.side = function () {
  var following = BB_PEOPLE.filter(function (p) { return p.id !== "rachel" && CM.st.following[p.id]; });
  var suggest = BB_PEOPLE.filter(function (p) { return p.id !== "rachel" && !CM.st.following[p.id]; });
  var row = function (p, on) { return '<div class="person">' + CM.avatar(p) + '<div class="who">' + p.name + (p.verified ? '<span class="verified">' + BB.icon("check") + "</span>" : "") + "<small>" + p.biz + '</small></div><button class="abtn" data-follow="' + p.id + '">' + (on ? "Following" : "Follow") + "</button></div>"; };
  return '<div class="panel glass"><div class="section-title">Your community</div><div class="stat3"><div><b>' + (24) + "</b><small>Followers</small></div><div><b>" + (16 + following.length) + "</b><small>Following</small></div><div><b>6</b><small>Reviews</small></div></div></div>" +
    '<div class="panel glass"><div class="section-title">Following</div>' + (following.map(function (p) { return row(p, true); }).join("") || '<p class="muted">Follow sellers to see them here.</p>') + "</div>" +
    (suggest.length ? '<div class="panel glass"><div class="section-title">People to follow</div>' + suggest.map(function (p) { return row(p, false); }).join("") + "</div>" : "") +
    '<div class="panel glass"><div class="section-title">How trust works</div><ul class="how" style="padding-left:18px;margin:0"><li><b>Beginner</b>: new to BoothBuddy, fewer than 3 events.</li><li><b>Expert</b>: 5 or more events and helpful tips other sellers use.</li><li><b>Verified</b>: business registration checked by BoothBuddy.</li><li><b>Helpful votes</b> from other sellers move you up a rank.</li></ul></div>';
};

CM.render = function () {
  var q = CM.q.trim().toLowerCase();
  var list = CM.all().filter(function (p) {
    if (CM.sel.length && CM.sel.indexOf(CM.typeOf(p)) === -1) { return false; }
    if (!q) { return true; }
    var a = BB.person(p.author), ev = BB.eventById(p.event);
    return (p.title + " " + (p.text || "") + " " + a.name + " " + a.biz + " " + (ev ? ev.name : "")).toLowerCase().indexOf(q) !== -1;
  });
  var people = q ? BB_PEOPLE.filter(function (u) { return u.id !== "rachel" && (u.name + " " + u.biz).toLowerCase().indexOf(q) !== -1; }) : [];
  list.sort(function (a, b) { return (b.type === "sos") - (a.type === "sos"); });
  document.getElementById("root").innerHTML = '<div class="cm-top"><div><h1 class="page-title">Community</h1><p class="page-sub">Sellers helping sellers. Find suppliers, pool orders, share venue tips.</p></div></div>' +
    '<div class="cm-layout"><div>' + CM.filters() + CM.composeHtml() + CM.peopleHtml(people) + (q ? '<p class="muted cm-results">' + list.length + " post" + (list.length === 1 ? "" : "s") + ' for "' + BB.escape(CM.q) + '"</p>' : "") + (list.map(CM.postHtml).join("") || '<div class="panel glass muted">' + (q ? "No posts match your search." : "No posts of this type yet.") + "</div>") + '</div><aside class="side">' + CM.side() + "</aside></div>";
  CM.wire();
};

CM.wire = function () {
  var q = function (sel, fn) { document.querySelectorAll(sel).forEach(fn); };
  CM.wireFilters();
  q("[data-ctype]", function (b) { b.addEventListener("click", function () {
    var t = b.getAttribute("data-ctype");
    if (t === "review" && CM.compose.type !== "review") { CM.compose.event = CM.reviewEvent(); }
    CM.compose.type = t; CM.render();
  }); });
  /* keep what you typed when the form re-draws */
  var keep = function (id, key, num) { var el = document.getElementById(id); if (el) { el.addEventListener(el.tagName === "SELECT" ? "change" : "input", function () { CM.compose[key] = num ? parseInt(el.value, 10) : el.value; }); } };
  keep("c-title", "title"); keep("c-text", "text"); keep("c-event", "event", true);
  var evBtn = document.getElementById("c-event-btn"); if (evBtn) { evBtn.addEventListener("click", CM.openEventPicker); }
  q("[data-star]", function (b) { b.addEventListener("click", function () { CM.compose.stars = parseInt(b.getAttribute("data-star"), 10); CM.render(); }); });
  var file = document.getElementById("c-img");
  if (file) { file.addEventListener("change", function () { if (file.files[0]) { CM.readImage(file.files[0], function (url) { CM.compose.image = url; CM.render(); }); } }); }
  var imgX = document.getElementById("c-img-x"); if (imgX) { imgX.addEventListener("click", function () { CM.compose.image = ""; CM.render(); }); }
  var search = document.getElementById("cm-q");
  if (search) { search.addEventListener("input", function () { CM.q = search.value; var pos = search.selectionStart; CM.render(); var s2 = document.getElementById("cm-q"); s2.focus(); s2.setSelectionRange(pos, pos); }); }
  q("[data-follow]", function (b) { b.addEventListener("click", function () { var id = b.getAttribute("data-follow"); CM.st.following[id] = !CM.st.following[id]; CM.save(); CM.render(); }); });
  q("[data-helpful]", function (b) { b.addEventListener("click", function () { var id = b.getAttribute("data-helpful"); CM.st.helpful[id] = !CM.st.helpful[id]; CM.save(); CM.render(); }); });
  q("[data-used]", function (b) { b.addEventListener("click", function () { var id = b.getAttribute("data-used"); CM.st.used[id] = !CM.st.used[id]; CM.save(); CM.render(); }); });
  q("[data-qty]", function (b) { b.addEventListener("click", function () {
    var id = b.getAttribute("data-qty"); CM.qty[id] = (CM.qty[id] || 1) + parseInt(b.getAttribute("data-d"), 10); CM.render();
  }); });
  q("[data-join]", function (b) { b.addEventListener("click", function () {
    var id = parseInt(b.getAttribute("data-join"), 10), p = CM.all().filter(function (x) { return x.id === id; })[0];
    var first = !CM.mine(id);
    CM.st.joined[id] = CM.qty[id] || 1; CM.save();
    if (first) { BB.addAutoDeadline({ title: "Bulk Buy closes: " + p.title, date: p.closes, from: "18:00", to: "20:00", eventId: 0, link: "community.html" }); BB.toast("Joined with " + CM.st.joined[id] + " kg. Added the closing date to your deadlines."); }
    else { BB.toast("Updated to " + CM.st.joined[id] + " kg."); }
    CM.render();
  }); });
  q("[data-leave]", function (b) { b.addEventListener("click", function () { var id = b.getAttribute("data-leave"); delete CM.st.joined[id]; CM.qty[id] = 1; CM.save(); BB.toast("You left the pool."); CM.render(); }); });
  q("[data-msg]", function (b) { b.addEventListener("click", function (e) {
    e.stopPropagation();
    var id = parseInt(b.getAttribute("data-msg"), 10), p = CM.all().filter(function (x) { return x.id === id; })[0], a = BB.person(p.author);
    BB.openChat({ name: a.name, initials: a.initials, biz: a.biz, about: p.title });
  }); });
  var addBtn = document.getElementById("add-post");
  if (addBtn) { addBtn.addEventListener("click", function () { CM.toggleCompose(!CM.composeOpen); }); }
  var cancel = document.getElementById("c-cancel"); if (cancel) { cancel.addEventListener("click", function () { CM.toggleCompose(false); }); }
  q("[data-reply]", function (b) { b.addEventListener("click", function () { var r = document.getElementById("rb-" + b.getAttribute("data-reply")); r.hidden = !r.hidden; }); });
  q("[data-send]", function (b) { b.addEventListener("click", function () { BB.toast("Reply sent (demo)."); document.getElementById("rb-" + b.getAttribute("data-send")).hidden = true; }); });
  q("[data-help]", function (b) { b.addEventListener("click", function () { BB.toast("Mei has been told you can help."); }); });
  q("[data-report]", function (b) { b.addEventListener("click", function () { var id = b.getAttribute("data-report"); CM.st.reported[id] = true; CM.save(); BB.toast("Thanks. The moderators will take a look."); CM.render(); }); });
  var sos = document.getElementById("c-sos"); if (sos) { sos.addEventListener("change", function () { CM.compose.sos = sos.checked; }); }
  var post = document.getElementById("c-post");
  if (post) { post.addEventListener("click", function () {
    var title = document.getElementById("c-title").value.trim();
    if (!title) { BB.toast("Add a title first."); return; }
    var type = CM.compose.sos ? "sos" : CM.compose.type;
    var np = { id: Date.now(), type: type, author: "rachel", time: "Just now", title: title, text: document.getElementById("c-text").value.trim(), event: parseInt(document.getElementById("c-event").value, 10), helpful: 0, used: 0, replies: 0, image: CM.compose.image || "" };
    if (type === "bulk") { np.unit = "kg"; np.need = Math.max(2, Math.min(500, parseInt(document.getElementById("c-need").value, 10) || 10)); np.have = Math.max(1, Math.min(np.need - 1, parseInt(document.getElementById("c-mine").value, 10) || 1)); np.closes = document.getElementById("c-closes").value || "2026-10-22"; }
    if (type === "review") { np.stars = CM.compose.stars; np.tags = []; }
    CM.st.posts.unshift(np);
    try { CM.save(); } catch (err) { np.image = ""; CM.save(); }
    CM.compose = { type: CM.compose.type, sos: false, title: "", text: "", event: 0, stars: 5, image: "" };
    CM.composeOpen = false; BB.toast("Posted."); CM.render();
  }); }
};

/* open or close the form with an animation, without rebuilding the page */
CM.toggleCompose = function (open) {
  CM.composeOpen = open;
  var wrap = document.getElementById("compose-wrap"), btn = document.getElementById("add-post");
  wrap.classList.remove("is-done");
  wrap.classList.toggle("is-open", open);
  if (open) { setTimeout(function () { if (CM.composeOpen) { wrap.classList.add("is-done"); } }, 480); }
  btn.classList.toggle("is-open", open);
  btn.querySelector("span").textContent = open ? "Close" : "Add post";
  if (open) { setTimeout(function () { var t = document.getElementById("c-title"); if (t) { t.focus({ preventScroll: true }); } }, 300); }
};

document.addEventListener("DOMContentLoaded", function () { CM.q = BB.param("q") || ""; CM.render(); });
