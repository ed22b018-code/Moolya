import { useContext } from 'react'
import { PrototypeContext } from '../app/PrototypeProvider'
export function usePrototype(){const value=useContext(PrototypeContext);if(!value)throw new Error('usePrototype must be used within PrototypeProvider');return value}
