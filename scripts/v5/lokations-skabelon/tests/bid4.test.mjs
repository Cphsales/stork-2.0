import {q,rpc,rows,value,call,equal,snapshot,reject,actors,group,location,audit} from './bid1.test.mjs';
import {status} from './bid3.test.mjs';
import {blockedDml} from './bid2.test.mjs';
export const relationTables=['core_identity.pending_changes','core_identity.gruppe_klient_koblinger','core_identity.lokation_klient_fravalg'];
export async function pendingFixture(lib) {
 const a=await actors(lib,['grupper','lokationer','clients','pending_changes']);
 const g=await group(lib,a.r),h=await group(lib,a.r,'H');
 const l=await location(lib,a.r,g),l2=await location(lib,a.r,g,{p_navn:'L2'}),lh=await location(lib,a.r,h,{p_navn:'LH'});
 const c=[];for(let i=0;i<3;i++) c.push(await call(lib,a.r,'client_upsert',{p_name:`C${i+1}-${g}`,p_fields:'{}',p_change_reason:'opret klient'}));
 const d=await value(lib,null,"select (clock_timestamp() at time zone 'UTC')::date::text");
 return {...a,g,h,l,l2,lh,c,d};
}
export const koblArgs=(f,c=f.c[0],g=f.g,d=f.d)=>({p_gruppe_id:g,p_klient_id:c,p_gaeldende_fra:d,p_change_reason:'kobl '+c+' paa '+g});
export async function api(lib,actor,fn,body) {
 // pg-runner's actual schema field is authoritative; headers are not forwarded there.
 return lib.som(actor).http({method:'POST',path:'/rpc/'+fn,schema:'core_identity',body});
}
export async function applyNow(lib,f,fn,args) {
 const p=await call(lib,f.r,fn,args);
 await call(lib,f.approve,'pending_change_approve',{p_change_id:p});
 lib.forvent.ok(await api(lib,f.approve,'pending_change_apply',{p_change_id:p}),'Apply via ctx-A API');
 await equal(lib,null,`select status from core_identity.pending_changes where id=${q(p)}`,'applied');
 return p;
}
export async function zeroWindow(lib,f,types,body) {
 // Legal UI configuration, never a fabricated pending deadline. This is NOT FA-3's 24h proof.
 const old=[];
 for(const type of types) old.push([type,await value(lib,null,`select undo_period_seconds from core_identity.undo_settings where change_type=${q(type)}`)]);
 try {
   for(const [type] of old) await call(lib,f.r,'undo_setting_update',{p_change_type:type,p_undo_period_seconds:0});
   return await body();
 } finally {
   for(const [type,seconds] of old) await call(lib,f.r,'undo_setting_update',{p_change_type:type,p_undo_period_seconds:seconds});
 }
}
export const tests=[
 {id:'b4.gruppe-udfasning',covers:['K-3/ac-5:UT','K-3/ac-5:FS','K-3/ac-5/neg-1','K-3/ac-5/neg-3','K-3/ac-5/neg-4','K-3/ac-5|k-3.ac-5.fs.udfasning-is-active-false','K-3/ac-5|k-3.ac-5.fs.g-l-stande-historik-koblinger-og-effektive-retter-bestaar'],run:async lib=>{
   const f=await pendingFixture(lib);
   await zeroWindow(lib,f,['gruppe_klient_kobl'],async()=>await applyNow(lib,f,'gruppe_klient_kobl',koblArgs(f)));
   const preserved=['core_identity.lokationer','core_identity.stande','core_identity.pris_historik','core_identity.lokation_gruppe_historik','core_identity.lokation_status_skift','core_identity.gruppe_klient_koblinger'];
   const before=await snapshot(lib,preserved);
   await call(lib,f.r,'gruppe_saet_aktiv',{p_gruppe_id:f.g,p_is_active:false,p_change_reason:'udfas G'});
   await equal(lib,f.r,`select is_active from core_identity.gruppe_hent(p_gruppe_id := ${q(f.g)})`,false);
   lib.forvent.lig([{value:await snapshot(lib,preserved)}],{kind:'scalar',value:before});
   for(const l of [f.l,f.l2]) await equal(lib,f.r,rpc('klient_maa_staa_paa',{p_klient_id:f.c[0],p_lokation_id:l,p_dato:f.d}),true);
   await blockedDml(lib,f.r,'grupper',`delete from core_identity.grupper where id=${q(f.g)}`,'K-3/ac-5/neg-1');
   const args={p_navn:'Ny L',p_type:'butik',p_dagspris:1,p_gruppe_id:f.g,p_foerste_stand_navn:'S',p_change_reason:'inaktiv ejer'};
   await reject(lib,f.r,rpc('lokation_opret',args),'K-3/ac-5/neg-3',['core_identity.lokationer','core_identity.stande']);
   await reject(lib,f.r,rpc('gruppe_klient_kobl',koblArgs(f,f.c[1])),'K-3/ac-5/neg-4',relationTables);
   const saLocation=await location(lib,f.sa,f.g);await equal(lib,f.sa,`select gruppe_id from core_identity.lokation_hent(p_lokation_id := ${q(saLocation)})`,f.g);
 }},
 {id:'b4.due-dato-og-genkoersel',covers:['K-6/ac-10/neg-5','K-6/ac-10/neg-6','K-6/ac-10|k-6.ac-10.fs.replay-genkoersel-af-applied-22023-ingen-ekstra-raekke'],run:async lib=>{
   const f=await pendingFixture(lib);
   await zeroWindow(lib,f,['gruppe_klient_kobl'],async()=>{
     const p=await applyNow(lib,f,'gruppe_klient_kobl',koblArgs(f));
     const before=await snapshot(lib,relationTables);
     lib.forvent.afvist(await api(lib,f.approve,'pending_change_apply',{p_change_id:p}),{kanal:'sqlstate',sqlstate:'22023',grund:'pending_change_not_approved: status=applied',afvisningssted:'core_identity.pending_change_apply'});
     await reject(lib,f.approve,rpc('pending_change_undo',{p_change_id:p}),'K-6/ac-10/neg-6',relationTables);
     lib.forvent.lig([{value:await snapshot(lib,relationTables)}],{kind:'scalar',value:before});
     const tomorrow=await value(lib,null,`select (${q(f.d)}::date+1)::text`);
     const future=await call(lib,f.r,'gruppe_klient_kobl',koblArgs(f,f.c[1],f.g,tomorrow));
     await call(lib,f.approve,'pending_change_approve',{p_change_id:future});
     await equal(lib,null,`select undo_deadline<=clock_timestamp() from core_identity.pending_changes where id=${q(future)}`,true);
     const approved=await snapshot(lib,relationTables);
     lib.forvent.afvist(await api(lib,f.approve,'pending_change_apply',{p_change_id:future}),'K-6/ac-10/neg-5');
     lib.forvent.lig([{value:await snapshot(lib,relationTables)}],{kind:'scalar',value:approved});
   });
 }},
 {id:'b4.kobl-input',covers:['K-6/ac-1:UT','K-6/ac-1/neg-1','K-6/ac-1/neg-2','K-6/ac-1/neg-3','K-6/ac-1/neg-4','K-6/ac-1/neg-5','K-6/ac-10/neg-9'],run:async lib=>{
   const f=await pendingFixture(lib);await call(lib,f.r,'gruppe_klient_kobl',koblArgs(f));
   const missing=await value(lib,null,'select gen_random_uuid()');
   for(const [patch,nid] of [[{p_klient_id:null},'K-6/ac-1/neg-1'],[{p_klient_id:missing},'K-6/ac-1/neg-2'],[{p_gruppe_id:null},'K-6/ac-1/neg-3'],[{p_gruppe_id:missing},'K-6/ac-1/neg-4']]) await reject(lib,f.r,rpc('gruppe_klient_kobl',{...koblArgs(f),...patch}),nid,relationTables);
   await call(lib,f.r,'client_set_active',{p_client_id:f.c[1],p_is_active:false,p_change_reason:'udfas klient'});
   await reject(lib,f.r,rpc('gruppe_klient_kobl',koblArgs(f,f.c[1])),'K-6/ac-1/neg-5',relationTables);
   const allowed=await call(lib,f.sa,'gruppe_klient_kobl',koblArgs(f,f.c[1]));
   await equal(lib,null,`select status from core_identity.pending_changes where id=${q(allowed)}`,'pending');
   const yesterday=await value(lib,null,`select (${q(f.d)}::date-1)::text`);
   await reject(lib,f.r,rpc('gruppe_klient_kobl',koblArgs(f,f.c[2],f.g,yesterday)),'K-6/ac-10/neg-9',relationTables);
 }},
 {id:'b4.pending-payload-adgang',covers:['K-6/ac-10/neg-8','K-8/ac-4/neg-4','K-6/ac-10|k-6.ac-10.mh.request-r-plus-pending-synlig-for-a-plus-med-foreslaaede-vaerdier','K-8/ac-4|k-8.ac-4.fs.requester-laeser-egen-pending-med-payload','K-8/ac-4|k-8.ac-4.fs.v-r17-kan-kun-laese-egne-requests','K-6/ac-10|k-6.ac-10.fs.audit-request-label-pending-change-request-payload-aarsag'],run:async lib=>{
   const f=await pendingFixture(lib),args=koblArgs(f),p=await call(lib,f.r,'gruppe_klient_kobl',args);
   const requester=await value(lib,f.r,'select core_identity.current_employee_id()');
   const projection=`select pending_id,change_type,status,oensket_fra,gruppe_id,lokation_id,klient_id,change_reason,requested_by,approved_by,undo_deadline,applied_at from core_identity.lokation_pending_hent(p_pending_id := ${q(p)})`;
   const wanted=[{pending_id:p,change_type:'gruppe_klient_kobl',status:'pending',oensket_fra:f.d,gruppe_id:f.g,lokation_id:null,klient_id:f.c[0],change_reason:args.p_change_reason,requested_by:requester,approved_by:null,undo_deadline:null,applied_at:null}];
   for(const actor of [f.r,f.approve]) lib.forvent.lig(await rows(lib,actor,projection),{kind:'rows',value:wanted});
   await audit(lib,'pending_changes',p,'pending_change_request',f.r,'INSERT');
   await equal(lib,null,`select payload->>'change_reason' from core_identity.pending_changes where id=${q(p)}`,args.p_change_reason);
   await reject(lib,f.minus,projection,'K-6/ac-10/neg-8',relationTables);
   await reject(lib,f.view,projection,'K-8/ac-4/neg-4',relationTables);
   // The actual requester becomes view-only using the authorised owner permission setup.
   lib.forvent.ok(await lib.ejer.sql(`do $rights$ begin
     perform set_config('stork.t9_write_authorized','true',true);
     perform set_config('stork.change_reason','Actor becomes view-only',true);
     perform set_config('stork.source_type','manual',true);
     update core_identity.role_permission_grants set can_write=false where role_id=(select role_id from core_identity.employees where id=${q(requester)});
   end $rights$;`));
   await equal(lib,f.r,"select core_identity.has_permission('grupper','manage',true)",false);
   lib.forvent.lig(await rows(lib,f.r,projection),{kind:'rows',value:wanted});
 }},
 {id:'b4.approve-undo',covers:['K-6/ac-10/neg-2','K-6/ac-10/neg-4','K-6/ac-10/neg-7','K-6/ac-10|k-6.ac-10.mh.approve-a-plus-ikke-requester-undo-vindue-fra-undo-settings','K-6/ac-10|k-6.ac-10.mh.undo-foer-frist-status-undone-ingen-effekt','K-6/ac-10|k-6.ac-10.fs.audit-approve-undo-labels-actor-user-id-a-plus'],run:async lib=>{
   const f=await pendingFixture(lib),p=await call(lib,f.r,'gruppe_klient_kobl',koblArgs(f));
   const before=await snapshot(lib,['core_identity.gruppe_klient_koblinger','core_identity.lokation_klient_fravalg']);
   await reject(lib,f.view,rpc('gruppe_klient_kobl',koblArgs(f,f.c[1])),'K-6/ac-10/neg-2',relationTables);
   const sister=await call(lib,f.r,'gruppe_klient_kobl',koblArgs(f,f.c[1]));
   await call(lib,f.approve,'pending_change_approve',{p_change_id:sister});
   await reject(lib,f.r,rpc('pending_change_approve',{p_change_id:p}),'K-6/ac-10/neg-7',relationTables);
   await call(lib,f.approve,'pending_change_approve',{p_change_id:p});
   await equal(lib,null,`select p.status='approved' and p.requested_by<>p.approved_by and extract(epoch from (p.undo_deadline-p.approved_at))=s.undo_period_seconds and s.undo_period_seconds=86400 from core_identity.pending_changes p join core_identity.undo_settings s on s.change_type=p.change_type where p.id=${q(p)}`,true);
   const frozen=await snapshot(lib,relationTables);
   lib.forvent.afvist(await api(lib,f.approve,'pending_change_apply',{p_change_id:p}),'K-6/ac-10/neg-4');
   lib.forvent.lig([{value:await snapshot(lib,relationTables)}],{kind:'scalar',value:frozen});
   await audit(lib,'pending_changes',p,'pending_change_approve',f.approve);
   await call(lib,f.approve,'pending_change_undo',{p_change_id:p});
   await equal(lib,null,`select status from core_identity.pending_changes where id=${q(p)}`,'undone');
   await audit(lib,'pending_changes',p,'pending_change_undo',f.approve);
   lib.forvent.lig([{value:await snapshot(lib,['core_identity.gruppe_klient_koblinger','core_identity.lokation_klient_fravalg'])}],{kind:'scalar',value:before});
 }},
 {id:'b4.medlemskab-arv',covers:['K-3/ac-4:FS','K-6/ac-4:FS','K-6/ac-3:MH','K-6/ac-8:MH','K-6/ac-8:FS','K-3/ac-4|k-3.ac-4.fs.ret-c1-c2-paa-l1-l2-true','K-3/ac-4|k-3.ac-4.fs.ret-arves-til-senere-l3-l5-true','K-3/ac-4|k-3.ac-4.fs.ret-c3-false-paa-alle-g-lokationer','K-6/ac-4|k-6.ac-4.fs.ret-c1-c2-l1-l2-true-og-senere-l3-l5-true','K-6/ac-4|k-6.ac-4.fs.ret-c3-false-paa-alle-g-lokationer','K-6/ac-3|k-6.ac-3.mh.kobl-approve-due-apply-giver-aaben-raekke-gaeldende-til-null','K-6/ac-3|k-6.ac-3.mh.genlaes-via-gruppe-koblinger-liste','K-6/ac-8|k-6.ac-8.mh.c1-og-c2-paa-g-samt-c1-paa-h-afvises-ikke','K-6/ac-8|k-6.ac-8.fs.ret-c1-l1-og-ret-c2-l1-true-samtidig-c1-ret-paa-h-lokation'],run:async lib=>{
   const f=await pendingFixture(lib);
   await zeroWindow(lib,f,['gruppe_klient_kobl'],async()=>{
     for(const [c,g] of [[f.c[0],f.g],[f.c[1],f.g],[f.c[0],f.h],[f.c[2],f.h]]) await applyNow(lib,f,'gruppe_klient_kobl',koblArgs(f,c,g));
   });
   const locs=[f.l,f.l2];for(let i=3;i<=5;i++) locs.push(await location(lib,f.r,f.g,{p_navn:'L'+i}));
   for(const l of locs) for(let i=0;i<3;i++) await equal(lib,f.r,rpc('klient_maa_staa_paa',{p_klient_id:f.c[i],p_lokation_id:l,p_dato:f.d}),i<2);
   await equal(lib,f.r,rpc('klient_maa_staa_paa',{p_klient_id:f.c[0],p_lokation_id:f.lh,p_dato:f.d}),true);
   const listing=await rows(lib,f.r,`select klient_id,gaeldende_fra,gaeldende_til from core_identity.gruppe_koblinger_liste(p_gruppe_id := ${q(f.g)},p_dato := ${q(f.d)})`);
   lib.forvent.lig(listing,{kind:'rows',value:f.c.slice(0,2).map(klient_id=>({klient_id,gaeldende_fra:f.d,gaeldende_til:null}))});
 }},
 {id:'b4.outsider',covers:['K-3/ac-4:UT','K-6/ac-4:UT','K-3/ac-4/neg-1','K-3/ac-4/neg-2','K-6/ac-4/neg-1','K-6/ac-4/neg-2'],run:async lib=>{
   const f=await pendingFixture(lib);await zeroWindow(lib,f,['gruppe_klient_kobl','lokation_klient_fravalg'],async()=>{
     await applyNow(lib,f,'gruppe_klient_kobl',koblArgs(f));
     await applyNow(lib,f,'lokation_klient_fravaelg',{p_lokation_id:f.l,p_klient_id:f.c[0],p_gaeldende_fra:f.d,p_change_reason:'lokalt fravalg'});
   });
   const tomorrow=await value(lib,null,`select (${q(f.d)}::date+1)::text`);
   const base={p_lokation_id:f.l,p_klient_id:f.c[0],p_gaeldende_fra:tomorrow,p_change_reason:'ophæv'};
   await call(lib,f.r,'lokation_klient_fravalg_ophaev',base);
   await call(lib,f.r,'lokation_klient_fravaelg',{...base,p_lokation_id:f.l2});
   for(const [fn,nids] of [['lokation_klient_fravalg_ophaev',['K-3/ac-4/neg-1','K-6/ac-4/neg-1']],['lokation_klient_fravaelg',['K-3/ac-4/neg-2','K-6/ac-4/neg-2']]]) await reject(lib,f.r,rpc(fn,{...base,p_klient_id:f.c[2]}),nids,relationTables);
 }},
 {id:'b4.nedlagt-wrapper',covers:['K-4/ac-8:UT','K-6/S:UT','K-4/ac-8/neg-1','K-4/ac-8/neg-2','K-4/ac-8/neg-3','K-6/S/neg-1'],run:async lib=>{
   const f=await pendingFixture(lib);await zeroWindow(lib,f,['gruppe_klient_kobl','lokation_klient_fravalg'],async()=>{
     for(const c of f.c.slice(0,2)) await applyNow(lib,f,'gruppe_klient_kobl',koblArgs(f,c));
     await applyNow(lib,f,'lokation_klient_fravaelg',{p_lokation_id:f.l,p_klient_id:f.c[0],p_gaeldende_fra:f.d,p_change_reason:'fravalg før nedlagt'});
   });
   const tomorrow=await value(lib,null,`select (${q(f.d)}::date+1)::text`);
   const args={p_lokation_id:f.l,p_klient_id:f.c[0],p_gaeldende_fra:tomorrow,p_change_reason:'ophæv på lokation'};
   for(const actor of [f.r,f.sa]) await call(lib,actor,'lokation_klient_fravalg_ophaev',args);
   await call(lib,f.r,'lokation_klient_fravaelg',{...args,p_klient_id:f.c[1]});
   await status(lib,f.r,f.l,'nedlagt');
   await reject(lib,f.r,rpc('lokation_klient_fravalg_ophaev',args),'K-4/ac-8/neg-1',relationTables);
   await reject(lib,f.sa,rpc('lokation_klient_fravalg_ophaev',args),['K-4/ac-8/neg-2','K-6/S/neg-1'],relationTables);
   await reject(lib,f.r,rpc('lokation_klient_fravaelg',{...args,p_klient_id:f.c[1]}),'K-4/ac-8/neg-3',relationTables);
 }},
 {id:'b4.kobling-dublet-request',covers:['K-6/ac-2/neg-1'],run:async lib=>{
   const f=await pendingFixture(lib);await zeroWindow(lib,f,['gruppe_klient_kobl'],async()=>await applyNow(lib,f,'gruppe_klient_kobl',koblArgs(f)));
   await reject(lib,f.r,rpc('gruppe_klient_kobl',koblArgs(f)),'K-6/ac-2/neg-1',relationTables);
 }},
 {id:'b4.r1-laesegraense',covers:['K-8/ac-4:UT','K-8/ac-4/neg-2','K-8/ac-4|k-8.ac-4.fs.r-minus-direkte-select-rows-tom-ikke-fejl-neg-3'],run:async lib=>{
   const a=await actors(lib,['grupper']),g=await group(lib,a.r);
   for(const actor of [a.r,a.view]) await equal(lib,actor,`select id from core_identity.gruppe_hent(p_gruppe_id := ${q(g)})`,g);
   await reject(lib,a.minus,`select * from core_identity.gruppe_hent(p_gruppe_id := ${q(g)})`,'K-8/ac-4/neg-2',['core_identity.grupper']);
   lib.forvent.lig(await rows(lib,a.minus,`select * from core_identity.grupper where id=${q(g)}`),{kind:'empty'},'RLS read is successful with zero rows');
 }}
];
