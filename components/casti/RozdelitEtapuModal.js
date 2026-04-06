'use client'
import { useState, useEffect } from 'react';
import { X, Plus, CheckCircle } from 'lucide-react';
import { vytvorCast, nacitajCastiEtapy, nacitajZaradenie } from '../../lib/api/casti';

export default function RozdelitEtapuModal({ etapa, onClose, onSuccess }) {
  const [nazovCasti, setNazovCasti] = useState('');
  const [vyber, setVyber] = useState({});
  const [zaradenie, setZaradenie] = useState({});
  const [pocetCasti, setPocetCasti] = useState(0);
  const [stav, setStav] = useState('idle');
  const [chyba, setChyba] = useState('');

  useEffect(() => {
    inicializuj();
  }, []);

  async function inicializuj() {
    const [casti, zaradenieData] = await Promise.all([
      nacitajCastiEtapy(etapa.id),
      nacitajZaradenie(etapa.id)
    ]);

    setPocetCasti(casti.length);
    setZaradenie(zaradenieData);

    const init = {};
    for (const d of etapa.dielce || []) {
      const uzZaradene = zaradenieData[d.id] || 0;
      const zostatok = Number(d.mnozstvo) - uzZaradene;
      init[d.id] = {
        zaskrtnute: zostatok > 0,
        mnozstvo: zostatok > 0 ? zostatok : 0
      };
    }
    setVyber(init);
  }

  function toggleDielec(dielecId, maxZostatok) {
    setVyber(prev => ({
      ...prev,
      [dielecId]: {
        ...prev[dielecId],
        zaskrtnute: !prev[dielecId]?.zaskrtnute,
        mnozstvo: !prev[dielecId]?.zaskrtnute ? maxZostatok : 0
      }
    }));
  }

  function zmenMnozstvo(dielecId, hodnota, maxZostatok) {
    const num = Math.min(Math.max(0, Number(hodnota)), maxZostatok);
    setVyber(prev => ({
      ...prev,
      [dielecId]: { ...prev[dielecId], mnozstvo: num }
    }));
  }

  async function handleVytvorit() {
    if (!nazovCasti.trim()) { setChyba('Zadaj názov časti'); return; }

    const priradenia = Object.entries(vyber)
      .filter(([_, v]) => v.zaskrtnute && v.mnozstvo > 0)
      .map(([dielec_id, v]) => ({ dielec_id: Number(dielec_id), mnozstvo: v.mnozstvo }));

    if (priradenia.length === 0) { setChyba('Vyber aspoň jeden dielec'); return; }

    for (const p of priradenia) {
      const uzZaradene = zaradenie[p.dielec_id] || 0;
      const dielec = etapa.dielce.find(d => d.id === p.dielec_id);
      const maxZostatok = Number(dielec.mnozstvo) - uzZaradene;
      if (p.mnozstvo > maxZostatok) {
        setChyba(`${dielec.cislo_dielca || dielec.nazov}: množstvo presahuje zostatok (${maxZostatok})`);
        return;
      }
    }

    setStav('loading');
    setChyba('');

    try {
      await vytvorCast(etapa.id, nazovCasti.trim(), pocetCasti + 1, priradenia);
      setStav('success');
      setTimeout(() => { onSuccess(); onClose(); }, 1000);
    } catch (err) {
      setStav('idle');
      setChyba('Chyba: ' + err.message);
    }
  }

  const dielce = etapa.dielce || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Rozdeliť etapu</h2>
            <p className="text-sm text-gray-500 mt-1">{etapa.nazov}</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>

        {/* Názov časti */}
        <div className="px-6 pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Názov novej časti</label>
          <input
            type="text"
            value={nazovCasti}
            onChange={e => setNazovCasti(e.target.value)}
            placeholder="napr. Časť 1 — výroba január"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Tabuľka dielcov */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 w-8"></th>
                <th className="text-left py-2 text-gray-500 font-medium">Č. dielca</th>
                <th className="text-left py-2 text-gray-500 font-medium">Názov</th>
                <th className="text-right py-2 text-gray-500 font-medium">Celkom</th>
                <th className="text-right py-2 text-gray-500 font-medium">Zostatok</th>
                <th className="text-right py-2 text-gray-500 font-medium">Do tejto časti</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {dielce.map(d => {
                const uzZaradene = zaradenie[d.id] || 0;
                const zostatok = Number(d.mnozstvo) - uzZaradene;
                const vybrane = vyber[d.id] || { zaskrtnute: false, mnozstvo: 0 };
                const jeNedostupny = zostatok <= 0;

                return (
                  <tr key={d.id} className={jeNedostupny ? 'opacity-40' : 'hover:bg-gray-50'}>
                    <td className="py-3">
                      <input
                        type="checkbox"
                        checked={vybrane.zaskrtnute}
                        disabled={jeNedostupny}
                        onChange={() => toggleDielec(d.id, zostatok)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600"
                      />
                    </td>
                    <td className="py-3 font-mono text-gray-500 text-xs">{d.cislo_dielca || '—'}</td>
                    <td className="py-3 text-gray-800">{d.nazov || '—'}</td>
                    <td className="py-3 text-right text-gray-600">{d.mnozstvo}</td>
                    <td className="py-3 text-right">
                      <span className={`font-medium ${zostatok > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                        {zostatok}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {vybrane.zaskrtnute ? (
                        <input
                          type="number"
                          min="0"
                          max={zostatok}
                          step="1"
                          value={vybrane.mnozstvo}
                          onChange={e => zmenMnozstvo(d.id, e.target.value, zostatok)}
                          className="w-20 px-2 py-1 border border-blue-300 rounded text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Chyba */}
        {chyba && (
          <div className="mx-6 mb-2 px-3 py-2 bg-red-50 text-red-700 text-sm rounded-lg">{chyba}</div>
        )}

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t">
          <button onClick={onClose} className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
            Zrušiť
          </button>
          <button
            onClick={handleVytvorit}
            disabled={stav === 'loading' || stav === 'success'}
            className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {stav === 'success' ? (
              <><CheckCircle size={16} /> Vytvorené</>
            ) : stav === 'loading' ? 'Ukladám...' : (
              <><Plus size={16} /> Vytvoriť časť</>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
