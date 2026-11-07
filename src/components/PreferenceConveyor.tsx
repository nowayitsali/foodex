import { useEffect, useRef, useState } from 'react'
import { Check, Pause, Play } from 'lucide-react'
import type { RestrictionId } from '../domain/types'
const dishes: {id:RestrictionId;name:string;photo:string}[]=[
  {id:'halal',name:'Halal',photo:'steak'}, {id:'vegan',name:'Vegan',photo:'lettuce'},
  {id:'kosher',name:'Kosher',photo:'fish'}, {id:'vegetarian',name:'Vegetarian',photo:'tomato'},
  {id:'gluten_free',name:'Gluten-free',photo:'rice'}, {id:'dairy_free',name:'Dairy-free',photo:'avocado'},
]
export function PreferenceConveyor({selected,onToggle}:{selected:RestrictionId[];onToggle:(id:RestrictionId)=>void}){
 const stage=useRef<HTMLDivElement>(null)
 const plates=useRef<(HTMLButtonElement|null)[]>([])
 const angle=useRef(0)
 const [paused,setPaused]=useState(false)
 useEffect(()=>{let frame=0,last=0;function paint(now:number){const node=stage.current;if(!node)return;const width=node.clientWidth;const size=width<360?64:78;if(last&&!paused&&!document.hidden)angle.current+=Math.min(now-last,50)*.00016;last=now;node.style.setProperty('--belt-phase',`${angle.current*180/Math.PI}deg`);plates.current.forEach((plate,i)=>{if(!plate)return;const a=angle.current+i*2*Math.PI/dishes.length;const depth=(Math.sin(a)+1)/2;plate.style.width=`${size}px`;plate.style.height=`${size}px`;plate.style.transform=`translate(${width/2+Math.cos(a)*width*.37-size/2}px,${116+Math.sin(a)*65-size/2}px) scale(${.78+depth*.22})`;plate.style.zIndex=String(2+Math.round(depth*10))});frame=requestAnimationFrame(paint)}frame=requestAnimationFrame(paint);return()=>cancelAnimationFrame(frame)},[paused])
 return <div className="fh-conveyor"><div ref={stage} className="fh-conveyor-stage" role="group" aria-label="Choose preferences from the food conveyor"><div className="fh-track" aria-hidden="true"><div><span>EVERY APPETITE</span><em>belongs here.</em></div></div>{dishes.map((dish,i)=><button type="button" key={dish.id} ref={node=>{plates.current[i]=node}} className="fh-plate" onClick={()=>onToggle(dish.id)} aria-pressed={selected.includes(dish.id)} aria-label={`${dish.name} preference`}><img src={`/images/landing/food-${dish.photo}-cutout.png`} alt="" draggable={false}/><span>{selected.includes(dish.id)&&<Check size={10}/>} {dish.name}</span></button>)}</div><div className="fh-conveyor-caption"><span>Pick a plate to add a preference.</span><button type="button" aria-label={paused?'Play food conveyor':'Pause food conveyor'} onClick={()=>setPaused(!paused)}>{paused?<Play size={11}/>:<Pause size={11}/>}</button></div><small>Illustrative dishes · dietary status needs evidence</small></div>
}
