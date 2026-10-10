import { useEffect, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { CheckCircle2, RotateCcw, X } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import mark from '../../assets/brand/moolya-mark.svg'
import { cn } from '../../lib/cn'
import { usePrototype } from '../../hooks/usePrototype'

export function MoolyaLogo({light=false}:{light?:boolean}){return <span className={cn('logo',light&&'logo-light')}><img src={mark} alt=""/><span>Moolya</span></span>}
export function Button({className,variant='primary',...props}:ButtonHTMLAttributes<HTMLButtonElement>&{variant?:'primary'|'secondary'|'ghost'|'dark'}){return <button className={cn('button',`button-${variant}`,className)} {...props}/>}
export function Badge({children,tone='neutral'}:{children:ReactNode;tone?:string}){return <span className={cn('badge',`badge-${tone}`)}>{children}</span>}
export function StatusChip({status}:{status:string}){return <Badge tone={status}>{status.replaceAll('_',' ')}</Badge>}
export function QCVerifiedBadge(){return <span className="qc-badge"><CheckCircle2 size={14}/> QC verified</span>}
export function MetricCard({label,value,note,icon}:{label:string;value:ReactNode;note?:string;icon?:ReactNode}){return <div className="metric-card"><div className="metric-top"><span>{label}</span>{icon}</div><strong>{value}</strong>{note&&<small>{note}</small>}</div>}
export function SectionHeading({eyebrow,title,copy,action}:{eyebrow?:string;title:string;copy?:string;action?:ReactNode}){return <div className="section-heading"><div>{eyebrow&&<span className="eyebrow">{eyebrow}</span>}<h2>{title}</h2>{copy&&<p>{copy}</p>}</div>{action}</div>}
export function EmptyState({title,copy}:{title:string;copy:string}){return <div className="empty"><div className="empty-mark">M</div><h3>{title}</h3><p>{copy}</p></div>}
export function PrototypeDataLabel(){return <span className="prototype-label">Prototype data</span>}
export function DemoDisclaimer(){return <div className="disclaimer">All names, prices and operating data shown are fictional prototype data.</div>}
export function Modal({open,onClose,title,children}:{open:boolean;onClose:()=>void;title:string;children:ReactNode}){if(!open)return null;return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}><div className="modal" role="dialog" aria-modal="true" onMouseDown={e=>e.stopPropagation()}><div className="modal-head"><h2>{title}</h2><button className="icon-button" onClick={onClose} aria-label="Close"><X/></button></div>{children}</div></div>}
export function PrototypeRoleSwitcher(){const {state,dispatch}=usePrototype();const nav=useNavigate();const loc=useLocation();const go=(role:'consumer'|'producer'|'admin')=>{dispatch({type:'SET_ROLE',payload:role});nav(role==='consumer'?'/':role==='producer'?'/producer':'/admin')};return <div className="role-switcher"><span>Prototype mode</span><div>{(['consumer','producer','admin'] as const).map(r=><button key={r} className={state.selectedPrototypeRole===r?'active':''} onClick={()=>go(r)}>{r==='admin'?'Operations':r[0].toUpperCase()+r.slice(1)}</button>)}<button className={loc.pathname==='/demo'?'active':''} onClick={()=>nav('/demo')}>Demo</button><button className="reset-mini" onClick={()=>dispatch({type:'RESET_PROTOTYPE'})} title="Reset prototype"><RotateCcw size={14}/></button></div></div>}
export function ToastRegion(){const {state,dispatch}=usePrototype();useEffect(()=>{if(!state.toastMessages.length)return;const ids=state.toastMessages.map(t=>t.id);const timer=setTimeout(()=>ids.forEach(id=>dispatch({type:'REMOVE_TOAST',payload:{id}})),3600);return()=>clearTimeout(timer)},[state.toastMessages,dispatch]);return <div className="toast-region">{state.toastMessages.map(t=><div key={t.id} className={cn('toast',`toast-${t.tone}`)}><span>{t.message}</span><button onClick={()=>dispatch({type:'REMOVE_TOAST',payload:{id:t.id}})}><X size={16}/></button></div>)}</div>}
export function Progress({value}:{value:number}){return <div className="progress"><i style={{width:`${Math.max(0,Math.min(100,value))}%`}}/></div>}
