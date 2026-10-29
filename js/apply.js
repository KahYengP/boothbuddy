/* Apply Events: one page.
   1. Your booth: category, booth type, number of booths, what you sell
      (the category decides which documents are needed, so it comes first)
   2. Upload each required document for that category (just the file, no expiry dates)
   3. Things to note, then confirm and submit
   Contact organiser (email) sits on the payment card
   Your booth shows the chosen booth's 2D plan beside the fields. Right side: the payment breakdown only.
   Save draft keeps everything in the browser.
   If you already applied, the same page opens in edit mode until applications close. */
var AP = { ev: null, det: null, submitted: false, form: null, edit: false };

AP.blank = function () { return { category: "", booth: "", qty: 1, together: true, products: "", agree: false, files: {}, savedAt: "" }; };
AP.key = function () { return "bb_apply_" + AP.ev.id; };

AP.type = function () { return BB.boothType(AP.form.booth); };
AP.q = function () { return BB.quote(AP.ev, AP.type() ? AP.form.booth : BB.boothTypesFor(AP.ev, AP.form.category)[0].id, AP.form.qty); };
/* the documents for the chosen booth category (no food licences for retail or workshop) */
AP.docs = function () { return BB.docsFor(AP.ev, AP.form.category); };
AP.uploaded = function () { return AP.docs().filter(function (id) { return AP.form.files[id]; }).length; };
AP.missing = function () { return AP.docs().length - AP.uploaded(); };
AP.ready = function () { return !AP.missing() && AP.type() && AP.form.agree && !AP.locked(); };
AP.locked = function () { return AP.edit && !BB.canEdit(AP.ev); };
AP.size = function (n) { return n > 1048576 ? (n / 1048576).toFixed(1) + " MB" : Math.max(1, Math.round(n / 1024)) + " KB"; };

/* ---------- 2. Documents: one upload per document this booth category needs ---------- */
AP.docPanel = function () {
  var docs = AP.docs(), n = AP.uploaded(), total = docs.length, lock = AP.locked();
  var skipped = AP.det.required.filter(function (id) { return docs.indexOf(id) === -1; }).map(function (id) { return BB_DOC_NAMES[id]; }), cat = BB_CATS[AP.form.category];
  var rows = docs.map(function (id) {
    var f = AP.form.files[id];
    if (f) {
      return '<div class="up-row is-done"><span class="up-ic">' + BB.icon("check", 18) + '</span><div class="up-txt"><b>' + BB_DOC_NAMES[id] + "</b><small>" + BB.escape(f.name) + " · " + AP.size(f.size) + "</small></div>" +
        (lock ? "" : '<label class="btn btn-small">Replace<input type="file" data-file="' + id + '" accept=".pdf,.jpg,.jpeg,.png" hidden></label>' +
        '<button class="icon-btn up-x" data-unfile="' + id + '" aria-label="Remove file">' + BB.icon("trash", 16) + "</button>") + "</div>";
    }
    return '<label class="up-row up-drop" data-drop="' + id + '"><span class="up-ic">' + BB.icon("file", 18) + '</span><div class="up-txt"><b>' + BB_DOC_NAMES[id] + "</b><small>PDF, JPG or PNG · drop a file here or browse</small></div>" +
      '<span class="btn btn-small btn-primary">' + BB.icon("upload", 15) + ' Upload</span><input type="file" data-file="' + id + '" accept=".pdf,.jpg,.jpeg,.png" hidden></label>';
  }).join("");
  return '<div class="panel glass ap-docs"><div class="section-title"><span>Upload documents</span><span class="chip' + (n === total ? " chip-good" : "") + '">' + n + " of " + total + " uploaded</span></div>" +
    '<div class="up-bar"><i style="width:' + (total ? n / total * 100 : 100) + '%"></i></div>' +
    (skipped.length && cat ? '<p class="muted up-note">' + BB.icon("check", 14) + " " + cat.label + " booths do not need the " + skipped.join(" or ") + ".</p>" : "") + rows + "</div>";
};

/* ---------- Things to note (organiser rules and cancellation policy) ---------- */
AP.notePanel = function () {
  return '<details class="panel glass note-panel" style="margin-top:20px"' + (AP.edit ? "" : " open") + '><summary class="section-title"><span>Things to note</span><span class="chip">' + BB.icon("bulb", 13) + " Read before you submit</span></summary>" +
    '<p class="muted note-lead">' + BB.icon("sparkle", 14) + " Sellers are encouraged to decorate their booth.</p>" + BB.policyHtml() + "</details>";
};

/* ---------- 1. Your booth (first, because the category decides the documents) ---------- */
AP.boothPanel = function () {
  var ev = AP.ev, types = BB.boothTypesFor(ev, AP.form.category), lock = AP.locked() ? " disabled" : "";
  var cats = ev.cats.map(function (c) { return '<option value="' + c + '"' + (AP.form.category === c ? " selected" : "") + ">" + BB_CATS[c].label + "</option>"; }).join("");
  var opts = '<option value="">Choose a booth type</option>' + types.map(function (t) { return '<option value="' + t.id + '"' + (AP.form.booth === t.id ? " selected" : "") + ">" + t.label + " · " + t.w + "m x " + t.d + "m · $" + BB.boothPrice(ev, t.id) + "/day</option>"; }).join("");
  var qty = '<div class="field"><span>Number of booths</span><div class="qty"><button type="button" data-qty="-1"' + (AP.form.qty <= 1 || lock ? " disabled" : "") + ' aria-label="Fewer booths">' + BB.icon("minus", 16) + "</button><b>" + AP.form.qty + '</b><button type="button" data-qty="1"' + (AP.form.qty >= BB.MAX_BOOTHS || lock ? " disabled" : "") + ' aria-label="More booths">' + BB.icon("plus", 16) + "</button></div><small class=\"muted\">Up to " + BB.MAX_BOOTHS + " per seller</small></div>";
  return '<div class="panel glass ap-first"><div class="section-title">Your booth</div><div class="ab-grid"><div class="ab-fields">' +
    '<div class="form-grid3"><label class="field"><span>Booth category</span><select class="select" id="f-cat"' + lock + ">" + cats + "</select></label>" +
    '<label class="field"><span>Booth type</span><select class="select" id="f-booth"' + lock + ">" + opts + "</select></label>" + qty + "</div>" +
    AP.needsHtml() +
    AP.placeHtml(lock) +
    '<label class="field" style="margin-bottom:0"><span>What will you sell? Add prices if you can.</span><textarea class="input" id="f-prod" rows="3"' + lock + ' placeholder="e.g. Brownies $4, banana loaf $9, cookie boxes $12">' + BB.escape(AP.form.products) + "</textarea></label></div>" + AP.boothPlan() + "</div></div>";
};

/* "You'll need": the documents for the chosen category, so sellers know what to prepare before they reach the upload */
AP.needsHtml = function () {
  var docs = AP.docs(), cat = BB_CATS[AP.form.category], names = docs.map(function (id) { return BB_DOC_NAMES[id]; });
  if (!docs.length || !cat) { return ""; }
  var list = names.length > 1 ? names.slice(0, -1).join(", ") + " and " + names[names.length - 1] : names[0];
  return '<p class="ap-needs">' + BB.icon("file", 15) + "<span>For " + (/^([AEIOU]|F&)/.test(cat.label) ? "an " : "a ") + cat.label + " booth you will need " + docs.length + " document" + (docs.length > 1 ? "s" : "") + ": " + list + ". You upload them below.</span></p>";
};

/* How more than one booth is placed. Only shown once there are 2 or more booths. */
AP.placeHtml = function (lock) {
  var n = AP.form.qty, off = lock ? " disabled" : "", t = AP.type();
  if (n < 2) { return ""; }
  var joined = t ? t.w * n + "m x " + t.d + "m " : "";
  return '<div class="place"><span class="place-lbl">How should your ' + n + " booths be placed?</span>" +
    '<div class="place-opts">' +
      '<button type="button" class="place-opt' + (AP.form.together ? " is-on" : "") + '" data-together="1"' + off + '><span class="po-ic">' + BB.icon("booth", 18) + "</span><span><b>Side by side</b><small>Joined into one " + joined + "space, panels between them removed</small></span></button>" +
      '<button type="button" class="place-opt' + (AP.form.together ? "" : " is-on") + '" data-together="0"' + off + '><span class="po-ic">' + BB.icon("map", 18) + "</span><span><b>Separate spots</b><small>Fine to be apart, the organiser places each one where there is room</small></span></button></div>" +
    '<p class="place-note">' + BB.icon("clock", 13) + (AP.form.together ? " The organiser will keep them together. If the row is full, they will message you before placing them apart." : " You may get different booth numbers, even in different rows.") + "</p></div>";
};

/* ---------- 3. Confirm and submit (after Things to note) ---------- */
AP.submitPanel = function () {
  var ev = AP.ev, lock = AP.locked() ? " disabled" : "";
  var why = AP.locked() ? (ev.status === "Accepted" ? "Your booking is confirmed, so it can no longer be changed. To cancel, send a request from My Events." : "Applications closed on " + BB.shortDate(ev.closes) + ". Message the organiser to make changes.") :
    (AP.missing() ? "Upload " + AP.missing() + " more document" + (AP.missing() > 1 ? "s" : "") + " to " + (AP.edit ? "save." : "submit.") : (!AP.type() ? "Choose a booth type." : (!AP.form.agree ? "Tick the confirmation." : "You pay after the organiser accepts you.")));
  return '<div class="panel glass submit-panel" style="margin-top:20px">' +
    '<label class="agree"><input type="checkbox" id="f-agree"' + (AP.form.agree ? " checked" : "") + lock + "><span>I confirm my documents are accurate and I agree to the things to note above, including the cancellation policy.</span></label>" +
    '<div class="pay-actions">' + (AP.edit ? "" : '<button class="btn" id="save-draft">' + BB.icon("file", 16) + " Save draft</button>") +
      '<button class="btn btn-primary" id="submit"' + (AP.ready() ? "" : " disabled") + ">" + (AP.edit ? "Save changes" : "Submit application") + "</button></div>" +
    '<div class="nav-row"><span class="muted ap-why">' + why + '</span><span class="muted draft-note">' + (AP.form.savedAt && !AP.edit ? BB.icon("check", 14) + " Draft saved " + AP.form.savedAt : "") + "</span></div>" +
    (AP.edit && !AP.locked() ? '<div class="withdraw"><div><b>Withdraw application</b><small>You can withdraw until applications close on ' + BB.shortDate(ev.closes) + ". Nothing is charged.</small></div><button class=\"btn btn-small danger\" id=\"withdraw\">Withdraw</button></div>" : "") + "</div>";
};

/* ---------- Contact organiser (email) ---------- */
AP.contact = function () {
  var ev = AP.ev, det = AP.det, email = det.email || "";
  var box = document.createElement("div");
  box.className = "confirm-back";
  box.innerHTML = '<div class="confirm-box contact-box" role="dialog" aria-modal="true" aria-labelledby="ct-title">' +
    '<div class="ct-head"><span class="ct-ic">' + BB.icon("mail", 20) + '</span><div><h3 id="ct-title">Contact organiser</h3><small>' + BB.escape(det.organiser) + "</small></div>" +
    '<button class="icon-btn ct-x" data-c="no" aria-label="Close">' + BB.icon("x", 18) + "</button></div>" +
    '<div class="ct-to"><span>To</span><b>' + email + '</b><button class="btn btn-small" id="ct-copy">' + BB.icon("copy", 14) + " Copy</button></div>" +
    '<label class="field"><span>Subject</span><input class="input" id="ct-sub" value="Question about ' + BB.escape(ev.name) + '"></label>' +
    '<label class="field"><span>Message</span><textarea class="input" id="ct-msg" rows="4" placeholder="e.g. Can I bring my own table, or is one provided?"></textarea></label>' +
    '<p class="ct-note">' + BB.icon("clock", 14) + " The organiser usually replies within a day on weekdays.</p>" +
    '<div class="confirm-actions" style="justify-content:flex-end"><button class="btn" data-c="no">Cancel</button><button class="btn btn-primary" id="ct-send">' + BB.icon("mail", 16) + " Open in email app</button></div></div>";
  document.body.appendChild(box);
  var close = function () { box.remove(); document.removeEventListener("keydown", esc); };
  var esc = function (e) { if (e.key === "Escape") { close(); } };
  document.addEventListener("keydown", esc);
  box.addEventListener("click", function (e) { var b = e.target.closest("[data-c]"); if (e.target === box || b) { close(); } });
  box.querySelector("#ct-copy").addEventListener("click", function () {
    try { navigator.clipboard.writeText(email); } catch (err) {}
    BB.toast("Email address copied.");
  });
  box.querySelector("#ct-send").addEventListener("click", function () {
    var sub = box.querySelector("#ct-sub").value, msg = box.querySelector("#ct-msg").value;
    window.location.href = "mailto:" + email + "?subject=" + encodeURIComponent(sub) + "&body=" + encodeURIComponent(msg);
    close(); BB.toast("Opening your email app.");
  });
  box.querySelector("#ct-msg").focus();
};

/* ---------- Right side ---------- */
AP.payCard = function () {
  var ev = AP.ev, t = AP.type(), q = AP.q();
  var line = function (a, b, cls) { return '<div class="pay-line ' + (cls || "") + '"><span>' + a + "</span><b>" + b + "</b></div>"; };
  var head = '<div class="sum-card glass pay-card"><div class="pay-ev"><div class="img" style="' + BB.bg(ev) + '"></div><div><h3>' + ev.name + "</h3><small>" + ev.dates + " · " + ev.venue + "</small></div></div>" +
    '<button class="contact-btn" id="contact-org">' + BB.icon("mail", 16) + "<span>Contact organiser<small>" + BB.escape(AP.det.organiser) + "</small></span>" + BB.icon("chevRight", 16) + "</button>";
  if (!t) {
    return head + '<div class="pay-empty">' + BB.icon("booth", 20) + "<span>Choose a booth type to see your total.<small>Booths here start from " + BB.money(BB.priceFrom(ev)) + " a day.</small></span></div></div>";
  }
  return head +
    '<div class="pay-item"><div><b>' + t.label + "</b><small>" + t.w + "m x " + t.d + "m · " + BB.money(q.per) + "/day × " + q.days + " days × " + q.qty + " booth" + (q.qty > 1 ? "s" : "") + "</small></div><b>" + BB.money(q.sub) + "</b></div>" +
    line("Subtotal", BB.money(q.sub)) + line("GST (9%)", BB.money(q.gst)) + line("Security deposit <small>refundable, $" + BB.DEPOSIT + " per booth</small>", BB.money(q.deposit)) +
    '<div class="pay-total"><span>Total payable</span><b>' + BB.money(q.total) + "</b></div>" +
    '<p class="pay-note">' + BB.icon("clock", 14) + " Pay after you are accepted. Applications close " + BB.shortDate(ev.closes) + ".</p></div>";
};

AP.boothPlan = function () {
  var t = AP.type();
  if (!t) { return '<div class="ab-plan is-empty">' + BB.icon("booth", 26) + "<p>Pick a booth type to see its floor plan.</p></div>"; }
  var n = AP.form.qty, apart = n > 1 && !AP.form.together, plan;
  if (t && apart) {
    plan = '<div class="bx-sep">' + Array.apply(null, Array(n)).map(function (x, i) { return '<div class="bx-sep-one"><small>Booth ' + (i + 1) + "</small>" + BB.boothPlanSvg(t, 1) + "</div>"; }).join("") + "</div>" +
      '<p class="sep-note">' + BB.icon("map", 13) + " " + n + " separate booths. The organiser picks each spot.</p>";
  } else if (t) {
    plan = '<div class="bx-plan">' + BB.boothPlanSvg(t, n > 1 ? n : 1) + "</div>";
  }
  var size = n > 1 ? (apart ? n + " x " + t.w + "m x " + t.d + "m" : t.w * n + "m x " + t.d + "m · " + n + " joined") : t.w + "m x " + t.d + "m";
  /* a few key facts instead of the full amenities list */
  var facts = [["chair", t.chairs + " chairs"], ["table", "Table " + t.table], ["plug", t.power.length ? t.power.join(" + ") + " power" : "No power point"]];
  if (t.sink) { facts.push(["sink", "Sink and water"]); }
  if (t.open === 2) { facts.push(["corner", "Open on 2 sides"]); }
  return '<div class="ab-plan' + (apart ? " is-apart" : "") + '"><div class="ab-plan-head"><b>' + t.label + '</b><span class="chip">' + size + "</span></div>" + plan +
    '<ul class="ab-facts">' + facts.map(function (f) { return "<li>" + BB.icon(f[0], 15) + "<span>" + f[1] + "</span></li>"; }).join("") + "</ul></div>";
};

/* right side: only the payment card, short enough to always fit */
AP.summary = function () {
  return '<aside class="ap-side">' + AP.payCard() + "</aside>";
};

AP.done = function () {
  return '<div class="panel glass done ap-first"><div class="big">' + BB.icon("check") + "</div><h2>Application submitted</h2>" +
    '<p class="muted" style="font-size:17px;margin-bottom:22px">We added the result date to your deadlines. The organiser reviews it in 3 to 5 working days. Until then you can change or withdraw it for free in My Events, up to ' + BB.shortDate(AP.ev.closes) + ".</p>" +
    '<div class="row" style="justify-content:center"><a class="btn btn-primary" href="my-events.html?event=' + AP.ev.id + '">Go to My Events</a><a class="btn" href="find-events.html">Keep browsing</a></div></div>';
};

AP.render = function () {
  var body = AP.submitted ? AP.done() : AP.boothPanel() + AP.docPanel() + AP.notePanel() + AP.submitPanel();
  var title = AP.edit ? "Your application to " + AP.ev.short : "Apply to " + AP.ev.short;
  var sub = AP.edit ? (AP.locked() ? (AP.ev.status === "Accepted" ? "Your booking is confirmed, so this is read only." : "Applications are closed, so this is read only.") : "Change your booth type, number of booths or documents until " + BB.shortDate(AP.ev.closes) + ".") : "Pick your booth, upload the documents it needs, then submit. You can save a draft and come back.";
  document.getElementById("root").innerHTML = '<a class="back-link" href="' + (AP.edit ? "my-events.html?event=" + AP.ev.id : "event-detail.html?event=" + AP.ev.id) + '">' + BB.icon("chevLeft", 18) + (AP.edit ? " My events" : " Back to event") + "</a>" +
    '<h1 class="page-title">' + title + '</h1><p class="page-sub">' + sub + "</p>" +
    (AP.submitted ? '<div class="ap-done-wrap">' + body + "</div>" : '<div class="ap-layout"><div>' + body + "</div>" + AP.summary() + "</div>");
  AP.wire();
  AP.fitSide();
  document.querySelectorAll(".ap-side img").forEach(function (im) { im.addEventListener("load", AP.fitSide); });
};

/* The right column sticks while you scroll, but never deeper than the screen:
   if it is taller than the window it scrolls with the page until its bottom shows, then sticks. */
AP.fitSide = function () {
  var side = document.querySelector(".ap-side"); if (!side) { return; }
  if (window.innerWidth <= 1000) { side.style.top = ""; return; }
  side.style.top = Math.min(110, window.innerHeight - side.offsetHeight - 16) + "px";
};

AP.saveDraft = function () {
  var d = new Date(), h = d.getHours() % 12 || 12;
  AP.form.savedAt = h + ":" + ("0" + d.getMinutes()).slice(-2) + (d.getHours() < 12 ? "am" : "pm");
  BB.write("localStorage", AP.key(), AP.form);
};

AP.takeFile = function (id, file) {
  if (!file || AP.locked()) { return; }
  AP.form.files[id] = { name: file.name, size: file.size };
  BB.toast(BB_DOC_NAMES[id] + " uploaded.");
  AP.render();
};

AP.wire = function () {
  document.querySelectorAll("[data-file]").forEach(function (inp) { inp.addEventListener("change", function () { AP.takeFile(inp.getAttribute("data-file"), inp.files[0]); }); });
  document.querySelectorAll("[data-drop]").forEach(function (z) {
    z.addEventListener("dragover", function (e) { e.preventDefault(); z.classList.add("is-over"); });
    z.addEventListener("dragleave", function () { z.classList.remove("is-over"); });
    z.addEventListener("drop", function (e) { e.preventDefault(); AP.takeFile(z.getAttribute("data-drop"), e.dataTransfer.files[0]); });
  });
  document.querySelectorAll("[data-unfile]").forEach(function (b) { b.addEventListener("click", function () { delete AP.form.files[b.getAttribute("data-unfile")]; AP.render(); }); });
  document.querySelectorAll("[data-together]").forEach(function (b) { b.addEventListener("click", function () {
    AP.form.together = b.getAttribute("data-together") === "1"; AP.render();
  }); });
  document.querySelectorAll("[data-qty]").forEach(function (b) { b.addEventListener("click", function () { AP.form.qty = Math.max(1, Math.min(BB.MAX_BOOTHS, AP.form.qty + parseInt(b.getAttribute("data-qty"), 10))); AP.render(); }); });
  var cat = document.getElementById("f-cat"), booth = document.getElementById("f-booth"), prod = document.getElementById("f-prod"), agree = document.getElementById("f-agree");
  if (cat) { cat.addEventListener("change", function () { AP.form.category = cat.value; if (AP.type() && AP.type().cat !== cat.value) { AP.form.booth = ""; } AP.render(); }); }
  if (booth) { booth.addEventListener("change", function () { AP.form.booth = booth.value; AP.render(); }); }
  if (prod) { prod.addEventListener("input", function () { AP.form.products = prod.value; }); }
  if (agree) { agree.addEventListener("change", function () { AP.form.agree = agree.checked; AP.render(); }); }
  var save = document.getElementById("save-draft");
  if (save) { save.addEventListener("click", function () { AP.saveDraft(); BB.toast("Draft saved. Come back any time to finish."); AP.render(); }); }
  var sub = document.getElementById("submit");
  if (sub) { sub.addEventListener("click", function () {
    AP.form.savedAt = ""; BB.write("localStorage", AP.key(), AP.form);
    if (AP.edit) { BB.toast("Changes saved. The organiser can see your update."); setTimeout(function () { window.location.href = "my-events.html?event=" + AP.ev.id; }, 700); return; }
    BB.setStatus(AP.ev.id, "Applied");
    BB.addAutoDeadline({ title: AP.ev.short + " result expected", date: "2026-10-24", from: "10:00", to: "12:00", eventId: AP.ev.id, link: "my-events.html" });
    if (window.STUDY && STUDY.finish(AP.ev, AP.form)) { return; }
    AP.submitted = true; AP.render(); window.scrollTo(0, 0);
  }); }
  var ct = document.getElementById("contact-org");
  if (ct) { ct.addEventListener("click", AP.contact); }
  var wd = document.getElementById("withdraw");
  if (wd) { wd.addEventListener("click", function () { BB.withdraw(AP.ev, function () { window.location.href = "my-events.html"; }); }); }
};

document.addEventListener("DOMContentLoaded", function () {
  var ev = BB.eventById(parseInt(BB.param("event"), 10)) || BB_EVENTS[2];
  AP.ev = ev; AP.det = BB_DETAILS[ev.id]; AP.edit = !!ev.status;
  var saved = AP.edit ? BB.application(ev) : BB.read("localStorage", AP.key(), null), f = AP.blank();
  if (saved && saved.files) { for (var k in f) { if (saved[k] !== undefined) { f[k] = saved[k]; } } }
  AP.form = f;
  if (ev.cats.indexOf(AP.form.category) === -1) { AP.form.category = ev.cats.indexOf(BB_USER.category) !== -1 ? BB_USER.category : ev.cats[0]; }
  window.addEventListener("resize", AP.fitSide);
  var b = BB.param("booth"), bt = BB.boothType(b);
  if (bt && ev.cats.indexOf(bt.cat) !== -1 && !AP.edit) { AP.form.booth = b; AP.form.category = bt.cat; }
  var n = parseInt(BB.param("qty"), 10); if (n > 0 && !AP.edit) { AP.form.qty = Math.min(BB.MAX_BOOTHS, n); }
  AP.render();
});
