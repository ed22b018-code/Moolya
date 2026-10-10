export type Category = 'Handloom' | 'Craft' | 'Natural'
export type SubmissionStatus = 'pending_qc' | 'accepted' | 'partially_accepted' | 'rework_requested' | 'rejected'
export type PayoutStatus = 'credited' | 'pending' | 'paid' | 'held'
export type PayoutType = 'credit' | 'payment'

export interface Product { id:string; skuId:string; slug:string; name:string; shortDescription:string; longDescription:string; category:Category; subcategory:string; price:number; compareAtPrice?:number; images:string[]; materials:string[]; variants:string[]; rating:number; reviewCount:number; featured:boolean; active:boolean }
export interface SelectionScores { consumerDemand:number; producerCapability:number; standardisability:number; shippingSuitability:number; marginPotential:number; repeatPotential:number }
export interface SKU { id:string; code:string; productId:string; name:string; category:Category; status:'active'|'draft'|'paused'; specificationVersion:string; materialSpecification:string; qualityChecklist:string[]; allowedTolerance:string; approvedProducerIds:string[]; producerRate:number; consumerPrice:number; targetDemand:number; currentDemand:number; lowStockThreshold:number; selectionScores:SelectionScores }
export interface Producer { id:string; name:string; village:string; district:string; type:string; skills:string[]; approvedSkuIds:string[]; yearsExperience:number; qcAcceptanceRate:number; totalUnitsSubmitted:number; totalUnitsAccepted:number; totalCredited:number; totalPaid:number; phone?:string; language:'en'|'te'; active:boolean }
export interface ProducerSubmission { id:string; producerId:string; skuId:string; quantitySubmitted:number; quantityAccepted:number; quantityRework:number; quantityRejected:number; submittedAt:string; status:SubmissionStatus; imageUrl?:string; producerNote?:string; qcNotes?:string; linkedSubmissionId?:string }
export interface QCChecks { material:boolean; measurements:boolean; finish:boolean; damage:boolean; colour:boolean; packaging:boolean }
export interface QCRecord { id:string; submissionId:string; producerId:string; skuId:string; inspectedAt:string; accepted:number; rework:number; rejected:number; checks:QCChecks; notes:string; batchIds:string[] }
export interface InventoryBatch { id:string; skuId:string; producerId:string; qcRecordId:string; quantityInitial:number; quantityAvailable:number; quantityReserved:number; acceptedAt:string; qcStandardVersion:string; status:'available'|'depleted'|'held' }
export interface TraceabilityRecord { unitIndex:number; batchId:string; producerId:string; qcRecordId:string }
export interface OrderItem { id:string; productId:string; skuId:string; quantity:number; unitPrice:number; allocatedBatchIds:string[]; traceability:TraceabilityRecord[] }
export interface Customer { name:string; email:string; phone:string }
export interface Address { line:string; city:string; state:string; pin:string }
export interface Order { id:string; customer:Customer; items:OrderItem[]; subtotal:number; shipping:number; total:number; paymentMethod:'UPI'|'Card'|'Cash on Delivery'; status:'placed'|'packed'|'shipped'|'delivered'; placedAt:string; shippingAddress:Address }
export interface Payout { id:string; producerId:string; type:PayoutType; referenceId:string; skuId?:string; acceptedQuantity?:number; rate?:number; amount:number; status:PayoutStatus; createdAt:string; paidAt?:string }
export interface DemandRequirement { id:string; skuId:string; targetQuantity:number; acceptedQuantity:number; pendingQCQuantity:number; remainingQuantity:number; dueDate:string; producerRate:number; status:'open'|'fulfilled'|'closed' }
export interface CartItem { productId:string; skuId:string; variant?:string; quantity:number }
export interface ToastMessage { id:string; message:string; tone:'success'|'error'|'info' }
export type PrototypeRole = 'consumer'|'producer'|'admin'
export interface PrototypeState { products:Product[]; skus:SKU[]; producers:Producer[]; submissions:ProducerSubmission[]; qcRecords:QCRecord[]; inventoryBatches:InventoryBatch[]; orders:Order[]; payouts:Payout[]; demandRequirements:DemandRequirement[]; cart:CartItem[]; selectedPrototypeRole:PrototypeRole; selectedProducerId:string; language:'en'|'te'; toastMessages:ToastMessage[] }
export interface CheckoutInput { customer:Customer; shippingAddress:Address; paymentMethod:Order['paymentMethod'] }
export interface QCInput { submissionId:string; accepted:number; rework:number; rejected:number; checks:QCChecks; notes:string }
