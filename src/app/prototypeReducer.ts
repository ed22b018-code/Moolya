import { createSeedState } from '../data/seed'
import { allocateOrderInventory, generateId } from '../lib/core'
import type { InventoryBatch, Order, OrderItem, Payout, ProducerSubmission, PrototypeState, QCRecord, SubmissionStatus } from '../types'
import type { PrototypeAction } from './prototypeActions'

const toast=(state:PrototypeState,message:string,tone:'success'|'error'|'info'='success'):PrototypeState=>({...state,toastMessages:[...state.toastMessages,{id:generateId('TOAST'),message,tone}]})

export function prototypeReducer(state:PrototypeState, action:PrototypeAction):PrototypeState {
 switch(action.type){
  case 'SET_ROLE': return {...state,selectedPrototypeRole:action.payload}
  case 'SET_LANGUAGE': return {...state,language:action.payload}
  case 'ADD_TO_CART': {
   const stock=state.inventoryBatches.filter(b=>b.skuId===action.payload.skuId).reduce((s,b)=>s+b.quantityAvailable,0)
   const found=state.cart.find(i=>i.productId===action.payload.productId&&i.variant===action.payload.variant)
   const qty=(found?.quantity||0)+action.payload.quantity
   if(qty>stock)return toast(state,`Only ${stock} verified units are available.`,'error')
   return toast({...state,cart:found?state.cart.map(i=>i===found?{...i,quantity:qty}:i):[...state.cart,action.payload]},'Added to your cart.')
  }
  case 'REMOVE_FROM_CART': return {...state,cart:state.cart.filter(i=>!(i.productId===action.payload.productId&&i.variant===action.payload.variant))}
  case 'UPDATE_CART_QUANTITY': {
   const item=state.cart.find(i=>i.productId===action.payload.productId&&i.variant===action.payload.variant);if(!item)return state
   const stock=state.inventoryBatches.filter(b=>b.skuId===item.skuId).reduce((s,b)=>s+b.quantityAvailable,0)
   if(action.payload.quantity>stock)return toast(state,`Only ${stock} verified units are available.`,'error')
   return {...state,cart:action.payload.quantity<=0?state.cart.filter(i=>i!==item):state.cart.map(i=>i===item?{...i,quantity:action.payload.quantity}:i)}
  }
  case 'CLEAR_CART': return {...state,cart:[]}
  case 'CREATE_ORDER': {
   if(!state.cart.length)return toast(state,'Your cart is empty.','error')
   const rawItems:OrderItem[]=state.cart.map((c,i)=>{const p=state.products.find(p=>p.id===c.productId);if(!p)throw new Error('Product not found');return{id:generateId(`ITEM${i}`),productId:p.id,skuId:c.skuId,quantity:c.quantity,unitPrice:p.price,allocatedBatchIds:[],traceability:[]}})
   try{
    const allocation=allocateOrderInventory(state.inventoryBatches,rawItems);const subtotal=rawItems.reduce((s,i)=>s+i.unitPrice*i.quantity,0);const shipping=subtotal>=1500?0:79
    const order:Order={id:generateId('ORD'),customer:action.payload.customer,items:allocation.items,subtotal,shipping,total:subtotal+shipping,paymentMethod:action.payload.paymentMethod,status:'placed',placedAt:new Date().toISOString(),shippingAddress:action.payload.shippingAddress}
    return toast({...state,orders:[order,...state.orders],inventoryBatches:allocation.batches,cart:[]},`Order ${order.id} placed. Your origin record is ready.`)
   }catch(e){return toast(state,e instanceof Error?e.message:'Could not allocate verified inventory.','error')}
  }
  case 'CREATE_PRODUCER_SUBMISSION': {
   const submission:ProducerSubmission={...action.payload,id:generateId('SUB'),submittedAt:new Date().toISOString(),status:'pending_qc',quantityAccepted:0,quantityRework:0,quantityRejected:0}
   return toast({...state,submissions:[submission,...state.submissions]},`${submission.quantitySubmitted} units submitted for QC.`)
  }
  case 'PROCESS_QC': {
   const input=action.payload;const sub=state.submissions.find(s=>s.id===input.submissionId);if(!sub)return toast(state,'Submission could not be found.','error')
   if(input.accepted<0||input.rework<0||input.rejected<0||input.accepted+input.rework+input.rejected!==sub.quantitySubmitted)return toast(state,'Accepted, rework and rejected quantities must equal the submitted quantity.','error')
   const producer=state.producers.find(p=>p.id===sub.producerId);const sku=state.skus.find(s=>s.id===sub.skuId);if(!producer||!sku)return toast(state,'Producer or SKU record is missing.','error')
   const status:SubmissionStatus=input.accepted===sub.quantitySubmitted?'accepted':input.accepted>0?'partially_accepted':input.rework>0?'rework_requested':'rejected'
   const qcId=generateId(`QC-${sub.skuId}`);const batchId=generateId(`BATCH-${sub.skuId}`)
   const qc:QCRecord={id:qcId,submissionId:sub.id,producerId:sub.producerId,skuId:sub.skuId,inspectedAt:new Date().toISOString(),accepted:input.accepted,rework:input.rework,rejected:input.rejected,checks:input.checks,notes:input.notes,batchIds:input.accepted?[batchId]:[]}
   const batch:InventoryBatch|undefined=input.accepted?{id:batchId,skuId:sub.skuId,producerId:sub.producerId,qcRecordId:qcId,quantityInitial:input.accepted,quantityAvailable:input.accepted,quantityReserved:0,acceptedAt:new Date().toISOString(),qcStandardVersion:sku.specificationVersion,status:'available'}:undefined
   const credit:Payout|undefined=input.accepted?{id:generateId('CREDIT'),producerId:sub.producerId,type:'credit',referenceId:qcId,skuId:sub.skuId,acceptedQuantity:input.accepted,rate:sku.producerRate,amount:input.accepted*sku.producerRate,status:'credited',createdAt:new Date().toISOString()}:undefined
   const demands=state.demandRequirements.map(d=>d.skuId===sub.skuId?{...d,acceptedQuantity:d.acceptedQuantity+input.accepted,pendingQCQuantity:Math.max(0,d.pendingQCQuantity-sub.quantitySubmitted),remainingQuantity:Math.max(0,d.targetQuantity-d.acceptedQuantity-input.accepted),status:(d.targetQuantity-d.acceptedQuantity-input.accepted)<=0?'fulfilled' as const:d.status}:d)
   const next={...state,submissions:state.submissions.map(s=>s.id===sub.id?{...s,quantityAccepted:input.accepted,quantityRework:input.rework,quantityRejected:input.rejected,status,qcNotes:input.notes}:s),qcRecords:[qc,...state.qcRecords],inventoryBatches:batch?[...state.inventoryBatches,batch]:state.inventoryBatches,payouts:credit?[credit,...state.payouts]:state.payouts,demandRequirements:demands,producers:state.producers.map(p=>p.id===producer.id?{...p,totalUnitsAccepted:p.totalUnitsAccepted+input.accepted,totalCredited:p.totalCredited+input.accepted*sku.producerRate}:p)}
   return toast(next,`${input.accepted} units accepted. ${new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(input.accepted*sku.producerRate)} credited to ${producer.name}.`)
  }
  case 'CREATE_DEMAND_REQUIREMENT': return toast({...state,demandRequirements:[action.payload,...state.demandRequirements]},'Producer requirement issued.')
  case 'UPDATE_DEMAND_REQUIREMENT': return {...state,demandRequirements:state.demandRequirements.map(d=>d.id===action.payload.id?action.payload:d)}
  case 'CREATE_SKU': return toast({...state,skus:[action.payload,...state.skus]},`${action.payload.code} added to the pilot.`)
  case 'UPDATE_SKU': return {...state,skus:state.skus.map(s=>s.id===action.payload.id?action.payload:s)}
  case 'MARK_PAYOUT_PAID': {
   const pay=state.payouts.find(p=>p.id===action.payload.payoutId);if(!pay)return state
   return toast({...state,payouts:state.payouts.map(p=>p.id===pay.id?{...p,status:'paid',paidAt:new Date().toISOString()}:p),producers:state.producers.map(p=>p.id===pay.producerId?{...p,totalPaid:p.totalPaid+pay.amount}:p)},`${pay.id} marked paid.`)
  }
  case 'CREATE_TOAST': return {...state,toastMessages:[...state.toastMessages,action.payload]}
  case 'REMOVE_TOAST': return {...state,toastMessages:state.toastMessages.filter(t=>t.id!==action.payload.id)}
  case 'RESET_PROTOTYPE': return createSeedState()
  default:return state
 }
}
