/* ALMOGHANI LIVE — Shared browser controls. No passwords or GitHub tokens are stored here. */
(function(root){
  'use strict';
  const KEY='almoghani_control_draft_v1';
  const ARAB=new Set(['SA','AE','BH','KW','QA','OM','YE','IQ','JO','SY','LB','PS','EG','SD','LY','TN','DZ','MA','MR','SO','DJ','KM']);
  const defaults={version:1,channels:{added:[],edited:{},deleted:[],order:[]},categories:{custom:[],labels:{},hidden:[],order:[]},appearance:{brand:'ALMOGHANI LIVE',heading:'قنواتنا العربية مباشرة 🇸🇦',description:'شاهد القنوات السعودية والخليجية والعربية، وابحث عن قناتك المفضلة وشغّلها داخل الموقع.',accent:'#28e5f4',gold:'#d4b57c',background:'#090c14',announcement:'',cardSize:177,bannerUrl:''},player:{featuredKey:''},updatedAt:''};
  const clone=x=>JSON.parse(JSON.stringify(x));
  const str=x=>String(x??'');
  const array=x=>Array.isArray(x)?x:[];
  const hex=(x,fallback)=>/^#[0-9a-f]{6}$/i.test(str(x))?x:fallback;
  const https=x=>/^https:\/\/[^\s"'<>]+$/i.test(str(x));
  const codes=x=>str(x).toUpperCase().split(/[;,\s]+/).filter(Boolean);
  const arabic=c=>{const cc=codes(c?.country);return cc.length?cc.some(x=>ARAB.has(x)):/\b(ara|arb|ar)\b/i.test(str(c?.language))||/[\u0600-\u06FF]/.test(str(c?.name));};
  function cleanChannel(c){
    if(!c||typeof c!=='object')return null;
    const name=str(c.name).trim().slice(0,130);
    const country=str(c.country).toUpperCase().trim().slice(0,20);
    const language=str(c.language).trim().slice(0,32);
    const sources=array(c.sources).map(x=>({url:str(x?.url||'').trim(),name:str(x?.name||name).slice(0,130),extras:[]})).filter(x=>https(x.url)).slice(0,12);
    const direct=str(c.url).trim();
    if(!sources.length&&https(direct))sources.push({url:direct,name,extras:[]});
    if(!name||!sources.length||!arabic({name,country,language}))return null;
    const groups=array(c.groups instanceof Set?[...c.groups]:c.groups).map(x=>str(x).trim().slice(0,60)).filter(Boolean).slice(0,8);
    return {key:str(c.key||'custom_'+Date.now()).slice(0,200),name,country,language,logo:https(c.logo)?str(c.logo):'',groups:groups.length?groups:['general'],sources,arabic:true};
  }
  function normalize(src){
    const d=clone(defaults);if(!src||typeof src!=='object')return d;
    const channels=src.channels||{},categories=src.categories||{},appearance=src.appearance||{};
    d.channels.added=array(channels.added).map(cleanChannel).filter(Boolean).slice(0,6000);
    d.channels.edited={};
    if(channels.edited&&typeof channels.edited==='object'&&!Array.isArray(channels.edited))for(const [key,patch] of Object.entries(channels.edited).slice(0,8000)){
      if(patch&&typeof patch==='object')d.channels.edited[key]={
        name:str(patch.name||'').slice(0,130),country:str(patch.country||'').toUpperCase().slice(0,20),language:str(patch.language||'').slice(0,32),
        logo:https(patch.logo)?str(patch.logo):'',groups:array(patch.groups).map(x=>str(x).slice(0,60)).slice(0,8),
        sources:array(patch.sources).map(s=>({url:str(s?.url),name:str(s?.name).slice(0,130),extras:[]})).filter(s=>https(s.url)).slice(0,12)
      };
    }
    d.channels.deleted=array(channels.deleted).map(str).slice(0,10000);
    d.channels.order=array(channels.order).map(str).slice(0,10000);
    d.categories.custom=array(categories.custom).filter(x=>x&&/^[a-z][\w-]{2,35}$/i.test(str(x.id))).map(x=>({id:str(x.id),label:str(x.label).slice(0,65)})).slice(0,90);
    d.categories.labels={};if(categories.labels&&typeof categories.labels==='object'&&!Array.isArray(categories.labels))for(const [key,val] of Object.entries(categories.labels).slice(0,120))d.categories.labels[str(key).slice(0,40)]=str(val).slice(0,65);
    d.categories.hidden=array(categories.hidden).map(str).slice(0,150);
    d.categories.order=array(categories.order).map(str).slice(0,150);
    for(const k of ['brand','heading','description','announcement'])d.appearance[k]=str(appearance[k]??d.appearance[k]).slice(0,k==='description'?500:200);
    for(const k of ['accent','gold','background'])d.appearance[k]=hex(appearance[k],d.appearance[k]);
    d.appearance.cardSize=Math.max(120,Math.min(280,Number(appearance.cardSize)||177));
    d.appearance.bannerUrl=https(appearance.bannerUrl)?str(appearance.bannerUrl):'';
    d.player.featuredKey=str(src.player?.featuredKey||'').slice(0,200);
    d.updatedAt=str(src.updatedAt||'');
    return d;
  }
  const published=()=>normalize(root.ALMOGHANI_PUBLISHED||defaults);
  function load(){try{const d=localStorage.getItem(KEY);return d?normalize(JSON.parse(d)):published();}catch{return published();}}
  function save(d){const val=normalize(d);val.updatedAt=new Date().toISOString();localStorage.setItem(KEY,JSON.stringify(val));return val;}
  function clearDraft(){try{localStorage.removeItem(KEY);}catch{}}
  const hasDraft=()=>{try{return localStorage.getItem(KEY)!==null;}catch{return false;}};
  function applyChannels(source,config){
    const cfg=normalize(config),removed=new Set(cfg.channels.deleted),result=[];
    for(const ch of source){
      if(removed.has(ch.key))continue;
      const patch=cfg.channels.edited[ch.key];let adjusted=ch;
      if(patch){const merged={...ch,...patch,key:ch.key,sources:patch.sources?.length?patch.sources:ch.sources,groups:patch.groups?.length?patch.groups:ch.groups};adjusted=cleanChannel(merged);}
      else adjusted=cleanChannel(ch);
      if(adjusted)result.push(adjusted);
    }
    for(const c of cfg.channels.added){if(!removed.has(c.key)&&!result.some(x=>x.key===c.key))result.push(c);}
    const ranks=new Map(cfg.channels.order.map((k,i)=>[k,i]));
    result.sort((a,b)=>(ranks.has(a.key)?ranks.get(a.key):999999)-(ranks.has(b.key)?ranks.get(b.key):999999)||a.name.localeCompare(b.name,'ar'));
    return result;
  }
  function parseM3U(raw){
    const rows=[],lines=str(raw).split(/\r?\n/),seen=new Set();let meta=null;
    const attr=(line,key)=>{const m=line.match(new RegExp('(?:^|\\s)'+key+'="([^"]*)"','i'));return m?m[1]:'';};
    for(const line0 of lines){
      const line=line0.trim();if(line.startsWith('#EXTINF:')){let comma=line.lastIndexOf(',');meta={name:comma>=0?line.slice(comma+1).trim():attr(line,'tvg-name'),country:attr(line,'tvg-country'),language:attr(line,'tvg-language'),logo:attr(line,'tvg-logo'),groups:attr(line,'group-title').split(';').filter(Boolean)};continue;}
      if(meta&&/^https:\/\//i.test(line)){
        const key=[meta.name,meta.country,line].join('|');if(!seen.has(key)){seen.add(key);const ch=cleanChannel({...meta,key:'custom_'+Date.now()+'_'+rows.length+'_'+Math.random().toString(36).slice(2,7),sources:[{url:line,name:meta.name}]});if(ch)rows.push(ch);}
        meta=null;
      }
    }return rows;
  }
  const exportScript=cfg=>'window.ALMOGHANI_PUBLISHED = '+JSON.stringify(normalize(cfg),null,2).replace(/</g,'\\u003c')+';\n';
  root.ALMOGHANI_CONTROL={KEY,defaults:clone(defaults),published,load,save,clearDraft,hasDraft,normalize,applyChannels,parseM3U,cleanChannel,arabic,https,exportScript};
})(window);
