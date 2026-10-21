BoothBuddy high-fidelity prototype (plain HTML, CSS and JS)

Open find-events.html (or index.html) in a browser. No install needed.

Pages
- find-events.html     Search, filters, list or map, compare tray, add to deadlines
- event-detail.html    Hero, floor plan, required documents, drawer (documents, reviews, venue tips)
- compare.html         Up to 3 events side by side
- apply.html           3 steps: requirements, documents, review and submit
- my-events.html       Event rail, next event, booth planner preview, upcoming deadlines
- booth-planner.html   3D and 2D side by side (synced). Drag objects in either view or drag from the tray.
                       Tap an object for Rotate / Remove / Queue here. Tap or drag the Queue sign to edit the queue.
                       Sketch shows grid and line drawing. Pad and +/- move the camera. Keys: arrows move, R rotates, Delete removes.
- community.html       Feed, bulk buys, Supplier SOS, follow, badges

Edit
- Event data and photos: js/data.js (change the image path of an event)
- Details, documents, community posts: js/data-more.js
- Colours: top of css/styles.css (Muse palette: cream, peach, lavender, purple, plum)
- Each page has its own css/ and js/ file
- 3D uses js/vendor/three.min.js (bundled, works offline)

Demo state is saved in the browser. To reset it, clear this site's storage.

Brand
- Logo: images/logo-black.png, logo-white.png, logo-purple.png (from the butterfly PNG), favicon.png
- Wordmark font: Comfortaa Bold, bundled in fonts/ (works offline)

Photos
- Each event has a "photo" in js/data.js that loads from the internet (loremflickr, free Flickr photos by keyword).
- Offline, or if a photo fails, the illustration in images/event-N.svg shows instead.
- To use your own photo, put it in images/ and set photo: "images/your-photo.jpg".

Google Maps
- Find Events (Map) and Event Detail (Location) use Google Maps. With no key, the free Google Maps embed shows the venue.
- For the full interactive map with every event pinned, put your Maps JavaScript API key in BB_MAPS_KEY at the bottom of js/data.js.

Categories and booths
- Categories: F&B, Workshop, Retail (BB_CATS in js/data.js).
- Booth types and prices: BB_BOOTH_TYPES in js/data.js. Premium (near the entrance) costs more.
