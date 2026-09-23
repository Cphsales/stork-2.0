import {q,rpc,rows,value,call,equal,snapshot,reject,fixture,audit,location} from './bid1.test.mjs';
import {blockedDml} from './bid2.test.mjs';
const statusTables=['core_identity.lokation_status_skift','core_identity.lokationer'];
export const statusArgs=(l,s,reason='statusskift')=>({p_lokation_id:l,p_status:s,p_change_reason:reason});
export async function status(lib,actor,l,s,reason='statusskift',end=null) {
 await call(lib,actor,'lokation_saet_status',{...statusArgs(l,s,reason),p_dvale_ophoer:end});
 await equal(lib,actor,rpc('lokation_status_paa',{p_lokation_id:l}),s);
 const event=await value(lib,null,`select id from core_identity.lokation_status_skift where lokation_id=${q(l)} order by seq desc limit 1`);
 await audit(lib,'lokation_status_skift',event,reason,actor,'INSERT');
 return event;
}
export const tests=[
 {id:'b3.status-overgange',covers:['K-4/ac-1:MH','K-4/ac-1:UT','K-4/ac-1/neg-1','K-4/ac-1/neg-2','K-4/ac-1/neg-3','K-4/ac-1|k-4.ac-1.mh.hver-af-aktiv-dvale-nedlagt-kan-saettes-genlaes-status-paa','K-4/ac-1|k-4.ac-1.mh.alle-overgange-mellem-forskellige-statusser-tilladt','K-4/ac-2:FS','K-4/ac-2|k-4.ac-2.fs.praecis-en-audit-raekke-pr-skift-change-reason-brugertekst','K-4/ac-2|k-4.ac-2.fs.audit-actor-user-id-lig-r-plus-auth-uid','K-4/ac-2|k-4.ac-2.fs.audit-source-type-manual'],run:async lib=>{
   const f=await fixture(lib);
   // Eulerian walk exercises each of the six directed transitions exactly once.
   for(const s of ['dvale','nedlagt','aktiv','nedlagt','dvale','aktiv']) await status(lib,f.r,f.l,s,`overgang til ${s}`);
   for(const s of ['ukendt',null,'aktiv']) await reject(lib,f.r,rpc('lokation_saet_status',statusArgs(f.l,s)),s===null?'K-4/ac-1/neg-2':s==='aktiv'?'K-4/ac-1/neg-3':'K-4/ac-1/neg-1',statusTables);
 }},
 {id:'b3.status-aarsag',covers:['K-4/ac-2:UT','K-4/ac-2/neg-1','K-4/ac-2/neg-2'],run:async lib=>{
   const f=await fixture(lib);await status(lib,f.r,f.l,'dvale');
   for(const reason of [null,'','   ']) await reject(lib,f.r,rpc('lokation_saet_status',statusArgs(f.l,'aktiv',reason)),'K-4/ac-2/neg-1',statusTables);
   await reject(lib,null,`begin; insert into core_identity.lokation_status_skift(lokation_id,status) values (${q(f.l)},'aktiv')`,'K-4/ac-2/neg-2',statusTables);
 }},
 {id:'b3.status-dedikeret',covers:['K-4/ac-3:UT','K-4/ac-3:FS','K-4/ac-3/neg-1','K-5/ac-1:UT','K-5/ac-1/neg-4','K-4/ac-3|k-4.ac-3.fs.omdoeb-dvale-lokation-via-lokation-rediger-status-uaendret'],run:async lib=>{
   const f=await fixture(lib);await status(lib,f.r,f.l,'dvale');
   const before=await snapshot(lib,['core_identity.lokation_status_skift']);
   await call(lib,f.r,'lokation_rediger',{p_lokation_id:f.l,p_navn:'nyt navn',p_type:'butik',p_dagspris:123.45,p_change_reason:'omdoeb under dvale'});
   await equal(lib,f.r,rpc('lokation_status_paa',{p_lokation_id:f.l}),'dvale');
   lib.forvent.lig([{value:await snapshot(lib,['core_identity.lokation_status_skift'])}],{kind:'scalar',value:before});
   await blockedDml(lib,f.r,'lokation_status_skift',`insert into core_identity.lokation_status_skift(lokation_id,status) values (${q(f.l)},'aktiv')`,['K-4/ac-3/neg-1','K-5/ac-1/neg-4']);
 }},
 {id:'b3.status-historik',covers:['K-4/ac-4:UT','K-4/ac-4/neg-1','K-4/ac-4/neg-2','K-4/ac-4|k-4.ac-4.fs.status-historik-alle-events-seq-orden-sat-dato-uaendret'],run:async lib=>{
   // Cross-day C10 assertion remains HALT-FA3; these are genuine same-day events.
   const f=await fixture(lib);await status(lib,f.r,f.l,'dvale');await status(lib,f.r,f.l,'aktiv');
   const expected=await rows(lib,null,`select seq,status,dvale_ophoer,sat_kl,sat_dato from core_identity.lokation_status_skift where lokation_id=${q(f.l)} order by seq`);
   const actual=await rows(lib,f.r,`select * from core_identity.lokation_status_historik(p_lokation_id := ${q(f.l)})`);
   lib.forvent.lig([{value:actual}],{kind:'scalar',value:expected},'Every event in exact seq order');
   lib.forvent.sandt(actual.length===3,'Init plus two explicit events');
   for(const op of ['UPDATE','DELETE','TRUNCATE']) {
     const sql=op==='UPDATE'?`update core_identity.lokation_status_skift set status='nedlagt' where lokation_id=${q(f.l)}`:op==='DELETE'?`delete from core_identity.lokation_status_skift where lokation_id=${q(f.l)}`:'truncate core_identity.lokation_status_skift';
     await blockedDml(lib,f.r,'lokation_status_skift',sql,'K-4/ac-4/neg-1');
     const rc=lib.kontrakt('K-4/ac-4/neg-2');
     if(op==='UPDATE') await reject(lib,null,`begin; ${sql};`,'K-4/ac-4/neg-2',statusTables);
     else lib.forvent.afvist(await lib.ejer.sql(`begin; ${sql};`),{...rc,grund:rc.grund.replace('operation UPDATE',`operation ${op}`)});
   }
   lib.forvent.lig([{value:await rows(lib,f.r,`select * from core_identity.lokation_status_historik(p_lokation_id := ${q(f.l)})`)}],{kind:'scalar',value:expected});
 }},
 {id:'b3.stande-bevares',covers:['K-2/ac-5:FS','K-2/ac-5:UT','K-2/ac-5/neg-1','K-2/ac-5|k-2.ac-5.fs.stand-maengde-id-antal-is-active-egne-priser-uaendret','K-2/ac-5|k-2.ac-5.fs.prishistorik-uaendret-foer-under-efter-nedlaeg-genaabn','K-4/ac-7:MH','K-4/ac-7:FS','K-4/ac-7|k-4.ac-7.mh.genaabning-fra-nedlagt-via-lokation-saet-status-aktiv','K-4/ac-7|k-4.ac-7.fs.bookbar-true-audit-med-aarsag','K-4/ac-7|k-4.ac-7.fs.samme-lokation-og-stand-id-ingen-manuel-genindsaettelse'],run:async lib=>{
   const f=await fixture(lib);const s2=await call(lib,f.r,'stand_opret',{p_lokation_id:f.l,p_navn:'S2',p_dagspris:0,p_change_reason:'stand 2'});
   await call(lib,f.r,'stand_saet_aktiv',{p_stand_id:s2,p_is_active:false,p_change_reason:'tag S2 ud'});
   const before=await snapshot(lib,['core_identity.stande','core_identity.pris_historik']);
   for(const s of ['nedlagt','aktiv']) {
     await status(lib,f.r,f.l,s,'bevar stande '+s);
     await equal(lib,f.r,rpc('lokation_er_bookbar',{p_lokation_id:f.l}),s==='aktiv');
     lib.forvent.lig([{value:await snapshot(lib,['core_identity.stande','core_identity.pris_historik'])}],{kind:'scalar',value:before});
     await equal(lib,f.r,`select id from core_identity.lokation_hent(p_lokation_id := ${q(f.l)})`,f.l);
   }
   await blockedDml(lib,f.r,'stande',`delete from core_identity.stande where id=${q(f.s)}`,'K-2/ac-5/neg-1');
   await equal(lib,null,`select exists(select 1 from pg_constraint c join pg_attribute a on a.attrelid=c.conrelid and a.attnum=any(c.conkey) where c.conrelid='core_identity.pris_historik'::regclass and c.confrelid='core_identity.stande'::regclass and a.attname='stand_id' and c.confdeltype='r')`,true);
 }},
 {id:'b3.bookbar',covers:['K-2/ac-3:FS','K-2/ac-3|k-2.ac-3.fs.stand-er-bookbar-false-alle-stande-dvale-nedlagt','K-2/ac-3|k-2.ac-3.fs.stand-er-bookbar-true-under-aktiv','K-2/ac-3|k-2.ac-3.fs.false-for-deaktiveret-stand-under-aktiv-lokation','K-5/ac-1:FS','K-5/ac-1|k-5.ac-1.fs.bookbar-false-alle-datoer-i-perioden-for-c1-og-c2','K-5/ac-1|k-5.ac-1.fs.l2-aktiv-true','K-5/ac-1|k-5.ac-1.fs.som-sa-samme-false-ingen-admin-gren','K-4/ac-5|k-4.ac-5.fs.samme-dags-start-stop-seneste-seq-gaelder','K-4/ac-5|k-4.ac-5.fs.datoer-foer-oprettelse-null-false'],run:async lib=>{
   const f=await fixture(lib);const s2=await call(lib,f.r,'stand_opret',{p_lokation_id:f.l,p_navn:'S2',p_change_reason:'stand 2'});
   for(const s of ['dvale','nedlagt','aktiv']) {
     await status(lib,f.r,f.l,s);
     for(const actor of [f.r,f.sa]) for(const stand of [f.s,s2]) await equal(lib,actor,rpc('stand_er_bookbar',{p_stand_id:stand}),s==='aktiv');
   }
   await call(lib,f.r,'stand_saet_aktiv',{p_stand_id:s2,p_is_active:false,p_change_reason:'deaktiver S2'});
   await equal(lib,f.r,rpc('stand_er_bookbar',{p_stand_id:s2}),false);
   const d=await value(lib,null,"select (clock_timestamp() at time zone 'UTC')::date::text");
   const end=await value(lib,null,`select (${q(d)}::date+3)::text`);
   await status(lib,f.r,f.l,'dvale','dateret dvale',end);
   for(const actor of [f.r,f.sa]) for(let offset=0;offset<3;offset++) {
     await equal(lib,actor,`select core_identity.lokation_er_bookbar(p_lokation_id := ${q(f.l)}, p_dato := ${q(d)}::date+${offset})`,false);
     await equal(lib,actor,`select core_identity.lokation_er_bookbar(p_lokation_id := ${q(f.l2)}, p_dato := ${q(d)}::date+${offset})`,true);
   }
   // There is no client input or override in this contract: both clients use the same dated oracle.
   lib.forvent.lig(await rows(lib,null,"select proargnames from pg_proc where oid='core_identity.lokation_er_bookbar(uuid,date)'::regprocedure"),{kind:'rows',value:[{proargnames:['p_lokation_id','p_dato']}]});
   const yesterday=await value(lib,null,`select (${q(d)}::date-1)::text`);
   await equal(lib,f.r,rpc('lokation_status_paa',{p_lokation_id:f.l,p_dato:yesterday}),null);
   await equal(lib,f.r,rpc('lokation_er_bookbar',{p_lokation_id:f.l,p_dato:yesterday}),false);
 }},
 {id:'b3.stop-rettighed',covers:['K-5/ac-2:UT','K-5/S:UT','K-5/ac-2/neg-1','K-5/ac-2/neg-2','K-5/S/neg-1','K-8/ac-4/neg-1','K-8/S:UT','K-8/S/neg-1','K-5/ac-2:MH','K-5/ac-2|k-5.ac-2.mh.stop-foer-tid-udfoert-af-r-plus','K-5/ac-2|k-5.ac-2.fs.bookbar-l1-dags-dato-flipper-straks-til-true','K-5/ac-2|k-5.ac-2.fs.audit-raekke-med-aarsag'],run:async lib=>{
   // Earlier-date preservation is NOT covered by this same-day stop (HALT-FA3).
   const f=await fixture(lib); const end=await value(lib,null,"select ((clock_timestamp() at time zone 'UTC')::date+5)::text");
   await status(lib,f.r,f.l,'dvale','start hvile',end);
   // Establish the same input as a valid public operation on a sister location first.
   await status(lib,f.r,f.l2,'dvale','søster start',end);await status(lib,f.r,f.l2,'aktiv','søster stop');
   await reject(lib,f.minus,rpc('lokation_saet_status',statusArgs(f.l,'aktiv','stop')) ,['K-5/ac-2/neg-1','K-5/S/neg-1'],statusTables);
   await reject(lib,f.view,rpc('lokation_saet_status',statusArgs(f.l,'aktiv','stop')),['K-8/ac-4/neg-1','K-8/S/neg-1'],statusTables);
   for(const reason of [null,'','   ']) await reject(lib,f.r,rpc('lokation_saet_status',statusArgs(f.l,'aktiv',reason)),'K-5/ac-2/neg-2',statusTables);
   await status(lib,f.r,f.l,'aktiv','stop med ret');await equal(lib,f.r,rpc('lokation_er_bookbar',{p_lokation_id:f.l}),true);
 }},
 {id:'b3.hviledage',covers:['K-5/ac-3:UT','K-5/ac-3:MH','K-5/ac-3:FS','K-5/ac-3/neg-1','K-5/ac-3/neg-2','K-5/ac-3/neg-3','K-5/ac-3|k-5.ac-3.mh.hviledage-aendret-af-r-plus-uden-godkendelsestrin','K-5/ac-3|k-5.ac-3.fs.ny-vaerdi-straks-synlig-lokation-hent-hviledage','K-5/ac-3|k-5.ac-3.fs.ingen-pending-raekke-oprettet','K-5/ac-3|k-5.ac-3.fs.audit-raekke-med-aarsag','K-5/ac-3|k-5.ac-3.fs.lokalitet-l2-og-h-uaendret'],run:async lib=>{
   const f=await fixture(lib), pending=await snapshot(lib,['core_identity.pending_changes']);
   const sisterSql=`select coalesce(jsonb_agg(to_jsonb(l) order by l.id),'[]'::jsonb) from core_identity.lokationer l where id in (${q(f.l2)},${q(f.lh)})`;
   const sisters=await value(lib,null,sisterSql);
   const args={p_lokation_id:f.l,p_hviledage:14,p_change_reason:'fjorten hviledage'};
   await call(lib,f.r,'lokation_saet_hviledage',args);
   await equal(lib,f.r,`select hviledage from core_identity.lokation_hent(p_lokation_id := ${q(f.l)})`,14);
   await audit(lib,'lokationer',f.l,args.p_change_reason,f.r);
   await equal(lib,null,sisterSql,sisters);
   lib.forvent.lig([{value:await snapshot(lib,['core_identity.pending_changes'])}],{kind:'scalar',value:pending});
   await reject(lib,f.minus,rpc('lokation_saet_hviledage',{...args,p_hviledage:20}),'K-5/ac-3/neg-1',['core_identity.lokationer']);
   for(const reason of [null,'','   ']) await reject(lib,f.r,rpc('lokation_saet_hviledage',{...args,p_change_reason:reason}),'K-5/ac-3/neg-2',['core_identity.lokationer']);
   for(const n of [0,-1]) await reject(lib,f.r,rpc('lokation_saet_hviledage',{...args,p_hviledage:n}),'K-5/ac-3/neg-3',['core_identity.lokationer']);
 }},
 {id:'b3.hvile-default',covers:['K-5/ac-5:UT','K-5/ac-5:FS','K-5/ac-5/neg-1','K-5/ac-5|k-5.ac-5.fs.ny-lokation-hviledage-is-null-default','K-5/ac-5|k-5.ac-5.fs.ingen-pakke-mekanik-skriver-dvale-event-af-sig-selv','K-5/ac-5|k-5.ac-5.fs.saet-14-fjern-med-null-null-igen','K-5/ac-5|k-5.ac-5.fs.manuel-dvale-paa-l2-bestaar-uanset-hviledage'],run:async lib=>{
   const f=await fixture(lib);await equal(lib,f.r,`select hviledage from core_identity.lokation_hent(p_lokation_id := ${q(f.l)})`,null);
   await status(lib,f.r,f.l2,'dvale'); const before=await snapshot(lib,['core_identity.lokation_status_skift']);
   for(const n of [14,null]) {
     for(const l of [f.l,f.l2]) await call(lib,f.r,'lokation_saet_hviledage',{p_lokation_id:l,p_hviledage:n,p_change_reason:'vaelg/fjern hvile'});
     await equal(lib,f.r,`select hviledage from core_identity.lokation_hent(p_lokation_id := ${q(f.l)})`,n);
     await equal(lib,f.r,rpc('lokation_status_paa',{p_lokation_id:f.l2}),'dvale');
     lib.forvent.lig([{value:await snapshot(lib,['core_identity.lokation_status_skift'])}],{kind:'scalar',value:before});
   }
   await reject(lib,f.r,rpc('lokation_opret',{p_navn:'L',p_type:'butik',p_dagspris:1,p_gruppe_id:f.g,p_foerste_stand_navn:'S',p_change_reason:'hvileprobe',p_hviledage:0}),'K-5/ac-5/neg-1',['core_identity.lokationer','core_identity.stande']);
 }}
];
