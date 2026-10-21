/* =========================================================
   BoothBuddy shared script
   - icons, storage, theme toggle
   - builds the navbar and its popovers (calendar, bell, messages, profile)
   Every page has <div id="app-nav" data-active="find-events"></div>
   ========================================================= */

var BB = {};

/* ---------- Icons ---------- */
BB.icons = {
  calendar: '<rect x="3" y="4.5" width="18" height="16" rx="3"/><path d="M3 9.5h18M8 3v3M16 3v3"/>',
  bell: '<path d="M6 9a6 6 0 1 1 12 0c0 5 2 6.5 2 6.5H4S6 14 6 9z"/><path d="M10 19a2 2 0 0 0 4 0"/>',
  message: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>',
  menu: '<path d="M4 7h16M4 12h10M4 17h16"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
  bookmark: '<path d="M6 4h12v17l-6-4-6 4V4z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  chevDown: '<path d="M6 9l6 6 6-6"/>',
  chevLeft: '<path d="M15 6l-6 6 6 6"/>',
  chevRight: '<path d="M9 6l6 6-6 6"/>',
  map: '<path d="M9 4L3 6.5v13.5l6-2.5 6 2.5 6-2.5V4l-6 2.5L9 4z"/><path d="M9 4v13.5M15 6.5V20"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>',
  sliders: '<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',
  compare: '<rect x="3.5" y="4" width="7" height="16" rx="2"/><rect x="13.5" y="4" width="7" height="16" rx="2"/>',
  pin: '<path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17.5" cy="9" r="2.5"/><path d="M17 14.5a5 5 0 0 1 4.5 5"/>',
  logout: '<path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 8l-4 4 4 4M6 12h10"/>',
  award: '<circle cx="12" cy="9" r="5.5"/><path d="M8.5 14l-1.5 7 5-3 5 3-1.5-7"/>',
  sync: '<path d="M20 8a8 8 0 0 0-14-2.5M4 16a8 8 0 0 0 14 2.5M4 4v4h4M20 20v-4h-4"/>',
  people: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/>',
  trend: '<path d="M4 17l5-5 4 4 7-8"/><path d="M15 8h5v5"/>',
  utensils: '<path d="M7 3v7M4.5 3v4.5a2.5 2.5 0 0 0 5 0V3M7 10v11M17 21V3c-2.5 1.5-3.5 5-3.5 8.5H17"/>',
  palette: '<path d="M12 3a9 9 0 1 0 0 18c1.6 0 2.2-1.1 1.6-2.2-.6-1.2.1-2.6 1.5-2.6H17a4 4 0 0 0 4-4C21 6.6 17 3 12 3z"/><circle cx="7.5" cy="11.5" r="1"/><circle cx="10" cy="7.5" r="1"/><circle cx="15" cy="7.5" r="1"/>',
  lock: '<rect x="5" y="11" width="14" height="9" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  bolt: '<path d="M13 3L5 14h6l-1 7 8-11h-6l1-7z"/>',
  ruler: '<path d="M3 17L17 3l4 4L7 21z"/><path d="M8 12l2 2M11 9l2 2M14 6l2 2"/>',
  sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M4 7.5l8 6 8-6"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
  zoomIn: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5M11 8v6M8 11h6"/>',
  zoomOut: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5M8 11h6"/>',
  box: '<path d="M3.5 7.5L12 3l8.5 4.5v9L12 21l-8.5-4.5z"/><path d="M3.5 7.5L12 12l8.5-4.5M12 12v9"/>',
  tag: '<path d="M3 12V4h8l10 10-8 8L3 12z"/><circle cx="7.5" cy="8.5" r="1.2"/>'
};

BB.icon = function (name, size) {
  var s = size ? ' style="width:' + size + 'px;height:' + size + 'px"' : "";
  return '<svg class="icon" viewBox="0 0 24 24"' + s + '>' + (BB.icons[name] || "") + "</svg>";
};

/* ---------- Storage (falls back to memory if the browser blocks it) ---------- */
BB.memory = {};

BB.read = function (area, key, fallback) {
  try {
    var raw = window[area].getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch (e) {
    return BB.memory[key] !== undefined ? BB.memory[key] : fallback;
  }
};

BB.write = function (area, key, value) {
  BB.memory[key] = value;
  try { window[area].setItem(key, JSON.stringify(value)); } catch (e) { /* ignore */ }
};

BB.getDeadlines = function () { return BB.read("sessionStorage", "bb_deadlines", BB_DEADLINES); };
BB.saveDeadlines = function (list) { BB.write("sessionStorage", "bb_deadlines", list); };

BB.eventById = function (id) {
  for (var i = 0; i < BB_EVENTS.length; i++) { if (BB_EVENTS[i].id === id) { return BB_EVENTS[i]; } }
  return null;
};

BB.escape = function (text) {
  return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
};

/* A coloured dot plus the event name. eventId 0 = General */
BB.eventChip = function (eventId) {
  var ev = BB.eventById(eventId);
  if (!ev) { return '<span class="chip"><span class="event-dot"></span>General</span>'; }
  return '<span class="chip"><span class="event-dot" style="background:' + ev.color + '"></span>' + ev.short + "</span>";
};

BB.toast = function (message) {
  var el = document.getElementById("toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "toast";
    el.className = "toast";
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.classList.add("is-show");
  clearTimeout(BB.toastTimer);
  BB.toastTimer = setTimeout(function () { el.classList.remove("is-show"); }, 2400);
};

/* ---------- Theme ---------- */
BB.applyTheme = function (theme) {
  document.documentElement.setAttribute("data-theme", theme);
  var btn = document.getElementById("theme-btn");
  if (btn) { btn.innerHTML = BB.icon(theme === "dark" ? "sun" : "moon"); }
};

BB.initTheme = function () {
  var saved = BB.read("localStorage", "bb_theme", null);
  var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  BB.theme = saved || (prefersDark ? "dark" : "light");
  document.documentElement.setAttribute("data-theme", BB.theme);
};

BB.toggleTheme = function () {
  BB.theme = BB.theme === "dark" ? "light" : "dark";
  BB.write("localStorage", "bb_theme", BB.theme);
  BB.applyTheme(BB.theme);
};

/* ---------- Navbar ---------- */
BB.tabs = [
  { key: "find-events", label: "Find Events", href: "find-events.html" },
  { key: "my-events", label: "My Events", href: "my-events.html" },
  { key: "community", label: "Community", href: "community.html" }
];

BB.buildNav = function () {
  var host = document.getElementById("app-nav");
  if (!host) { return; }
  var active = host.getAttribute("data-active");
  var showMenu = host.getAttribute("data-rail") === "true";

  var tabsHtml = "";
  BB.tabs.forEach(function (t) {
    tabsHtml += '<a class="nav-tab' + (t.key === active ? " is-active" : "") + '" href="' + t.href + '">' + t.label + "</a>";
  });

  var menuBtn = "";

  host.innerHTML =
    '<header class="navbar glass">' +
      '<div class="nav-left">' + menuBtn +
        '<a class="nav-logo" href="find-events.html" aria-label="BoothBuddy home"><img class="logo-light" src="images/logo-white.png" alt=""><img class="logo-dark" src="images/logo-black.png" alt=""></a>' +
        '<span class="nav-brand">BoothBuddy</span>' +
      "</div>" +
      '<nav class="nav-tabs">' + tabsHtml + "</nav>" +
      '<div class="nav-right">' +
        '<div class="nav-item"><button class="icon-btn" id="btn-cal" aria-label="Deadlines">' + BB.icon("calendar") + '<span class="badge-count" id="cal-badge"></span></button><div class="popover popover-cal" id="pop-cal"></div></div>' +
        '<div class="nav-item"><button class="icon-btn" id="btn-bell" aria-label="Notifications">' + BB.icon("bell") + '<span class="badge-count" id="bell-badge"></span></button><div class="popover" id="pop-bell"></div></div>' +
        '<div class="nav-item"><button class="icon-btn" id="btn-msg" aria-label="Messages">' + BB.icon("message") + '<span class="badge-count" id="msg-badge"></span></button><div class="popover popover-msg" id="pop-msg"></div></div>' +
        '<button class="icon-btn" id="theme-btn" aria-label="Switch light or dark mode"></button>' +
        '<div class="nav-item"><button class="profile-btn" id="btn-profile"><span class="avatar">' + BB_USER.initials + '</span><span class="profile-text"><span class="profile-name">' + BB_USER.name + '</span><br><span class="profile-role">' + BB_USER.business + '</span></span></button><div class="popover popover-profile" id="pop-profile"></div></div>' +
      "</div>" +
    "</header>";

  BB.applyTheme(BB.theme);
  BB.renderCalendar();
  BB.renderBell();
  BB.renderMessages();
  BB.renderProfile();
  BB.wirePopovers();

  document.getElementById("theme-btn").addEventListener("click", BB.toggleTheme);
};

/* ---------- Popover open and close ---------- */
BB.wirePopovers = function () {
  var pairs = [["btn-cal", "pop-cal"], ["btn-bell", "pop-bell"], ["btn-msg", "pop-msg"], ["btn-profile", "pop-profile"]];

  function closeAll(exceptId) {
    pairs.forEach(function (p) {
      if (p[1] !== exceptId) { document.getElementById(p[1]).classList.remove("is-open"); }
    });
  }

  pairs.forEach(function (p) {
    document.getElementById(p[0]).addEventListener("click", function (e) {
      e.stopPropagation();
      var pop = document.getElementById(p[1]);
      closeAll(p[1]);
      if (p[1] === "pop-msg" && !pop.classList.contains("is-open")) { BB.chat = null; BB.renderMessages(); }
      pop.classList.toggle("is-open");
    });
    document.getElementById(p[1]).addEventListener("click", function (e) { e.stopPropagation(); });
  });

  document.addEventListener("click", function () { closeAll(""); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { closeAll(""); } });
};

/* ---------- Calendar popover ---------- */
BB.cal = { year: 2026, month: 9, selected: BB_TODAY, formOpen: false };

BB.pad = function (n) { return (n < 10 ? "0" : "") + n; };
BB.dateKey = function (y, m, d) { return y + "-" + BB.pad(m + 1) + "-" + BB.pad(d); };

BB.deadlinesOn = function (key) {
  return BB.getDeadlines().filter(function (d) { return d.date === key; });
};

BB.timeText = function (d) { return d.from + " to " + d.to; };

BB.dueSoonCount = function () {
  var today = new Date(BB_TODAY + "T00:00:00");
  return BB.getDeadlines().filter(function (d) {
    var diff = (new Date(d.date + "T00:00:00") - today) / 86400000;
    return diff >= 0 && diff <= 3;
  }).length;
};

BB.renderCalendar = function () {
  var pop = document.getElementById("pop-cal");
  var c = BB.cal;
  var names = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var dows = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  var first = new Date(c.year, c.month, 1).getDay();
  var daysIn = new Date(c.year, c.month + 1, 0).getDate();
  var daysPrev = new Date(c.year, c.month, 0).getDate();

  var grid = "";
  dows.forEach(function (d) { grid += '<div class="cal-dow">' + d + "</div>"; });

  for (var i = 0; i < 42; i++) {
    var dayNum = i - first + 1;
    var muted = false;
    var y = c.year, m = c.month;
    if (dayNum < 1) { dayNum = daysPrev + dayNum; m = c.month - 1; muted = true; }
    else if (dayNum > daysIn) { dayNum = dayNum - daysIn; m = c.month + 1; muted = true; }
    if (m < 0) { m = 11; y = c.year - 1; }
    if (m > 11) { m = 0; y = c.year + 1; }
    var key = BB.dateKey(y, m, dayNum);
    var items = BB.deadlinesOn(key);

    var dots = "";
    var tip = "";
    if (items.length) {
      items.slice(0, 3).forEach(function (d) {
        var ev = BB.eventById(d.eventId);
        dots += '<span style="background:' + (ev ? ev.color : "var(--muted)") + '"></span>';
      });
      tip = '<span class="cal-tip">';
      items.slice(0, 2).forEach(function (d) {
        tip += "<b>" + BB.escape(d.title) + "</b><small>" + BB.timeText(d) + "</small>";
      });
      if (items.length > 2) { tip += "<small>+" + (items.length - 2) + " more</small>"; }
      tip += "</span>";
    }

    var col = i % 7;
    var cls = "cal-day" + (muted ? " is-muted" : "") + (key === BB_TODAY ? " is-today" : "") + (key === c.selected ? " is-selected" : "") + (col <= 2 ? " cal-col-first" : "") + (col >= 4 ? " cal-col-last" : "") + (i < 14 ? " cal-row-top" : "");
    grid += '<button class="' + cls + '" data-date="' + key + '">' + dayNum + '<span class="cal-dots">' + dots + "</span>" + tip + "</button>";
  }

  var listItems = BB.deadlinesOn(c.selected);
  var listHtml = "";
  if (!listItems.length) { listHtml = '<div class="cal-empty">No deadlines on this day.</div>'; }
  listItems.forEach(function (d) {
    listHtml += '<div class="cal-item">' + BB.eventChip(d.eventId) +
      '<div><a href="' + d.link + '">' + BB.escape(d.title) + "</a><small>" + BB.timeText(d) + (d.auto ? " · Auto" : "") + "</small></div></div>";
  });

  var eventOptions = '<option value="0">General</option>';
  BB_EVENTS.forEach(function (ev) { eventOptions += '<option value="' + ev.id + '">' + ev.short + "</option>"; });

  pop.innerHTML =
    '<div class="pop-head"><div class="pop-title">' + names[c.month] + " " + c.year + "</div>" +
      '<div class="cal-nav"><button class="icon-btn" id="cal-prev" aria-label="Previous month">' + BB.icon("chevLeft", 16) + '</button><button class="icon-btn" id="cal-next" aria-label="Next month">' + BB.icon("chevRight", 16) + "</button></div></div>" +
    '<div class="cal-grid">' + grid + "</div>" +
    '<div class="cal-list">' + listHtml + "</div>" +
    '<div class="mini-form' + (c.formOpen ? " is-open" : "") + '" id="deadline-form">' +
      '<div class="form-head"><b>New deadline</b><button class="icon-btn" id="df-close" aria-label="Collapse form">' + BB.icon("x", 16) + "</button></div>" +
      '<label class="field"><span>Title</span><input class="input" id="df-title" placeholder="e.g. Submit booth fee payment"></label>' +
      '<div class="row-2"><label class="field"><span>Due date</span><input class="input" type="date" id="df-date" value="' + c.selected + '"></label>' +
      '<label class="field"><span>Event</span><select class="select" id="df-event">' + eventOptions + "</select></label></div>" +
      '<div class="row-2"><label class="field"><span>From</span><input class="input" type="time" id="df-from" value="09:00"></label>' +
      '<label class="field"><span>To</span><input class="input" type="time" id="df-to" value="18:00"></label></div>' +
      '<label class="field"><span>Link this deadline to</span><select class="select" id="df-link">' +
        '<option value="find-events.html">Find Events</option><option value="my-events.html">My Events: Booth Planner</option><option value="my-events.html">My Events: Upcoming Deadlines</option><option value="community.html">Community</option></select></label>' +
      '<button class="btn btn-primary btn-small" id="df-save" style="width:100%">Save deadline</button>' +
    "</div>" +
    '<div class="cal-foot">' +
      '<button class="btn btn-small" id="df-open">' + BB.icon(c.formOpen ? "x" : "plus", 16) + (c.formOpen ? " Hide form" : " Add deadline") + "</button>" +
      '<button class="btn btn-small" id="gcal-btn">' + BB.icon("sync", 16) + " Sync with Google Calendar</button>" +
      '<label class="switch"><input type="checkbox" id="auto-sync" checked><span class="switch-track"></span>Sync auto-created deadlines</label>' +
    "</div>";

  var badge = document.getElementById("cal-badge");
  var count = BB.dueSoonCount();
  badge.textContent = count;
  badge.style.display = count ? "grid" : "none";

  pop.querySelectorAll(".cal-day").forEach(function (btn) {
    btn.addEventListener("click", function () { BB.cal.selected = btn.getAttribute("data-date"); BB.keepOpen("pop-cal"); });
  });
  document.getElementById("cal-prev").addEventListener("click", function () { BB.shiftMonth(-1); });
  document.getElementById("cal-next").addEventListener("click", function () { BB.shiftMonth(1); });
  document.getElementById("df-open").addEventListener("click", function () { BB.cal.formOpen = !BB.cal.formOpen; BB.keepOpen("pop-cal"); });
  document.getElementById("df-close").addEventListener("click", function () { BB.cal.formOpen = false; BB.keepOpen("pop-cal"); });
  document.getElementById("df-save").addEventListener("click", BB.saveDeadlineForm);
  document.getElementById("gcal-btn").addEventListener("click", function () { BB.toast("Google Calendar sync is a demo button in this prototype."); });
};

/* re-render the calendar but keep the popover open */
BB.keepOpen = function (id) {
  BB.renderCalendar();
  document.getElementById(id).classList.add("is-open");
};

BB.shiftMonth = function (step) {
  BB.cal.month += step;
  if (BB.cal.month < 0) { BB.cal.month = 11; BB.cal.year -= 1; }
  if (BB.cal.month > 11) { BB.cal.month = 0; BB.cal.year += 1; }
  BB.keepOpen("pop-cal");
};

BB.saveDeadlineForm = function () {
  var title = document.getElementById("df-title").value.trim();
  if (!title) { BB.toast("Please add a title for the deadline."); return; }
  var list = BB.getDeadlines().slice();
  list.push({
    id: Date.now(),
    title: title,
    date: document.getElementById("df-date").value || BB.cal.selected,
    from: document.getElementById("df-from").value,
    to: document.getElementById("df-to").value,
    eventId: parseInt(document.getElementById("df-event").value, 10),
    link: document.getElementById("df-link").value,
    auto: false
  });
  BB.saveDeadlines(list);
  BB.cal.selected = list[list.length - 1].date;
  BB.cal.formOpen = false;
  BB.keepOpen("pop-cal");
  BB.toast("Deadline added.");
};

/* Used by other pages to add an automatic deadline */
BB.addAutoDeadline = function (item) {
  var list = BB.getDeadlines().slice();
  for (var i = 0; i < list.length; i++) {
    if (list[i].title === item.title) { return false; }
  }
  item.id = Date.now();
  item.auto = true;
  list.push(item);
  BB.saveDeadlines(list);
  BB.renderCalendar();
  return true;
};

/* ---------- Notifications popover ---------- */
BB.bellTab = "mine";
BB.noticeState = {
  mine: BB_NOTICES_MINE.map(function (n) { return { n: n, unread: n.unread }; }),
  community: BB_NOTICES_COMMUNITY.map(function (n) { return { n: n, unread: n.unread }; })
};

BB.unreadCount = function (tab) {
  return BB.noticeState[tab].filter(function (x) { return x.unread; }).length;
};

BB.renderBell = function () {
  var pop = document.getElementById("pop-bell");
  var list = BB.noticeState[BB.bellTab];
  var html = "";

  list.forEach(function (item) {
    var n = item.n;
    var icon = n.icon ? BB.icon(n.icon, 18) : n.initials;
    var chip = n.event !== undefined ? BB.eventChip(n.event) : "";
    var action = n.action ? '<div class="notice-actions"><a class="btn btn-dark btn-small" href="' + (n.link || "#") + '">' + n.action + "</a></div>" : "";
    html += '<div class="notice' + (item.unread ? " is-unread" : "") + '"><div class="notice-icon">' + icon + "</div>" +
      '<div class="notice-body"><div class="notice-text">' + n.text + '</div><div class="notice-meta">' + chip + "<span>" + n.time + "</span></div>" + action + "</div></div>";
  });

  pop.innerHTML =
    '<div class="pop-head"><div class="pop-title">Notifications</div><button class="pop-link" id="mark-read">Mark all as read</button></div>' +
    '<div class="tabs">' +
      '<button class="tab-btn' + (BB.bellTab === "mine" ? " is-active" : "") + '" data-tab="mine">Mine <span class="tab-count">' + BB.unreadCount("mine") + "</span></button>" +
      '<button class="tab-btn' + (BB.bellTab === "community" ? " is-active" : "") + '" data-tab="community">Community <span class="tab-count">' + BB.unreadCount("community") + "</span></button>" +
    "</div>" +
    '<div class="notice-list">' + html + "</div>";

  /* red dot for my updates, small grey dot for community only */
  var bellTotal = BB.unreadCount("mine") + BB.unreadCount("community");
  var bellBadge = document.getElementById("bell-badge");
  bellBadge.textContent = bellTotal;
  bellBadge.style.display = bellTotal ? "grid" : "none";

  pop.querySelectorAll(".tab-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      BB.bellTab = btn.getAttribute("data-tab");
      BB.renderBell();
      pop.classList.add("is-open");
    });
  });
  document.getElementById("mark-read").addEventListener("click", function () {
    BB.noticeState[BB.bellTab].forEach(function (x) { x.unread = false; });
    BB.renderBell();
    pop.classList.add("is-open");
  });
};

/* ---------- Messages popover: list of chats, tap one to open the thread ---------- */
BB.chat = null; /* the open thread: { name, initials, biz, about } */

BB.getChats = function () { return BB.read("localStorage", "bb_chats", {}); };

BB.renderMessages = function () {
  var pop = document.getElementById("pop-msg");
  if (BB.chat) { BB.renderThread(); return; }
  var html = "", unread = 0, read = BB.read("localStorage", "bb_chat_read", {}), chats = BB.getChats();
  BB_CONVOS.forEach(function (c, i) {
    var isUnread = c.unread && !read[c.name];
    if (isUnread) { unread += 1; }
    var mine = chats[c.name] || [], last = mine.length ? "You: " + mine[mine.length - 1].text : c.last;
    html += '<button class="convo" data-convo="' + i + '"><span class="avatar" style="background:linear-gradient(135deg,var(--brown),var(--accent))">' + c.initials + "</span>" +
      '<span style="flex:1;min-width:0;text-align:left"><span class="convo-name">' + c.name + "<small>" + c.time + '</small></span><span class="convo-last">' + BB.escape(last) + "</span></span>" +
      (isUnread ? '<span class="convo-unread"></span>' : "") + "</button>";
  });
  pop.innerHTML = '<div class="pop-head"><div class="pop-title">Messages</div></div>' + html;
  pop.querySelectorAll("[data-convo]").forEach(function (b) {
    b.addEventListener("click", function () { var c = BB_CONVOS[parseInt(b.getAttribute("data-convo"), 10)]; BB.openChat({ name: c.name, initials: c.initials }); });
  });
  var badge = document.getElementById("msg-badge");
  badge.textContent = unread;
  badge.style.display = unread ? "grid" : "none";
};

/* open a chat with someone straight away (used by "Message organiser" too) */
BB.openChat = function (person) {
  BB.chat = person;
  var read = BB.read("localStorage", "bb_chat_read", {}); read[person.name] = true; BB.write("localStorage", "bb_chat_read", read);
  ["pop-cal", "pop-bell", "pop-profile"].forEach(function (id) { var el = document.getElementById(id); if (el) { el.classList.remove("is-open"); } });
  BB.renderThread();
  document.getElementById("pop-msg").classList.add("is-open");
  setTimeout(function () { var input = document.getElementById("chat-input"); if (input) { input.focus(); } }, 120);
};

BB.renderThread = function () {
  var pop = document.getElementById("pop-msg"), c = BB.chat, chats = BB.getChats();
  var convo = BB_CONVOS.filter(function (x) { return x.name === c.name; })[0];
  var msgs = (convo ? [{ from: "them", text: convo.last }] : []).concat(chats[c.name] || []);
  var body = msgs.map(function (m) { return '<div class="bubble ' + (m.from === "me" ? "me" : "them") + '">' + BB.escape(m.text) + "</div>"; }).join("");
  pop.innerHTML = '<div class="chat-head"><button class="icon-btn chat-back" id="chat-back" aria-label="Back to messages">' + BB.icon("chevLeft", 18) + "</button>" +
      '<span class="avatar" style="background:linear-gradient(135deg,var(--brown),var(--accent))">' + c.initials + '</span><div class="chat-who"><b>' + c.name + "</b><small>" + (c.biz || "Seller") + "</small></div></div>" +
    (c.about ? '<div class="chat-about">' + BB.icon("users", 14) + " About: " + BB.escape(c.about) + "</div>" : "") +
    '<div class="chat-body" id="chat-body">' + (body || '<p class="chat-empty">Say hello to ' + c.name.split(" ")[0] + ".</p>") + "</div>" +
    '<form class="chat-send" id="chat-form"><input class="input" id="chat-input" placeholder="Message ' + c.name.split(" ")[0] + '" autocomplete="off"><button class="send-btn" aria-label="Send">' + BB.icon("chevRight", 18) + "</button></form>";
  var bodyEl = document.getElementById("chat-body"); bodyEl.scrollTop = bodyEl.scrollHeight;
  document.getElementById("chat-back").addEventListener("click", function () { BB.chat = null; BB.renderMessages(); });
  document.getElementById("chat-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var input = document.getElementById("chat-input"), text = input.value.trim(); if (!text) { return; }
    var all = BB.getChats(); all[c.name] = (all[c.name] || []).concat([{ from: "me", text: text }]); BB.write("localStorage", "bb_chats", all);
    BB.renderThread(); document.getElementById("chat-input").focus();
  });
};

/* ---------- Profile popover ---------- */
/* tier ring: how far Rachel is from the next tier */
/* ranks: Beginner, Expert, Verified. The ring shows progress to the next rank */
BB.RANKS = ["Beginner", "Expert", "Verified"];
BB.tierHtml = function () {
  var u = BB_USER, pct = Math.round((u.points / u.nextPoints) * 100), r = 38, circ = 2 * Math.PI * r, dash = (circ * pct / 100).toFixed(1);
  var at = BB.RANKS.indexOf(u.badge);
  var ladder = '<div class="rank-ladder">' + BB.RANKS.map(function (n, i) { return '<span class="' + (i < at ? "done" : (i === at ? "now" : "")) + '"><i>' + (i < at ? BB.icon("check", 12) : i + 1) + "</i>" + n + "</span>"; }).join("") + "</div>";
  return '<div class="tier-card">' +
    '<div class="tier-ring"><svg viewBox="0 0 100 100"><circle class="ring-bg" cx="50" cy="50" r="' + r + '"/>' +
      '<circle class="ring-fg" cx="50" cy="50" r="' + r + '" stroke-dasharray="' + dash + " " + circ.toFixed(1) + '" transform="rotate(-90 50 50)"/></svg>' +
      '<div class="tier-center"><small>Rank</small><b>' + u.badge + "</b></div></div>" +
    '<div class="tier-info"><div class="tier-pct">' + pct + '%</div><div class="tier-text">of the way to <b>' + u.nextTier + "</b></div>" +
      '<div class="tier-bar"><i style="width:' + pct + '%"></i></div>' +
      '<div class="tier-pts">' + u.points + " / " + u.nextPoints + " pts</div></div></div>" + ladder;
};

BB.renderProfile = function () {
  var pop = document.getElementById("pop-profile");
  pop.innerHTML =
    '<div class="profile-top"><span class="avatar">' + BB_USER.initials + "</span><div><div class=\"profile-name\" style=\"font-size:18px\">" + BB_USER.name + "</div>" +
      '<div class="profile-role">' + BB_USER.business + "</div>" +
      "</div></div>" +
    '<div class="follow-stats"><div><b>24</b><small>Followers</small></div><div><b>18</b><small>Following</small></div><div><b>6</b><small>Reviews</small></div></div>' +
    '<button class="menu-link" id="logout-btn">' + BB.icon("logout", 18) + " Log out</button>";
  document.getElementById("logout-btn").addEventListener("click", function () { BB.toast("Log out is a demo button in this prototype."); });
};

/* ---------- Start ---------- */
BB.initTheme();
document.addEventListener("DOMContentLoaded", BB.buildNav);

/* =========================================================
   Shared helpers for the inner pages
   ========================================================= */
BB.param = function (name) {
  var m = new RegExp("[?&]" + name + "=([^&]*)").exec(window.location.search);
  return m ? decodeURIComponent(m[1]) : "";
};

BB.daysUntil = function (dateText) {
  return Math.round((new Date(dateText + "T00:00:00") - new Date(BB_TODAY + "T00:00:00")) / 86400000);
};

BB.closingText = function (ev) {
  var d = BB.daysUntil(ev.closes);
  if (d <= 0) { return "Closes today"; }
  if (d === 1) { return "Closes tomorrow"; }
  return "Closes in " + d + " days";
};

BB.shortDate = function (key) {
  var m = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var p = key.split("-");
  return parseInt(p[2], 10) + " " + m[parseInt(p[1], 10) - 1];
};

/* application status survives page changes */
BB.applyStatusOverrides = function () {
  var map = BB.read("localStorage", "bb_status", {});
  BB_EVENTS.forEach(function (ev) { if (map[ev.id] !== undefined) { ev.status = map[ev.id]; } });
};
BB.setStatus = function (id, status) {
  var map = BB.read("localStorage", "bb_status", {});
  map[id] = status;
  BB.write("localStorage", "bb_status", map);
  BB.applyStatusOverrides();
};
BB.applyStatusOverrides();

/* document vault */
BB.getVault = function () { return BB.read("localStorage", "bb_vault", BB_VAULT_DEFAULT); };
BB.saveVault = function (list) { BB.write("localStorage", "bb_vault", list); };
BB.vaultDoc = function (id) {
  var v = BB.getVault();
  for (var i = 0; i < v.length; i++) { if (v[i].id === id) { return v[i]; } }
  return null;
};
/* returns { state: "ok" | "soon" | "expired" | "missing", text } */
BB.docState = function (id, eventDate) {
  var d = BB.vaultDoc(id);
  if (!d || !d.uploaded) { return { state: "missing", text: "Missing" }; }
  if (d.expires) {
    var left = BB.daysUntil(d.expires);
    if (left < 0) { return { state: "expired", text: "Expired " + BB.shortDate(d.expires) }; }
    if (left <= 30) { return { state: "soon", text: "Expires in " + left + " days" }; }
    return { state: "ok", text: "Valid until " + BB.shortDate(d.expires) + (d.expires.slice(0, 4) !== BB_TODAY.slice(0, 4) ? " " + d.expires.slice(0, 4) : "") };
  }
  return { state: "ok", text: "Valid" };
};
BB.docChip = function (s) {
  var cls = s.state === "ok" ? "chip-good" : (s.state === "soon" ? "chip-gold" : "chip-bad");
  var icon = s.state === "ok" ? "check" : "clock";
  return '<span class="chip ' + cls + '">' + BB.icon(icon, 14) + " " + s.text + "</span>";
};
BB.eventDocIssues = function (ev) {
  var det = BB_DETAILS[ev.id]; var n = 0;
  if (!det) { return 0; }
  det.required.forEach(function (id) { if (BB.docState(id).state !== "ok") { n += 1; } });
  return n;
};

BB.mixBar = function (ev) {
  if (!ev.mix) { return '<div class="mix-bar is-missing"></div><div class="mix-legend"><span class="muted">Not provided</span></div>'; }
  var keys = ["fnb", "workshop", "retail"].filter(function (k) { return ev.mix[k] > 0; });
  return '<div class="mix-bar">' + keys.map(function (k) { return ev.mix[k] ? '<div class="' + k + '" style="width:' + ev.mix[k] + '%"></div>' : ""; }).join("") + "</div>" +
    '<div class="mix-legend">' + keys.map(function (k) { return '<span><i class="lg-' + k + '"></i>' + BB_CATS[k].label + " " + ev.mix[k] + "%</span>"; }).join("") + "</div>";
};

/* booth types an event offers (by the categories it accepts), and their prices */
BB.boothType = function (id) { return BB_BOOTH_TYPES.filter(function (x) { return x.id === id; })[0]; };
BB.boothTypesFor = function (ev, cat) {
  return BB_BOOTH_TYPES.filter(function (t) { return ev.cats.indexOf(t.cat) !== -1 && (!cat || t.cat === cat); });
};
BB.boothPrice = function (ev, typeId) {
  var t = BB.boothType(typeId) || BB.boothType("retail-regular");
  return Math.round(ev.fee * t.mult / 5) * 5;
};
/* "From $X": the cheapest booth this event offers */
BB.priceFrom = function (ev) {
  var list = BB.boothTypesFor(ev);
  return list.length ? Math.min.apply(null, list.map(function (t) { return BB.boothPrice(ev, t.id); })) : ev.fee;
};

/* number of trading days, from "6 to 8 Nov 2026" */
BB.eventDays = function (ev) { var m = ev.dates.match(/^(\d+)\s+to\s+(\d+)/); return m ? parseInt(m[2], 10) - parseInt(m[1], 10) + 1 : 1; };

/* full price breakdown: booths x days, GST, refundable deposit, total payable */
BB.GST = 0.09; BB.DEPOSIT = 200; BB.MAX_BOOTHS = 4;
BB.quote = function (ev, typeId, qty) {
  qty = qty || 1;
  var per = BB.boothPrice(ev, typeId), days = BB.eventDays(ev);
  var sub = per * days * qty, gst = Math.round(sub * BB.GST * 100) / 100, dep = BB.DEPOSIT * qty;
  return { per: per, days: days, qty: qty, sub: sub, gst: gst, deposit: dep, total: sub + gst + dep };
};
BB.money = function (n) { return "$" + n.toLocaleString("en-SG", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 }); };

/* the application you sent for an event. Events you applied to before this feature get a filled-in one */
BB.application = function (ev) {
  var a = BB.read("localStorage", "bb_apply_" + ev.id, null);
  if (a && a.files) { if (!a.qty) { a.qty = 1; } return a; }
  if (!ev.status) { return null; }
  var cat = ev.cats.indexOf(BB_USER.category) !== -1 ? BB_USER.category : ev.cats[0];
  var files = {}; (BB_DETAILS[ev.id].required || []).forEach(function (id) { files[id] = { name: id + "-rachel.pdf", size: 240000 }; });
  var types = BB.boothTypesFor(ev, cat), regular = types.filter(function (t) { return /-regular$/.test(t.id); })[0] || types[0];
  return { category: cat, booth: regular.id, qty: 1, products: "Brownies, banana loaf, cookie boxes", agree: true, files: files, savedAt: "" };
};
/* Cancellation policy (like Invade):
   - Applied (pending curation): you can change or withdraw for free until applications close.
     Curation takes 3 to 5 working days. If you are not approved you get a full refund.
   - Accepted (booking confirmed after approval and payment): no cancellation. You can only send a
     cancellation request, which the organiser approves or not. No cash refund unless the reason is valid.
   - Not turning up forfeits the booth with no refund. */
BB.canEdit = function (ev) { return ev.status === "Applied" && BB.daysUntil(ev.closes) >= 0; };
BB.cancelReq = function (ev) { return BB.read("localStorage", "bb_cancel", {})[ev.id] || null; };

BB.POLICY = [
  { h: "Curation", i: "search", p: ["The organiser reviews applications in 3 to 5 working days.", "They look at repeated products, clashing product types and items that do not fit the event.", "If you are not approved, you get a full refund."] },
  { h: "Booth confirmation", i: "check", p: ["You get an email once your booth is approved.", "Your booking is confirmed only after approval and payment."] },
  { h: "Booth allocation", i: "map", p: ["The organiser decides the final booth location.", "Sharing a booth needs the organiser's approval. No swapping with other sellers without approval."] },
  { h: "On the day", i: "clock", p: ["If you do not turn up, you lose your booth with no refund."] },
  { h: "Cancellation and refund", i: "x", p: ["Before you are accepted, you can change or withdraw for free until applications close.", "Once your booking is confirmed, cancellation is not allowed. You can send a request, which the organiser may approve.", "No cash refund unless the organiser accepts your reason."] }
];
BB.policyHtml = function () {
  return BB.POLICY.map(function (s) { return '<div class="pol"><span class="pol-ic">' + BB.icon(s.i, 15) + "</span><div><b>" + s.h + "</b><ul>" + s.p.map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ul></div></div>"; }).join("");
};

/* request to cancel a confirmed booking (the organiser decides) */
BB.requestCancel = function (ev, done) {
  var box = document.createElement("div");
  box.className = "confirm-back";
  box.innerHTML = '<div class="confirm-box" role="dialog" aria-modal="true" style="text-align:left"><h3>Request to cancel ' + ev.short + "</h3>" +
    "<p>Your booking is confirmed, so cancellation is not guaranteed. The organiser reviews your request. There is no cash refund unless they accept your reason.</p>" +
    '<label class="field" style="margin-top:14px"><span>Reason</span><select class="select" id="cr-why"><option>Medical or family emergency</option><option>Business can no longer take part</option><option>Event details changed</option><option>Other</option></select></label>' +
    '<label class="field"><span>Tell the organiser more</span><textarea class="input" id="cr-more" rows="3" placeholder="Add anything that helps them decide"></textarea></label>' +
    '<div class="confirm-actions" style="justify-content:flex-end"><button class="btn" data-c="no">Keep booking</button><button class="btn danger-fill" data-c="yes">Send request</button></div></div>';
  document.body.appendChild(box);
  box.addEventListener("click", function (e) {
    var b = e.target.closest("[data-c]");
    if (e.target === box || (b && b.getAttribute("data-c") === "no")) { box.remove(); return; }
    if (b) {
      var all = BB.read("localStorage", "bb_cancel", {});
      all[ev.id] = { reason: box.querySelector("#cr-why").value, more: box.querySelector("#cr-more").value, date: BB_TODAY };
      BB.write("localStorage", "bb_cancel", all);
      box.remove(); BB.toast("Request sent. The organiser usually replies in 3 to 5 working days."); if (done) { done(); }
    }
  });
};

/* withdraw an application, after a confirm box */
BB.withdraw = function (ev, done) {
  var box = document.createElement("div");
  box.className = "confirm-back";
  box.innerHTML = '<div class="confirm-box" role="dialog" aria-modal="true"><span class="confirm-ic">' + BB.icon("x", 22) + "</span><h3>Withdraw from " + ev.short + "?</h3>" +
    "<p>Your application is still waiting for approval, so you can withdraw for free. Nothing is charged and your documents for this event are removed. You can apply again until " + BB.shortDate(ev.closes) + ".</p>" +
    '<div class="confirm-actions"><button class="btn" data-c="no">Keep application</button><button class="btn danger-fill" data-c="yes">Withdraw</button></div></div>';
  document.body.appendChild(box);
  box.addEventListener("click", function (e) {
    var b = e.target.closest("[data-c]");
    if (e.target === box || (b && b.getAttribute("data-c") === "no")) { box.remove(); return; }
    if (b) {
      BB.setStatus(ev.id, "");
      try { localStorage.removeItem("bb_apply_" + ev.id); } catch (err) {}
      box.remove(); BB.toast("Application withdrawn."); if (done) { done(); }
    }
  });
};

/* first letter of an event, used in avatars (rail, compare bar) */
BB.letter = function (ev) { return ev.short.charAt(0).toUpperCase(); };

BB.stars = function (n) {
  var s = "";
  for (var i = 1; i <= 5; i++) { s += '<span class="star' + (i <= n ? " on" : "") + '">&#9733;</span>'; }
  return '<span class="stars">' + s + "</span>";
};

/* event picture: the Find Events venue photo, with the illustration underneath as the fallback */
BB.bg = function (ev) { return "background-image:url('" + (ev.cardPhoto || ev.photo || ev.image) + "'),url('" + ev.image + "')"; };

BB.person = function (id) {
  for (var i = 0; i < BB_PEOPLE.length; i++) { if (BB_PEOPLE[i].id === id) { return BB_PEOPLE[i]; } }
  return BB_PEOPLE[0];
};

BB.addDeadlineOnce = function (item) {
  var list = BB.getDeadlines();
  for (var i = 0; i < list.length; i++) { if (list[i].title === item.title) { return false; } }
  item.id = Date.now() + Math.floor(Math.random() * 1000);
  list.push(item);
  BB.saveDeadlines(list);
  BB.renderCalendar();
  return true;
};

/* Liquid hover: the highlight follows the pointer (sets --mx and --my on the hovered control) */
document.addEventListener("pointermove", function (e) {
  var t = e.target.closest ? e.target.closest("button, .btn, .nav-tab, .rail-link, .link-btn, .menu-link") : null;
  if (!t) { return; }
  var r = t.getBoundingClientRect();
  t.style.setProperty("--mx", (e.clientX - r.left) + "px");
  t.style.setProperty("--my", (e.clientY - r.top) + "px");
});
