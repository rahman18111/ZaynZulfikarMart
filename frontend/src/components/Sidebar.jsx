import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  ArrowDownToLine, 
  Boxes, 
  FileText, 
  LogOut,
  ShieldCheck,
  Store
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'kasir', label: 'Kasir / Transaksi', icon: ShoppingCart, highlight: true },
  { id: 'barang', label: 'Data Barang', icon: Package },
  { id: 'barang-masuk', label: 'Barang Masuk', icon: ArrowDownToLine },
  { id: 'stok', label: 'Stok Real-time', icon: Boxes },
  { id: 'laporan', label: 'Laporan Harian', icon: FileText },
];

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-charcoal-900 text-white min-h-screen border-r border-charcoal-800 shadow-xl select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-charcoal-800/80 bg-charcoal-950/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-gold-600 via-gold-500 to-amber-300 flex items-center justify-center shadow-gold-sm text-charcoal-950 font-extrabold text-lg">
            <Store className="w-5 h-5 text-charcoal-950" />
          </div>
          <div>
            <h1 className="font-bold text-base tracking-wide text-white leading-tight flex items-center gap-1.5">
              ZaynZulfikar<span className="text-gold-400">Store</span>
            </h1>
            <p className="text-[11px] font-medium text-charcoal-400 tracking-wider uppercase">Kasir & Stok v1.0</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-charcoal-500">
          Menu Utama
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? item.highlight
                    ? 'bg-gradient-to-r from-gold-500 to-amber-500 text-charcoal-950 font-semibold shadow-gold-sm'
                    : 'bg-charcoal-800 text-gold-400 font-semibold border-l-4 border-gold-400'
                  : 'text-charcoal-300 hover:text-white hover:bg-charcoal-800/50'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive && !item.highlight ? 'text-gold-400' : ''}`} />
              <span className="flex-1 text-left">{item.label}</span>
              {item.highlight && !isActive && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-gold-500/10 text-gold-400 border border-gold-500/20">
                  POS
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Admin Profile & Logout */}
      <div className="p-3 border-t border-charcoal-800 bg-charcoal-950/60">
        <div className="p-2.5 rounded-xl bg-charcoal-900 border border-charcoal-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gold-500/20 border border-gold-500/40 text-gold-400 font-bold text-xs flex items-center justify-center shrink-0">
              {user?.nama_lengkap?.charAt(0) || 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate leading-none">
                {user?.nama_lengkap || 'Admin Zayn'}
              </p>
              <div className="flex items-center gap-1 mt-1 text-[10px] text-emerald-400 font-medium">
                <ShieldCheck className="w-3 h-3" />
                <span>Super Admin</span>
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            title="Keluar dari sistem"
            className="p-1.5 rounded-lg text-charcoal-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
