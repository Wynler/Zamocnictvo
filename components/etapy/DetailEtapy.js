import { ArrowLeft, Pencil, Plus, Trash2, Upload, X } from 'lucide-react';

export default function DetailEtapy({
  aktualnaZakazka,
  aktualnaEtapa,
  stavyEtap,
  editujemEtapu,
  editovanaEtapa,
  setEditovanaEtapa,
  novyDielec,
  setNovyDielec,
  editujemDielec,
  editovanyDielec,
  setEditovanyDielec,
  importStatus,
  showImportStatus,
  setShowImportStatus,
  onSpat,
  onZacatEditovatEtapu,
  onUlozitEtapu,
  onZrusitEditaciuEtapy,
  onZmenitStavEtapy,
  onPridatDielec,
  onVymazatDielec,
  onZacatEditovatDielec,
  onUlozitDielec,
  onZrusitEditaciuDielca,
  onImportExcel,
  vypocitajPracovneDni,
  generateKalendar
}) {
  const dniVyroba = vypocitajPracovneDni(aktualnaEtapa.datumVyrobyOd, aktualnaEtapa.datumVyrobyDo);
  const dniPovrch = vypocitajPracovneDni(aktualnaEtapa.datumPovrchovejUpravyOd, aktualnaEtapa.datumPovrchovejUpravyDo);
  const dniMontaz = vypocitajPracovneDni(aktualnaEtapa.datumMontazeOd, aktualnaEtapa.datumMontazeDo);
  const kalendar = generateKalendar(aktualnaEtapa);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* IMPORT STATUS */}
        {showImportStatus && (
          <div className="fixed top-4 right-4 bg-white shadow-lg rounded-lg p-4 border-l-4 border-blue-500 z-50 max-w-md">
            <div className="flex items-start gap-3">
              <p className="text-sm font-medium text-gray-800">{importStatus}</p>
              <button onClick={() => setShowImportStatus(false)} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* HEADER */}
        <button onClick={onSpat} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
          <ArrowLeft size={20} /> Späť na zákazku
        </button>

        {/* DIELCE TABUĽKA */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Dielce ({aktualnaEtapa.dielce?.length || 0})
            </h2>
            <div className="flex gap-2">
              <label className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 cursor-pointer">
                <Upload size={16} />
                Import Excel
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={onImportExcel}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* PRIDAŤ DIELEC FORM */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <input
                type="text"
                placeholder="Názov dielca"
                value={novyDielec.nazov}
                onChange={(e) => setNovyDielec({...novyDielec, nazov: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Množstvo"
                value={novyDielec.mnozstvo}
                onChange={(e) => setNovyDielec({...novyDielec, mnozstvo: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              />
              <select
                value={novyDielec.jednotka}
                onChange={(e) => setNovyDielec({...novyDielec, jednotka: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="m">m (metre)</option>
                <option value="kg">kg (kilogramy)</option>
                <option value="ks">ks (kusy)</option>
              </select>
              <input
                type="text"
                placeholder="Poznámka"
                value={novyDielec.poznamka}
                onChange={(e) => setNovyDielec({...novyDielec, poznamka: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              />
              <button
                onClick={onPridatDielec}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                Pridať
              </button>
            </div>
          </div>

          {/* TABLE */}
          {aktualnaEtapa.dielce && aktualnaEtapa.dielce.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Názov</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hmotnosť (kg/ks)</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Množstvo</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jednotka</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Poznámka</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Akcie</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {aktualnaEtapa.dielce.map((dielec) => (
                    <tr key={dielec.id} className="hover:bg-gray-50">
                      {editujemDielec && editovanyDielec?.id === dielec.id ? (
                        <>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={editovanyDielec.nazov}
                              onChange={(e) => setEditovanyDielec({...editovanyDielec, nazov: e.target.value})}
                              className="w-full px-2 py-1 border border-blue-300 rounded"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              step="0.01"
                              value={editovanyDielec.hmotnostJednehoKs || ''}
                              onChange={(e) => setEditovanyDielec({...editovanyDielec, hmotnostJednehoKs: e.target.value})}
                              className="w-full px-2 py-1 border border-blue-300 rounded"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              step="0.01"
                              value={editovanyDielec.mnozstvo}
                              onChange={(e) => setEditovanyDielec({...editovanyDielec, mnozstvo: e.target.value})}
                              className="w-full px-2 py-1 border border-blue-300 rounded"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={editovanyDielec.jednotka}
                              onChange={(e) => setEditovanyDielec({...editovanyDielec, jednotka: e.target.value})}
                              className="w-full px-2 py-1 border border-blue-300 rounded"
                            >
                              <option value="m">m</option>
                              <option value="kg">kg</option>
                              <option value="ks">ks</option>
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={editovanyDielec.poznamka || ''}
                              onChange={(e) => setEditovanyDielec({...editovanyDielec, poznamka: e.target.value})}
                              className="w-full px-2 py-1 border border-blue-300 rounded"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={onUlozitDielec}
                                className="text-green-600 hover:text-green-700 text-sm"
                              >
                                ✓ Uložiť
                              </button>
                              <button
                                onClick={onZrusitEditaciuDielca}
                                className="text-gray-600 hover:text-gray-700 text-sm"
                              >
                                Zrušiť
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-3 font-medium text-gray-800">{dielec.nazov}</td>
                          <td className="px-4 py-3 text-gray-600">{dielec.hmotnostJednehoKs || '-'}</td>
                          <td className="px-4 py-3 text-gray-600">{dielec.mnozstvo}</td>
                          <td className="px-4 py-3 text-gray-600">{dielec.jednotka}</td>
                          <td className="px-4 py-3 text-gray-600">{dielec.poznamka || '-'}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => onZacatEditovatDielec(dielec)}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                onClick={() => onVymazatDielec(dielec.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center py-8 text-gray-500">Zatiaľ žiadne dielce</p>
          )}
        </div>

        {/* KALENDÁR */}
        {kalendar && kalendar.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Harmonogram</h2>
            <div className="space-y-2">
              {kalendar.map((zaznam, index) => (
                <div key={index} className={`flex items-center gap-3 p-3 rounded-lg ${
                  zaznam.typ === 'vyroba' ? 'bg-blue-50' :
                  zaznam.typ === 'povrch' ? 'bg-purple-50' :
                  zaznam.typ === 'montaz' ? 'bg-orange-50' : 'bg-gray-50'
                }`}>
                  <span className="text-sm font-medium text-gray-600 w-24">{zaznam.datum}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    zaznam.typ === 'vyroba' ? 'bg-blue-200 text-blue-800' :
                    zaznam.typ === 'povrch' ? 'bg-purple-200 text-purple-800' :
                    zaznam.typ === 'montaz' ? 'bg-orange-200 text-orange-800' : 'bg-gray-200 text-gray-800'
                  }`}>
                    {zaznam.typ === 'vyroba' ? '🔧 Výroba' :
                     zaznam.typ === 'povrch' ? '🎨 Povrch' :
                     zaznam.typ === 'montaz' ? '🏗️ Montáž' : zaznam.typ}
                  </span>
                  <span className="text-sm text-gray-700">{zaznam.popis}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
