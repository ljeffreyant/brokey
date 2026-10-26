(function(){
  const bars='<span><svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5" width="3" height="7" rx="1"/><rect x="10" y="2.5" width="3" height="9.5" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg> <svg width="26" height="12" viewBox="0 0 26 12" fill="none" stroke="currentColor"><rect x=".5" y=".5" width="22" height="11" rx="3.5" opacity=".5"/><rect x="2" y="2" width="16" height="8" rx="2" fill="currentColor" stroke="none"/><rect x="24" y="4" width="2" height="4" rx="1" fill="currentColor" stroke="none" opacity=".5"/></svg></span>';
  document.addEventListener('DOMContentLoaded',()=>document.querySelectorAll('.phone').forEach(p=>{
    p.insertAdjacentHTML('afterbegin','<div class="sb"><span>9:41</span>'+bars+'</div>');
    p.insertAdjacentHTML('beforeend','<div class="hi"></div>');
  }));
  window.IC={
    home:'<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11 12 3l9 8"/><path d="M5 10v10h14V10"/></svg>',
    chill:'<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 2v20M3.5 7l17 10M20.5 7l-17 10"/></svg>',
    shelf:'<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 20h18M5 20V9l4-4h6l4 4v11"/><path d="M9 14h6"/></svg>',
    week:'<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M5 20V11M12 20V4M19 20v-6"/></svg>',
    plus:'<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"><path d="M12 4v16M4 12h16"/></svg>',
    gear:'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1"/></svg>',
    back:'<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
    down:'<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>',
    del:'<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6h11a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-6-6z"/><path d="m12 9.5 5 5m0-5-5 5"/></svg>'
  };
  window.fries=(n,total,on,off,w=12,h=26)=>Array.from({length:total},(_,i)=>`<i style="display:inline-block;width:${w}px;height:${h}px;border-radius:4px;margin-right:4px;transform:rotate(${(i%3-1)*6}deg);${i<n?on:off}"></i>`).join('');
})();
