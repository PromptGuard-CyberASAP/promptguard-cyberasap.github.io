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
      if (t.classList.contains("duo") && !seen.has(t)) { seen.add(t); animDuo(); }
      if (t.classList.contains("bull") && !seen.has(t)) { seen.add(t); var v = $(".bull__viz", t); if (v) v.classList.add("in"); }
      io.unobserve(t);
    });
  }, { threshold: 0.16, rootMargin: "0px 0px -8% 0px" });
  $$(".rv, .stats__grid").forEach(function (n) { io.observe(n); });

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
  // Opportunity — dual-curve chart (compliance vs agents) + bullseye
  // =========================================================================
  var DUO = {
    years: [2024, 2025, 2026, 2027, 2028, 2029, 2030],
    comp: [5.1, 6.4, 8.1, 10.2, 12.8, 16.2, 20.4],
    agent: [5, 7.2, 10.5, 15.2, 22.1, 32, 47], max: 50
  };
  var DW = 920, DH = 400, DPL = 46, DPR = 104, DPT = 40, DPB = 46, DN = DUO.years.length;
  var dux = function (i) { return DPL + (DW - DPL - DPR) * (i / (DN - 1)); };
  var duy = function (v) { return DPT + (DH - DPT - DPB) * (1 - v / DUO.max); };
  function duoPath(arr) { return arr.map(function (v, i) { return (i ? "L" : "M") + dux(i).toFixed(1) + "," + duy(v).toFixed(1); }).join(" "); }
  var duo = null;
  function buildDuo() {
    var plot = $(".duo__plot"); if (!plot) return;
    var svg = document.createElementNS(SVGNS, "svg");
    svg.setAttribute("viewBox", "0 0 " + DW + " " + DH); svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    var defs = document.createElementNS(SVGNS, "defs");
    var g = document.createElementNS(SVGNS, "linearGradient");
    g.setAttribute("id", "dg-agent"); g.setAttribute("x1", "0"); g.setAttribute("y1", "0"); g.setAttribute("x2", "0"); g.setAttribute("y2", "1");
    g.innerHTML = '<stop offset="0" stop-color="#cf9f60" stop-opacity="0.28"/><stop offset="1" stop-color="#cf9f60" stop-opacity="0"/>';
    defs.appendChild(g); svg.appendChild(defs);
    [0, 0.25, 0.5, 0.75, 1].forEach(function (gg) {
      var gy = DPT + (DH - DPT - DPB) * gg, ln = document.createElementNS(SVGNS, "line");
      ln.setAttribute("class", "d-grid"); ln.setAttribute("x1", DPL); ln.setAttribute("x2", DW - DPR); ln.setAttribute("y1", gy); ln.setAttribute("y2", gy); svg.appendChild(ln);
    });
    var area = document.createElementNS(SVGNS, "path"); area.setAttribute("class", "d-area"); area.setAttribute("fill", "url(#dg-agent)");
    area.setAttribute("d", "M" + dux(0) + "," + (DH - DPB) + " " + duoPath(DUO.agent).replace("M", "L") + " L" + dux(DN - 1) + "," + (DH - DPB) + " Z"); svg.appendChild(area);
    var comp = document.createElementNS(SVGNS, "path"); comp.setAttribute("class", "d-comp"); comp.setAttribute("d", duoPath(DUO.comp)); svg.appendChild(comp);
    var agent = document.createElementNS(SVGNS, "path"); agent.setAttribute("class", "d-agent"); agent.setAttribute("d", duoPath(DUO.agent)); svg.appendChild(agent);
    var ex = dux(DN - 1), ay = duy(DUO.agent[DN - 1]), cy = duy(DUO.comp[DN - 1]);
    ["d-pulse", "d-dot-a"].forEach(function (cls) { var c = document.createElementNS(SVGNS, "circle"); c.setAttribute("class", cls); c.setAttribute("cx", ex); c.setAttribute("cy", ay); c.setAttribute("r", cls === "d-pulse" ? 4 : 4.5); svg.appendChild(c); });
    function txt(cls, xx, yy, s) { var t = document.createElementNS(SVGNS, "text"); t.setAttribute("class", cls); t.setAttribute("x", xx); t.setAttribute("y", yy); t.textContent = s; svg.appendChild(t); }
    txt("d-vlbl-a", ex + 10, ay + 3, "$47bn"); txt("d-vlbl-c", ex + 10, cy + 5, "£20bn");
    [[0, 2024, "start"], [3, 2027, "middle"], [6, 2030, "end"]].forEach(function (p) {
      var t = document.createElementNS(SVGNS, "text"); t.setAttribute("class", "d-xlbl"); t.setAttribute("x", dux(p[0])); t.setAttribute("y", DH - 8); t.setAttribute("text-anchor", p[2]); t.textContent = p[1]; svg.appendChild(t);
    });
    plot.appendChild(svg);
    [comp, agent].forEach(function (p) { var len = p.getTotalLength(); p.style.strokeDasharray = len; p.style.strokeDashoffset = reduce ? 0 : len; p.style.transition = "none"; });
    duo = { plot: plot, comp: comp, agent: agent };
  }
  function animDuo() {
    if (!duo) return;
    duo.plot.classList.add("d-in");
    if (reduce) { duo.comp.style.strokeDashoffset = 0; duo.agent.style.strokeDashoffset = 0; return; }
    [duo.comp, duo.agent].forEach(function (p, i) {
      p.getBoundingClientRect();
      p.style.transition = "stroke-dashoffset 1.7s cubic-bezier(.4,.75,.3,1) " + (i * 0.18) + "s";
      p.style.strokeDashoffset = 0;
    });
  }
  function buildBull() {
    var box = $("[data-bull]"); if (!box) return;
    var svg = document.createElementNS(SVGNS, "svg"); svg.setAttribute("viewBox", "0 0 220 220"); svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    ["M18,110 H202", "M110,18 V202"].forEach(function (d) { var l = document.createElementNS(SVGNS, "path"); l.setAttribute("class", "b-cross"); l.setAttribute("d", d); svg.appendChild(l); });
    [[96, "b-tam"], [60, "b-sam"]].forEach(function (r) { var c = document.createElementNS(SVGNS, "circle"); c.setAttribute("class", "b-ring " + r[1]); c.setAttribute("cx", 110); c.setAttribute("cy", 110); c.setAttribute("r", r[0]); svg.appendChild(c); });
    var som = document.createElementNS(SVGNS, "circle"); som.setAttribute("class", "b-som"); som.setAttribute("cx", 110); som.setAttribute("cy", 110); som.setAttribute("r", 26); svg.appendChild(som);
    box.appendChild(svg);
  }
  buildDuo(); buildBull();

  // ---- scroll spine + parallax --------------------------------------------
  var spineFill = $("#spineFill"), pxEls = $$("[data-px]"), ticking = false;
  function fx() {
    ticking = false;
    var de = document.documentElement, sc = window.scrollY || de.scrollTop, max = de.scrollHeight - de.clientHeight, p = max > 0 ? sc / max : 0;
    if (spineFill) spineFill.style.setProperty("--p", (p * 100).toFixed(2) + "%");
    if (reduce) return;
    var vh = window.innerHeight;
    pxEls.forEach(function (el) {
      var r = el.getBoundingClientRect(), mid = r.top + r.height / 2 - vh / 2, sp = parseFloat(el.getAttribute("data-px")) || 0;
      el.style.transform = "translate3d(0," + (mid * sp).toFixed(1) + "px,0)";
    });
  }
  function onFx() { if (!ticking) { ticking = true; requestAnimationFrame(fx); } }
  window.addEventListener("scroll", onFx, { passive: true });
  window.addEventListener("resize", onFx); fx();

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
