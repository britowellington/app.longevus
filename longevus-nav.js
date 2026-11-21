/* Longevus: rodapé de navegação para as páginas que abrem fora do app
   (Mente Ativa, Elo 60+, Programa, Biblioteca, Circuito...).
   O aluno.html grava sessionStorage "lv_ctx" = "aluno" e o longevus-app.html grava "painel".
   Aqui o rodapé certo aparece de acordo com quem abriu a página. Sem contexto, nada aparece. */
(function () {
  if (window.__lvNav) return;
  window.__lvNav = true;
  var ctx = null;
  try {
    var q = new URLSearchParams(location.search);
    if (q.get("ctx") === "aluno" || q.get("ctx") === "painel") { ctx = q.get("ctx"); sessionStorage.setItem("lv_ctx", ctx); }
    ctx = ctx || sessionStorage.getItem("lv_ctx");
    if (!ctx) {
      // Páginas abertas numa aba nova (como no app instalado) não herdam o sessionStorage
      var salvo = JSON.parse(localStorage.getItem("lv_ctx") || "null");
      if (salvo && salvo.c && Date.now() - salvo.t < 12 * 3600 * 1000) ctx = salvo.c;
    }
  } catch (e) {}
  if (ctx !== "aluno" && ctx !== "painel") return;

  var ic = {
    home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
    dumbbell: '<path d="M6.5 6.5v11M17.5 6.5v11M3 9.5v5M21 9.5v5M6.5 12h11"/>',
    calendar: '<rect x="3" y="4.5" width="18" height="16.5" rx="2.5"/><path d="M16 2.5v4M8 2.5v4M3 10h18"/>',
    food: '<path d="M4 2v7c0 1.1.9 2 2 2h2a2 2 0 0 0 2-2V2M7 2v20M20 15V2a4 4 0 0 0-4 4v7c0 1.1.9 2 2 2zm0 0v7"/>',
    clipboard: '<rect x="5" y="4" width="14" height="17" rx="2.5"/><path d="M9 4V3h6v1M9 10h6M9 14h6M9 18h3"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.6 3.3-5.5 6.5-5.5s5.9 1.9 6.5 5.5M16 4.8a3.3 3.3 0 0 1 0 6.4M18 14.8c1.9.7 3.1 2.4 3.5 5.2"/>',
    zap: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>'
  };
  var itens = ctx === "aluno" ? [
    ["home", "Início", "aluno.html?tab=inicio"],
    ["dumbbell", "Treino", "aluno.html?tab=treino"],
    ["calendar", "Programação", "aluno.html?tab=programacao"],
    ["food", "Calorias", "aluno.html?tab=alimentacao"],
    ["clipboard", "Avaliação", "aluno.html?tab=avaliacao"]
  ] : [
    ["home", "Início", "longevus-app.html?page=dashboard"],
    ["users", "Alunos", "longevus-app.html?page=students"],
    ["clipboard", "Avaliações", "longevus-app.html?page=assessments"],
    ["zap", "Programa", "longevus-programa.html"],
    ["menu", "Mais", "longevus-app.html?menu=1"]
  ];
  var pagina = location.pathname.split("/").pop();
  var H = 62;

  var css = document.createElement("style");
  css.textContent =
    "#lvnav{position:fixed;left:0;right:0;bottom:0;z-index:2147483000;background:#fff;border-top:1.5px solid #e2e8f0;display:flex;justify-content:space-around;padding:7px 0 max(7px, env(safe-area-inset-bottom));box-shadow:0 -2px 12px rgba(15,23,42,.06);font-family:-apple-system,'Segoe UI',Roboto,sans-serif}" +
    "#lvnav a{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;text-decoration:none;color:#94a3b8;font-size:10px;font-weight:700;padding:3px 2px;-webkit-tap-highlight-color:transparent}" +
    "#lvnav a.on{color:#FF5603}#lvnav svg{width:22px;height:22px}" +
    "html.lvnav-on body{padding-bottom:calc(" + H + "px + env(safe-area-inset-bottom)) !important}" +
    "@media print{#lvnav{display:none}}";
  document.head.appendChild(css);

  var montar = function () {
    if (document.getElementById("lvnav")) return;
    var nav = document.createElement("nav");
    nav.id = "lvnav";
    nav.setAttribute("aria-label", "Navegação do app");
    nav.innerHTML = itens.map(function (it) {
      var ativo = it[2].split("?")[0] === pagina;
      return '<a href="' + it[2] + '"' + (ativo ? ' class="on"' : "") + '><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + ic[it[0]] + "</svg><span>" + it[1] + "</span></a>";
    }).join("");
    document.body.appendChild(nav);
    document.documentElement.classList.add("lvnav-on");
    ajustar();
  };

  // Empurra para cima o que a página já fixa no rodapé e encolhe as telas de altura cheia,
  // para nada ficar escondido atrás do rodapé.
  var ajustar = function () {
    var nav = document.getElementById("lvnav");
    if (!nav) return;
    var h = nav.offsetHeight || H;
    var vh = window.innerHeight;
    var els = document.body.querySelectorAll("*");
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (el === nav || nav.contains(el) || el.__lvAjustado) continue;
      var st = el.getAttribute("style");
      if (!st || st.indexOf("fixed") < 0 && st.indexOf("vh") < 0) continue;
      var cs = getComputedStyle(el);
      if (cs.position === "fixed") {
        var b = parseFloat(cs.bottom);
        var top = parseFloat(cs.top);
        if (!isNaN(b) && b < h && (isNaN(top) || cs.top === "auto")) {
          el.style.bottom = (b + h) + "px"; el.__lvAjustado = true;
        } else if (!isNaN(b) && b === 0 && !isNaN(top) && top === 0) {
          el.style.bottom = h + "px"; el.__lvAjustado = true;
        }
      } else if (st.indexOf("vh") >= 0 && Math.abs(el.offsetHeight - vh) < 4) {
        el.style.height = "calc(" + (st.indexOf("dvh") >= 0 ? "100dvh" : "100vh") + " - " + h + "px)";
        if (cs.minHeight && cs.minHeight !== "0px") el.style.minHeight = "calc(100vh - " + h + "px)";
        el.__lvAjustado = true;
      }
    }
  };
  var agendado = null;
  var obs = new MutationObserver(function () { if (agendado) return; agendado = setTimeout(function () { agendado = null; ajustar(); }, 120); });

  var iniciar = function () { montar(); obs.observe(document.body, { childList: true, subtree: true }); };
  if (document.body) iniciar(); else document.addEventListener("DOMContentLoaded", iniciar);
})();
