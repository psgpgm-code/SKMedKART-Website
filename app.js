const WA='917200673944',$=x=>document.getElementById(x);$('year').textContent=new Date().getFullYear();$('menu').onclick=()=>document.querySelector('nav').classList.toggle('open');const data=[['Human Medicines','Tablets, capsules, syrups'],['Veterinary Medicines','Animal healthcare'],['Baby Products','Baby care essentials'],['Healthcare','Health products'],['Medical Devices','Nebulizer, supports and devices'],['Cosmetics','Personal care']];function wa(t){return 'https://wa.me/'+WA+'?text='+encodeURIComponent(t)}$('wa').href=wa('Hello Sri Krishna Medicals, I would like to order medicines.');$('search').oninput=e=>{let q=e.target.value.toLowerCase().trim();$('results').innerHTML=q?data.filter(x=>(x[0]+' '+x[1]).toLowerCase().includes(q)).map(x=>'<div class="result"><b>'+x[0]+'</b><br><small>'+x[1]+'</small></div>').join(''):''};document.querySelectorAll('[data-cat]').forEach(b=>b.onclick=()=>{location.hash='order';$('meds').value=b.dataset.cat+' - ';setTimeout(()=>$('meds').focus(),200)});$('prescription').onchange=e=>$('file').textContent=e.target.files[0]?'Selected: '+e.target.files[0].name:'No prescription selected';$('form').onsubmit=async e=>{
  e.preventDefault();
  let f=$('prescription').files[0],m=`SKMedKART Order\n\nName: ${$('name').value}\nMobile: ${$('mobile').value}\nAddress: ${$('address').value}\n\nMedicine / Products:\n${$('meds').value}`;
  if(f){
    m+='\n\nPrescription: '+f.name;
    // On Android/Chrome, use the native share sheet so the actual
    // prescription file can be shared to WhatsApp as an attachment.
    try{
      if(navigator.share && navigator.canShare && navigator.canShare({files:[f]})){
        await navigator.share({title:'SKMedKART Order',text:m,files:[f]});
        return;
      }
    }catch(err){
      if(err && err.name==='AbortError') return;
    }
    // Fallback for browsers that cannot share files.
    m+='\nPlease attach the selected prescription file in WhatsApp before sending.';
  }
  location.href=wa(m);
};let dp;addEventListener('beforeinstallprompt',e=>{e.preventDefault();dp=e;$('install').hidden=false});$('install').onclick=async()=>{if(dp){dp.prompt();await dp.userChoice;dp=null;$('install').hidden=true}};if('serviceWorker'in navigator)addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));