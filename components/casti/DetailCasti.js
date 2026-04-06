'use client'
import { useState, useEffect } from 'react';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { nacitajCastiEtapy, aktualizujStavDielcaCasti, vymazCast } from '../../lib/api/casti';

const FAZY = [
  { pole: 'poskladane',      label: 'Poskladané',       farba: 'text-blue-600' },
  { pole: 'zvarene',         label: 'Zvarené',          farba: 'text-orange-600' },
  { pole: 'povrchova_uprava',label: 'Povrch. úprava',   farba: 'text-purple-600' },
  { pole: 'vyvezene',        label: 'Vyvezené',         farba: 'text-yellow-600' },
  { pole: 'namontovane',     label: 'Namontované',      farba: 'text-green-600' },
];

export default function DetailCasti({ etapa, onSpat, nacitajData }) {
  const [casti, setCasti] = useState([]);
  const [aktivnaCast, setAktivnaCast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ukladam, setUkladam] = useState(null); // id dielecCasti ktorý sa práve ukladá

  useEffect(() => {
    nacitaj();
  }, [etapa.id]);

  async function nacitaj() {
    setLoading(true);
    try {
      const data = await nacitajCastiEtapy(etapa.id);
      setCasti(data);
      if (data.length > 0 && !aktivnaCast) {
        setAktivnaCast(data[0].id);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckbox(dielecCastiId, pole, aktualnaHodnota) {
    setUkladam(`${dielecCastiId}-${pole}`);
    try {
      await aktualizujStavDielcaCasti(dielecCastiId, pole, !aktualnaHodnota);
      // Aktualizuj lokálny stav bez reloadu
      setCasti(prev => prev.map(cast => ({
        ...cast,
        dielce: cast.dielce.map(dc =>
          dc.id === dielecCastiId
            ? { ...dc, [pole]: !aktualnaHodnota }
            : dc
        )
      })));
    } catch (err) {
      alert('Chyba pri ukladaní: ' + err.message);
    } finally {
      setUkladam(null);
    }
  }

  async function handleVymazCast(castId) {
    if (!confirm('Naozaj vymazať túto časť?')) return;
    try {
      await vymazCast(castId);
      await nacitaj();
      nacitajData();
    } catch (err) {
      alert('Chyba: ' + err.message);
    }
  }

  function progres(cast) {
    const total = cast.dielce.length * FAZY.length;
    if (total === 0) return 0;
    const hotove = cast.dielce.reduce((sum, dc) =>
      sum + FAZY.filter(f => dc[f.pole]).length, 0
    );
    return Math.round((hotove / total) * 100);
  }

  if (loading) return <p className="text-gray-400 py-8 text-center">Načítavam...</p>;

  if (casti.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">Etapa nemá žiadne časti.</p>
        <p className="text-sm text-gray-400 mt-1">Použi tlačidlo "Rozdeliť etapu" na vytvorenie časti.</p>
      </div>
    );
  }

  const cast = casti.find(c => c.id === aktivnaCast) || casti[0];

  return (
    <div className="space-y-4">

      {/* TABS — výber časti */}
      <div className="flex gap-2 flex-wrap">
        {casti.map(c => {
          const p = progres(c);
          return (
            <button
              key={c.id}
              onClick={() => setAktivnaCast(c.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                c.id === aktivnaCast
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-purple-300'
              }`}
            >
              <span className="font-medium text-sm">{c.nazov}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                c.id === aktivnaCast ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                {p}%
              </span>
            </button>
          );
        })}
      </div>

      {/* DETAIL AKTÍVNEJ ČASTI */}
      {cast && (
        <div className="bg-white rounded-lg shadow">

          {/* Header časti */}
          <div className="flex items-center justify-between p-4 border-b">
            <div>
              <h3 className="font-semibold text-gray-800">{cast.nazov}</h3>
              <p className="text-sm text-gray-500">{cast.dielce.length} dielcov</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Progres bar */}
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all"
                    style={{ width: `${progres(cast)}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-600">{progres(cast)}%</span>
              </div>
              <button
                onClick={() => handleVymazCast(cast.id)}
                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {/* Tabuľka dielcov s checkboxmi */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Č. dielca</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Názov</th>
                  <th className="text-right px-4 py-3 text-gray-500 font-medium">Počet</th>
                  {FAZY.map(f => (
                    <th key={f.pole} className={`text-center px-3 py-3 font-medium text-xs ${f.farba}`}>
                      {f.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {cast.dielce.map(dc => {
                  const d = dc.dielce;
                  const vsetkyHotove = FAZY.every(f => dc[f.pole]);

                  return (
                    <tr
                      key={dc.id}
                      className={`hover:bg-gray-50 transition-colors ${vsetkyHotove ? 'bg-green-50' : ''}`}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">
                        {d?.cislo_dielca || '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-800">
                        {d?.nazov || '—'}
                        {d?.profil && (
                          <span className="ml-2 text-xs text-gray-400">{d.profil}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-700">
                        {dc.mnozstvo}
                      </td>
                      {FAZY.map(f => {
                        const kluc = `${dc.id}-${f.pole}`;
                        const jeUkladam = ukladam === kluc;
                        const jeZaskrtnuty = !!dc[f.pole];

                        return (
                          <td key={f.pole} className="px-3 py-3 text-center">
                            <button
                              onClick={() => handleCheckbox(dc.id, f.pole, jeZaskrtnuty)}
                              disabled={jeUkladam}
                              className={`w-6 h-6 rounded border-2 flex items-center justify-center mx-auto transition-all ${
                                jeUkladam
                                  ? 'opacity-50 cursor-wait border-gray-300'
                                  : jeZaskrtnuty
                                  ? 'bg-green-500 border-green-500 text-white'
                                  : 'border-gray-300 hover:border-green-400'
                              }`}
                            >
                              {jeZaskrtnuty && (
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                  <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              )}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>
      )}
    </div>
  );
}
