import { createSeedState } from '../src/data/seed'
import { prototypeReducer } from '../src/app/prototypeReducer'
import { getProducerPaid, getProducerPending, getSKUInventory } from '../src/lib/core'

const ok=(condition:boolean,message:string)=>{if(!condition)throw new Error(message)}
let state=createSeedState()
ok(getSKUInventory(state,'H001')===42,'Initial H001 inventory must be 42')
const pending=state.submissions.find(s=>s.id==='SUB-H001-LAKSHMI-08')!
state=prototypeReducer(state,{type:'PROCESS_QC',payload:{submissionId:pending.id,accepted:7,rework:1,rejected:0,checks:{material:true,measurements:true,finish:true,damage:true,colour:true,packaging:true},notes:'One unit requires rework.'}})
ok(getSKUInventory(state,'H001')===49,'QC must increase H001 inventory to 49')
const credit=state.payouts.find(p=>p.producerId==='EG-P-017'&&p.amount===5040)!
ok(!!credit,'QC must create a ₹5,040 producer credit')
ok(state.submissions.find(s=>s.id===pending.id)?.quantityRework===1,'QC must preserve one rework unit')
ok(getProducerPending(state,'EG-P-017')===10690,'Lakshmi pending must increase by ₹5,040')
state=prototypeReducer(state,{type:'ADD_TO_CART',payload:{productId:'H001-product-id',skuId:'H001',variant:'M',quantity:1}})
state=prototypeReducer(state,{type:'CREATE_ORDER',payload:{customer:{name:'Acceptance Customer',email:'test@example.test',phone:'9999999999'},shippingAddress:{line:'1 Prototype Road',city:'Rajamahendravaram',state:'Andhra Pradesh',pin:'533101'},paymentMethod:'UPI'}})
ok(getSKUInventory(state,'H001')===48,'Checkout must reduce H001 inventory to 48')
ok(state.orders[0].items[0].traceability.length===1,'Order must contain unit-level traceability')
ok(state.orders[0].items[0].allocatedBatchIds.length>0,'Order must contain an allocated batch')
state=prototypeReducer(state,{type:'MARK_PAYOUT_PAID',payload:{payoutId:credit.id}})
ok(getProducerPaid(state,'EG-P-017')===17840,'Mark paid must increase Lakshmi paid total')
ok(getProducerPending(state,'EG-P-017')===5650,'Mark paid must reduce Lakshmi pending total')
console.log('Connected acceptance flow passed: 42 → 49 → 48, ₹5,040 credited, trace allocated, payout marked paid.')
