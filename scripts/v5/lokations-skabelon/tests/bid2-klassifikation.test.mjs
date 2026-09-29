import {q,rows,value,call,equal,snapshot,reject,actors,group} from './bid1.test.mjs';
export const complianceRpc=(name,args)=>`select core_compliance.${name}(${Object.entries(args).map(([k,v])=>`${k} := ${q(v)}`).join(', ')}) as value`;
export const definitionArgs=(table,column,pii)=>({p_table_schema:'core_identity',p_table_name:table,p_column_name:column,p_category:'master_data',p_pii_level:pii,p_purpose:'Angrebsprobe',p_change_reason:'klassifikationsprobe'});
const tables=['core_compliance.data_field_definitions'];
async function positive(lib,actor) {
  const defs=await rows(lib,null,"select column_name,category,pii_level,purpose,retention_type,retention_value,match_role from core_compliance.data_field_definitions where table_schema='core_identity' and table_name='gruppe_kontakter' and column_name in ('navn','email','telefon') order by column_name");
  lib.forvent.sandt(defs.length===3&&defs.every(d=>d.pii_level==='direct'),'Three delivered direct contact definitions');
  for(const d of defs) {
    lib.forvent.sandt(d.retention_value===null,'This test requires untouched delivered contact retention defaults');
    lib.forvent.ok(await lib.som(actor).sql(complianceRpc('data_field_definition_upsert',{
      ...definitionArgs('gruppe_kontakter',d.column_name,'direct'),p_category:d.category,p_purpose:d.purpose,p_retention_type:d.retention_type,p_retention_value:null,p_match_role:d.match_role
    })),'Allowed contact definition');
  }
}
export const tests=[
 {id:'b2.pii-nedgradering',covers:['K-7/S/neg-1','K-7/S/neg-2','K-7/S:FS','K-7/S|k-7.s.fs.efter-afvist-nedgradering-hasher-audit-fortsat-email-sporvaerdi'],run:async lib=>{
   const a=await actors(lib,['grupper','classification']);const g=await group(lib,a.r);
   const email='foer-'+g+'@test.invalid', next='efter-'+g+'@test.invalid';
   const k=await call(lib,a.r,'gruppe_kontakt_upsert',{p_gruppe_id:g,p_navn:'Kontakt',p_email:email,p_telefon:'123',p_change_reason:'kontakt opret'});
   for(const [actor,nid] of [[a.r,'K-7/S/neg-1'],[a.sa,'K-7/S/neg-2']]) {
     await positive(lib,actor);
     await reject(lib,actor,'begin; '+complianceRpc('data_field_definition_upsert',definitionArgs('gruppe_kontakter','email','none'))+';',nid,tables);
   }
   const reason='email efter afvist nedgradering '+k;
   await call(lib,a.r,'gruppe_kontakt_upsert',{p_gruppe_id:g,p_kontakt_id:k,p_navn:'Kontakt',p_email:next,p_telefon:'123',p_change_reason:reason});
   const hashes=await rows(lib,null,`select old_values->>'email' as old_email,new_values->>'email' as new_email,actor_user_id,change_reason from core_compliance.audit_log where table_schema='core_identity' and table_name='gruppe_kontakter' and record_id=${q(k)} and change_reason=${q(reason)}`);
   const expected=await rows(lib,null,`select 'sha256:'||encode(extensions.digest(${q(email)},'sha256'),'hex') as old_email,'sha256:'||encode(extensions.digest(${q(next)},'sha256'),'hex') as new_email,${q(a.r.settings['request.jwt.claim.sub'])} as actor_user_id,${q(reason)} as change_reason`);
   lib.forvent.lig(hashes,{kind:'rows',value:expected},'Audit stores the actual before/after hashes, never raw PII');
 }},
 {id:'b2.pii-delete',covers:['K-7/S/neg-3'],run:async lib=>{
   const a=await actors(lib,['classification']);await positive(lib,a.r);
   await reject(lib,a.r,'begin; '+complianceRpc('data_field_definition_delete',{p_table_schema:'core_identity',p_table_name:'gruppe_kontakter',p_column_name:'email',p_change_reason:'slet klassifikation'})+';','K-7/S/neg-3',tables);
 }},
 {id:'b2.pii-indirect',covers:['K-7/S/neg-4','K-7/S/neg-5'],run:async lib=>{
   const a=await actors(lib,['classification']);
   await equal(lib,null,"select pii_level from core_compliance.data_field_definitions where table_schema='core_identity' and table_name='lokationer' and column_name='adresse'",'none');
   await equal(lib,null,"select count(*)::integer from core_compliance.data_field_definitions where table_schema='core_identity' and table_name='lokationer' and column_name='note'",0);
   for(const actor of [a.r,a.sa]) {
     await positive(lib,actor);
     for(const [col,nid] of [['adresse','K-7/S/neg-4'],['note','K-7/S/neg-5']]) await reject(lib,actor,'begin; '+complianceRpc('data_field_definition_upsert',definitionArgs('lokationer',col,'indirect'))+';',nid,tables);
   }
   // Scope control: preserve the existing foundation definition, including its indirect level.
   const d=(await rows(lib,null,"select * from core_compliance.data_field_definitions where table_schema='core_identity' and table_name='clients' and column_name='fields'"))[0];
   lib.forvent.sandt(d?.pii_level==='indirect','Foundation clients.fields is the plan-bound indirect sister');
   lib.forvent.ok(await lib.som(a.r).sql('begin; '+complianceRpc('data_field_definition_upsert',{
     p_table_schema:'core_identity',p_table_name:'clients',p_column_name:'fields',p_category:d.category,p_pii_level:d.pii_level,p_purpose:d.purpose,p_retention_type:d.retention_type,p_retention_value:d.retention_value===null?null:JSON.stringify(d.retention_value),p_match_role:d.match_role,p_change_reason:'fundament soester'
   })+';'));
 }},
 {id:'b2.pii-uden-vej',covers:['K-7/S/neg-6','K-7/S/neg-7'],run:async lib=>{
   const a=await actors(lib,['classification']);
   for(const actor of [a.r,a.sa]) {
     await positive(lib,actor);
     for(const [table,col,nid] of [['grupper','navn','K-7/S/neg-6'],['lokationer','dagspris','K-7/S/neg-7']]) {
       await equal(lib,null,`select pii_level from core_compliance.data_field_definitions where table_schema='core_identity' and table_name=${q(table)} and column_name=${q(col)}`,'none');
       await reject(lib,actor,'begin; '+complianceRpc('data_field_definition_upsert',definitionArgs(table,col,'direct'))+';',nid,tables);
     }
   }
 }}
];
