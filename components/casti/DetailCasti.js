'use client'
import { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { nacitajCastiEtapy, aktualizujStavDielcaCasti, vymazCast } from '../../lib/api/casti';
import ZoznamMaterialu from './ZoznamMaterialu';

const FAZY = [
  { pole: 'poskladane',        label: 'Poskladané',     farba: 'text-blue-600'   },
  { pole: 'zvarene',           label: 'Zvarené',        farba: 'text-orange-600' },
  { pole: 'povrchova_uprava',  label: 'Povrch. úprava', farba: 'text-purple-600' },
  { pole: 'vyvezene',          label: 'Vyvezené',       farba: 'text-yellow-600' },
  { pole: 'namontovane',       label: 'Namontované',    farba: 'text-green-600'  },
];

function dalsiFilter(aktualny) {
  if (aktualny === null) return 'nehotove';
  if (aktualny === 'nehotove') return 'hotove';
  return null;
}

function labelFiltra(stav) {
  if (stav === 'nehotove') return '✗';
  if (stav === 'hotove') return '✓';
  return null;
}

export default function DetailCasti({ etapa, onSpat, nacitajData }) {
  const [casti, setCasti] = useState([]);
  const [aktivnaCast, setAktivnaCast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ukladam, setUkladam] = useState(null);
  const [filtre, setFiltre] = useState({});
  const [aktualnyTab, setAktualnyTab] = useState('dielce');
  const [zmenene, setZmenene] = useState(false);
  const [ukladamStav, setUkladamStav] = useState(false);

  useEffect(() => { nacitaj(); }, [etapa.id]);

  async function nacitaj() {
    setLoading(true);
    try {
      const data = await nacitajCastiEtapy(etapa.id);
      setCasti(data);
      if (data.length > 0 && !aktivnaCast) setAktivnaCast(data[0].id);
    } finally {
      setLoading(false);
    }
  }

  // Checkbox mení len lokálny state
  function handleCheckbox(dielecCastiId, pole, aktualnaHodnota) {
    setCasti(prev => prev.map(cast => ({
      ...cast,
      dielce: cast.dielce.map(dc =>
        dc.id === dielecCastiId ? { ...dc, [pole]: !aktualnaHodnota } : dc
      )
    })));
    setZmenene(true);
  }

  // Uloží všetky zmeny naraz + timestamp
  async function handleUlozitStav() {
    const cast = casti.find(c => c.id === aktivnaCast);
    if (!cast) return;
    setUkladamStav(true);
    try {
      for (const dc of cast.dielce) {
        await aktualizujStavDielcaCasti(dc.id, 'poskladane', dc.poskladane);
        await aktualizujStavDielcaCasti(dc.id, 'zvarene', dc.zvarene);
        await aktualizujStavDielcaCasti(dc.id, 'povrchova_uprava', dc.povrchova_uprava);
        await aktualizujStavDielcaCasti(dc.id, 'vyvezene', dc.vyvezene);
        await aktualizujStavDielcaCasti(dc.id, 'namontovane', dc.namontovane);
      }
      // Ulož timestamp
      const { supabase } = await import('../../lib/supabase');
      await supabase.from('casti_etapy')
        .update({ posledna_aktualizacia: new Date().toISOString() })
        .eq('id', cast.id);
      // Aktualizuj lokálny stav
      setCasti(prev => prev.map(c =>
        c.id === cast.id ? { ...c, posledna_aktualizacia: new Date().toISOString() } : c
      ));
      setZmenene(false);
    } catch (err) {
      alert('Chyba pri ukladaní: ' + err.message);
    } finally {
      setUkladamStav(false);
    }
  }

  function handleFilterFazy(pole) {
    setFiltre(prev => ({ ...prev, [pole]: dalsiFilter(prev[pole] ?? null) }));
  }

  function resetFiltre() { setFiltre({}); }

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

  function progresCasti(cast) {
    const total = cast.dielce.length * FAZY.length;
    if (total === 0) return 0;
    const hotove = cast.dielce.reduce((sum, dc) => sum + FAZY.filter(f => dc[f.pole]).length, 0);
    return Math.round((hotove / total) * 100);
  }

  function progresFazy(cast, pole) {
    if (cast.dielce.length === 0) return 0;
    return Math.round((cast.dielce.filter(dc => dc[pole]).length / cast.dielce.length) * 100);
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

  const zoradene = [...(cast?.dielce || [])].sort((a, b) => {
    const A = a.dielce?.cislo_dielca || a.dielce?.nazov || '';
    const B = b.dielce?.cislo_dielca || b.dielce?.nazov || '';
    return A.localeCompare(B, undefined, { numeric: true });
  });

  const aktFiltre = Object.entries(filtre).filter(([_, v]) => v !== null);
  const filtrovane = zoradene.filter(dc =>
    aktFiltre.every(([pole, stav]) => stav === 'hotove' ? !!dc[pole] : !dc[pole])
  );

  const maAktivnyFilter = aktFiltre.length > 0;

  return (
    <div className="space-y-4">

      {/* TABS — výber časti */}
      <div className="flex gap-2 flex-wrap">
        {casti.map(c => {
          const p = progresCasti(c);
          return (
            <button
              key={c.id}
              onClick={() => { setAktivnaCast(c.id); resetFiltre(); setAktualnyTab('dielce'); }}
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

      {cast && (
        <div className="bg-white rounded-lg shadow">

          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div>
              <h3 className="font-semibold text-gray-800">{cast.nazov}</h3>
              <p className="text-sm text-gray-500">
                {cast.dielce.length} dielcov
                {cast.posledna_aktualizacia && (
                  <span className="ml-2 text-gray-400">
                    · uložené {new Date(cast.posledna_aktualizacia).toLocaleString('sk-SK', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' })}
                  </span>
                )}
                {maAktivnyFilter && aktualnyTab === 'dielce' && (
                  <button onClick={resetFiltre} className="ml-2 text-xs text-blue-500 hover:underline">
                    zrušiť filter
                  </button>
                )}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${progresCasti(cast)}%` }} />
                </div>
                <span className="text-sm font-medium text-gray-600">{progresCasti(cast)}%</span>
              </div>
              <button onClick={() => handleVymazCast(cast.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {/* Vnútorné taby: Dielce / Materiál */}
          <div className="flex border-b">
            {[
              { key: 'dielce', label: 'Dielce' },
              { key: 'material', label: 'Položky' },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setAktualnyTab(t.key)}
                className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                  aktualnyTab === t.key
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* TAB: Dielce */}
          {aktualnyTab === 'dielce' && (
            <>
              {/* Filter + Uložiť */}
              <div className="flex items-center gap-2 px-4 py-3 border-b bg-gray-50">
                <span className="text-xs text-gray-500 font-medium">Filter:</span>
                <span className="text-xs text-gray-400">klikni na názov fázy v hlavičke</span>
                {maAktivnyFilter && (
                  <>
                    <span className="text-xs text-gray-300 mx-1">·</span>
                    <span className="text-xs text-gray-500">{filtrovane.length} z {cast.dielce.length}</span>
                    <button onClick={resetFiltre} className="ml-1 text-xs text-blue-500 hover:underline">zrušiť</button>
                  </>
                )}
                <div className="ml-auto flex items-center gap-2">
                  {zmenene && <span className="text-xs text-orange-500 font-medium">● neuložené zmeny</span>}
                  <button
                    onClick={handleUlozitStav}
                    disabled={ukladamStav}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      zmenene
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-200 text-gray-400 cursor-default'
                    } disabled:opacity-50`}
                  >
                    {ukladamStav ? 'Ukladám...' : 'Uložiť stav'}
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left px-4 py-2 text-gray-500 font-medium text-xs">Č. dielca</th>
                      <th className="text-left px-4 py-2 text-gray-500 font-medium text-xs">Názov</th>
                      <th className="text-right px-4 py-2 text-gray-500 font-medium text-xs">Počet</th>
                      {FAZY.map(f => {
                        const stavFiltra = filtre[f.pole] ?? null;
                        const p = progresFazy(cast, f.pole);
                        return (
                          <th key={f.pole} className="text-center px-3 py-2 min-w-24">
                            <button
                              onClick={() => handleFilterFazy(f.pole)}
                              className={`text-xs font-medium mb-1.5 px-2 py-0.5 rounded-full transition-all ${
                                stavFiltra === null
                                  ? `${f.farba} hover:bg-gray-100`
                                  : stavFiltra === 'nehotove'
                                  ? 'bg-red-100 text-red-600'
                                  : 'bg-green-100 text-green-600'
                              }`}
                              title="Klikni pre filtrovanie"
                            >
                              {f.label}
                              {stavFiltra && <span className="ml-1 font-bold">{labelFiltra(stavFiltra)}</span>}
                            </button>
                            <div className="flex items-center justify-center gap-1">
                              <div className="w-10 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-green-400 rounded-full transition-all" style={{ width: `${p}%` }} />
                              </div>
                              <span className="text-xs text-gray-500">{p}%</span>
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filtrovane.length === 0 ? (
                      <tr>
                        <td colSpan={3 + FAZY.length} className="text-center py-8 text-gray-400 text-sm">
                          Žiadne dielce pre tento filter
                        </td>
                      </tr>
                    ) : filtrovane.map(dc => {
                      const d = dc.dielce;
                      const vsetkyHotove = FAZY.every(f => dc[f.pole]);
                      return (
                        <tr key={dc.id} className={`hover:bg-gray-50 transition-colors ${vsetkyHotove ? 'bg-green-50' : ''}`}>
                          <td className="px-4 py-3 font-mono text-xs text-gray-500">{d?.cislo_dielca || '—'}</td>
                          <td className="px-4 py-3 text-gray-800">
                            {d?.nazov || '—'}
                            {d?.profil && <span className="ml-2 text-xs text-gray-400">{d.profil}</span>}
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-gray-700">{dc.mnozstvo}</td>
                          {FAZY.map(f => {
                            const jeZaskrtnuty = !!dc[f.pole];
                            return (
                              <td key={f.pole} className="px-3 py-3 text-center">
                                <button
                                  onClick={() => handleCheckbox(dc.id, f.pole, jeZaskrtnuty)}
                                  className={`w-6 h-6 rounded border-2 flex items-center justify-center mx-auto transition-all ${
                                    jeZaskrtnuty ? 'bg-green-500 border-green-500'
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
            </>
          )}

          {/* TAB: Materiál */}
          {aktualnyTab === 'material' && (
            <div className="p-4">
              <ZoznamMaterialu cast={cast} />
            </div>
          )}

        </div>
      )}
    </div>
  );
}
