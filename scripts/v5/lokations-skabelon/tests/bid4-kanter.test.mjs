import {q,rpc,value,call,equal,snapshot,reject} from './bid1.test.mjs';
import {blockedDml} from './bid2.test.mjs';
import {status} from './bid3.test.mjs';
import {pendingFixture,koblArgs,zeroWindow,applyNow,api,relationTables} from './bid4.test.mjs';
async function memberAndOptout(lib,f) {
 return zeroWindow(lib,f,['gruppe_klient_kobl','lokation_klient_fravalg'],async()=>{
   await applyNow(lib,f,'gruppe_klient_kobl',koblArgs(f));
   await applyNow(lib,f,'lokation_klient_fravaelg',{p_lokation_id:f.l,p_klient_id:f.c[0],p_gaeldende_fra:f.d,p_change_reason:'gyldigt fravalg'});
 });
}
export const tests=[
 {id:'b4.fravalg-request-kanter',covers:['K-3/ac-6:UT','K-6/ac-5:UT','K-3/ac-6/neg-1','K-3/ac-6/neg-2','K-3/ac-6/neg-3','K-6/ac-5/neg-1','K-6/ac-5/neg-2','K-6/ac-5/neg-3'],run:async lib=>{
   const f=await pendingFixture(lib);await memberAndOptout(lib,f);
   const tomorrow=await value(lib,null,`select (${q(f.d)}::date+1)::text`);
   const args={p_lokation_id:f.l,p_klient_id:f.c[0],p_gaeldende_fra:tomorrow,p_change_reason:'requestkant'};
   await call(lib,f.r,'lokation_klient_fravalg_ophaev',args);
   await call(lib,f.r,'lokation_klient_fravaelg',{...args,p_lokation_id:f.l2});
   await reject(lib,f.r,rpc('lokation_klient_fravaelg',args),['K-3/ac-6/neg-1','K-6/ac-5/neg-1'],relationTables);
   await reject(lib,f.r,rpc('lokation_klient_fravalg_ophaev',{...args,p_lokation_id:f.l2}),['K-3/ac-6/neg-2','K-6/ac-5/neg-2'],relationTables);
   await reject(lib,f.r,rpc('lokation_klient_fravalg_ophaev',{...args,p_gaeldende_fra:f.d}),['K-3/ac-6/neg-3','K-6/ac-5/neg-3'],relationTables);
 }},
 {id:'b4.frakobl-request-kanter',covers:['K-6/ac-6/neg-1','K-6/ac-6/neg-3','K-6/ac-6/neg-4'],run:async lib=>{
   const f=await pendingFixture(lib);await zeroWindow(lib,f,['gruppe_klient_kobl'],async()=>await applyNow(lib,f,'gruppe_klient_kobl',koblArgs(f)));
   const tomorrow=await value(lib,null,`select (${q(f.d)}::date+1)::text`);
   const args=koblArgs(f,f.c[0],f.g,tomorrow);
   await call(lib,f.r,'gruppe_klient_frakobl',args);
   await reject(lib,f.r,rpc('gruppe_klient_frakobl',{...args,p_klient_id:f.c[2]}),'K-6/ac-6/neg-3',relationTables);
   await reject(lib,f.r,rpc('gruppe_klient_frakobl',{...args,p_gaeldende_fra:f.d}),'K-6/ac-6/neg-4',relationTables);
   for(const sql of [`update core_identity.gruppe_klient_koblinger set gaeldende_til=${q(tomorrow)} where gruppe_id=${q(f.g)}`,`delete from core_identity.gruppe_klient_koblinger where gruppe_id=${q(f.g)}`]) await blockedDml(lib,f.r,'gruppe_klient_koblinger',sql,'K-6/ac-6/neg-1');
 }},
 {id:'b4.nedlagt-apply',covers:['K-4/ac-9:UT','K-4/ac-9/neg-1'],run:async lib=>{
   const f=await pendingFixture(lib);
   await zeroWindow(lib,f,['gruppe_klient_kobl','lokation_klient_fravalg'],async()=>{
     await applyNow(lib,f,'gruppe_klient_kobl',koblArgs(f));
     const args={p_lokation_id:f.l,p_klient_id:f.c[0],p_gaeldende_fra:f.d,p_change_reason:'request før nedlæggelse'};
     await applyNow(lib,f,'lokation_klient_fravaelg',{...args,p_lokation_id:f.l2});
     const p=await call(lib,f.r,'lokation_klient_fravaelg',args);
     await status(lib,f.r,f.l,'nedlagt');
     await call(lib,f.approve,'pending_change_approve',{p_change_id:p});
     const before=await snapshot(lib,relationTables);
     lib.forvent.afvist(await api(lib,f.approve,'pending_change_apply',{p_change_id:p}),'K-4/ac-9/neg-1');
     await equal(lib,null,`select status from core_identity.pending_changes where id=${q(p)}`,'approved');
     lib.forvent.lig([{value:await snapshot(lib,relationTables)}],{kind:'scalar',value:before});
   });
 }},
 {id:'b4.relationshistorik-schema',covers:['K-6/ac-6:UT','K-6/ac-6/neg-2','K-8/ac-3/neg-4'],run:async lib=>{
   const f=await pendingFixture(lib);await memberAndOptout(lib,f);
   // These are the explicitly permitted, rolled-back ctx-B schema probes.
   // They do not fabricate history for any date oracle or FA-3 assertion.
   for(const [table,where] of [['gruppe_klient_koblinger',`gruppe_id=${q(f.g)}`],['lokation_klient_fravalg',`lokation_id=${q(f.l)}`]]) {
     const relation='core_identity.'+table;
     const before=await snapshot(lib,[relation]);
     const close=`update ${relation} set gaeldende_til=gaeldende_fra+1 where ${where}`;
     const pre=`begin; set local stork.source_type='manual'; set local stork.change_reason='ctx-B schema-probe'; set local stork.allow_${table}_write='true';`;
     lib.forvent.ok(await lib.ejer.sql(`${pre} ${close};`),'Lawful closing UPDATE in rollback-only owner probe');
     const cases=[
       ['DELETE',`delete from ${relation} where ${where}`],
       ['TRUNCATE',`truncate ${relation}`],
       ['UPDATE',`update ${relation} set gaeldende_fra=gaeldende_fra+1 where ${where}`],
       ['UPDATE',`update ${relation} set klient_id=${q(f.c[1])} where ${where}`],
       ['UPDATE',`${close}; update ${relation} set gaeldende_til=gaeldende_til+1 where ${where}`]
     ];
     for(const [op,sql] of cases) {
       const r=await lib.ejer.sql(`${pre} ${sql};`);
       const c=lib.kontrakt('K-8/ac-3/neg-4');
       lib.forvent.afvist(r,table==='gruppe_klient_koblinger'&&op==='DELETE'?'K-8/ac-3/neg-4':{...c,grund:c.grund.replace('gruppe_klient_koblinger',table).replace('operation DELETE',`operation ${op}`)});
       if(table==='gruppe_klient_koblinger'&&op==='UPDATE') lib.forvent.afvist(r,'K-6/ac-6/neg-2');
     }
     lib.forvent.lig([{value:await snapshot(lib,[relation])}],{kind:'scalar',value:before});
   }
 }}
];
