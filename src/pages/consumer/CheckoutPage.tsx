import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, EmptyState } from '../../components/common'
import { ConsumerLayout } from '../../components/consumer'
import { usePrototype } from '../../hooks/usePrototype'
import { formatCurrency } from '../../lib/core'
import type { CheckoutInput } from '../../types'

export function CheckoutPage(){
  const {state,dispatch}=usePrototype()
  const navigate=useNavigate()
  const orderCountBefore=useRef(state.orders.length)
  const [submitted,setSubmitted]=useState(false)
  const [data,setData]=useState<CheckoutInput>({customer:{name:'',email:'',phone:''},shippingAddress:{line:'',city:'Rajamahendravaram',state:'Andhra Pradesh',pin:''},paymentMethod:'UPI'})
  const subtotal=state.cart.reduce((sum,item)=>sum+(state.products.find(p=>p.id===item.productId)?.price||0)*item.quantity,0)

  useEffect(()=>{
    if(submitted&&state.orders.length>orderCountBefore.current)navigate(`/order-success/${state.orders[0].id}`)
  },[state.orders,submitted,navigate])

  const submit=(event:FormEvent)=>{
    event.preventDefault()
    orderCountBefore.current=state.orders.length
    setSubmitted(true)
    dispatch({type:'CREATE_ORDER',payload:data})
  }

  if(!state.cart.length&&!submitted)return <ConsumerLayout><EmptyState title="Nothing to check out" copy="Add a product to your cart first."/></ConsumerLayout>
  return <ConsumerLayout><section className="page-hero compact"><div className="container"><span className="eyebrow">Secure prototype checkout</span><h1>Delivery details</h1></div></section><form className="container checkout-layout" onSubmit={submit}><div className="checkout-form"><h2>Contact</h2><div className="form-grid"><label>Full name<input required value={data.customer.name} onChange={e=>setData({...data,customer:{...data.customer,name:e.target.value}})}/></label><label>Email<input required type="email" value={data.customer.email} onChange={e=>setData({...data,customer:{...data.customer,email:e.target.value}})}/></label><label>Phone<input required value={data.customer.phone} onChange={e=>setData({...data,customer:{...data.customer,phone:e.target.value}})}/></label></div><h2>Address</h2><div className="form-grid"><label className="span-2">Address line<input required value={data.shippingAddress.line} onChange={e=>setData({...data,shippingAddress:{...data.shippingAddress,line:e.target.value}})}/></label><label>City<input required value={data.shippingAddress.city} onChange={e=>setData({...data,shippingAddress:{...data.shippingAddress,city:e.target.value}})}/></label><label>State<input required value={data.shippingAddress.state} onChange={e=>setData({...data,shippingAddress:{...data.shippingAddress,state:e.target.value}})}/></label><label>PIN<input required pattern="[0-9]{6}" value={data.shippingAddress.pin} onChange={e=>setData({...data,shippingAddress:{...data.shippingAddress,pin:e.target.value}})}/></label></div><h2>Payment</h2><div className="payment-options">{(['UPI','Card','Cash on Delivery'] as const).map(method=><label className={data.paymentMethod===method?'active':''} key={method}><input type="radio" checked={data.paymentMethod===method} onChange={()=>setData({...data,paymentMethod:method})}/>{method}</label>)}</div>{data.paymentMethod==='Card'&&<div className="info-box">Prototype only — no payment will be processed.</div>}</div><aside className="cart-summary"><h2>Place order</h2><div><span>Subtotal</span><b>{formatCurrency(subtotal)}</b></div><div><span>Shipping</span><b>{subtotal>=1500?'Free':formatCurrency(79)}</b></div><hr/><div className="total"><span>Total</span><b>{formatCurrency(subtotal+(subtotal>=1500?0:79))}</b></div><Button type="submit" disabled={submitted}>{submitted?'Allocating origin…':'Place prototype order'}</Button><small>Each unit is allocated to an actual accepted batch using FIFO.</small></aside></form></ConsumerLayout>
}
