/* =========================================================
   Sample data for the prototype (all hard-coded).
   To use a real photo, change the "image" path of an event.
   ========================================================= */

var BB_TODAY = "2026-10-15";

var BB_USER = {
  name: "Rachel Tan",
  initials: "RT",
  business: "Rachel's Home Bakery",
  category: "fnb",
  badge: "Expert",
  badgeLevel: "Expert",
  nextTier: "Verified",
  points: 340,
  nextPoints: 500
};

/* cardPhoto = venue picture shared by Find Events cards and the event detail hero.
   photo = older picture, used only if cardPhoto is missing.
   gallery = the three venue photos under Crowd and getting there.
   If a photo cannot load, the illustration in "image" shows instead.
   color = the event's colour variable, used for dots and chips everywhere */
var BB_EVENTS = [
  {
    id: 1,
    name: "Clementi Mall Atrium Pop-Up",
    short: "Clementi Mall",
    color: "var(--ev-1)",
    dates: "6 to 8 Nov 2026",
    venue: "Clementi Mall, L1 Atrium",
    area: "West",
    cats: ["fnb", "workshop", "retail"],
    fee: 250,
    footfall: 4500,
    mix: { fnb: 45, workshop: 15, retail: 40 },
    tags: [{ t: "Great briefing", good: true }, { t: "Good footfall", good: true }],
    closes: "2026-10-21",
    status: "Accepted",
    visited: false,
    geo: { lat: 1.3150, lng: 103.7649, q: "Clementi Mall, Singapore" },
    map: { x: 24, y: 52 },
    image: "images/event-1.svg",
    photo: "images/photos/event-1-hero.jpg",
    cardPhoto: "images/photos/event-1-venue.jpg",
    gallery: ["images/photos/event-1-a.jpg", "images/photos/event-1-b.jpg", "images/photos/event-1-c.jpg"]
  },
  {
    id: 2,
    name: "Toa Payoh HDB Hub Bazaar",
    short: "Toa Payoh",
    color: "var(--ev-2)",
    dates: "14 to 15 Nov 2026",
    venue: "HDB Hub, Toa Payoh",
    area: "Central",
    cats: ["fnb", "retail", "workshop"],
    fee: 180,
    footfall: 6200,
    mix: { fnb: 60, workshop: 5, retail: 35 },
    tags: [{ t: "Busy all day", good: true }, { t: "Low power outlets", good: false }],
    closes: "2026-10-17",
    status: "Applied",
    visited: false,
    geo: { lat: 1.3326, lng: 103.8478, q: "HDB Hub, Toa Payoh, Singapore" },
    map: { x: 52, y: 40 },
    image: "images/event-2.svg",
    photo: "images/photos/event-2-hero.jpg",
    cardPhoto: "images/photos/event-2-venue.jpg",
    gallery: ["images/photos/event-2-a.jpg", "images/photos/event-2-b.jpg", "images/photos/event-2-c.jpg"]
  },
  {
    id: 3,
    name: "Tampines Makers Fair",
    short: "Tampines",
    color: "var(--ev-3)",
    dates: "28 to 29 Nov 2026",
    venue: "Tampines Hub, Atrium",
    area: "East",
    cats: ["workshop", "retail", "fnb"],
    fee: 320,
    footfall: 3800,
    mix: { fnb: 15, workshop: 30, retail: 55 },
    tags: [{ t: "Right audience", good: true }, { t: "Strict category cap", good: true }],
    closes: "2026-10-19",
    status: "",
    visited: true,
    geo: { lat: 1.3530, lng: 103.9399, q: "Our Tampines Hub, Singapore" },
    map: { x: 82, y: 50 },
    image: "images/event-3.svg",
    photo: "images/photos/event-3-hero.jpg",
    cardPhoto: "images/photos/event-3-venue.jpg",
    gallery: ["images/photos/event-3-a.jpg", "images/photos/event-3-b.jpg", "images/photos/event-3-c.jpg"]
  },
  {
    id: 4,
    name: "Jurong East Weekend Market",
    short: "Jurong East",
    color: "var(--ev-4)",
    dates: "21 to 22 Nov 2026",
    venue: "JEM Open Plaza, Jurong East",
    area: "West",
    cats: ["fnb", "retail", "workshop"],
    fee: 120,
    footfall: 2900,
    mix: { fnb: 70, workshop: 10, retail: 20 },
    tags: [{ t: "F&B heavy", good: false }, { t: "Cheap fee", good: true }],
    closes: "2026-10-18",
    status: "",
    visited: true,
    geo: { lat: 1.3333, lng: 103.7432, q: "JEM, Jurong East, Singapore" },
    map: { x: 10, y: 34 },
    image: "images/event-4.svg",
    photo: "images/photos/event-4-hero.jpg",
    cardPhoto: "images/photos/event-4-venue.jpg",
    gallery: ["images/photos/event-4-a.jpg", "images/photos/event-4-b.jpg", "images/photos/event-4-c.jpg"]
  },
  {
    id: 5,
    name: "Chinatown Heritage Fest",
    short: "Chinatown",
    color: "var(--ev-5)",
    dates: "5 to 6 Dec 2026",
    venue: "Pagoda Street, Chinatown",
    area: "Central",
    cats: ["fnb", "workshop", "retail"],
    fee: 400,
    footfall: 9000,
    mix: { fnb: 45, workshop: 10, retail: 45 },
    tags: [{ t: "Huge crowds", good: true }, { t: "Cancelled late", good: false }],
    closes: "2026-10-30",
    status: "",
    visited: false,
    geo: { lat: 1.2839, lng: 103.8443, q: "Pagoda Street, Chinatown, Singapore" },
    map: { x: 58, y: 70 },
    image: "images/event-5.svg",
    photo: "images/photos/event-5-hero.jpg",
    cardPhoto: "images/photos/event-5-venue.jpg",
    gallery: ["images/photos/event-5-a.jpg", "images/photos/event-5-b.jpg", "images/photos/event-5-c.jpg"]
  },
  {
    id: 6,
    name: "Bishan Community Fair",
    short: "Bishan",
    color: "var(--ev-6)",
    dates: "12 to 13 Dec 2026",
    venue: "Bishan CC Hall",
    area: "Central",
    cats: ["fnb", "workshop", "retail"],
    fee: 150,
    footfall: 3200,
    mix: null,
    tags: [],
    closes: "2026-11-10",
    status: "",
    visited: false,
    geo: { lat: 1.3509, lng: 103.8484, q: "Bishan Community Club, Singapore" },
    map: { x: 44, y: 22 },
    image: "images/event-6.svg",
    photo: "images/photos/event-6-hero.jpg",
    cardPhoto: "images/photos/event-6-venue.jpg",
    gallery: ["images/photos/event-6-a.jpg", "images/photos/event-6-b.jpg", "images/photos/event-6-c.jpg"]
  }
];

/* Deadlines. "link" is the page the deadline opens. "auto" = created by the app. */
var BB_DEADLINES = [
  { id: 1, title: "Upload Halal certificate", date: "2026-10-15", from: "09:00", to: "18:00", eventId: 1, link: "apply.html?event=1", auto: true },
  { id: 2, title: "Bulk Buy closes: 25kg flour pool", date: "2026-10-17", from: "18:00", to: "20:00", eventId: 0, link: "community.html", auto: true },
  { id: 3, title: "Application closes: Tampines Makers Fair", date: "2026-10-19", from: "12:00", to: "23:59", eventId: 3, link: "find-events.html", auto: true },
  { id: 4, title: "Submit layout plan for Clementi slot", date: "2026-10-21", from: "14:00", to: "16:00", eventId: 1, link: "my-events.html", auto: false },
  { id: 5, title: "Toa Payoh result expected", date: "2026-10-24", from: "10:00", to: "12:00", eventId: 2, link: "my-events.html", auto: true },
  { id: 6, title: "Pay Clementi booth fee", date: "2026-11-03", from: "09:00", to: "18:00", eventId: 1, link: "my-events.html", auto: false },
  { id: 7, title: "Plan Toa Payoh booth layout", date: "2026-10-28", from: "20:00", to: "21:00", eventId: 2, link: "booth-planner.html?event=2", auto: false },
  { id: 8, title: "Pay Toa Payoh booth fee", date: "2026-11-02", from: "09:00", to: "18:00", eventId: 2, link: "my-events.html", auto: true },
  { id: 9, title: "Order packaging for Toa Payoh", date: "2026-11-06", from: "10:00", to: "11:00", eventId: 2, link: "community.html", auto: false },
  { id: 10, title: "Toa Payoh load-in", date: "2026-11-13", from: "19:00", to: "22:00", eventId: 2, link: "event-detail.html?event=2", auto: true }
];

var BB_NOTICES_MINE = [
  { unread: true, icon: "check", text: "Your application was accepted.", event: 1, time: "2h ago", action: "View event", link: "my-events.html" },
  { unread: true, icon: "sync", text: "The organiser changed the delivery date of the flour Bulk Buy you joined.", event: 0, time: "5h ago", action: "Review", link: "community.html" },
  { unread: false, icon: "check", text: "Application submitted.", event: 2, time: "1d ago", action: "", link: "" },
  { unread: false, icon: "clock", text: "Reminder: upload your Halal certificate today.", event: 1, time: "1d ago", action: "Upload", link: "apply.html?event=1" }
];

var BB_NOTICES_COMMUNITY = [
  { unread: true, initials: "DL", text: "Daniel Lim posted a Bulk Buy: Butter 10kg pool.", time: "30m ago", action: "Join", link: "community.html" },
  { unread: true, initials: "MW", text: "Mei Wong started following you.", time: "3h ago", action: "Follow back", link: "" },
  { unread: false, initials: "PR", text: "Priya replied to your post about venue power.", time: "1d ago", action: "", link: "" },
  { unread: false, initials: "5", text: "Your Clementi review got 5 Helpful votes.", time: "2d ago", action: "", link: "" }
];

var BB_CONVOS = [
  { initials: "DL", name: "Daniel Lim", last: "Can I change my quantity to 3 bags?", time: "10m", unread: true },
  { initials: "MW", name: "Mei Wong", last: "Thanks for the supplier tip!", time: "2h", unread: false },
  { initials: "PR", name: "Priya Nair", last: "Is the loading dock open at 8am?", time: "1d", unread: false }
];

/* Google Maps: paste a Maps JavaScript API key here for the full interactive map with every pin.
   Leave it empty and the app uses the free Google Maps embed instead (no key needed). */
var BB_MAPS_KEY = "";

/* Booth categories */
var BB_CATS = {
  fnb: { label: "F&B", long: "Food and beverage", icon: "utensils", color: "var(--accent)" },
  workshop: { label: "Workshop", long: "Workshops and classes", icon: "sparkle", color: "var(--lavender)" },
  retail: { label: "Retail", long: "Retail and products", icon: "tag", color: "var(--accent-2)" }
};

/* Booth types, like a real organiser's booking page (system panel booths, 2.5 m high).
   cat = which seller category can book it. mult = price relative to the event's base booth fee.
   open = 1 (front only) or 2 (corner: front and right side open).
   power = sockets on the back wall (retail and workshop booths have none). table in metres (tw x td). */
var BB_BOOTH_TYPES = [
  { id: "retail-corner",  cat: "retail",   label: "Retail (Corner)",  w: 2, d: 2, h: 2.5, mult: 1.1,  open: 2, note: "Corner booth, two open sides", chairs: 2, table: "4ft x 2ft", tw: 1.2, td: 0.6, power: [], sink: false, water: false },
  { id: "retail-regular", cat: "retail",   label: "Retail (Regular)", w: 2, d: 2, h: 2.5, mult: 1,    open: 1, note: "Along the main aisle",       chairs: 2, table: "4ft x 2ft", tw: 1.2, td: 0.6, power: [], sink: false, water: false },
  { id: "fnb-prime",      cat: "fnb",      label: "F&B (Prime)",      w: 3, d: 3, h: 2.5, mult: 2,    open: 1, note: "Facing the main entrance",  chairs: 2, table: "4ft x 2ft", tw: 1.2, td: 0.6, power: ["13A", "15A"], sink: true, water: true },
  { id: "fnb-corner",     cat: "fnb",      label: "F&B (Corner)",     w: 3, d: 3, h: 2.5, mult: 1.8,  open: 2, note: "Corner booth, two open sides", chairs: 2, table: "4ft x 2ft", tw: 1.2, td: 0.6, power: ["13A", "15A"], sink: true, water: true },
  { id: "fnb-regular",    cat: "fnb",      label: "F&B (Regular)",    w: 3, d: 2, h: 2.5, mult: 1.5,  open: 1, note: "Along the food row",         chairs: 2, table: "4ft x 2ft", tw: 1.2, td: 0.6, power: ["13A"], sink: true, water: true },
  { id: "workshop",       cat: "workshop", label: "Workshop booth",   w: 3, d: 2, h: 2.5, mult: 1.6,  open: 1, note: "Quiet zone, room for a class", chairs: 4, table: "6ft x 2.5ft", tw: 1.8, td: 0.75, power: [], sink: false, water: false }
];

var BB_COLORS = ["", "var(--ev-1)", "var(--ev-2)", "var(--ev-3)", "var(--ev-4)", "var(--ev-5)", "var(--ev-6)"];
