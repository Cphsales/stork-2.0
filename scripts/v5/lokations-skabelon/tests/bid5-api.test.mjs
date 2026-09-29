import {q,rows,value,call,equal,snapshot,actors,group} from './bid1.test.mjs';
import {pendingFixture,api} from './bid4.test.mjs';
export function readRegistry(f) {
 return [
 ['gruppe_hent',{p_gruppe_id:f.g}],['grupper_liste',{}],['gruppe_kontakter_liste',{p_gruppe_id:f.g}],
 ['lokation_status_paa',{p_lokation_id:f.l}],['lokation_er_bookbar',{p_lokation_id:f.l}],['stand_er_bookbar',{p_stand_id:f.s}],
 ['lokation_dagspris_paa',{p_lokation_id:f.l}],['stand_dagspris_paa',{p_stand_id:f.s}],['lokation_hent',{p_lokation_id:f.l}],
 ['lokationer_liste',{}],['stande_liste',{p_lokation_id:f.l}],['lokation_status_historik',{p_lokation_id:f.l}],
 ['klient_maa_staa_paa',{p_klient_id:f.c[0],p_lokation_id:f.l}],['lokation_klienter',{p_lokation_id:f.l}],
 ['gruppe_koblinger_liste',{p_gruppe_id:f.g}],['lokation_fravalg_liste',{p_lokation_id:f.l}]
 ];
}
const lists=new Set(['grupper_liste','gruppe_kontakter_liste','lokationer_liste','stande_liste','lokation_status_historik','lokation_klienter','gruppe_koblinger_liste','lokation_fravalg_liste']);
function expanded(lib,nid,name,representative) {
 if(name===representative) return nid;
 const c=lib.kontrakt(nid);
 // Closed plan §0.2 family substitution; never invent another SQLSTATE or reason.
 return {...c,grund:c.grund.replace(representative,name),afvisningssted:c.afvisningssted.replace(representative,name)};
}
export const tests=[
 {id:'b5.api-lokation-hviledage',covers:['K-1/ac-5:MH','K-5/ac-4:MH','K-1/ac-5|k-1.ac-5.mh.w5-w6-via-api-som-r-plus-genlaest-lokation-hent','K-5/ac-4|k-5.ac-4.mh.w8-via-api-som-r-plus-genlaest-lokation-hent-hviledage'],run:async lib=>{
   const a=await actors(lib),g=await group(lib,a.r),name='API-'+g;
   const args={p_navn:name,p_type:'butik',p_dagspris:23.45,p_gruppe_id:g,p_foerste_stand_navn:'S1',p_change_reason:'API oprettelse'};
   const created=await api(lib,a.r,'lokation_opret',args);lib.forvent.ok(created);
   // pg-runner drops scalar HTTP bodies. Identity is observed independently in the store,
   // then used in real API reads; this does not claim validation of the dropped UUID response.
   const l=await value(lib,null,`select id from core_identity.lokationer where gruppe_id=${q(g)} and navn=${q(name)}`);
   const get=async()=>{
     const r=await api(lib,a.r,'lokation_hent',{p_lokation_id:l});lib.forvent.ok(r);
     lib.forvent.sandt(Array.isArray(r.rows)&&r.rows.length===1,'API typed read must return exactly one row');return r.rows[0];
   };
   const initial=await get();lib.forvent.sandt(initial.id===l&&initial.gruppe_id===g&&initial.dagspris===23.45&&initial.navn===name,'Created values read over API');
   lib.forvent.ok(await api(lib,a.r,'lokation_rediger',{p_lokation_id:l,p_navn:name+' rettet',p_type:'event',p_dagspris:34.56,p_change_reason:'API rettelse'}));
   const edited=await get();lib.forvent.sandt(edited.id===l&&edited.navn===name+' rettet'&&edited.type==='event'&&edited.dagspris===34.56,'W6 changes read over API');
   lib.forvent.ok(await api(lib,a.r,'lokation_saet_hviledage',{p_lokation_id:l,p_hviledage:14,p_change_reason:'API hvile'}));
   lib.forvent.sandt((await get()).hviledage===14,'W8 effect read over API');
 }},
 {id:'b5.api-read-negativer',covers:['K-9/ac-2:UT','K-9/ac-2/neg-1','K-9/ac-2/neg-2','K-9/ac-2/neg-3'],run:async lib=>{
   const f=await pendingFixture(lib);f.s=await value(lib,null,`select id from core_identity.stande where lokation_id=${q(f.l)}`);
   await call(lib,f.r,'gruppe_kontakt_upsert',{p_gruppe_id:f.g,p_navn:'API kontakt',p_change_reason:'opret kontakt'});
   const registry=readRegistry(f);lib.forvent.sandt(registry.length===16,'Closed R1-R16 registry');
   const before=await snapshot(lib,['core_identity.grupper','core_identity.gruppe_kontakter','core_identity.lokationer','core_identity.stande','core_identity.pending_changes']);
   for(const [name,args] of registry) {
     lib.forvent.ok(await api(lib,f.r,name,args),'Legal API sister '+name);
     lib.forvent.afvist(await api(lib,f.minus,name,args),expanded(lib,'K-9/ac-2/neg-1',name,'gruppe_hent'));
   }
   const ls=registry.filter(([name])=>lists.has(name));lib.forvent.sandt(ls.length===8,'All eight paginated APIs');
   for(const [name,args] of ls) for(const [n,nid] of [[5000,'K-9/ac-2/neg-2'],[0,'K-9/ac-2/neg-3']]) lib.forvent.afvist(await api(lib,f.r,name,{...args,p_antal:n}),expanded(lib,nid,name,'lokationer_liste'));
   lib.forvent.lig([{value:await snapshot(lib,Object.keys(before))}],{kind:'scalar',value:before});
 }}
];
