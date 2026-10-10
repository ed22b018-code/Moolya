import { createContext, useEffect, useReducer, type Dispatch, type ReactNode } from 'react'
import { createSeedState } from '../data/seed'
import { loadState, saveState } from '../lib/localStorage'
import type { PrototypeState } from '../types'
import type { PrototypeAction } from './prototypeActions'
import { prototypeReducer } from './prototypeReducer'

export const PrototypeContext=createContext<{state:PrototypeState;dispatch:Dispatch<PrototypeAction>}|null>(null)
export function PrototypeProvider({children}:{children:ReactNode}){
 const [state,dispatch]=useReducer(prototypeReducer,undefined,()=>loadState()??createSeedState())
 useEffect(()=>saveState(state),[state])
 return <PrototypeContext.Provider value={{state,dispatch}}>{children}</PrototypeContext.Provider>
}
