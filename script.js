(function(){
  // sticky header shadow
  var site=document.querySelector('.site');
  var onScroll=function(){ site.classList.toggle('is-scrolled', window.scrollY>8); };
  onScroll(); window.addEventListener('scroll', onScroll, {passive:true});

  // mobile nav
  var burger=document.getElementById('burger'), nav=document.getElementById('nav');
  burger.addEventListener('click', function(){
    var open=nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
  });
  nav.addEventListener('click', function(e){ if(e.target.tagName==='A'){ nav.classList.remove('open'); burger.setAttribute('aria-expanded',false);} });

  // scroll reveal
  var rv=document.querySelectorAll('.rv');
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){
      es.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target);} });
    },{rootMargin:'0px 0px -8% 0px', threshold:.08});
    rv.forEach(function(el,i){ el.style.transitionDelay=Math.min(i%3*70,140)+'ms'; io.observe(el); });
  } else { rv.forEach(function(el){el.classList.add('in');}); }
})();
