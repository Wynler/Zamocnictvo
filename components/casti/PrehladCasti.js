'use client'
import { useState, useEffect } from 'react';
import { nacitajCastiEtapy } from '../../lib/api/casti';

const FAZY = [
  { pole: 'poskladane',       label: 'Poskladané' },
  { pole: 'zvarene',          label: 'Zvarené' },
  { pole: 'povrchova_uprava', label: 'Povrch' },
  { pole: 'vyvezene',         label: 'Vyvezené' },
  { pole: 'namontovane',      label: 'Montáž' },
];

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

  if (loading) return <p className="text-sm text-gray-400 py-2">Načítavam časti...</p>;
  if (casti.length === 0) return null;

  const dielce = etapa.dielce || [];

  function mnozstvoVCasti(dielecId, cast) {
    const p = cast.dielce?.find(dc => dc.dielec_id === dielecId);
    return p ? p.mnozstvo : null;
  }

  function celkomZaradene(dielecId) {
    return casti.reduce((sum, cast) => {
      const p = cast.dielce?.find(dc => dc.dielec_id === dielecId);
      return sum + (p ? Number(p.mnozstvo) : 0);
    }, 0);
  }

  function stavCasti(cast) {
    const total = cast.dielce.length * FAZY.length;
    if (total === 0) return 0;
    const hotove = cast.dielce.reduce((sum, dc) =>
      sum + FAZY.filter(f => dc[f.pole]).length, 0
    );
    return Math.round((hotove / total) * 100);
  }

  return (
    <div className="mb-6 bg-gray-50 rounded-lg p-4">
      <h3 className="text-sm font-medium text-gray-600 mb-3">
        Prehľad rozdelenia ({casti.length} {casti.length === 1 ? 'časť' : 'časti'})
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 px-2 text-gray-500 font-medium text-xs">Č. dielca</th>
              <th className="text-left py-2 px-2 text-gray-500 font-medium text-xs">Názov</th>
              <th className="text-right py-2 px-2 text-gray-500 font-medium text-xs bg-gray-100 rounded">Celkom</th>
              {casti.map(cast => (
                <th key={cast.id} className="text-right py-2 px-2 text-xs whitespace-nowrap">
                  <span className="text-purple-600 font-medium">{cast.nazov}</span>
                  <div className="flex items-center justify-end gap-1 mt-0.5">
                    <div className="w-12 h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: `${stavCasti(cast)}%` }} />
                    </div>
                    <span className="text-gray-400 text-xs">{stavCasti(cast)}%</span>
                  </div>
                </th>
              ))}
              <th className="text-right py-2 px-2 text-orange-500 font-medium text-xs">Nezaradené</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {dielce.map(d => {
              const zaradene = celkomZaradene(d.id);
              const nezaradene = Number(d.mnozstvo) - zaradene;

              return (
                <tr key={d.id} className="hover:bg-white">
                  <td className="py-2 px-2 font-mono text-xs text-gray-400">{d.cislo_dielca || '—'}</td>
                  <td className="py-2 px-2 text-gray-700 text-xs">{d.nazov || '—'}</td>
                  <td className="py-2 px-2 text-right font-medium text-gray-600 bg-gray-100 text-xs">{d.mnozstvo}</td>
                  {casti.map(cast => {
                    const hodnota = mnozstvoVCasti(d.id, cast);
                    const dc = cast.dielce?.find(dc => dc.dielec_id === d.id);
                    const vsetkyHotove = dc && FAZY.every(f => dc[f.pole]);
                    return (
                      <td key={cast.id} className="py-2 px-2 text-right text-xs">
                        {hodnota !== null ? (
                          <span className={`font-medium ${vsetkyHotove ? 'text-green-600' : 'text-purple-700'}`}>
                            {hodnota} {vsetkyHotove ? '✓' : ''}
                          </span>
                        ) : (
                          <span className="text-gray-200">—</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="py-2 px-2 text-right text-xs">
                    {nezaradene > 0 ? (
                      <span className="font-medium text-orange-500">{nezaradene}</span>
                    ) : (
                      <span className="text-green-500">✓</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-gray-200">
              <td colSpan={2} className="py-2 px-2 text-xs font-medium text-gray-400">Spolu</td>
              <td className="py-2 px-2 text-right font-bold text-gray-600 text-xs bg-gray-100">
                {dielce.reduce((s, d) => s + Number(d.mnozstvo), 0)}
              </td>
              {casti.map(cast => (
                <td key={cast.id} className="py-2 px-2 text-right font-bold text-purple-700 text-xs">
                  {cast.dielce?.reduce((s, dc) => s + Number(dc.mnozstvo), 0) || 0}
                </td>
              ))}
              <td className="py-2 px-2 text-right font-bold text-orange-500 text-xs">
                {dielce.reduce((s, d) => s + Math.max(0, Number(d.mnozstvo) - celkomZaradene(d.id)), 0)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
