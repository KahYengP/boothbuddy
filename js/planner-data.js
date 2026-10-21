/* Booth planner model, shared by My Events and the Booth Planner page.
   Grid: 1 cell = 0.5 m. The size comes from the booth type the seller picked for that event
   (e.g. F&B Regular 3 m x 2 m = 6 x 4 cells, Retail 2 m x 2 m = 4 x 4 cells). See PL.useEvent.
   Back wall is row 0. The aisle is below the last row.
   Each item: { id, type, x, y, r }  r = quarter turns (0 to 3), front faces the aisle when r = 0. */
var PL = {
  W: 8, H: 6, CELL_M: 0.5,
  AISLE: 2.4,
  catalog: {
    table:   { label: "Table",          w: 3, h: 1, color: "#E9D6B8", counter: true, surface: 0.92, pack: ["Table cloth and price cards"] },
    shelf:   { label: "Display shelf",  w: 2, h: 1, color: "#8A6A52", pack: ["Display shelves"] },
    cashier: { label: "Cashier counter", w: 1, h: 1, color: "#3A3A3C", counter: true, pack: ["QR code and cash float"] },
    chiller: { label: "Display fridge", w: 1, h: 1, color: "#DDE7EE", pack: ["Cooler box and ice packs"] },
    banner:  { label: "Roll-up banner", w: 1, h: 1, color: "#503A6B", pack: ["Banner and stand"] },
    storage: { label: "Storage boxes",  w: 2, h: 1, color: "#B58A62", pack: ["Spare stock"] },
    chair:   { label: "Bar stool",      w: 1, h: 1, color: "#462E4E", pack: ["Folding stool"] },
    sink:    { label: "Wash station",   w: 1, h: 1, color: "#C9D6E8", pack: ["Water tank and dish soap"] },
    /* people: the business owner and helpers */
    person:  { label: "Person",         w: 1, h: 1, color: "#8E73A6", person: true, pack: [] },
    /* things that sit on top of a table or cart */
    ricecooker: { label: "Rice cooker",   w: 1, h: 1, color: "#F2EEE8", top: true, power: true, pack: ["Rice cooker"] },
    cooker:     { label: "Electric cooker", w: 1, h: 1, color: "#2B2A2C", top: true, power: true, pack: ["Electric cooker and pot"] },
    oven:       { label: "Oven",          w: 1, h: 1, color: "#3A3A3C", top: true, power: true, pack: ["Oven or air fryer"] },
    coffee:     { label: "Coffee maker",  w: 1, h: 1, color: "#C9CDD2", top: true, power: true, pack: ["Coffee maker and cups"] },
    cakestand:  { label: "Cake stand",    w: 1, h: 1, color: "#F0B49C", top: true, pack: ["Cake stands"] },
    decor:      { label: "Table decor",   w: 1, h: 1, color: "#96BFA0", top: true, pack: ["Table decor"] },
    /* retail and workshop (artists, accessories, classes) */
    rack:       { label: "Clothes rail",   w: 2, h: 1, color: "#C9B2D6", pack: ["Clothes rail and hangers"] },
    pegboard:   { label: "Pegboard",       w: 2, h: 1, color: "#D9C2A0", pack: ["Pegboard and hooks"] },
    showcase:   { label: "Jewellery stand", w: 1, h: 1, color: "#3A3540", top: true, pack: ["Jewellery stands"] },
    easel:      { label: "Easel",          w: 1, h: 1, color: "#B98B63", pack: ["Easels and canvases"] },
    worktable:  { label: "Craft table",    w: 3, h: 2, color: "#E9D6B8", surface: 0.76, pack: ["Workshop table and supplies"] },
    artwall:    { label: "Art print wall", w: 2, h: 1, color: "#F0B49C", pack: ["Art prints and frames"] }
  },
  baseCheck: ["Booth pass and ID", "Extension cord", "Cleaning kit"]
};


/* Three designs for every object. Each design is its own catalog entry in the same group,
   so it can have its own size. [key, group, design name, w, h, label, extra] */
PL.VARIANTS = [
  ["table", "table", "Long counter", 3, 1, "Table"],
  ["table_round", "table", "Round table", 2, 2, "Round table", { surface: 0.76 }],
  ["table_square", "table", "Square table", 2, 2, "Square table", { surface: 0.76 }],
  ["shelf", "shelf", "Open shelf", 2, 1, "Display shelf"],
  ["shelf_glass", "shelf", "Glass cabinet", 2, 1, "Glass cabinet"],
  ["shelf_tier", "shelf", "Tiered stand", 2, 1, "Tiered stand"],
  ["cashier", "cashier", "Counter", 1, 1, "Cashier counter"],
  ["cashier_kiosk", "cashier", "Round kiosk", 1, 1, "Cashier kiosk"],
  ["cashier_stand", "cashier", "Tablet stand", 1, 1, "Tablet stand"],
  ["chiller", "chiller", "Upright fridge", 1, 1, "Display fridge"],
  ["chiller_chest", "chiller", "Chest cooler", 1, 1, "Chest cooler"],
  ["chiller_tub", "chiller", "Ice tub", 1, 1, "Ice tub"],
  ["banner", "banner", "Roll-up", 1, 1, "Roll-up banner"],
  ["banner_aframe", "banner", "A-frame board", 1, 1, "A-frame board"],
  ["banner_flag", "banner", "Feather flag", 1, 1, "Feather flag"],
  ["storage", "storage", "Boxes", 2, 1, "Storage boxes"],
  ["storage_crate", "storage", "Crates", 2, 1, "Storage crates"],
  ["storage_cart", "storage", "Rolling cart", 2, 1, "Rolling cart", { surface: 0.82 }],
  ["chair", "chair", "Bar stool", 1, 1, "Bar stool"],
  ["chair_fold", "chair", "Folding chair", 1, 1, "Folding chair"],
  ["chair_round", "chair", "Low stool", 1, 1, "Low stool"],
  ["sink", "sink", "Portable sink", 1, 1, "Wash station"],
  ["sink_basin", "sink", "Basin stand", 1, 1, "Basin stand"],
  ["sink_jug", "sink", "Water dispenser", 1, 1, "Water dispenser"],
  ["person", "person", "Apron", 1, 1, "Person"],
  ["person_chef", "person", "Chef whites", 1, 1, "Person"],
  ["person_casual", "person", "Vest", 1, 1, "Person"],
  ["ricecooker", "ricecooker", "Classic", 1, 1, "Rice cooker"],
  ["ricecooker_steel", "ricecooker", "Steel", 1, 1, "Steel rice cooker"],
  ["ricecooker_mini", "ricecooker", "Mini", 1, 1, "Mini rice cooker"],
  ["cooker", "cooker", "Induction hob", 1, 1, "Induction hob"],
  ["cooker_double", "cooker", "Hob and pan", 1, 1, "Hob and pan"],
  ["cooker_grill", "cooker", "Griddle", 1, 1, "Griddle"],
  ["oven", "oven", "Toaster oven", 1, 1, "Toaster oven"],
  ["oven_fryer", "oven", "Air fryer", 1, 1, "Air fryer"],
  ["oven_micro", "oven", "Microwave", 1, 1, "Microwave"],
  ["coffee", "coffee", "Espresso", 1, 1, "Espresso machine"],
  ["coffee_drip", "coffee", "Drip brewer", 1, 1, "Drip brewer"],
  ["coffee_kettle", "coffee", "Kettle", 1, 1, "Electric kettle"],
  ["cakestand", "cakestand", "Cake dome", 1, 1, "Cake stand"],
  ["cakestand_two", "cakestand", "Two tiers", 1, 1, "Two-tier stand"],
  ["cakestand_three", "cakestand", "Three tiers", 1, 1, "Three-tier stand"],
  ["decor", "decor", "Flower vase", 1, 1, "Flower vase"],
  ["decor_menu", "decor", "Menu board", 1, 1, "Menu board"],
  ["decor_plant", "decor", "Succulents", 1, 1, "Succulents"],
  ["rack", "rack", "Clothes rail", 2, 1, "Clothes rail"],
  ["rack_double", "rack", "Double rail", 2, 1, "Double rail"],
  ["rack_bags", "rack", "Bag shelf", 2, 1, "Bag shelf"],
  ["pegboard", "pegboard", "Pegboard", 2, 1, "Pegboard"],
  ["pegboard_grid", "pegboard", "Grid panel", 2, 1, "Grid panel"],
  ["pegboard_slat", "pegboard", "Slatwall", 2, 1, "Slatwall"],
  ["showcase", "showcase", "Necklace bust", 1, 1, "Necklace bust"],
  ["showcase_tray", "showcase", "Ring tray", 1, 1, "Ring tray"],
  ["showcase_tree", "showcase", "Earring tree", 1, 1, "Earring tree"],
  ["easel", "easel", "Painting easel", 1, 1, "Painting easel"],
  ["easel_canvas", "easel", "Canvas stand", 1, 1, "Canvas stand"],
  ["easel_print", "easel", "Print browser", 1, 1, "Print browser"],
  ["worktable", "worktable", "Craft table", 3, 2, "Craft table", { surface: 0.76 }],
  ["worktable_long", "worktable", "Long bench", 3, 1, "Long bench", { surface: 0.76 }],
  ["worktable_small", "worktable", "Small table", 2, 2, "Small table", { surface: 0.76 }],
  ["artwall", "artwall", "Art print wall", 2, 1, "Art print wall"],
  ["artwall_supply", "artwall", "Supply shelf", 2, 1, "Supply shelf"],
  ["artwall_spinner", "artwall", "Card spinner", 1, 1, "Card spinner"]
];
/* which kind of booth each object belongs to: fnb, retail, workshop or all */
PL.GROUP_CATS = {
  table: "all", cashier: "all", banner: "all", storage: "all", chair: "all", decor: "all",
  shelf: "fnb", chiller: "fnb", sink: "fnb", ricecooker: "fnb", cooker: "fnb", oven: "fnb", coffee: "fnb", cakestand: "fnb",
  rack: "retail", pegboard: "retail", showcase: "retail",
  easel: "workshop retail", artwall: "workshop retail", worktable: "workshop"
};
PL.VARIANTS.forEach(function (a, i) {
  var base = PL.catalog[a[1]], c = Object.assign({}, base, { w: a[3], h: a[4], label: a[5], group: a[1], vname: a[2], v: i % 3 }, a[6] || {});
  if (a[0] !== a[1] && !(a[6] && a[6].surface)) { delete c.surface; }
  PL.catalog[a[0]] = c;
});
PL.designs = function (type) {
  var c = PL.catalog[type]; if (!c || !c.group) { return []; }
  return Object.keys(PL.catalog).filter(function (k) { return PL.catalog[k].group === c.group; });
};

/* line icons for the objects panel (24 x 24) */
PL.ICONS = {
  table: '<path d="M3 9h18M5 9v10M19 9v10M3 9l2-3h14l2 3"/>',
  shelf: '<rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M5 9h14M5 15h14M8 7v-1M12 13v-1M15 19v-1"/>',
  cashier: '<rect x="4" y="11" width="16" height="9" rx="1.5"/><rect x="8" y="4" width="8" height="5" rx="1"/><path d="M12 9v2M8 15h2M14 15h2"/>',
  chiller: '<rect x="6" y="3" width="12" height="18" rx="2"/><path d="M6 9h12M15 12v3"/>',
  banner: '<rect x="7" y="3" width="10" height="15" rx="1"/><path d="M12 18v3M9 21h6M9.5 7h5M9.5 10h3"/>',
  storage: '<path d="M3 8l9-4 9 4-9 4z"/><path d="M3 8v9l9 4 9-4V8M12 12v9"/>',
  chair: '<path d="M7 11h10M8 11l-1.5 9M16 11l1.5 9M7 4h10v7H7z"/>',
  ricecooker: '<path d="M5 12a7 4 0 0 1 14 0"/><path d="M5 12v5a7 3 0 0 0 14 0v-5"/><path d="M10 8h4M11 15h2"/>',
  cooker: '<rect x="3" y="14" width="18" height="5" rx="1.5"/><path d="M7 14V9h10v5M5 9h14"/>',
  oven: '<rect x="3" y="6" width="18" height="13" rx="2"/><rect x="6" y="9" width="9" height="7" rx="1"/><path d="M18 10v.5M18 13v.5"/>',
  coffee: '<path d="M5 9h11v5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5z"/><path d="M16 11h1.5a2 2 0 0 1 0 4H16M8 3v3M11 3v3"/>',
  cakestand: '<path d="M4 14h16M12 14v6M8 20h8M7 14v-4h10v4M12 6v.5"/>',
  sink: '<path d="M4 12h16v2a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M12 12V6a2 2 0 0 1 4 0M9 21h6"/>',
  person: '<circle cx="12" cy="6.5" r="3"/><path d="M6 21v-5a6 6 0 0 1 12 0v5M9.5 12.5l2.5 3 2.5-3"/>',
  decor: '<path d="M9 21h6l1-7H8z"/><path d="M12 14V8M12 8c-3 0-4-2-4-4 2 0 4 1 4 4zM12 10c2 0 4-1 4-4-2 0-4 1-4 4z"/>',
  rack: '<path d="M4 5h16M5 5v15M19 5v15M3 20h4M17 20h4"/><path d="M8 5l-1.5 3h3zM13 5l-1.5 3h3z"/><path d="M6.5 8h3v7h-3zM11.5 8h3v6h-3z"/>',
  pegboard: '<rect x="4" y="3" width="16" height="14" rx="1.5"/><path d="M8 7h.01M12 7h.01M16 7h.01M8 11h.01M12 11h.01M16 11h.01M7 17v4M17 17v4"/>',
  showcase: '<path d="M8 21h8M12 21v-3"/><path d="M9 18c0-4 1-6 3-6s3 2 3 6z"/><path d="M10 12V9a2 2 0 0 1 4 0v3"/><path d="M10 15.5c1 1 3 1 4 0"/>',
  easel: '<path d="M12 3v3M7 21l3-9M17 21l-3-9M12 14v7"/><rect x="6" y="6" width="12" height="8" rx="1"/>',
  worktable: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v8M19 12v8"/><circle cx="8" cy="6" r="1.5"/><path d="M12 8V4M15 8l1.5-3"/>',
  artwall: '<rect x="3" y="3" width="18" height="15" rx="1.5"/><rect x="6" y="6" width="5" height="4"/><rect x="13" y="6" width="5" height="6"/><rect x="6" y="12" width="5" height="3"/><path d="M8 18v3M16 18v3"/>'
};
PL.icon = function (type, size) {
  var c = PL.catalog[type], g = c && c.group ? c.group : type;
  return '<svg class="icon" width="' + (size || 20) + '" height="' + (size || 20) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' + (PL.ICONS[g] || PL.ICONS.storage) + "</svg>";
};

/* extra icons used by the planner */
BB.icons.rotate = '<path d="M20 12a8 8 0 1 1-2.4-5.7"/><path d="M20 4v5h-5"/>';
BB.icons.trash = '<path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13"/>';
BB.icons.grid = '<rect x="3.5" y="3.5" width="17" height="17" rx="2"/><path d="M3.5 9.2h17M3.5 14.8h17M9.2 3.5v17M14.8 3.5v17"/>';
BB.icons.walk = '<circle cx="13" cy="4.5" r="2"/><path d="M10 21l2-6 3 3v3M8 12l2.5-4.5h3L16 11l3 1M12.5 7.5L11 14"/>';
BB.icons.cube = '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z"/><path d="M4 7.5l8 4.5 8-4.5M12 12v9"/>';
BB.icons.phone = '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>';
BB.icons.target = '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/>';
BB.icons.flip = '<path d="M4 8h13l-3-3M20 16H7l3 3"/>';
BB.icons.up = '<path d="M6 15l6-6 6 6"/>';
BB.icons.down = '<path d="M6 9l6 6 6-6"/>';
BB.icons.booth = BB.icons.booth || '<rect x="3" y="4" width="18" height="16" rx="1.5"/><path d="M3 9h18M7 9v11M17 9v11"/>';

/* ---------- Booth size and kind, from the booth type the seller picked for this event ----------
   Uses the seller's application if there is one (booth type, number of booths, side by side or not).
   Otherwise the regular booth of the seller's category. */
PL.booth = null;
PL.useEvent = function (eventId) {
  var ev = typeof BB !== "undefined" && BB.eventById ? BB.eventById(eventId) : null, t = null, n = 1;
  if (ev && BB.boothTypesFor) {
    var a = BB.application ? BB.application(ev) : null;
    if (a && a.booth) { t = BB.boothType(a.booth); n = a.qty > 1 && a.together !== false ? Math.min(a.qty, 3) : 1; }
    if (!t) {
      var cat = ev.cats.indexOf(BB_USER.category) !== -1 ? BB_USER.category : ev.cats[0], list = BB.boothTypesFor(ev, cat);
      t = list.filter(function (x) { return /-regular$/.test(x.id); })[0] || list[0];
    }
  }
  if (!t) { PL.W = 8; PL.H = 6; PL.booth = { cat: "fnb", label: "Booth", power: true, open: 1, n: 1, key: "8x6:fnb" }; return PL.booth; }
  PL.W = Math.round(t.w * n / PL.CELL_M); PL.H = Math.round(t.d / PL.CELL_M);
  PL.booth = { id: t.id, cat: t.cat, label: t.label, w: t.w * n, d: t.d, n: n, power: t.power.length > 0, plugs: t.power, open: n > 1 ? 1 : t.open, sink: t.sink, key: PL.W + "x" + PL.H + ":" + t.cat };
  PL.SUGGEST = PL.suggestions(t.cat);
  return PL.booth;
};

/* ---------- Ready-made set-ups for each kind of booth. Positions are worked out from the booth size,
   and anything that does not fit is left out. The first one is the default booth. ---------- */
PL.TEMPLATES = {
  fnb: [
    { id: "classic", name: "Classic bakery", tag: "Balanced", note: "Shelf and sink at the back, a long counter in front, cashier on the side.", queue: -1.5,
      make: function (W, H) { return [["sink", 0, 0], ["shelf", 1, 0], ["storage", W - 2, 0], ["chiller", W - 1, 1], ["chair", W - 1, H - 2], ["table", 1, H - 1], ["cashier", W - 1, H - 1], ["banner", 0, H - 1], ["cakestand_two", 1, H - 1], ["decor", 3, H - 1]]; } },
    { id: "grab", name: "Grab and go", tag: "Fast queue", note: "Pay point at the front, drinks ready to go, stock out of sight.", queue: "right",
      make: function (W, H) { return [["sink", 0, 0], ["shelf", 1, 0], ["chiller", 3, 0], ["storage", W - 2, 0], ["table", 1, H - 1], ["cashier", 4, H - 1], ["chair", 4, H - 2], ["banner_flag", W - 1, H - 1], ["coffee", 1, H - 1], ["cakestand", 2, H - 1]]; } },
    { id: "show", name: "Open showcase", tag: "Browsing", note: "A glass cabinet at the back and a round table people can walk around.", queue: -1.5,
      make: function (W, H) { return [["sink", 0, 0], ["shelf_glass", 1, 0], ["storage", W - 2, 0], ["table_round", 2, H - 3], ["cashier_kiosk", W - 1, H - 1], ["chair", W - 1, H - 2], ["banner_aframe", 0, H - 1], ["cakestand_three", 2, H - 3], ["decor", 3, H - 2]]; } }
  ],
  retail: [
    { id: "wall", name: "Accessories wall", tag: "Balanced", note: "Pegboard and a clothes rail at the back, jewellery on the front table.", queue: "right",
      make: function (W, H) { return [["pegboard", 0, 0], ["rack", 2, 0], ["chair_round", W - 1, H - 2], ["table", 0, H - 1], ["cashier_stand", W - 1, H - 1], ["showcase", 0, H - 1], ["showcase_tray", 1, H - 1], ["showcase_tree", 2, H - 1]]; } },
    { id: "rails", name: "Boutique rails", tag: "Browsing", note: "Two rails along the back and a small table in the middle.", queue: -1.5,
      make: function (W, H) { return [["rack", 0, 0], ["rack_double", 2, 0], ["table_square", 1, H - 2], ["showcase_tree", 1, H - 2], ["showcase", 2, H - 1], ["cashier_stand", W - 1, H - 1], ["banner_aframe", 0, H - 1]]; } },
    { id: "gallery", name: "Art and prints", tag: "Artist", note: "Prints on the back wall, an easel to show your work, cards at the front.", queue: -1.5,
      make: function (W, H) { return [["artwall", 0, 0], ["easel", 2, 0], ["easel_canvas", 3, 0], ["easel_print", 0, H - 1], ["table", 1, H - 1], ["artwall_spinner", W - 1, H - 2], ["decor_plant", 2, H - 1]]; } }
  ],
  workshop: [
    { id: "class", name: "Class table", tag: "Balanced", note: "One big craft table with stools behind it, supplies at the back.", queue: "right",
      make: function (W, H) { return [["artwall_supply", 0, 0], ["storage", 2, 0], ["easel", W - 1, 0], ["chair_round", 1, H - 3], ["chair_round", 2, H - 3], ["chair_round", 3, H - 3], ["worktable", 1, H - 2], ["cashier_stand", W - 1, H - 1], ["banner", 0, H - 1]]; } },
    { id: "paint", name: "Paint and sip", tag: "Creative", note: "Easels along the back and a long bench at the front for small groups.", queue: "right",
      make: function (W, H) { return [["artwall", 0, 0], ["easel", 2, 0], ["easel", 3, 0], ["easel_canvas", W - 1, 0], ["chair_round", 1, H - 2], ["chair_round", 2, H - 2], ["chair_round", 3, H - 2], ["worktable_long", 1, H - 1], ["cashier_stand", W - 1, H - 1]]; } },
    { id: "maker", name: "Maker market", tag: "Sell and teach", note: "Sell finished pieces at the front, run a small class at the side.", queue: -1.5,
      make: function (W, H) { return [["artwall_supply", 0, 0], ["pegboard", 2, 0], ["worktable_small", W - 2, 1], ["chair_round", W - 3, 1], ["table", 0, H - 1], ["showcase", 0, H - 1], ["cashier_stand", W - 1, H - 1]]; } }
  ]
};
/* build the items of a template, keeping only what fits */
PL.fromTemplate = function (tp) {
  var plan = { items: [] }, id = 1;
  tp.make(PL.W, PL.H).forEach(function (a) {
    if (!PL.catalog[a[0]]) { return; }
    if (PL.fits(plan, 0, a[0], a[1], a[2], a[3] || 0)) { plan.items.push({ id: id++, type: a[0], x: a[1], y: a[2], r: a[3] || 0 }); }
  });
  var q = tp.queue === "right" ? PL.W + 1.5 : tp.queue;
  return { items: plan.items, queue: { sx: q, target: 0 } };
};
PL.suggestions = function (cat) {
  return (PL.TEMPLATES[cat] || PL.TEMPLATES.fnb).map(function (tp) { var p = PL.fromTemplate(tp); return { id: tp.id, name: tp.name, tag: tp.tag, note: tp.note, plan: p }; });
};

PL.defaultPlan = function () {
  var p = PL.fromTemplate((PL.TEMPLATES[PL.booth ? PL.booth.cat : "fnb"] || PL.TEMPLATES.fnb)[0]);
  p.checked = {};
  p.size = PL.booth ? PL.booth.key : "";
  return p;
};

PL.load = function (eventId) {
  PL.useEvent(eventId);
  var p = BB.read("localStorage", "bb_plan_" + eventId, null);
  /* a new booth (or a different booth size) starts from the matching preset */
  if (!p || !p.items || p.size !== PL.booth.key) {
    var keep = p || {};
    p = PL.defaultPlan();
    p.checked = keep.checked || {}; p.extraPack = keep.extraPack || []; p.walls = keep.walls;
  }
  if (!p.checked) { p.checked = {}; }
  if (!p.queue) { p.queue = { sx: -1.5, target: 0 }; }
  if (!p.customs) { p.customs = []; }
  if (!p.extraPack) { p.extraPack = []; }
  if (!p.style) { p.style = "minimal"; }
  if (!p.colors) { p.colors = {}; }
  if (!p.history) { p.history = []; }
  p.items.forEach(function (it) { if (!it.r) { it.r = 0; } });
  PL.registerCustoms(p);
  p.items = p.items.filter(function (it) { return PL.catalog[it.type]; });
  /* people: keep only actions that still exist, and fill in anything older plans did not have */
  p.items.forEach(function (it) {
    if (!PL.catalog[it.type].person) { return; }
    it.acts = (it.acts || []).filter(function (a) { return PL.action(a); });
    if (!it.acts.length) { it.acts = ["stand"]; }
    if (!it.gender) { it.gender = "female"; }
    if (it.skin === undefined) { it.skin = 1; }
    if (it.hair === undefined) { it.hair = it.id % 4; }
  });
  return p;
};

/* custom objects made from an uploaded picture. Saved inside the plan, added to the catalog on load */
PL.registerCustoms = function (plan) {
  Object.keys(PL.catalog).forEach(function (k) { if (PL.catalog[k].custom) { delete PL.catalog[k]; } });
  (plan.customs || []).forEach(function (c) {
    PL.catalog[c.key] = { label: c.label, w: c.w, h: c.h, color: c.tint || "#C3A7CB", custom: true, image: c.image, cutout: c.cutout || "", form: c.form || "box", tint: c.tint || "#E9E2DA", tall: c.tall || 1, top: !!c.top, pack: [c.label] };
  });
};
PL.save = function (eventId, plan) { BB.write("localStorage", "bb_plan_" + eventId, plan); };

PL.find = function (plan, id) { return plan.items.filter(function (i) { return i.id === id; })[0] || null; };

/* footprint in cells, after rotation */
PL.size = function (type, r) {
  var c = PL.catalog[type];
  return (r || 0) % 2 ? { w: c.h, h: c.w } : { w: c.w, h: c.h };
};

/* floor objects only bump into floor objects, table-top objects only into table-top objects */
PL.occupied = function (plan, x, y, w, h, ignoreId, top) {
  for (var i = 0; i < plan.items.length; i++) {
    var it = plan.items[i]; if (it.id === ignoreId || !!PL.catalog[it.type].top !== !!top) { continue; }
    var s = PL.size(it.type, it.r);
    if (x < it.x + s.w && x + w > it.x && y < it.y + s.h && y + h > it.y) { return true; }
  }
  return false;
};

/* the table (or cart) under a cell area, if any */
PL.hostAt = function (plan, x, y, w, h) {
  for (var i = 0; i < plan.items.length; i++) {
    var it = plan.items[i], c = PL.catalog[it.type]; if (!c.surface) { continue; }
    var s = PL.size(it.type, it.r);
    if (x >= it.x && y >= it.y && x + w <= it.x + s.w && y + h <= it.y + s.h) { return it; }
  }
  return null;
};
PL.hostOf = function (plan, it) { return PL.catalog[it.type].top ? PL.hostAt(plan, it.x, it.y, 1, 1) : null; };
PL.topsOn = function (plan, host) {
  var s = PL.size(host.type, host.r);
  return plan.items.filter(function (it) { return PL.catalog[it.type].top && it.x >= host.x && it.y >= host.y && it.x < host.x + s.w && it.y < host.y + s.h; });
};

/* can this item sit at x, y with rotation r? Table-top objects need a table under them */
PL.fits = function (plan, id, type, x, y, r) {
  var s = PL.size(type, r), top = !!PL.catalog[type].top;
  if (x < 0 || y < 0 || x + s.w > PL.W || y + s.h > PL.H) { return false; }
  if (top && !PL.hostAt(plan, x, y, s.w, s.h)) { return false; }
  return !PL.occupied(plan, x, y, s.w, s.h, id, top);
};

/* move an item; anything standing on it moves along */
PL.shift = function (plan, it, nx, ny) {
  var tops = PL.catalog[it.type].surface ? PL.topsOn(plan, it) : [], dx = nx - it.x, dy = ny - it.y;
  it.x = nx; it.y = ny;
  tops.forEach(function (t) { t.x += dx; t.y += dy; });
};

PL.freeSpot = function (plan, type) {
  for (var y = 0; y < PL.H; y++) {
    for (var x = 0; x < PL.W; x++) { if (PL.fits(plan, 0, type, x, y, 0)) { return { x: x, y: y }; } }
  }
  return null;
};

/* add an item. If x, y are given, use the nearest free spot to them */
PL.add = function (plan, type, x, y) {
  var spot = null;
  if (x !== undefined) {
    var best = 1e9;
    for (var yy = 0; yy < PL.H; yy++) {
      for (var xx = 0; xx < PL.W; xx++) {
        if (!PL.fits(plan, 0, type, xx, yy, 0)) { continue; }
        var d = Math.abs(xx - x) + Math.abs(yy - y);
        if (d < best) { best = d; spot = { x: xx, y: yy }; }
      }
    }
  } else { spot = PL.freeSpot(plan, type); }
  if (!spot) { return null; }
  var it = { id: Date.now() + plan.items.length, type: type, x: spot.x, y: spot.y, r: 0 };
  plan.items.push(it);
  return it;
};

PL.place = function (plan, id, x, y) {
  var it = PL.find(plan, id); if (!it) { return false; }
  if (!PL.fits(plan, id, it.type, x, y, it.r)) { return false; }
  PL.shift(plan, it, x, y); return true;
};

PL.move = function (plan, id, dx, dy) {
  var it = PL.find(plan, id); if (!it) { return false; }
  return PL.place(plan, id, it.x + dx, it.y + dy);
};

/* put table-top objects back on a table after it rotated or changed shape */
PL.rehome = function (plan, host, tops) {
  var lost = 0, s = PL.size(host.type, host.r);
  tops.forEach(function (t) {
    if (PL.fits(plan, t.id, t.type, t.x, t.y, t.r)) { return; }
    var done = false;
    for (var y = host.y; y < host.y + s.h && !done; y++) {
      for (var x = host.x; x < host.x + s.w && !done; x++) { if (PL.fits(plan, t.id, t.type, x, y, t.r)) { t.x = x; t.y = y; done = true; } }
    }
    if (!done) { plan.items = plan.items.filter(function (i) { return i.id !== t.id; }); lost++; }
  });
  return lost;
};

/* rotate 90 degrees; if it no longer fits, try small shifts. Things on top turn with it */
PL.rotate = function (plan, id) {
  var it = PL.find(plan, id); if (!it) { return false; }
  var r = (it.r + 1) % 4, tries = [[0, 0], [-1, 0], [0, -1], [-1, -1], [1, 0], [0, 1], [-2, 0], [0, -2], [-2, -1]];
  if (PL.catalog[it.type].top) { it.r = r; return true; }
  var tops = PL.catalog[it.type].surface ? PL.topsOn(plan, it) : [], s = PL.size(it.type, it.r);
  var rel = tops.map(function (t) { return { t: t, dx: t.x - it.x, dy: t.y - it.y }; });
  for (var i = 0; i < tries.length; i++) {
    var nx = it.x + tries[i][0], ny = it.y + tries[i][1];
    if (PL.fits(plan, id, it.type, nx, ny, r)) {
      it.x = nx; it.y = ny; it.r = r;
      rel.forEach(function (o) { o.t.x = nx + (s.h - 1 - o.dy); o.t.y = ny + o.dx; o.t.r = (o.t.r + 1) % 4; });
      return true;
    }
  }
  return false;
};

/* swap to another design in the same group (it may be a different size) */
PL.setDesign = function (plan, id, type) {
  var it = PL.find(plan, id); if (!it) { return null; }
  var tops = PL.catalog[it.type].surface ? PL.topsOn(plan, it) : [], tries = [[0, 0], [-1, 0], [0, -1], [-1, -1], [1, 0], [0, 1], [-2, 0], [0, -2], [-2, -1], [1, -1], [-1, 1]];
  for (var i = 0; i < tries.length; i++) {
    var nx = it.x + tries[i][0], ny = it.y + tries[i][1];
    if (PL.fits(plan, id, type, nx, ny, it.r)) {
      it.type = type; it.x = nx; it.y = ny;
      if (!PL.catalog[type].surface) { plan.items = plan.items.filter(function (x) { return tops.indexOf(x) === -1; }); return { lost: tops.length }; }
      return { lost: PL.rehome(plan, it, tops) };
    }
  }
  return null;
};

PL.remove = function (plan, id) {
  var it = PL.find(plan, id), tops = it && PL.catalog[it.type].surface ? PL.topsOn(plan, it) : [];
  plan.items = plan.items.filter(function (i) { return i.id !== id && tops.indexOf(i) === -1; });
  if (plan.queue.target === id) { plan.queue.target = 0; }
  return tops.length;
};

/* the counter customers queue for: the one the seller picked, else cashier, else table */
PL.counter = function (plan) {
  var pick = plan.queue.target ? PL.find(plan, plan.queue.target) : null;
  if (pick) { return pick; }
  plan.items.forEach(function (it) { if (!pick && PL.catalog[it.type].group === "cashier") { pick = it; } });
  plan.items.forEach(function (it) { if (!pick && PL.catalog[it.type].group === "table") { pick = it; } });
  return pick;
};

/* queue path in cell units. Starts on the aisle at queue.sx and ends in front of the counter */
PL.path = function (plan) {
  var c = PL.counter(plan), lane = PL.H + 1.3;
  var tx = PL.W / 2, ty = PL.H + 0.4;
  if (c) {
    var s = PL.size(c.type, c.r);
    tx = c.x + s.w / 2;
    ty = Math.min(PL.H + 0.5, c.y + s.h + 1.0);
  }
  var sx = plan.queue.sx;
  return [{ x: sx, y: lane }, { x: tx, y: lane }, { x: tx, y: ty }];
};

PL.packing = function (plan) {
  var list = PL.baseCheck.slice();
  plan.items.forEach(function (it) {
    PL.catalog[it.type].pack.forEach(function (p) { if (list.indexOf(p) === -1) { list.push(p); } });
  });
  (plan.extraPack || []).forEach(function (p) { if (list.indexOf(p) === -1) { list.push(p); } });
  return list;
};

/* ---------- 2D plan as SVG (architectural style). Used by the planner and My Events ---------- */
PL.U = 40; /* svg units per cell */

PL.symbol = function (type, w, h, item) {
  var s = "", k, cat = PL.catalog[type];
  if (cat && cat.custom) {
    return '<rect x="0" y="0" width="' + w + '" height="' + h + '" rx="3" fill="#F2ECF0"/>' +
      '<image href="' + (cat.cutout || cat.image) + '" x="2" y="2" width="' + (w - 4) + '" height="' + (h - 4) + '" preserveAspectRatio="xMidYMid ' + (cat.cutout ? "meet" : "slice") + '"/>' +
      '<rect x="0" y="0" width="' + w + '" height="' + h + '" rx="3" fill="none" stroke="#4A3550" stroke-width="1.6"/>';
  }
  var R = function (x, y, ww, hh, rx, fill, stroke, sw) { return '<rect x="' + x + '" y="' + y + '" width="' + ww + '" height="' + hh + '" rx="' + rx + '" fill="' + fill + '"' + (stroke ? ' stroke="' + stroke + '" stroke-width="' + (sw || 1.4) + '"' : "") + "/>"; };
  var O = function (cx, cy, r, fill, stroke, sw) { return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + fill + '"' + (stroke ? ' stroke="' + stroke + '" stroke-width="' + (sw || 1.4) + '"' : "") + "/>"; };
  var cx = w / 2, cy = h / 2;
  if (cat && cat.person) {
    var owner = item && item.role === "owner";
    return '<circle cx="' + (w / 2) + '" cy="' + (h / 2) + '" r="' + (w * 0.4) + '" fill="' + (item && item.color ? item.color : (owner ? "#6E4F8C" : "#D5714D")) + '" stroke="#2E2233" stroke-width="1.6"/>' +
      '<text x="' + (w / 2) + '" y="' + (h / 2 + 4.5) + '" text-anchor="middle" font-family="Outfit, sans-serif" font-size="13" font-weight="600" fill="#fff" transform="rotate(' + (-(item ? item.r : 0) * 90) + " " + (w / 2) + " " + (h / 2) + ')">' + (owner ? "O" : "H") + "</text>";
  }
  if (cat && cat.group === "sink") { return '<rect x="3" y="3" width="' + (w - 6) + '" height="' + (h - 6) + '" rx="4" fill="#EEF3F6" stroke="#4A5560" stroke-width="1.4"/><ellipse cx="' + (w / 2) + '" cy="' + (h / 2) + '" rx="' + (w * 0.28) + '" ry="' + (h * 0.22) + '" fill="#BFD9EA"/>'; }
  if (cat && cat.top) {
    var col = { ricecooker: "#FFFFFF", cooker: "#2B2A2C", oven: "#3A3A3C", coffee: "#C9CDD2", cakestand: "#FFFFFF", decor: "#DCEBDD", showcase: "#3A3540" }[cat.group] || "#fff";
    if (cat.group === "showcase") { return O(cx, cy, 11, "#3A3540", "#1E1A22", 1.2) + O(cx, cy, 5, "#D9B45A"); }
    if (cat.group === "cooker" || cat.group === "oven") { s += R(5, 7, w - 10, h - 14, 4, col, "#111", 1.2) + (cat.group === "cooker" ? O(cx, cy, 7, "none", "#E9BAA5", 2) : R(9, 11, w - 22, h - 22, 2, "#6E7780")); }
    else if (cat.group === "coffee") { s += R(8, 7, w - 16, h - 14, 4, col, "#4A5560", 1.2) + O(cx, cy + 3, 5, "#6B4A35"); }
    else if (cat.group === "decor") { s += O(cx, cy, 10, col, "#4F7A5B", 1.2) + O(cx - 3, cy - 2, 4, "#96BFA0") + O(cx + 4, cy + 3, 3.5, "#F0B49C"); }
    else { s += O(cx, cy, 12, col, "#4A3550", 1.4) + O(cx, cy, 6, cat.group === "cakestand" ? "#F0B49C" : "#EFE7DD", "#4A3550", 0.8); }
    return s;
  }
  /* retail and workshop objects */
  if (cat && cat.group === "rack") {
    s += R(1, h * 0.3, w - 2, h * 0.4, 3, "#F4F0F6", "#4A3550", 1.4);
    for (k = 0; k < 8; k++) { s += R(6 + k * (w - 12) / 8, h * 0.18, (w - 12) / 8 - 2, h * 0.64, 1, ["#F0B49C", "#C9B2D6", "#BFD9C8", "#7E9CC8"][k % 4]); }
    return s;
  }
  if (cat && cat.group === "pegboard") {
    s += R(0, 0, w, h * 0.42, 2, type === "pegboard_grid" ? "#3A3540" : (type === "pegboard_slat" ? "#FFFFFF" : "#D8BE98"), "#3A2840", 1.4);
    for (k = 0; k < 6; k++) { s += O(8 + k * (w - 16) / 5, h * 0.62, 3, ["#F0B49C", "#C9B2D6", "#D9B45A"][k % 3]); }
    return s;
  }
  if (cat && cat.group === "easel") {
    if (type === "easel_print") { return R(4, 4, w - 8, h - 8, 3, "#D9C2A0", "#3A2840", 1.4) + R(8, 9, w - 16, 4, 1, "#fff") + R(8, 16, w - 16, 4, 1, "#C9B2D6") + R(8, 23, w - 16, 4, 1, "#fff"); }
    return '<path d="M' + cx + ' 5 L' + (w - 6) + ' ' + (h - 5) + ' M' + cx + ' 5 L6 ' + (h - 5) + '" stroke="#8A6448" stroke-width="2.4" fill="none"/>' + R(w * 0.2, h * 0.3, w * 0.6, h * 0.3, 1, "#F7E7CF", "#3A2840", 1.2);
  }
  if (cat && cat.group === "worktable") {
    s += R(2, 2, w - 4, h - 4, 4, "#F2E6D4", "#4A3550", 1.6);
    for (k = 0; k < 4; k++) { s += O(w * (0.2 + k * 0.2), h / 2, 4, ["#F0B49C", "#7E9CC8", "#BFD9C8", "#C9B2D6"][k]); }
    return s;
  }
  if (cat && cat.group === "artwall") {
    if (type === "artwall_spinner") { return O(cx, cy, w * 0.38, "#EDE6F2", "#3A2840", 1.4) + '<path d="M' + (cx - 9) + " " + cy + " H" + (cx + 9) + " M" + cx + " " + (cy - 9) + " V" + (cy + 9) + '" stroke="#3A2840" stroke-width="1.2"/>'; }
    s += R(0, 0, w, h * 0.45, 2, type === "artwall_supply" ? "#D9C2A0" : "#FFFFFF", "#3A2840", 1.4);
    for (k = 0; k < 4; k++) { s += R(5 + k * (w - 10) / 4, 3, (w - 10) / 4 - 4, h * 0.45 - 6, 1, ["#F0B49C", "#C9B2D6", "#7E9CC8", "#BFD9C8"][k]); }
    return s;
  }
  if (type === "table_round") { return O(cx, cy, w * 0.46, "#FBF8F2", "#4A3550", 1.6) + O(cx, cy, w * 0.36, "none", "#B8A6BC", 0.8); }
  if (type === "table_square") { return R(4, 4, w - 8, h - 8, 4, "#FBF8F2", "#4A3550", 1.6) + R(w * 0.38, 4, w * 0.24, h - 8, 0, "#C3A7CB") ; }
  if (type === "shelf_glass") { return R(0, 0, w, h, 2, "#E6F0F5", "#3A2840", 1.6) + R(0, 0, w, 4, 0, "#3A2840") + '<line x1="' + cx + '" y1="4" x2="' + cx + '" y2="' + h + '" stroke="#3A2840" stroke-width="0.8"/>'; }
  if (type === "shelf_tier") { return R(0, 0, w, h, 2, "#D9C2A0", "#3A2840", 1.6) + R(0, 0, w, h * 0.66, 2, "#C8A982") + R(0, 0, w, h * 0.33, 2, "#B48E66"); }
  if (type === "cashier_kiosk") { return O(cx, cy, w * 0.44, "#ECECEC", "#111", 1.6) + R(cx - 7, cy - 3, 14, 9, 2, "#2A2A2C"); }
  if (type === "cashier_stand") { return O(cx, cy, w * 0.32, "#ECECEC", "#111", 1.4) + R(cx - 7, cy - 4, 14, 9, 2, "#2A2A2C"); }
  if (type === "chiller_chest") { return R(1, 1, w - 2, h - 2, 3, "#FFFFFF", "#4A5560", 1.6) + R(5, 5, w - 10, h - 10, 2, "#CFE6F3"); }
  if (type === "chiller_tub") { return O(cx, cy, w * 0.42, "#D9DCE0", "#4A5560", 1.6) + O(cx, cy, w * 0.3, "#EAF4FA"); }
  if (type === "banner_aframe") { return R(4, h * 0.25, w - 8, h * 0.5, 2, "#2B2A2C", "#5A3E2B", 1.4); }
  if (type === "banner_flag") { return O(cx, cy, 5, "#503A6B") + '<path d="M' + cx + ' ' + cy + ' q ' + (w * 0.35) + ' -8 ' + (w * 0.42) + ' ' + (-h * 0.3) + '" fill="none" stroke="#503A6B" stroke-width="3"/>'; }
  if (type === "storage_crate") { return R(1, 1, w / 2 - 2, h - 2, 2, "#BFD9C8", "#4A3550", 1.2) + R(w / 2 + 1, 1, w / 2 - 2, h - 2, 2, "#C9B2D6", "#4A3550", 1.2); }
  if (type === "storage_cart") { return R(1, 1, w - 2, h - 2, 3, "#F2EEE8", "#4A3550", 1.6) + O(5, 5, 2.5, "#333") + O(w - 5, 5, 2.5, "#333") + O(5, h - 5, 2.5, "#333") + O(w - 5, h - 5, 2.5, "#333"); }
  if (type === "chair_fold") { return R(w * 0.18, h * 0.22, w * 0.64, h * 0.6, 3, "#C8BBAE", "#3A2840", 1.4) + R(w * 0.18, h * 0.14, w * 0.64, 4, 1, "#3A2840"); }
  if (type === "chair_round") { return O(cx, cy, w * 0.32, "#D9C2A0", "#3A2840", 1.4); }
  if (type === "table") {
    s += '<rect x="0" y="0" width="' + w + '" height="' + h + '" rx="3" fill="#FBF8F2" stroke="#4A3550" stroke-width="1.6"/>';
    s += '<rect x="4" y="4" width="' + (w - 8) + '" height="' + (h - 8) + '" rx="2" fill="none" stroke="#B8A6BC" stroke-width="0.8" stroke-dasharray="3 2"/>';
    s += '<rect x="' + (w * 0.35) + '" y="0" width="' + (w * 0.3) + '" height="' + h + '" fill="#C3A7CB" opacity="0.55"/>';
    for (k = 0; k < 5; k++) { s += '<circle cx="' + (w * (0.12 + k * 0.19)) + '" cy="' + (h / 2) + '" r="4" fill="#C3A7CB" stroke="#4A3550" stroke-width="0.6"/>'; }
  } else if (type === "shelf") {
    s += '<rect x="0" y="0" width="' + w + '" height="' + h + '" rx="2" fill="#8C7299" stroke="#3A2840" stroke-width="1.6"/>';
    s += '<rect x="0" y="0" width="' + w + '" height="4" fill="#3A2840"/>';
    for (k = 1; k < 4; k++) { s += '<line x1="' + (w * k / 4) + '" y1="4" x2="' + (w * k / 4) + '" y2="' + h + '" stroke="#3A2840" stroke-width="0.8"/>'; }
    for (k = 0; k < 4; k++) { s += '<rect x="' + (w * k / 4 + 5) + '" y="9" width="' + (w / 4 - 10) + '" height="' + (h - 16) + '" rx="2" fill="#EEE3EE" opacity="0.8"/>'; }
  } else if (type === "cashier") {
    s += '<rect x="0" y="0" width="' + w + '" height="' + h + '" rx="2" fill="#3A3A3C" stroke="#111" stroke-width="1.6"/>';
    s += '<rect x="3" y="3" width="' + (w - 6) + '" height="' + (h - 6) + '" rx="2" fill="#ECECEC"/>';
    s += '<rect x="' + (w / 2 - 8) + '" y="' + (h / 2 - 3) + '" width="16" height="11" rx="2" fill="#2A2A2C"/>';
  } else if (type === "chiller") {
    s += '<rect x="0" y="0" width="' + w + '" height="' + h + '" rx="3" fill="#FFFFFF" stroke="#4A5560" stroke-width="1.6"/>';
    s += '<rect x="3" y="' + (h - 7) + '" width="' + (w - 6) + '" height="4" fill="#9CC9E8"/>';
    s += '<line x1="6" y1="' + (h - 12) + '" x2="' + (w - 6) + '" y2="' + (h - 12) + '" stroke="#4A5560" stroke-width="0.8"/>';
  } else if (type === "banner") {
    s += '<rect x="2" y="' + (h * 0.3) + '" width="' + (w - 4) + '" height="' + (h * 0.22) + '" rx="2" fill="#C9CDD2" stroke="#444" stroke-width="1.2"/>';
    s += '<rect x="4" y="' + (h * 0.36) + '" width="' + (w - 8) + '" height="4" fill="#503A6B"/>';
  } else if (type === "storage") {
    [[0, 0], [w / 2, 0]].forEach(function (p, i) {
      var bw = w / 2 - 2;
      s += '<rect x="' + (p[0] + 1) + '" y="1" width="' + bw + '" height="' + (h - 2) + '" rx="1.5" fill="' + (i ? "#D8B4A2" : "#C9A08C") + '" stroke="#4A3550" stroke-width="1.2"/>';
      s += '<line x1="' + (p[0] + 1 + bw / 2) + '" y1="1" x2="' + (p[0] + 1 + bw / 2) + '" y2="' + (h - 1) + '" stroke="#F1E6D6" stroke-width="3"/>';
    });
  } else if (type === "chair") {
    s += '<circle cx="' + (w / 2) + '" cy="' + (h / 2) + '" r="' + (w * 0.36) + '" fill="none" stroke="#333" stroke-width="1" stroke-dasharray="2 2"/>';
    s += '<circle cx="' + (w / 2) + '" cy="' + (h / 2) + '" r="' + (w * 0.26) + '" fill="#8A5E3C" stroke="#3A2840" stroke-width="1.4"/>';
  }
  return s;
};

/* opts: { sel: id, mini: bool } */
PL.svg = function (plan, opts) {
  opts = opts || {};
  var U = PL.U, W = PL.W * U, H = PL.H * U, mL = 2.1 * U, mR = 2.1 * U, mT = 0.9 * U, aisle = PL.AISLE * U;
  var vb = [-mL, -mT, W + mL + mR, H + mT + aisle + 0.25 * U];
  var s = '<svg class="plan-svg" viewBox="' + vb.join(" ") + '" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">';
  s += '<defs>' +
    '<pattern id="pg-fine" width="' + (U / 2) + '" height="' + (U / 2) + '" patternUnits="userSpaceOnUse"><path d="M ' + (U / 2) + ' 0 L 0 0 0 ' + (U / 2) + '" fill="none" stroke="rgba(80, 60, 90, 0.10)" stroke-width="0.6"/></pattern>' +
    '<pattern id="pg-cell" width="' + U + '" height="' + U + '" patternUnits="userSpaceOnUse"><rect width="' + U + '" height="' + U + '" fill="url(#pg-fine)"/><path d="M ' + U + ' 0 L 0 0 0 ' + U + '" fill="none" stroke="rgba(80, 60, 90, 0.22)" stroke-width="0.8"/></pattern>' +
    '<pattern id="pg-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="#2E2233" stroke-width="1.4"/></pattern>' +
    '<marker id="pg-arrow" markerWidth="8" markerHeight="8" refX="5" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#503A6B"/></marker>' +
    "</defs>";
  /* hall floor and aisle */
  s += '<rect x="' + vb[0] + '" y="' + vb[1] + '" width="' + vb[2] + '" height="' + vb[3] + '" fill="url(#pg-fine)"/>';
  s += '<rect x="' + (-mL) + '" y="' + H + '" width="' + (W + mL + mR) + '" height="' + aisle + '" fill="rgba(255,255,255,0.35)"/>';
  s += '<text x="' + (W + mR - 10) + '" y="' + (H + aisle - 10) + '" text-anchor="end" class="pg-label">AISLE</text>';
  /* neighbour booths, sketched */
  s += '<rect x="' + (-mL) + '" y="0" width="' + (mL - 6) + '" height="' + H + '" fill="none" stroke="rgba(70, 46, 78, 0.25)" stroke-dasharray="4 3"/>';
  s += '<rect x="' + (W + 6) + '" y="0" width="' + (mR - 6) + '" height="' + H + '" fill="none" stroke="rgba(70, 46, 78, 0.25)" stroke-dasharray="4 3"/>';
  /* booth floor and walls */
  s += '<rect x="0" y="0" width="' + W + '" height="' + H + '" fill="#FBF8F2"/><rect x="0" y="0" width="' + W + '" height="' + H + '" fill="url(#pg-cell)"/>';
  if (plan.walls === false) {
    /* no walls: just the edge of the booth space */
    s += '<rect x="0" y="0" width="' + W + '" height="' + H + '" fill="none" stroke="#2E2233" stroke-width="1.4" stroke-dasharray="6 4"/>';
  } else {
    s += '<rect x="-6" y="-6" width="' + (W + 12) + '" height="6" fill="url(#pg-hatch)" stroke="#2E2233" stroke-width="1.2"/>';
    s += '<rect x="-6" y="0" width="6" height="' + H + '" fill="url(#pg-hatch)" stroke="#2E2233" stroke-width="1.2"/>';
    if (!PL.booth || PL.booth.open !== 2) { s += '<rect x="' + W + '" y="0" width="6" height="' + H + '" fill="url(#pg-hatch)" stroke="#2E2233" stroke-width="1.2"/>'; }
  }
  s += '<line x1="0" y1="' + H + '" x2="' + W + '" y2="' + H + '" stroke="#2E2233" stroke-width="1" stroke-dasharray="6 4"/>';
  /* dimensions */
  if (!opts.mini) {
    s += '<g class="pg-dim"><line x1="0" y1="' + (-0.55 * U) + '" x2="' + W + '" y2="' + (-0.55 * U) + '"/><line x1="0" y1="' + (-0.7 * U) + '" x2="0" y2="' + (-0.4 * U) + '"/><line x1="' + W + '" y1="' + (-0.7 * U) + '" x2="' + W + '" y2="' + (-0.4 * U) + '"/>' +
      '<text x="' + (W / 2) + '" y="' + (-0.62 * U) + '" text-anchor="middle">' + (PL.W * PL.CELL_M).toFixed(1) + ' m</text></g>';
    s += '<g class="pg-dim"><line x1="' + (-0.55 * U) + '" y1="0" x2="' + (-0.55 * U) + '" y2="' + H + '"/><line x1="' + (-0.7 * U) + '" y1="0" x2="' + (-0.4 * U) + '" y2="0"/><line x1="' + (-0.7 * U) + '" y1="' + H + '" x2="' + (-0.4 * U) + '" y2="' + H + '"/>' +
      '<text x="' + (-0.68 * U) + '" y="' + (H / 2) + '" text-anchor="middle" transform="rotate(-90 ' + (-0.68 * U) + " " + (H / 2) + ')">' + (PL.H * PL.CELL_M).toFixed(1) + ' m</text></g>';
  }
  /* power outlet on the back wall (only if this booth type has one) */
  if (!PL.booth || PL.booth.power) s += '<g transform="translate(' + (0.5 * U) + ',2)"><rect x="-7" y="-2" width="14" height="10" rx="2" fill="#E9BAA5" stroke="#2E2233" stroke-width="1"/><path d="M1,0 L-2,4 L1,4 L-1,7" stroke="#2E2233" stroke-width="1" fill="none"/></g>';
  /* items */
  plan.items.slice().sort(function (a, b) { return (PL.catalog[a.type].top ? 1 : 0) - (PL.catalog[b.type].top ? 1 : 0); }).forEach(function (it) {
    var c = PL.catalog[it.type], bw = c.w * U, bh = c.h * U, sz = PL.size(it.type, it.r);
    var cx = (it.x + sz.w / 2) * U, cy = (it.y + sz.h / 2) * U;
    s += '<g class="pg-obj' + (it.id === opts.sel ? " is-sel" : "") + '" data-obj="' + it.id + '" transform="translate(' + cx + "," + cy + ") rotate(" + (it.r * 90) + ") translate(" + (-bw / 2) + "," + (-bh / 2) + ')">' +
      '<title>' + c.label + "</title>" + PL.symbol(it.type, bw, bh, it) +
      (it.id === opts.sel ? '<rect class="pg-sel" x="-4" y="-4" width="' + (bw + 8) + '" height="' + (bh + 8) + '" rx="5"/>' : "") + "</g>";
  });
  /* queue */
  var path = PL.path(plan), pts = path.map(function (p) { return (p.x * U) + "," + (p.y * U); }).join(" ");
  s += '<polyline points="' + pts + '" fill="none" stroke="#503A6B" stroke-width="3" stroke-dasharray="7 5" stroke-linecap="round" marker-end="url(#pg-arrow)"/>';
  s += '<g class="pg-queue' + (opts.sel === "queue" ? " is-sel" : "") + '" data-queue="1" transform="translate(' + (path[0].x * U) + "," + (path[0].y * U) + ')"><title>Queue start, drag to move</title><circle r="11" fill="#503A6B" stroke="#fff" stroke-width="2.5"/><circle r="3.5" fill="#fff"/></g>';
  if (!opts.mini) { s += '<circle class="pg-walker" id="pg-walker" r="8" cx="-999" cy="-999"/>'; }
  return s + "</svg>";
};

/* ---------- Suggested set-ups: see PL.TEMPLATES (they follow the booth size) ---------- */
PL.SUGGEST = [];
PL.suggestPlan = function (sg) {
  return { items: sg.plan.items.map(function (it, i) { return { id: 100 + i, type: it.type, x: it.x, y: it.y, r: it.r }; }), queue: { sx: sg.plan.queue.sx, target: 0 } };
};

/* ---------- People and what they do ---------- */
PL.ACTIONS = [
  { id: "walk", label: "Walk around", icon: "walk" },
  { id: "stand", label: "Standing", icon: "user" },
  { id: "cook", label: "Cooking", icon: "flame", at: ["cooker", "oven", "ricecooker"] },
  { id: "wash", label: "Washing", icon: "drop", at: ["sink"] },
  { id: "coffee", label: "Making coffee", icon: "cup", at: ["coffee"] },
  { id: "cashier", label: "Cashier", icon: "card", at: ["cashier"] }
];
PL.action = function (id) { return PL.ACTIONS.filter(function (a) { return a.id === id; })[0]; };
PL.people = function (plan) { return plan.items.filter(function (it) { return PL.catalog[it.type].person; }); };
PL.personName = function (it) { return it.name || (it.role === "owner" ? "Business owner" : "Helper"); };
