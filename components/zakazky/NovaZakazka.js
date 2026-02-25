export default function NovaZakazka({ 
  novaZakazka,
  setNovaZakazka,
  onPridat,
  onZrusit
}) {
  const stavyZakaziek = {
    'priprava': { label: 'Príprava', farba: 'bg-yellow-100 text-yellow-700' },
    'aktivna': { label: 'Aktívna', farba: 'bg-blue-100 text-blue-700' },
    'ukoncena': { label: 'Ukončená', farba: 'bg-green-100 text-green-700' },
    'vymazane': { label: 'Vymazané', farba: 'bg-red-100 text-red-700' }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Nová zákazka</h2>
          
          <div className="space-y-6">
            {/* ZÁKLADNÉ ÚDAJE */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Základné údaje</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Názov zákazky *
                  </label>
                  <input
                    type="text"
                    value={novaZakazka.nazov}
                    onChange={(e) => setNovaZakazka({...novaZakazka, nazov: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="napr. Zábradlie rodinný dom"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meno zákazníka *
                  </label>
                  <input
                    type="text"
                    value={novaZakazka.zakaznik}
                    onChange={(e) => setNovaZakazka({...novaZakazka, zakaznik: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="napr. Ján Novák"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kontaktná osoba
                  </label>
                  <input
                    type="text"
                    value={novaZakazka.kontaktnaOsoba}
                    onChange={(e) => setNovaZakazka({...novaZakazka, kontaktnaOsoba: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefón
                  </label>
                  <input
                    type="tel"
                    value={novaZakazka.telefon}
                    onChange={(e) => setNovaZakazka({...novaZakazka, telefon: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={novaZakazka.email}
                    onChange={(e) => setNovaZakazka({...novaZakazka, email: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* FAKTURAČNÉ ÚDAJE */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Fakturačné údaje</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Názov firmy
                  </label>
                  <input
                    type="text"
                    value={novaZakazka.nazovFirmy}
                    onChange={(e) => setNovaZakazka({...novaZakazka, nazovFirmy: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">IČO</label>
                  <input
                    type="text"
                    value={novaZakazka.ico}
                    onChange={(e) => setNovaZakazka({...novaZakazka, ico: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">DIČ</label>
                  <input
                    type="text"
                    value={novaZakazka.dic}
                    onChange={(e) => setNovaZakazka({...novaZakazka, dic: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fakturačná adresa
                  </label>
                  <input
                    type="text"
                    value={novaZakazka.adresa}
                    onChange={(e) => setNovaZakazka({...novaZakazka, adresa: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* STAV */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Stav zákazky</h3>
              <select
                value={novaZakazka.stav}
                onChange={(e) => setNovaZakazka({...novaZakazka, stav: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                {Object.entries(stavyZakaziek).map(([hodnota, {label}]) => (
                  <option key={hodnota} value={hodnota}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* BUTTONS */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={onPridat}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
            >
              Vytvoriť zákazku
            </button>
            <button
              onClick={onZrusit}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Zrušiť
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
