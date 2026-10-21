/* Booth Planner: the 3D objects.
   Every builder gets (group, width, depth, materials, options) and builds the object centred on 0,0,
   facing +z (the aisle). options.v picks one of three designs. options.bare leaves a table empty
   when the seller has placed their own things on top.
   Table-top objects are built with y = 0 at the table surface. */

/* ---------- small props ---------- */
BP.plant = function (g, x, y, z, s, P) {
  s = s || 1;
  BP.cy(g, 0.07 * s, 0.055 * s, 0.13 * s, P.pot, x, y + 0.065 * s, z);
  BP.sp(g, 0.075 * s, P.leaf, x, y + 0.2 * s, z, 1, 1.5, 1);
  BP.sp(g, 0.055 * s, P.leaf2, x - 0.05 * s, y + 0.16 * s, z + 0.02, 1, 1.3, 1);
};
BP.jar = function (g, x, y, z, fill, P) {
  BP.cy(g, 0.045, 0.045, 0.12, P.glass, x, y + 0.06, z, 16);
  BP.cy(g, 0.038, 0.038, 0.08, fill, x, y + 0.045, z, 16).userData.noEdge = true;
  BP.cy(g, 0.047, 0.047, 0.018, P.wood, x, y + 0.128, z, 16);
};
BP.goodsBox = function (g, x, y, z, m, P, s) { s = s || 1; BP.rb(g, 0.15 * s, 0.1 * s, 0.13 * s, 0.015, m, x, y + 0.05 * s, z); BP.rb(g, 0.153 * s, 0.02, 0.133 * s, 0.006, P.accent, x, y + 0.05 * s, z).userData.noEdge = true; };
BP.loaf = function (g, x, y, z, P) { BP.sp(g, 0.06, P.bread, x, y + 0.035, z, 1.6, 0.7, 0.95); };
BP.cupcake = function (g, x, y, z, m, P) { BP.cy(g, 0.026, 0.02, 0.035, P.kraft, x, y + 0.018, z, 12).userData.noEdge = true; BP.sp(g, 0.029, m, x, y + 0.045, z, 1, 0.85, 1); };
BP.cake = function (g, x, y, z, r, m, P) { BP.cy(g, r, r, r * 0.8, m, x, y + r * 0.4, z, 28); BP.cy(g, r * 1.02, r * 1.02, r * 0.14, P.cream, x, y + r * 0.8, z, 28); BP.sp(g, r * 0.16, P.red, x, y + r * 0.92, z); };
BP.tablet = function (g, x, y, z, P) {
  BP.cy(g, 0.012, 0.012, 0.13, P.metal, x, y + 0.065, z, 10);
  var tab = BP.rb(g, 0.24, 0.165, 0.012, 0.01, P.black, x, y + 0.15, z + 0.01); tab.rotation.x = -0.4;
  var face = BP.rb(tab, 0.22, 0.145, 0.004, 0.002, P.screen, 0, 0, 0.005); face.castShadow = false;
};
BP.hemi = function (g, r, m, x, y, z) { var o = BP.mesh(new THREE.SphereGeometry(r, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), m, x, y, z, g); o.userData.noEdge = true; return o; };

/* ---------- furniture ---------- */
BP.build = {
  table: function (g, bw, bd, P, o) {
    var top;
    if (o.v === 1) { /* round pedestal table */
      var r = bw / 2 - 0.04;
      BP.cy(g, 0.22, 0.24, 0.03, P.accent, 0, 0.015, 0, 32);
      BP.cy(g, 0.045, 0.05, 0.7, P.body, 0, 0.38, 0, 20);
      BP.cy(g, r, r, 0.035, P.wood, 0, 0.7425, 0, 48);
      if (!o.bare) { top = 0.76; BP.cake(g, 0, top, 0, 0.1, P.peach, P); BP.cupcake(g, 0.22, top, 0.1, P.lav, P); BP.cupcake(g, 0.28, top, -0.02, P.cream, P); BP.plant(g, -0.24, top, -0.12, 0.9, P); }
      return;
    }
    if (o.v === 2) { /* square table with a cloth runner */
      var s = bw - 0.06;
      [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (k) { BP.rb(g, 0.04, 0.73, 0.04, 0.012, P.accent, k[0] * (s / 2 - 0.06), 0.365, k[1] * (s / 2 - 0.06)); });
      BP.rb(g, s, 0.03, s, 0.012, P.wood, 0, 0.745, 0);
      BP.rb(g, s * 0.42, 0.006, s + 0.02, 0.003, P.body, 0, 0.763, 0);
      BP.rb(g, s * 0.42, 0.22, 0.006, 0.003, P.body, 0, 0.655, s / 2 + 0.012);
      BP.rb(g, s * 0.42, 0.22, 0.006, 0.003, P.body, 0, 0.655, -s / 2 - 0.012);
      if (!o.bare) { top = 0.766; BP.loaf(g, -0.25, top, 0.1, P); BP.loaf(g, -0.2, top, -0.15, P); BP.jar(g, 0.25, top, -0.1, P.peach, P); BP.plant(g, 0.22, top, 0.18, 0.85, P); }
      return;
    }
    /* long counter */
    BP.rb(g, bw - 0.16, 0.08, bd - 0.14, 0.01, P.accent, 0, 0.04, 0);
    BP.rb(g, bw - 0.04, 0.8, bd - 0.04, 0.03, P.body, 0, 0.48, 0);
    BP.rb(g, bw + 0.02, 0.04, bd + 0.04, 0.015, P.wood, 0, 0.9, 0);
    BP.rb(g, 0.34, 0.66, 0.012, 0.004, P.fabric, 0, 0.5, bd / 2 - 0.012);
    if (o.bare) { return; }
    top = 0.92;
    BP.cy(g, 0.13, 0.13, 0.015, P.white, -bw / 2 + 0.28, top + 0.09, 0, 32); BP.cy(g, 0.02, 0.05, 0.09, P.white, -bw / 2 + 0.28, top + 0.045, 0, 16);
    BP.sp(g, 0.12, P.glass, -bw / 2 + 0.28, top + 0.1, 0, 1, 0.85, 1);
    [[0, P.peach], [0.09, P.cream], [-0.08, P.lav]].forEach(function (c, i) { BP.cupcake(g, -bw / 2 + 0.24 + c[0], top + 0.1, (i - 1) * 0.04, c[1], P); });
    BP.loaf(g, -0.05, top, -0.04, P); BP.loaf(g, 0.12, top, 0.05, P);
    BP.jar(g, bw / 2 - 0.36, top, -0.05, P.bread, P); BP.jar(g, bw / 2 - 0.24, top, 0.04, P.peach, P);
    BP.plant(g, bw / 2 - 0.1, top, -0.08, 0.9, P);
    var card = BP.rb(g, 0.1, 0.06, 0.006, 0.002, P.white, 0.3, top + 0.03, bd / 2 - 0.06); card.rotation.x = -0.3;
  },

  shelf: function (g, bw, bd, P, o) {
    var k, n, x0, st;
    if (o.v === 1) { /* glass cabinet */
      var H = 1.55, d = bd - 0.06, w = bw - 0.04;
      BP.rb(g, w, 0.1, d, 0.02, P.wood, 0, 0.05, 0);
      BP.rb(g, w, 0.06, d, 0.02, P.wood, 0, H - 0.03, 0);
      [-1, 1].forEach(function (s) { BP.rb(g, 0.035, H, d, 0.01, P.accent, s * (w / 2 - 0.0175), H / 2, 0); });
      BP.rb(g, w - 0.06, H - 0.16, 0.015, 0.005, P.body, 0, H / 2, -d / 2 + 0.01);
      BP.rb(g, w - 0.1, 0.012, 0.006, 0.002, P.glow, 0, H - 0.075, d / 2 - 0.06);
      var cols = [P.peach, P.lav, P.cream, P.mint];
      [0.42, 0.8, 1.16].forEach(function (y, i) {
        BP.rb(g, w - 0.08, 0.012, d - 0.06, 0.004, P.glass, 0, y, 0);
        for (k = 0; k < 4; k++) {
          var x = -w / 2 + 0.15 + k * (w - 0.3) / 3;
          if (i === 0) { BP.cake(g, x, y + 0.006, 0, 0.065, cols[k], P); } else if (i === 1) { BP.cupcake(g, x - 0.03, y + 0.006, 0, cols[k], P); BP.cupcake(g, x + 0.03, y + 0.006, 0.03, cols[(k + 1) % 4], P); } else { BP.goodsBox(g, x, y + 0.006, 0, cols[k], P, 0.8); }
        }
      });
      BP.rb(g, w - 0.05, H - 0.14, 0.01, 0.003, P.glass, 0, H / 2 + 0.01, d / 2 - 0.01);
      BP.rb(g, 0.012, 0.25, 0.02, 0.005, P.metal, 0.03, H / 2, d / 2 + 0.01);
      return;
    }
    if (o.v === 2) { /* tiered display steps */
      var dd = bd - 0.04, ww = bw - 0.04, steps = [[0.3, dd], [0.6, dd * 0.66], [0.9, dd * 0.34]];
      steps.forEach(function (sp, i) {
        var z = -dd / 2 + sp[1] / 2;
        BP.rb(g, ww, sp[0] - 0.03, sp[1], 0.02, P.body, 0, (sp[0] - 0.03) / 2, z);
        BP.rb(g, ww + 0.01, 0.03, sp[1] + 0.01, 0.012, P.wood, 0, sp[0] - 0.015, z);
        var gz = i < 2 ? -dd / 2 + (sp[1] + steps[i + 1][1]) / 2 : -dd / 2 + sp[1] / 2, y = sp[0];
        n = Math.max(3, Math.round(ww / 0.2)); x0 = -ww / 2 + 0.12; st = (ww - 0.24) / (n - 1);
        for (k = 0; k < n; k++) {
          if (i === 0) { BP.loaf(g, x0 + k * st, y, gz, P); }
          else if (i === 1) { BP.jar(g, x0 + k * st, y, gz, [P.bread, P.peach, P.lav][k % 3], P); }
          else if (k % 2 === 0) { BP.goodsBox(g, x0 + k * st, y, gz, [P.cream, P.mint][k % 2 ? 1 : 0], P); }
        }
        if (i === 2) { BP.plant(g, ww / 2 - 0.1, y, gz, 1, P); }
      });
      return;
    }
    /* open shelf */
    var SH = 1.7, sd = bd - 0.08;
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (s) { BP.rb(g, 0.024, SH, 0.024, 0.008, P.accent, s[0] * (bw / 2 - 0.03), SH / 2, s[1] * (sd / 2 - 0.012)); });
    BP.rb(g, bw - 0.08, SH - 0.1, 0.012, 0.004, P.body, 0, SH / 2, -sd / 2 + 0.02);
    var lv = [0.2, 0.6, 1.0, 1.4];
    lv.forEach(function (y) { BP.rb(g, bw - 0.03, 0.03, sd, 0.012, P.wood, 0, y, 0); });
    x0 = -bw / 2 + 0.14; n = Math.max(3, Math.round(bw / 0.17)); st = (bw - 0.28) / (n - 1);
    for (k = 0; k < n; k++) { BP.loaf(g, x0 + k * st, lv[0] + 0.015, 0.03, P); }
    for (k = 0; k < n; k++) { BP.jar(g, x0 + k * st, lv[1] + 0.015, 0.02, [P.bread, P.peach, P.lav][k % 3], P); }
    for (k = 0; k < n - 1; k++) { BP.goodsBox(g, x0 + 0.05 + k * st, lv[2] + 0.015, 0, [P.cream, P.white, P.mint][k % 3], P); }
    BP.plant(g, -bw / 2 + 0.16, lv[3] + 0.015, 0, 1.1, P);
    BP.goodsBox(g, bw / 2 - 0.2, lv[3] + 0.015, 0, P.fabric, P, 1.2);
  },

  cashier: function (g, bw, bd, P, o) {
    if (o.v === 1) { /* round kiosk */
      BP.cy(g, 0.2, 0.2, 0.04, P.accent, 0, 0.02, 0, 36);
      BP.cy(g, 0.21, 0.2, 0.9, P.body, 0, 0.49, 0, 36);
      BP.cy(g, 0.212, 0.212, 0.05, P.accent, 0, 0.78, 0, 36);
      BP.cy(g, 0.235, 0.235, 0.035, P.wood, 0, 0.955, 0, 36);
      BP.tablet(g, 0.02, 0.97, -0.05, P);
      return;
    }
    if (o.v === 2) { /* tablet on a stand */
      BP.cy(g, 0.15, 0.17, 0.03, P.body, 0, 0.015, 0, 32);
      BP.cy(g, 0.018, 0.018, 1.0, P.metal, 0, 0.52, 0, 12);
      BP.rb(g, 0.16, 0.015, 0.12, 0.006, P.wood, 0, 0.82, 0.05);
      BP.rb(g, 0.06, 0.02, 0.1, 0.008, P.black, 0, 0.84, 0.05);
      var tab = BP.rb(g, 0.26, 0.18, 0.014, 0.012, P.black, 0, 1.1, 0.01); tab.rotation.x = -0.35;
      BP.rb(tab, 0.24, 0.16, 0.004, 0.002, P.screen, 0, 0, 0.006).castShadow = false;
      return;
    }
    var w = bw - 0.04, d = bd - 0.04, H = 1.0;
    BP.rb(g, w - 0.06, 0.06, d - 0.06, 0.01, P.accent, 0, 0.03, 0);
    BP.rb(g, w, H - 0.08, d, 0.04, P.body, 0, 0.06 + (H - 0.08) / 2, 0);
    BP.rb(g, w + 0.03, 0.035, d + 0.03, 0.012, P.wood, 0, H, 0);
    BP.tablet(g, 0.02, H + 0.015, -0.06, P);
    BP.rb(g, 0.07, 0.02, 0.11, 0.008, P.black, -0.14, H + 0.03, 0.08);
  },

  chiller: function (g, bw, bd, P, o) {
    var w = bw - 0.04, d = bd - 0.04, cols = [P.peach, P.mint, P.lav, P.fabric], k, j;
    if (o.v === 1) { /* chest cooler with a glass lid */
      BP.rb(g, w, 0.78, d, 0.04, P.body, 0, 0.39, 0);
      BP.rb(g, w - 0.05, 0.02, d - 0.05, 0.008, P.fridgeIn, 0, 0.775, 0).userData.noEdge = true;
      for (k = 0; k < 3; k++) { for (j = 0; j < 3; j++) { BP.cy(g, 0.03, 0.03, 0.04, cols[(k + j) % 4], -0.13 + k * 0.13, 0.8, -0.13 + j * 0.13, 14).userData.noEdge = true; } }
      BP.rb(g, w - 0.02, 0.015, d - 0.02, 0.005, P.glass, 0, 0.83, 0);
      BP.rb(g, w * 0.7, 0.07, 0.006, 0.003, P.mint, 0, 0.55, d / 2 + 0.002);
      BP.rb(g, 0.16, 0.02, 0.03, 0.008, P.metal, 0, 0.74, d / 2 + 0.012);
      return;
    }
    if (o.v === 2) { /* ice tub on legs */
      for (k = 0; k < 3; k++) { var a = k * Math.PI * 2 / 3; var leg = BP.cy(g, 0.012, 0.014, 0.64, P.body, Math.cos(a) * 0.12, 0.32, Math.sin(a) * 0.12, 10); leg.rotation.z = Math.cos(a) * 0.12; leg.rotation.x = -Math.sin(a) * 0.12; }
      BP.cy(g, 0.21, 0.17, 0.25, P.metal, 0, 0.73, 0, 36);
      BP.cy(g, 0.195, 0.195, 0.02, P.white, 0, 0.84, 0, 36);
      [[0.08, 0.05], [-0.07, 0.08], [0, -0.09], [-0.1, -0.03], [0.1, -0.07]].forEach(function (p, i) {
        var b = BP.cy(g, 0.026, 0.026, 0.18, cols[i % 4], p[0], 0.9, p[1], 14); b.rotation.z = p[0] * 1.5; b.rotation.x = p[1] * 1.5;
      });
      return;
    }
    var H = 1.3;
    BP.rb(g, w, 0.12, d, 0.03, P.body, 0, 0.06, 0);
    BP.rb(g, w, 0.16, d, 0.03, P.body, 0, H - 0.08, 0);
    BP.rb(g, 0.04, H, d, 0.015, P.body, -w / 2 + 0.02, H / 2, 0);
    BP.rb(g, 0.04, H, d, 0.015, P.body, w / 2 - 0.02, H / 2, 0);
    BP.rb(g, w, H, 0.03, 0.01, P.body, 0, H / 2, -d / 2 + 0.015);
    BP.rb(g, w - 0.08, H - 0.3, d - 0.06, 0.01, P.fridgeIn, 0, H / 2 - 0.02, -0.01).userData.noEdge = true;
    BP.rb(g, w - 0.1, 0.02, 0.004, 0.002, P.glow, 0, H - 0.17, d / 2 - 0.02);
    [0.2, 0.5, 0.8].forEach(function (y, r) {
      BP.rb(g, w - 0.09, 0.01, d - 0.08, 0.004, P.glass, 0, y, 0);
      for (k = 0; k < 3; k++) { var x = -w / 2 + 0.1 + k * (w - 0.2) / 2; BP.cy(g, 0.03, 0.03, 0.16, cols[(k + r) % 4], x, y + 0.085, 0.01, 14).userData.noEdge = true; BP.cy(g, 0.012, 0.018, 0.05, cols[(k + r) % 4], x, y + 0.19, 0.01, 10).userData.noEdge = true; }
    });
    BP.rb(g, w - 0.03, H - 0.24, 0.012, 0.004, P.glass, 0, H / 2, d / 2);
    BP.rb(g, 0.018, 0.45, 0.03, 0.008, P.metal, w / 2 - 0.06, H / 2, d / 2 + 0.03);
  },

  banner: function (g, bw, bd, P, o) {
    if (o.v === 1) { /* A-frame chalk board */
      [1, -1].forEach(function (side) {
        var pn = new THREE.Group(); pn.position.set(0, 0.36, side * 0.1); pn.rotation.x = -side * 0.27; g.add(pn);
        BP.rb(pn, 0.42, 0.72, 0.025, 0.012, P.fabric, 0, 0, 0);
        BP.rb(pn, 0.35, 0.6, 0.008, 0.004, P.chalk, 0, 0.01, side * 0.014);
        [0.18, 0.08, -0.02, -0.12].forEach(function (y, i) { BP.rb(pn, i ? 0.2 : 0.26, 0.014, 0.003, 0.002, P.white, i ? -0.03 : 0, y, side * 0.019).userData.noEdge = true; });
      });
      return;
    }
    if (o.v === 2) { /* feather flag */
      BP.cy(g, 0.14, 0.16, 0.05, P.accent, 0, 0.025, 0, 28);
      BP.cy(g, 0.012, 0.012, 2.1, P.metal, 0, 1.07, 0, 10);
      var sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(0, 1.5); sh.quadraticCurveTo(0.44, 1.56, 0.42, 0.95); sh.lineTo(0.36, 0.15); sh.quadraticCurveTo(0.2, 0.02, 0, 0);
      var fl = BP.mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.006, bevelEnabled: false }), P.fabric, 0.014, 0.5, -0.003, g); fl.rotation.y = -0.25;
      var dot = BP.cy(g, 0.08, 0.08, 0.004, P.white, 0.2, 1.55, 0.06, 24); dot.rotation.x = Math.PI / 2; dot.rotation.z = 0.25;
      BP.rb(g, 0.2, 0.03, 0.004, 0.002, P.white, 0.2, 1.3, 0.06).rotation.y = -0.25;
      return;
    }
    var w = bw * 0.8;
    BP.rb(g, w + 0.04, 0.06, 0.2, 0.03, P.accent, 0, 0.03, 0);
    BP.cy(g, 0.008, 0.008, 1.95, P.metal, 0, 1.0, -0.04, 8);
    BP.mesh(new THREE.BoxGeometry(w, 1.82, 0.006), [P.white, P.white, P.white, P.white, P.banner, P.white], 0, 1.0, 0, g);
    if (P.fabric !== BP.M.fabric) { BP.rb(g, w, 0.22, 0.008, 0.003, P.fabric, 0, 0.22, 0.004); }
    BP.rb(g, w + 0.01, 0.025, 0.02, 0.008, P.accent, 0, 1.93, 0);
  },

  storage: function (g, bw, bd, P, o) {
    if (o.v === 1) { /* stacked plastic crates */
      var crate = function (x, y, ry) {
        var c = new THREE.Group(); c.position.set(x, y, 0); c.rotation.y = ry || 0; g.add(c);
        BP.rb(c, 0.44, 0.27, bd - 0.08, 0.03, P.crate, 0, 0.135, 0);
        BP.rb(c, 0.4, 0.012, bd - 0.12, 0.004, P.black, 0, 0.268, 0).userData.noEdge = true;
        BP.rb(c, 0.12, 0.035, 0.004, 0.012, P.black, 0, 0.21, (bd - 0.08) / 2 + 0.001).userData.noEdge = true;
      };
      crate(-bw / 4 + 0.01, 0); crate(bw / 4 - 0.01, 0); crate(-bw / 4 + 0.05, 0.28, 0.08);
      BP.loaf(g, -bw / 4 + 0.02, 0.54, 0.02, P); BP.loaf(g, -bw / 4 + 0.1, 0.54, -0.05, P);
      return;
    }
    if (o.v === 2) { /* rolling cart, its top is a work surface */
      var w = bw - 0.06, d = bd - 0.06;
      [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (k) {
        BP.cy(g, 0.012, 0.012, 0.74, P.metal, k[0] * (w / 2 - 0.03), 0.43, k[1] * (d / 2 - 0.03), 10);
        var wh = BP.cy(g, 0.035, 0.035, 0.025, P.black, k[0] * (w / 2 - 0.03), 0.035, k[1] * (d / 2 - 0.03), 16); wh.rotation.x = Math.PI / 2;
      });
      BP.rb(g, w, 0.04, d, 0.015, P.body, 0, 0.8, 0);
      BP.rb(g, w, 0.03, d, 0.012, P.body, 0, 0.24, 0);
      BP.goodsBox(g, -0.2, 0.255, 0, P.cream, P, 1.2); BP.goodsBox(g, 0.05, 0.255, 0, P.kraft, P, 1.2);
      BP.rb(g, 0.04, 0.03, d * 0.7, 0.012, P.accent, w / 2 + 0.03, 0.86, 0);
      if (!o.bare) { BP.cy(g, 0.13, 0.11, 0.08, P.kraft, -0.15, 0.86, 0, 24); BP.loaf(g, -0.17, 0.88, 0, P); BP.loaf(g, -0.12, 0.89, 0.04, P); }
      return;
    }
    BP.rb(g, 0.44, 0.36, bd - 0.08, 0.03, P.kraft, -bw / 4 + 0.01, 0.18, 0);
    BP.rb(g, 0.44, 0.36, bd - 0.08, 0.03, P.kraft, bw / 4 - 0.01, 0.18, 0);
    var tp = BP.rb(g, 0.4, 0.28, bd - 0.14, 0.03, P.kraft, -bw / 4 + 0.04, 0.5, 0.01); tp.rotation.y = 0.1;
    [-bw / 4 + 0.01, bw / 4 - 0.01].forEach(function (x) { BP.rb(g, 0.08, 0.365, bd - 0.075, 0.004, P.tape, x, 0.18, 0).userData.noEdge = true; });
  },

  chair: function (g, bw, bd, P, o) {
    if (o.v === 1) { /* folding chair */
      BP.rb(g, 0.38, 0.03, 0.36, 0.012, P.fabric, 0, 0.46, 0.02);
      BP.rb(g, 0.36, 0.24, 0.025, 0.012, P.fabric, 0, 0.8, -0.17);
      [[-1, 0.17, 0.45], [1, 0.17, 0.45], [-1, -0.17, 0.92], [1, -0.17, 0.92]].forEach(function (k) { BP.cy(g, 0.011, 0.011, k[2], P.accent, k[0] * 0.17, k[2] / 2, k[1], 8); });
      return;
    }
    if (o.v === 2) { /* low round stool */
      BP.cy(g, 0.16, 0.14, 0.36, P.wood, 0, 0.18, 0, 32);
      BP.sp(g, 0.165, P.fabric, 0, 0.37, 0, 1, 0.28, 1);
      return;
    }
    var H = 0.68;
    BP.cy(g, 0.17, 0.165, 0.05, P.fabric, 0, H, 0, 32);
    [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (s) {
      var leg = BP.cy(g, 0.011, 0.011, H, P.accent, s[0] * 0.12, H / 2, s[1] * 0.12, 8);
      leg.rotation.z = -s[0] * 0.08; leg.rotation.x = s[1] * 0.08;
    });
    var ring = new THREE.Mesh(new THREE.TorusGeometry(0.135, 0.008, 8, 36), P.accent); ring.rotation.x = Math.PI / 2; ring.position.y = 0.26; ring.castShadow = true; ring.userData.noEdge = true; g.add(ring);
  },

  sink: function (g, bw, bd, P, o) {
    if (o.v === 1) { /* basin on a stand */
      [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (k) { BP.cy(g, 0.012, 0.012, 0.78, P.metal, k[0] * 0.13, 0.39, k[1] * 0.13, 8); });
      BP.cy(g, 0.19, 0.12, 0.12, P.white, 0, 0.82, 0, 32);
      BP.cy(g, 0.165, 0.165, 0.01, P.water, 0, 0.865, 0, 32).userData.noEdge = true;
      BP.rb(g, 0.16, 0.3, 0.012, 0.004, P.fabric, 0.2, 0.68, 0).rotation.y = Math.PI / 2;
      BP.cy(g, 0.03, 0.03, 0.09, P.mint, -0.13, 0.33, 0.1, 14);
      return;
    }
    if (o.v === 2) { /* water dispenser with a bucket */
      BP.rb(g, 0.32, 0.72, 0.32, 0.03, P.body, 0, 0.36, -0.03);
      BP.cy(g, 0.13, 0.13, 0.3, P.glass, 0, 0.88, -0.03, 28);
      BP.cy(g, 0.12, 0.12, 0.24, P.water, 0, 0.86, -0.03, 28).userData.noEdge = true;
      BP.rb(g, 0.04, 0.05, 0.06, 0.012, P.accent, 0, 0.6, 0.15);
      BP.cy(g, 0.11, 0.09, 0.2, P.crate, 0.05, 0.1, 0.12, 24);
      return;
    }
    /* portable sink cabinet */
    BP.rb(g, bw - 0.06, 0.82, bd - 0.08, 0.03, P.body, 0, 0.41, 0);
    BP.rb(g, bw - 0.03, 0.04, bd - 0.05, 0.012, P.metal, 0, 0.84, 0);
    BP.rb(g, bw - 0.18, 0.012, bd - 0.2, 0.02, P.water, 0, 0.862, 0.02).userData.noEdge = true;
    BP.cy(g, 0.012, 0.012, 0.2, P.metal, 0, 0.96, -0.15, 10);
    BP.rb(g, 0.02, 0.02, 0.12, 0.008, P.metal, 0, 1.06, -0.1);
    BP.cy(g, 0.028, 0.028, 0.1, P.mint, 0.15, 0.91, -0.14, 14);
    BP.rb(g, 0.012, 0.18, 0.012, 0.004, P.accent, 0.12, 0.55, bd / 2 - 0.03);
  },

  /* a person in a soft, toy-like 3D style: big round head, simple face, tube arms with mitten hands,
     chunky trainers. o.it carries role, gender, skin and hair. Arms and legs are kept in a rig to animate. */
  person: function (g, bw, bd, P, o) {
    var it = o.it || {}, owner = it.role === "owner", fem = it.gender !== "male", v = o.v, S = BP.solid;
    var skin = S(BP.SKIN[it.skin === undefined ? 1 : it.skin], 0.65), hairM = S(BP.HAIR[(it.hair === undefined ? (it.id || 0) : it.hair) % BP.HAIR.length], 0.6);
    var main = P.main || S(owner ? "#7A5E94" : "#E58A5F", 0.85), white = S("#F8F4EE", 0.85);
    var tee = v === 0 ? main : white, pants = S(owner ? "#34405F" : "#9DBBDF", 0.85), shoe = S(owner ? "#3B3540" : "#F4F1EC", 0.55), sole = S("#FFFFFF", 0.6), dark = S("#2A2224", 0.45);
    var cap = function (p, r, len, m, x, y, z) { var c = new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 6, 16), m); c.position.set(x, y, z); c.castShadow = true; c.receiveShadow = true; c.userData.noEdge = true; p.add(c); return c; };
    var shell = function (p, r, m, phiS, phiL, thS, thL, x, y, z) {
      var mm = m.clone(); mm.side = THREE.DoubleSide;
      var sh = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 20, phiS, phiL, thS, thL), mm); sh.position.set(x, y, z); sh.castShadow = true; sh.userData.noEdge = true; p.add(sh); return sh;
    };
    /* legs and trainers */
    var leg = function (x) {
      var piv = new THREE.Group(); piv.position.set(x, 0.84, 0); g.add(piv);
      cap(piv, 0.068, 0.6, pants, 0, -0.37, 0);
      BP.cy(piv, 0.073, 0.07, 0.05, pants, 0, -0.71, 0, 18).userData.noEdge = true;
      BP.rb(piv, 0.125, 0.08, 0.23, 0.035, shoe, 0, -0.785, 0.035);
      BP.rb(piv, 0.13, 0.026, 0.235, 0.012, sole, 0, -0.826, 0.035).userData.noEdge = true;
      return piv;
    };
    var legL = leg(-0.08), legR = leg(0.08);
    BP.rb(g, 0.27, 0.16, 0.18, 0.07, pants, 0, 0.87, 0).userData.noEdge = true;
    /* body: a soft lathe shape, wider at the shoulders */
    var prof = [[0.001, 0.86], [0.12, 0.88], [0.128, 0.97], [fem ? 0.118 : 0.126, 1.07], [0.148, 1.22], [0.155, 1.3], [0.13, 1.37], [0.06, 1.41], [0.001, 1.42]].map(function (q) { return new THREE.Vector2(q[0], q[1]); });
    var torso = new THREE.Mesh(new THREE.LatheGeometry(prof, 28), tee); torso.scale.z = 0.74; torso.castShadow = true; torso.userData.noEdge = true; g.add(torso);
    if (v === 0) { /* apron */
      BP.rb(g, 0.22, 0.46, 0.018, 0.01, BP.M.apron, 0, 1.03, 0.098).userData.noEdge = true;
      BP.rb(g, 0.28, 0.03, 0.2, 0.012, BP.M.apron, 0, 0.98, 0).userData.noEdge = true;
      [-1, 1].forEach(function (k) { var st = BP.rb(g, 0.022, 0.16, 0.01, 0.004, BP.M.apron, k * 0.07, 1.31, 0.098); st.rotation.z = k * 0.35; st.userData.noEdge = true; });
      BP.rb(g, 0.1, 0.07, 0.008, 0.004, main, 0, 1.08, 0.108).userData.noEdge = true;
    }
    if (v === 1) { /* chef whites: buttons and a scarf */
      [1.27, 1.19, 1.11, 1.03].forEach(function (y) { BP.sp(g, 0.011, dark, 0.04, y, 0.105); BP.sp(g, 0.011, dark, -0.04, y, 0.105); });
      BP.cy(g, 0.075, 0.08, 0.04, main, 0, 1.4, 0.01, 20).userData.noEdge = true;
    }
    if (v === 2) { /* open vest over a white tee */
      [-1, 1].forEach(function (k) { var pn = BP.rb(g, 0.1, 0.38, 0.035, 0.016, main, k * 0.085, 1.13, 0.085); pn.rotation.y = -k * 0.25; pn.userData.noEdge = true; });
      BP.rb(g, 0.27, 0.38, 0.035, 0.016, main, 0, 1.13, -0.085).userData.noEdge = true;
      [-1, 1].forEach(function (k) { BP.rb(g, 0.09, 0.05, 0.19, 0.02, main, k * 0.1, 1.33, 0).userData.noEdge = true; });
    }
    BP.cy(g, 0.048, 0.052, 0.08, skin, 0, 1.43, 0, 16).userData.noEdge = true;
    /* head and face */
    var head = new THREE.Group(); head.position.y = 1.6; g.add(head);
    BP.sp(head, 0.14, skin, 0, 0, 0, 0.95, 1.06, 0.93);
    [-1, 1].forEach(function (k) { BP.sp(head, 0.032, skin, k * 0.13, -0.005, 0, 0.6, 1, 0.8); });
    BP.sp(head, 0.024, skin, 0, -0.012, 0.128, 1, 1, 1.25);
    [-1, 1].forEach(function (k) {
      BP.sp(head, 0.016, dark, k * 0.048, 0.02, 0.118, 0.8, 1.25, 0.5);
      var br = BP.rb(head, 0.046, 0.012, 0.012, 0.005, hairM, k * 0.05, 0.066, 0.122); br.rotation.z = -k * 0.12; br.userData.noEdge = true;
      BP.sp(head, 0.02, S("#F0A5A0", 0.8), k * 0.085, -0.035, 0.1, 1, 0.7, 0.4);
    });
    var smile = new THREE.Mesh(new THREE.TorusGeometry(0.026, 0.0055, 6, 14, Math.PI), S("#A8484A", 0.6)); smile.rotation.z = Math.PI; smile.position.set(0, -0.052, 0.121); head.add(smile);
    /* hair */
    if (fem) {
      shell(head, 0.148, hairM, 0, Math.PI * 2, 0, 1.2, 0, 0.012, -0.004);
      shell(head, 0.153, hairM, Math.PI - 0.35, Math.PI + 0.7, 0.55, (it.hair % 2 ? 1.25 : 1.8), 0, 0.005, -0.008).scale.x = 1.06;
      var fr = BP.sp(head, 0.07, hairM, 0.035, 0.085, 0.1, 1.3, 0.45, 0.6); fr.rotation.z = -0.35;
      if (it.hair % 2) { BP.sp(head, 0.068, hairM, 0, 0.12, -0.09); }
    } else {
      shell(head, 0.151, hairM, 0, Math.PI * 2, 0, 1.28, 0, 0.014, -0.008);
      shell(head, 0.153, hairM, Math.PI - 0.15, Math.PI + 0.3, 0.8, 0.85, 0, 0.005, -0.008);
      BP.sp(head, 0.07, hairM, 0.02, 0.12, 0.065, 1.45, 0.55, 1);
    }
    if (v === 1) { BP.cy(head, 0.105, 0.095, 0.1, white, 0, 0.17, -0.01, 24); BP.sp(head, 0.12, white, 0, 0.24, -0.01, 1, 0.55, 1); }
    /* arms with mitten hands */
    var arm = function (k) {
      var piv = new THREE.Group(); piv.position.set(k * 0.175, 1.32, 0); g.add(piv);
      cap(piv, 0.054, 0.15, v === 2 ? white : tee, 0, -0.11, 0);
      cap(piv, 0.044, 0.2, v === 1 ? white : skin, 0, -0.34, 0);
      BP.sp(piv, 0.052, skin, 0, -0.53, 0.005, 0.8, 1.15, 0.62);
      BP.sp(piv, 0.022, skin, -k * 0.035, -0.5, 0.025);
      return piv;
    };
    var armL = arm(-1), armR = arm(1);
    var hand = new THREE.Group(); hand.position.set(0, -0.55, 0.03); armR.add(hand);
    g.userData.rig = { legL: legL, legR: legR, armL: armL, armR: armR, torso: torso, head: head, hand: hand };
  },

  /* ---------- table-top objects (y = 0 is the table surface) ---------- */
  ricecooker: function (g, bw, bd, P, o) {
    var s = o.v === 2 ? 0.75 : 1, m = P.main || (o.v === 1 ? P.metal : (o.v === 2 ? P.peach : P.white));
    BP.cy(g, 0.12 * s, 0.11 * s, 0.16 * s, m, 0, 0.08 * s + 0.008, 0, 32);
    BP.cy(g, 0.1 * s, 0.1 * s, 0.01, P.black, 0, 0.005, 0, 24);
    BP.sp(g, 0.122 * s, m, 0, 0.165 * s, 0, 1, 0.42, 1);
    BP.rb(g, 0.07 * s, 0.025 * s, 0.03 * s, 0.01 * s, P.accent, 0, 0.22 * s, 0);
    BP.rb(g, 0.075 * s, 0.05 * s, 0.012, 0.005, o.v === 1 ? P.black : P.accent, 0, 0.09 * s, 0.112 * s);
    BP.sp(g, 0.007, P.glow, 0.02 * s, 0.1 * s, 0.12 * s);
  },
  cooker: function (g, bw, bd, P, o) {
    var m = P.main || P.black;
    if (o.v === 2) { /* griddle with pancakes */
      BP.rb(g, 0.4, 0.06, 0.34, 0.02, P.main || P.metal, 0, 0.03, 0);
      BP.rb(g, 0.36, 0.015, 0.28, 0.006, P.black, 0, 0.066, 0);
      [[-0.09, -0.06], [0.07, -0.06], [-0.08, 0.07], [0.08, 0.07]].forEach(function (p) { BP.cy(g, 0.05, 0.05, 0.012, P.bread, p[0], 0.08, p[1], 20); });
      BP.rb(g, 0.04, 0.02, 0.006, 0.003, P.glow, 0.14, 0.03, 0.172);
      return;
    }
    BP.rb(g, 0.34, 0.05, 0.38, 0.015, m, 0, 0.025, 0);
    var ring = new THREE.Mesh(new THREE.TorusGeometry(0.095, 0.005, 6, 36), P.hot); ring.rotation.x = Math.PI / 2; ring.position.set(0, 0.052, -0.02); ring.userData.noEdge = true; g.add(ring);
    BP.rb(g, 0.12, 0.012, 0.03, 0.004, P.glow, 0, 0.052, 0.15);
    if (o.v === 1) { /* frying pan */
      BP.cy(g, 0.11, 0.1, 0.03, P.black, 0, 0.068, -0.02, 32);
      BP.rb(g, 0.16, 0.015, 0.03, 0.007, P.wood, 0.19, 0.075, -0.02);
      BP.sp(g, 0.04, P.bread, -0.03, 0.08, -0.04, 1.2, 0.35, 1); BP.sp(g, 0.035, P.bread, 0.04, 0.08, 0.01, 1.2, 0.35, 1);
      return;
    }
    BP.cy(g, 0.1, 0.09, 0.11, P.metal, 0, 0.106, -0.02, 32);
    BP.cy(g, 0.102, 0.102, 0.012, P.metal, 0, 0.167, -0.02, 32);
    BP.sp(g, 0.016, P.black, 0, 0.18, -0.02);
    [-1, 1].forEach(function (k) { BP.rb(g, 0.04, 0.012, 0.02, 0.005, P.black, k * 0.115, 0.14, -0.02); });
  },
  oven: function (g, bw, bd, P, o) {
    if (o.v === 1) { /* air fryer */
      var m1 = P.main || P.black;
      BP.rb(g, 0.26, 0.32, 0.3, 0.1, m1, 0, 0.16, 0);
      BP.rb(g, 0.2, 0.13, 0.008, 0.02, P.accent, 0, 0.11, 0.15);
      BP.rb(g, 0.08, 0.03, 0.05, 0.012, P.metal, 0, 0.11, 0.175);
      var d = BP.cy(g, 0.03, 0.03, 0.004, P.glow, 0, 0.32, 0.04, 20); d.userData.noEdge = true;
      return;
    }
    if (o.v === 2) { /* microwave */
      BP.rb(g, 0.44, 0.26, 0.32, 0.02, P.main || P.white, 0, 0.13, 0);
      BP.rb(g, 0.27, 0.17, 0.006, 0.004, P.screen, -0.05, 0.13, 0.163);
      BP.rb(g, 0.08, 0.19, 0.006, 0.004, P.black, 0.15, 0.13, 0.163);
      BP.rb(g, 0.05, 0.015, 0.003, 0.002, P.glow, 0.15, 0.19, 0.167);
      return;
    }
    BP.rb(g, 0.4, 0.24, 0.3, 0.03, P.main || P.black, 0, 0.12, 0);
    BP.rb(g, 0.26, 0.15, 0.005, 0.004, P.glow, -0.05, 0.12, 0.148);
    BP.rb(g, 0.27, 0.16, 0.006, 0.004, P.glass, -0.05, 0.12, 0.153);
    BP.rb(g, 0.24, 0.015, 0.02, 0.007, P.metal, -0.05, 0.215, 0.168);
    [0.17, 0.09].forEach(function (y) { var k = BP.cy(g, 0.022, 0.022, 0.02, P.metal, 0.14, y, 0.158, 16); k.rotation.x = Math.PI / 2; });
  },
  coffee: function (g, bw, bd, P, o) {
    if (o.v === 1) { /* drip brewer */
      var m = P.main || P.black;
      BP.rb(g, 0.2, 0.03, 0.22, 0.01, m, 0, 0.015, 0);
      BP.rb(g, 0.2, 0.32, 0.1, 0.02, m, 0, 0.16, -0.06);
      BP.rb(g, 0.2, 0.06, 0.2, 0.02, m, 0, 0.3, 0);
      BP.cy(g, 0.065, 0.06, 0.13, P.glass, 0, 0.095, 0.04, 24);
      BP.cy(g, 0.058, 0.055, 0.06, P.coffee, 0, 0.06, 0.04, 24).userData.noEdge = true;
      BP.rb(g, 0.015, 0.08, 0.03, 0.006, P.black, 0.075, 0.1, 0.04);
      return;
    }
    if (o.v === 2) { /* kettle */
      var mk = P.main || P.white;
      BP.cy(g, 0.1, 0.1, 0.02, P.black, 0, 0.01, 0, 28);
      BP.cy(g, 0.075, 0.09, 0.18, mk, 0, 0.11, 0, 28);
      BP.sp(g, 0.076, mk, 0, 0.2, 0, 1, 0.35, 1);
      var sp = BP.cy(g, 0.012, 0.022, 0.1, mk, 0.1, 0.16, 0, 12); sp.rotation.z = -0.9;
      var hd = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.013, 8, 20, Math.PI), P.black); hd.rotation.z = Math.PI / 2; hd.position.set(-0.09, 0.12, 0); hd.castShadow = true; hd.userData.noEdge = true; g.add(hd);
      return;
    }
    /* espresso machine */
    BP.rb(g, 0.28, 0.3, 0.28, 0.03, P.main || P.metal, 0, 0.15, -0.02);
    BP.rb(g, 0.26, 0.015, 0.26, 0.005, P.black, 0, 0.307, -0.02);
    BP.cy(g, 0.025, 0.02, 0.035, P.white, -0.06, 0.33, -0.05, 14); BP.cy(g, 0.025, 0.02, 0.035, P.white, 0.03, 0.33, -0.06, 14);
    BP.cy(g, 0.04, 0.035, 0.05, P.black, 0, 0.2, 0.15, 18);
    BP.rb(g, 0.24, 0.02, 0.09, 0.006, P.black, 0, 0.01, 0.16);
    BP.cy(g, 0.032, 0.025, 0.05, P.white, 0, 0.045, 0.16, 16);
    var gauge = BP.cy(g, 0.03, 0.03, 0.006, P.white, 0.08, 0.24, 0.122, 18); gauge.rotation.x = Math.PI / 2;
  },
  cakestand: function (g, bw, bd, P, o) {
    var m = P.main || P.white, tiers;
    if (o.v === 0) {
      BP.cy(g, 0.07, 0.08, 0.015, m, 0, 0.0075, 0, 28);
      BP.cy(g, 0.015, 0.015, 0.09, m, 0, 0.06, 0, 12);
      BP.cy(g, 0.15, 0.15, 0.012, m, 0, 0.11, 0, 36);
      BP.cake(g, 0, 0.116, 0, 0.11, P.peach, P);
      BP.hemi(g, 0.15, P.glass, 0, 0.116, 0).scale.y = 1.25;
      return;
    }
    tiers = o.v === 1 ? [[0.02, 0.16], [0.17, 0.11]] : [[0.02, 0.17], [0.15, 0.13], [0.27, 0.09]];
    BP.cy(g, 0.01, 0.01, tiers[tiers.length - 1][0] + 0.06, P.metal, 0, (tiers[tiers.length - 1][0] + 0.06) / 2, 0, 10);
    BP.sp(g, 0.018, P.metal, 0, tiers[tiers.length - 1][0] + 0.07, 0);
    var cols = [P.peach, P.lav, P.cream, P.mint];
    tiers.forEach(function (t, i) {
      BP.cy(g, t[1], t[1], 0.01, m, 0, t[0], 0, 36);
      var n = Math.max(3, Math.round(t[1] * 40));
      for (var k = 0; k < n; k++) { var a = k / n * Math.PI * 2; BP.cupcake(g, Math.cos(a) * (t[1] - 0.04), t[0] + 0.005, Math.sin(a) * (t[1] - 0.04), cols[(k + i) % 4], P); }
    });
  },
  decor: function (g, bw, bd, P, o) {
    if (o.v === 1) { /* small menu board on an easel */
      var b = new THREE.Group(); b.position.set(0, 0.17, 0); b.rotation.x = -0.18; g.add(b);
      BP.rb(b, 0.26, 0.34, 0.014, 0.01, P.main || P.wood, 0, 0, 0);
      BP.rb(b, 0.22, 0.3, 0.006, 0.004, P.chalk, 0, 0, 0.009);
      [0.09, 0.04, -0.01, -0.06].forEach(function (y, i) { BP.rb(b, i ? 0.13 : 0.16, 0.01, 0.002, 0.001, P.white, i ? -0.015 : 0, y, 0.013).userData.noEdge = true; });
      var leg = BP.cy(g, 0.006, 0.006, 0.3, P.wood, 0, 0.14, -0.07, 8); leg.rotation.x = 0.4;
      return;
    }
    if (o.v === 2) { /* three succulent pots */
      [[-0.1, 0.03, 1], [0.04, -0.06, 1.15], [0.11, 0.08, 0.85]].forEach(function (p) {
        BP.cy(g, 0.05 * p[2], 0.04 * p[2], 0.07 * p[2], P.main || P.pot, p[0], 0.035 * p[2], p[1], 20);
        for (var k = 0; k < 5; k++) { var a = k / 5 * Math.PI * 2; BP.sp(g, 0.022 * p[2], k % 2 ? P.leaf : P.leaf2, p[0] + Math.cos(a) * 0.02 * p[2], 0.08 * p[2], p[1] + Math.sin(a) * 0.02 * p[2], 1, 1.4, 1); }
      });
      return;
    }
    /* flower vase */
    BP.cy(g, 0.045, 0.035, 0.18, P.main || P.glass, 0, 0.09, 0, 20);
    var fl = [P.peach, P.lav, P.cream, P.red, P.peach];
    [[0, 0], [0.04, 0.02], [-0.04, 0.02], [0.02, -0.04], [-0.03, -0.03]].forEach(function (p, i) {
      var st = BP.cy(g, 0.004, 0.004, 0.22, P.leaf, p[0] * 0.5, 0.25, p[1] * 0.5, 6); st.rotation.z = -p[0] * 3; st.rotation.x = p[1] * 3;
      BP.sp(g, 0.032, fl[i], p[0] * 1.6, 0.36 + (i % 2) * 0.02, p[1] * 1.6);
    });
  }
};

/* people: skin tones, hair colours, and a small cache of plain materials */
BP.SKIN = ["#F2CDB5", "#D9A584", "#8D5B3E"];
BP.HAIR = ["#3A2A24", "#6B4430", "#9A6A3C", "#1F1B1A"];
BP.solidCache = {};
BP.solid = function (hex, rough) {
  var k = hex + (rough || 0.7);
  if (!BP.solidCache[k]) { BP.solidCache[k] = new THREE.MeshStandardMaterial({ color: hex, roughness: rough || 0.7 }); }
  return BP.solidCache[k];
};

/* what a person holds for each action */
BP.prop = function (hand, act) {
  while (hand.children.length) { hand.remove(hand.children[0]); }
  var M = BP.M;
  if (act === "cook") { BP.rb(hand, 0.02, 0.012, 0.22, 0.005, M.black, 0, 0, 0.1); BP.rb(hand, 0.07, 0.008, 0.08, 0.004, M.metal, 0, 0, 0.22); }
  if (act === "coffee") { BP.cy(hand, 0.035, 0.03, 0.08, M.white, 0, 0, 0.05, 16); BP.cy(hand, 0.03, 0.03, 0.005, M.coffee, 0, 0.04, 0.05, 16); }
  if (act === "serve") { BP.cy(hand, 0.14, 0.14, 0.012, M.white, -0.12, 0.02, 0.12, 28); BP.cupcake(hand, -0.15, 0.026, 0.1, M.peach, M); BP.cupcake(hand, -0.08, 0.026, 0.14, M.lav, M); }
  if (act === "cashier") { BP.rb(hand, 0.07, 0.12, 0.02, 0.008, M.black, 0, 0, 0.06).rotation.x = -0.6; }
  if (act === "wash") { BP.rb(hand, 0.08, 0.04, 0.06, 0.015, M.plug, 0, 0, 0.06); }
};

/* =========================================================
   Custom objects made from a photo.
   The photo's background is removed, its main colour picked out, and a 3D piece is built
   in the same rounded style: a product on a stand, a display box, a round stand or a standee.
   ========================================================= */
BP.imgTex = {};
BP.texFor = function (url) {
  if (!BP.imgTex[url]) { var t = new THREE.TextureLoader().load(url); t.encoding = THREE.sRGBEncoding; BP.imgTex[url] = t; }
  return BP.imgTex[url];
};
BP.cutoutMesh = function (g, url, w, h, y, z) {
  var tex = BP.texFor(url);
  var m = new THREE.MeshStandardMaterial({ map: tex, transparent: true, alphaTest: 0.35, side: THREE.DoubleSide, roughness: 0.6 });
  var dm = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: tex, alphaTest: 0.35 });
  for (var i = 0; i < 4; i++) {
    var pl = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
    pl.position.set(0, y + h / 2, z - 0.012 + i * 0.008); pl.castShadow = i === 0; pl.customDepthMaterial = dm; pl.userData.noEdge = true; g.add(pl);
  }
};
BP.buildCustom = function (g, bw, bd, c, P) {
  if (c.top) { BP.buildCustomTop(g, c, P); return; }
  var tint = new THREE.MeshStandardMaterial({ color: P.tint || c.tint, roughness: 0.6 }), img = c.cutout || c.image, tall = c.tall || 1;
  if (c.form === "stand") {
    var ph = 0.72;
    BP.rb(g, bw * 0.86, ph, bd * 0.86, 0.05, tint, 0, ph / 2, 0);
    BP.rb(g, bw * 0.9, 0.03, bd * 0.9, 0.012, P.wood, 0, ph + 0.015, 0);
    var hh = Math.min(0.8, bw * 0.75 * tall), ww = hh / tall;
    if (ww > bw * 0.85) { ww = bw * 0.85; hh = ww * tall; }
    BP.cutoutMesh(g, img, ww, hh, ph + 0.03, 0);
  } else if (c.form === "round") {
    var r = Math.min(bw, bd) / 2 * 0.88, rh = 0.8;
    BP.cy(g, r, r, rh, tint, 0, rh / 2, 0, 40);
    BP.cy(g, r + 0.02, r + 0.02, 0.03, P.wood, 0, rh + 0.015, 0, 40);
    var h2 = Math.min(0.7, r * 1.6 * tall), w2 = h2 / tall;
    if (w2 > r * 1.7) { w2 = r * 1.7; h2 = w2 * tall; }
    BP.cutoutMesh(g, img, w2, h2, rh + 0.03, 0);
  } else if (c.form === "standee") {
    BP.rb(g, bw * 0.7, 0.05, Math.min(0.32, bd * 0.7), 0.02, tint, 0, 0.025, 0);
    var sh = Math.min(1.8, bw * 0.9 * tall), sw = sh / tall;
    if (sw > bw * 0.95) { sw = bw * 0.95; sh = sw * tall; }
    BP.cutoutMesh(g, img, sw, sh, 0.05, 0);
  } else {
    var H = 0.9;
    BP.rb(g, bw - 0.05, H, bd - 0.05, 0.04, tint, 0, H / 2, 0);
    BP.rb(g, bw - 0.02, 0.035, bd - 0.02, 0.012, P.wood, 0, H + 0.017, 0);
    var face = new THREE.Mesh(new THREE.PlaneGeometry(bw - 0.16, H - 0.22), new THREE.MeshStandardMaterial({ map: BP.texFor(c.image), roughness: 0.6 }));
    face.position.set(0, H / 2, (bd - 0.05) / 2 + 0.003); face.userData.noEdge = true; g.add(face);
  }
};
/* the same photo object, small enough to sit on a table (y = 0 is the table surface) */
BP.buildCustomTop = function (g, c, P) {
  var tint = new THREE.MeshStandardMaterial({ color: P.tint || c.tint, roughness: 0.6 }), img = c.cutout || c.image, tall = c.tall || 1;
  var fit = function (maxW, maxH) { var h = Math.min(maxH, maxW * tall), w = h / tall; if (w > maxW) { w = maxW; h = w * tall; } return { w: w, h: h }; };
  if (c.form === "stand") { /* on a plate */
    BP.cy(g, 0.2, 0.18, 0.02, P.white, 0, 0.01, 0, 36); BP.cy(g, 0.16, 0.16, 0.004, tint, 0, 0.022, 0, 36);
    var a = fit(0.36, 0.3); BP.cutoutMesh(g, img, a.w, a.h, 0.022, 0); return;
  }
  if (c.form === "round") { /* on a small cake stand */
    BP.cy(g, 0.07, 0.08, 0.015, tint, 0, 0.0075, 0, 28); BP.cy(g, 0.015, 0.015, 0.09, tint, 0, 0.06, 0, 12);
    BP.cy(g, 0.17, 0.17, 0.012, P.white, 0, 0.11, 0, 36);
    var b = fit(0.32, 0.26); BP.cutoutMesh(g, img, b.w, b.h, 0.116, 0); return;
  }
  if (c.form === "standee") { /* small table sign */
    BP.rb(g, 0.3, 0.025, 0.12, 0.01, tint, 0, 0.0125, 0);
    var d = fit(0.4, 0.42); BP.cutoutMesh(g, img, d.w, d.h, 0.025, 0); return;
  }
  /* display tray: the photo laid on a shallow tray, tipped towards the customer */
  var tray = new THREE.Group(); tray.position.set(0, 0.05, 0.02); tray.rotation.x = 0.35; g.add(tray);
  BP.rb(tray, 0.42, 0.04, 0.32, 0.015, tint, 0, 0, 0);
  var face = new THREE.Mesh(new THREE.PlaneGeometry(0.38, 0.28), new THREE.MeshStandardMaterial({ map: BP.texFor(c.image), roughness: 0.6 }));
  face.rotation.x = -Math.PI / 2; face.position.y = 0.021; face.userData.noEdge = true; tray.add(face);
  BP.rb(g, 0.06, 0.07, 0.06, 0.02, P.accent, 0, 0.035, -0.08);
  BP.rb(g, 0.3, 0.02, 0.05, 0.01, P.accent, 0, 0.01, 0.14);
};
BP.FORMS = [["box", "Display box"], ["stand", "On a stand"], ["round", "Round stand"], ["standee", "Standee"]];
BP.FORMS_TOP = { box: "Display tray", stand: "On a plate", round: "Cake stand", standee: "Table sign" };

/* look at a photo: remove a plain background, find the main colour and the shape */
BP.analyse = function (url, done) {
  var im = new Image();
  im.onload = function () {
    var k = Math.min(1, 320 / Math.max(im.width, im.height)), w = Math.max(1, Math.round(im.width * k)), h = Math.max(1, Math.round(im.height * k));
    var cv = document.createElement("canvas"); cv.width = w; cv.height = h; var g = cv.getContext("2d"); g.drawImage(im, 0, 0, w, h);
    var data = g.getImageData(0, 0, w, h), px = data.data;
    var corners = [[0, 0], [w - 6, 0], [0, h - 6], [w - 6, h - 6]], cs = [];
    corners.forEach(function (c) { var r = 0, gg = 0, b = 0, n = 0; for (var y = c[1]; y < c[1] + 6; y++) { for (var x = c[0]; x < c[0] + 6; x++) { var i = (y * w + x) * 4; r += px[i]; gg += px[i + 1]; b += px[i + 2]; n++; } } cs.push([r / n, gg / n, b / n]); });
    var bg = [0, 1, 2].map(function (j) { return (cs[0][j] + cs[1][j] + cs[2][j] + cs[3][j]) / 4; });
    var spread = Math.max.apply(null, cs.map(function (c) { return Math.hypot(c[0] - bg[0], c[1] - bg[1], c[2] - bg[2]); }));
    var plain = spread < 34, minX = w, minY = h, maxX = 0, maxY = 0, fg = 0, sr = 0, sg = 0, sb = 0;
    for (var y = 0; y < h; y++) {
      for (var x = 0; x < w; x++) {
        var i = (y * w + x) * 4, d = Math.hypot(px[i] - bg[0], px[i + 1] - bg[1], px[i + 2] - bg[2]);
        var a = plain ? Math.max(0, Math.min(1, (d - 26) / 22)) : 1;
        px[i + 3] = Math.round(a * 255);
        if (a > 0.5) {
          fg++; if (x < minX) { minX = x; } if (y < minY) { minY = y; } if (x > maxX) { maxX = x; } if (y > maxY) { maxY = y; }
          var lum = (px[i] + px[i + 1] + px[i + 2]) / 3;
          if (lum > 30 && lum < 235) { sr += px[i]; sg += px[i + 1]; sb += px[i + 2]; }
        }
      }
    }
    if (!fg) { plain = false; minX = 0; minY = 0; maxX = w - 1; maxY = h - 1; }
    var cnt = Math.max(1, (sr + sg + sb) ? fg : 1), avg = (sr + sg + sb) ? [sr / cnt, sg / cnt, sb / cnt] : [200, 190, 180];
    var mix = function (v) { return Math.round(v * 0.45 + 245 * 0.55); };
    var tint = "#" + avg.map(function (v) { return ("0" + mix(v).toString(16)).slice(-2); }).join("");
    var bw2 = maxX - minX + 1, bh2 = maxY - minY + 1, out = "";
    if (plain) {
      g.putImageData(data, 0, 0);
      var c2 = document.createElement("canvas"); c2.width = bw2; c2.height = bh2; c2.getContext("2d").drawImage(cv, minX, minY, bw2, bh2, 0, 0, bw2, bh2);
      out = c2.toDataURL("image/png");
    }
    var tall = bh2 / bw2, fill = fg / (w * h);
    var form = !plain || fill > 0.82 ? "box" : (tall > 1.7 ? "standee" : "stand");
    done({ cutout: out, tint: tint, tall: Math.max(0.3, Math.min(3, tall)), form: form, plain: plain });
  };
  im.src = url;
};

/* =========================================================
   Retail and workshop objects (clothes, accessories, art, classes).
   Same rules as above: centred on 0,0, facing +z (the aisle), options.v picks the design.
   ========================================================= */
BP.retailCols = function (P) { return [P.peach, P.lav, P.mint, P.cream, BP.solid("#7E9CC8"), BP.solid("#D98B6A"), BP.solid("#F4F1EC"), BP.solid("#3A3540")]; };
BP.gold = function () { return BP.solid("#D9B45A", 0.35); };
BP.ring = function (g, r, tube, m, x, y, z) { var o = BP.mesh(new THREE.TorusGeometry(r, tube, 8, 24), m, x, y, z, g); o.userData.noEdge = true; return o; };

/* a little framed artwork: frame, mount and a few colour blocks for the picture */
BP.artwork = function (g, w, h, x, y, z, P, seed, frameM) {
  var cols = BP.retailCols(P);
  BP.rb(g, w, h, 0.025, 0.006, frameM || P.black, x, y, z);
  BP.rb(g, w - 0.04, h - 0.04, 0.004, 0.002, P.white, x, y, z + 0.014).userData.noEdge = true;
  BP.rb(g, w - 0.1, (h - 0.1) * 0.55, 0.004, 0.002, cols[seed % cols.length], x, y + (h - 0.1) * 0.2, z + 0.017).userData.noEdge = true;
  BP.rb(g, (w - 0.1) * 0.5, (h - 0.1) * 0.35, 0.004, 0.002, cols[(seed + 3) % cols.length], x - (w - 0.1) * 0.25, y - (h - 0.1) * 0.25, z + 0.017).userData.noEdge = true;
  BP.sp(g, Math.min(w, h) * 0.12, cols[(seed + 5) % cols.length], x + w * 0.18, y + h * 0.12, z + 0.02, 1, 1, 0.2);
};

Object.assign(BP.build, {
  /* clothes rail, double rail, bag shelf */
  rack: function (g, bw, bd, P, o) {
    var cols = BP.retailCols(P), k, n;
    if (o.v === 2) {
      var H2 = 1.2, d = bd - 0.1;
      [-1, 1].forEach(function (s) { BP.rb(g, 0.03, H2, d, 0.01, P.accent, s * (bw / 2 - 0.04), H2 / 2, 0); });
      BP.rb(g, bw - 0.08, H2 - 0.05, 0.012, 0.004, P.body, 0, H2 / 2, -d / 2 + 0.01);
      [0.08, 0.5, 0.92].forEach(function (y, i) {
        BP.rb(g, bw - 0.06, 0.03, d, 0.01, P.wood, 0, y, 0);
        n = Math.max(2, Math.round(bw / 0.32));
        for (k = 0; k < n; k++) {
          var x = -bw / 2 + 0.2 + k * (bw - 0.4) / (n - 1), c = cols[(k + i * 2) % cols.length];
          BP.rb(g, 0.2, 0.17, 0.1, 0.03, c, x, y + 0.1, 0.02);
          BP.ring(g, 0.055, 0.007, c, x, y + 0.185, 0.02).scale.y = 0.8;
        }
      });
      return;
    }
    var bars = o.v === 1 ? [1.6, 0.95] : [1.45], top = bars[0];
    [-1, 1].forEach(function (s) {
      var x = s * (bw / 2 - 0.05);
      BP.cy(g, 0.014, 0.014, top, P.metal, x, top / 2, 0, 10);
      BP.rb(g, 0.04, 0.03, bd - 0.1, 0.012, P.metal, x, 0.015, 0);
    });
    bars.forEach(function (by, b) {
      var bar = BP.cy(g, 0.012, 0.012, bw - 0.1, P.metal, 0, by, 0, 10); bar.rotation.z = Math.PI / 2;
      var len = o.v === 1 ? 0.52 : 0.8;
      n = Math.max(4, Math.round((bw - 0.24) / 0.085));
      for (k = 0; k < n; k++) {
        var x = -bw / 2 + 0.14 + k * (bw - 0.28) / (n - 1), c = cols[(k * 3 + b) % cols.length];
        BP.cy(g, 0.004, 0.004, 0.06, P.metal, x, by - 0.03, 0, 6);
        BP.rb(g, 0.032, len, 0.36, 0.012, c, x, by - 0.07 - len / 2, 0);
      }
    });
  },

  /* pegboard, grid panel, slatwall: a display wall for small accessories */
  pegboard: function (g, bw, bd, P, o) {
    var w = bw - 0.06, H = 1.75, z = -bd / 2 + 0.1, cols = BP.retailCols(P), k, r, c;
    [-1, 1].forEach(function (s) {
      BP.rb(g, 0.06, 0.04, bd - 0.08, 0.015, P.accent, s * (w / 2 - 0.03), 0.02, 0);
      BP.rb(g, 0.04, H, 0.04, 0.012, P.accent, s * (w / 2 - 0.02), H / 2, z);
    });
    if (o.v === 1) { /* black grid with tote bags and hats */
      var gm = P.black;
      for (k = 0; k <= Math.round((w - 0.1) / 0.12); k++) { BP.rb(g, 0.008, H - 0.25, 0.008, 0.002, gm, -w / 2 + 0.05 + k * 0.12, H / 2 + 0.1, z).castShadow = false; }
      for (k = 0; k <= 11; k++) { BP.rb(g, w - 0.08, 0.008, 0.008, 0.002, gm, 0, 0.3 + k * 0.12, z).castShadow = false; }
      n = Math.max(2, Math.round(w / 0.36));
      for (k = 0; k < n; k++) {
        var x = -w / 2 + 0.22 + k * (w - 0.44) / Math.max(1, n - 1);
        c = cols[k % cols.length];
        BP.rb(g, 0.26, 0.3, 0.025, 0.01, c, x, 0.75, z + 0.03);
        BP.ring(g, 0.07, 0.006, c, x, 0.92, z + 0.03).scale.y = 1.3;
        var hat = BP.hemi(g, 0.1, cols[(k + 3) % cols.length], x, 1.35, z + 0.08); hat.rotation.x = Math.PI / 2; hat.scale.set(1, 0.7, 1);
      }
      return;
    }
    if (o.v === 2) { /* white slatwall with little shelves of caps and boxes */
      BP.rb(g, w - 0.04, H - 0.2, 0.03, 0.006, P.white, 0, H / 2 + 0.08, z);
      for (k = 0; k < 12; k++) { BP.rb(g, w - 0.06, 0.006, 0.006, 0.002, BP.solid("#DAD5CF"), 0, 0.3 + k * 0.12, z + 0.017).castShadow = false; }
      [0.55, 1.0, 1.45].forEach(function (y, i) {
        BP.rb(g, w - 0.2, 0.02, 0.18, 0.006, P.wood, 0, y, z + 0.1);
        n = Math.max(3, Math.round(w / 0.22));
        for (k = 0; k < n; k++) {
          var xx = -w / 2 + 0.2 + k * (w - 0.4) / (n - 1);
          if (i === 1) { BP.hemi(g, 0.07, cols[(k + i) % cols.length], xx, y + 0.01, z + 0.1).scale.y = 0.8; }
          else { BP.goodsBox(g, xx, y + 0.01, z + 0.1, cols[(k + i * 2) % cols.length], P, 0.9); }
        }
      });
      return;
    }
    /* light wood pegboard with hooks: necklaces, earring cards, keychains */
    BP.rb(g, w - 0.04, H - 0.2, 0.025, 0.006, BP.solid("#D8BE98", 0.8), 0, H / 2 + 0.08, z);
    var rows = [1.5, 1.15, 0.8], gold = BP.gold();
    rows.forEach(function (y, ri) {
      n = Math.max(3, Math.round(w / 0.2));
      for (k = 0; k < n; k++) {
        var hx = -w / 2 + 0.16 + k * (w - 0.32) / (n - 1);
        var hook = BP.cy(g, 0.004, 0.004, 0.07, P.metal, hx, y, z + 0.045, 6); hook.rotation.x = Math.PI / 2;
        if (ri === 0) { BP.ring(g, 0.06, 0.004, k % 2 ? gold : P.metal, hx, y - 0.07, z + 0.05); BP.sp(g, 0.014, cols[k % cols.length], hx, y - 0.13, z + 0.055); }
        else if (ri === 1) { BP.rb(g, 0.1, 0.13, 0.005, 0.003, P.white, hx, y - 0.08, z + 0.05); BP.sp(g, 0.012, cols[(k + 2) % cols.length], hx - 0.025, y - 0.08, z + 0.056); BP.sp(g, 0.012, cols[(k + 2) % cols.length], hx + 0.025, y - 0.08, z + 0.056); }
        else { r = BP.ring(g, 0.016, 0.004, P.metal, hx, y - 0.03, z + 0.05); BP.rb(g, 0.05, 0.06, 0.02, 0.01, cols[(k + 4) % cols.length], hx, y - 0.08, z + 0.05); }
      }
    });
  },

  /* table-top jewellery displays: necklace bust, ring tray, earring tree (y = 0 is the table top) */
  showcase: function (g, bw, bd, P, o) {
    var velvet = BP.solid("#2F2A33", 0.9), gold = BP.gold(), cols = BP.retailCols(P), k;
    if (o.v === 1) {
      BP.rb(g, 0.3, 0.035, 0.2, 0.01, P.wood, 0, 0.0175, 0);
      BP.rb(g, 0.27, 0.012, 0.17, 0.004, velvet, 0, 0.037, 0);
      for (k = 0; k < 8; k++) { var rr = BP.ring(g, 0.016, 0.0045, k % 3 ? gold : P.metal, -0.1 + (k % 4) * 0.066, 0.05, -0.04 + Math.floor(k / 4) * 0.08); rr.rotation.x = -0.3; if (k % 2 === 0) { BP.sp(g, 0.007, cols[k % cols.length], rr.position.x, 0.067, rr.position.z + 0.004); } }
      return;
    }
    if (o.v === 2) {
      BP.cy(g, 0.07, 0.08, 0.02, P.wood, 0, 0.01, 0, 24);
      BP.cy(g, 0.008, 0.008, 0.32, gold, 0, 0.17, 0, 8);
      [[0.22, 0], [0.16, 1.6], [0.28, 3.1], [0.1, 4.7]].forEach(function (b, i) {
        var arm = BP.cy(g, 0.005, 0.005, 0.14, gold, Math.cos(b[1]) * 0.06, b[0] + 0.05, Math.sin(b[1]) * 0.06, 6); arm.rotation.z = Math.PI / 2; arm.rotation.y = -b[1];
        for (var e = 0; e < 3; e++) { var ex = Math.cos(b[1]) * (0.03 + e * 0.04), ez = Math.sin(b[1]) * (0.03 + e * 0.04); BP.cy(g, 0.002, 0.002, 0.03, gold, ex, b[0] + 0.035, ez, 4); BP.sp(g, 0.011, cols[(i + e) % cols.length], ex, b[0] + 0.012, ez); }
      });
      return;
    }
    /* necklace bust */
    BP.cy(g, 0.06, 0.07, 0.02, P.wood, 0, 0.01, 0, 24);
    BP.cy(g, 0.02, 0.03, 0.16, velvet, 0, 0.1, 0, 16);
    BP.sp(g, 0.1, velvet, 0, 0.22, 0, 1, 0.55, 0.45);
    BP.cy(g, 0.028, 0.026, 0.1, velvet, 0, 0.32, 0, 16);
    var nk = BP.ring(g, 0.05, 0.004, gold, 0, 0.25, 0.02); nk.rotation.x = Math.PI / 2 - 0.5;
    BP.sp(g, 0.016, P.red, 0, 0.205, 0.045);
  },

  /* painting easel, canvas stand, print browser (1 x 1 cell) */
  easel: function (g, bw, bd, P, o) {
    var k, cols = BP.retailCols(P);
    if (o.v === 2) { /* print browser: a wooden bin on legs, prints inside */
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (s) { BP.rb(g, 0.03, 0.62, 0.03, 0.01, P.wood, s[0] * (bw / 2 - 0.06), 0.31, s[1] * (bd / 2 - 0.06)); });
      BP.rb(g, bw - 0.06, 0.02, bd - 0.06, 0.006, P.wood, 0, 0.6, 0);
      [[bw - 0.06, 0.2, 0.015, 0, 0.7, bd / 2 - 0.04], [bw - 0.06, 0.2, 0.015, 0, 0.7, -bd / 2 + 0.04], [0.015, 0.2, bd - 0.06, bw / 2 - 0.04, 0.7, 0], [0.015, 0.2, bd - 0.06, -bw / 2 + 0.04, 0.7, 0]].forEach(function (p) { BP.rb(g, p[0], p[1], p[2], 0.004, P.wood, p[3], p[4], p[5]); });
      for (k = 0; k < 6; k++) { var pr = BP.rb(g, bw - 0.12, 0.3, 0.008, 0.003, k % 2 ? P.white : cols[k % cols.length], 0, 0.76, -bd / 2 + 0.1 + k * (bd - 0.2) / 5); pr.rotation.x = -0.25; }
      return;
    }
    if (o.v === 1) { /* canvas stand: an A-frame with small canvases on two rows */
      [-1, 1].forEach(function (s) { var l = BP.rb(g, 0.03, 1.5, 0.03, 0.01, P.wood, s * (bw / 2 - 0.05), 0.74, 0); l.rotation.x = -0.12; var l2 = BP.rb(g, 0.03, 1.5, 0.03, 0.01, P.wood, s * (bw / 2 - 0.05), 0.74, -0.12); l2.rotation.x = 0.12; });
      [0.55, 1.05].forEach(function (y, i) {
        BP.rb(g, bw - 0.06, 0.03, 0.06, 0.008, P.wood, 0, y, 0.06 - y * 0.06);
        [-1, 1].forEach(function (s, j) { var cv = new THREE.Group(); cv.position.set(s * 0.11, y + 0.14, 0.05 - y * 0.06); cv.rotation.x = -0.12; g.add(cv); BP.artwork(cv, 0.2, 0.25, 0, 0, 0, P, i * 2 + j, P.white); });
      });
      return;
    }
    /* painting easel with a canvas */
    var legF = BP.cy(g, 0.012, 0.012, 1.6, P.wood, -0.14, 0.78, 0.04, 8); legF.rotation.z = -0.12;
    var legF2 = BP.cy(g, 0.012, 0.012, 1.6, P.wood, 0.14, 0.78, 0.04, 8); legF2.rotation.z = 0.12;
    var legB = BP.cy(g, 0.012, 0.012, 1.55, P.wood, 0, 0.74, -0.15, 8); legB.rotation.x = -0.25;
    BP.rb(g, 0.4, 0.025, 0.06, 0.008, P.wood, 0, 0.78, 0.07);
    var can = new THREE.Group(); can.position.set(0, 1.08, 0.06); can.rotation.x = -0.1; g.add(can);
    BP.artwork(can, 0.42, 0.52, 0, 0, 0, P, 2, P.white);
  },

  /* craft table, long bench, small table: a work surface for classes (surface 0.76) */
  worktable: function (g, bw, bd, P, o) {
    var top = 0.74, cols = BP.retailCols(P), k;
    BP.rb(g, bw - 0.04, 0.04, bd - 0.04, 0.012, P.wood, 0, top, 0);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (s) { BP.rb(g, 0.045, top - 0.02, 0.045, 0.012, P.accent, s[0] * (bw / 2 - 0.08), (top - 0.02) / 2, s[1] * (bd / 2 - 0.08)); });
    if (o.v === 0) { BP.rb(g, bw - 0.2, 0.02, bd - 0.2, 0.006, P.wood, 0, 0.18, 0); }
    if (o.bare) { return; }
    var y = top + 0.02, n = Math.max(2, Math.round(bw / 0.45));
    for (k = 0; k < n; k++) {
      var x = -bw / 2 + 0.3 + k * (bw - 0.6) / Math.max(1, n - 1);
      BP.rb(g, 0.24, 0.004, 0.18, 0.002, P.white, x, y + 0.002, bd / 2 - 0.22).castShadow = false;
      BP.cy(g, 0.03, 0.03, 0.04, cols[k % cols.length], x - 0.15, y + 0.02, bd / 2 - 0.12, 14);
      BP.cy(g, 0.03, 0.03, 0.04, cols[(k + 3) % cols.length], x + 0.15, y + 0.02, bd / 2 - 0.12, 14);
    }
    BP.cy(g, 0.04, 0.035, 0.1, P.glass, 0, y + 0.05, -bd / 2 + 0.15, 14);
    for (k = 0; k < 4; k++) { var br = BP.cy(g, 0.004, 0.004, 0.18, P.wood, -0.015 + k * 0.01, y + 0.12, -bd / 2 + 0.15, 6); br.rotation.z = (k - 1.5) * 0.12; }
    BP.sp(g, 0.05, cols[1], bw / 2 - 0.2, y + 0.05, -bd / 2 + 0.16); BP.sp(g, 0.045, cols[2], bw / 2 - 0.3, y + 0.045, -bd / 2 + 0.2);
  },

  /* art print wall, supply shelf, card spinner */
  artwall: function (g, bw, bd, P, o) {
    var k, cols = BP.retailCols(P), z = -bd / 2 + 0.1;
    if (o.v === 2) { /* card spinner */
      BP.cy(g, 0.16, 0.18, 0.03, P.black, 0, 0.015, 0, 24);
      BP.cy(g, 0.012, 0.012, 1.5, P.metal, 0, 0.77, 0, 8);
      for (k = 0; k < 4; k++) {
        var side = new THREE.Group(); side.rotation.y = k * Math.PI / 2; side.position.y = 0; g.add(side);
        [0.6, 0.9, 1.2].forEach(function (y, i) { BP.rb(side, 0.16, 0.2, 0.006, 0.002, cols[(k + i * 2) % cols.length], 0, y, 0.09); BP.rb(side, 0.17, 0.05, 0.03, 0.004, P.metal, 0, y - 0.09, 0.09); });
      }
      return;
    }
    if (o.v === 1) { /* supply shelf: paints, yarn and brushes */
      var SH = 1.5, sd = bd - 0.1;
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (s) { BP.rb(g, 0.024, SH, 0.024, 0.008, P.accent, s[0] * (bw / 2 - 0.03), SH / 2, s[1] * (sd / 2 - 0.012)); });
      [0.2, 0.62, 1.04, 1.44].forEach(function (y, i) {
        BP.rb(g, bw - 0.03, 0.03, sd, 0.012, P.wood, 0, y, 0);
        var n = Math.max(3, Math.round(bw / 0.16)), x0 = -bw / 2 + 0.12, st = (bw - 0.24) / (n - 1);
        for (k = 0; k < n; k++) {
          if (i === 3) { break; }
          if (i === 0) { BP.sp(g, 0.06, cols[k % cols.length], x0 + k * st, y + 0.075, 0); }
          else if (i === 1) { BP.cy(g, 0.04, 0.04, 0.09, cols[(k + 2) % cols.length], x0 + k * st, y + 0.06, 0, 14); BP.cy(g, 0.041, 0.041, 0.015, P.white, x0 + k * st, y + 0.11, 0, 14); }
          else { BP.goodsBox(g, x0 + k * st, y + 0.015, 0, cols[(k + 4) % cols.length], P); }
        }
      });
      BP.plant(g, -bw / 2 + 0.16, 1.455, 0, 1, P);
      BP.cy(g, 0.04, 0.035, 0.1, P.glass, bw / 2 - 0.2, 1.505, 0, 14);
      return;
    }
    /* art print wall: a white panel with framed prints */
    var w = bw - 0.06, H = 1.8;
    [-1, 1].forEach(function (s) { BP.rb(g, 0.06, 0.04, bd - 0.08, 0.015, P.accent, s * (w / 2 - 0.03), 0.02, 0); BP.rb(g, 0.04, H, 0.04, 0.012, P.accent, s * (w / 2 - 0.02), H / 2, z); });
    BP.rb(g, w - 0.04, H - 0.15, 0.03, 0.006, P.white, 0, H / 2 + 0.05, z);
    var cols2 = Math.max(2, Math.round(w / 0.4));
    [[1.4, 0.36, 0.44], [0.85, 0.3, 0.36]].forEach(function (row, ri) {
      for (k = 0; k < cols2; k++) { var x = -w / 2 + 0.25 + k * (w - 0.5) / Math.max(1, cols2 - 1); BP.artwork(g, row[1], row[2], x, row[0], z + 0.03, P, k + ri * 3, (k + ri) % 2 ? P.wood : P.black); }
    });
  }
});
