/* Projeto Condomínios, módulo do Longevus. Expõe window.ProjetoCondominios.Page.
   Todas as dependências do app chegam por props (deps), então o módulo não depende da ordem de carregamento. */
(function(){
const { useState, useMemo, useEffect, useCallback } = React;

const STAGES = [
{id:1,l:"Mapeado"},{id:2,l:"Aluno identificado"},{id:3,l:"Apresentação por aluno solicitada"},
{id:4,l:"Contato com síndico/administração"},{id:5,l:"Apresentação profissional enviada"},
{id:6,l:"Reunião ou conversa realizada"},{id:7,l:"Proposta de ação apresentada"},
{id:8,l:"Autorização concedida"},{id:9,l:"Condomínio ativado"},{id:10,l:"Em acompanhamento"},
{id:11,l:"Sem interesse / encerrado"}
];
const LSTAGES = [
{id:1,l:"Novo interessado"},{id:2,l:"Primeiro contato realizado"},{id:3,l:"Consulta estratégica agendada"},
{id:4,l:"Consulta realizada"},{id:5,l:"Proposta apresentada"},{id:6,l:"Em negociação"},
{id:7,l:"Fechado"},{id:8,l:"Não fechado"}
];
const POTENCIAL = [{v:"",l:"Não classificado"},{v:"Alto",l:"Alto"},{v:"Médio",l:"Médio"},{v:"Baixo",l:"Baixo"}];
const SIMNAO = [{v:"",l:"Não informado"},{v:"sim",l:"Sim"},{v:"nao",l:"Não"},{v:"avaliar",l:"A avaliar"}];
const INTERACOES = ["WhatsApp","Ligação","Visita presencial","E-mail","Reunião","Envio de material","Anotação"];
const PERFIS_LEAD = [{v:"50+",l:"Pessoa 50+"},{v:"familiar",l:"Familiar"},{v:"outro",l:"Outro"}];
const SERVICOS = [{v:"",l:"A definir"},{v:"Personal no condomínio",l:"Personal no condomínio"},{v:"Casal",l:"Atendimento para casais"},{v:"Pequeno grupo",l:"Pequenos grupos"},{v:"Consultoria",l:"Consultoria de treinamento"},{v:"Outro",l:"Outro"}];
const ORIGENS = [{v:"Aluno atual",l:"Indicação de aluno atual"},{v:"Apresentação digital",l:"Apresentação digital"},{v:"Evento no condomínio",l:"Evento no condomínio"},{v:"Síndico/administração",l:"Síndico ou administração"},{v:"Outro",l:"Outro"}];
const AGORA = function(){ var d=new Date(); return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); };
const digits = function(s){ return String(s||"").replace(/\D/g,""); };
const waNum = function(s){ var d=digits(s); if(!d) return ""; return (d.length===10||d.length===11)?"55"+d:d; };
const norm = function(s){ return String(s||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/\s+/g," ").trim(); };
const stageName = function(id){ var s=STAGES.find(function(x){return x.id===id;}); return s?s.l:""; };
const lstageName = function(id){ var s=LSTAGES.find(function(x){return x.id===id;}); return s?s.l:""; };
const MATERIAIS = [
{id:"sindicos",file:"apresentacao-sindicos.html",titulo:"Movimento e Longevidade nos Condomínios",pub:"Síndicos e administradoras"},
{id:"moradores",file:"apresentacao-moradores.html",titulo:"Sua academia está dentro do condomínio",pub:"Moradores"},
{id:"indicacao",file:"apresentacao-indicacao.html",titulo:"Indicação de alunos",pub:"Alunos que indicam vizinhos e amigos"},
{id:"academia",file:"academia-assistida.html",titulo:"Academia Assistida",pub:"Academia Assistida",fixo:true}
];

function rangeOf(p){
var now=new Date(), y=now.getFullYear(), m=now.getMonth();
var f=function(d){ return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); };
if(p.preset==="mes") return [f(new Date(y,m,1)),f(new Date(y,m+1,0))];
if(p.preset==="tri"){ var q=Math.floor(m/3)*3; return [f(new Date(y,q,1)),f(new Date(y,q+3,0))]; }
if(p.preset==="ano") return [f(new Date(y,0,1)),f(new Date(y,11,31))];
if(p.preset==="custom") return [p.de||"0000-00-00",p.ate||"9999-12-31"];
return ["0000-00-00","9999-12-31"];
}

function copyText(t){
try{
if(navigator.clipboard&&window.isSecureContext){ return navigator.clipboard.writeText(t).then(function(){return true;}).catch(function(){return fb();}); }
}catch(e){}
return Promise.resolve(fb());
function fb(){
try{ var a=document.createElement("textarea"); a.value=t; a.style.position="fixed"; a.style.opacity="0"; document.body.appendChild(a); a.focus(); a.select(); var ok=document.execCommand("copy"); document.body.removeChild(a); return ok; }catch(e){ return false; }
}
}

function Page(props){
const D = props.deps;
const Card=D.Card, Btn=D.Btn, Inp=D.Inp, Modal=D.Modal, Badge=D.Badge, I=D.I, O=D.O, uid=D.uid, fmt=D.fmt, fmtR=D.fmtR;
const condos=props.condos, setCondos=props.setCondos, leads=props.condoLeads, setLeads=props.setCondoLeads;
const students=props.students, setStudents=props.setStudents;
const initialTab = (props.pageProps && props.pageProps.tab) || "painel";
const [tab,setTab]=useState(initialTab);
const [sel,setSel]=useState(null);
const [formCondo,setFormCondo]=useState(null);
const [formLead,setFormLead]=useState(null);
const [period,setPeriod]=useState({preset:"mes",de:"",ate:""});
const [fCondo,setFCondo]=useState("");
const [toast,setToast]=useState("");
const [prof,setProf]=useState(null);
const [qLista,setQ]=useState("");
const [stLead,setSt]=useState(0);
const [mat,setMat]=useState("sindicos");
const [cid,setCid]=useState("");
const [fm,setF]=useState({responsavel:"",mensagem:"",tipoAcao:"",data:"",whats:""});
const [prev,setPrev]=useState(false);
const [modal,setModal]=useState("");
const [hh,setH]=useState({pessoa:"",tipo:"WhatsApp",resultado:"",proxima:"",proximaData:"",obs:"",data:AGORA()});
const [pick,setPick]=useState("");
const dupLead=useMemo(function(){
if(!formLead) return null;
var t=digits(formLead.telefone), n=norm(formLead.nome);
return students.find(function(s){ return (t.length>=8&&(digits(s.whatsapp).slice(-8)===t.slice(-8)||digits(s.phone).slice(-8)===t.slice(-8))) || (n&&norm(s.name)===n); })||null;
},[formLead&&formLead.nome,formLead&&formLead.telefone,students]);

useEffect(function(){
var alive=true;
(async function(){
try{
if(!props.session) return;
var h=await D.DB.authHeaders();
var r=await fetch(D.SUPA_URL+"/rest/v1/professionals?select=nome,whatsapp&id=eq."+props.session.user.id,{headers:h});
if(!r.ok) return;
var j=await r.json();
if(alive&&j&&j[0]) setProf(j[0]);
}catch(e){}
})();
return function(){alive=false;};
},[]);

const say=function(t){ setToast(t); setTimeout(function(){setToast("");},2200); };
const hoje=AGORA();
const [de,ate]=rangeOf(period);
const inR=function(d){ return !!d && d>=de && d<=ate; };
const studentById=useMemo(function(){ var m={}; students.forEach(function(s){m[s.id]=s;}); return m; },[students]);
const condoById=useMemo(function(){ var m={}; condos.forEach(function(c){m[c.id]=c;}); return m; },[condos]);

const saveCondo=function(c){
setCondos(function(prev){ return prev.some(function(x){return x.id===c.id;})?prev.map(function(x){return x.id===c.id?c:x;}):prev.concat([c]); });
};
const delCondo=function(c){
if(!window.confirm("Excluir o condomínio "+c.nome+"? Os alunos vinculados não são apagados. Leads deste condomínio ficam sem condomínio de origem.")) return;
D.DB.remove("condominios",c.id);
setCondos(function(prev){return prev.filter(function(x){return x.id!==c.id;});});
setLeads(function(prev){return prev.map(function(l){return l.condoId===c.id?Object.assign({},l,{condoId:""}):l;});});
setSel(null);
};
const addHist=function(c,h){
var item=Object.assign({id:uid(),data:hoje,pessoa:"",tipo:"WhatsApp",resultado:"",proxima:"",proximaData:"",obs:"",feito:false},h);
saveCondo(Object.assign({},c,{historico:[item].concat(c.historico||[])}));
};
const moveStage=function(c,novo){
if(novo===c.etapa||novo<1||novo>11) return;
var ed=Object.assign({},c.etapaDatas||{}); ed[novo]=hoje;
var item={id:uid(),data:hoje,pessoa:"",tipo:"Mudança de etapa",resultado:stageName(c.etapa)+" para "+stageName(novo),proxima:"",proximaData:"",obs:"",feito:true};
saveCondo(Object.assign({},c,{etapa:novo,etapaDatas:ed,historico:[item].concat(c.historico||[])}));
};
const moveLead=function(l,novo){
if(novo===l.etapa) return;
var ed=Object.assign({},l.etapaDatas||{});
if(novo<=7){ for(var i=1;i<=novo;i++){ if(!ed[i]) ed[i]=hoje; } } else { ed[8]=hoje; }
var nl=Object.assign({},l,{etapa:novo,etapaDatas:ed});
setLeads(function(prev){return prev.map(function(x){return x.id===l.id?nl:x;});});
};
const saveLead=function(l){
setLeads(function(prev){ return prev.some(function(x){return x.id===l.id;})?prev.map(function(x){return x.id===l.id?l:x;}):prev.concat([l]); });
};
const delLead=function(l){
if(!window.confirm("Excluir o lead "+l.nome+"?")) return;
D.DB.remove("condominio_leads",l.id);
setLeads(function(prev){return prev.filter(function(x){return x.id!==l.id;});});
};

const pendentes=useMemo(function(){
var out=[];
condos.forEach(function(c){ (c.historico||[]).forEach(function(h){ if(h.proximaData&&!h.feito) out.push({c:c,h:h}); }); });
out.sort(function(a,b){return a.h.proximaData<b.h.proximaData?-1:1;});
return out;
},[condos]);
const atrasados=pendentes.filter(function(p){return p.h.proximaData<hoje;}).length;
const concluirFollow=function(c,h){
saveCondo(Object.assign({},c,{historico:(c.historico||[]).map(function(x){return x.id===h.id?Object.assign({},x,{feito:true}):x;})}));
};

const tabs=[["painel","Painel"],["condominios","Condomínios"],["pipeline","Pipeline"],["leads","Leads"],["materiais","Materiais"]];
const S={sec:{fontWeight:800,fontSize:15,color:"#0f172a",margin:"18px 0 10px"},muted:{fontSize:12,color:"#64748b"},chip:function(on){return {padding:"7px 13px",borderRadius:99,border:"1.5px solid "+(on?O:"#e2e8f0"),background:on?O:"#fff",color:on?"#fff":"#475569",fontWeight:700,fontSize:12,cursor:"pointer",whiteSpace:"nowrap"};}};

function vencBadge(d){
if(d<hoje) return <Badge color="#dc2626" bg="#fee2e2">Atrasado</Badge>;
if(d===hoje) return <Badge color="#d97706" bg="#fef3c7">Hoje</Badge>;
return <Badge color="#475569" bg="#f1f5f9">{fmt(d)}</Badge>;
}

/* ---------- PAINEL ---------- */
function Painel(){
var cs=fCondo?condos.filter(function(c){return c.id===fCondo;}):condos;
var ls=fCondo?leads.filter(function(l){return l.condoId===fCondo;}):leads;
var alunosIds={}; cs.forEach(function(c){ (c.alunos||[]).forEach(function(a){alunosIds[a.studentId]=1;}); });
var contatos=0; cs.forEach(function(c){ (c.historico||[]).forEach(function(h){ if(h.tipo!=="Anotação"&&h.tipo!=="Mudança de etapa"&&inR(h.data)) contatos++; }); });
var reach=function(n){ return ls.filter(function(l){return inR((l.etapaDatas||{})[n]);}).length; };
var gerados=ls.filter(function(l){return inR(l.primeiroContato||(l.etapaDatas||{})[1]);}).length;
var agendadas=reach(3), realizadas=reach(4), propostas=reach(5), fechados=reach(7);
var receita=0; ls.forEach(function(l){ if(l.etapa===7&&inR((l.etapaDatas||{})[7])) receita+=Number(l.valorMensal||0); });
var kpis=[
["Condomínios cadastrados",cs.length],
["Em prospecção",cs.filter(function(c){return c.etapa>=1&&c.etapa<=7;}).length],
["Com autorização de acesso",cs.filter(function(c){return c.etapa>=8&&c.etapa<=10;}).length],
["Com relacionamento ativo",cs.filter(function(c){return c.etapa===9||c.etapa===10;}).length],
["Alunos vinculados",Object.keys(alunosIds).length],
["Leads gerados",gerados],
["Consultas agendadas",agendadas],
["Propostas apresentadas",propostas],
["Novos alunos conquistados",fechados],
["Receita mensal originada",fmtR(receita)]
];
var funil=[["Contatos realizados",contatos],["Interessados gerados",gerados],["Consultas realizadas",realizadas],["Propostas apresentadas",propostas],["Contratos fechados",fechados]];
var maxF=Math.max(1,Math.max.apply(null,funil.map(function(x){return x[1];})));
var prov=pendentes.slice(0,6);
return <div>
<Card style={{padding:14}}>
<div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:10}}>
{[["mes","Mês"],["tri","Trimestre"],["ano","Ano"],["tudo","Tudo"],["custom","Período"]].map(function(p){return <button key={p[0]} onClick={function(){setPeriod(Object.assign({},period,{preset:p[0]}));}} style={S.chip(period.preset===p[0])}>{p[1]}</button>;})}
</div>
{period.preset==="custom"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
<Inp label="De" type="date" value={period.de} onChange={function(v){setPeriod(Object.assign({},period,{de:v}));}}/>
<Inp label="Até" type="date" value={period.ate} onChange={function(v){setPeriod(Object.assign({},period,{ate:v}));}}/>
</div>}
<Inp label="Condomínio" value={fCondo} onChange={setFCondo} opts={[{v:"",l:"Todos os condomínios"}].concat(condos.map(function(c){return {v:c.id,l:c.nome};}))}/>
</Card>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:12}}>
{kpis.map(function(k){return <Card key={k[0]} style={{padding:14}}><div style={{fontSize:22,fontWeight:800,color:O}}>{k[1]}</div><div style={S.muted}>{k[0]}</div></Card>;})}
</div>
<div style={S.sec}>Conversão no período</div>
<Card>
{funil.map(function(f,i){return <div key={f[0]} style={{marginBottom:i<funil.length-1?12:0}}>
<div style={{display:"flex",justifyContent:"space-between",fontSize:13,fontWeight:600,color:"#334155",marginBottom:4}}><span>{f[0]}</span><span>{f[1]}</span></div>
<div style={{height:8,background:"#f1f5f9",borderRadius:99}}><div style={{height:8,borderRadius:99,background:O,width:(f[1]/maxF*100)+"%"}}/></div>
</div>;})}
<div style={{fontSize:11,color:"#94a3b8",marginTop:10}}>Contatos vêm do histórico dos condomínios. Os demais números vêm das datas de cada etapa dos leads. A receita soma o valor mensal dos leads fechados no período.</div>
</Card>
<div style={S.sec}>Follow-ups pendentes {atrasados>0&&<span style={{color:"#dc2626"}}>({atrasados} em atraso)</span>}</div>
{prov.length===0&&<Card><div style={S.muted}>Nenhum acompanhamento pendente.</div></Card>}
{prov.map(function(p){return <Card key={p.h.id} style={{marginBottom:8,padding:14}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
<div style={{fontWeight:700,fontSize:14,cursor:"pointer"}} onClick={function(){setSel(p.c.id);setTab("condominios");}}>{p.c.nome}</div>{vencBadge(p.h.proximaData)}
</div>
<div style={{fontSize:13,color:"#475569",margin:"4px 0 8px"}}>{p.h.proxima||"Retomar contato"}</div>
<Btn sm variant="outline" onClick={function(){concluirFollow(p.c,p.h);}} icon="check">Marcar como feito</Btn>
</Card>;})}
<RelatorioBlocos cs={cs} ls={ls}/>
</div>;
}

function RelatorioBlocos(p){
var cs=p.cs, ls=p.ls;
var porCondo=cs.map(function(c){
var l=ls.filter(function(x){return x.condoId===c.id;});
var f=l.filter(function(x){return x.etapa===7;});
return {c:c,leads:l.length,fechados:f.length,receita:f.reduce(function(a,x){return a+Number(x.valorMensal||0);},0),conv:l.length?Math.round(f.length/l.length*100):0};
});
var top=porCondo.slice().sort(function(a,b){return b.leads-a.leads;}).filter(function(x){return x.leads>0;}).slice(0,5);
var alto=cs.filter(function(c){return c.potencial==="Alto";});
var orig={}; ls.forEach(function(l){var o=l.origem||"Não informado"; orig[o]=(orig[o]||0)+1;});
var origList=Object.keys(orig).sort(function(a,b){return orig[b]-orig[a];});
return <div>
<div style={S.sec}>Condomínios com maior número de leads</div>
<Card>{top.length===0?<div style={S.muted}>Ainda sem leads.</div>:top.map(function(x){return <div key={x.c.id} style={{display:"flex",justifyContent:"space-between",fontSize:13,padding:"6px 0",borderBottom:"1px solid #f1f5f9"}}><span style={{fontWeight:600}}>{x.c.nome}</span><span style={{color:"#64748b"}}>{x.leads} leads · {x.fechados} fechados · {x.conv}%</span></div>;})}</Card>
<div style={S.sec}>Condomínios com potencial alto</div>
<Card>{alto.length===0?<div style={S.muted}>Nenhum classificado como alto.</div>:alto.map(function(c){return <div key={c.id} style={{fontSize:13,padding:"5px 0",fontWeight:600}}>{c.nome} <span style={{fontWeight:400,color:"#64748b"}}>· {stageName(c.etapa)}</span></div>;})}</Card>
<div style={S.sec}>Origem dos contatos</div>
<Card>{origList.length===0?<div style={S.muted}>Sem dados ainda.</div>:origList.map(function(o){return <div key={o} style={{display:"flex",justifyContent:"space-between",fontSize:13,padding:"5px 0"}}><span>{o}</span><b>{orig[o]}</b></div>;})}</Card>
<div style={S.sec}>Receita mensal por condomínio</div>
<Card>{porCondo.filter(function(x){return x.receita>0;}).length===0?<div style={S.muted}>Informe o valor mensal ao fechar um lead.</div>:porCondo.filter(function(x){return x.receita>0;}).map(function(x){return <div key={x.c.id} style={{display:"flex",justifyContent:"space-between",fontSize:13,padding:"5px 0"}}><span>{x.c.nome}</span><b>{fmtR(x.receita)}</b></div>;})}</Card>
</div>;
}

/* ---------- LISTA E DETALHE ---------- */
function Lista(){
var q=qLista;
var list=condos.filter(function(c){return !q||norm(c.nome+" "+c.bairro).indexOf(norm(q))>=0;});
return <div>
<div style={{display:"flex",gap:8,marginBottom:12}}>
<div style={{flex:1}}><Inp value={q} onChange={setQ} placeholder="Buscar condomínio ou bairro"/></div>
<div style={{marginBottom:13}}><Btn onClick={function(){setFormCondo(novoCondo());}} icon="plus">Novo</Btn></div>
</div>
{list.length===0&&<Card><div style={S.muted}>Nenhum condomínio cadastrado. Toque em Novo para começar.</div></Card>}
{list.map(function(c){
var pend=(c.historico||[]).filter(function(h){return h.proximaData&&!h.feito;}).sort(function(a,b){return a.proximaData<b.proximaData?-1:1;})[0];
var nl=leads.filter(function(l){return l.condoId===c.id;}).length;
return <Card key={c.id} onClick={function(){setSel(c.id);}} style={{marginBottom:10,padding:14}}>
<div style={{display:"flex",justifyContent:"space-between",gap:8,alignItems:"flex-start"}}>
<div><div style={{fontWeight:800,fontSize:15,color:"#0f172a"}}>{c.nome}</div><div style={S.muted}>{[c.bairro,c.cidade].filter(Boolean).join(" · ")}</div></div>
{c.potencial&&<Badge color={c.potencial==="Alto"?"#16a34a":c.potencial==="Médio"?"#d97706":"#64748b"} bg="#f8fafc">{c.potencial}</Badge>}
</div>
<div style={{fontSize:13,color:"#334155",margin:"8px 0 4px"}}>{stageName(c.etapa)}</div>
<div style={S.muted}>{(c.alunos||[]).length} alunos vinculados · {nl} leads</div>
{pend&&<div style={{marginTop:8,display:"flex",gap:8,alignItems:"center",fontSize:12,color:"#475569"}}>{vencBadge(pend.proximaData)}<span>{pend.proxima||"Retomar contato"}</span></div>}
</Card>;
})}
</div>;
}

function novoCondo(){
return {id:uid(),nome:"",endereco:"",bairro:"",cidade:"São Bernardo do Campo",sindico:"",responsavel:"",telefone:"",whatsapp:"",email:"",unidades:"",perfilMoradores:"",temAcademia:"",estrutura:"",regrasAcademia:"",credenciamento:"",divulgacao:"",eventos:"",observacoes:"",potencial:"",etapa:1,etapaDatas:{1:AGORA()},alunos:[],historico:[],apresentacao:{responsavel:"",mensagem:"",tipoAcao:"",data:""},createdAt:AGORA()};
}

function FormCondo(){
var c=formCondo;
var up=function(k){return function(v){setFormCondo(function(p){var n=Object.assign({},p); n[k]=v; return n;});};};
var novo=!condos.some(function(x){return x.id===c.id;});
return <Modal title={novo?"Novo condomínio":"Editar condomínio"} onClose={function(){setFormCondo(null);}}>
<Inp label="Nome do condomínio" value={c.nome} onChange={up("nome")}/>
<Inp label="Endereço" value={c.endereco} onChange={up("endereco")}/>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
<Inp label="Bairro" value={c.bairro} onChange={up("bairro")}/>
<Inp label="Cidade" value={c.cidade} onChange={up("cidade")}/>
</div>
<Inp label="Síndico" value={c.sindico} onChange={up("sindico")}/>
<Inp label="Administrador ou responsável" value={c.responsavel} onChange={up("responsavel")}/>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
<Inp label="Telefone" value={c.telefone} onChange={up("telefone")}/>
<Inp label="WhatsApp" value={c.whatsapp} onChange={up("whatsapp")}/>
</div>
<Inp label="E-mail" value={c.email} onChange={up("email")}/>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
<Inp label="Unidades (estimado)" type="number" value={c.unidades} onChange={up("unidades")}/>
<Inp label="Potencial" value={c.potencial} onChange={up("potencial")} opts={POTENCIAL}/>
</div>
<Inp label="Perfil predominante dos moradores" value={c.perfilMoradores} onChange={up("perfilMoradores")}/>
<Inp label="Tem academia?" value={c.temAcademia} onChange={up("temAcademia")} opts={SIMNAO}/>
<Inp label="Estrutura disponível" value={c.estrutura} onChange={up("estrutura")}/>
<Inp label="Regras de utilização da academia" value={c.regrasAcademia} onChange={up("regrasAcademia")}/>
<Inp label="Exige credenciamento?" value={c.credenciamento} onChange={up("credenciamento")} opts={SIMNAO}/>
<Inp label="Permite divulgação interna?" value={c.divulgacao} onChange={up("divulgacao")} opts={SIMNAO}/>
<Inp label="Permite eventos?" value={c.eventos} onChange={up("eventos")} opts={SIMNAO}/>
<Inp label="Observações gerais" value={c.observacoes} onChange={up("observacoes")}/>
<div style={{display:"flex",gap:10,marginTop:6}}>
<Btn full variant="secondary" onClick={function(){setFormCondo(null);}}>Cancelar</Btn>
<Btn full disabled={!c.nome.trim()} onClick={function(){saveCondo(Object.assign({},c,{nome:c.nome.trim()})); setFormCondo(null); if(novo) setSel(c.id);}}>Salvar</Btn>
</div>
</Modal>;
}

function Detalhe(){
var c=condoById[sel];
var h=hh;
if(!c) return <div><Btn variant="ghost" onClick={function(){setSel(null);}} icon="back">Voltar</Btn></div>;
var ja={}; condos.forEach(function(x){ (x.alunos||[]).forEach(function(a){ja[a.studentId]=x.nome;}); });
var livres=students.filter(function(s){return !ja[s.id];});
var vinc=(c.alunos||[]).map(function(a){return {a:a,s:studentById[a.studentId]};}).filter(function(x){return x.s;});
var cl=leads.filter(function(l){return l.condoId===c.id;});
var updAluno=function(sid,patch){ saveCondo(Object.assign({},c,{alunos:c.alunos.map(function(a){return a.studentId===sid?Object.assign({},a,patch):a;})})); };
var Flag=function(p){ return <label style={{display:"flex",alignItems:"center",gap:8,fontSize:12,color:"#475569",marginTop:6}}><input type="checkbox" checked={!!p.v} onChange={function(e){p.on(e.target.checked);}}/>{p.l}</label>; };
var tel=waNum(c.whatsapp||c.telefone);
return <div>
<Btn variant="ghost" sm onClick={function(){setSel(null);}} icon="back">Condomínios</Btn>
<Card style={{marginTop:8}}>
<div style={{display:"flex",justifyContent:"space-between",gap:8}}>
<div><div style={{fontWeight:800,fontSize:18}}>{c.nome}</div><div style={S.muted}>{[c.endereco,c.bairro,c.cidade].filter(Boolean).join(" · ")}</div></div>
<div style={{display:"flex",gap:6}}><Btn sm variant="secondary" onClick={function(){setFormCondo(c);}} icon="edit"/><Btn sm variant="danger" onClick={function(){delCondo(c);}} icon="trash"/></div>
</div>
<div style={{marginTop:12}}><Inp label="Etapa no pipeline" value={String(c.etapa)} onChange={function(v){moveStage(c,Number(v));}} opts={STAGES.map(function(s){return {v:String(s.id),l:s.id+". "+s.l};})}/></div>
<div style={{fontSize:13,color:"#334155",lineHeight:1.7}}>
{c.sindico&&<div>Síndico: <b>{c.sindico}</b></div>}
{c.responsavel&&<div>Administração: <b>{c.responsavel}</b></div>}
{c.telefone&&<div>Telefone: {c.telefone}</div>}
{c.email&&<div>E-mail: {c.email}</div>}
{c.unidades&&<div>Unidades: {c.unidades}</div>}
{c.potencial&&<div>Potencial: <b>{c.potencial}</b></div>}
{c.temAcademia&&<div>Academia: {c.temAcademia==="sim"?"Sim":c.temAcademia==="nao"?"Não":"A avaliar"}{c.estrutura?" · "+c.estrutura:""}</div>}
{c.regrasAcademia&&<div>Regras: {c.regrasAcademia}</div>}
{c.credenciamento&&<div>Credenciamento: {c.credenciamento==="sim"?"Exige":c.credenciamento==="nao"?"Não exige":"A avaliar"}</div>}
{c.divulgacao&&<div>Divulgação interna: {c.divulgacao==="sim"?"Permitida":c.divulgacao==="nao"?"Não permitida":"A avaliar"}</div>}
{c.eventos&&<div>Eventos: {c.eventos==="sim"?"Permitidos":c.eventos==="nao"?"Não permitidos":"A avaliar"}</div>}
{c.observacoes&&<div style={{marginTop:6}}>{c.observacoes}</div>}
</div>
<div style={{display:"flex",gap:8,marginTop:12,flexWrap:"wrap"}}>
{tel&&<a href={"https://wa.me/"+tel} target="_blank" rel="noopener noreferrer" style={{textDecoration:"none"}}><Btn sm variant="outline">WhatsApp</Btn></a>}
<Btn sm variant="outline" onClick={function(){setTab("materiais");pickCondo(c.id);setSel(null);}}>Gerar apresentação</Btn>
</div>
</Card>

<div style={S.sec}>Alunos vinculados</div>
{vinc.length===0&&<Card><div style={S.muted}>Nenhum aluno vinculado. O cadastro do aluno é o mesmo da carteira, sem duplicar dados.</div></Card>}
{vinc.map(function(x){return <Card key={x.s.id} style={{marginBottom:8,padding:14}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
<div style={{fontWeight:700,fontSize:14}}>{x.s.name}</div>
<Btn sm variant="ghost" icon="x" onClick={function(){ if(window.confirm("Desvincular "+x.s.name+" deste condomínio? O aluno continua cadastrado.")) saveCondo(Object.assign({},c,{alunos:c.alunos.filter(function(a){return a.studentId!==x.s.id;})})); }}/>
</div>
<Flag v={x.a.apresentou} on={function(v){updAluno(x.s.id,{apresentou:v});}} l="Apresentou o profissional ao condomínio"/>
<Flag v={x.a.podeApresentarSindico} on={function(v){updAluno(x.s.id,{podeApresentarSindico:v});}} l="Pode apresentar ao síndico"/>
<Flag v={x.a.podeIndicar} on={function(v){updAluno(x.s.id,{podeIndicar:v});}} l="Pode indicar outros moradores"/>
<div style={{marginTop:8}}><Inp label="Autorização de depoimento ou imagem" value={x.a.imagem||""} onChange={function(v){updAluno(x.s.id,{imagem:v});}} opts={[{v:"",l:"Não solicitada"},{v:"sim",l:"Autorizou por escrito"},{v:"nao",l:"Não autorizou"}]}/></div>
<Inp label="Observações do relacionamento" value={x.a.obs||""} onChange={function(v){updAluno(x.s.id,{obs:v});}}/>
</Card>;})}
<Btn sm variant="outline" icon="link" onClick={function(){setModal("aluno");}}>Vincular aluno</Btn>

<div style={S.sec}>Histórico de atividades</div>
<Btn sm icon="plus" onClick={function(){setH({pessoa:"",tipo:"WhatsApp",resultado:"",proxima:"",proximaData:"",obs:"",data:hoje});setModal("hist");}}>Registrar interação</Btn>
<div style={{marginTop:10}}>
{(c.historico||[]).length===0&&<div style={S.muted}>Sem registros ainda.</div>}
{(c.historico||[]).map(function(x){return <Card key={x.id} style={{marginBottom:8,padding:12}}>
<div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#64748b"}}><span>{fmt(x.data)} · {x.tipo}{x.pessoa?" · "+x.pessoa:""}</span>{x.proximaData&&!x.feito&&vencBadge(x.proximaData)}</div>
{x.resultado&&<div style={{fontSize:13,marginTop:4}}>{x.resultado}</div>}
{x.obs&&<div style={{fontSize:12,color:"#64748b",marginTop:2}}>{x.obs}</div>}
{x.proximaData&&<div style={{fontSize:12,color:"#475569",marginTop:4}}>Próxima ação: {x.proxima||"Retomar contato"} em {fmt(x.proximaData)}{x.feito?" (concluída)":""}</div>}
{x.proximaData&&!x.feito&&<div style={{marginTop:6}}><Btn sm variant="outline" icon="check" onClick={function(){concluirFollow(c,x);}}>Concluir</Btn></div>}
</Card>;})}
</div>

<div style={S.sec}>Leads deste condomínio ({cl.length})</div>
{cl.map(function(l){return <Card key={l.id} style={{marginBottom:6,padding:12,fontSize:13}} onClick={function(){setFormLead(l);}}><b>{l.nome}</b> <span style={S.muted}>· {lstageName(l.etapa)}</span></Card>;})}
<Btn sm variant="outline" icon="plus" onClick={function(){setFormLead(novoLead(c.id));}}>Novo lead</Btn>

{modal==="aluno"&&<Modal title="Vincular aluno" onClose={function(){setModal("");}}>
{livres.length===0?<div style={S.muted}>Todos os alunos já estão vinculados a algum condomínio.</div>:<div>
<Inp label="Aluno da carteira" value={pick} onChange={setPick} opts={[{v:"",l:"Selecione"}].concat(livres.map(function(s){return {v:s.id,l:s.name};}))}/>
<Btn full disabled={!pick} onClick={function(){saveCondo(Object.assign({},c,{alunos:(c.alunos||[]).concat([{studentId:pick,apresentou:false,podeApresentarSindico:false,podeIndicar:false,imagem:"",obs:""}])})); setPick(""); setModal("");}}>Vincular</Btn>
<div style={{fontSize:11,color:"#94a3b8",marginTop:8}}>Cada aluno pode estar em um condomínio. Para mudar, desvincule do atual.</div>
</div>}
</Modal>}
{modal==="hist"&&<Modal title="Registrar interação" onClose={function(){setModal("");}}>
<Inp label="Data do contato" type="date" value={h.data} onChange={function(v){setH(Object.assign({},h,{data:v}));}}/>
<Inp label="Pessoa contatada" value={h.pessoa} onChange={function(v){setH(Object.assign({},h,{pessoa:v}));}}/>
<Inp label="Tipo de interação" value={h.tipo} onChange={function(v){setH(Object.assign({},h,{tipo:v}));}} opts={INTERACOES.map(function(t){return {v:t,l:t};})}/>
<Inp label="Resultado" value={h.resultado} onChange={function(v){setH(Object.assign({},h,{resultado:v}));}}/>
<Inp label="Próxima ação" value={h.proxima} onChange={function(v){setH(Object.assign({},h,{proxima:v}));}}/>
<Inp label="Data do próximo acompanhamento" type="date" value={h.proximaData} onChange={function(v){setH(Object.assign({},h,{proximaData:v}));}}/>
<Inp label="Observações" value={h.obs} onChange={function(v){setH(Object.assign({},h,{obs:v}));}}/>
<Btn full onClick={function(){addHist(c,h);setModal("");}}>Salvar</Btn>
</Modal>}
</div>;
}

/* ---------- PIPELINE ---------- */
function Pipeline(){
return <div>
<div style={S.muted}>Deslize para o lado. Use as setas para mover o condomínio de etapa.</div>
<div style={{display:"flex",gap:10,overflowX:"auto",paddingBottom:10,marginTop:10}}>
{STAGES.map(function(st){
var cs=condos.filter(function(c){return c.etapa===st.id;});
return <div key={st.id} style={{minWidth:230,maxWidth:230,background:"#f1f5f9",borderRadius:14,padding:10}}>
<div style={{fontWeight:800,fontSize:12,color:"#334155",marginBottom:8}}>{st.id}. {st.l} <span style={{color:O}}>({cs.length})</span></div>
{cs.map(function(c){
var pend=(c.historico||[]).some(function(h){return h.proximaData&&!h.feito&&h.proximaData<=hoje;});
return <Card key={c.id} style={{padding:10,marginBottom:8}}>
<div style={{fontWeight:700,fontSize:13,cursor:"pointer"}} onClick={function(){setSel(c.id);setTab("condominios");}}>{c.nome}</div>
<div style={{fontSize:11,color:"#64748b"}}>{c.bairro}{c.potencial?" · "+c.potencial:""}</div>
{pend&&<div style={{marginTop:4}}><Badge color="#dc2626" bg="#fee2e2">Follow-up</Badge></div>}
<div style={{display:"flex",justifyContent:"space-between",marginTop:8}}>
<Btn sm variant="secondary" disabled={st.id===1} onClick={function(){moveStage(c,st.id-1);}}>‹</Btn>
<Btn sm variant="secondary" disabled={st.id===11} onClick={function(){moveStage(c,st.id+1);}}>›</Btn>
</div>
</Card>;
})}
</div>;
})}
</div>
</div>;
}

/* ---------- LEADS ---------- */
function novoLead(condoId){
return {id:uid(),nome:"",telefone:"",condoId:condoId||"",origem:"Aluno atual",perfil:"50+",objetivo:"",servico:"",obs:"",primeiroContato:AGORA(),etapa:1,etapaDatas:{1:AGORA()},valorMensal:"",studentId:""};
}
function FormLead(){
var l=formLead, setL=setFormLead;
var up=function(k){return function(v){setFormLead(function(p){var n=Object.assign({},p); n[k]=v; return n;});};};
var novo=!leads.some(function(x){return x.id===l.id;});
var dup=dupLead;
var converter=function(){
if(l.studentId) return;
var sid;
if(dup){
if(!window.confirm("Já existe o aluno "+dup.name+" com dados iguais. Vincular este lead a ele, sem criar outro cadastro?")) return;
sid=dup.id;
} else {
sid=uid();
setStudents(function(prev){return prev.concat([{id:sid,name:l.nome.trim(),phone:l.telefone,whatsapp:l.telefone,dob:"",sex:"",createdAt:AGORA()}]);});
}
var ed=Object.assign({},l.etapaDatas||{}); for(var i=1;i<=7;i++){ if(!ed[i]) ed[i]=AGORA(); }
var nl=Object.assign({},l,{etapa:7,etapaDatas:ed,studentId:sid});
saveLead(nl);
var c=condoById[l.condoId];
if(c&&!(c.alunos||[]).some(function(a){return a.studentId===sid;})){
var jaEm=condos.some(function(x){return (x.alunos||[]).some(function(a){return a.studentId===sid;});});
if(!jaEm) saveCondo(Object.assign({},c,{alunos:(c.alunos||[]).concat([{studentId:sid,apresentou:false,podeApresentarSindico:false,podeIndicar:false,imagem:"",obs:"Conquistado pelo Projeto Condomínios"}])}));
}
setFormLead(null);
say(dup?"Lead vinculado ao aluno existente":"Aluno criado no cadastro principal");
};
return <Modal title={novo?"Novo lead":"Editar lead"} onClose={function(){setFormLead(null);}}>
<Inp label="Nome do interessado" value={l.nome} onChange={up("nome")}/>
<Inp label="Telefone ou WhatsApp" value={l.telefone} onChange={up("telefone")}/>
<Inp label="Condomínio de origem" value={l.condoId} onChange={up("condoId")} opts={[{v:"",l:"Selecione"}].concat(condos.map(function(c){return {v:c.id,l:c.nome};}))}/>
<Inp label="Como chegou até mim" value={l.origem} onChange={up("origem")} opts={ORIGENS}/>
<Inp label="Perfil" value={l.perfil} onChange={up("perfil")} opts={PERFIS_LEAD}/>
<Inp label="Objetivo principal" value={l.objetivo} onChange={up("objetivo")}/>
<Inp label="Serviço de interesse" value={l.servico} onChange={up("servico")} opts={SERVICOS}/>
<Inp label="Data do primeiro contato" type="date" value={l.primeiroContato} onChange={up("primeiroContato")}/>
<Inp label="Etapa" value={String(l.etapa)} onChange={function(v){ var n=Number(v); var ed=Object.assign({},l.etapaDatas||{}); if(n<=7){for(var i=1;i<=n;i++){if(!ed[i]) ed[i]=AGORA();}} else {ed[8]=AGORA();} setL(Object.assign({},l,{etapa:n,etapaDatas:ed})); }} opts={LSTAGES.map(function(s){return {v:String(s.id),l:s.id+". "+s.l};})}/>
<Inp label="Valor mensal originado (R$)" type="number" value={l.valorMensal} onChange={up("valorMensal")} note="Preencha quando fechar. Alimenta a receita do projeto."/>
<Inp label="Observações" value={l.obs} onChange={up("obs")}/>
{dup&&!l.studentId&&<div style={{fontSize:12,color:"#d97706",marginBottom:10}}>Atenção: já existe o aluno {dup.name} com nome ou telefone parecido.</div>}
{l.studentId&&<div style={{fontSize:12,color:"#16a34a",marginBottom:10}}>Convertido em aluno: {(studentById[l.studentId]||{}).name||"cadastro principal"}</div>}
<div style={{display:"flex",gap:10}}>
{!novo&&<Btn variant="danger" onClick={function(){delLead(l);setFormLead(null);}} icon="trash"/>}
<Btn full disabled={!l.nome.trim()} onClick={function(){saveLead(Object.assign({},l,{nome:l.nome.trim()}));setFormLead(null);}}>Salvar</Btn>
</div>
{!novo&&!l.studentId&&<div style={{marginTop:10}}><Btn full variant="outline" disabled={!l.nome.trim()} onClick={converter}>Converter em aluno</Btn></div>}
</Modal>;
}
function Leads(){
var st=stLead;
var base=fCondo?leads.filter(function(l){return l.condoId===fCondo;}):leads;
var list=base.filter(function(l){return !st||l.etapa===st;});
return <div>
<div style={{display:"flex",gap:8,marginBottom:10}}>
<div style={{flex:1}}><Inp value={fCondo} onChange={setFCondo} opts={[{v:"",l:"Todos os condomínios"}].concat(condos.map(function(c){return {v:c.id,l:c.nome};}))}/></div>
<div style={{marginBottom:13}}><Btn icon="plus" onClick={function(){setFormLead(novoLead(fCondo));}}>Novo</Btn></div>
</div>
<div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:8}}>
<button style={S.chip(st===0)} onClick={function(){setSt(0);}}>Todos ({base.length})</button>
{LSTAGES.map(function(s){return <button key={s.id} style={S.chip(st===s.id)} onClick={function(){setSt(s.id);}}>{s.l} ({base.filter(function(l){return l.etapa===s.id;}).length})</button>;})}
</div>
{list.length===0&&<Card><div style={S.muted}>Nenhum lead nesta visão.</div></Card>}
{list.map(function(l){
var c=condoById[l.condoId]; var tel=waNum(l.telefone);
return <Card key={l.id} style={{marginTop:10,padding:14}}>
<div style={{display:"flex",justifyContent:"space-between",gap:8}}>
<div onClick={function(){setFormLead(l);}} style={{cursor:"pointer"}}><div style={{fontWeight:800,fontSize:14}}>{l.nome}</div><div style={S.muted}>{c?c.nome:"Sem condomínio"} · {l.origem}</div></div>
{l.studentId&&<Badge color="#16a34a" bg="#dcfce7">Aluno</Badge>}
</div>
<div style={{display:"flex",gap:8,marginTop:10,alignItems:"center"}}>
<div style={{flex:1}}><select value={l.etapa} onChange={function(e){moveLead(l,Number(e.target.value));}} style={{width:"100%",padding:"8px 10px",borderRadius:9,border:"1.5px solid #e2e8f0",background:"#f8fafc",fontSize:13}}>{LSTAGES.map(function(s){return <option key={s.id} value={s.id}>{s.id}. {s.l}</option>;})}</select></div>
{tel&&<a href={"https://wa.me/"+tel} target="_blank" rel="noopener noreferrer" style={{textDecoration:"none"}}><Btn sm variant="outline">WhatsApp</Btn></a>}
</div>
</Card>;
})}
</div>;
}

/* ---------- MATERIAIS ---------- */
var pickCondo=function(id){
setCid(id);
var cc=condoById[id]; var a=(cc&&cc.apresentacao)||{};
setF(function(p){return {responsavel:a.responsavel||(cc?(cc.sindico||cc.responsavel||""):""),mensagem:a.mensagem||"",tipoAcao:a.tipoAcao||"",data:a.data||"",whats:p.whats};});
};
function Materiais(){
var c=condoById[cid];
var f=fm;
var m=MATERIAIS.find(function(x){return x.id===mat;});
var publico=/^https?:$/.test(window.location.protocol);
var base=new URL(m.file,window.location.href).href;
var w=digits(f.whats)||digits(prof&&prof.whatsapp);
var qs=[];
var add=function(k,v){ if(v) qs.push(k+"="+encodeURIComponent(String(v).slice(0,280))); };
if(c){ add("c",c.nome); add("b",c.bairro); }
add("r",f.responsavel); add("m",f.mensagem); add("a",f.tipoAcao); add("d",f.data); add("w",waNum(w));
var fixo=!!m.fixo;
var url=fixo?base:base+(qs.length?"?"+qs.join("&"):"");
var printUrl=url+(qs.length?"&":"?")+"print=1";
var texto=fixo?"Olá! Segue a apresentação do programa Academia Assistida: "+url:"Olá"+(f.responsavel?", "+f.responsavel:"")+"! Preparei uma apresentação"+(c?" pensando no "+c.nome:"")+". Segue o link: "+url;
var salvar=function(){ if(c) saveCondo(Object.assign({},c,{apresentacao:{responsavel:f.responsavel,mensagem:f.mensagem,tipoAcao:f.tipoAcao,data:f.data}})); say("Personalização salva"); };
var upf=function(k){return function(v){setF(function(p){var n=Object.assign({},p); n[k]=v; return n;});};};
var aBtn={textDecoration:"none"};
return <div>
<div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:8}}>
{MATERIAIS.map(function(x){return <button key={x.id} style={S.chip(mat===x.id)} onClick={function(){setMat(x.id);}}>{x.pub}</button>;})}
</div>
<Card style={{marginTop:8}}>
<div style={{fontWeight:800,fontSize:15}}>{m.titulo}</div>
<div style={{...S.muted,marginBottom:12}}>{fixo?"Apresentação fixa, igual para todos. Não leva personalização no link.":"O modelo base não muda. A versão personalizada vive só no link."}</div>
{!fixo&&<div>
<Inp label="Condomínio" value={cid} onChange={pickCondo} opts={[{v:"",l:"Versão geral, sem condomínio"}].concat(condos.map(function(x){return {v:x.id,l:x.nome};}))}/>
<Inp label="Nome do responsável" value={f.responsavel} onChange={upf("responsavel")}/>
<Inp label="Mensagem de abertura" value={f.mensagem} onChange={upf("mensagem")} placeholder="Opcional, até 280 caracteres"/>
<Inp label="Tipo de ação proposta" value={f.tipoAcao} onChange={upf("tipoAcao")} opts={[{v:"",l:"Não destacar"},{v:"Personal na academia do condomínio",l:"Personal na academia do condomínio"},{v:"Encontro educativo Movimento 50+",l:"Encontro educativo Movimento 50+"},{v:"Atendimento para casais",l:"Atendimento para casais"},{v:"Pequenos grupos",l:"Pequenos grupos"},{v:"Consultoria de treinamento",l:"Consultoria de treinamento"}]}/>
<Inp label="Data da apresentação" type="date" value={f.data} onChange={upf("data")}/>
<Inp label="WhatsApp que aparece na página" value={f.whats} onChange={upf("whats")} placeholder={prof&&prof.whatsapp?"Usando o do seu perfil":"Preencha aqui ou no seu perfil"} note="Se vazio, usa o WhatsApp do seu perfil profissional."/>
{!w&&<div style={{fontSize:12,color:"#d97706",marginBottom:10}}>Sem WhatsApp definido, os botões de contato não aparecem na página.</div>}
</div>}
{!publico&&<div style={{fontSize:12,color:"#dc2626",marginBottom:10}}>Você abriu o app fora do site publicado. O link só funciona para outras pessoas depois que os arquivos de apresentação estiverem no mesmo endereço do app.</div>}
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
<Btn variant="secondary" icon="eye" onClick={function(){setPrev(true);}}>Visualizar</Btn>
<Btn variant="secondary" icon="link" onClick={function(){copyText(url).then(function(ok){say(ok?"Link copiado":"Não consegui copiar, selecione manualmente");});}}>Copiar link</Btn>
<a href={"https://wa.me/?text="+encodeURIComponent(texto)} target="_blank" rel="noopener noreferrer" style={aBtn}><Btn full variant="outline">WhatsApp</Btn></a>
<a href={url} target="_blank" rel="noopener noreferrer" style={aBtn}><Btn full variant="outline">Abrir no navegador</Btn></a>
</div>
{!fixo&&<div style={{marginTop:8}}><a href={printUrl} target="_blank" rel="noopener noreferrer" style={aBtn}><Btn full variant="outline" icon="download">Imprimir ou salvar PDF</Btn></a></div>}
{!fixo&&c&&<div style={{marginTop:8}}><Btn full variant="ghost" onClick={salvar}>Guardar personalização neste condomínio</Btn></div>}
{!fixo&&<div style={{fontSize:11,color:"#94a3b8",marginTop:10,lineHeight:1.5}}>O link leva só nome do condomínio, bairro, responsável, mensagem, ação, data e o WhatsApp profissional. Nenhum dado de aluno, lead ou administrativo é enviado. Nada é enviado automaticamente: o WhatsApp abre para você revisar e enviar.</div>}
</Card>
{prev&&<Modal title="Visualização" onClose={function(){setPrev(false);}}>
{publico?<iframe title="previa" src={url} style={{width:"100%",height:"60vh",border:"1px solid #e2e8f0",borderRadius:10}}/>:<div style={S.muted}>A visualização precisa do app publicado no site. Use o app pelo endereço do GitHub Pages.</div>}
</Modal>}
</div>;
}

/* ---------- CASCA ---------- */
return <div style={{padding:"0 0 90px"}}>
<div style={{fontWeight:800,fontSize:22,color:"#0f172a",marginBottom:4}}>Projeto Condomínios</div>
<div style={{...S.muted,marginBottom:12}}>Prospecção e captação de alunos em condomínios</div>
<div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:10}}>
{tabs.map(function(t){return <button key={t[0]} style={S.chip(tab===t[0])} onClick={function(){setTab(t[0]);setSel(null);}}>{t[1]}{t[0]==="painel"&&atrasados>0?" ("+atrasados+")":""}</button>;})}
</div>
{tab==="painel"&&Painel()}
{tab==="condominios"&&(sel?Detalhe():Lista())}
{tab==="pipeline"&&Pipeline()}
{tab==="leads"&&Leads()}
{tab==="materiais"&&Materiais()}
{formCondo&&FormCondo()}
{formLead&&FormLead()}
{toast&&<div style={{position:"fixed",bottom:90,left:"50%",transform:"translateX(-50%)",background:"#1F2E2A",color:"#fff",padding:"10px 18px",borderRadius:99,fontSize:13,fontWeight:600,zIndex:2000}}>{toast}</div>}
</div>;
}

window.ProjetoCondominios = { Page: Page, STAGES: STAGES, LSTAGES: LSTAGES };
})();
