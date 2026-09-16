'use client'
import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, RefreshCw, ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-react';
import { nacitajTimelineVyroby } from '../../lib/api/timeline';
import { aktualizujCast } from '../../lib/api/casti';
import { nastavKapacitu } from '../../lib/api/kapacita';

const DAY = 86400000;
const DEFAULT_KAPACITA = 8;
const LABEL_W = 260;
const DAY_W = 34;
const ROW_H = 44;

function fmt(date) {
  const d = new Date(date);
  return `${d.getDate()}.${d.getMonth() + 1}.`;
}

function iso(date) {
  return new Date(date).toISOString().split('T')[0];
}

function jePracovny(date) {
  const den = new Date(date).getDay();
  return den !== 0 && den !== 6;
}

// Rozdelí interval start–koniec na súvislé úseky pracovných dní (víkendy = medzera)
function pracovneSegmenty(startIso, koniecIso) {
  const koniec = new Date(koniecIso);
  koniec.setHours(0, 0, 0, 0);
  let d = new Date(startIso);
  d.setHours(0, 0, 0, 0);
  const segmenty = [];
  let segStart = null;
  let posledny = null;

  while (d <= koniec) {
    if (jePracovny(d)) {
      if (!segStart) segStart = new Date(d);
      posledny = new Date(d);
    } else if (segStart) {
      segmenty.push([iso(segStart), iso(posledny)]);
      segStart = null;
    }
    d = new Date(d.getTime() + DAY);
  }
  if (segStart) segmenty.push([iso(segStart), iso(posledny)]);
  return segmenty;
}

export default function Timeline({ onSpat }) {
  const [riadky, setRiadky] = useState([]);
  const [kapacita, setKapacita] = useState({});
  const [loading, setLoading] = useState(true);
  const [offsetDni, setOffsetDni] = useState(-3);
  const [rozsahDni, setRozsahDni] = useState(28);
  const [ukladam, setUkladam] = useState(null);

  useEffect(() => { nacitaj(); }, []);

  async function nacitaj() {
    setLoading(true);
    try {
      const data = await nacitajTimelineVyroby();
      setRiadky(data.riadky);
      setKapacita(data.kapacita);
    } catch (err) {
      alert('Chyba: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const axisStart = new Date(today.getTime() + offsetDni * DAY);

  const dni = useMemo(() => {
    const pole = [];
    for (let i = 0; i < rozsahDni; i++) pole.push(new Date(axisStart.getTime() + i * DAY));
    return pole;
  }, [offsetDni, rozsahDni]);

  function p(datumIso) {
    return (new Date(datumIso) - axisStart) / DAY / rozsahDni * 100;
  }
  const todayP = p(iso(today));

  const zadeleniPoDnoch = useMemo(() => {
    const mapa = {};
    for (const d of dni) {
      const key = iso(d);
      let sucet = 0;
      for (const r of riadky) {
        if (r.blokovane || !r.start || !r.koniec) continue;
        if (key >= r.start && key <= r.koniec) sucet += r.pocetLudi || 0;
      }
      mapa[key] = sucet;
    }
    return mapa;
  }, [riadky, dni]);

  const maxKapacita = useMemo(
    () => Math.max(DEFAULT_KAPACITA, ...Object.values(kapacita), 0),
    [kapacita]
  );

  async function handleZmenKapacity(datumIso, hodnota) {
    const cislo = parseInt(hodnota) || 0;
    setKapacita(prev => ({ ...prev, [datumIso]: cislo }));
    try {
      await nastavKapacitu(datumIso, cislo);
    } catch (err) {
      alert('Chyba pri ukladaní kapacity: ' + err.message);
    }
  }

  async function handleZmenPocetLudi(castId, delta) {
    const r = riadky.find(r => r.castId === castId);
    const nove = Math.min(maxKapacita, Math.max(0, (r?.pocetLudi || 0) + delta));
    setUkladam(castId);
    try {
      await aktualizujCast(castId, { pocetLudi: nove });
      await nacitaj();
    } catch (err) {
      alert('Chyba: ' + err.message);
    } finally {
      setUkladam(null);
    }
  }

  async function handleNastavStart(castId, datum) {
    setUkladam(castId);
    try {
      await aktualizujCast(castId, { startOverride: datum || null });
      await nacitaj();
    } catch (err) {
      alert('Chyba: ' + err.message);
    } finally {
      setUkladam(null);
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
      <p className="text-gray-400">Načítavam...</p>
    </div>
  );

  // Zoskup riadky pod ich etapu (zachovaj poradie výskytu)
  const zoskupene = [];
  const videneEtapy = new Set();
  for (const r of riadky) {
    if (!videneEtapy.has(r.etapaId)) {
      videneEtapy.add(r.etapaId);
      zoskupene.push({
        typ: 'etapa', etapaId: r.etapaId, nazov: r.etapaNazov, zakazkaNazov: r.zakazkaNazov,
        povrchOd: r.etapaPovrchOd, povrchDni: r.etapaPovrchDni
      });
    }
    zoskupene.push({ typ: 'cast', ...r });
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button onClick={onSpat} className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
              <ArrowLeft size={20} /> Späť
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Timeline výroby</h1>
          </div>
          <button onClick={nacitaj} className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 text-sm">
            <RefreshCw size={14} /> Obnoviť
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">

          {/* Navigácia */}
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-gray-50">
            <button onClick={() => setOffsetDni(o => o - 14)} className="p-1.5 rounded hover:bg-gray-200 flex"><ChevronLeft size={14} /><ChevronLeft size={14} /></button>
            <button onClick={() => setOffsetDni(o => o - 7)} className="p-1.5 rounded hover:bg-gray-200"><ChevronLeft size={14} /></button>
            <button onClick={() => setOffsetDni(-3)} className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 font-medium">Dnes</button>
            <button onClick={() => setOffsetDni(o => o + 7)} className="p-1.5 rounded hover:bg-gray-200"><ChevronRight size={14} /></button>
            <button onClick={() => setOffsetDni(o => o + 14)} className="p-1.5 rounded hover:bg-gray-200 flex"><ChevronRight size={14} /><ChevronRight size={14} /></button>
            <div className="ml-auto flex items-center gap-1.5 text-xs text-gray-500">
              <span className="mr-1">Rozsah:</span>
              {[14, 28, 42, 60].map(r => (
                <button key={r} onClick={() => setRozsahDni(r)}
                  className={`px-2.5 py-1 rounded border text-xs ${rozsahDni === r ? 'bg-gray-800 text-white border-gray-800' : 'border-gray-300 hover:bg-gray-100'}`}>
                  {r}d
                </button>
              ))}
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <div style={{ minWidth: LABEL_W + dni.length * DAY_W, position: 'relative' }}>

              {/* Podfarbenie víkendov + čiara dneška — cez celú výšku tabuľky */}
              <div style={{ position: 'absolute', left: LABEL_W, right: 0, top: 0, bottom: 0, zIndex: 0, pointerEvents: 'none' }}>
                {dni.map((d, i) => !jePracovny(d) && (
                  <div key={i} style={{
                    position: 'absolute', left: `${(i / dni.length) * 100}%`, width: `${(1 / dni.length) * 100}%`,
                    top: 0, bottom: 0, background: '#F3F4F6'
                  }} />
                ))}
                {todayP >= 0 && todayP <= 100 && (
                  <div style={{ position: 'absolute', left: `${todayP}%`, top: 0, bottom: 0, width: 2, background: '#DC2626' }} />
                )}
              </div>

              <div style={{ position: 'relative', zIndex: 1 }}>

                {/* Dátumy */}
                <div className="flex border-b border-gray-200">
                  <div style={{ width: LABEL_W, flexShrink: 0 }} className="border-r border-gray-200" />
                  {dni.map((d, i) => {
                    const isTod = d.toDateString() === today.toDateString();
                    return (
                      <div key={i} style={{ width: DAY_W, flexShrink: 0 }}
                        className={`text-center py-1 text-xs ${isTod ? 'font-bold text-red-600' : jePracovny(d) ? 'text-gray-500' : 'text-gray-400'}`}>
                        {fmt(d)}
                      </div>
                    );
                  })}
                </div>

                {/* Riadky: etapy + časti */}
                {zoskupene.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 text-sm">
                    Žiadne časti na naplánovanie. Rozdeľ etapu na časti v jej detaile.
                  </div>
                ) : zoskupene.map((r) => {
                  if (r.typ === 'etapa') {
                    return (
                      <div key={`e-${r.etapaId}`} className="flex items-center border-b border-gray-100" style={{ height: 30, background: '#f9fafb' }}>
                        <div style={{ width: LABEL_W, flexShrink: 0 }} className="px-3 flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-gray-700 uppercase tracking-wide truncate">
                            {r.zakazkaNazov} — {r.nazov}
                          </span>
                        </div>
                        <div className="flex-1 px-2 text-xs text-gray-500 whitespace-nowrap">
                          {r.povrchOd && <>Povrchová úprava od: <strong className="text-gray-700">{fmt(r.povrchOd)}</strong></>}
                          {r.povrchDni > 0 && <span className="ml-3">Trvanie: <strong className="text-gray-700">{r.povrchDni} dní</strong></span>}
                        </div>
                      </div>
                    );
                  }

                  const segmenty = (!r.blokovane && r.start && r.koniec) ? pracovneSegmenty(r.start, r.koniec) : [];

                  return (
                    <div key={r.castId} className="flex items-center border-b border-gray-100 hover:bg-white" style={{ height: ROW_H }}>
                      <div style={{ width: LABEL_W, flexShrink: 0 }} className="px-3 flex items-center gap-2 border-r border-gray-200 bg-white">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-700 truncate">{r.castNazov}</p>
                          <p className="text-[10px] text-gray-400">
                            {r.hodiny != null ? `${Math.round(r.hodiny * 10) / 10} h` : ''}
                            {r.dni != null ? ` · ${r.dni} dní` : ''}
                          </p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <input type="date" value={r.startOverride || r.start || ''}
                              onChange={e => handleNastavStart(r.castId, e.target.value)}
                              className={`text-[10px] border rounded px-1 py-0.5 ${r.blokovane ? 'border-red-300' : 'border-gray-200'}`} />
                            {r.startOverride && (
                              <button onClick={() => handleNastavStart(r.castId, null)} className="text-[10px] text-blue-500 hover:underline">
                                zrušiť
                              </button>
                            )}
                          </div>
                          {r.blokovane && (
                            <p className="text-[10px] text-red-500 font-medium mt-0.5">Stojí — chýbajú ľudia</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button onClick={() => handleZmenPocetLudi(r.castId, -1)} disabled={ukladam === r.castId}
                            className="p-0.5 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-50">
                            <Minus size={12} />
                          </button>
                          <span className="text-xs font-medium w-4 text-center">{r.pocetLudi}</span>
                          <button onClick={() => handleZmenPocetLudi(r.castId, 1)} disabled={ukladam === r.castId || r.pocetLudi >= maxKapacita}
                            className="p-0.5 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-50">
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                      <div className="flex-1 relative" style={{ height: ROW_H }}>
                        {segmenty.map(([segOd, segDo], i) => {
                          const segStartP = p(segOd);
                          const segKoniecP = p(segDo) + (1 / rozsahDni) * 100; // segment trvá do konca posledného dňa
                          if (segKoniecP < 0 || segStartP > 100) return null;
                          return (
                            <div key={i}
                              title={`${fmt(segOd)} – ${fmt(segDo)}`}
                              style={{
                                position: 'absolute',
                                left: `${Math.max(0, segStartP)}%`,
                                width: `${Math.max(0.5, Math.min(100, segKoniecP) - Math.max(0, segStartP))}%`,
                                top: '50%', transform: 'translateY(-50%)',
                                height: 16, borderRadius: 3,
                                background: '#3B6D11'
                              }}
                            />
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {/* Kapacita / deň — editovateľná */}
                <div className="flex border-t-2 border-gray-300 bg-gray-50">
                  <div style={{ width: LABEL_W, flexShrink: 0 }} className="border-r border-gray-200 px-3 py-1.5 text-xs text-gray-500 flex items-center">
                    Kapacita / deň
                  </div>
                  {dni.map((d, i) => {
                    const key = iso(d);
                    return (
                      <div key={i} style={{ width: DAY_W, flexShrink: 0 }} className="py-1 flex justify-center">
                        <input
                          type="number" min="0"
                          value={kapacita[key] ?? DEFAULT_KAPACITA}
                          onChange={e => handleZmenKapacity(key, e.target.value)}
                          className="w-7 text-center text-xs border border-gray-200 rounded"
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Zadelení / deň */}
                <div className="flex border-b border-gray-200 bg-gray-50">
                  <div style={{ width: LABEL_W, flexShrink: 0 }} className="border-r border-gray-200 px-3 py-1.5 text-xs text-gray-500 flex items-center">
                    Zadelení / deň
                  </div>
                  {dni.map((d, i) => {
                    const key = iso(d);
                    const zadeleni = zadeleniPoDnoch[key] || 0;
                    const kap = kapacita[key] ?? DEFAULT_KAPACITA;
                    const over = zadeleni > kap;
                    return (
                      <div key={i} style={{ width: DAY_W, flexShrink: 0 }}
                        className={`py-1.5 text-center text-xs font-medium ${over ? 'text-red-600 bg-red-50' : 'text-gray-600'}`}>
                        {zadeleni}
                      </div>
                    );
                  })}
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
