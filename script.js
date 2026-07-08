/* PromptGuard landing — reveal, nav, count-up, market charts, agentic animation.
   The agentic canvas echoes the v2/agentic replay (trust-boundary membrane,
   packets crossing, live counters) at a deliberately high level: no pipeline
   stages, no method — just "your data stays, only the task crosses". */
(function () {
  "use strict";
  var SVGNS = "http://www.w3.org/2000/svg";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // ---- sticky header ------------------------------------------------------
  var site = $(".site");
  function onScroll() { site.classList.toggle("is-scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  // ---- mobile nav ---------------------------------------------------------
  var burger = $("#burger"), nav = $("#nav");
  if (burger) burger.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    burger.setAttribute("aria-expanded", String(open));
  });
  $$("#nav a").forEach(function (a) { a.addEventListener("click", function () { nav.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });

  // ---- reveal on scroll + one-shot triggers -------------------------------
  var seen = new WeakSet();
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var t = e.target;
      t.classList.add("in");
      if (t.classList.contains("stats__grid") && !seen.has(t)) { seen.add(t); countUp(t); }
      if (t.classList.contains("chart") && !seen.has(t)) { seen.add(t); animChart(t); }
      io.unobserve(t);
    });
  }, { threshold: 0.16, rootMargin: "0px 0px -8% 0px" });
  $$(".rv, .stats__grid, .chart, .prize").forEach(function (n) { io.observe(n); });

  // ---- stat count-up ------------------------------------------------------
  function countUp(grid) {
    $$(".stat__n", grid).forEach(function (el) {
      var target = +el.getAttribute("data-count"), suf = el.getAttribute("data-suffix") || "";
      if (reduce) { el.textContent = target + suf; return; }
      var t0 = null, dur = 1100;
      function step(ts) {
        if (t0 === null) t0 = ts;
        var p = Math.min(1, (ts - t0) / dur), e = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(e * target) + suf;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  // =========================================================================
  // Market charts — animated area + line drawn from data
  // =========================================================================
  var CHART_DATA = {
    today: {
      pts: [[2025, 6.4], [2026, 8.1], [2027, 10.2], [2028, 12.8], [2029, 16.2], [2030, 20.4]],
      max: 22, xlabels: [2025, 2027, 2030], hero: false,
      startLbl: "£6.4bn", endLbl: "£20bn"
    },
    tomorrow: {
      pts: [[2024, 5], [2025, 7.2], [2026, 10.5], [2027, 15.2], [2028, 22.1], [2029, 32], [2030, 47]],
      max: 52, xlabels: [2024, 2027, 2030], hero: true,
      startLbl: "$5bn", endLbl: "$47bn"
    }
  };
  var W = 520, H = 232, PL = 14, PR = 16, PT = 26, PB = 28;

  function buildChart(plot, key) {
    var d = CHART_DATA[key], n = d.pts.length;
    var iw = W - PL - PR, ih = H - PT - PB;
    var x = function (i) { return PL + iw * (i / (n - 1)); };
    var y = function (v) { return PT + ih * (1 - v / d.max); };
    var svg = document.createElementNS(SVGNS, "svg");
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");

    var defs = document.createElementNS(SVGNS, "defs");
    var grad = document.createElementNS(SVGNS, "linearGradient");
    grad.setAttribute("id", d.hero ? "cg-hero" : "cg-today");
    grad.setAttribute("x1", "0"); grad.setAttribute("y1", "0"); grad.setAttribute("x2", "0"); grad.setAttribute("y2", "1");
    var c = d.hero ? "156,116,68" : "26,22,17";
    grad.innerHTML = '<stop offset="0" stop-color="rgb(' + c + ')" stop-opacity="0.22"/><stop offset="1" stop-color="rgb(' + c + ')" stop-opacity="0"/>';
    defs.appendChild(grad); svg.appendChild(defs);

    // gridlines
    [0, 0.5, 1].forEach(function (g) {
      var gy = PT + ih * g;
      var ln = document.createElementNS(SVGNS, "line");
      ln.setAttribute("class", "c-grid"); ln.setAttribute("x1", PL); ln.setAttribute("x2", W - PR);
      ln.setAttribute("y1", gy); ln.setAttribute("y2", gy); svg.appendChild(ln);
    });

    var line = "", area = "M" + x(0) + "," + (H - PB) + " L";
    d.pts.forEach(function (p, i) { var px = x(i), py = y(p[1]); line += (i ? " L" : "M") + px + "," + py; area += (i ? " L" : "") + px + "," + py; });
    area += " L" + x(n - 1) + "," + (H - PB) + " Z";

    var ap = document.createElementNS(SVGNS, "path");
    ap.setAttribute("class", "c-area"); ap.setAttribute("d", area);
    ap.setAttribute("fill", "url(#" + (d.hero ? "cg-hero" : "cg-today") + ")"); svg.appendChild(ap);

    var lp = document.createElementNS(SVGNS, "path");
    lp.setAttribute("class", "c-line"); lp.setAttribute("d", line); svg.appendChild(lp);

    // endpoint dots + value labels
    [[0, d.startLbl, "start"], [n - 1, d.endLbl, "end"]].forEach(function (e) {
      var i = e[0], px = x(i), py = y(d.pts[i][1]);
      var dot = document.createElementNS(SVGNS, "circle");
      dot.setAttribute("class", "c-dot"); dot.setAttribute("cx", px); dot.setAttribute("cy", py); dot.setAttribute("r", i === n - 1 ? 4.5 : 3.5);
      svg.appendChild(dot);
      var lab = document.createElementNS(SVGNS, "text");
      lab.setAttribute("class", "c-vlbl"); lab.setAttribute("x", e[2] === "end" ? px - 4 : px + 6);
      lab.setAttribute("y", py - 10); lab.setAttribute("text-anchor", e[2] === "end" ? "end" : "start");
      lab.textContent = e[1]; svg.appendChild(lab);
    });

    // x labels
    d.xlabels.forEach(function (yr) {
      var i = d.pts.map(function (p) { return p[0]; }).indexOf(yr); if (i < 0) return;
      var t = document.createElementNS(SVGNS, "text");
      t.setAttribute("class", "c-xlbl"); t.setAttribute("x", x(i));
      t.setAttribute("y", H - 8); t.setAttribute("text-anchor", i === 0 ? "start" : i === n - 1 ? "end" : "middle");
      t.textContent = yr; svg.appendChild(t);
    });

    plot.appendChild(svg);
    var len = lp.getTotalLength();
    lp.style.strokeDasharray = len; lp.style.strokeDashoffset = reduce ? 0 : len; lp.style.transition = "none";
    return { line: lp };
  }

  var charts = {};
  $$(".chart__plot").forEach(function (plot) { charts[plot.getAttribute("data-series")] = buildChart(plot, plot.getAttribute("data-series")); });
  function animChart(fig) {
    var plot = $(".chart__plot", fig), c = charts[plot.getAttribute("data-series")];
    if (!c) return;
    plot.classList.add("c-in");
    if (reduce) { c.line.style.strokeDashoffset = 0; return; }
    c.line.getBoundingClientRect();
    c.line.style.transition = "stroke-dashoffset 1.5s cubic-bezier(.4,.75,.3,1)";
    c.line.style.strokeDashoffset = 0;
  }

  // =========================================================================
  // Agentic canvas — high-level replay of the trust-boundary animation
  // =========================================================================
  var ag = $("#ag");
  var A = { origin: [428, 210], mem: 520, agentX: 694, agentCy: [126, 220, 314], run: 0 };
  var dispG = $("#ag-dispatch"), ansG = $("#ag-answer"), pktG = $("#ag-packets"), memglow = $("#ag-memglow"), crossedEl = $("#ag-crossed");

  function agReset() {
    A.run++;
    if (dispG) dispG.innerHTML = ""; if (ansG) ansG.innerHTML = ""; if (pktG) pktG.innerHTML = "";
    if (crossedEl) crossedEl.textContent = "0"; if (memglow) memglow.style.opacity = 0;
    ["ag-you", "ag-pg", "ag-a0", "ag-a1", "ag-a2"].forEach(function (id) {
      var n = $("#" + id); if (n) { n.classList.add("is-pending"); n.classList.remove("is-on"); }
    });
    var e = $("#ag-e-you"); if (e) e.style.opacity = 0;
  }
  function drawEdge(p, dur) {
    var len = p.getTotalLength();
    p.style.transition = "none"; p.style.strokeDasharray = len; p.style.strokeDashoffset = len; p.style.opacity = 1;
    p.getBoundingClientRect();
    p.style.transition = "stroke-dashoffset " + dur + "ms ease-out"; p.style.strokeDashoffset = 0;
  }
  function gauss(x) { var dx = (x - A.mem) / 26; return Math.exp(-dx * dx); }
  function flyPacket(p, dur, token, dir, onCross, onDone) {
    var len = p.getTotalLength();
    var c = document.createElementNS(SVGNS, "circle");
    c.setAttribute("class", "ag-packet"); c.setAttribute("r", "5"); pktG.appendChild(c);
    var start = null, crossed = false;
    function frame(ts) {
      if (A.run !== token) { c.remove(); return; }
      if (start === null) start = ts;
      var pr = Math.min(1, (ts - start) / dur), pt = p.getPointAtLength(pr * len);
      c.setAttribute("cx", pt.x); c.setAttribute("cy", pt.y);
      memglow.style.opacity = (gauss(pt.x) * 0.4).toFixed(3);
      if (!crossed && dir === "out" && pt.x >= A.mem) { crossed = true; if (onCross) onCross(); }
      if (pr < 1) requestAnimationFrame(frame);
      else { c.remove(); memglow.style.opacity = 0; if (onDone) onDone(); }
    }
    requestAnimationFrame(frame);
  }
  function reveal(id) { var n = $("#" + id); if (n) n.classList.remove("is-pending"); }
  function lightOn(id) { var n = $("#" + id); if (n) n.classList.add("is-on"); }
  function agentPaths(cy) {
    var o = A.origin;
    return {
      d: "M" + o[0] + "," + o[1] + " C " + A.mem + "," + o[1] + " " + A.mem + "," + cy + " " + A.agentX + "," + cy,
      a: "M" + A.agentX + "," + cy + " C " + A.mem + "," + cy + " " + A.mem + "," + o[1] + " " + o[0] + "," + o[1]
    };
  }
  var agTimers = [];
  function at(ms, token, fn) { agTimers.push(setTimeout(function () { if (A.run === token) fn(); }, ms)); }

  function runAgentic() {
    if (!ag || ag.offsetParent === null) return;
    agTimers.forEach(clearTimeout); agTimers = [];
    agReset();
    var token = A.run, crossed = 0;
    at(200, token, function () { reveal("ag-you"); lightOn("ag-you"); });
    at(520, token, function () { drawEdge($("#ag-e-you"), 360); });
    at(760, token, function () { reveal("ag-pg"); lightOn("ag-pg"); });
    A.agentCy.forEach(function (cy, i) {
      var base = 1250 + i * 620, paths = agentPaths(cy);
      at(base, token, function () {
        var de = document.createElementNS(SVGNS, "path");
        de.setAttribute("class", "ag-edge ag-edge--net"); de.setAttribute("d", paths.d); de.style.opacity = 0; dispG.appendChild(de);
        var ae = document.createElementNS(SVGNS, "path");
        ae.setAttribute("class", "ag-edge ag-edge--net"); ae.setAttribute("d", paths.a); ae.style.opacity = 0; ansG.appendChild(ae);
        reveal("ag-a" + i);
        drawEdge(de, 520);
        flyPacket(de, 720, token, "out",
          function () { crossed++; crossedEl.textContent = crossed; },
          function () {
            at(360, token, function () {
              drawEdge(ae, 480);
              flyPacket(ae, 640, token, "in", null, function () { lightOn("ag-a" + i); });
            });
          });
      });
    });
    at(1250 + A.agentCy.length * 620 + 2600, token, function () {
      if (!reduce && ag.getAttribute("data-vis") === "1" && $("#hw-tomorrow").checked) runAgentic();
    });
  }
  function agStatic() {
    agReset(); reveal("ag-you"); lightOn("ag-you"); reveal("ag-pg"); lightOn("ag-pg");
    $("#ag-e-you").style.opacity = 1;
    A.agentCy.forEach(function (cy, i) {
      var paths = agentPaths(cy);
      var de = document.createElementNS(SVGNS, "path"); de.setAttribute("class", "ag-edge ag-edge--net"); de.setAttribute("d", paths.d); dispG.appendChild(de);
      reveal("ag-a" + i); lightOn("ag-a" + i);
    });
    crossedEl.textContent = String(A.agentCy.length);
  }
  function agMaybeStart() {
    if (!$("#hw-tomorrow").checked || ag.getAttribute("data-vis") !== "1") return;
    if (reduce) { agStatic(); return; }
    runAgentic();
  }
  if (ag) {
    var agIo = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        ag.setAttribute("data-vis", e.isIntersecting ? "1" : "0");
        if (e.isIntersecting) agMaybeStart();
        else { A.run++; agTimers.forEach(clearTimeout); agTimers = []; }
      });
    }, { threshold: 0.3 });
    agIo.observe(ag);
    $("#hw-tomorrow").addEventListener("change", function () { setTimeout(agMaybeStart, 80); });
    $("#hw-today").addEventListener("change", function () { A.run++; agTimers.forEach(clearTimeout); agTimers = []; });
    var rb = $("#ag-replay"); if (rb) rb.addEventListener("click", function () { if (reduce) agStatic(); else runAgentic(); });
  }
})();
