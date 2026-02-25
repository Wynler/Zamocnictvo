export default function NovaEtapa({ 
  aktualnaZakazka,
  novaEtapa,
  setNovaEtapa,
  onPridat,
  onZrusit
}) {
  const stavyEtap = {
    'planovane': { label: 'Plánované', farba: 'bg-gray-100 text-gray-700' },
    'vyroba': { label: 'Výroba', farba: 'bg-blue-100 text-blue-700' },
    'povrchovaUprava': { label: 'Povrchová úprava', farba: 'bg-purple-100 text-purple-700' },
    'montaz': { label: 'Montáž', farba: 'bg-orange-100 text-orange-700' },
    'dokoncene': { label: 'Dokončené', farba: 'bg-green-100 text-green-700' }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Nová etapa</h2>
          <p className="text-gray-600 mb-6">Zákazka: {aktualnaZakazka.nazov}</p>
          
          <div className="space-y-6">
            {/* ZÁKLADNÉ */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Základné informácie</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Názov etapy *
                  </label>
                  <input
                    type="text"
                    value={novaEtapa.nazov}
                    onChange={(e) => setNovaEtapa({...novaEtapa, nazov: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="napr. Etapa 1 - Výroba"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kontaktná osoba
                  </label>
                  <input
                    type="text"
                    value={novaEtapa.kontaktnaOsoba}
                    onChange={(e) => setNovaEtapa({...novaEtapa, kontaktnaOsoba: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefón
                  </label>
                  <input
                    type="tel"
                    value={novaEtapa.telefon}
                    onChange={(e) => setNovaEtapa({...novaEtapa, telefon: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={novaEtapa.email}
                    onChange={(e) => setNovaEtapa({...novaEtapa, email: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hmotnosť podľa výkazu (kg)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={novaEtapa.hmotnostPodlaVykazu}
                    onChange={(e) => setNovaEtapa({...novaEtapa, hmotnostPodlaVykazu: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* DÁTUMY */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Termíny</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dátum ukončenia
                  </label>
                  <input
                    type="date"
                    value={novaEtapa.datumUkoncenia}
                    onChange={(e) => setNovaEtapa({...novaEtapa, datumUkoncenia: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div></div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Výroba od
                  </label>
                  <input
                    type="date"
                    value={novaEtapa.datumVyrobyOd}
                    onChange={(e) => setNovaEtapa({...novaEtapa, datumVyrobyOd: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Výroba do
                  </label>
                  <input
                    type="date"
                    value={novaEtapa.datumVyrobyDo}
                    onChange={(e) => setNovaEtapa({...novaEtapa, datumVyrobyDo: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Povrchová úprava od
                  </label>
                  <input
                    type="date"
                    value={novaEtapa.datumPovrchovejUpravyOd}
                    onChange={(e) => setNovaEtapa({...novaEtapa, datumPovrchovejUpravyOd: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Povrchová úprava do
                  </label>
                  <input
                    type="date"
                    value={novaEtapa.datumPovrchovejUpravyDo}
                    onChange={(e) => setNovaEtapa({...novaEtapa, datumPovrchovejUpravyDo: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Montáž od
                  </label>
                  <input
                    type="date"
                    value={novaEtapa.datumMontazeOd}
                    onChange={(e) => setNovaEtapa({...novaEtapa, datumMontazeOd: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Montáž do
                  </label>
                  <input
                    type="date"
                    value={novaEtapa.datumMontazeDo}
                    onChange={(e) => setNovaEtapa({...novaEtapa, datumMontazeDo: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* ÚPRAVY */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Povrchové úpravy</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zinkovanie
                  </label>
                  <select
                    value={novaEtapa.zinkovanie}
                    onChange={(e) => setNovaEtapa({...novaEtapa, zinkovanie: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="nic">Žiadne</option>
                    <option value="ponorove">Ponorové</option>
                    <option value="galvanicke">Galvanické</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Farba
                  </label>
                  <select
                    value={novaEtapa.farba}
                    onChange={(e) => setNovaEtapa({...novaEtapa, farba: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="nic">Žiadna</option>
                    <option value="praskovaMat">Prášková mat</option>
                    <option value="praskovaLes">Prášková lesk</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Odtieň farby (RAL)
                  </label>
                  <input
                    type="text"
                    value={novaEtapa.farbaTon}
                    onChange={(e) => setNovaEtapa({...novaEtapa, farbaTon: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="napr. RAL 9005"
                  />
                </div>
              </div>
            </div>

            {/* POPIS */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Popis / Poznámky
              </label>
              <textarea
                value={novaEtapa.popis}
                onChange={(e) => setNovaEtapa({...novaEtapa, popis: e.target.value})}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            {/* STAV */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stav etapy
              </label>
              <select
                value={novaEtapa.stav}
                onChange={(e) => setNovaEtapa({...novaEtapa, stav: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                {Object.entries(stavyEtap).map(([hodnota, {label}]) => (
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
              Vytvoriť etapu
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
