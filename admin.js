/* ALMOGHANI LIVE — comprehensive client-side admin. Publish needs a real GitHub token. */
(()=>{
'use strict';
const C=window.ALMOGHANI_CONTROL;
if(!C)throw Error('Missing control.js');
const el=id=>document.getElementById(id);
const BASE_ORDER=['all','saudi','gulf','religious','news','sports','movies','series','kids','general','entertainment','documentary','music','culture','education','animation','comedy','family','business','classic','cooking','science','auto','outdoor','lifestyle','travel','public','legislative','weather','relax','shop','interactive','other'];
const BASE_LABELS={all:'📺 جميع القنوات',saudi:'🇸🇦 السعودية',gulf:'🌙 الخليج',religious:'🕌 الدينية',news:'📰 الأخبار',sports:'⚽ الرياضة',movies:'🎬 الأفلام',series:'🎭 المسلسلات',kids:'🧸 الأطفال',general:'📺 العامة',entertainment:'✨ الترفيه',documentary:'🌍 الوثائقية',music:'🎵 الموسيقى',culture:'📚 الثقافية',education:'🎓 التعليمية',animation:'🎨 الرسوم',comedy:'😂 الكوميديا',family:'👨‍👩‍👧 الأسرة',business:'💼 الاقتصاد',classic:'📽️ الكلاسيكية',cooking:'🍳 المطبخ',science:'🔬 العلوم',auto:'🚘 السيارات',outdoor:'🏕️ الطبيعة',lifestyle:'🌸 نمط الحياة',travel:'✈️ السفر',public:'🏛️ المحلية',legislative:'🏛️ التشريعية',weather:'🌦️ الطقس',relax:'🌿 الاسترخاء',shop:'🛍️ التسوق',interactive:'🕹️ التفاعلية',other:'📡 أخرى'};
let source=[],cfg=C.load(),visible=75,activePanel='dashboard';
function textNode(t){return document.createTextNode(String(t??''));}
function node(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=String(text);return n;}
function button(text,cls,fn){const b=node('button','btn tiny '+(cls||''),text);b.type='button';b.addEventListener('click',fn);return b;}
function msg(text,bad=false){const n=el('noticeBar');n.textContent=text;n.className='show'+(bad?' bad':'');clearTimeout(msg.timeout);msg.timeout=setTimeout(()=>n.className='',6500);}
function save(message='✅ حُفظت التعديلات محليًا على هذا الجهاز'){
 try{cfg=C.save(cfg);refresh();msg(message);return true;}catch(e){msg('تعذر الحفظ: '+e.message,true);return false;}
}
function fields(c){return Array.isArray(c?.groups)?c.groups:Array.from(c?.groups||[]);}
function normalize(s){return String(s||'').normalize('NFKD').replace(/[\u064B-\u065F]/g,'').toLowerCase();}
function attr(line,k){const m=line.match(new RegExp('(?:^|\\s)'+k+'="([^"]*)"','i'));return m?.[1]||'';}
function splitExt(line){let quote=false;for(let i=0;i<line.length;i++){if(line[i]==='"')quote=!quote;if(line[i]===','&&!quote)return [line.slice(0,i),line.slice(i+1).trim()];}return [line,''];}
function parseSource(raw){
 const byId=new Map();let meta=null,extra=[];
 for(const l of String(raw||'').split(/\r?\n/)){
  const line=l.trim();
  if(line.startsWith('#EXTINF:')){
    const [attrs,name]=splitExt(line);const country=attr(attrs,'tvg-country').toUpperCase();
    meta={id:attr(attrs,'tvg-id'),name:name||attr(attrs,'tvg-name')||'قناة',country,language:attr(attrs,'tvg-language'),logo:attr(attrs,'tvg-logo'),groups:attr(attrs,'group-title').split(';').map(x=>x.trim()).filter(Boolean)};
    extra=[];continue;
  }
  if(meta&&line.startsWith('#')){extra.push(line);continue;}
  if(meta&&/^https:\/\//i.test(line)){
    const key=meta.id?'id:'+meta.id+'|'+meta.country:'name:'+normalize(meta.name)+'|'+meta.country;
    let ch=byId.get(key);if(!ch){ch={key,name:meta.name,country:meta.country,language:meta.language,logo:meta.logo,groups:[...meta.groups],sources:[],arabic:true};byId.set(key,ch);}
    if(!ch.sources.some(x=>x.url===line))ch.sources.push({url:line,name:meta.name,extras:[]});
    for(const g of meta.groups)if(!ch.groups.includes(g))ch.groups.push(g);
    meta=null;extra=[];
  }
 }
 return [...byId.values()].filter(C.arabic);
}
const allChannels=()=>C.applyChannels(source,cfg);
const label=id=>cfg.categories.labels[id]||cfg.categories.custom.find(x=>x.id===id)?.label||BASE_LABELS[id]||('📡 '+id);
function categories(){
 const ids=new Set(BASE_ORDER);for(const x of cfg.categories.custom)ids.add(x.id);
 for(const c of allChannels())for(const g of fields(c))ids.add(g);
 const customOrder=new Map(cfg.categories.order.map((k,i)=>[k,i]));
 return [...ids].sort((a,b)=>(customOrder.has(a)?customOrder.get(a):1000+BASE_ORDER.indexOf(a))-(customOrder.has(b)?customOrder.get(b):1000+BASE_ORDER.indexOf(b))||label(a).localeCompare(label(b),'ar'));
}
function groupMatches(ch,id){if(id==='all')return true;if(id==='saudi')return ch.country.split(/[;,]/).includes('SA');if(id==='gulf')return ch.country.split(/[;,]/).some(x=>['SA','AE','BH','KW','QA','OM'].includes(x));return fields(ch).includes(id);}
function sourceIsKey(key){return source.some(c=>c.key===key);}
function updateDropdowns(){
 for(const id of ['channelGroup','importCategory','channelFilter']){
  const select=el(id);const previous=select.value;select.replaceChildren();
  if(id==='channelFilter')select.add(new Option('كل الأقسام','all'));
  if(id==='importCategory')select.add(new Option('حسب الملف',''));
  for(const key of categories())if(key!=='all'&&!(id==='channelFilter'&&key==='all'))select.add(new Option(label(key),key));
  if([...select.options].some(x=>x.value===previous))select.value=previous;
 }
}
function refresh(){
 const channels=allChannels();el('statAll').textContent=channels.length.toLocaleString('en-US');
 el('statCategories').textContent=categories().length.toLocaleString('en-US');
 el('statAdded').textContent=cfg.channels.added.length.toLocaleString('en-US');
 el('statDeleted').textContent=cfg.channels.deleted.length.toLocaleString('en-US');
 el('draftState').textContent=C.hasDraft()?'✏️ توجد تعديلات محفوظة على هذا الجهاز؛ انشرها على GitHub لتظهر لكل الزوار.':'✅ المعروض هنا مطابق للإعدادات المنشورة، ولا توجد تغييرات محلية.';
 el('loadedState').textContent=source.length+' قناة أساسية';
 updateDropdowns();renderChannels();renderCategories();renderFeatured();renderPreview();
}
function selectPanel(id){activePanel=id;document.querySelectorAll('.panel').forEach(x=>x.classList.toggle('active',x.dataset.section===id));document.querySelectorAll('.nav button').forEach(x=>x.classList.toggle('active',x.dataset.panel===id));document.querySelector('.layout').scrollIntoView({behavior:'smooth',block:'start'});if(id==='channels')renderChannels();if(id==='categories')renderCategories();if(id==='featured')renderFeatured();if(id==='appearance')fillAppearance();}
function renderChannels(){
 const q=normalize(el('channelSearch').value).trim(),group=el('channelFilter').value||'all';
 let arr=allChannels().filter(c=>groupMatches(c,group)&&(!q||normalize(c.name+' '+c.country+' '+fields(c).join(' ')).includes(q)));
 const box=el('channelRows');box.replaceChildren();const length=Math.min(visible,arr.length);
 for(const ch of arr.slice(0,visible)){
   const line=node('div','item'),logo=node('span','');
   if(C.https(ch.logo)){const img=node('img');img.src=ch.logo;img.alt='';img.loading='lazy';img.referrerPolicy='no-referrer';img.onerror=()=>{img.replaceWith(node('span','', '📺'));};logo.append(img);}else logo.append(node('span','', '📺'));
   const title=node('div','detail');title.append(node('strong','',ch.name),node('small','',ch.country+' • '+fields(ch).map(label).join(' / ')+' • '+ch.sources.length+' بث'));
   const ops=node('div','ops');
   ops.append(button('✎ تعديل','',()=>openChannel(ch)),button('★ رئيسية','',()=>{cfg.player.featuredKey=ch.key;save('تم اختيار القناة الرئيسية');}));
   ops.append(button('↑','',()=>moveChannel(ch.key,-1)),button('↓','',()=>moveChannel(ch.key,1)));
   ops.append(button('حذف','danger',()=>deleteChannel(ch)));
   line.append(logo,title,ops);box.append(line);
 }
 if(!length)box.append(node('div','notice','لا توجد قنوات مطابقة.'));
 el('moreChannels').hidden=arr.length<=visible;el('channelCount').textContent='عرض '+length+' من '+arr.length;
}
function moveChannel(key,delta){
 const all=allChannels().map(c=>c.key);const idx=all.indexOf(key),next=idx+delta;
 if(idx<0||next<0||next>=all.length)return;[all[idx],all[next]]=[all[next],all[idx]];cfg.channels.order=all;save('تم تغيير ترتيب القناة');
}
function deleteChannel(ch){
 if(!confirm('حذف «'+ch.name+'» من قائمة القنوات؟'))return;
 if(sourceIsKey(ch.key)){cfg.channels.deleted=[...new Set([...cfg.channels.deleted,ch.key])];delete cfg.channels.edited[ch.key];}
 else cfg.channels.added=cfg.channels.added.filter(c=>c.key!==ch.key);
 cfg.channels.order=cfg.channels.order.filter(k=>k!==ch.key);
 if(cfg.player.featuredKey===ch.key)cfg.player.featuredKey='';
 save('تم حذف القناة');
}
function openChannel(ch=null){
 el('channelForm').hidden=false;el('formHeading').textContent=ch?'✎ تعديل القناة':'＋ إضافة قناة جديدة';
 el('channelKey').value=ch?.key||'';el('channelName').value=ch?.name||'';
 el('channelCountry').value=ch?.country||'SA';el('channelLanguage').value=ch?.language||'ara';
 el('channelLogo').value=ch?.logo||'';el('channelUrl').value=ch?.sources?.[0]?.url||'';
 el('channelAlternates').value=ch?.sources?.slice(1).map(x=>x.url).join('\n')||'';
 const group=fields(ch)[0]||'general';if([...el('channelGroup').options].some(x=>x.value===group))el('channelGroup').value=group;else el('channelGroup').value='general';
 el('channelForm').scrollIntoView({behavior:'smooth',block:'start'});
}
function saveChannel(e){
 e.preventDefault();
 const key=el('channelKey').value,name=el('channelName').value.trim(),country=el('channelCountry').value.trim().toUpperCase(),language=el('channelLanguage').value.trim(),logo=el('channelLogo').value.trim(),group=el('channelGroup').value;
 const urls=[el('channelUrl').value.trim(),...el('channelAlternates').value.split(/\r?\n/).map(x=>x.trim()).filter(Boolean)];
 if(!name||!urls.every(C.https)||logo&&!C.https(logo)){msg('أدخل اسم القناة وروابط HTTPS صحيحة.',true);return;}
 const record=C.cleanChannel({key:key||'custom_'+Date.now()+'_'+Math.random().toString(36).slice(2,9),name,country,language,logo,groups:[group],sources:urls.map(x=>({url:x,name,extras:[]}))});
 if(!record){msg('القنوات العربية فقط. تأكد من رمز الدولة والروابط.',true);return;}
 const existing=allChannels().find(x=>x.key!==record.key&&x.sources.some(s=>urls.includes(s.url)));
 if(existing&&!confirm('رابط البث موجود في قناة «'+existing.name+'». هل تريد إضافته مرة أخرى؟'))return;
 const ix=cfg.channels.added.findIndex(c=>c.key===record.key);
 if(ix>=0)cfg.channels.added[ix]=record;
 else if(sourceIsKey(record.key))cfg.channels.edited[record.key]={...record,groups:[...record.groups]};
 else cfg.channels.added.push(record);
 cfg.channels.deleted=cfg.channels.deleted.filter(x=>x!==record.key);
 if(save('✅ تم حفظ القناة')){el('channelForm').hidden=true;el('channelForm').reset();}
}
function categoryRowsData(){return categories();}
function renderCategories(){
 const box=el('categoryRows');box.replaceChildren();const cats=categoryRowsData();
 const counts=new Map(cats.map(x=>[x,allChannels().filter(c=>groupMatches(c,x)).length]));
 for(let i=0;i<cats.length;i++){
  const id=cats[i],isCustom=cfg.categories.custom.some(x=>x.id===id),line=node('div','item');
  const detail=node('div','detail');detail.append(node('strong','',label(id)),node('small','',id+' • '+counts.get(id)+' قناة • '+(cfg.categories.hidden.includes(id)?'مخفي':'ظاهر')));
  const ops=node('div','ops');
  ops.append(button('اسم القسم','',()=>renameCategory(id)),button('↑','',()=>moveCategory(id,-1)),button('↓','',()=>moveCategory(id,1)));
  if(id!=='all')ops.append(button(cfg.categories.hidden.includes(id)?'إظهار':'إخفاء','',()=>{const hidden=new Set(cfg.categories.hidden);if(hidden.has(id))hidden.delete(id);else hidden.add(id);cfg.categories.hidden=[...hidden];save('تم تحديث ظهور القسم');}));
  if(isCustom)ops.append(button('حذف','danger',()=>removeCategory(id)));
  line.append(detail,ops);box.append(line);
 }
}
function renameCategory(id){
 const name=prompt('اسم القسم الجديد',label(id));if(name===null)return;const trimmed=name.trim().slice(0,65);
 if(!trimmed)return msg('الاسم فارغ',true);
 cfg.categories.labels[id]=trimmed;const custom=cfg.categories.custom.find(x=>x.id===id);if(custom)custom.label=trimmed;save('تم تعديل اسم القسم');
}
function moveCategory(id,diff){
 const all=categories(),idx=all.indexOf(id),to=idx+diff;if(to<0||to>=all.length)return;
 [all[idx],all[to]]=[all[to],all[idx]];cfg.categories.order=all;save('تم تعديل ترتيب الأقسام');
}
function removeCategory(id){
 if(!confirm('حذف القسم «'+label(id)+'»؟ ستُنقل قنواته إلى القسم العام.'))return;
 const all=allChannels().filter(ch=>fields(ch).includes(id));
 for(const ch of all){
  const groups=fields(ch).filter(x=>x!==id);const patch={...ch,groups:groups.length?groups:['general']};
  const index=cfg.channels.added.findIndex(c=>c.key===ch.key);
  if(index>=0)cfg.channels.added[index]=patch;
  else cfg.channels.edited[ch.key]=patch;
 }
 cfg.categories.custom=cfg.categories.custom.filter(x=>x.id!==id);
 delete cfg.categories.labels[id];cfg.categories.order=cfg.categories.order.filter(x=>x!==id);cfg.categories.hidden=cfg.categories.hidden.filter(x=>x!==id);
 save('تم حذف القسم مع إبقاء قنواته');
}
function addCategory(e){
 e.preventDefault();const name=el('categoryName').value.trim().slice(0,65);
 const id=(el('categoryId').value.trim()||'custom_'+Math.random().toString(36).slice(2,9)).toLowerCase();
 if(!name||!/^[a-z][\w-]{2,35}$/.test(id)){msg('اسم القسم أو معرفه غير صحيح. استخدم حروفًا إنجليزية للمعرّف.',true);return;}
 if(categories().includes(id)){msg('هذا المعرف مستخدم بالفعل.',true);return;}
 cfg.categories.custom.push({id,label:name});cfg.categories.order=categories();if(save('تم إضافة القسم الجديد')){el('categoryForm').hidden=true;el('categoryForm').reset();}
}
function renderFeatured(){
 const select=el('featuredChannel'),current=cfg.player.featuredKey;select.replaceChildren();select.add(new Option('بدون قناة رئيسية',''));
 for(const ch of allChannels())select.add(new Option(ch.name+' • '+ch.country,ch.key));
 select.value=allChannels().some(c=>c.key===current)?current:'';
}
function fillAppearance(){
 const a=cfg.appearance;for(const [id,k] of [['appearanceBrand','brand'],['appearanceHeading','heading'],['appearanceDescription','description'],['appearanceAnnouncement','announcement'],['appearanceAccent','accent'],['appearanceGold','gold'],['appearanceBackground','background'],['appearanceCardSize','cardSize'],['appearanceBannerUrl','bannerUrl']])el(id).value=a[k]??'';
 renderPreview();
}
function renderPreview(){
 const a=cfg.appearance;const p=el('stylePreview');
 p.style.setProperty('--cyan',a.accent);p.style.background=a.background;p.style.borderColor=a.gold;
 el('previewTitle').style.color=a.accent;el('previewTitle').textContent=a.heading||a.brand;
 el('previewDescription').textContent=a.description;
 el('cardSizeLabel').textContent=(el('appearanceCardSize').value||a.cardSize)+'px';
}
function saveAppearance(e){
 e.preventDefault();const a={};
 for(const [id,k] of [['appearanceBrand','brand'],['appearanceHeading','heading'],['appearanceDescription','description'],['appearanceAnnouncement','announcement'],['appearanceAccent','accent'],['appearanceGold','gold'],['appearanceBackground','background'],['appearanceCardSize','cardSize'],['appearanceBannerUrl','bannerUrl']])a[k]=el(id).value;
 cfg.appearance={...cfg.appearance,...a};save('✅ تم حفظ مظهر الموقع');fillAppearance();
}
function fileDownload(name,data,mime='text/plain;charset=utf-8'){
 const blob=new Blob([data],{type:mime}),url=URL.createObjectURL(blob),a=node('a');
 a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
}
function exportBackup(){fileDownload('ALMOGHANI_LIVE_BACKUP.json',JSON.stringify({type:'ALMOGHANI_LIVE_BACKUP',exportedAt:new Date().toISOString(),config:cfg},null,2),'application/json;charset=utf-8');msg('تم تنزيل النسخة الاحتياطية');}
function quoteM3U(s){return String(s||'').replace(/[\r\n]+/g,' ').replace(/"/g,"'");}
function exportM3U(){
 const lines=['#EXTM3U'];
 for(const ch of allChannels()){
  for(const src of ch.sources){
   lines.push('#EXTINF:-1 tvg-name="'+quoteM3U(ch.name)+'" tvg-logo="'+quoteM3U(ch.logo)+'" tvg-country="'+quoteM3U(ch.country)+'" tvg-language="'+quoteM3U(ch.language)+'" group-title="'+quoteM3U(fields(ch).map(label).join(';'))+'",'+quoteM3U(ch.name));
   lines.push(src.url);
  }
 }
 fileDownload('ALMOGHANI_LIVE_ARABIC.m3u','\ufeff'+lines.join('\n')+'\n','audio/x-mpegurl;charset=utf-8');msg('تم تنزيل قائمة القنوات');
}
async function importBackup(){
 const f=el('backupFile').files[0];if(!f)return msg('اختر ملف النسخة الاحتياطية',true);
 try{
  if(f.size>12000000)throw Error('حجم النسخة أكبر من المسموح');
  const data=JSON.parse(await f.text());
  if(data.type!=='ALMOGHANI_LIVE_BACKUP'||!data.config)throw Error('نسخة غير متوافقة مع لوحة التحكم');
  if(!confirm('استبدال التعديلات الحالية بالنسخة الاحتياطية؟'))return;
  cfg=C.normalize(data.config);save('تم استعادة النسخة الاحتياطية');
 }catch(e){msg('فشل الاستيراد: '+e.message,true)}
}
async function importPlaylists(){
 const status=el('importStatus'),btn=el('doImport');btn.disabled=true;status.textContent='جارٍ قراءة القوائم...';
 try{
  const chunks=[],files=[...el('playlistFiles').files];if(files.length>50)throw Error('50 ملفًا حد أقصى');
  for(const file of files){if(file.size>10000000)throw Error('ملف '+file.name+' يتجاوز 10 ميجابايت');chunks.push(await file.text());}
  const manual=el('playlistText').value.trim();if(manual)chunks.push(manual);
  const url=el('playlistUrl').value.trim();if(url){if(!C.https(url))throw Error('رابط القائمة يجب أن يكون HTTPS');const ctl=new AbortController();const timeout=setTimeout(()=>ctl.abort(),25000);try{const r=await fetch(url,{signal:ctl.signal});if(!r.ok)throw Error('HTTP '+r.status);chunks.push(await r.text());}finally{clearTimeout(timeout);}}
  if(!chunks.length)throw Error('اختر ملف M3U أو الصق القائمة أو أدخل رابطها');
  const imported=chunks.flatMap(C.parseM3U);if(imported.length>6000)throw Error('الحد الأقصى 6000 قناة في المرة الواحدة');
  const group=el('importCategory').value,urls=new Set(allChannels().flatMap(c=>c.sources.map(s=>s.url)));
  let added=0,duplicate=0;
  for(const ch of imported){
   if(urls.has(ch.sources[0].url)){duplicate++;continue;}
   if(group)ch.groups=[group];
   cfg.channels.added.push(ch);for(const s of ch.sources)urls.add(s.url);added++;
  }
  if(added)save('استُوردت '+added+' قناة بنجاح');
  status.textContent='✅ أُضيفت '+added+' قناة عربية، وتُجاوز عن '+duplicate+' رابط مكرر. الملفات/القوائم المقروءة: '+chunks.length+'.';
  if(!added&&!duplicate)status.textContent='لا توجد قنوات عربية صالحة في الملفات المحددة. تأكد أن البيانات بصيغة M3U وأن الروابط HTTPS.';
 }catch(e){status.textContent='⚠️ '+e.message+(e.message==='Failed to fetch'?' — قد يمنع المصدر التحميل من المتصفح بسبب CORS؛ نزّل ملف M3U وارفعه من الجهاز.':'');msg('تعذر الاستيراد',true);}finally{btn.disabled=false;}
}
function downloadConfig(){fileDownload('site-config.js',C.exportScript(cfg),'text/javascript;charset=utf-8');msg('نُزّل ملف إعدادات النشر');}
function toBase64Unicode(s){
 const data=new TextEncoder().encode(s);let out='';for(let i=0;i<data.length;i+=8192)out+=String.fromCharCode(...data.slice(i,i+8192));return btoa(out);
}
async function publishGithub(){
 const token=el('githubToken').value.trim(),status=el('publishStatus'),btn=el('publishGitHub');
 if(!token)return msg('أدخل رمز GitHub Fine-grained PAT بصلاحية Contents للمتابعة',true);
 if(!confirm('نشر كل التعديلات الحالية على الموقع لجميع الزوار؟'))return;
 btn.disabled=true;status.textContent='جارٍ الاتصال بالمستودع للتحقق من الصلاحيات...';
 const url='https://api.github.com/repos/9z44yj4h8m-afk/Z/contents/site-config.js';
 const headers={'Accept':'application/vnd.github+json','Authorization':'Bearer '+token,'X-GitHub-Api-Version':'2022-11-28'};
 try{
  const current=await fetch(url,{headers,cache:'no-store'});if(!current.ok)throw Error('تعذرت قراءة الملف ('+current.status+'). تأكد من صلاحية الرمز والمستودع');
  const original=await current.json();const outgoing=C.normalize(cfg);outgoing.updatedAt=new Date().toISOString();
  const commit=await fetch(url,{method:'PUT',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify({message:'Publish ALMOGHANI LIVE dashboard settings',content:toBase64Unicode(C.exportScript(outgoing)),sha:original.sha,branch:'main'})});
  if(!commit.ok){const d=await commit.text();throw Error('رفض GitHub النشر ('+commit.status+'): '+d.slice(0,300));}
  cfg=outgoing;window.ALMOGHANI_PUBLISHED=outgoing;C.clearDraft();el('githubToken').value='';
  status.textContent='✅ نُشرت الإعدادات في مستودع GitHub بنجاح. تحقق من الموقع بعد اكتمال GitHub Pages.';refresh();msg('✅ تم نشر إعدادات الموقع للجميع');
 }catch(e){status.textContent='⚠️ فشل النشر: '+e.message;msg('تعذر النشر — لا تزال التعديلات محفوظة محليًا',true);}finally{btn.disabled=false;el('githubToken').value='';}
}
async function init(){
 try{
  const r=await fetch(new URL('channels-arabic.m3u',document.baseURI),{cache:'no-store'});
  if(!r.ok)throw Error('HTTP '+r.status);source=parseSource(await r.text());
  el('loadedState').textContent='تم تحميل '+source.length+' قناة من المصدر';
 }catch(e){el('loadedState').textContent='تعذّر جلب القنوات الأصلية: '+e.message;msg('تعذر قراءة قائمة القنوات، يمكنك إضافة قنوات يدويًا',true);}
 refresh();
}
el('gateForm').addEventListener('submit',e=>{
 e.preventDefault();
 if(el('pin').value!=='100100'){el('pinError').textContent='الرمز غير صحيح';el('pin').value='';return;}
 el('gate').hidden=true;el('workspace').hidden=false;el('saveLocal').hidden=false;el('topPublish').hidden=false;el('pin').value='';init();
});
document.querySelectorAll('[data-panel]').forEach(b=>b.addEventListener('click',()=>selectPanel(b.dataset.panel)));
document.querySelectorAll('[data-goto]').forEach(b=>b.addEventListener('click',()=>selectPanel(b.dataset.goto)));
el('manualRefreshSource').onclick=async()=>{
 const btn=el('manualRefreshSource');
 if(btn.disabled)return;
 btn.disabled=true;btn.textContent='جارٍ تحديث القائمة…';
 try{
  await init();
  const status=el('loadedState').textContent||'';
  msg(status.startsWith('تم تحميل')?'✅ تحدّثت قائمة القنوات يدويًا':'تعذّر تحديث القائمة الأصلية؛ لم تُحذف تعديلاتك',!status.startsWith('تم تحميل'));
 }finally{
  btn.disabled=false;btn.textContent='↻ تحديث قائمة الموقع يدويًا';
 }
};
el('saveLocal').onclick=()=>save();
el('topPublish').onclick=()=>selectPanel('publish');
el('newChannel').onclick=()=>openChannel();
el('channelForm').onsubmit=saveChannel;
el('cancelChannel').onclick=()=>el('channelForm').hidden=true;
el('channelSearch').oninput=()=>{visible=75;renderChannels();};
el('channelFilter').onchange=()=>{visible=75;renderChannels();};
el('moreChannels').onclick=()=>{visible+=75;renderChannels();};
el('deleteAll').onclick=()=>{
 const n=allChannels().length;
 if(!n)return msg('لا توجد قنوات');
 if(!confirm('سيتم حذف جميع القنوات ('+n+') من الموقع عند النشر! هل تريد المتابعة؟'))return;
 if(!confirm('تأكيد أخير: حذف كل القنوات والاحتفاظ بنسخة احتياطية قبل النشر موصى به. هل أنت متأكد؟'))return;
 cfg.channels.deleted=[...new Set([...cfg.channels.deleted,...source.map(ch=>ch.key)])];cfg.channels.added=[];cfg.channels.edited={};cfg.channels.order=[];cfg.player.featuredKey='';save('حُذفت جميع القنوات من النسخة المحلية — لم تُنشر بعد');
};
el('newCategory').onclick=()=>{el('categoryForm').hidden=false;el('categoryForm').scrollIntoView({behavior:'smooth'});};
el('cancelCategory').onclick=()=>el('categoryForm').hidden=true;
el('categoryForm').onsubmit=addCategory;
el('saveFeatured').onclick=()=>{cfg.player.featuredKey=el('featuredChannel').value;save('تم حفظ القناة الرئيسية');};
el('clearFeatured').onclick=()=>{cfg.player.featuredKey='';save('تم إلغاء القناة الرئيسية');};
el('appearanceForm').onsubmit=saveAppearance;
el('resetAppearance').onclick=()=>{if(!confirm('إرجاع إعدادات ألوان ومظهر الواجهة الأصلية؟'))return;cfg.appearance={...C.defaults.appearance};save('تم إرجاع المظهر الأصلي');fillAppearance();};
for(const id of ['appearanceHeading','appearanceDescription','appearanceAccent','appearanceGold','appearanceBackground','appearanceCardSize'])el(id).oninput=()=>{el('stylePreview').style.background=el('appearanceBackground').value;el('stylePreview').style.borderColor=el('appearanceGold').value;el('previewTitle').textContent=el('appearanceHeading').value;el('previewTitle').style.color=el('appearanceAccent').value;el('previewDescription').textContent=el('appearanceDescription').value;el('cardSizeLabel').textContent=el('appearanceCardSize').value+'px';};
el('doImport').onclick=importPlaylists;el('clearImport').onclick=()=>{el('playlistFiles').value='';el('playlistText').value='';el('playlistUrl').value='';el('importStatus').textContent='تم مسح حقول الاستيراد.';};
el('downloadBackup').onclick=exportBackup;el('downloadM3u').onclick=exportM3U;el('downloadConfig').onclick=downloadConfig;
el('restoreBackup').onclick=importBackup;
el('resetPublished').onclick=()=>{if(!confirm('مسح كل تعديلاتك المحلية والعودة إلى آخر إعدادات منشورة؟'))return;C.clearDraft();cfg=C.published();refresh();msg('تمت استعادة الإعدادات المنشورة');};
el('publishGitHub').onclick=publishGithub;el('exportForGithub').onclick=downloadConfig;
})();
