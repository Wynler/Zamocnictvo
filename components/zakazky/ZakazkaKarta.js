import { ChevronRight, Trash2 } from 'lucide-react';

export default function ZakazkaKarta({ 
  zakazka, 
  stavyZakaziek,
  onDetail, 
  onVymazat 
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-800 mb-1">
            {zakazka.nazov}
          </h3>
          <p className="text-gray-600">Zákazník: {zakazka.zakaznik}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            stavyZakaziek[zakazka.stav]?.farba || 'bg-gray-100 text-gray-700'
          }`}>
            {stavyZakaziek[zakazka.stav]?.label || 'Príprava'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
        <span>📋 {zakazka.etapy?.length || 0} projektov</span>
        {zakazka.etapy?.length > 0 && (
          <span>
            ✅ {zakazka.etapy.filter(e => e.stav === 'dokoncene').length} dokončených
          </span>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onDetail(zakazka)}
          className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200"
        >
          Detail
          <ChevronRight size={16} />
        </button>
        <button
          onClick={() => onVymazat(zakazka)}
          className="flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded hover:bg-red-200"
        >
          <Trash2 size={16} />
          Vymazať
        </button>
      </div>
    </div>
  );
}
