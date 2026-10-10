import { generateId } from '../lib/core'
import { usePrototype } from './usePrototype'
export const useToast=()=>{const{dispatch}=usePrototype();return(message:string,tone:'success'|'error'|'info'='info')=>dispatch({type:'CREATE_TOAST',payload:{id:generateId('TOAST'),message,tone}})}
