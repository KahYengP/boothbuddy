/* =========================================================
   Extra sample data: event details, document vault, community.
   ========================================================= */

/* Documents Rachel has in her vault. expires = date or "" (no expiry) */
var BB_VAULT_DEFAULT = [
  { id: "acra", name: "Business registration (ACRA)", uploaded: true, expires: "" },
  { id: "nea", name: "NEA food shop licence", uploaded: true, expires: "2026-12-31" },
  { id: "halal", name: "Halal certificate", uploaded: true, expires: "2026-10-27" },
  { id: "insurance", name: "Public liability insurance", uploaded: true, expires: "2026-09-30" },
  { id: "menu", name: "Product and price list", uploaded: false, expires: "" },
  { id: "layout", name: "Booth layout plan", uploaded: false, expires: "" }
];

var BB_DOC_NAMES = { acra: "Business registration (ACRA)", nea: "NEA food shop licence", halal: "Halal certificate", insurance: "Public liability insurance", menu: "Product and price list", layout: "Booth layout plan" };

/* individual booth slots are no longer picked; sellers choose a booth type instead */
function bbSlots() { return []; }

var BB_DETAILS = {
  1: {
    about: "Three days inside Clementi Mall's main atrium. Air-conditioned, steady lunch and after-work crowds, and a dedicated vendor lift.",
    organiser: "Clementi Mall Events", email: "events@clementimall.sg", loadIn: "Fri 5 Nov, 6pm to 9pm", setupBy: "Sat 6 Nov, 9am",
    power: "1 outlet per 2 booths", table: "Provided, 1.8m", weather: "Indoor",
    peak: "12pm to 3pm, 6pm to 8pm", booths: 60,
    required: ["acra", "nea", "halal", "insurance", "menu", "layout"],
    slots: bbSlots(0),
    reviews: [
      { who: "Daniel Lim", badge: "Expert", stars: 5, date: "Nov 2025", text: "Briefing was clear and the loading lift saved us. Sold out of brownies by 2pm on Saturday.", tags: ["Great briefing", "Good footfall"], helpful: 14 },
      { who: "Mei Wong", badge: "Verified", stars: 4, date: "Nov 2025", text: "Good crowd but only two outlets for the whole row. Bring your own extension cord.", tags: ["Low power outlets"], helpful: 9 }
    ],
    tips: ["Bring an extension cord. Outlets are shared by two booths.", "Use the service lift behind Daiso, not the escalator.", "Security locks the atrium at 10pm. Pack down before then."]
  },
  2: {
    about: "A two-day community bazaar in the HDB Hub concourse. Very busy, shorter setup window.",
    organiser: "HDB Hub Management", email: "bazaar@hdbhub.sg", loadIn: "Fri 13 Nov, 7pm to 10pm", setupBy: "Sat 14 Nov, 8am",
    power: "Limited. About 1 outlet per 4 booths", table: "Bring your own", weather: "Indoor",
    peak: "11am to 4pm", booths: 80,
    required: ["acra", "nea", "halal", "insurance"],
    slots: bbSlots(2),
    reviews: [
      { who: "Priya Nair", badge: "Expert", stars: 4, date: "Oct 2025", text: "Crowds never stop. We ran out of change, so bring plenty of small notes.", tags: ["Busy all day"], helpful: 11 },
      { who: "Alan Goh", badge: "Beginner", stars: 3, date: "Oct 2025", text: "Barely any outlets. Battery fans only.", tags: ["Low power outlets"], helpful: 7 }
    ],
    tips: ["Bring your own table and cloth.", "Outlets run out fast. Ask for one at the briefing.", "Loading bay is behind Block 480, not the main entrance."]
  },
  3: {
    about: "Makers fair at Tampines Hub for retail and workshop sellers. F&B is capped, so the crowd browses slowly and buys handmade.",
    organiser: "Tampines Arts Collective", email: "hello@tampinesarts.sg", loadIn: "Fri 27 Nov, 5pm to 8pm", setupBy: "Sat 28 Nov, 9am",
    power: "1 outlet per booth", table: "Provided, 1.5m", weather: "Indoor",
    peak: "1pm to 5pm", booths: 50,
    required: ["acra", "insurance", "layout"],
    slots: bbSlots(1),
    reviews: [
      { who: "Mei Wong", badge: "Verified", stars: 5, date: "Dec 2025", text: "Right audience for handmade items. Food stalls were kept to the edge.", tags: ["Right audience", "Strict category cap"], helpful: 16 }
    ],
    tips: ["F&B vendors are capped at 15%, so check your category early.", "Natural light is strong at 3pm. Use your own spotlight."]
  },
  4: {
    about: "Open-air weekend market at JEM Plaza. F&B-heavy and relaxed, with a low booth fee.",
    organiser: "JEM Community Events", email: "community@jem.sg", loadIn: "Sat 21 Nov, 6am to 8am", setupBy: "Sat 21 Nov, 8am",
    power: "Generator power, 2 per row", table: "Bring your own", weather: "Open air, tents provided",
    peak: "10am to 1pm", booths: 40,
    required: ["acra", "nea", "halal"],
    slots: bbSlots(3),
    reviews: [
      { who: "Daniel Lim", badge: "Expert", stars: 4, date: "Sep 2025", text: "Cheap and cheerful. Too many bubble tea stalls, but people still queued for baked goods.", tags: ["Food heavy", "Cheap fee"], helpful: 8 }
    ],
    tips: ["Tents are provided, but bring weights for the legs.", "Arrive by 6am. The loading lane closes at 8."]
  },
  5: {
    about: "Heritage festival along Pagoda Street. The biggest crowds of the season, with a larger setup and strict street rules.",
    organiser: "Chinatown Business Association", email: "festival@chinatownba.sg", loadIn: "Fri 4 Dec, 8pm to 11pm", setupBy: "Sat 5 Dec, 7am",
    power: "Shared street power, 1 per 5 booths", table: "Bring your own", weather: "Open air, rain risk",
    peak: "5pm to 10pm", booths: 120,
    required: ["acra", "nea", "halal", "insurance", "menu"],
    slots: bbSlots(4),
    reviews: [
      { who: "Priya Nair", badge: "Expert", stars: 4, date: "Dec 2025", text: "Huge crowds, but the organiser cancelled one day at short notice because of rain.", tags: ["Huge crowds", "Cancelled late"], helpful: 12 }
    ],
    tips: ["Have a rain plan. Day 2 was called off with 5 hours notice last year.", "Street is closed to vehicles after 3pm. Load in early."]
  },
  6: {
    about: "A relaxed community fair in the Bishan CC hall. The organiser has not published vendor numbers yet.",
    organiser: "Bishan CC", email: "fair@bishancc.sg", loadIn: "Fri 11 Dec, 6pm to 9pm", setupBy: "Sat 12 Dec, 9am",
    power: "Not provided", table: "Not provided", weather: "Indoor",
    peak: "Not provided", booths: 35,
    required: ["acra", "nea", "insurance"],
    slots: bbSlots(5),
    reviews: [],
    tips: []
  }
};

/* Community */
var BB_PEOPLE = [
  { id: "daniel", name: "Daniel Lim", initials: "DL", biz: "Daniel's Brownies", badge: "Verified", verified: true, followers: 112 },
  { id: "mei", name: "Mei Wong", initials: "MW", biz: "Mei Makes Ceramics", badge: "Verified", verified: true, followers: 87 },
  { id: "priya", name: "Priya Nair", initials: "PR", biz: "Priya's Kueh", badge: "Expert", verified: false, followers: 64 },
  { id: "alan", name: "Alan Goh", initials: "AG", biz: "Alan's Candles", badge: "Beginner", verified: false, followers: 21 },
  { id: "rachel", name: "Rachel Tan", initials: "RT", biz: "Rachel's Home Bakery", badge: "Expert", verified: false, followers: 24 }
];

var BB_POSTS = [
  { id: 1, type: "bulk", author: "daniel", time: "30m ago", title: "Butter 10kg pool, delivery to Clementi MRT", text: "Supplier gives $4 off per block at 10kg. We have 7kg joined, need 3 more.", unit: "kg", have: 7, need: 10, closes: "2026-10-17", event: 0, helpful: 6, used: 2, replies: 3 },
  { id: 2, type: "sos", author: "mei", time: "1h ago", title: "Supplier SOS: need 3 gas cylinders by Friday", text: "My usual supplier ran out. Anyone near Jurong who can spare or share a delivery?", event: 4, helpful: 4, used: 0, replies: 5 },
  { id: 3, type: "review", author: "priya", time: "3h ago", title: "Toa Payoh HDB Hub Bazaar", text: "Crowds never stop. We ran out of change by noon.", event: 2, stars: 4, tags: ["Busy all day", "Low power outlets"], helpful: 11, used: 3, replies: 2 },
  { id: 4, type: "venue", author: "daniel", time: "5h ago", title: "Clementi atrium: use the lift behind Daiso", text: "Saves 20 minutes at load-in. Security does not stop you if you show the booth pass.", event: 1, helpful: 18, used: 9, replies: 4 },
  { id: 5, type: "supplier", author: "mei", time: "1d ago", title: "Cheaper flour at Sin Ming. Same brand as the supermarket", text: "A 25kg bag was $6 cheaper than the supermarket. They also deliver for orders over $100.", event: 0, helpful: 21, used: 12, replies: 6 },
  { id: 6, type: "swap", author: "alan", time: "1d ago", title: "Leftover swap: 20 small gift boxes for 10 cupcake liners", text: "Bought too many boxes for Tampines. Happy to swap near Bedok or Tampines.", event: 3, helpful: 3, used: 1, replies: 2 }
];

var BB_POST_TYPES = {
  supplier: { label: "Supplier Lead", icon: "tag" },
  bulk: { label: "Bulk Buy", icon: "users" },
  venue: { label: "Venue Tip", icon: "pin" },
  swap: { label: "Leftover Swap", icon: "sync" },
  review: { label: "Review card", icon: "award" },
  sos: { label: "Supplier SOS", icon: "bell" }
};

var BB_START = { 1: "2026-11-06", 2: "2026-11-14", 3: "2026-11-28", 4: "2026-11-21", 5: "2026-12-05", 6: "2026-12-12" };
