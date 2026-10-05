(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.VRModel = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';
  const DATE = '2026-09-30';
  const clone = value => JSON.parse(JSON.stringify(value));
  const areas = [
    {id:'sede',name:'Sede e galpão',x:15,y:26,w:23,h:24,color:'#dad7b2'},
    {id:'norte',name:'Área Norte',x:43,y:12,w:43,h:31,color:'#b6c991'},
    {id:'sul',name:'Área Sul',x:39,y:57,w:43,h:28,color:'#c5cf9c'},
    {id:'oficina',name:'Oficina',x:10,y:61,w:23,h:23,color:'#e0cbb0'},
    {id:'talhao',name:'Talhão 02',x:88,y:50,w:9,h:37,color:'#aabf86'}
  ];
  const names = ['Carlos Mendes','João Ferreira','Marcos Santos','Luiza Oliveira','Pedro Costa','Renata Lima','José Almeida','Bruno Rocha'];
  function seed() {
    const specs = [
      ['TR-001','John Deere 6150J','Trator','Parado','sede',22,36,'Celular',0],
      ['TR-002','New Holland T7','Trator','Parado','sede',32,39,'Celular',1],
      ['TR-003','Massey Ferguson 7725','Trator','Operando','norte',56,32,'LoRaWAN',3],
      ['TR-004','Valtra BH224','Trator','Operando','sul',55,68,'Celular',4],
      ['CO-001','John Deere S770','Colheitadeira','Operando','norte',74,34,'Celular',5],
      ['CO-002','Case IH Axial-Flow','Colheitadeira','Operando','sul',69,71,'LoRaWAN',6],
      ['PL-001','Jacto Uniport 3030','Pulverizador','Operando','norte',63,20,'Celular',7],
      ['PL-002','John Deere M4040','Pulverizador','Parado','sede',18,43,'Celular',3],
      ['AP-001','Toyota Hilux','Veículo de apoio','Offline','oficina',19,70,'Offline',1],
      ['AP-002','Fiat Strada','Veículo de apoio','Operando','sul',45,78,'Celular',0],
      ['TR-005','John Deere 5078E','Trator','Parado','oficina',27,74,'Celular',4],
      ['TR-006','New Holland TT4.75','Trator','Operando','talhao',92,67,'LoRaWAN',6]
    ];
    const operators = names.map((name,i)=>({id:'OP-00'+(i+1),name,rfid:['8F3A21','7B9C14','5D2E91','4A8B12','9C6D22','2B8F41','1A7E33','6C4D88'][i],status:i===2?'Suspenso':'Ativo',start:'06:00',end:'18:00',assets:specs.filter(s=>s[8]===i).map(s=>s[0])}));
    const assets = specs.map((s,i)=>({id:s[0],name:s[1],type:s[2],status:s[3],area:s[4],x:s[5],y:s[6],connection:s[7],operator:s[3]==='Operando'?operators[s[8]].id:null,speed:s[3]==='Operando'?8+i:0,ignition:s[3]==='Operando',battery:i===8?21:96-i*3,power:'Principal',allowedAreas:['sede','norte','sul','oficina','talhao'],start:'06:00',end:'18:00',updated:s[3]==='Offline'?'14:12:00':'14:32:00',plate:'VR '+String(i+101),risk:s[3]==='Offline'?'Atenção':'Normal',route:[],lastRfid:null}));
    const state={version:1,clock:'14:32:00',date:DATE,nextId:50,assets,operators,areas:clone(areas),alerts:[],occurrences:[],requests:[],audit:[],scenario:null,settings:{farm:'Fazenda Santa Helena',manager:'Ana Souza',retention:90,notifications:true}};
    const sample = [
      ['06:01:00','TR-003','OP-004','RFID','Baixa','Luiza Oliveira identificada por RFID; autorização aprovada.'],
      ['06:03:00','TR-003','OP-004','Operação','Baixa','Ignição detectada e início da operação na Área Norte.'],
      ['07:10:00','CO-001','OP-006','RFID','Baixa','Renata Lima identificada; uso normal autorizado.'],
      ['07:12:00','CO-001','OP-006','Operação','Baixa','Colheitadeira iniciou deslocamento a 12 km/h.'],
      ['08:02:00','PL-001','OP-008','Operação','Baixa','Pulverizador iniciou operação dentro da área permitida.'],
      ['08:37:00','TR-004','OP-005','Geofence','Baixa','Entrada na Área Sul registrada.'],
      ['09:12:00','TR-001','OP-001','Operação','Baixa','Trator estacionado no galpão; ignição desligada.'],
      ['10:24:00','CO-002','OP-007','Conectividade','Média','Rede celular indisponível; gateway LoRaWAN local ativo.'],
      ['11:05:00','TR-006','OP-007','RFID','Baixa','José Almeida identificado; autorização aprovada.'],
      ['12:18:00','TR-002','OP-002','Autorização','Baixa','Gestora Ana Souza registrou autorização excepcional.'],
      ['14:12:00','AP-001',null,'Conectividade','Alta','Última comunicação recebida; conexão total indisponível.'],
      ['14:21:00','AP-001',null,'Alerta','Alta','Rastreador offline; posição exibida é a última conhecida.']
    ];
    sample.forEach(e=>log(state,...e));
    addAlert(state,'AP-001','Rastreador offline','Alta','Sem comunicação celular ou LoRaWAN. Última atualização às 14:12; verificar o rastreador.','14:21:00');
    addAlert(state,'CO-002','Perda de sinal celular','Média','Comunicação de contingência ativa via gateway LoRaWAN local.','10:24:00');
    state.requests.push({id:'LIB-0041',asset:'TR-002',operator:'OP-002',date:DATE,time:'12:17:00',reason:'Exceção operacional de demonstração.',status:'Autorizada',justification:'Deslocamento supervisionado ao galpão.',manager:'Ana Souza',decided:'12:18:00',validUntil:DATE+' 23:59:59'});
    state.occurrences.push({id:'VR-2026-0042',asset:'TR-005',operator:null,start:'2026-09-29 22:43:02',priority:'Crítica',status:'Encerrada',reason:'Movimentação sem RFID e tentativa de violação',area:'Oficina',events:[
      {time:'22:43:02',text:'Ignição detectada sem identificação RFID.'},{time:'22:44:05',text:'Saída da área autorizada detectada.'},{time:'22:45:17',text:'Perda celular; contingência LoRaWAN ativada.'},{time:'22:46:04',text:'Corte de alimentação; bateria interna ativa.'},{time:'23:10:00',text:'Ana Souza registrou verificação local e encerrou a ocorrência de demonstração.'}],resolution:'Verificação local realizada na simulação; ativo retornou à oficina.',closedBy:'Ana Souza'});
    return state;
  }
  function log(s,time,asset,operator,category,priority,text) {
    const event={id:'EV-'+s.nextId++,date:s.date,time,asset,operator,category,priority,text};s.audit.unshift(event);return event;
  }
  function asset(s,id) {const a=s.assets.find(a=>a.id===id);if(!a)throw Error('Ativo não encontrado.');return a;}
  function operator(s,id) {return s.operators.find(o=>o.id===id);}
  function addAlert(s,id,title,priority,reason,time=s.clock) {
    const a=asset(s,id);const alert={id:'AL-'+s.nextId++,asset:id,operator:a.operator,date:s.date,time,area:a.area,title,priority,reason,status:'Aberto',occurrence:null};s.alerts.unshift(alert);return alert;
  }
  function authorize(s,a,o,time) {
    if (!o || o.status!=='Ativo' || !o.assets.includes(a.id)) return {type:'irregular',title:'Uso irregular',reason:!o?'Nenhum RFID válido identificado.':o.status!=='Ativo'?'Operador suspenso.':'Operador não autorizado para este ativo.'};
    if (!a.allowedAreas.includes(a.area)) return {type:'irregular',title:'Uso irregular',reason:'Ativo fora da área permitida.'};
    const t=time.slice(0,5);
    const inWindow=(t,start,end)=>start<=end ? t>=start && t<=end : t>=start || t<=end;
    const exception=s.requests.some(r=>r.asset===a.id&&r.operator===o.id&&r.status==='Autorizada'&&r.date===s.date&&t>=r.decided.slice(0,5)&&s.date+' '+time<=r.validUntil);
    if(!exception&&(!inWindow(t,a.start,a.end)||!inWindow(t,o.start,o.end)))return {type:'exception',title:'Solicitar liberação',reason:'Operador autorizado, porém fora do horário permitido.'};
    if(exception)return {type:'normal',title:'Uso normal',reason:'Uso autorizado por liberação excepcional registrada pelo gestor.'};
    return {type:'normal',title:'Uso normal',reason:'Operador, horário e área autorizados.'};
  }
  function request(s,a,o,reason,time) {
    const current=s.requests.find(r=>r.asset===a.id&&r.status==='Pendente'); if(current)return current;
    const r={id:'LIB-'+s.nextId++,asset:a.id,operator:o?.id||null,date:s.date,time,reason,status:'Pendente',justification:''};s.requests.unshift(r);return r;
  }
  function readRfid(s,id,opId,time) {
    const a=asset(s,id),o=operator(s,opId);s.clock=time;a.lastRfid=o?.rfid||null;a.operator=o?.id||null;a.updated=time;
    const result=authorize(s,a,o,time);
    a.risk=result.type==='normal'?'Normal':result.type==='exception'?'Atenção':'Irregular';
    log(s,time,id,o?.id||null,'RFID',result.type==='normal'?'Baixa':'Alta',`${o?o.name+' · RFID '+o.rfid:'RFID não identificado'}. ${result.title}: ${result.reason}`);
    if(result.type==='irregular')addAlert(s,id,'Operador não autorizado','Alta',result.reason,time);
    if(result.type==='exception'){request(s,a,o,result.reason,time);addAlert(s,id,'Movimentação fora do horário','Alta',result.reason,time);}
    return result;
  }
  function occurrence(s,a,reason,events,priority='Crítica') {
    const oc={id:'VR-2026-'+String(s.nextId++).padStart(4,'0'),asset:a.id,operator:a.operator,start:s.date+' '+events[0].time,priority,status:'Aberta',reason,area:s.areas.find(z=>z.id===a.area)?.name||'Fora da propriedade',events:clone(events),resolution:''};s.occurrences.unshift(oc);return oc;
  }
  function simulate(s,kind,id) {
    const a=asset(s,id),o=s.operators.find(o=>o.status==='Ativo'&&o.assets.includes(id));
    const t='14:33:00';s.clock=t;let event,alert,oc;
    if(kind==='normal'){
      if(!o)throw Error('Este ativo precisa de um operador autorizado.');
      if(!a.allowedAreas.includes(a.area)){const z=s.areas.find(z=>a.allowedAreas.includes(z.id));if(z){a.area=z.id;a.x=z.x+z.w/2;a.y=z.y+z.h/2;}}
      const result=readRfid(s,id,o.id,t);
      if(result.type!=='normal')return {title:result.title,reason:result.reason};
      Object.assign(a,{status:'Operando',speed:12,ignition:true,connection:'Celular',risk:'Normal',power:'Principal',updated:t});log(s,t,id,o.id,'Operação','Baixa','Ignição e movimentação detectadas. Uso normal registrado.');
      return {title:'Uso normal registrado',reason:'RFID aprovado, horário permitido e ativo dentro da geofence.'};
    }
    if(kind==='unauthorized'){
      const other=s.operators.find(o=>!o.assets.includes(id)&&o.status==='Ativo');const res=readRfid(s,id,other.id,t);Object.assign(a,{status:'Alerta',ignition:true,speed:11});
      event=log(s,t,id,other.id,'Operação','Alta','Movimentação com operador sem autorização detectada.');alert=s.alerts[0];oc=occurrence(s,a,res.reason,[{time:t,text:event.text}],'Alta');alert.occurrence=oc.id;
    }else if(kind==='geofence'){
      Object.assign(a,{x:95,y:19,area:'fora',status:'Alerta',risk:'Irregular',speed:14,ignition:true});
      event=log(s,t,id,a.operator,'Geofence','Crítica','Saída da geofence autorizada. Posição fora da propriedade.');alert=addAlert(s,id,'Saída de geofence','Crítica',event.text);oc=occurrence(s,a,event.text,[{time:t,text:event.text}]);alert.occurrence=oc.id;
    }else if(kind==='afterhours'){
      if(!o)throw Error('Nenhum operador autorizado cadastrado.');s.clock='22:30:00';a.operator=o.id;a.lastRfid=o.rfid;a.risk='Atenção';a.status='Parado';a.speed=0;a.ignition=false;
      request(s,a,o,'Uso fora do horário cadastrado (06h às 18h).',s.clock);alert=addAlert(s,id,'Movimentação fora do horário','Alta','Operador identificado solicita liberação antes de iniciar.');log(s,s.clock,id,o.id,'Autorização','Alta','Solicitação excepcional enviada à gestora; ativo aguarda decisão.');
    }else if(kind==='cellular'){
      a.connection='LoRaWAN';event=log(s,t,id,a.operator,'Conectividade','Média','Celular indisponível. Comunicação de contingência ativa via gateway LoRaWAN local.');alert=addAlert(s,id,'Perda de sinal celular','Média',event.text);
    }else if(kind==='tamper'){
      Object.assign(a,{power:'Bateria interna',status:'Alerta',risk:'Irregular',battery:64});event=log(s,t,id,a.operator,'Violação','Crítica','Tentativa de remoção e corte de alimentação. Bateria interna ativa.');alert=addAlert(s,id,'Violação do equipamento','Crítica',event.text);oc=occurrence(s,a,event.text,[{time:t,text:event.text}]);alert.occurrence=oc.id;
    }else if(kind==='offline'){
      a.connection='Offline';a.status='Offline';a.risk='Atenção';a.speed=0;a.updated='14:12:00';event=log(s,t,id,a.operator,'Conectividade','Alta','Comunicação celular e LoRaWAN indisponíveis. Posição congelada na última comunicação.');alert=addAlert(s,id,'Rastreador offline','Alta',event.text);
    }else if(kind==='battery'){
      a.battery=8;a.risk='Atenção';event=log(s,t,id,a.operator,'Alimentação','Alta','Bateria do rastreador abaixo de 10%.');alert=addAlert(s,id,'Bateria crítica','Alta',event.text);
    }else throw Error('Cenário inválido.');
    if(kind!=='offline')a.updated=s.clock;
    return {title:alert.title,reason:alert.reason,occurrence:oc?.id};
  }
  function startScenario(s,id) {
    if(s.scenario&&!s.scenario.done)throw Error('Conclua ou reinicie a demonstração atual.');
    const a=asset(s,id);Object.assign(a,{status:'Parado',area:'sede',x:30,y:38,connection:'Celular',speed:0,ignition:false,operator:null,lastRfid:null,power:'Principal',risk:'Normal',route:[]});
    s.scenario={asset:id,step:0,done:false,occurrence:null,events:[]};s.clock='22:42:00';return s.scenario;
  }
  function advanceScenario(s) {
    const sc=s.scenario;if(!sc||sc.done)return null;const a=asset(s,sc.asset);sc.step++;
    const steps=[
      ['22:43:02','Operação','Alta','Ignição e movimentação detectadas às 22:43; nenhum RFID válido; horário não autorizado. Uso irregular.'],
      ['22:44:05','Geofence','Crítica',`${a.type==='Trator'?'Trator':'Ativo'} ultrapassou a geofence autorizada de ${s.settings.farm}. Alerta crítico.`],
      ['22:45:17','Conectividade','Média','Sinal celular perdido. Comunicação de contingência ativa por LoRaWAN no gateway local.'],
      ['22:46:04','Violação','Crítica','Tentativa de remoção do rastreador e corte de alimentação. Bateria interna ativa.']
    ];
    const [time,category,priority,text]=steps[sc.step-1];s.clock=time;a.updated=time;a.status='Alerta';a.risk='Irregular';a.ignition=true;a.speed=14;
    if(sc.step===1){a.x=56;a.y=32;a.area='norte';a.route.push([30,38],[56,32]);}
    if(sc.step===2){a.x=94;a.y=23;a.area='fora';a.route.push([94,23]);}
    if(sc.step===3)a.connection='LoRaWAN';
    if(sc.step===4){a.power='Bateria interna';a.battery=64;}
    const ev=log(s,time,a.id,null,category,priority,text);sc.events.push({time,text});
    const al=addAlert(s,a.id,['Movimentação inesperada','Saída de geofence','Perda de sinal celular','Violação do equipamento'][sc.step-1],priority,text,time);
    if(sc.step===1){const oc=occurrence(s,a,'Movimentação sem RFID, fora do horário, saída de área e violação.',sc.events,'Alta');sc.occurrence=oc.id;}
    const oc=s.occurrences.find(o=>o.id===sc.occurrence);oc.events=clone(sc.events);oc.area=s.areas.find(z=>z.id===a.area)?.name||'Fora da propriedade';oc.priority=sc.step>=2?'Crítica':'Alta';al.occurrence=oc.id;
    if(sc.step===4)sc.done=true;return {time,text,step:sc.step,occurrence:oc.id};
  }
  function decide(s,id,approved,justification,role) {
    if(role!=='Gestor')throw Error('Somente gestores podem decidir uma liberação.');
    if(!justification?.trim())throw Error('Informe uma justificativa.');
    const r=s.requests.find(r=>r.id===id);if(!r||r.status!=='Pendente')throw Error('Solicitação já decidida ou não encontrada.');
    const a=asset(s,r.asset),o=operator(s,r.operator);
    if(approved&&(!o||o.status!=='Ativo'||!o.assets.includes(a.id)||!a.allowedAreas.includes(a.area)))throw Error('Liberação de horário exige operador ativo, vínculo autorizado e área permitida.');
    r.status=approved?'Autorizada':'Negada';r.justification=justification.trim();r.manager=s.settings.manager;r.decided=s.clock;r.validUntil=approved?s.date+' 23:59:59':null;
    // A liberação excepcional nunca elimina uma violação ou saída de área em andamento.
    const hazard=s.alerts.some(al=>al.asset===a.id&&al.status!=='Resolvido'&&['Crítica'].includes(al.priority));
    if(approved&&!hazard&&a.connection!=='Offline')Object.assign(a,{status:'Operando',risk:'Normal',ignition:true,speed:8,operator:r.operator});
    if(!approved){a.status='Parado';a.speed=0;a.ignition=false;}
    s.alerts.filter(al=>al.asset===a.id&&al.title==='Movimentação fora do horário'&&al.status!=='Resolvido').forEach(al=>{al.status='Resolvido';al.resolution=justification.trim();});
    log(s,s.clock,a.id,r.operator,'Autorização',approved?'Baixa':'Alta',`${s.settings.manager} ${approved?'autorizou':'negou'} a exceção ${r.id}. Justificativa: ${r.justification}`);return r;
  }
  function closeOccurrence(s,id,reason,role) {
    if(role!=='Gestor')throw Error('Somente gestores podem encerrar ocorrências.');
    if(!reason?.trim())throw Error('Registre a análise do gestor.');
    const oc=s.occurrences.find(o=>o.id===id);if(!oc||oc.status==='Encerrada')throw Error('Ocorrência já encerrada ou não encontrada.');
    oc.status='Encerrada';oc.resolution=reason.trim();oc.closedBy=s.settings.manager;oc.closedAt=s.date+' '+s.clock;
    oc.events.push({time:s.clock,text:`${s.settings.manager} encerrou a ocorrência: ${oc.resolution}`});
    s.alerts.filter(a=>a.occurrence===id).forEach(a=>{a.status='Resolvido';a.resolution=oc.resolution;});
    log(s,s.clock,oc.asset,oc.operator,'Ocorrência','Baixa',`${id} encerrada por ${s.settings.manager}. ${oc.resolution}`);return oc;
  }
  return {DATE,seed,clone,asset,operator,log,authorize,readRfid,simulate,startScenario,advanceScenario,decide,closeOccurrence};
});
