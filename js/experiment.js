/* A/B test for Iteration 2.05: does a synced 2D plan beside the 3D view (B) help people place items
   correctly and faster than switching between 3D and 2D with a toggle (A)?

   Start links for Loop11 (one per group):
     Version A: my-events.html?event=2&v=a
     Version B: my-events.html?event=2&v=b

   What this file does
   - remembers the version for this browser tab
   - gives every participant the same starting booth for the Toa Payoh event
   - "Save layout" checks the three task rules and opens layout-saved.html with the result in the
     address (Loop11 records the address, so the team can read time and errors from the report) */
var EXP = { EVENT: 2 };

EXP.version = function () { try { return sessionStorage.getItem("bb_exp") || ""; } catch (e) { return ""; } };

/* the same starting layout for everyone: no fridge yet, cashier in the middle, table too close to the shelves */
EXP.seed = function () {
  return {
    items: [
      { id: 1, type: "shelf", x: 1, y: 0, r: 0 },
      { id: 2, type: "shelf", x: 3, y: 0, r: 0 },
      { id: 3, type: "storage", x: 6, y: 0, r: 0 },
      { id: 4, type: "table", x: 2, y: 2, r: 0 },
      { id: 5, type: "cashier", x: 6, y: 3, r: 0 },
      { id: 6, type: "banner", x: 0, y: 4, r: 0 },
      { id: 7, type: "chair", x: 6, y: 2, r: 0 },
      { id: 8, type: "cakestand", x: 2, y: 2, r: 0 },
      { id: 9, type: "decor", x: 4, y: 2, r: 0 }
    ],
    queue: { sx: -1.5, target: 0 }, checked: {}, customs: [], extraPack: [], style: "warm", colors: {}, history: []
  };
};

/* the three things the task asks for */
EXP.check = function (plan) {
  var group = function (it) { return PL.catalog[it.type] ? PL.catalog[it.type].group : ""; };
  var fridge = plan.items.some(function (it) { return group(it) === "chiller" && it.x === 0 && it.y <= 1; });
  var cashier = plan.items.some(function (it) { var s = PL.size(it.type, it.r); return group(it) === "cashier" && it.y + s.h === PL.H && it.x + s.w > PL.W / 2; });
  var tables = plan.items.filter(function (it) { return group(it) === "table"; });
  var space = tables.length > 0 && tables.every(function (it) { return it.y >= 3; });
  var r = { fridge: fridge ? 1 : 0, cashier: cashier ? 1 : 0, space: space ? 1 : 0 };
  r.errors = 3 - r.fridge - r.cashier - r.space;
  return r;
};

EXP.finish = function (plan) {
  var c = EXP.check(plan), t0 = 0;
  try { t0 = parseInt(sessionStorage.getItem("bb_exp_t0"), 10) || 0; } catch (e) {}
  var secs = t0 ? Math.round((Date.now() - t0) / 1000) : "";
  location.href = "layout-saved.html?v=" + EXP.version() + "&fridge=" + c.fridge + "&cashier=" + c.cashier + "&space=" + c.space + "&errors=" + c.errors + "&secs=" + secs;
};

(function () {
  var v = (BB.param("v") || "").toLowerCase();
  if (v !== "a" && v !== "b") { return; }
  try { sessionStorage.setItem("bb_exp", v); sessionStorage.setItem("bb_exp_t0", String(Date.now())); } catch (e) {}
  PL.save(EXP.EVENT, EXP.seed());
})();
