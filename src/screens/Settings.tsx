import { useState } from 'react'
import { ArrowLeft, Check, HeartPulse, Leaf, LogOut, Plus, ShieldCheck, SlidersHorizontal, Sparkles, Utensils, X, MapPin, ScanLine, ArrowUpRight } from 'lucide-react'
import type { CustomRestriction, RestrictionId, RestrictionProfile } from '../domain/types'
import { CUISINES, RESTRICTIONS } from '../domain/restrictions'
import ChipGroup from '../components/ui/chip-group'
import './settings.css'
import './preference-home.css'
import { HomeButton } from '../components/HomeButton'
import { PreferenceConveyor } from '../components/PreferenceConveyor'

interface Props { profile: RestrictionProfile; demo: boolean; onSave: (p: RestrictionProfile) => Promise<void>; onSignOut: () => Promise<void>; onBack: () => void; home?: boolean; signedIn?: boolean; onHome?: () => void; onLogin?: () => void; onRestaurants?: (p: RestrictionProfile) => void; onScan?: () => void }
const sections = [
  {id:'religious',title:'Faith & values',short:'Faith',icon:Sparkles,description:'Make room for the standards you follow.',hint:'Choose the requirements that reflect your beliefs. Every selection is checked together.',tone:'faith'},
  {id:'lifestyle',title:'Lifestyle',short:'Lifestyle',icon:Leaf,description:'Food that feels like you.',hint:'Choose how you eat. These choices are treated as requirements, alongside your other restrictions.',tone:'lifestyle'},
  {id:'medical',title:'Ingredients & allergens',short:'Ingredients',icon:HeartPulse,description:'A little more attention to the details.',hint:'Select the ingredients you avoid. Missing ingredient or preparation information stays unconfirmed.',tone:'medical'},
  {id:'cuisines',title:'Favorite cuisines',short:'Cuisines',icon:Utensils,description:'More of the flavors you love.',hint:'Your favorites appear first. Cuisine preferences never override a dietary restriction.',tone:'cuisines'},
] as const
type Section = typeof sections[number]['id']
function customItems(text:string,category:CustomRestriction['category']):CustomRestriction[]{const seen=new Set<string>();return text.split(/[,;\n]/).map(s=>s.trim()).filter(s=>s&&!seen.has(s.toLowerCase())&&seen.add(s.toLowerCase())).map(text=>({category,text}))}
function profileKey(p:RestrictionProfile){return JSON.stringify({restrictions:[...p.restrictions].sort(),custom:p.custom.map(c=>`${c.category}:${c.text}`).sort(),cuisines:[...p.cuisines].sort()})}

export function Settings({profile,demo,onSave,onSignOut,onBack,home=false,signedIn=false,onHome,onLogin,onRestaurants,onScan}:Props){
  const [selected,setSelected]=useState<RestrictionId[]>([...profile.restrictions])
  const [cuisines,setCuisines]=useState([...profile.cuisines])
  const [other,setOther]=useState({religious:profile.custom.filter(c=>c.category==='religious').map(c=>c.text).join(', '),medical:profile.custom.filter(c=>c.category==='medical').map(c=>c.text).join(', ')})
  const [baseline,setBaseline]=useState(()=>profileKey(profile))
  const [saving,setSaving]=useState(false)
  const [saved,setSaved]=useState(false)
  const [error,setError]=useState<string|null>(null)
  const [signingOut,setSigningOut]=useState(false)
  const [accountError,setAccountError]=useState<string|null>(null)
  const custom=[...customItems(other.religious,'religious'),...customItems(other.medical,'medical')]
  const nextProfile:RestrictionProfile={restrictions:RESTRICTIONS.filter(r=>selected.includes(r.id)).map(r=>r.id),custom,cuisines:CUISINES.filter(c=>cuisines.includes(c))}
  const dirty=profileKey(nextProfile)!==baseline
  const count=selected.length+custom.length
  function changed(){setSaved(false);setError(null)}
  function groupCount(id:Section){return id==='cuisines'?cuisines.length:RESTRICTIONS.filter(r=>r.category===id&&selected.includes(r.id)).length+custom.filter(c=>c.category===id).length}
  async function save(){if(saving||!dirty)return;setSaving(true);setError(null);const snapshot=nextProfile;try{await onSave(snapshot);setBaseline(profileKey(snapshot));setSaved(true)}catch(e){setError(e instanceof Error?e.message:'Could not save. Please try again.')}finally{setSaving(false)}}
  async function start(destination:'restaurants'|'scan') {
    if(saving)return
    setSaving(true);setError(null)
    const snapshot=nextProfile
    try { await onSave(snapshot);setBaseline(profileKey(snapshot));setSaved(true);if(destination==='restaurants')onRestaurants?.(snapshot);else onScan?.() }
    catch(e){setError(e instanceof Error?e.message:'Could not apply your preferences. Please try again.')}
    finally {setSaving(false)}
  }
  async function leaveAccount(){
    if(signingOut)return
    setSigningOut(true);setAccountError(null)
    try{await onSignOut()}catch(e){setAccountError(e instanceof Error?e.message:'Could not sign out. Please try again.')}finally{setSigningOut(false)}
  }
  function removeCustom(item:CustomRestriction){setOther(old=>({...old,[item.category]:customItems(old[item.category],item.category).filter(c=>c.text!==item.text).map(c=>c.text).join(', ')}));changed()}
  function clearAll(){setSelected([]);setCuisines([]);setOther({religious:'',medical:''});changed()}
  return <div className={home?'food-home':''}>
    {home&&<header className="fh-nav"><HomeButton onHome={onHome??(()=>window.scrollTo({top:0,behavior:'instant'}))}/><nav className="fh-nav-links" aria-label="Main navigation"><button disabled={saving} onClick={()=>start('restaurants')}>Restaurants</button><button disabled={saving} onClick={()=>start('scan')}>Scan food</button><button className="fh-login" disabled={signingOut} onClick={()=>signedIn?leaveAccount():onLogin?.()}>{signingOut?'Signing out…':signedIn?'Sign out':'Log in'} {signedIn?<LogOut size={13}/>:<ArrowUpRight size={13}/>}</button></nav></header>}
    <main className="food-settings">
    {accountError&&<p className="fs-account-error" role="alert">{accountError}</p>}
    {!home&&<button className="fs-back" onClick={onBack}><ArrowLeft size={15}/> Back to scanner</button>}
    {home?<>
      <section className="fh-hero"><div className="fh-hero-copy"><p className="fs-eyebrow">DIFFERENT NEEDS. ONE SHARED TABLE.</p><h1>Good food.<br/><em>All of you.</em></h1><p>Your beliefs, your ingredients, your way of eating. Choose what matters, then find your next bite.</p><div className="fh-actions"><button disabled={saving} onClick={()=>start('restaurants')}><MapPin size={16}/> Find restaurants <ArrowUpRight size={14}/></button><button disabled={saving} onClick={()=>start('scan')}><ScanLine size={16}/> Scan food</button></div></div><PreferenceConveyor selected={selected} onToggle={id=>{setSelected(old=>old.includes(id)?old.filter(value=>value!==id):[...old,id]);changed()}}/></section>
      <div className="fh-editor-heading"><div><h2>Make room for your preferences.</h2><p>Choose as many as you need. Every restriction is checked together.</p></div><span><ShieldCheck size={14}/> Your choices, together</span></div>
    </>:<div className="fs-heading"><div><p className="fs-eyebrow">A LITTLE MORE PERSONAL</p><h1>Your plate. <em>Your preferences.</em></h1><p>Make Foodex feel like you. Bring all your food needs together.</p></div><span className="fs-heading-icon"><SlidersHorizontal size={27} strokeWidth={1.5}/></span></div>}
    <div className="fs-layout"><div className="fs-editor fs-preference-card">
      {sections.map((section,index)=>{
        const category=section.id
        const Icon=section.icon
        return <section key={category} className={`fs-panel fs-tone-${section.tone}`} aria-labelledby={`fs-heading-${category}`}>
          <div className="fs-panel-heading"><div className="fs-subsection-title"><span className="fs-category-icon"><Icon size={22} strokeWidth={1.6}/></span><h2 id={`fs-heading-${category}`}>{section.title}</h2></div><span className="fs-category-number">{groupCount(category) ? `${groupCount(category)} selected` : `0${index+1}`}</span></div>
          <p className="fs-panel-description">{section.hint}</p>
          <ChipGroup label={section.title} options={category==='cuisines'?CUISINES.map(c=>({value:c,label:c})):RESTRICTIONS.filter(r=>r.category===category).map(r=>({value:r.id,label:r.label}))} value={category==='cuisines'?cuisines:selected.filter(id=>RESTRICTIONS.find(r=>r.id===id)?.category===category)} onValueChange={values=>{if(category==='cuisines')setCuisines(values);else setSelected(old=>[...old.filter(id=>RESTRICTIONS.find(r=>r.id===id)?.category!==category),...values as RestrictionId[]]);changed()}}/>
          {(category==='religious'||category==='medical')&&<label className="fs-custom"><span><Plus size={14}/> Something else?</span><input value={other[category]} onChange={e=>{setOther({...other,[category]:e.target.value});changed()}} placeholder={category==='religious'?'For example: Jain, no beef':'For example: mustard, celery'}/><small>Add your own requirements, separated by commas.</small></label>}
          <div className="fs-panel-footnote"><ShieldCheck size={15}/><span>{category==='cuisines'?'Favorites influence order, never eligibility.':'All selected restrictions are applied together, strictly.'}</span></div>
        </section>
      })}
      <div className="fs-inline-save"><span className="fs-save-note" role="status" aria-live="polite">{saved&&!dirty?'Saved':''}</span><button type="button" onClick={save} disabled={saving||!dirty}>{saving?'Saving…':<>Save preferences <Check size={14}/></>}</button>{error&&<p role="alert" className="fs-error">{error}</p>}</div>
    </div>
    <aside className="fs-summary" aria-label="Your selection summary"><div className="fs-summary-heading"><span className="fs-summary-icon"><Leaf size={21}/></span><span>YOUR FOOD PROFILE</span></div><h2>A table that<br/>considers <em>you.</em></h2><p>{count?`${count} dietary requirement${count===1?'':'s'}, brought together.`:'Every good match starts with your preferences.'}</p>
      <div className="fs-summary-items">{sections.map(item=>{const rules=RESTRICTIONS.filter(r=>r.category===item.id&&selected.includes(r.id));const extras=custom.filter(c=>c.category===item.id);const total=groupCount(item.id);return total>0&&<section key={item.id}><h3>{item.title}<span>{total}</span></h3><div>{item.id==='cuisines'?cuisines.map(c=><button key={c} onClick={()=>{setCuisines(old=>old.filter(v=>v!==c));changed()}} aria-label={`Remove ${c} cuisine`}>{c}<X size={11}/></button>):<>{rules.map(r=><button key={r.id} onClick={()=>{setSelected(old=>old.filter(id=>id!==r.id));changed()}} aria-label={`Remove ${r.label}`}>{r.label}<X size={11}/></button>)}{extras.map(c=><button key={c.text} onClick={()=>removeCustom(c)} aria-label={`Remove ${c.text}`}>{c.text}<X size={11}/></button>)}</>}</div></section>})}</div>
      {!count&&!cuisines.length&&<div className="fs-empty"><span>✳</span><p>Pick a few preferences.<br/>You’ll see your profile take shape here.</p></div>}
      <div className="fs-summary-note"><ShieldCheck size={16}/><p>Ingredients and “may contain” findings are checked against every restriction. Missing evidence stays unconfirmed.</p></div><button className="fs-clear" disabled={!count&&!cuisines.length} onClick={clearAll}>Clear all selections</button>{home&&<div className="fh-summary-actions"><button disabled={saving} onClick={()=>start('restaurants')}><MapPin size={15}/> Find restaurants</button><button disabled={saving} onClick={()=>start('scan')}><ScanLine size={15}/> Scan food</button></div>}
    </aside></div>

    {!home&&<section className="fs-account" id="fh-account"><div><h2>Your account</h2><p>{home&&!signedIn?'Your preferences stay on this device. Log in to save them to your account.':demo?'Preferences are stored on this device. Leaving demo mode clears them.':'Your saved preferences stay with your account.'}</p></div><button disabled={signingOut} onClick={async()=>{if(home&&!signedIn){onLogin?.();return}setSigningOut(true);try{await onSignOut()}catch(e){setError(e instanceof Error?e.message:'Could not sign out. Please try again.');setSigningOut(false)}}}><LogOut size={15}/>{home&&!signedIn?'Log in':signingOut?'Signing out…':demo?'Leave demo mode':'Sign out'}</button></section>}
    {home&&<footer className="fh-footer"><span>Foodex · A place for every appetite.</span><span>UNHack 2026 · Restaurant results use demo data</span></footer>}
  </main></div>
}
