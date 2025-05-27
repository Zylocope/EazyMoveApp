import Link from "next/link"
import { Home, User, Settings, Users, Truck, ClipboardList } from "lucide-react"
import type React from "react"

type SidebarProps = {
  role: "admin" | "driver" | "user"
}

export function Sidebar({ role }: SidebarProps) {
  return (
    <div className="flex flex-col h-full w-64 bg-red-100 text-red-800">
      <nav className="flex-1 px-2 py-4 space-y-2">
        {role === "admin" && (
          <>
            <SidebarLink href="/admin/dashboard" icon={Home} label="Dashboard" />
            <SidebarLink href="/admin/users" icon={Users} label="User Management" />
            <SidebarLink href="/admin/drivers" icon={Truck} label="Driver Management" />
            <SidebarLink href="/admin/order-history" icon={ClipboardList} label="Order History" />
          </>
        )}
        {role === "driver" && (
          <>
            <SidebarLink href="/driver/dashboard" icon={Home} label="Dashboard" />
            <SidebarLink href="/driver/orderhistory" icon={ClipboardList} label="Order History" />
            <SidebarLink href="/driver/dprofile" icon={User} label="My Profile" />
          </>
        )}
        {role === "user" && (
          <>
            <SidebarLink href="/user/dashboard" icon={Home} label="Dashboard" />
            <SidebarLink href="/user/profile" icon={User} label="Profile" />
          </>
        )}
        <SidebarLink href={`/${role}/settings`} icon={Settings} label="Settings" />
      </nav>
    </div>
  )
}

type SidebarLinkProps = {
  href: string
  icon: React.ElementType
  label: string
}

function SidebarLink({ href, icon: Icon, label }: SidebarLinkProps) {
  return (
    <Link
      href={href}
      className="flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-200 hover:text-red-900 rounded-md transition-colors"
    >
      <Icon className="mr-3 h-5 w-5" />
      {label}
    </Link>
  )
}

