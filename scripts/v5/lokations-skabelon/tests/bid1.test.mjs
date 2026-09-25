// Blind production against plan blob 289b87616750a1a1180a8ec5f7a639cd43f07a29.
// Only the measurement library performs I/O. Product fixtures use public RPCs.
// Foundational auth/permission fixtures are the owner-SQL setup authorised by the driver.
export const q = (v) => v === null ? 'null' : typeof v === 'number' || typeof v === 'boolean' ? String(v) : `'${String(v).replaceAll("'", "''")}'`;
export const rpc = (name, args) => `select core_identity.${name}(${Object.entries(args).map(([k,v]) => `${k} := ${q(v)}`).join(', ')}) as value`;
export async function rows(lib, actor, sql) {
  const r = await (actor ? lib.som(actor) : lib.ejer).sql(sql);
  lib.forvent.ok(r, sql); lib.forvent.sandt(Array.isArray(r.rows), 'SQL observation must return rows'); return r.rows;
}
export async function value(lib, actor, sql) {
  const r = await rows(lib, actor, sql);
  lib.forvent.sandt(r.length === 1 && Object.keys(r[0]).length === 1, 'Expected exactly one scalar');
  return Object.values(r[0])[0];
}
export const call = (lib, actor, name, args) => value(lib, actor, rpc(name, args));
export async function equal(lib, actor, sql, expected) {
  lib.forvent.lig(await rows(lib, actor, sql), {kind:'scalar',value:expected}, sql);
}
export async function snapshot(lib, tables) {
  const out = {};
  for (const t of tables) out[t] = await value(lib, null, `select coalesce(jsonb_agg(to_jsonb(t) order by t.id), '[]'::jsonb) as value from ${t} t`);
  return out;
}
export async function reject(lib, actor, sql, nids, tables, options) {
  const before = await snapshot(lib, tables);
  const outcome = await (actor ? lib.som(actor) : lib.ejer).sql(sql.trimEnd().endsWith(';') ? sql : sql + ';');
  const after = await snapshot(lib, tables);
  for (const nid of Array.isArray(nids) ? nids : [nids]) lib.forvent.afvist(outcome, nid, options);
  lib.forvent.lig([{value:after}], {kind:'scalar',value:before}, 'Rejected action left the store unchanged');
}
export async function actors(lib, pages = ['grupper','lokationer']) {
  const result = {};
  for (const mode of ['r','minus','view','approve','sa']) {
    const ids = (await rows(lib, null, 'select gen_random_uuid() as uid, gen_random_uuid() as eid, gen_random_uuid() as rid'))[0];
    const grants = mode === 'minus' ? [] : pages;
    const pageList = grants.map(q).join(',') || 'null';
    const roleExpr = mode === 'sa' ? `(select id from core_identity.roles where name='superadmin')` : `${q(ids.rid)}::uuid`;
    lib.forvent.ok(await lib.ejer.sql(`do $fixture$
begin
  perform set_config('stork.source_type','manual',true);
  perform set_config('stork.change_reason','Codex auth fixture',true);
  perform set_config('stork.t9_write_authorized','true',true);
  perform set_config('stork.allow_employees_write','true',true);
  perform set_config('stork.allow_roles_write','true',true);
  insert into auth.users(id,email) values (${q(ids.uid)},${q(ids.uid+'@test.invalid')});
  ${mode === 'sa' ? '' : `insert into core_identity.roles(id,name) values (${q(ids.rid)},${q('angreb-'+ids.rid)});`}
  insert into core_identity.employees(id,auth_user_id,first_name,last_name,email,role_id)
    values (${q(ids.eid)},${q(ids.uid)},'Angreb','Fixture',${q(ids.uid+'@test.invalid')},${roleExpr});
  ${mode === 'sa' ? '' : `
  if (select count(distinct p.name) from core_identity.permission_pages p where p.name in (${pageList})) <> ${grants.length} then
    raise exception 'Required permission page absent';
  end if;
  insert into core_identity.role_permission_grants(role_id,page_id,can_access,can_write,visibility)
    select ${q(ids.rid)},p.id,true,${mode !== 'view'},'all' from core_identity.permission_pages p where p.name in (${pageList});
  insert into core_identity.role_permission_grants(role_id,tab_id,can_access,can_write,visibility)
    select ${q(ids.rid)},t.id,true,${mode !== 'view'},'all' from core_identity.permission_tabs t
    join core_identity.permission_pages p on p.id=t.page_id where p.name in (${pageList});`}
end $fixture$;`), 'Seed foundational actor');
    const actor = {role:'authenticated',settings:{'request.jwt.claim.sub':ids.uid}};
    const profile = (await rows(lib, actor, `select current_user as role, auth.uid() as uid,
      core_identity.current_employee_id() as employee, core_identity.is_admin() as admin,
      (select rolbypassrls from pg_roles where rolname=current_user) as bypass,
      exists(select 1 from pg_class where relnamespace='core_identity'::regnamespace and relowner=(select oid from pg_roles where rolname=current_user)) as owns`))[0];
    lib.forvent.lig([profile],{kind:'rows',value:[{role:'authenticated',uid:ids.uid,employee:ids.eid,admin:mode==='sa',bypass:false,owns:false}]}, 'Actual ctx-A profile');
    result[mode] = actor;
  }
  return result;
}
export const group = (lib,a,name='G') => call(lib,a,'gruppe_upsert',{p_navn:name,p_change_reason:'opret gruppe',p_type:'kaede'});
export async function location(lib,a,g,args={}) {
  return call(lib,a,'lokation_opret',{p_navn:'L',p_type:'butik',p_dagspris:123.45,p_gruppe_id:g,p_foerste_stand_navn:'S1',p_change_reason:'opret lokation',...args});
}
export async function fixture(lib) {
  const a = await actors(lib); const g = await group(lib,a.r); const h = await group(lib,a.r,'H');
  const l = await location(lib,a.r,g); const l2 = await location(lib,a.r,g,{p_navn:'L2'}); const lh = await location(lib,a.r,h,{p_navn:'LH'});
  const s = await value(lib,null,`select id from core_identity.stande where lokation_id=${q(l)}`);
  return {...a,g,h,l,l2,lh,s};
}
export async function audit(lib, table, record, reason, actor, operation='UPDATE') {
  const observed = await rows(lib,null,`select actor_user_id,source_type,change_reason,operation from core_compliance.audit_log
    where table_schema='core_identity' and table_name=${q(table)} and record_id=${q(record)} and change_reason=${q(reason)}`);
  lib.forvent.lig(observed,{kind:'rows',value:[{actor_user_id:actor.settings['request.jwt.claim.sub'],source_type:'manual',change_reason:reason,operation}]},'Exact actor/reason/source audit witness');
}
export const tests = [
  {id:'b1.gruppe-identitet', covers:['K-3/ac-3:MH','K-3/ac-3|k-3.ac-3.mh.g-og-h-oprettet-med-navn-og-separate-stabile-id','K-3/ac-3|k-3.ac-3.mh.redigering-genlaeses'],run:async lib=>{
    const a=await actors(lib,['grupper']); const g=await group(lib,a.r,'samme navn'), h=await group(lib,a.r,'samme navn');
    lib.forvent.sandt(g!==h,'Colliding names must have independent identities');
    lib.forvent.sandt(await call(lib,a.r,'gruppe_upsert',{p_navn:'rettet',p_change_reason:'ret gruppe',p_type:'andet',p_gruppe_id:g})===g,'Update preserves identity');
    for(const [id,navn,type] of [[g,'rettet','andet'],[h,'samme navn','kaede']]) {
      lib.forvent.lig(await rows(lib,a.r,`select id,navn,type,is_active from core_identity.gruppe_hent(p_gruppe_id := ${q(id)})`),{kind:'rows',value:[{id,navn,type,is_active:true}]});
    }
    await audit(lib,'grupper',g,'ret gruppe',a.r);
  }},
  {id:'b1.gruppe-input',covers:['K-3/ac-3:UT','K-3/ac-3/neg-1','K-3/ac-3/neg-2'],run:async lib=>{
    const a=await actors(lib,['grupper']);
    for(const actor of [a.r,a.sa]) {
      await group(lib,actor);
      for(const p_navn of [null,'','   ']) await reject(lib,actor,rpc('gruppe_upsert',{p_navn,p_change_reason:'navneprobe'}),'K-3/ac-3/neg-1',['core_identity.grupper','core_identity.gruppe_kontakter']);
    }
    await reject(lib,a.r,rpc('gruppe_upsert',{p_navn:'G',p_type:'ukendt',p_change_reason:'typeprobe'}),'K-3/ac-3/neg-2',['core_identity.grupper']);
  }}
];
