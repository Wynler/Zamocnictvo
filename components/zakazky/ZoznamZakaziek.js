import { Plus, BarChart2 } from 'lucide-react';
import ZakazkaKarta from './ZakazkaKarta';

export default function ZoznamZakaziek({ 
  zakazky, 
  filterStav,
  setFilterStav,
  onNovaZakazka,
  onTimeline,
  onDetailZakazky,
  onVymazatZakazku,
  showDeleteConfirm,
  setShowDeleteConfirm,
  zakazkaToDelete,
  setZakazkaToDelete,
  handleVymazat
}) {
  const stavyZakaziek = {
    'priprava': { label: 'Príprava', farba: 'bg-yellow-100 text-yellow-700' },
    'aktivna': { label: 'Aktívna', farba: 'bg-blue-100 text-blue-700' },
    'ukoncena': { label: 'Ukončená', farba: 'bg-green-100 text-green-700' },
    'vymazane': { label: 'Vymazané', farba: 'bg-red-100 text-red-700' }
  };

  const filtrovanieZakazky = filterStav === 'vsetky' 
    ? zakazky 
    : zakazky.filter(z => z.stav === filterStav);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* DELETE CONFIRM MODAL */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Presunúť do vymazaných?
              </h3>
              <p className="text-gray-600 mb-6">
                Zákazka <span className="font-semibold">"{zakazkaToDelete?.nazov}"</span> bude 
                presunutá do stavu "Vymazané". Neskôr ju môžeš obnoviť zmenou stavu.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleVymazat}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-medium"
                >
                  Presunúť do vymazaných
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setZakazkaToDelete(null);
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 font-medium"
                >
                  Zrušiť
                </button>
              </div>
            </div>
          </div>
        )}

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Zákazky</h1>
          <div className="flex gap-2">
            <button
              onClick={onTimeline}
              className="flex items-center gap-2 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800"
            >
              <BarChart2 size={20} />
              Timeline
            </button>
            <button
              onClick={onNovaZakazka}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Plus size={20} />
              Nová zákazka
            </button>
          </div>
        </div>

        {/* FILTERS */}
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-medium text-gray-700">Filter:</span>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilterStav('vsetky')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filterStav === 'vsetky' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Všetky ({zakazky.length})
              </button>
              {Object.entries(stavyZakaziek).map(([hodnota, {label, farba}]) => (
                <button
                  key={hodnota}
                  onClick={() => setFilterStav(hodnota)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    filterStav === hodnota 
                      ? farba + ' ring-2 ring-offset-2 ring-blue-500'
                      : farba.replace('100', '50') + ' hover:' + farba
                  }`}
                >
                  {label} ({zakazky.filter(z => z.stav === hodnota).length})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* TABUĽKA - KOMPAKTNÝ DIZAJN */}
        {filtrovanieZakazky.length > 0 ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* HEADER ROW */}
            <div className="bg-gray-50 border-b border-gray-200 px-6 py-3 grid grid-cols-12 gap-4 items-center text-sm font-semibold text-gray-600">
              <div className="col-span-1">Číslo</div>
              <div className="col-span-3">Názov zákazky</div>
              <div className="col-span-2">Zákazník</div>
              <div className="col-span-2">Kontakt</div>
              <div className="col-span-2">Etapy</div>
              <div className="col-span-1">Stav</div>
              <div className="col-span-1 text-right">Akcie</div>
            </div>

            {/* DATA ROWS */}
            {filtrovanieZakazky.map((zakazka, index) => (
              <div 
                key={zakazka.id}
                className="border-b border-gray-100 px-6 py-4 grid grid-cols-12 gap-4 items-center hover:bg-gray-50 transition cursor-pointer"
                onClick={() => onDetailZakazky(zakazka)}
              >
                {/* ČÍSLO */}
              <div className="col-span-1">
                    <span className="text-lg font-bold text-gray-400">
                        {zakazka.cisloZakazky || `#${zakazka.id}`}
                            </span>
                  </div>

                {/* NÁZOV */}
                <div className="col-span-3">
                  <h3 className="font-semibold text-gray-800 text-base">
                    {zakazka.nazov}
                  </h3>
                </div>

                {/* ZÁKAZNÍK */}
                <div className="col-span-2">
                  <p className="text-gray-700">{zakazka.zakaznik}</p>
                </div>

                {/* KONTAKT */}
                <div className="col-span-2">
                  <div className="text-sm text-gray-600">
                    {zakazka.telefon && <div>📞 {zakazka.telefon}</div>}
                    {zakazka.email && <div className="truncate">✉️ {zakazka.email}</div>}
                    {!zakazka.telefon && !zakazka.email && <span className="text-gray-400">-</span>}
                  </div>
                </div>

                {/* ETAPY */}
                <div className="col-span-2">
                  <div className="flex items-center gap-3 text-sm">
                    <span className="font-medium text-gray-700">
                      📋 {zakazka.etapy?.length || 0}
                    </span>
                    {zakazka.etapy?.length > 0 && (
                      <span className="text-green-600">
                        ✅ {zakazka.etapy.filter(e => e.stav === 'dokoncene').length}
                      </span>
                    )}
                  </div>
                </div>

                {/* STAV */}
                <div className="col-span-1">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium inline-block ${
                    stavyZakaziek[zakazka.stav]?.farba || 'bg-gray-100 text-gray-700'
                  }`}>
                    {stavyZakaziek[zakazka.stav]?.label || 'Príprava'}
                  </span>
                </div>

                {/* AKCIE */}
                <div className="col-span-1 text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onVymazatZakazku(zakazka);
                    }}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Vymazať
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
            <p className="text-lg mb-2">
              {filterStav === 'vsetky' 
                ? 'Žiadne zákazky' 
                : `Žiadne zákazky v stave "${stavyZakaziek[filterStav]?.label}"`}
            </p>
            <p className="text-sm">
              {filterStav === 'vsetky' 
                ? 'Začni pridaním novej zákazky' 
                : 'Skús zmeniť filter'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
