(function(){
var q=new URLSearchParams(location.search);
function g(k,max){var v=(q.get(k)||"").trim();return v.slice(0,max||280);}
var d={c:g("c",120),b:g("b",80),r:g("r",80),m:g("m",280),a:g("a",120),dt:g("d",10),w:g("w",15).replace(/\D/g,"")};
function fmtDate(s){var m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(s);return m?m[3]+"/"+m[2]+"/"+m[1]:"";}
function fill(name,val){document.querySelectorAll('[data-fill="'+name+'"]').forEach(function(e){e.textContent=val;});}
function show(name,on){document.querySelectorAll('[data-show="'+name+'"]').forEach(function(e){e.style.display=on?(e.tagName==="SPAN"?"inline":"block"):"none";});}
fill("condo",d.c);fill("bairro",d.b);fill("resp",d.r);fill("msg",d.m);fill("acao",d.a);fill("data",fmtDate(d.dt));
show("condo",!!d.c);show("resp",!!d.r);show("msg",!!d.m);show("acao",!!d.a);show("data",!!fmtDate(d.dt));
var cond=d.c?(" do "+d.c):"";
var txt=document.body.getAttribute("data-wa")||"Olá, Wellington! Vi sua apresentação e gostaria de conversar.";
if(d.c) txt+=" (Condomínio "+d.c+")";
document.querySelectorAll(".wa").forEach(function(a){
var t2=a.getAttribute("data-wa")||txt;
if(d.w){a.href="https://wa.me/"+d.w+"?text="+encodeURIComponent(t2);a.target="_blank";a.rel="noopener noreferrer";}
else a.classList.add("hide");
});
document.querySelectorAll(".nowa").forEach(function(e){e.style.display=d.w?"none":"";});
if(d.c) document.title=document.title+" | "+d.c;
var pb=document.getElementById("printbtn");if(pb)pb.addEventListener("click",function(){window.print();});
if(q.get("print")==="1")window.addEventListener("load",function(){setTimeout(function(){window.print();},600);});
})();
