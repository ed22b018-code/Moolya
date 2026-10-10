import type { PrototypeState } from '../types'
export const STORAGE_KEY='moolya-prototype-v1'
export const loadState=():PrototypeState|null=>{try{const raw=localStorage.getItem(STORAGE_KEY);return raw?JSON.parse(raw):null}catch{return null}}
export const saveState=(state:PrototypeState)=>{try{localStorage.setItem(STORAGE_KEY,JSON.stringify({...state,toastMessages:[]}))}catch{/* private mode */}}
export const resetPrototypeStorage=()=>localStorage.removeItem(STORAGE_KEY)
