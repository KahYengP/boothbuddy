/* A/B study for the Apply Events page (Iteration 2.05)

   Start links for Loop11, one per group:
     Version A (old, 3 steps)       apply.html?event=4&v=a   on the Version A site
     Version B (latest, one page)   apply.html?event=4&v=b   on the Version B site

   What this file does
   - gives every participant the same clean start (forgets anything saved by an earlier participant)
   - in Version B, Rachel's documents are already uploaded, the same as her document vault in Version A
   - starts a timer
   - after "Submit application", opens submitted.html with the version and time in the address,
     so the Loop11 report shows them

   Without ?v= in the address, nothing here runs and the app works as normal. */
var STUDY = {};

STUDY.get = function (k) { try { return sessionStorage.getItem(k) || ""; } catch (e) { return ""; } };
STUDY.version = function () { return STUDY.get("bb_study"); };

STUDY.finish = function (ev, form) {
  var v = STUDY.version();
  if (!v) { return false; }
  var t0 = parseInt(STUDY.get("bb_study_t0"), 10) || 0;
  var secs = t0 ? Math.round((Date.now() - t0) / 1000) : "";
  var sell = form && form.products && form.products.trim() ? 1 : 0;
  location.href = "submitted.html?v=" + v + "&event=" + ev.id + "&sell=" + sell + "&secs=" + secs;
  return true;
};

(function () {
  var q = new URLSearchParams(location.search);
  var v = (q.get("v") || "").toLowerCase();
  if (v !== "a" && v !== "b") { return; }
  try {
    Object.keys(localStorage).forEach(function (k) { if (k.indexOf("bb_") === 0) { localStorage.removeItem(k); } });
    sessionStorage.setItem("bb_study", v);
    sessionStorage.setItem("bb_study_t0", String(Date.now()));
    if (v === "b") {
      var files = {
        acra: { name: "acra-rachel.pdf", size: 245760 },
        nea: { name: "nea-rachel.pdf", size: 198656 },
        halal: { name: "halal-rachel.pdf", size: 176128 },
        insurance: { name: "insurance-rachel.pdf", size: 312320 },
        menu: { name: "menu-rachel.pdf", size: 155648 },
        layout: { name: "layout-rachel.pdf", size: 133120 }
      };
      var id = q.get("event") || "4";
      localStorage.setItem("bb_apply_" + id, JSON.stringify({ category: "", booth: "", qty: 1, together: true, products: "", agree: false, files: files, savedAt: "" }));
    }
  } catch (e) {}
})();
