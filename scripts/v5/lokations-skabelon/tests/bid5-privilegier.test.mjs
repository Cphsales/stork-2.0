import {q,rows,value,call,snapshot} from './bid1.test.mjs';
import {dmlActor} from './bid2.test.mjs';
import {pendingFixture,koblArgs,zeroWindow,applyNow} from './bid4.test.mjs';
export const tests=[{
 id:'b5.ni-tabeller-fire-dml',covers:['K-8/ac-1/neg-1'],run:async lib=>{
   const f=await pendingFixture(lib);
   await call(lib,f.r,'gruppe_kontakt_upsert',{p_gruppe_id:f.g,p_navn:'Kontakt',p_change_reason:'DML søster'});
   let pk,pf;
   await zeroWindow(lib,f,['gruppe_klient_kobl','lokation_klient_fravalg'],async()=>{
     pk=await applyNow(lib,f,'gruppe_klient_kobl',koblArgs(f));
     pf=await applyNow(lib,f,'lokation_klient_fravaelg',{p_lokation_id:f.l,p_klient_id:f.c[0],p_gaeldende_fra:f.d,p_change_reason:'DML fravalg søster'});
   });
   // Concrete closed registry from plan §2.1; every table has a product-produced witness.
   const registry=[
    ['grupper','navn,type',"'direkte','kaede'",`id=${q(f.g)}`,"navn='omgaaet'"],
    ['gruppe_kontakter','gruppe_id,navn',`${q(f.g)},'direkte'`,`gruppe_id=${q(f.g)}`,"navn='omgaaet'"],
    ['lokationer','navn,type,dagspris,gruppe_id',`'direkte','butik',1,${q(f.g)}`,`id=${q(f.l)}`,"navn='omgaaet'"],
    ['stande','lokation_id,navn',`${q(f.l)},'direkte'`,`lokation_id=${q(f.l)}`,"navn='omgaaet'"],
    ['lokation_status_skift','lokation_id,status',`${q(f.l)},'aktiv'`,`lokation_id=${q(f.l)}`,"status='nedlagt'"],
    ['pris_historik','lokation_id,ny_dagspris',`${q(f.l)},1`,`lokation_id=${q(f.l)}`,'ny_dagspris=99'],
    ['lokation_gruppe_historik','lokation_id,gruppe_id',`${q(f.l)},${q(f.h)}`,`lokation_id=${q(f.l)}`,`gruppe_id=${q(f.h)}`],
    ['gruppe_klient_koblinger','gruppe_id,klient_id,gaeldende_fra,created_by_pending_change_id',`${q(f.g)},${q(f.c[1])},${q(f.d)},${q(pk)}`,`gruppe_id=${q(f.g)}`,`klient_id=${q(f.c[2])}`],
    ['lokation_klient_fravalg','lokation_id,klient_id,gaeldende_fra,created_by_pending_change_id',`${q(f.l2)},${q(f.c[0])},${q(f.d)},${q(pf)}`,`lokation_id=${q(f.l)}`,`lokation_id=${q(f.l2)}`]
   ];
   for(const [table,cols,vals,where,set] of registry) {
     const relation='core_identity.'+table;
     lib.forvent.sandt((await rows(lib,null,`select id from ${relation} where ${where}`)).length>0,'No vacuous DML probe: '+table);
     const before=await snapshot(lib,[relation]);
     const nid='K-8/ac-1/neg-1',c=lib.kontrakt(nid);
     const contract=table==='grupper'?nid:{...c,grund:c.grund.replace('grupper',table)};
     for(const sql of [`insert into ${relation}(${cols}) values (${vals})`,`update ${relation} set ${set} where ${where}`,`delete from ${relation} where ${where}`,`truncate ${relation}`]) {
       // No commit is sent. Even a successful mutant probe is rolled back at connection close.
       lib.forvent.afvist(await lib.som(dmlActor(f.r,table)).sql('begin; '+sql+';'),contract);
     }
     lib.forvent.lig([{value:await snapshot(lib,[relation])}],{kind:'scalar',value:before},'All four probes preserve '+table);
   }
 }
}];
