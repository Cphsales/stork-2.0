import {q,rpc,rows,value,call,equal,snapshot,reject,actors,group,location,fixture} from './bid1.test.mjs';
const master = ['core_identity.lokationer','core_identity.stande','core_identity.lokation_status_skift','core_identity.pris_historik','core_identity.lokation_gruppe_historik'];
const createArgs = g=>({p_navn:'L',p_type:'butik',p_dagspris:123.45,p_gruppe_id:g,p_foerste_stand_navn:'S1',p_change_reason:'inputprobe'});
export function dmlActor(actor,table) {
  return {...actor,settings:{...actor.settings,[`stork.allow_${table}_write`]:'true','stork.change_reason':'direkte DML probe','stork.source_type':'manual'}};
}
export async function blockedDml(lib,actor,table,sql,nids) {
  // psql exits with this transaction open: PostgreSQL rolls back even if a mutant allows it.
  // No trailing ROLLBACK may overwrite the statement's SQLSTATE in pg-runner's frame.
  await reject(lib,dmlActor(actor,table),`begin; ${sql};`,nids,[`core_identity.${table}`]);
}
export const tests = [
 {id:'b2.lokation-opret',covers:['K-1/ac-1:MH','K-1/ac-1|k-1.ac-1.mh.lokation-raekke-og-foerste-stand-genlaest','K-1/ac-1|k-1.ac-1.mh.init-status-event-aktiv','K-1/ac-1|k-1.ac-1.mh.pris-og-gruppe-historik-raekker','K-2/ac-6|k-2.ac-6.fs.min-1-aktiv-stand-efter-commit-pr-oprettet-lokation'],run:async lib=>{
   const a=await actors(lib),g=await group(lib,a.r),l=await location(lib,a.r,g,{p_adresse:'Testgade 1'});
   lib.forvent.lig(await rows(lib,a.r,`select id,navn,adresse,type,dagspris,gruppe_id,hviledage,status,bookbar,anonymized_at from core_identity.lokation_hent(p_lokation_id := ${q(l)})`),{kind:'rows',value:[{id:l,navn:'L',adresse:'Testgade 1',type:'butik',dagspris:123.45,gruppe_id:g,hviledage:null,status:'aktiv',bookbar:true,anonymized_at:null}]});
   const stands=await rows(lib,a.r,`select id,lokation_id,navn,dagspris,is_active from core_identity.stande_liste(p_lokation_id := ${q(l)})`);
   lib.forvent.sandt(stands.length===1 && typeof stands[0].id==='string','Exactly one first stand with identity');
   lib.forvent.lig(stands.map(({id,...x})=>x),{kind:'rows',value:[{lokation_id:l,navn:'S1',dagspris:null,is_active:true}]});
   lib.forvent.lig(await rows(lib,null,`select status,dvale_ophoer from core_identity.lokation_status_skift where lokation_id=${q(l)}`),{kind:'rows',value:[{status:'aktiv',dvale_ophoer:null}]});
   lib.forvent.lig(await rows(lib,null,`select ny_dagspris from core_identity.pris_historik where lokation_id=${q(l)}`),{kind:'rows',value:[{ny_dagspris:123.45}]});
   lib.forvent.lig(await rows(lib,null,`select gruppe_id from core_identity.lokation_gruppe_historik where lokation_id=${q(l)}`),{kind:'rows',value:[{gruppe_id:g}]});
   await equal(lib,null,`select count(*)::integer from core_identity.stande where lokation_id=${q(l)} and is_active`,1);
 }},
 {id:'b2.lokation-navn',covers:['K-1/ac-1:UT','K-1/ac-1/neg-1','K-1/ac-1/neg-2','K-1/ac-1/neg-3'],run:async lib=>{
   const a=await actors(lib),g=await group(lib,a.r);
   for(const actor of [a.r,a.sa]) { await location(lib,actor,g);
     for(const name of actor===a.r?[null,'','   ']:['','   ']) await reject(lib,actor,rpc('lokation_opret',{...createArgs(g),p_navn:name}),actor===a.sa?'K-1/ac-1/neg-3':name===null?'K-1/ac-1/neg-1':'K-1/ac-1/neg-2',master);
   }
 }},
 {id:'b2.lokation-typer',covers:['K-1/ac-2:MH','K-1/ac-2:UT','K-1/ac-2/neg-1','K-1/ac-2/neg-2','K-1/ac-2|k-1.ac-2.mh.fem-typer-accepteres-og-genlaeses-ordret'],run:async lib=>{
   const a=await actors(lib),g=await group(lib,a.r);
   const types=['butik','messe','marked','event','andet'];
   for(const type of types) {
     const l=await location(lib,a.r,g,{p_type:type});
     await equal(lib,a.r,`select type from core_identity.lokation_hent(p_lokation_id := ${q(l)})`,type);
     for(const next of types) { await call(lib,a.r,'lokation_rediger',{p_lokation_id:l,p_navn:'L',p_type:next,p_dagspris:123.45,p_change_reason:'ret type'}); await equal(lib,a.r,`select type from core_identity.lokation_hent(p_lokation_id := ${q(l)})`,next); }
   }
   for(const type of ['ukendt',null]) await reject(lib,a.r,rpc('lokation_opret',{...createArgs(g),p_type:type}),type===null?'K-1/ac-2/neg-2':'K-1/ac-2/neg-1',master);
 }},
 {id:'b2.gruppe-reference',covers:['K-3/ac-1:UT','K-3/ac-2:UT','K-3/ac-1/neg-1','K-3/ac-1/neg-2','K-3/ac-2/neg-2'],run:async lib=>{
   const a=await actors(lib),g=await group(lib,a.r),l=await location(lib,a.r,g);
   await equal(lib,a.r,`select gruppe_id from core_identity.lokation_hent(p_lokation_id := ${q(l)})`,g);
   await reject(lib,a.r,rpc('lokation_opret',{...createArgs(g),p_gruppe_id:null}),'K-3/ac-1/neg-1',master);
   const missing=await value(lib,null,'select gen_random_uuid()');
   await reject(lib,a.r,rpc('lokation_opret',{...createArgs(g),p_gruppe_id:missing}),['K-3/ac-1/neg-2','K-3/ac-2/neg-2'],master);
   const cast=await lib.som(a.r).sql(rpc('lokation_opret',{...createArgs(g),p_gruppe_id:'Coop'}));
   lib.forvent.sandt(cast.ok===false&&cast.code==='22P02','Typed UUID boundary rejects free text (S)');
 }},
 {id:'b2.stand-reference',covers:['K-2/ac-1:UT','K-2/S:UT','K-2/ac-1/neg-1','K-2/ac-1/neg-2','K-2/ac-1/neg-3','K-2/ac-6/neg-3','K-2/S/neg-1'],run:async lib=>{
   const f=await fixture(lib);
   await call(lib,f.r,'stand_opret',{p_lokation_id:f.l,p_navn:'lovlig stand',p_change_reason:'stand søster'});
   await reject(lib,f.r,rpc('stand_opret',{p_lokation_id:f.s,p_navn:'barn',p_change_reason:'bladprobe'}),['K-2/ac-1/neg-1','K-2/ac-6/neg-3','K-2/S/neg-1'],master);
   await reject(lib,f.r,rpc('stand_opret',{p_lokation_id:null,p_navn:'barn',p_change_reason:'nullprobe'}),'K-2/ac-1/neg-2',master);
   await reject(lib,f.r,rpc('stand_opret',{p_lokation_id:await value(lib,null,'select gen_random_uuid()'),p_navn:'barn',p_change_reason:'ukendtprobe'}),'K-2/ac-1/neg-3',master);
   await equal(lib,null,`select count(*)::integer from pg_constraint where contype='f' and ((conrelid='core_identity.lokationer'::regclass and confrelid='core_identity.lokationer'::regclass) or (conrelid='core_identity.stande'::regclass and confrelid='core_identity.stande'::regclass))`,0);
 }},
 {id:'b2.stand-pris',covers:['K-2/ac-2:UT','K-2/ac-2/neg-1','K-2/ac-2|k-2.ac-2.fs.egen-pris-vinder-over-lokationens','K-2/ac-2|k-2.ac-2.fs.stand-rediger-null-reset-til-arv','K-2/ac-2|k-2.ac-2.fs.nul-er-en-pris-ikke-null'],run:async lib=>{
   // The two-day inheritance proof is deliberately absent: HALT-FA3 K-2/ac-2.
   const f=await fixture(lib);
   for(const price of [37.25,null,0]) {
     await call(lib,f.r,'stand_rediger',{p_stand_id:f.s,p_navn:'S1',p_dagspris:price,p_change_reason:'ret standpris'});
     await equal(lib,f.r,rpc('stand_dagspris_paa',{p_stand_id:f.s}),price===null?123.45:price);
   }
   for(const price of [-1,0.001,10000000000]) await reject(lib,f.r,rpc('stand_rediger',{p_stand_id:f.s,p_navn:'S1',p_dagspris:price,p_change_reason:'prisprobe'}),'K-2/ac-2/neg-1',['core_identity.stande','core_identity.pris_historik']);
 }},
 {id:'b2.stand-identitet',covers:['K-2/ac-4:FS','K-2/ac-4|k-2.ac-4.fs.stand-id-stabil-identitet-med-lokation-id-reference'],run:async lib=>{
   const f=await fixture(lib); const s=await call(lib,f.r,'stand_opret',{p_lokation_id:f.l,p_navn:'S2',p_change_reason:'opret S2',p_dagspris:19});
   await call(lib,f.r,'stand_rediger',{p_stand_id:s,p_navn:'nyt navn',p_dagspris:22,p_change_reason:'ret S2'});
   lib.forvent.lig(await rows(lib,f.r,`select id,lokation_id,navn,dagspris from core_identity.stande_liste(p_lokation_id := ${q(f.l)}) where id=${q(s)}`),{kind:'rows',value:[{id:s,lokation_id:f.l,navn:'nyt navn',dagspris:22}]});
   lib.forvent.sandt(s!==f.s,'Separate stands retain distinct identities');
 }},
 {id:'b2.sidste-stand',covers:['K-2/ac-6:UT','K-2/ac-6/neg-1','K-2/ac-6/neg-2'],run:async lib=>{
   const f=await fixture(lib);
   for(const first of [null,'','   ']) await reject(lib,f.r,rpc('lokation_opret',{...createArgs(f.g),p_foerste_stand_navn:first}),'K-2/ac-6/neg-1',master);
   for(const actor of [f.r,f.sa]) {
     const l=await location(lib,actor,f.g); const s1=await value(lib,null,`select id from core_identity.stande where lokation_id=${q(l)}`);
     const s2=await call(lib,actor,'stand_opret',{p_lokation_id:l,p_navn:'S2',p_change_reason:'stand søster'});
     await call(lib,actor,'stand_saet_aktiv',{p_stand_id:s2,p_is_active:false,p_change_reason:'lovlig deaktivering'});
     await reject(lib,actor,rpc('stand_saet_aktiv',{p_stand_id:s1,p_is_active:false,p_change_reason:'sidste stand'}),'K-2/ac-6/neg-2',['core_identity.stande']);
     await equal(lib,null,`select count(*)::integer from core_identity.stande where lokation_id=${q(l)} and is_active`,1);
   }
 }},
 {id:'b2.ejerkaede',covers:['K-2/ac-6:FS','K-2/ac-6|k-2.ac-6.fs.ejerkaede-fk-not-null-stande-lokationer-grupper'],run:async lib=>{
   const f=await fixture(lib);
   for(const [table,col,parent] of [['stande','lokation_id','lokationer'],['lokationer','gruppe_id','grupper']]) {
     await equal(lib,null,`select a.attnotnull and exists(select 1 from pg_constraint c where c.conrelid=a.attrelid and c.contype='f' and c.confrelid=${q('core_identity.'+parent)}::regclass and c.conkey=array[a.attnum]::smallint[] and c.confdeltype='r') from pg_attribute a where a.attrelid=${q('core_identity.'+table)}::regclass and a.attname=${q(col)}`,true);
   }
   await equal(lib,null,`select count(*)::integer from core_identity.stande s join core_identity.lokationer l on l.id=s.lokation_id join core_identity.grupper g on g.id=l.gruppe_id where s.id=${q(f.s)} and g.id=${q(f.g)}`,1);
 }},
 {id:'b2.dml-lokation',covers:['K-1/S/neg-1'],run:async lib=>{
   const f=await fixture(lib);
   await blockedDml(lib,f.r,'lokationer',`insert into core_identity.lokationer(navn,type,dagspris,gruppe_id) values ('omvej','butik',1,${q(f.g)})`,'K-1/S/neg-1');
 }},
 {id:'b2.dml-stand',covers:['K-2/ac-1/neg-5'],run:async lib=>{
   const f=await fixture(lib);
   await blockedDml(lib,f.r,'stande',`insert into core_identity.stande(lokation_id,navn) values (${q(f.l)},'omvej')`,'K-2/ac-1/neg-5');
 }},
 {id:'b2.pris-immutabel',covers:['K-1/ac-3:UT','K-1/ac-3/neg-1','K-1/ac-3/neg-2'],run:async lib=>{
   const f=await fixture(lib);
   for(const op of ['UPDATE','DELETE','TRUNCATE']) {
     const sql=op==='UPDATE'?`update core_identity.pris_historik set ny_dagspris=99 where lokation_id=${q(f.l)}`:op==='DELETE'?`delete from core_identity.pris_historik where lokation_id=${q(f.l)}`:'truncate core_identity.pris_historik';
     await blockedDml(lib,f.r,'pris_historik',sql,'K-1/ac-3/neg-1');
     if(op==='UPDATE') await reject(lib,null,`begin; ${sql};`,'K-1/ac-3/neg-2',['core_identity.pris_historik']);
     else {
       // Only the plan's closed <op> substitution is used for the two expanded S instances.
       const rc={...lib.kontrakt('K-1/ac-3/neg-2'),grund:lib.kontrakt('K-1/ac-3/neg-2').grund.replace('operation UPDATE',`operation ${op}`)};
       const before=await snapshot(lib,['core_identity.pris_historik']);
       lib.forvent.afvist(await lib.ejer.sql(`begin; ${sql};`),rc);
       lib.forvent.lig([{value:await snapshot(lib,['core_identity.pris_historik'])}],{kind:'scalar',value:before});
     }
   }
 }}
];
