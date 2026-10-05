const assert=require('node:assert/strict'),test=require('node:test');
const M=require('../src/model.js');
test('dados iniciais coerentes: 12 ativos, 8 operadores, 5 áreas e histórico preenchido',()=>{
 const s=M.seed();assert.equal(s.assets.length,12);assert.equal(s.operators.length,8);assert.equal(s.areas.length,5);assert.ok(s.audit.length>=12);assert.ok(s.occurrences.some(o=>o.priority==='Crítica'));assert.equal(s.assets.filter(a=>a.status==='Operando').length,7);
 for(const o of s.operators)for(const id of o.assets)assert.ok(s.assets.some(a=>a.id===id));
});
test('RFID valida vínculo, suspensão, área e horário',()=>{
 const s=M.seed(),a=M.asset(s,'TR-001'),o=M.operator(s,'OP-001');
 assert.equal(M.authorize(s,a,o,'14:32:00').type,'normal');
 assert.equal(M.authorize(s,a,o,'22:43:00').type,'exception');
 assert.equal(M.authorize(s,a,null,'14:32:00').type,'irregular');
 assert.equal(M.authorize(s,a,M.operator(s,'OP-002'),'14:32:00').type,'irregular');
 o.status='Suspenso';assert.equal(M.authorize(s,a,o,'14:32:00').type,'irregular');o.status='Ativo';a.area='fora';assert.equal(M.authorize(s,a,o,'14:32:00').type,'irregular');
});
test('horário noturno cruzando meia-noite é verificado',()=>{
 const s=M.seed(),a=M.asset(s,'TR-001'),o=M.operator(s,'OP-001');a.start=o.start='20:00';a.end=o.end='05:00';
 assert.equal(M.authorize(s,a,o,'23:00:00').type,'normal');assert.equal(M.authorize(s,a,o,'03:00:00').type,'normal');assert.equal(M.authorize(s,a,o,'14:00:00').type,'exception');
});
test('cenário completo correlaciona quatro alertas, mapa, contingência e um dossiê',()=>{
 const s=M.seed();M.startScenario(s,'TR-001');const original=s.occurrences.length;for(let i=0;i<4;i++)M.advanceScenario(s);
 const sc=s.scenario,a=M.asset(s,'TR-001'),oc=s.occurrences.find(o=>o.id===sc.occurrence);
 assert.equal(sc.done,true);assert.equal(s.clock,'22:46:04');assert.equal(a.area,'fora');assert.equal(a.x,94);assert.equal(a.connection,'LoRaWAN');assert.equal(a.power,'Bateria interna');assert.equal(a.risk,'Irregular');assert.equal(s.occurrences.length,original+1);assert.equal(oc.events.length,4);assert.equal(oc.priority,'Crítica');assert.equal(s.alerts.filter(al=>al.occurrence===oc.id).length,4);
 assert.equal(M.advanceScenario(s),null);
});
test('aprovação excepcional registra decisão e permite leitura; expira e não ignora suspensão ou geofence',()=>{
 const s=M.seed();M.simulate(s,'afterhours','TR-001');const req=s.requests.find(r=>r.status==='Pendente');
 assert.throws(()=>M.decide(s,req.id,true,'','Gestor'));assert.throws(()=>M.decide(s,req.id,true,'Teste','Operador'));
 M.decide(s,req.id,true,'Trabalho supervisionado','Gestor');assert.equal(req.manager,'Ana Souza');assert.equal(req.status,'Autorizada');assert.equal(M.asset(s,'TR-001').status,'Operando');assert.equal(M.authorize(s,M.asset(s,'TR-001'),M.operator(s,'OP-001'),'22:40:00').type,'normal');
 assert.throws(()=>M.decide(s,req.id,false,'Duplicada','Gestor'));
 M.operator(s,'OP-001').status='Suspenso';assert.equal(M.authorize(s,M.asset(s,'TR-001'),M.operator(s,'OP-001'),'22:40:00').type,'irregular');M.operator(s,'OP-001').status='Ativo';M.asset(s,'TR-001').area='fora';assert.equal(M.authorize(s,M.asset(s,'TR-001'),M.operator(s,'OP-001'),'22:40:00').type,'irregular');M.asset(s,'TR-001').area='sede';s.date='2026-10-01';assert.equal(M.authorize(s,M.asset(s,'TR-001'),M.operator(s,'OP-001'),'22:40:00').type,'exception');
});
test('negação mantém máquina parada e decisão auditada',()=>{
 const s=M.seed();M.simulate(s,'afterhours','TR-001');const r=s.requests.find(r=>r.status==='Pendente');M.decide(s,r.id,false,'Operação sem supervisão','Gestor');assert.equal(r.status,'Negada');assert.equal(M.asset(s,'TR-001').ignition,false);assert.ok(s.audit[0].text.includes('negou'));
});
test('a decisão de liberação não dispensa crachá ativo nem geofence',()=>{
 const s=M.seed();M.simulate(s,'afterhours','TR-001');const r=s.requests.find(r=>r.status==='Pendente');
 M.asset(s,'TR-001').area='fora';assert.throws(()=>M.decide(s,r.id,true,'Exceção','Gestor'));assert.equal(r.status,'Pendente');
 M.asset(s,'TR-001').area='sede';M.operator(s,'OP-001').status='Suspenso';assert.throws(()=>M.decide(s,r.id,true,'Exceção','Gestor'));assert.equal(r.status,'Pendente');
});
test('cenários rápidos geram os estados e os registros corretos',()=>{
 for(const kind of ['normal','unauthorized','geofence','afterhours','cellular','tamper','offline','battery']){const s=M.seed(),length=s.audit.length;M.simulate(s,kind,'TR-001');assert.ok(s.audit.length>length);if(kind==='normal')assert.equal(M.asset(s,'TR-001').status,'Operando');if(kind==='offline')assert.equal(M.asset(s,'TR-001').connection,'Offline');if(kind==='cellular')assert.equal(M.asset(s,'TR-001').connection,'LoRaWAN');if(kind==='battery')assert.equal(M.asset(s,'TR-001').battery,8);}
});
test('encerramento exige gestor e análise, resolve alertas correlacionados e preserva sequência',()=>{
 const s=M.seed();M.startScenario(s,'TR-001');for(let i=0;i<4;i++)M.advanceScenario(s);const id=s.scenario.occurrence;
 assert.throws(()=>M.closeOccurrence(s,id,'','Gestor'));assert.throws(()=>M.closeOccurrence(s,id,'Verificado','Operador'));const o=M.closeOccurrence(s,id,'Verificação local simulada.','Gestor');assert.equal(o.status,'Encerrada');assert.equal(o.events.length,5);assert.ok(s.alerts.filter(a=>a.occurrence===id).every(a=>a.status==='Resolvido'));assert.throws(()=>M.closeOccurrence(s,id,'Repetição','Gestor'));
});
test('dados podem ser serializados e continuar o cenário após recarregamento',()=>{
 let s=M.seed();M.startScenario(s,'TR-001');M.advanceScenario(s);s=JSON.parse(JSON.stringify(s));for(let i=0;i<3;i++)M.advanceScenario(s);assert.equal(s.scenario.done,true);assert.equal(s.occurrences.find(o=>o.id===s.scenario.occurrence).events.length,4);
});
