import { useEffect, useRef, useState } from 'react'
import type { RestrictionId } from '../domain/types'
import { LeafIcon, PinIcon, SearchIcon, ChevronIcon, CheckIcon } from '../components/icons'
import './landing.css'
import { HomeButton } from '../components/HomeButton'

const categories: {id:RestrictionId;name:string;image:string;color:string;description:string}[] = [
 {id:'halal',name:'Halal',image:'food-salmon-nigiri.webp',color:'#c69b64',description:'Your faith belongs at the table. Explore dishes with the evidence behind their halal status.'},
 {id:'vegan',name:'Vegan',image:'food-edamame.webp',color:'#7e9c62',description:'Plant-based possibilities, with ingredient details to help you look a little closer.'},
 {id:'kosher',name:'Kosher',image:'food-tuna-nigiri.webp',color:'#879cb5',description:'Find the information that matters to your standards, including certification sources.'},
 {id:'vegetarian',name:'Vegetarian',image:'food-tamago.webp',color:'#c7a955',description:'Vegetables take the spotlight. Explore dishes through your vegetarian preferences.'},
 {id:'gluten_free',name:'Gluten free',image:'food-california-roll.webp',color:'#b58b75',description:'Look beyond the obvious ingredients. Missing preparation details stay unconfirmed.'},
 {id:'dairy_free',name:'Dairy free',image:'food-dragon-roll.webp',color:'#a19db6',description:'Keep dairy on your radar, from the main ingredients to sauces and finishing touches.'},
 {id:'peanut_free',name:'Peanut free',image:'food-ebi-nigiri.webp',color:'#b6a267',description:'Ingredient and cross-contact information matter. A photo alone cannot confirm an allergen exclusion.'},
]

export function Landing({onRestaurants,onScan,onLogin,signedIn,onHome}:{onRestaurants:(selected:RestrictionId[])=>void;onScan:()=>void;onLogin:()=>void;signedIn:boolean;onHome:()=>void}) {
 const [selected,setSelected]=useState<RestrictionId[]>([])
 const [active,setActive]=useState(1)
 const [paused,setPaused]=useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches)
 const [hovered,setHovered]=useState(false)
 const stage=useRef<HTMLDivElement>(null)
 const plates=useRef<(HTMLButtonElement|null)[]>([])
 const angle=useRef(0)
 useEffect(()=>{const media=matchMedia('(prefers-reduced-motion: reduce)');const update=()=>setPaused(media.matches);media.addEventListener('change',update);return()=>media.removeEventListener('change',update)},[])
 useEffect(()=>{
  let frame=0,last=0
  function paint(now:number){const el=stage.current;if(!el)return;const width=el.clientWidth;const mobile=width<600;const radiusX=width*.405;const radiusY=mobile?72:103;const size=mobile?85:126;const centerY=mobile?132:165;
   if(last && !paused && !hovered && !document.hidden) angle.current+=Math.min(now-last,50)*.00018
   last=now
   el.style.setProperty('--belt-phase', (angle.current*180/Math.PI)+'deg')
   plates.current.forEach((plate,i)=>{if(!plate)return;const theta=angle.current+i*Math.PI*2/categories.length;const depth=(Math.sin(theta)+1)/2;const scale=.73+depth*.27;const x=width/2+Math.cos(theta)*radiusX;const y=centerY+Math.sin(theta)*radiusY;plate.style.width=`${size}px`;plate.style.height=`${size}px`;plate.style.transform=`translate(${x-size/2}px,${y-size/2}px) scale(${scale})`;plate.style.zIndex=String(10+Math.round(depth*20))})
   frame=requestAnimationFrame(paint)
  }
  frame=requestAnimationFrame(paint);return()=>{cancelAnimationFrame(frame)}
 },[paused,hovered])
 function choose(index:number){setActive(index);const id=categories[index].id;setSelected(old=>old.includes(id)?old.filter(value=>value!==id):[...old,id])}
 const category=categories[active]
 return <div className="fd-landing">
  <a className="fd-skip" href="#fd-main">Skip to content</a>
  <header className="fd-nav fd-shell"><HomeButton onHome={onHome}/><nav aria-label="Main navigation"><button onClick={()=>onRestaurants(selected)}>Restaurants</button><button onClick={onScan}>Food scanner</button><a href="#fd-how">How it works</a></nav><button className="fd-login" onClick={onLogin}>{signedIn?'Open my account':'Log in'} <ChevronIcon size={15}/></button></header>
  <main id="fd-main">
   <section className="fd-hero">
    <p className="fd-eyebrow"><span/> GOOD FOOD HAS ROOM FOR EVERYONE</p>
    <h1>Every craving.<br/><em>Every consideration.</em><span className="fd-star" aria-hidden="true">✳</span></h1>
    <p className="fd-intro">Your beliefs. Your needs. Your next favorite place.<br/>Find a table that makes room for all of you.</p>
    <div className="fd-actions"><button className="fd-button fd-primary" onClick={()=>onRestaurants(selected)}><PinIcon size={18}/> Find your table <span>↗</span></button><button className="fd-button fd-secondary" onClick={onScan}>Scan a food item <span>→</span></button></div>
    <div className="fd-belt-shell">
     <div className="fd-belt-note" aria-hidden="true">A world of food,<br/><em>your way.</em><span>↘</span></div>
     <div ref={stage} className="fd-belt-stage" role="group" aria-label="Dietary category conveyor" onPointerEnter={()=>setHovered(true)} onPointerLeave={()=>setHovered(false)} onFocusCapture={()=>setHovered(true)} onBlurCapture={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node))setHovered(false)}}>
      <div className="fd-belt-track" aria-hidden="true"><div className="fd-belt-island"><span>THERE’S A PLACE</span><strong>for you here.</strong><i>✳</i></div></div>
      {categories.map((item,i)=><button className={`fd-plate ${selected.includes(item.id)?'fd-plate-selected':''}`} key={item.id} ref={node=>{plates.current[i]=node}} aria-pressed={selected.includes(item.id)} aria-label={`${item.name} preference`} onClick={()=>choose(i)} style={{'--plate-color':item.color} as React.CSSProperties}><img src={`/images/landing/${item.image}`} alt="" draggable={false}/><span className="fd-plate-label">{selected.includes(item.id)&&<CheckIcon size={12}/>} {item.name}</span></button>)}
     </div>
     <div className="fd-belt-controls"><span>Pick your preferences. We’ll bring them together.</span><button onClick={()=>setPaused(!paused)} aria-pressed={paused} aria-label={paused?'Play category conveyor':'Pause category conveyor'}>{paused?'▶':'Ⅱ'}</button></div>
    </div>
    <div className="fd-selection" aria-live="polite"><span className="fd-selection-title">{selected.length?`${selected.length} preference${selected.length===1?'':'s'} selected`:'A little more you. A lot more possibility.'}</span>{selected.length>0&&<button onClick={()=>setSelected([])}>Clear selections</button>}</div>
    <p className="fd-photo-note">Food images illustrate categories; they are not verified dietary matches.</p>
   </section>
   <section className="fd-values fd-shell" aria-label="Our approach"><span>01 <strong>All your needs, together</strong></span><span>02 <strong>Evidence behind every answer</strong></span><span>03 <strong>Clear when it’s not confirmed</strong></span></section>
   <section className="fd-discover fd-shell" id="fd-how"><div className="fd-section-top"><div><p className="fd-eyebrow">A LITTLE LESS GUESSWORK</p><h2>More time enjoying.<br/>Less time figuring it out.</h2></div><p>From a spontaneous lunch to your weekly shop,<br/>make your preferences part of the plan.</p></div>
    <div className="fd-feature-grid"><article className="fd-restaurant-feature"><img src="/images/landing/restaurant-interior.jpg" alt="Sunlit restaurant with greenery and shared tables"/><div className="fd-photo-overlay"><span>FIND YOUR NEXT FAVORITE</span><h3>Good company.<br/>Food that considers you.</h3><button className="fd-button" onClick={()=>onRestaurants(selected)}>Explore restaurant demo <span>↗</span></button></div><span className="fd-image-badge"><PinIcon size={14}/> Your next table awaits</span></article><article className="fd-scan-feature"><div><span className="fd-eyebrow">CURIOUS ABOUT YOUR PLATE?</span><h3>A closer look.<br/>A clearer choice.</h3><p>Start with a photo. Add a brand, a restaurant, or a little context, and explore the information behind your food.</p><button onClick={onScan}>Try the food scanner <span>→</span></button></div><img src="/images/landing/restaurant-bowl.jpg" alt="Colorful vegetable and grain bowl"/><span className="fd-scanner-corner" aria-hidden="true"/></article></div>
   </section>
   <section className="fd-details fd-shell"><div><p className="fd-eyebrow">YOUR PREFERENCES ARE PERSONAL</p><h2>One person.<br/><em>More than one filter.</em></h2><p>Faith, ingredients, lifestyle. Your needs can overlap.<br/>Your food search should understand that.</p></div><div className="fd-category-detail"><div className="fd-detail-top"><span style={{background:category.color}}/><strong>{category.name}</strong><span>{String(active+1).padStart(2,'0')} / 07</span></div><p>{category.description}</p><div className="fd-detail-tabs" aria-label="Explore dietary categories">{categories.map((item,i)=><button key={item.id} aria-label={`Read about ${item.name}`} aria-pressed={active===i} onClick={()=>setActive(i)}/>)}</div><small>When evidence is missing, Foodex says “Not confirmed.”</small></div></section>
  </main>
  <footer className="fd-footer fd-shell"><a className="fd-logo" href="#"><LeafIcon size={22}/>foodex.</a><p>Different needs. One shared table.</p><span>Built for UNHack · 2026</span></footer>
 </div>
}
