(function(){
  "use strict";
  function init(){
    const select=document.getElementById("classSelect");
    if(!select||select.dataset.customChooserReady)return;
    const wrapper=select.parentElement;
    if(!wrapper)return;
    select.dataset.customChooserReady="true";
    select.classList.add("class-select-native");
    select.tabIndex=-1;
    select.setAttribute("aria-hidden","true");

    const trigger=document.createElement("button");
    trigger.type="button";
    trigger.className="class-select-trigger";
    trigger.setAttribute("aria-haspopup","listbox");
    trigger.setAttribute("aria-expanded","false");
    trigger.setAttribute("aria-label","اختر الصف الدراسي");
    const label=document.createElement("span");
    trigger.append(label);

    const list=document.createElement("div");
    list.className="class-select-list";
    list.id="classSelectOptions";
    list.setAttribute("role","listbox");
    trigger.setAttribute("aria-controls",list.id);
    wrapper.insertBefore(trigger,select);
    wrapper.appendChild(list);

    let options=[];
    function refresh(){
      options=Array.from(select.options);
      const selected=select.options[select.selectedIndex];
      label.textContent=selected?selected.textContent.trim():"-- اختر الصف الدراسي --";
      list.replaceChildren();
      const available=options.filter(option=>option.value!=="");
      const shown=available.length?options:options.filter(option=>option.value==="");
      shown.forEach((option,index)=>{
        const item=document.createElement("button");
        item.type="button";
        item.className="class-select-option"+(option.value===""?" is-placeholder":"");
        item.setAttribute("role","option");
        item.setAttribute("aria-selected",String(option.value===select.value));
        item.textContent=option.textContent.trim();
        item.dataset.value=option.value;
        item.addEventListener("click",()=>choose(option.value));
        item.addEventListener("keydown",event=>{
          const buttons=Array.from(list.querySelectorAll(".class-select-option"));
          const current=buttons.indexOf(item);
          if(event.key==="ArrowDown"||event.key==="ArrowUp"){
            event.preventDefault();
            const step=event.key==="ArrowDown"?1:-1;
            buttons[(current+step+buttons.length)%buttons.length]?.focus();
          }else if(event.key==="Escape"){
            event.preventDefault();close(true);
          }
        });
        list.appendChild(item);
      });
      if(!available.length){
        const empty=document.createElement("div");
        empty.className="class-select-empty";
        empty.textContent="جارٍ تحميل الصفوف…";
        list.appendChild(empty);
      }
    }
    function open(focusFirst){
      refresh();
      list.classList.add("is-open");
      trigger.setAttribute("aria-expanded","true");
      if(focusFirst)list.querySelector(".class-select-option:not(.is-placeholder)")?.focus();
    }
    function close(returnFocus){
      list.classList.remove("is-open");
      trigger.setAttribute("aria-expanded","false");
      if(returnFocus)trigger.focus();
    }
    function choose(value){
      if(!Array.from(select.options).some(option=>option.value===value))return;
      select.value=value;
      select.dispatchEvent(new Event("input",{bubbles:true}));
      select.dispatchEvent(new Event("change",{bubbles:true}));
      refresh();
      close(true);
    }
    trigger.addEventListener("click",()=>list.classList.contains("is-open")?close(false):open(false));
    trigger.addEventListener("keydown",event=>{
      if(event.key==="ArrowDown"||event.key==="ArrowUp"){
        event.preventDefault();open(true);
      }else if(event.key==="Enter"||event.key===" "){
        event.preventDefault();list.classList.contains("is-open")?close(false):open(true);
      }else if(event.key==="Escape"){
        close(false);
      }
    });
    select.addEventListener("change",refresh);
    document.addEventListener("click",event=>{
      if(!wrapper.contains(event.target))close(false);
    });
    document.addEventListener("keydown",event=>{
      if(event.key==="Escape"&&list.classList.contains("is-open"))close(true);
    });
    const observer=new MutationObserver(refresh);
    observer.observe(select,{childList:true,subtree:true,characterData:true});
    refresh();
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});
  else init();
})();