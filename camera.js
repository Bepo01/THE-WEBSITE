const cur=document.getElementById('cur'),ring=document.getElementById('ring');
let mx=0,my=0,rx=0,ry=0;
document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;cur.style.left=mx-4+'px';cur.style.top=my-4+'px';});
(function loop(){rx+=(mx-rx)*.12;ry+=(my-ry)*.12;ring.style.left=rx+'px';ring.style.top=ry+'px';requestAnimationFrame(loop);})();
document.querySelectorAll('a,.spec-cell,.strip-block').forEach(el=>{
  el.addEventListener('mouseenter',()=>ring.classList.add('hover'));
  el.addEventListener('mouseleave',()=>ring.classList.remove('hover'));
});

const nav=document.getElementById('mainNav');
let lastY=0;
window.addEventListener('scroll',()=>{const y=window.scrollY;nav.classList.toggle('nav-hidden',y>lastY&&y>80);lastY=y;},{passive:true});

const loader=document.getElementById('loader');
const MIN=1600,t0=performance.now();
document.body.style.overflow='hidden';
requestAnimationFrame(()=>loader.classList.add('go'));
function dismiss(){const w=Math.max(0,MIN-(performance.now()-t0));setTimeout(()=>{loader.classList.add('out');document.body.style.overflow='';},w);}
document.readyState==='complete'?dismiss():window.addEventListener('load',dismiss,{once:true});
