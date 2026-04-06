'use client'
import { useState, useEffect } from 'react';
import { nacitajCastiEtapy } from '../../lib/api/casti';

export default function PrehladCasti({ etapa }) {
  const [casti, setCasti] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    nacitaj();
  }, [etapa.id]);

  async function nacitaj() {
    setLoading(true);
    try {
      const data = await nacitajCastiEtapy(etapa.id);
      setCasti(data);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <p className="text-sm text-gray-400 py-4">Načítavam...</p>;
  if (casti.length === 0) return null;

  const dielce = etapa.dielce || [];

  // Pre každý dielec vypočítame koľko je v každej časti
  function mnozstvoVCasti(dielecId, cast) {
    const priradenie = cast.dielce?.find(dc => dc.dielec_id === dielecId);
    return priradenie ? priradenie.mnozstvo : null;
  }

  function celkomZaradene(dielecId) {
    return casti.reduce((sum, cast) => {
      const p = cast.dielce?.find(dc => dc.dielec_id === dielecId);
      return sum + (p ? Number(p.mnozstvo) : 0);
    }, 0);
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Prehľad rozdelenia ({casti.length} časti)
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-3 px-3 text-gray-500 font-medium">Č. dielca</th>
              <th className="text-left py-3 px-3 text-gray-500 font-medium">Názov</th>
              <th className="text-right py-3 px-3 text-gray-500 font-medium bg-gray-50 rounded">Celkom</th>
              {casti.map(cast => (
                <th key={cast.id} className="text-right py-3 px-3 text-blue-600 font-medium whitespace-nowrap">
                  {cast.nazov}
                </th>
              ))}
              <th className="text-right py-3 px-3 font-medium text-orange-500">Nezaradené</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {dielce.map(d => {
              const zaradene = celkomZaradene(d.id);
              const nezaradene = Number(d.mnozstvo) - zaradene;

              return (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="py-3 px-3 font-mono text-gray-500 text-xs">{d.cislo_dielca || '—'}</td>
                  <td className="py-3 px-3 text-gray-800">{d.nazov || '—'}</td>
                  <td className="py-3 px-3 text-right font-medium text-gray-700 bg-gray-50">{d.mnozstvo}</td>
                  {casti.map(cast => {
                    const hodnota = mnozstvoVCasti(d.id, cast);
                    return (
                      <td key={cast.id} className="py-3 px-3 text-right">
                        {hodnota !== null ? (
                          <span className="font-medium text-blue-700">{hodnota}</span>
                        ) : (
                          <span className="text-gray-200">—</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="py-3 px-3 text-right">
                    {nezaradene > 0 ? (
                      <span className="font-medium text-orange-500">{nezaradene}</span>
                    ) : (
                      <span className="text-green-500 font-medium">✓</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>

          {/* Súčtový riadok */}
          <tfoot>
            <tr className="border-t-2 border-gray-200 bg-gray-50">
              <td colSpan={2} className="py-3 px-3 text-sm font-medium text-gray-500">Spolu (ks)</td>
              <td className="py-3 px-3 text-right font-bold text-gray-700">
                {dielce.reduce((s, d) => s + Number(d.mnozstvo), 0)}
              </td>
              {casti.map(cast => (
                <td key={cast.id} className="py-3 px-3 text-right font-bold text-blue-700">
                  {cast.dielce?.reduce((s, dc) => s + Number(dc.mnozstvo), 0) || 0}
                </td>
              ))}
              <td className="py-3 px-3 text-right font-bold text-orange-500">
                {dielce.reduce((s, d) => s + Math.max(0, Number(d.mnozstvo) - celkomZaradene(d.id)), 0)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
