(function (global) {
  'use strict';
  function create(options) {
    var stage=options.stage,bar=options.bar,handle=options.handle;
    var position=null,dragging=null;
    function bounds(){var s=stage.getBoundingClientRect(),b=bar.getBoundingClientRect(),i=Math.max(7,s.width*.018);return{width:s.width,height:s.height,barWidth:b.width,barHeight:b.height,inset:i,maxX:Math.max(i,s.width-b.width-i),maxY:Math.max(i,s.height-b.height-i)};}
    function place(x,y){
      if(bar.hidden||!stage.offsetWidth)return;var b=bounds();x=Math.max(b.inset,Math.min(b.maxX,x));y=Math.max(b.inset,Math.min(b.maxY,y));
      var s=stage.getBoundingClientRect(),cloud=stage.querySelector('.cloud-toolbar').getBoundingClientRect();
      if(x<cloud.right-s.left+7&&x+b.barWidth>cloud.left-s.left-7&&y<cloud.bottom-s.top+7&&y+b.barHeight>cloud.top-s.top-7)y=Math.min(b.maxY,cloud.bottom-s.top+9);
      bar.style.left=x+'px';bar.style.top=y+'px';bar.style.right='auto';bar.style.bottom='auto';position={x:x/b.width,y:y/b.height};
    }
    function constrain(){if(bar.hidden||!stage.offsetWidth)return;var b=bounds();if(position)place(position.x*b.width,position.y*b.height);else{var cloud=stage.querySelector('.cloud-toolbar').getBoundingClientRect(),s=stage.getBoundingClientRect(),x=b.maxX,y=Math.max(b.inset,b.height*.045);if(x<cloud.right-s.left+10)y=Math.max(y,cloud.bottom-s.top+8);place(x,y);}}
    function cancelDrag(){if(!dragging)return;var id=dragging.id;dragging=null;bar.classList.remove('is-dragging');try{if(handle.hasPointerCapture(id))handle.releasePointerCapture(id);}catch(_) {}}
    handle.addEventListener('pointerdown',function(e){if(dragging||e.button!==0)return;e.preventDefault();e.stopPropagation();var s=stage.getBoundingClientRect(),b=bar.getBoundingClientRect();dragging={id:e.pointerId,x:e.clientX,y:e.clientY,left:b.left-s.left,top:b.top-s.top};bar.classList.add('is-dragging');try{handle.setPointerCapture(e.pointerId);}catch(_) {}});
    handle.addEventListener('pointermove',function(e){if(!dragging||dragging.id!==e.pointerId)return;e.preventDefault();place(dragging.left+e.clientX-dragging.x,dragging.top+e.clientY-dragging.y);});
    ['pointerup','pointercancel','lostpointercapture'].forEach(function(type){handle.addEventListener(type,cancelDrag);});
    handle.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();});
    handle.addEventListener('keydown',function(e){var v={ArrowLeft:[-12,0],ArrowRight:[12,0],ArrowUp:[0,-12],ArrowDown:[0,12]};if(!v[e.key])return;e.preventDefault();var b=bounds(),p=position||{x:.2,y:.05};place(p.x*b.width+v[e.key][0],p.y*b.height+v[e.key][1]);});
    var resize=new ResizeObserver(function(){cancelDrag();constrain();});resize.observe(stage);global.addEventListener('blur',cancelDrag);
    function dispatch(target){
      var input=options.getInput(),key=input.key,count=input.count===2?2:1,button=key.indexOf('right')>=0?2:0,shift=key.indexOf('shift')===0;
      var s=stage.getBoundingClientRect(),r=target.getBoundingClientRect(),x=r.left+r.width/2-s.left,y=r.top+r.height/2-s.top,emitted=[];
      // Send simulated native input records without duplicating a business transaction.
      for(var i=0;i<count;i++){['down','up'].forEach(function(phase){var detail={phase:phase,button:button,shiftKey:shift,clickIndex:i+1,clickCount:count,x:x,y:y};emitted.push(detail);stage.dispatchEvent(new CustomEvent('dnf-remote-input',{detail:detail}));});}
      var pulse=document.createElement('div');pulse.className='click-input-pulse'+(count===2?' double-pulse':'');pulse.style.left=x+'px';pulse.style.top=y+'px';
      var label=document.createElement('span');label.textContent=(shift?'Shift + ':'')+(button===2?'右键':'左键')+' ×'+count;pulse.appendChild(label);stage.appendChild(pulse);setTimeout(function(){pulse.remove();},850);
      if(options.onInput)options.onInput({key:key,count:count,button:button,shiftKey:shift,events:emitted,target:target.getAttribute('aria-label')||target.textContent.trim().slice(0,24)});
    }
    return{constrain:constrain,cancel:cancelDrag,dispatch:dispatch,resetPosition:function(){position=null;constrain();},getPosition:function(){return position&&{x:position.x,y:position.y};}};
  }
  global.DNFClickUI={create:create};
})(window);
