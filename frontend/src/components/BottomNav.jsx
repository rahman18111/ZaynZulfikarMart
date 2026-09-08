import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Boxes, 
  FileText,
  ArrowDownToLine
} from 'lucide-react';

export const BottomNav = ({ activeTab, setActiveTab }) => {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-charcoal-900/95 backdrop-blur-md border-t border-charcoal-800 px-2 py-1.5 shadow-2xl safe-area-bottom">
      <div className="grid grid-cols-5 items-center max-w-md mx-auto">
        {/* Dashboard */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
            activeTab === 'dashboard' ? 'text-gold-400 font-semibold' : 'text-charcoal-400 hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight">Beranda</span>
        </button>

        {/* Data Barang */}
        <button
          onClick={() => setActiveTab('barang')}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
            activeTab === 'barang' ? 'text-gold-400 font-semibold' : 'text-charcoal-400 hover:text-white'
          }`}
        >
          <Package className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight">Barang</span>
        </button>

        {/* Kasir / POS (Center Prominent Gold Button) */}
        <button
          onClick={() => setActiveTab('kasir')}
          className="flex flex-col items-center justify-center -mt-5"
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 ${
            activeTab === 'kasir'
              ? 'bg-gradient-to-tr from-gold-500 to-amber-300 text-charcoal-950 shadow-gold-md ring-4 ring-charcoal-900 ring-offset-0'
              : 'bg-gradient-to-tr from-gold-600 to-gold-400 text-charcoal-950 ring-2 ring-charcoal-900'
          }`}>
            <ShoppingCart className="w-6 h-6" />
          </div>
          <span className={`text-[10px] mt-1 font-semibold leading-tight ${activeTab === 'kasir' ? 'text-gold-400 font-bold' : 'text-charcoal-300'}`}>
            Kasir
          </span>
        </button>

        {/* Stok */}
        <button
          onClick={() => setActiveTab('stok')}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
            activeTab === 'stok' ? 'text-gold-400 font-semibold' : 'text-charcoal-400 hover:text-white'
          }`}
        >
          <Boxes className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight">Stok</span>
        </button>

        {/* Laporan */}
        <button
          onClick={() => setActiveTab('laporan')}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
            activeTab === 'laporan' ? 'text-gold-400 font-semibold' : 'text-charcoal-400 hover:text-white'
          }`}
        >
          <FileText className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight">Laporan</span>
        </button>
      </div>
    </div>
  );
};

export default BottomNav;
