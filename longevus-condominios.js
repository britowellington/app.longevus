/* Projeto Condomínios, módulo do Longevus. Código já convertido (sem Babel no navegador). Expõe window.ProjetoCondominios.Page. */
(function() {
  const { useState, useMemo, useEffect, useCallback } = React;
  const STAGES = [
    { id: 1, l: "Mapeado" },
    { id: 2, l: "Aluno identificado" },
    { id: 3, l: "Apresentação por aluno solicitada" },
    { id: 4, l: "Contato com síndico/administração" },
    { id: 5, l: "Apresentação profissional enviada" },
    { id: 6, l: "Reunião ou conversa realizada" },
    { id: 7, l: "Proposta de ação apresentada" },
    { id: 8, l: "Autorização concedida" },
    { id: 9, l: "Condomínio ativado" },
    { id: 10, l: "Em acompanhamento" },
    { id: 11, l: "Sem interesse / encerrado" }
  ];
  const LSTAGES = [
    { id: 1, l: "Novo interessado" },
    { id: 2, l: "Primeiro contato realizado" },
    { id: 3, l: "Consulta estratégica agendada" },
    { id: 4, l: "Consulta realizada" },
    { id: 5, l: "Proposta apresentada" },
    { id: 6, l: "Em negociação" },
    { id: 7, l: "Fechado" },
    { id: 8, l: "Não fechado" }
  ];
  const POTENCIAL = [{ v: "", l: "Não classificado" }, { v: "Alto", l: "Alto" }, { v: "Médio", l: "Médio" }, { v: "Baixo", l: "Baixo" }];
  const SIMNAO = [{ v: "", l: "Não informado" }, { v: "sim", l: "Sim" }, { v: "nao", l: "Não" }, { v: "avaliar", l: "A avaliar" }];
  const INTERACOES = ["WhatsApp", "Ligação", "Visita presencial", "E-mail", "Reunião", "Envio de material", "Anotação"];
  const PERFIS_LEAD = [{ v: "50+", l: "Pessoa 50+" }, { v: "familiar", l: "Familiar" }, { v: "outro", l: "Outro" }];
  const SERVICOS = [{ v: "", l: "A definir" }, { v: "Personal no condomínio", l: "Personal no condomínio" }, { v: "Casal", l: "Atendimento para casais" }, { v: "Pequeno grupo", l: "Pequenos grupos" }, { v: "Consultoria", l: "Consultoria de treinamento" }, { v: "Outro", l: "Outro" }];
  const ORIGENS = [{ v: "Aluno atual", l: "Indicação de aluno atual" }, { v: "Apresentação digital", l: "Apresentação digital" }, { v: "Evento no condomínio", l: "Evento no condomínio" }, { v: "Síndico/administração", l: "Síndico ou administração" }, { v: "Outro", l: "Outro" }];
  const AGORA = function() {
    var d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  };
  const digits = function(s) {
    return String(s || "").replace(/\D/g, "");
  };
  const waNum = function(s) {
    var d = digits(s);
    if (!d) return "";
    return d.length === 10 || d.length === 11 ? "55" + d : d;
  };
  const norm = function(s) {
    return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim();
  };
  const stageName = function(id) {
    var s = STAGES.find(function(x) {
      return x.id === id;
    });
    return s ? s.l : "";
  };
  const lstageName = function(id) {
    var s = LSTAGES.find(function(x) {
      return x.id === id;
    });
    return s ? s.l : "";
  };
  const MATERIAIS = [
    { id: "sindicos", file: "apresentacao-sindicos.html", titulo: "Movimento e Longevidade nos Condomínios", pub: "Síndicos e administradoras" },
    { id: "moradores", file: "apresentacao-moradores.html", titulo: "Sua academia está dentro do condomínio", pub: "Moradores" },
    { id: "indicacao", file: "apresentacao-indicacao.html", titulo: "Indicação de alunos", pub: "Alunos que indicam vizinhos e amigos" },
    { id: "academia", file: "academia-assistida.html", titulo: "Academia Assistida", pub: "Academia Assistida", fixo: true }
  ];
  function rangeOf(p) {
    var now = new Date(), y = now.getFullYear(), m = now.getMonth();
    var f = function(d) {
      return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
    };
    if (p.preset === "mes") return [f(new Date(y, m, 1)), f(new Date(y, m + 1, 0))];
    if (p.preset === "tri") {
      var q = Math.floor(m / 3) * 3;
      return [f(new Date(y, q, 1)), f(new Date(y, q + 3, 0))];
    }
    if (p.preset === "ano") return [f(new Date(y, 0, 1)), f(new Date(y, 11, 31))];
    if (p.preset === "custom") return [p.de || "0000-00-00", p.ate || "9999-12-31"];
    return ["0000-00-00", "9999-12-31"];
  }
  function copyText(t) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(t).then(function() {
          return true;
        }).catch(function() {
          return fb();
        });
      }
    } catch (e) {
    }
    return Promise.resolve(fb());
    function fb() {
      try {
        var a = document.createElement("textarea");
        a.value = t;
        a.style.position = "fixed";
        a.style.opacity = "0";
        document.body.appendChild(a);
        a.focus();
        a.select();
        var ok = document.execCommand("copy");
        document.body.removeChild(a);
        return ok;
      } catch (e) {
        return false;
      }
    }
  }
  function Page(props) {
    const D = props.deps;
    const Card = D.Card, Btn = D.Btn, Inp = D.Inp, Modal = D.Modal, Badge = D.Badge, I = D.I, O = D.O, uid = D.uid, fmt = D.fmt, fmtR = D.fmtR;
    const condos = props.condos, setCondos = props.setCondos, leads = props.condoLeads, setLeads = props.setCondoLeads;
    const students = props.students, setStudents = props.setStudents;
    const initialTab = props.pageProps && props.pageProps.tab || "painel";
    const [tab, setTab] = useState(initialTab);
    const [sel, setSel] = useState(null);
    const [formCondo, setFormCondo] = useState(null);
    const [formLead, setFormLead] = useState(null);
    const [period, setPeriod] = useState({ preset: "mes", de: "", ate: "" });
    const [fCondo, setFCondo] = useState("");
    const [toast, setToast] = useState("");
    const [prof, setProf] = useState(null);
    const [qLista, setQ] = useState("");
    const [stLead, setSt] = useState(0);
    const [mat, setMat] = useState("sindicos");
    const [cid, setCid] = useState("");
    const [fm, setF] = useState({ responsavel: "", mensagem: "", tipoAcao: "", data: "", whats: "" });
    const [prev, setPrev] = useState(false);
    const [modal, setModal] = useState("");
    const [hh, setH] = useState({ pessoa: "", tipo: "WhatsApp", resultado: "", proxima: "", proximaData: "", obs: "", data: AGORA() });
    const [pick, setPick] = useState("");
    const dupLead = useMemo(function() {
      if (!formLead) return null;
      var t = digits(formLead.telefone), n = norm(formLead.nome);
      return students.find(function(s) {
        return t.length >= 8 && (digits(s.whatsapp).slice(-8) === t.slice(-8) || digits(s.phone).slice(-8) === t.slice(-8)) || n && norm(s.name) === n;
      }) || null;
    }, [formLead && formLead.nome, formLead && formLead.telefone, students]);
    useEffect(function() {
      var alive = true;
      (async function() {
        try {
          if (!props.session) return;
          var h = await D.DB.authHeaders();
          var r = await fetch(D.SUPA_URL + "/rest/v1/professionals?select=nome,whatsapp&id=eq." + props.session.user.id, { headers: h });
          if (!r.ok) return;
          var j = await r.json();
          if (alive && j && j[0]) setProf(j[0]);
        } catch (e) {
        }
      })();
      return function() {
        alive = false;
      };
    }, []);
    const say = function(t) {
      setToast(t);
      setTimeout(function() {
        setToast("");
      }, 2200);
    };
    const hoje = AGORA();
    const [de, ate] = rangeOf(period);
    const inR = function(d) {
      return !!d && d >= de && d <= ate;
    };
    const studentById = useMemo(function() {
      var m = {};
      students.forEach(function(s) {
        m[s.id] = s;
      });
      return m;
    }, [students]);
    const condoById = useMemo(function() {
      var m = {};
      condos.forEach(function(c) {
        m[c.id] = c;
      });
      return m;
    }, [condos]);
    const saveCondo = function(c) {
      setCondos(function(prev2) {
        return prev2.some(function(x) {
          return x.id === c.id;
        }) ? prev2.map(function(x) {
          return x.id === c.id ? c : x;
        }) : prev2.concat([c]);
      });
    };
    const delCondo = function(c) {
      if (!window.confirm("Excluir o condomínio " + c.nome + "? Os alunos vinculados não são apagados. Leads deste condomínio ficam sem condomínio de origem.")) return;
      D.DB.remove("condominios", c.id);
      setCondos(function(prev2) {
        return prev2.filter(function(x) {
          return x.id !== c.id;
        });
      });
      setLeads(function(prev2) {
        return prev2.map(function(l) {
          return l.condoId === c.id ? Object.assign({}, l, { condoId: "" }) : l;
        });
      });
      setSel(null);
    };
    const addHist = function(c, h) {
      var item = Object.assign({ id: uid(), data: hoje, pessoa: "", tipo: "WhatsApp", resultado: "", proxima: "", proximaData: "", obs: "", feito: false }, h);
      saveCondo(Object.assign({}, c, { historico: [item].concat(c.historico || []) }));
    };
    const moveStage = function(c, novo) {
      if (novo === c.etapa || novo < 1 || novo > 11) return;
      var ed = Object.assign({}, c.etapaDatas || {});
      ed[novo] = hoje;
      var item = { id: uid(), data: hoje, pessoa: "", tipo: "Mudança de etapa", resultado: stageName(c.etapa) + " para " + stageName(novo), proxima: "", proximaData: "", obs: "", feito: true };
      saveCondo(Object.assign({}, c, { etapa: novo, etapaDatas: ed, historico: [item].concat(c.historico || []) }));
    };
    const moveLead = function(l, novo) {
      if (novo === l.etapa) return;
      var ed = Object.assign({}, l.etapaDatas || {});
      if (novo <= 7) {
        for (var i = 1; i <= novo; i++) {
          if (!ed[i]) ed[i] = hoje;
        }
      } else {
        ed[8] = hoje;
      }
      var nl = Object.assign({}, l, { etapa: novo, etapaDatas: ed });
      setLeads(function(prev2) {
        return prev2.map(function(x) {
          return x.id === l.id ? nl : x;
        });
      });
    };
    const saveLead = function(l) {
      setLeads(function(prev2) {
        return prev2.some(function(x) {
          return x.id === l.id;
        }) ? prev2.map(function(x) {
          return x.id === l.id ? l : x;
        }) : prev2.concat([l]);
      });
    };
    const delLead = function(l) {
      if (!window.confirm("Excluir o lead " + l.nome + "?")) return;
      D.DB.remove("condominio_leads", l.id);
      setLeads(function(prev2) {
        return prev2.filter(function(x) {
          return x.id !== l.id;
        });
      });
    };
    const pendentes = useMemo(function() {
      var out = [];
      condos.forEach(function(c) {
        (c.historico || []).forEach(function(h) {
          if (h.proximaData && !h.feito) out.push({ c, h });
        });
      });
      out.sort(function(a, b) {
        return a.h.proximaData < b.h.proximaData ? -1 : 1;
      });
      return out;
    }, [condos]);
    const atrasados = pendentes.filter(function(p) {
      return p.h.proximaData < hoje;
    }).length;
    const concluirFollow = function(c, h) {
      saveCondo(Object.assign({}, c, { historico: (c.historico || []).map(function(x) {
        return x.id === h.id ? Object.assign({}, x, { feito: true }) : x;
      }) }));
    };
    const tabs = [["painel", "Painel"], ["condominios", "Condomínios"], ["pipeline", "Pipeline"], ["leads", "Leads"], ["materiais", "Materiais"]];
    const S = { sec: { fontWeight: 800, fontSize: 15, color: "#0f172a", margin: "18px 0 10px" }, muted: { fontSize: 12, color: "#64748b" }, chip: function(on) {
      return { padding: "7px 13px", borderRadius: 99, border: "1.5px solid " + (on ? O : "#e2e8f0"), background: on ? O : "#fff", color: on ? "#fff" : "#475569", fontWeight: 700, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" };
    } };
    function vencBadge(d) {
      if (d < hoje) return React.createElement(Badge, { color: "#dc2626", bg: "#fee2e2" }, "Atrasado");
      if (d === hoje) return React.createElement(Badge, { color: "#d97706", bg: "#fef3c7" }, "Hoje");
      return React.createElement(Badge, { color: "#475569", bg: "#f1f5f9" }, fmt(d));
    }
    function Painel() {
      var cs = fCondo ? condos.filter(function(c) {
        return c.id === fCondo;
      }) : condos;
      var ls = fCondo ? leads.filter(function(l) {
        return l.condoId === fCondo;
      }) : leads;
      var alunosIds = {};
      cs.forEach(function(c) {
        (c.alunos || []).forEach(function(a) {
          alunosIds[a.studentId] = 1;
        });
      });
      var contatos = 0;
      cs.forEach(function(c) {
        (c.historico || []).forEach(function(h) {
          if (h.tipo !== "Anotação" && h.tipo !== "Mudança de etapa" && inR(h.data)) contatos++;
        });
      });
      var reach = function(n) {
        return ls.filter(function(l) {
          return inR((l.etapaDatas || {})[n]);
        }).length;
      };
      var gerados = ls.filter(function(l) {
        return inR(l.primeiroContato || (l.etapaDatas || {})[1]);
      }).length;
      var agendadas = reach(3), realizadas = reach(4), propostas = reach(5), fechados = reach(7);
      var receita = 0;
      ls.forEach(function(l) {
        if (l.etapa === 7 && inR((l.etapaDatas || {})[7])) receita += Number(l.valorMensal || 0);
      });
      var kpis = [
        ["Condomínios cadastrados", cs.length],
        ["Em prospecção", cs.filter(function(c) {
          return c.etapa >= 1 && c.etapa <= 7;
        }).length],
        ["Com autorização de acesso", cs.filter(function(c) {
          return c.etapa >= 8 && c.etapa <= 10;
        }).length],
        ["Com relacionamento ativo", cs.filter(function(c) {
          return c.etapa === 9 || c.etapa === 10;
        }).length],
        ["Alunos vinculados", Object.keys(alunosIds).length],
        ["Leads gerados", gerados],
        ["Consultas agendadas", agendadas],
        ["Propostas apresentadas", propostas],
        ["Novos alunos conquistados", fechados],
        ["Receita mensal originada", fmtR(receita)]
      ];
      var funil = [["Contatos realizados", contatos], ["Interessados gerados", gerados], ["Consultas realizadas", realizadas], ["Propostas apresentadas", propostas], ["Contratos fechados", fechados]];
      var maxF = Math.max(1, Math.max.apply(null, funil.map(function(x) {
        return x[1];
      })));
      var prov = pendentes.slice(0, 6);
      return React.createElement("div", null, React.createElement(Card, { style: { padding: 14 } }, React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 } }, [["mes", "Mês"], ["tri", "Trimestre"], ["ano", "Ano"], ["tudo", "Tudo"], ["custom", "Período"]].map(function(p) {
        return React.createElement("button", { key: p[0], onClick: function() {
          setPeriod(Object.assign({}, period, { preset: p[0] }));
        }, style: S.chip(period.preset === p[0]) }, p[1]);
      })), period.preset === "custom" && React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 } }, React.createElement(Inp, { label: "De", type: "date", value: period.de, onChange: function(v) {
        setPeriod(Object.assign({}, period, { de: v }));
      } }), React.createElement(Inp, { label: "Até", type: "date", value: period.ate, onChange: function(v) {
        setPeriod(Object.assign({}, period, { ate: v }));
      } })), React.createElement(Inp, { label: "Condomínio", value: fCondo, onChange: setFCondo, opts: [{ v: "", l: "Todos os condomínios" }].concat(condos.map(function(c) {
        return { v: c.id, l: c.nome };
      })) })), React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 } }, kpis.map(function(k) {
        return React.createElement(Card, { key: k[0], style: { padding: 14 } }, React.createElement("div", { style: { fontSize: 22, fontWeight: 800, color: O } }, k[1]), React.createElement("div", { style: S.muted }, k[0]));
      })), React.createElement("div", { style: S.sec }, "Conversão no período"), React.createElement(Card, null, funil.map(function(f, i) {
        return React.createElement("div", { key: f[0], style: { marginBottom: i < funil.length - 1 ? 12 : 0 } }, React.createElement("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 4 } }, React.createElement("span", null, f[0]), React.createElement("span", null, f[1])), React.createElement("div", { style: { height: 8, background: "#f1f5f9", borderRadius: 99 } }, React.createElement("div", { style: { height: 8, borderRadius: 99, background: O, width: f[1] / maxF * 100 + "%" } })));
      }), React.createElement("div", { style: { fontSize: 11, color: "#94a3b8", marginTop: 10 } }, "Contatos vêm do histórico dos condomínios. Os demais números vêm das datas de cada etapa dos leads. A receita soma o valor mensal dos leads fechados no período.")), React.createElement("div", { style: S.sec }, "Follow-ups pendentes ", atrasados > 0 && React.createElement("span", { style: { color: "#dc2626" } }, "(", atrasados, " em atraso)")), prov.length === 0 && React.createElement(Card, null, React.createElement("div", { style: S.muted }, "Nenhum acompanhamento pendente.")), prov.map(function(p) {
        return React.createElement(Card, { key: p.h.id, style: { marginBottom: 8, padding: 14 } }, React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 14, cursor: "pointer" }, onClick: function() {
          setSel(p.c.id);
          setTab("condominios");
        } }, p.c.nome), vencBadge(p.h.proximaData)), React.createElement("div", { style: { fontSize: 13, color: "#475569", margin: "4px 0 8px" } }, p.h.proxima || "Retomar contato"), React.createElement(Btn, { sm: true, variant: "outline", onClick: function() {
          concluirFollow(p.c, p.h);
        }, icon: "check" }, "Marcar como feito"));
      }), React.createElement(RelatorioBlocos, { cs, ls }));
    }
    function RelatorioBlocos(p) {
      var cs = p.cs, ls = p.ls;
      var porCondo = cs.map(function(c) {
        var l = ls.filter(function(x) {
          return x.condoId === c.id;
        });
        var f = l.filter(function(x) {
          return x.etapa === 7;
        });
        return { c, leads: l.length, fechados: f.length, receita: f.reduce(function(a, x) {
          return a + Number(x.valorMensal || 0);
        }, 0), conv: l.length ? Math.round(f.length / l.length * 100) : 0 };
      });
      var top = porCondo.slice().sort(function(a, b) {
        return b.leads - a.leads;
      }).filter(function(x) {
        return x.leads > 0;
      }).slice(0, 5);
      var alto = cs.filter(function(c) {
        return c.potencial === "Alto";
      });
      var orig = {};
      ls.forEach(function(l) {
        var o = l.origem || "Não informado";
        orig[o] = (orig[o] || 0) + 1;
      });
      var origList = Object.keys(orig).sort(function(a, b) {
        return orig[b] - orig[a];
      });
      return React.createElement("div", null, React.createElement("div", { style: S.sec }, "Condomínios com maior número de leads"), React.createElement(Card, null, top.length === 0 ? React.createElement("div", { style: S.muted }, "Ainda sem leads.") : top.map(function(x) {
        return React.createElement("div", { key: x.c.id, style: { display: "flex", justifyContent: "space-between", fontSize: 13, padding: "6px 0", borderBottom: "1px solid #f1f5f9" } }, React.createElement("span", { style: { fontWeight: 600 } }, x.c.nome), React.createElement("span", { style: { color: "#64748b" } }, x.leads, " leads · ", x.fechados, " fechados · ", x.conv, "%"));
      })), React.createElement("div", { style: S.sec }, "Condomínios com potencial alto"), React.createElement(Card, null, alto.length === 0 ? React.createElement("div", { style: S.muted }, "Nenhum classificado como alto.") : alto.map(function(c) {
        return React.createElement("div", { key: c.id, style: { fontSize: 13, padding: "5px 0", fontWeight: 600 } }, c.nome, " ", React.createElement("span", { style: { fontWeight: 400, color: "#64748b" } }, "· ", stageName(c.etapa)));
      })), React.createElement("div", { style: S.sec }, "Origem dos contatos"), React.createElement(Card, null, origList.length === 0 ? React.createElement("div", { style: S.muted }, "Sem dados ainda.") : origList.map(function(o) {
        return React.createElement("div", { key: o, style: { display: "flex", justifyContent: "space-between", fontSize: 13, padding: "5px 0" } }, React.createElement("span", null, o), React.createElement("b", null, orig[o]));
      })), React.createElement("div", { style: S.sec }, "Receita mensal por condomínio"), React.createElement(Card, null, porCondo.filter(function(x) {
        return x.receita > 0;
      }).length === 0 ? React.createElement("div", { style: S.muted }, "Informe o valor mensal ao fechar um lead.") : porCondo.filter(function(x) {
        return x.receita > 0;
      }).map(function(x) {
        return React.createElement("div", { key: x.c.id, style: { display: "flex", justifyContent: "space-between", fontSize: 13, padding: "5px 0" } }, React.createElement("span", null, x.c.nome), React.createElement("b", null, fmtR(x.receita)));
      })));
    }
    function Lista() {
      var q = qLista;
      var list = condos.filter(function(c) {
        return !q || norm(c.nome + " " + c.bairro).indexOf(norm(q)) >= 0;
      });
      return React.createElement("div", null, React.createElement("div", { style: { display: "flex", gap: 8, marginBottom: 12 } }, React.createElement("div", { style: { flex: 1 } }, React.createElement(Inp, { value: q, onChange: setQ, placeholder: "Buscar condomínio ou bairro" })), React.createElement("div", { style: { marginBottom: 13 } }, React.createElement(Btn, { onClick: function() {
        setFormCondo(novoCondo());
      }, icon: "plus" }, "Novo"))), list.length === 0 && React.createElement(Card, null, React.createElement("div", { style: S.muted }, "Nenhum condomínio cadastrado. Toque em Novo para começar.")), list.map(function(c) {
        var pend = (c.historico || []).filter(function(h) {
          return h.proximaData && !h.feito;
        }).sort(function(a, b) {
          return a.proximaData < b.proximaData ? -1 : 1;
        })[0];
        var nl = leads.filter(function(l) {
          return l.condoId === c.id;
        }).length;
        return React.createElement(Card, { key: c.id, onClick: function() {
          setSel(c.id);
        }, style: { marginBottom: 10, padding: 14 } }, React.createElement("div", { style: { display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start" } }, React.createElement("div", null, React.createElement("div", { style: { fontWeight: 800, fontSize: 15, color: "#0f172a" } }, c.nome), React.createElement("div", { style: S.muted }, [c.bairro, c.cidade].filter(Boolean).join(" · "))), c.potencial && React.createElement(Badge, { color: c.potencial === "Alto" ? "#16a34a" : c.potencial === "Médio" ? "#d97706" : "#64748b", bg: "#f8fafc" }, c.potencial)), React.createElement("div", { style: { fontSize: 13, color: "#334155", margin: "8px 0 4px" } }, stageName(c.etapa)), React.createElement("div", { style: S.muted }, (c.alunos || []).length, " alunos vinculados · ", nl, " leads"), pend && React.createElement("div", { style: { marginTop: 8, display: "flex", gap: 8, alignItems: "center", fontSize: 12, color: "#475569" } }, vencBadge(pend.proximaData), React.createElement("span", null, pend.proxima || "Retomar contato")));
      }));
    }
    function novoCondo() {
      return { id: uid(), nome: "", endereco: "", bairro: "", cidade: "São Bernardo do Campo", sindico: "", responsavel: "", telefone: "", whatsapp: "", email: "", unidades: "", perfilMoradores: "", temAcademia: "", estrutura: "", regrasAcademia: "", credenciamento: "", divulgacao: "", eventos: "", observacoes: "", potencial: "", etapa: 1, etapaDatas: { 1: AGORA() }, alunos: [], historico: [], apresentacao: { responsavel: "", mensagem: "", tipoAcao: "", data: "" }, createdAt: AGORA() };
    }
    function FormCondo() {
      var c = formCondo;
      var up = function(k) {
        return function(v) {
          setFormCondo(function(p) {
            var n = Object.assign({}, p);
            n[k] = v;
            return n;
          });
        };
      };
      var novo = !condos.some(function(x) {
        return x.id === c.id;
      });
      return React.createElement(Modal, { title: novo ? "Novo condomínio" : "Editar condomínio", onClose: function() {
        setFormCondo(null);
      } }, React.createElement(Inp, { label: "Nome do condomínio", value: c.nome, onChange: up("nome") }), React.createElement(Inp, { label: "Endereço", value: c.endereco, onChange: up("endereco") }), React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 } }, React.createElement(Inp, { label: "Bairro", value: c.bairro, onChange: up("bairro") }), React.createElement(Inp, { label: "Cidade", value: c.cidade, onChange: up("cidade") })), React.createElement(Inp, { label: "Síndico", value: c.sindico, onChange: up("sindico") }), React.createElement(Inp, { label: "Administrador ou responsável", value: c.responsavel, onChange: up("responsavel") }), React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 } }, React.createElement(Inp, { label: "Telefone", value: c.telefone, onChange: up("telefone") }), React.createElement(Inp, { label: "WhatsApp", value: c.whatsapp, onChange: up("whatsapp") })), React.createElement(Inp, { label: "E-mail", value: c.email, onChange: up("email") }), React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 } }, React.createElement(Inp, { label: "Unidades (estimado)", type: "number", value: c.unidades, onChange: up("unidades") }), React.createElement(Inp, { label: "Potencial", value: c.potencial, onChange: up("potencial"), opts: POTENCIAL })), React.createElement(Inp, { label: "Perfil predominante dos moradores", value: c.perfilMoradores, onChange: up("perfilMoradores") }), React.createElement(Inp, { label: "Tem academia?", value: c.temAcademia, onChange: up("temAcademia"), opts: SIMNAO }), React.createElement(Inp, { label: "Estrutura disponível", value: c.estrutura, onChange: up("estrutura") }), React.createElement(Inp, { label: "Regras de utilização da academia", value: c.regrasAcademia, onChange: up("regrasAcademia") }), React.createElement(Inp, { label: "Exige credenciamento?", value: c.credenciamento, onChange: up("credenciamento"), opts: SIMNAO }), React.createElement(Inp, { label: "Permite divulgação interna?", value: c.divulgacao, onChange: up("divulgacao"), opts: SIMNAO }), React.createElement(Inp, { label: "Permite eventos?", value: c.eventos, onChange: up("eventos"), opts: SIMNAO }), React.createElement(Inp, { label: "Observações gerais", value: c.observacoes, onChange: up("observacoes") }), React.createElement("div", { style: { display: "flex", gap: 10, marginTop: 6 } }, React.createElement(Btn, { full: true, variant: "secondary", onClick: function() {
        setFormCondo(null);
      } }, "Cancelar"), React.createElement(Btn, { full: true, disabled: !c.nome.trim(), onClick: function() {
        saveCondo(Object.assign({}, c, { nome: c.nome.trim() }));
        setFormCondo(null);
        if (novo) setSel(c.id);
      } }, "Salvar")));
    }
    function Detalhe() {
      var c = condoById[sel];
      var h = hh;
      if (!c) return React.createElement("div", null, React.createElement(Btn, { variant: "ghost", onClick: function() {
        setSel(null);
      }, icon: "back" }, "Voltar"));
      var ja = {};
      condos.forEach(function(x) {
        (x.alunos || []).forEach(function(a) {
          ja[a.studentId] = x.nome;
        });
      });
      var livres = students.filter(function(s) {
        return !ja[s.id];
      });
      var vinc = (c.alunos || []).map(function(a) {
        return { a, s: studentById[a.studentId] };
      }).filter(function(x) {
        return x.s;
      });
      var cl = leads.filter(function(l) {
        return l.condoId === c.id;
      });
      var updAluno = function(sid, patch) {
        saveCondo(Object.assign({}, c, { alunos: c.alunos.map(function(a) {
          return a.studentId === sid ? Object.assign({}, a, patch) : a;
        }) }));
      };
      var Flag = function(p) {
        return React.createElement("label", { style: { display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#475569", marginTop: 6 } }, React.createElement("input", { type: "checkbox", checked: !!p.v, onChange: function(e) {
          p.on(e.target.checked);
        } }), p.l);
      };
      var tel = waNum(c.whatsapp || c.telefone);
      return React.createElement("div", null, React.createElement(Btn, { variant: "ghost", sm: true, onClick: function() {
        setSel(null);
      }, icon: "back" }, "Condomínios"), React.createElement(Card, { style: { marginTop: 8 } }, React.createElement("div", { style: { display: "flex", justifyContent: "space-between", gap: 8 } }, React.createElement("div", null, React.createElement("div", { style: { fontWeight: 800, fontSize: 18 } }, c.nome), React.createElement("div", { style: S.muted }, [c.endereco, c.bairro, c.cidade].filter(Boolean).join(" · "))), React.createElement("div", { style: { display: "flex", gap: 6 } }, React.createElement(Btn, { sm: true, variant: "secondary", onClick: function() {
        setFormCondo(c);
      }, icon: "edit" }), React.createElement(Btn, { sm: true, variant: "danger", onClick: function() {
        delCondo(c);
      }, icon: "trash" }))), React.createElement("div", { style: { marginTop: 12 } }, React.createElement(Inp, { label: "Etapa no pipeline", value: String(c.etapa), onChange: function(v) {
        moveStage(c, Number(v));
      }, opts: STAGES.map(function(s) {
        return { v: String(s.id), l: s.id + ". " + s.l };
      }) })), React.createElement("div", { style: { fontSize: 13, color: "#334155", lineHeight: 1.7 } }, c.sindico && React.createElement("div", null, "Síndico: ", React.createElement("b", null, c.sindico)), c.responsavel && React.createElement("div", null, "Administração: ", React.createElement("b", null, c.responsavel)), c.telefone && React.createElement("div", null, "Telefone: ", c.telefone), c.email && React.createElement("div", null, "E-mail: ", c.email), c.unidades && React.createElement("div", null, "Unidades: ", c.unidades), c.potencial && React.createElement("div", null, "Potencial: ", React.createElement("b", null, c.potencial)), c.temAcademia && React.createElement("div", null, "Academia: ", c.temAcademia === "sim" ? "Sim" : c.temAcademia === "nao" ? "Não" : "A avaliar", c.estrutura ? " · " + c.estrutura : ""), c.regrasAcademia && React.createElement("div", null, "Regras: ", c.regrasAcademia), c.credenciamento && React.createElement("div", null, "Credenciamento: ", c.credenciamento === "sim" ? "Exige" : c.credenciamento === "nao" ? "Não exige" : "A avaliar"), c.divulgacao && React.createElement("div", null, "Divulgação interna: ", c.divulgacao === "sim" ? "Permitida" : c.divulgacao === "nao" ? "Não permitida" : "A avaliar"), c.eventos && React.createElement("div", null, "Eventos: ", c.eventos === "sim" ? "Permitidos" : c.eventos === "nao" ? "Não permitidos" : "A avaliar"), c.observacoes && React.createElement("div", { style: { marginTop: 6 } }, c.observacoes)), React.createElement("div", { style: { display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" } }, tel && React.createElement("a", { href: "https://wa.me/" + tel, target: "_blank", rel: "noopener noreferrer", style: { textDecoration: "none" } }, React.createElement(Btn, { sm: true, variant: "outline" }, "WhatsApp")), React.createElement(Btn, { sm: true, variant: "outline", onClick: function() {
        setTab("materiais");
        pickCondo(c.id);
        setSel(null);
      } }, "Gerar apresentação"))), React.createElement("div", { style: S.sec }, "Alunos vinculados"), vinc.length === 0 && React.createElement(Card, null, React.createElement("div", { style: S.muted }, "Nenhum aluno vinculado. O cadastro do aluno é o mesmo da carteira, sem duplicar dados.")), vinc.map(function(x) {
        return React.createElement(Card, { key: x.s.id, style: { marginBottom: 8, padding: 14 } }, React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 14 } }, x.s.name), React.createElement(Btn, { sm: true, variant: "ghost", icon: "x", onClick: function() {
          if (window.confirm("Desvincular " + x.s.name + " deste condomínio? O aluno continua cadastrado.")) saveCondo(Object.assign({}, c, { alunos: c.alunos.filter(function(a) {
            return a.studentId !== x.s.id;
          }) }));
        } })), React.createElement(Flag, { v: x.a.apresentou, on: function(v) {
          updAluno(x.s.id, { apresentou: v });
        }, l: "Apresentou o profissional ao condomínio" }), React.createElement(Flag, { v: x.a.podeApresentarSindico, on: function(v) {
          updAluno(x.s.id, { podeApresentarSindico: v });
        }, l: "Pode apresentar ao síndico" }), React.createElement(Flag, { v: x.a.podeIndicar, on: function(v) {
          updAluno(x.s.id, { podeIndicar: v });
        }, l: "Pode indicar outros moradores" }), React.createElement("div", { style: { marginTop: 8 } }, React.createElement(Inp, { label: "Autorização de depoimento ou imagem", value: x.a.imagem || "", onChange: function(v) {
          updAluno(x.s.id, { imagem: v });
        }, opts: [{ v: "", l: "Não solicitada" }, { v: "sim", l: "Autorizou por escrito" }, { v: "nao", l: "Não autorizou" }] })), React.createElement(Inp, { label: "Observações do relacionamento", value: x.a.obs || "", onChange: function(v) {
          updAluno(x.s.id, { obs: v });
        } }));
      }), React.createElement(Btn, { sm: true, variant: "outline", icon: "link", onClick: function() {
        setModal("aluno");
      } }, "Vincular aluno"), React.createElement("div", { style: S.sec }, "Histórico de atividades"), React.createElement(Btn, { sm: true, icon: "plus", onClick: function() {
        setH({ pessoa: "", tipo: "WhatsApp", resultado: "", proxima: "", proximaData: "", obs: "", data: hoje });
        setModal("hist");
      } }, "Registrar interação"), React.createElement("div", { style: { marginTop: 10 } }, (c.historico || []).length === 0 && React.createElement("div", { style: S.muted }, "Sem registros ainda."), (c.historico || []).map(function(x) {
        return React.createElement(Card, { key: x.id, style: { marginBottom: 8, padding: 12 } }, React.createElement("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 12, color: "#64748b" } }, React.createElement("span", null, fmt(x.data), " · ", x.tipo, x.pessoa ? " · " + x.pessoa : ""), x.proximaData && !x.feito && vencBadge(x.proximaData)), x.resultado && React.createElement("div", { style: { fontSize: 13, marginTop: 4 } }, x.resultado), x.obs && React.createElement("div", { style: { fontSize: 12, color: "#64748b", marginTop: 2 } }, x.obs), x.proximaData && React.createElement("div", { style: { fontSize: 12, color: "#475569", marginTop: 4 } }, "Próxima ação: ", x.proxima || "Retomar contato", " em ", fmt(x.proximaData), x.feito ? " (concluída)" : ""), x.proximaData && !x.feito && React.createElement("div", { style: { marginTop: 6 } }, React.createElement(Btn, { sm: true, variant: "outline", icon: "check", onClick: function() {
          concluirFollow(c, x);
        } }, "Concluir")));
      })), React.createElement("div", { style: S.sec }, "Leads deste condomínio (", cl.length, ")"), cl.map(function(l) {
        return React.createElement(Card, { key: l.id, style: { marginBottom: 6, padding: 12, fontSize: 13 }, onClick: function() {
          setFormLead(l);
        } }, React.createElement("b", null, l.nome), " ", React.createElement("span", { style: S.muted }, "· ", lstageName(l.etapa)));
      }), React.createElement(Btn, { sm: true, variant: "outline", icon: "plus", onClick: function() {
        setFormLead(novoLead(c.id));
      } }, "Novo lead"), modal === "aluno" && React.createElement(Modal, { title: "Vincular aluno", onClose: function() {
        setModal("");
      } }, livres.length === 0 ? React.createElement("div", { style: S.muted }, "Todos os alunos já estão vinculados a algum condomínio.") : React.createElement("div", null, React.createElement(Inp, { label: "Aluno da carteira", value: pick, onChange: setPick, opts: [{ v: "", l: "Selecione" }].concat(livres.map(function(s) {
        return { v: s.id, l: s.name };
      })) }), React.createElement(Btn, { full: true, disabled: !pick, onClick: function() {
        saveCondo(Object.assign({}, c, { alunos: (c.alunos || []).concat([{ studentId: pick, apresentou: false, podeApresentarSindico: false, podeIndicar: false, imagem: "", obs: "" }]) }));
        setPick("");
        setModal("");
      } }, "Vincular"), React.createElement("div", { style: { fontSize: 11, color: "#94a3b8", marginTop: 8 } }, "Cada aluno pode estar em um condomínio. Para mudar, desvincule do atual."))), modal === "hist" && React.createElement(Modal, { title: "Registrar interação", onClose: function() {
        setModal("");
      } }, React.createElement(Inp, { label: "Data do contato", type: "date", value: h.data, onChange: function(v) {
        setH(Object.assign({}, h, { data: v }));
      } }), React.createElement(Inp, { label: "Pessoa contatada", value: h.pessoa, onChange: function(v) {
        setH(Object.assign({}, h, { pessoa: v }));
      } }), React.createElement(Inp, { label: "Tipo de interação", value: h.tipo, onChange: function(v) {
        setH(Object.assign({}, h, { tipo: v }));
      }, opts: INTERACOES.map(function(t) {
        return { v: t, l: t };
      }) }), React.createElement(Inp, { label: "Resultado", value: h.resultado, onChange: function(v) {
        setH(Object.assign({}, h, { resultado: v }));
      } }), React.createElement(Inp, { label: "Próxima ação", value: h.proxima, onChange: function(v) {
        setH(Object.assign({}, h, { proxima: v }));
      } }), React.createElement(Inp, { label: "Data do próximo acompanhamento", type: "date", value: h.proximaData, onChange: function(v) {
        setH(Object.assign({}, h, { proximaData: v }));
      } }), React.createElement(Inp, { label: "Observações", value: h.obs, onChange: function(v) {
        setH(Object.assign({}, h, { obs: v }));
      } }), React.createElement(Btn, { full: true, onClick: function() {
        addHist(c, h);
        setModal("");
      } }, "Salvar")));
    }
    function Pipeline() {
      return React.createElement("div", null, React.createElement("div", { style: S.muted }, "Deslize para o lado. Use as setas para mover o condomínio de etapa."), React.createElement("div", { style: { display: "flex", gap: 10, overflowX: "auto", paddingBottom: 10, marginTop: 10 } }, STAGES.map(function(st) {
        var cs = condos.filter(function(c) {
          return c.etapa === st.id;
        });
        return React.createElement("div", { key: st.id, style: { minWidth: 230, maxWidth: 230, background: "#f1f5f9", borderRadius: 14, padding: 10 } }, React.createElement("div", { style: { fontWeight: 800, fontSize: 12, color: "#334155", marginBottom: 8 } }, st.id, ". ", st.l, " ", React.createElement("span", { style: { color: O } }, "(", cs.length, ")")), cs.map(function(c) {
          var pend = (c.historico || []).some(function(h) {
            return h.proximaData && !h.feito && h.proximaData <= hoje;
          });
          return React.createElement(Card, { key: c.id, style: { padding: 10, marginBottom: 8 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 13, cursor: "pointer" }, onClick: function() {
            setSel(c.id);
            setTab("condominios");
          } }, c.nome), React.createElement("div", { style: { fontSize: 11, color: "#64748b" } }, c.bairro, c.potencial ? " · " + c.potencial : ""), pend && React.createElement("div", { style: { marginTop: 4 } }, React.createElement(Badge, { color: "#dc2626", bg: "#fee2e2" }, "Follow-up")), React.createElement("div", { style: { display: "flex", justifyContent: "space-between", marginTop: 8 } }, React.createElement(Btn, { sm: true, variant: "secondary", disabled: st.id === 1, onClick: function() {
            moveStage(c, st.id - 1);
          } }, "‹"), React.createElement(Btn, { sm: true, variant: "secondary", disabled: st.id === 11, onClick: function() {
            moveStage(c, st.id + 1);
          } }, "›")));
        }));
      })));
    }
    function novoLead(condoId) {
      return { id: uid(), nome: "", telefone: "", condoId: condoId || "", origem: "Aluno atual", perfil: "50+", objetivo: "", servico: "", obs: "", primeiroContato: AGORA(), etapa: 1, etapaDatas: { 1: AGORA() }, valorMensal: "", studentId: "" };
    }
    function FormLead() {
      var l = formLead, setL = setFormLead;
      var up = function(k) {
        return function(v) {
          setFormLead(function(p) {
            var n = Object.assign({}, p);
            n[k] = v;
            return n;
          });
        };
      };
      var novo = !leads.some(function(x) {
        return x.id === l.id;
      });
      var dup = dupLead;
      var converter = function() {
        if (l.studentId) return;
        var sid;
        if (dup) {
          if (!window.confirm("Já existe o aluno " + dup.name + " com dados iguais. Vincular este lead a ele, sem criar outro cadastro?")) return;
          sid = dup.id;
        } else {
          sid = uid();
          setStudents(function(prev2) {
            return prev2.concat([{ id: sid, name: l.nome.trim(), phone: l.telefone, whatsapp: l.telefone, dob: "", sex: "", createdAt: AGORA() }]);
          });
        }
        var ed = Object.assign({}, l.etapaDatas || {});
        for (var i = 1; i <= 7; i++) {
          if (!ed[i]) ed[i] = AGORA();
        }
        var nl = Object.assign({}, l, { etapa: 7, etapaDatas: ed, studentId: sid });
        saveLead(nl);
        var c = condoById[l.condoId];
        if (c && !(c.alunos || []).some(function(a) {
          return a.studentId === sid;
        })) {
          var jaEm = condos.some(function(x) {
            return (x.alunos || []).some(function(a) {
              return a.studentId === sid;
            });
          });
          if (!jaEm) saveCondo(Object.assign({}, c, { alunos: (c.alunos || []).concat([{ studentId: sid, apresentou: false, podeApresentarSindico: false, podeIndicar: false, imagem: "", obs: "Conquistado pelo Projeto Condomínios" }]) }));
        }
        setFormLead(null);
        say(dup ? "Lead vinculado ao aluno existente" : "Aluno criado no cadastro principal");
      };
      return React.createElement(Modal, { title: novo ? "Novo lead" : "Editar lead", onClose: function() {
        setFormLead(null);
      } }, React.createElement(Inp, { label: "Nome do interessado", value: l.nome, onChange: up("nome") }), React.createElement(Inp, { label: "Telefone ou WhatsApp", value: l.telefone, onChange: up("telefone") }), React.createElement(Inp, { label: "Condomínio de origem", value: l.condoId, onChange: up("condoId"), opts: [{ v: "", l: "Selecione" }].concat(condos.map(function(c) {
        return { v: c.id, l: c.nome };
      })) }), React.createElement(Inp, { label: "Como chegou até mim", value: l.origem, onChange: up("origem"), opts: ORIGENS }), React.createElement(Inp, { label: "Perfil", value: l.perfil, onChange: up("perfil"), opts: PERFIS_LEAD }), React.createElement(Inp, { label: "Objetivo principal", value: l.objetivo, onChange: up("objetivo") }), React.createElement(Inp, { label: "Serviço de interesse", value: l.servico, onChange: up("servico"), opts: SERVICOS }), React.createElement(Inp, { label: "Data do primeiro contato", type: "date", value: l.primeiroContato, onChange: up("primeiroContato") }), React.createElement(Inp, { label: "Etapa", value: String(l.etapa), onChange: function(v) {
        var n = Number(v);
        var ed = Object.assign({}, l.etapaDatas || {});
        if (n <= 7) {
          for (var i = 1; i <= n; i++) {
            if (!ed[i]) ed[i] = AGORA();
          }
        } else {
          ed[8] = AGORA();
        }
        setL(Object.assign({}, l, { etapa: n, etapaDatas: ed }));
      }, opts: LSTAGES.map(function(s) {
        return { v: String(s.id), l: s.id + ". " + s.l };
      }) }), React.createElement(Inp, { label: "Valor mensal originado (R$)", type: "number", value: l.valorMensal, onChange: up("valorMensal"), note: "Preencha quando fechar. Alimenta a receita do projeto." }), React.createElement(Inp, { label: "Observações", value: l.obs, onChange: up("obs") }), dup && !l.studentId && React.createElement("div", { style: { fontSize: 12, color: "#d97706", marginBottom: 10 } }, "Atenção: já existe o aluno ", dup.name, " com nome ou telefone parecido."), l.studentId && React.createElement("div", { style: { fontSize: 12, color: "#16a34a", marginBottom: 10 } }, "Convertido em aluno: ", (studentById[l.studentId] || {}).name || "cadastro principal"), React.createElement("div", { style: { display: "flex", gap: 10 } }, !novo && React.createElement(Btn, { variant: "danger", onClick: function() {
        delLead(l);
        setFormLead(null);
      }, icon: "trash" }), React.createElement(Btn, { full: true, disabled: !l.nome.trim(), onClick: function() {
        saveLead(Object.assign({}, l, { nome: l.nome.trim() }));
        setFormLead(null);
      } }, "Salvar")), !novo && !l.studentId && React.createElement("div", { style: { marginTop: 10 } }, React.createElement(Btn, { full: true, variant: "outline", disabled: !l.nome.trim(), onClick: converter }, "Converter em aluno")));
    }
    function Leads() {
      var st = stLead;
      var base = fCondo ? leads.filter(function(l) {
        return l.condoId === fCondo;
      }) : leads;
      var list = base.filter(function(l) {
        return !st || l.etapa === st;
      });
      return React.createElement("div", null, React.createElement("div", { style: { display: "flex", gap: 8, marginBottom: 10 } }, React.createElement("div", { style: { flex: 1 } }, React.createElement(Inp, { value: fCondo, onChange: setFCondo, opts: [{ v: "", l: "Todos os condomínios" }].concat(condos.map(function(c) {
        return { v: c.id, l: c.nome };
      })) })), React.createElement("div", { style: { marginBottom: 13 } }, React.createElement(Btn, { icon: "plus", onClick: function() {
        setFormLead(novoLead(fCondo));
      } }, "Novo"))), React.createElement("div", { style: { display: "flex", gap: 6, overflowX: "auto", paddingBottom: 8 } }, React.createElement("button", { style: S.chip(st === 0), onClick: function() {
        setSt(0);
      } }, "Todos (", base.length, ")"), LSTAGES.map(function(s) {
        return React.createElement("button", { key: s.id, style: S.chip(st === s.id), onClick: function() {
          setSt(s.id);
        } }, s.l, " (", base.filter(function(l) {
          return l.etapa === s.id;
        }).length, ")");
      })), list.length === 0 && React.createElement(Card, null, React.createElement("div", { style: S.muted }, "Nenhum lead nesta visão.")), list.map(function(l) {
        var c = condoById[l.condoId];
        var tel = waNum(l.telefone);
        return React.createElement(Card, { key: l.id, style: { marginTop: 10, padding: 14 } }, React.createElement("div", { style: { display: "flex", justifyContent: "space-between", gap: 8 } }, React.createElement("div", { onClick: function() {
          setFormLead(l);
        }, style: { cursor: "pointer" } }, React.createElement("div", { style: { fontWeight: 800, fontSize: 14 } }, l.nome), React.createElement("div", { style: S.muted }, c ? c.nome : "Sem condomínio", " · ", l.origem)), l.studentId && React.createElement(Badge, { color: "#16a34a", bg: "#dcfce7" }, "Aluno")), React.createElement("div", { style: { display: "flex", gap: 8, marginTop: 10, alignItems: "center" } }, React.createElement("div", { style: { flex: 1 } }, React.createElement("select", { value: l.etapa, onChange: function(e) {
          moveLead(l, Number(e.target.value));
        }, style: { width: "100%", padding: "8px 10px", borderRadius: 9, border: "1.5px solid #e2e8f0", background: "#f8fafc", fontSize: 13 } }, LSTAGES.map(function(s) {
          return React.createElement("option", { key: s.id, value: s.id }, s.id, ". ", s.l);
        }))), tel && React.createElement("a", { href: "https://wa.me/" + tel, target: "_blank", rel: "noopener noreferrer", style: { textDecoration: "none" } }, React.createElement(Btn, { sm: true, variant: "outline" }, "WhatsApp"))));
      }));
    }
    var pickCondo = function(id) {
      setCid(id);
      var cc = condoById[id];
      var a = cc && cc.apresentacao || {};
      setF(function(p) {
        return { responsavel: a.responsavel || (cc ? cc.sindico || cc.responsavel || "" : ""), mensagem: a.mensagem || "", tipoAcao: a.tipoAcao || "", data: a.data || "", whats: p.whats };
      });
    };
    function Materiais() {
      var c = condoById[cid];
      var f = fm;
      var m = MATERIAIS.find(function(x) {
        return x.id === mat;
      });
      var publico = /^https?:$/.test(window.location.protocol);
      var base = new URL(m.file, window.location.href).href;
      var w = digits(f.whats) || digits(prof && prof.whatsapp);
      var qs = [];
      var add = function(k, v) {
        if (v) qs.push(k + "=" + encodeURIComponent(String(v).slice(0, 280)));
      };
      if (c) {
        add("c", c.nome);
        add("b", c.bairro);
      }
      add("r", f.responsavel);
      add("m", f.mensagem);
      add("a", f.tipoAcao);
      add("d", f.data);
      add("w", waNum(w));
      var fixo = !!m.fixo;
      var url = fixo ? base : base + (qs.length ? "?" + qs.join("&") : "");
      var printUrl = url + (qs.length ? "&" : "?") + "print=1";
      var texto = fixo ? "Olá! Segue a apresentação do programa Academia Assistida: " + url : "Olá" + (f.responsavel ? ", " + f.responsavel : "") + "! Preparei uma apresentação" + (c ? " pensando no " + c.nome : "") + ". Segue o link: " + url;
      var salvar = function() {
        if (c) saveCondo(Object.assign({}, c, { apresentacao: { responsavel: f.responsavel, mensagem: f.mensagem, tipoAcao: f.tipoAcao, data: f.data } }));
        say("Personalização salva");
      };
      var upf = function(k) {
        return function(v) {
          setF(function(p) {
            var n = Object.assign({}, p);
            n[k] = v;
            return n;
          });
        };
      };
      var aBtn = { textDecoration: "none" };
      return React.createElement("div", null, React.createElement("div", { style: { display: "flex", gap: 6, overflowX: "auto", paddingBottom: 8 } }, MATERIAIS.map(function(x) {
        return React.createElement("button", { key: x.id, style: S.chip(mat === x.id), onClick: function() {
          setMat(x.id);
        } }, x.pub);
      })), React.createElement(Card, { style: { marginTop: 8 } }, React.createElement("div", { style: { fontWeight: 800, fontSize: 15 } }, m.titulo), React.createElement("div", { style: { ...S.muted, marginBottom: 12 } }, fixo ? "Apresentação fixa, igual para todos. Não leva personalização no link." : "O modelo base não muda. A versão personalizada vive só no link."), !fixo && React.createElement("div", null, React.createElement(Inp, { label: "Condomínio", value: cid, onChange: pickCondo, opts: [{ v: "", l: "Versão geral, sem condomínio" }].concat(condos.map(function(x) {
        return { v: x.id, l: x.nome };
      })) }), React.createElement(Inp, { label: "Nome do responsável", value: f.responsavel, onChange: upf("responsavel") }), React.createElement(Inp, { label: "Mensagem de abertura", value: f.mensagem, onChange: upf("mensagem"), placeholder: "Opcional, até 280 caracteres" }), React.createElement(Inp, { label: "Tipo de ação proposta", value: f.tipoAcao, onChange: upf("tipoAcao"), opts: [{ v: "", l: "Não destacar" }, { v: "Personal na academia do condomínio", l: "Personal na academia do condomínio" }, { v: "Encontro educativo Movimento 50+", l: "Encontro educativo Movimento 50+" }, { v: "Atendimento para casais", l: "Atendimento para casais" }, { v: "Pequenos grupos", l: "Pequenos grupos" }, { v: "Consultoria de treinamento", l: "Consultoria de treinamento" }] }), React.createElement(Inp, { label: "Data da apresentação", type: "date", value: f.data, onChange: upf("data") }), React.createElement(Inp, { label: "WhatsApp que aparece na página", value: f.whats, onChange: upf("whats"), placeholder: prof && prof.whatsapp ? "Usando o do seu perfil" : "Preencha aqui ou no seu perfil", note: "Se vazio, usa o WhatsApp do seu perfil profissional." }), !w && React.createElement("div", { style: { fontSize: 12, color: "#d97706", marginBottom: 10 } }, "Sem WhatsApp definido, os botões de contato não aparecem na página.")), !publico && React.createElement("div", { style: { fontSize: 12, color: "#dc2626", marginBottom: 10 } }, "Você abriu o app fora do site publicado. O link só funciona para outras pessoas depois que os arquivos de apresentação estiverem no mesmo endereço do app."), React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 } }, React.createElement(Btn, { variant: "secondary", icon: "eye", onClick: function() {
        setPrev(true);
      } }, "Visualizar"), React.createElement(Btn, { variant: "secondary", icon: "link", onClick: function() {
        copyText(url).then(function(ok) {
          say(ok ? "Link copiado" : "Não consegui copiar, selecione manualmente");
        });
      } }, "Copiar link"), React.createElement("a", { href: "https://wa.me/?text=" + encodeURIComponent(texto), target: "_blank", rel: "noopener noreferrer", style: aBtn }, React.createElement(Btn, { full: true, variant: "outline" }, "WhatsApp")), React.createElement("a", { href: url, target: "_blank", rel: "noopener noreferrer", style: aBtn }, React.createElement(Btn, { full: true, variant: "outline" }, "Abrir no navegador"))), !fixo && React.createElement("div", { style: { marginTop: 8 } }, React.createElement("a", { href: printUrl, target: "_blank", rel: "noopener noreferrer", style: aBtn }, React.createElement(Btn, { full: true, variant: "outline", icon: "download" }, "Imprimir ou salvar PDF"))), !fixo && c && React.createElement("div", { style: { marginTop: 8 } }, React.createElement(Btn, { full: true, variant: "ghost", onClick: salvar }, "Guardar personalização neste condomínio")), !fixo && React.createElement("div", { style: { fontSize: 11, color: "#94a3b8", marginTop: 10, lineHeight: 1.5 } }, "O link leva só nome do condomínio, bairro, responsável, mensagem, ação, data e o WhatsApp profissional. Nenhum dado de aluno, lead ou administrativo é enviado. Nada é enviado automaticamente: o WhatsApp abre para você revisar e enviar.")), prev && React.createElement(Modal, { title: "Visualização", onClose: function() {
        setPrev(false);
      } }, publico ? React.createElement("iframe", { title: "previa", src: url, style: { width: "100%", height: "60vh", border: "1px solid #e2e8f0", borderRadius: 10 } }) : React.createElement("div", { style: S.muted }, "A visualização precisa do app publicado no site. Use o app pelo endereço do GitHub Pages.")));
    }
    return React.createElement("div", { style: { padding: "0 0 90px" } }, React.createElement("div", { style: { fontWeight: 800, fontSize: 22, color: "#0f172a", marginBottom: 4 } }, "Projeto Condomínios"), React.createElement("div", { style: { ...S.muted, marginBottom: 12 } }, "Prospecção e captação de alunos em condomínios"), React.createElement("div", { style: { display: "flex", gap: 6, overflowX: "auto", paddingBottom: 10 } }, tabs.map(function(t) {
      return React.createElement("button", { key: t[0], style: S.chip(tab === t[0]), onClick: function() {
        setTab(t[0]);
        setSel(null);
      } }, t[1], t[0] === "painel" && atrasados > 0 ? " (" + atrasados + ")" : "");
    })), tab === "painel" && Painel(), tab === "condominios" && (sel ? Detalhe() : Lista()), tab === "pipeline" && Pipeline(), tab === "leads" && Leads(), tab === "materiais" && Materiais(), formCondo && FormCondo(), formLead && FormLead(), toast && React.createElement("div", { style: { position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)", background: "#1F2E2A", color: "#fff", padding: "10px 18px", borderRadius: 99, fontSize: 13, fontWeight: 600, zIndex: 2e3 } }, toast));
  }
  window.ProjetoCondominios = { Page, STAGES, LSTAGES };
})();
