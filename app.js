const WA='917200673944';
const SUPABASE_URL='https://uyobhzkcvfnrioppwkrv.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_5zmngPN80O2CPgtNhGNhEQ_elEQpz9E';
const $=x=>document.getElementById(x);
$('year').textContent=new Date().getFullYear();
$('menu').onclick=()=>document.querySelector('nav').classList.toggle('open');
const wa=t=>'https://wa.me/'+WA+'?text='+encodeURIComponent(t);
$('wa').href=wa('Hello Sri Krishna Medicals, I would like to order medicines.');

const categoryInfo=[['Human Medicines','Tablets, capsules, syrups'],['Veterinary','Animal healthcare'],['Baby Care','Baby care essentials'],['Health','Health products'],['Devices','Nebulizer, supports and devices'],['Cosmetics','Personal care']];
let catalogue=[];
let orderCategory='Human Medicines';
let selected=[];

const esc=s=>String(s??'').replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[m]));

// Website uses the same live Supabase public catalogue as the SKMedKART Customer App.
async function loadCatalogue(){
  try{
    const r=await fetch(SUPABASE_URL+'/rest/v1/public_catalog?select=id,name,category,price,mrp,stock,rx,active,updated_at&active=eq.true&stock=gt.0&order=name',{headers:{apikey:SUPABASE_PUBLISHABLE_KEY,Accept:'application/json'}});
    if(!r.ok)throw new Error('Catalogue HTTP '+r.status);
    const data=await r.json();
    catalogue=(data||[]).map(p=>({id:p.id,name:p.name,cat:p.category||'Human Medicines',price:Number(p.price||0),mrp:Number(p.mrp||0),stock:Math.max(0,Number(p.stock||0)),rx:p.rx===true,active:p.active!==false})).filter(p=>p.active&&p.stock>0);
    renderOrderProducts();
  }catch(e){
    console.error('Catalogue load failed:',e);
    $('orderProducts').innerHTML='<div class="catalogEmpty">Unable to load the live product catalogue. You can still type an additional medicine/product request below.</div>';
  }
}

function categoryMatches(p,cat){
  const c=String(p.cat||'').toLowerCase();
  if(cat==='Veterinary')return c==='veterinary'||c==='veterinary medicines';
  return c===String(cat).toLowerCase();
}

function renderOrderProducts(){
  const q=($('orderSearch').value||'').toLowerCase().trim();
  const arr=catalogue.filter(p=>categoryMatches(p,orderCategory)&&(!q||p.name.toLowerCase().includes(q)));
  if(!arr.length){$('orderProducts').innerHTML='<div class="catalogEmpty">No products found in this category.</div>';return;}
  $('orderProducts').innerHTML=arr.map(p=>{
    const picked=selected.find(x=>x.id===p.id);
    const price=p.price>0?'₹'+p.price:'Price on confirmation';
    return `<div class="productRow"><div class="productInfo"><b>${esc(p.name)}</b><small>${esc(p.cat)}${p.rx?' • Prescription required':''}</small><span>${price} • Stock ${p.stock}</span></div><button type="button" class="addProduct" onclick="addProduct('${esc(p.id)}')">${picked?'✓ Added':'＋ Add'}</button></div>`;
  }).join('');
}

window.addProduct=id=>{
  const p=catalogue.find(x=>x.id===id);if(!p)return;
  const x=selected.find(y=>y.id===id);
  if(x){if(x.qty>=p.stock)return alert('Only '+p.stock+' available.');x.qty++;}
  else selected.push({id:p.id,name:p.name,cat:p.cat,price:p.price,rx:p.rx,qty:1});
  renderSelected();renderOrderProducts();
};
window.changeSelected=(id,d)=>{
  const x=selected.find(y=>y.id===id);const p=catalogue.find(y=>y.id===id);if(!x)return;
  x.qty+=d;if(p&&x.qty>p.stock)x.qty=p.stock;if(x.qty<1)selected=selected.filter(y=>y.id!==id);
  renderSelected();renderOrderProducts();
};
window.removeSelected=id=>{selected=selected.filter(x=>x.id!==id);renderSelected();renderOrderProducts();};

function renderSelected(){
  if(!selected.length){$('selectedProducts').innerHTML='<div class="catalogEmpty">No products selected yet.</div>';return;}
  $('selectedProducts').innerHTML=selected.map(x=>`<div class="selectedRow"><div><b>${esc(x.name)}</b><small>${esc(x.cat)}${x.rx?' • Prescription required':''}</small></div><div class="qty"><button type="button" onclick="changeSelected('${esc(x.id)}',-1)">−</button><b>${x.qty}</b><button type="button" onclick="changeSelected('${esc(x.id)}',1)">+</button><button type="button" class="removeProduct" onclick="removeSelected('${esc(x.id)}')">×</button></div></div>`).join('');
}

$('orderSearch').oninput=renderOrderProducts;
document.querySelectorAll('[data-order-cat]').forEach(b=>b.onclick=()=>{
  orderCategory=b.dataset.orderCat;
  document.querySelectorAll('[data-order-cat]').forEach(x=>x.classList.toggle('active',x===b));
  $('orderSearch').value='';
  renderOrderProducts();
});

$('search').oninput=e=>{
  const q=e.target.value.toLowerCase().trim();
  if(!q){$('results').innerHTML='';return;}
  const matches=catalogue.filter(p=>(p.name+' '+p.cat).toLowerCase().includes(q)).slice(0,10);
  const cats=categoryInfo.filter(x=>(x[0]+' '+x[1]).toLowerCase().includes(q));
  $('results').innerHTML=[...cats.map(x=>`<div class="result"><b>${esc(x[0])}</b><br><small>${esc(x[1])}</small></div>`),...matches.map(p=>`<div class="result"><b>${esc(p.name)}</b><br><small>${esc(p.cat)} • Stock ${p.stock}</small></div>`)].join('')||'<div class="result">No matching product found.</div>';
};

document.querySelectorAll('[data-cat]').forEach(b=>b.onclick=()=>{
  const cat=b.dataset.cat==='Veterinary Medicines'?'Veterinary':b.dataset.cat;
  orderCategory=cat;
  document.querySelectorAll('[data-order-cat]').forEach(x=>x.classList.toggle('active',x.dataset.orderCat===cat));
  location.hash='order';
  $('orderSearch').value='';
  renderOrderProducts();
  setTimeout(()=>$('orderSearch').focus(),250);
});

$('prescription').onchange=e=>$('file').textContent=e.target.files[0]?'Selected: '+e.target.files[0].name:'No prescription selected';

function orderText(){
  const items=selected.map(x=>`• ${x.name} × ${x.qty}`).join('\n');
  const extra=$('extraMeds').value.trim();
  return `SKMedKART Order\n\nName: ${$('name').value.trim()}\nMobile: ${$('mobile').value.trim()}\nAddress: ${$('address').value.trim()}\n\nMedicine / Products:\n${items||'• No catalogue product selected'}${extra?'\n\nAdditional Request:\n'+extra:''}`;
}

$('form').onsubmit=async e=>{
  e.preventDefault();
  if(!selected.length&&!$('extraMeds').value.trim())return alert('Please select at least one product or type an additional medicine/product request.');
  const f=$('prescription').files[0];
  const text=orderText();
  const shareText=text+(f?'\n\n📋 Prescription: Attached with this order.':'');
  try{
    // Android/Chrome can share the real image/PDF file together with the order text.
    if(f&&navigator.share&&navigator.canShare){
      const shareData={title:'SKMedKART Order',text:shareText,files:[f]};
      if(navigator.canShare(shareData)){
        await navigator.share(shareData);
        return;
      }
    }
  }catch(err){
    if(err?.name==='AbortError')return;
    console.warn('File share unavailable:',err);
  }
  if(f){
    alert('WhatsApp will receive the order text now. Please attach the selected prescription file in WhatsApp before sending.');
  }
  location.href=wa(shareText+(f?'\n\nPlease attach the prescription file before sending.':''));
};

let dp;addEventListener('beforeinstallprompt',e=>{e.preventDefault();dp=e;$('install').hidden=false});
$('install').onclick=async()=>{if(dp){dp.prompt();await dp.userChoice;dp=null;$('install').hidden=true}};
if('serviceWorker'in navigator)addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
loadCatalogue();
