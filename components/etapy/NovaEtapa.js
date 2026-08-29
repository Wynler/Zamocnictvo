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

  // Vypočíta reálny dátum konca
  function vypocitajDatumKonca() {
    if (!novaEtapa.datumZaciatku || !novaEtapa.clovekohod || !novaEtapa.pocetLudi) return null;
    const dni = Math.ceil(parseFloat(novaEtapa.clovekohod) / (parseInt(novaEtapa.pocetLudi) * 8));
    const datum = new Date(novaEtapa.datumZaciatku);
    datum.setDate(datum.getDate() + dni);
    return datum.toISOString().split('T')[0];
  }

  function semafor() {
    const koniec = vypocitajDatumKonca();
    if (!koniec || !novaEtapa.deadline) return null;
    return koniec <= novaEtapa.deadline ? 'ok' : 'pozor';
  }

  const datumKonca = vypocitajDatumKonca();
  const stavSemafora = semafor();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Nový projekt</h2>
          <p className="text-gray-600 mb-6">Zákazka: {aktualnaZakazka.nazov}</p>
          
          <div className="space-y-6">
            {/* ZÁKLADNÉ */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Základné informácie</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Názov etapy *</label>
                  <input
                    type="text"
                    value={novaEtapa.nazov}
                    onChange={(e) => setNovaEtapa({...novaEtapa, nazov: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="napr. Projekt 1 - Výroba"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kontaktná osoba</label>
                  <input type="text" value={novaEtapa.kontaktnaOsoba}
                    onChange={(e) => setNovaEtapa({...novaEtapa, kontaktnaOsoba: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Telefón</label>
                  <input type="tel" value={novaEtapa.telefon}
                    onChange={(e) => setNovaEtapa({...novaEtapa, telefon: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input type="email" value={novaEtapa.email}
                    onChange={(e) => setNovaEtapa({...novaEtapa, email: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hmotnosť podľa výkazu (kg)</label>
                  <input type="number" step="0.01" value={novaEtapa.hmotnostPodlaVykazu}
                    onChange={(e) => setNovaEtapa({...novaEtapa, hmotnostPodlaVykazu: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
              </div>
            </div>

            {/* TIMELINE */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Timeline</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dátum začiatku</label>
                  <input type="date" value={novaEtapa.datumZaciatku || ''}
                    onChange={(e) => setNovaEtapa({...novaEtapa, datumZaciatku: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Deadline (požadovaný dátum)</label>
                  <input type="date" value={novaEtapa.deadline || ''}
                    onChange={(e) => setNovaEtapa({...novaEtapa, deadline: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Človekodiny celkom</label>
                  <input type="number" step="1" placeholder="napr. 400"
                    value={novaEtapa.clovekohod || ''}
                    onChange={(e) => setNovaEtapa({...novaEtapa, clovekohod: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Počet ľudí</label>
                  <input type="number" step="1" min="1" placeholder="napr. 4"
                    value={novaEtapa.pocetLudi || ''}
                    onChange={(e) => setNovaEtapa({...novaEtapa, pocetLudi: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
              </div>

              {/* Výsledok výpočtu */}
              {datumKonca && (
                <div className={`mt-4 rounded-lg p-4 flex items-center gap-4 ${
                  stavSemafora === 'ok' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}>
                  <div className={`w-4 h-4 rounded-full flex-shrink-0 ${
                    stavSemafora === 'ok' ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      Reálny dátum dokončenia: <strong>{new Date(datumKonca).toLocaleDateString('sk-SK')}</strong>
                      {' '}({Math.ceil(parseFloat(novaEtapa.clovekohod) / (parseInt(novaEtapa.pocetLudi) * 8))} dní)
                    </p>
                    {stavSemafora === 'ok'
                      ? <p className="text-xs text-green-700 mt-0.5">Stihnete deadline ✓</p>
                      : <p className="text-xs text-red-700 mt-0.5">Nestihnete deadline — zvýšte počet ľudí alebo posuňte deadline</p>
                    }
                  </div>
                </div>
              )}
            </div>

            {/* DÁTUMY */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Podrobné termíny</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dátum ukončenia</label>
                  <input type="date" value={novaEtapa.datumUkoncenia}
                    onChange={(e) => setNovaEtapa({...novaEtapa, datumUkoncenia: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div></div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Výroba od</label>
                  <input type="date" value={novaEtapa.datumVyrobyOd}
                    onChange={(e) => setNovaEtapa({...novaEtapa, datumVyrobyOd: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Výroba do</label>
                  <input type="date" value={novaEtapa.datumVyrobyDo}
                    onChange={(e) => setNovaEtapa({...novaEtapa, datumVyrobyDo: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Povrchová úprava od</label>
                  <input type="date" value={novaEtapa.datumPovrchovejUpravyOd}
                    onChange={(e) => setNovaEtapa({...novaEtapa, datumPovrchovejUpravyOd: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Povrchová úprava do</label>
                  <input type="date" value={novaEtapa.datumPovrchovejUpravyDo}
                    onChange={(e) => setNovaEtapa({...novaEtapa, datumPovrchovejUpravyDo: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Montáž od</label>
                  <input type="date" value={novaEtapa.datumMontazeOd}
                    onChange={(e) => setNovaEtapa({...novaEtapa, datumMontazeOd: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Montáž do</label>
                  <input type="date" value={novaEtapa.datumMontazeDo}
                    onChange={(e) => setNovaEtapa({...novaEtapa, datumMontazeDo: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
              </div>
            </div>

            {/* ÚPRAVY */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Povrchové úpravy</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Zinkovanie</label>
                  <select value={novaEtapa.zinkovanie}
                    onChange={(e) => setNovaEtapa({...novaEtapa, zinkovanie: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                    <option value="nic">Žiadne</option>
                    <option value="ponorove">Ponorové</option>
                    <option value="galvanicke">Galvanické</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Farba</label>
                  <select value={novaEtapa.farba}
                    onChange={(e) => setNovaEtapa({...novaEtapa, farba: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                    <option value="nic">Žiadna</option>
                    <option value="praskovaMat">Prášková mat</option>
                    <option value="praskovaLes">Prášková lesk</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Odtieň farby (RAL)</label>
                  <input type="text" value={novaEtapa.farbaTon}
                    onChange={(e) => setNovaEtapa({...novaEtapa, farbaTon: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="napr. RAL 9005" />
                </div>
              </div>
            </div>

            {/* POPIS */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Popis / Poznámky</label>
              <textarea value={novaEtapa.popis}
                onChange={(e) => setNovaEtapa({...novaEtapa, popis: e.target.value})}
                rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>

            {/* STAV */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stav etapy</label>
              <select value={novaEtapa.stav}
                onChange={(e) => setNovaEtapa({...novaEtapa, stav: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                {Object.entries(stavyEtap).map(([hodnota, {label}]) => (
                  <option key={hodnota} value={hodnota}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={onPridat}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium">
              Vytvoriť projekt
            </button>
            <button onClick={onZrusit}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
              Zrušiť
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
