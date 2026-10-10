import type { InventoryBatch, OrderItem, PrototypeState, TraceabilityRecord } from '../types'

export const formatCurrency = (value:number) => new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(value)
export const formatDate = (value:string) => new Intl.DateTimeFormat('en-IN',{day:'numeric',month:'short',year:'numeric'}).format(new Date(value))
let idCounter = 1000
export const generateId = (prefix:string) => `${prefix}-${Date.now().toString(36)}-${(++idCounter).toString(36)}`.toUpperCase()
export const getSKUInventory = (state:PrototypeState, skuId:string) => state.inventoryBatches.filter(b=>b.skuId===skuId).reduce((sum,b)=>sum+b.quantityAvailable,0)
export const getProducerCredits = (state:PrototypeState,producerId:string) => state.payouts.filter(p=>p.producerId===producerId&&p.type==='credit').reduce((s,p)=>s+p.amount,0)
export const getProducerPaid = (state:PrototypeState,producerId:string) => state.payouts.filter(p=>p.producerId===producerId&&p.status==='paid').reduce((s,p)=>s+p.amount,0)
export const getProducerPending = (state:PrototypeState,producerId:string) => state.payouts.filter(p=>p.producerId===producerId&&p.status!=='paid'&&p.status!=='held').reduce((s,p)=>s+p.amount,0)
export const calculateDemandRemaining = (target:number, accepted:number) => Math.max(0,target-accepted)
export const calculateQCAcceptance = (accepted:number,total:number) => total ? Math.round((accepted/total)*100) : 0

export function allocateOrderInventory(batches:InventoryBatch[], items:OrderItem[]) {
  const next = batches.map(b=>({...b}))
  const allocated = items.map(item=>{
    let needed=item.quantity; const traceability:TraceabilityRecord[]=[]; const ids:string[]=[]
    const eligible=next.filter(b=>b.skuId===item.skuId&&b.quantityAvailable>0).sort((a,b)=>a.acceptedAt.localeCompare(b.acceptedAt))
    for(const batch of eligible){
      const take=Math.min(needed,batch.quantityAvailable)
      for(let i=0;i<take;i++) traceability.push({unitIndex:traceability.length+1,batchId:batch.id,producerId:batch.producerId,qcRecordId:batch.qcRecordId})
      if(take){ ids.push(batch.id); batch.quantityAvailable-=take; batch.status=batch.quantityAvailable===0?'depleted':'available'; needed-=take }
      if(!needed) break
    }
    if(needed>0) throw new Error(`Only ${item.quantity-needed} verified units are available for ${item.skuId}.`)
    return {...item,allocatedBatchIds:ids,traceability}
  })
  return {batches:next,items:allocated}
}
