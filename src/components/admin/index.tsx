import type { ReactNode } from 'react'
import { Boxes, ChartNoAxesCombined, ClipboardCheck, IndianRupee, LayoutDashboard, PackageSearch, ShoppingBag, Tags, Users } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { MoolyaLogo, PrototypeRoleSwitcher } from '../common'

const nav=[['/admin',LayoutDashboard,'Overview'],['/admin/skus',Tags,'SKUs'],['/admin/demand',ChartNoAxesCombined,'Demand'],['/admin/qc',ClipboardCheck,'QC'],['/admin/inventory',Boxes,'Inventory'],['/admin/producers',Users,'Producers'],['/admin/payouts',IndianRupee,'Payouts'],['/admin/orders',ShoppingBag,'Orders'],['/admin/analytics',PackageSearch,'Analytics']] as const
export function AdminShell({children,title='Overview'}:{children:ReactNode;title?:string}){return <div className="portal admin-portal"><aside><MoolyaLogo light/><div className="portal-label">Operations</div><nav>{nav.map(([to,Icon,label],i)=><NavLink key={to} to={to} end={i===0}><Icon/>{label}</NavLink>)}</nav><div className="sidebar-note">East Godavari<br/><b>Pilot operations</b></div></aside><div className="portal-main"><div className="portal-prototype"><PrototypeRoleSwitcher/></div><header className="portal-header"><div><span>Moolya Operations</span><h1>{title}</h1></div><div className="ops-status"><i/> System live</div></header><main className="portal-content">{children}</main></div></div>}
