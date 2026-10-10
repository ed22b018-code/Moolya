import { usePrototype } from './usePrototype'
export const useCart=()=>{const {state,dispatch}=usePrototype();return{items:state.cart,count:state.cart.reduce((s,i)=>s+i.quantity,0),add:(productId:string,skuId:string,variant?:string)=>dispatch({type:'ADD_TO_CART',payload:{productId,skuId,variant,quantity:1}})}}
