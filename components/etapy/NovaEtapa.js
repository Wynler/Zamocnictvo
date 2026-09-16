import { vypocitajVyrobnyPlan, ZINKOVANIE_DNI, FARBA_DNI, PIESKOVANIE_DNI_DEFAULT } from '../../lib/planovanie/vyrobnyPlan';

function formatDatum(datumStr) {
  if (!datumStr) return '—';
  return new Date(datumStr).toLocaleDateString('sk-SK');
}

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

  const plan = vypocitajVyrobnyPlan(novaEtapa);

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

            {/* TERMÍN OD ZÁKAZNÍKA */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Termín od zákazníka</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Zmluvný termín odovzdania</label>
                  <input type="date" value={novaEtapa.deadline || ''}
                    onChange={(e) => setNovaEtapa({...novaEtapa, deadline: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
              </div>
            </div>

            {/* MATERIÁL A VÝROBA */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Materiál a výroba</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dátum materiálu (kedy bude k dispozícii)</label>
                  <input type="date" value={novaEtapa.datumMaterialu || ''}
                    onChange={(e) => setNovaEtapa({...novaEtapa, datumMaterialu: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Želaný štart výroby (nepovinné)</label>
                  <input type="date" value={novaEtapa.zelanyStartVyroby || ''}
                    onChange={(e) => setNovaEtapa({...novaEtapa, zelanyStartVyroby: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                  <p className="text-xs text-gray-400 mt-1">Prázdne = začne v deň, keď bude materiál</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Človekodiny na výrobu</label>
                  <input type="number" step="1" placeholder="napr. 400"
                    value={novaEtapa.clovekohod || ''}
                    onChange={(e) => setNovaEtapa({...novaEtapa, clovekohod: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Počet ľudí na výrobe</label>
                  <input type="number" step="1" min="1" placeholder="napr. 4"
                    value={novaEtapa.pocetLudi || ''}
                    onChange={(e) => setNovaEtapa({...novaEtapa, pocetLudi: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
              </div>
            </div>

            {/* POVRCHOVÁ ÚPRAVA */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Povrchová úprava</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Zinkovanie</label>
                  <select value={novaEtapa.zinkovanie}
                    onChange={(e) => setNovaEtapa({
                      ...novaEtapa,
                      zinkovanie: e.target.value,
                      zinkovanieDni: ZINKOVANIE_DNI[e.target.value] ?? 0
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                    <option value="nic">Bez zinku</option>
                    <option value="ponorove">Žiarové zinkovanie</option>
                    <option value="galvanicke">Galvanické zinkovanie</option>
                  </select>
                  <input type="number" step="1" min="0"
                    value={novaEtapa.zinkovanieDni ?? ZINKOVANIE_DNI[novaEtapa.zinkovanie] ?? 0}
                    onChange={(e) => setNovaEtapa({...novaEtapa, zinkovanieDni: e.target.value})}
                    className="w-full mt-2 px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                    placeholder="dní" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Farba</label>
                  <select value={novaEtapa.farba}
                    onChange={(e) => setNovaEtapa({
                      ...novaEtapa,
                      farba: e.target.value,
                      farbaDni: FARBA_DNI[e.target.value] ?? 0
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                    <option value="nic">Bez farby</option>
                    <option value="praskova">Prášková farba</option>
                    <option value="mokra">Mokrá farba</option>
                    <option value="protipoziar">Protipožiarny náter</option>
                  </select>
                  <input type="number" step="1" min="0"
                    value={novaEtapa.farbaDni ?? FARBA_DNI[novaEtapa.farba] ?? 0}
                    onChange={(e) => setNovaEtapa({...novaEtapa, farbaDni: e.target.value})}
                    className="w-full mt-2 px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                    placeholder="dní" />
                  <input type="text" value={novaEtapa.farbaTon || ''}
                    onChange={(e) => setNovaEtapa({...novaEtapa, farbaTon: e.target.value})}
                    className="w-full mt-2 px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                    placeholder="Odtieň, napr. RAL 9005" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <input type="checkbox" checked={!!novaEtapa.pieskovanie}
                      onChange={(e) => setNovaEtapa({
                        ...novaEtapa,
                        pieskovanie: e.target.checked,
                        pieskovanieDni: e.target.checked ? (novaEtapa.pieskovanieDni ?? PIESKOVANIE_DNI_DEFAULT) : novaEtapa.pieskovanieDni
                      })}
                    />
                    Pieskovanie (bonus)
                  </label>
                  {novaEtapa.pieskovanie && (
                    <input type="number" step="1" min="0"
                      value={novaEtapa.pieskovanieDni ?? PIESKOVANIE_DNI_DEFAULT}
                      onChange={(e) => setNovaEtapa({...novaEtapa, pieskovanieDni: e.target.value})}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                      placeholder="dní" />
                  )}
                </div>
              </div>
            </div>

            {/* MONTÁŽ */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Montáž</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Počet dní na montáž</label>
                  <input type="number" step="1" min="0" placeholder="napr. 5"
                    value={novaEtapa.montazDni || ''}
                    onChange={(e) => setNovaEtapa({...novaEtapa, montazDni: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
              </div>
            </div>

            {/* VÝSLEDOK VÝPOČTU */}
            {plan.startVyroby && (
              <div className={`rounded-lg p-4 border ${
                plan.rezervaDni === null ? 'bg-gray-50 border-gray-200'
                  : plan.rezervaDni >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                {plan.posunuteMaterialom && (
                  <p className="text-xs text-orange-600 mb-2">⚠ Štart posunutý — materiál bude neskôr, než bol želaný štart</p>
                )}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Štart výroby</p>
                    <p className="font-medium text-gray-800">{formatDatum(plan.startVyroby)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Koniec výroby ({plan.trvanieVyroby} dní)</p>
                    <p className="font-medium text-gray-800">{formatDatum(plan.koniecVyroby)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Koniec povrchu ({plan.povrchDni} dní)</p>
                    <p className="font-medium text-gray-800">{formatDatum(plan.koniecPovrchu)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Koniec montáže</p>
                    <p className="font-medium text-gray-800">{formatDatum(plan.koniecMontaze)}</p>
                  </div>
                </div>
                {plan.rezervaDni !== null && (
                  <p className={`text-sm font-medium mt-3 ${plan.rezervaDni >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {plan.rezervaDni >= 0
                      ? `Rezerva ${plan.rezervaDni} pracovných dní oproti termínu ✓`
                      : `Meškanie ${Math.abs(plan.rezervaDni)} pracovných dní oproti termínu`}
                  </p>
                )}
              </div>
            )}

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
