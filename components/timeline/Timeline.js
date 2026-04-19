'use client'
import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { nacitajTimelineData } from '../../lib/api/timeline';

const DAY = 86400000;

function fmt(date) {
  const d = new Date(date);
  return `${d.getDate()}.${d.getMonth() + 1}.`;
}

function odhadKonca(startStr, deadlineStr, realPct) {
  const start = new Date(startStr);
  const deadline = new Date(deadlineStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const elapsed = (today - start) / DAY;
  if (realPct <= 0 || elapsed <= 0) return { date: deadline, meskanie: false };
  const tempo = realPct / elapsed;
  const zostatok = 100 - realPct;
  const zostDni = zostatok / tempo;
  const odhadDate = new Date(today.getTime() + zostDni * DAY);
  return { date: odhadDate, meskanie: odhadDate > deadline };
}

export default function Timeline({ onSpat }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rozsah, setRozsah] = useState(60); // počet dní na osi

  useEffect(() => {
    nacitaj();
  }, []);

  async function nacitaj() {
    setLoading(true);
    try {
      const d = await nacitajTimelineData();
      setData(d);
      // Nastav rozsah podľa najvzdialenejšieho deadlinu
      const deadlines = d.flatMap(z => z.etapy)
        .filter(e => e.deadline)
        .map(e => new Date(e.deadline));
      if (deadlines.length > 0) {
        const max = new Date(Math.max(...deadlines));
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dni = Math.max(60, Math.ceil((max - today) / DAY) + 14);
        setRozsah(dni);
      }
    } catch (err) {
      alert('Chyba: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const axisStart = new Date(today.getTime() - 7 * DAY); // 7 dní pred dnes
  const axisEnd = new Date(axisStart.getTime() + rozsah * DAY);
  const totalDays = (axisEnd - axisStart) / DAY;

  function pct(date) {
    return Math.max(0, Math.min(105, (new Date(date) - axisStart) / DAY / totalDays * 100));
  }

  const todayP = pct(today);

  // Generuj dátumy na osi — každých 7 dní
  const ticks = [];
  let d = new Date(axisStart);
  while (d <= axisEnd) {
    ticks.push(new Date(d));
    d = new Date(d.getTime() + 7 * DAY);
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
      <p className="text-gray-400">Načítavam timeline...</p>
    </div>
  );

  const aktívneZakazky = data.filter(z =>
    z.etapy.some(e => e.datum_zaciatku && e.deadline)
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
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
          <div className="overflow-x-auto">
            <div style={{ minWidth: '800px' }}>

              {/* Hlavička s dátumami */}
              <div className="flex border-b border-gray-200 bg-gray-50">
                <div className="w-48 flex-shrink-0 px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide border-r border-gray-200">
                  Zákazka / Etapa
                </div>
                <div className="flex-1 relative h-10">
                  {ticks.map((tick, i) => {
                    const pp = pct(tick);
                    const isTodayTick = tick.toDateString() === today.toDateString();
                    return (
                      <span key={i} style={{
                        position: 'absolute',
                        left: `${pp}%`,
                        transform: 'translateX(-50%)',
                        bottom: '6px',
                        fontSize: '11px',
                        color: isTodayTick ? '#111' : '#9CA3AF',
                        fontWeight: isTodayTick ? '700' : '400',
                        whiteSpace: 'nowrap'
                      }}>
                        {fmt(tick)}
                      </span>
                    );
                  })}
                  {/* Dnešná čiara v hlavičke */}
                  <div style={{ position: 'absolute', left: `${todayP}%`, top: 0, bottom: 0, width: '2px', background: '#111', opacity: 0.6 }} />
                </div>
                <div className="w-20 flex-shrink-0 px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide text-right border-l border-gray-200">
                  Stav
                </div>
              </div>

              {/* Riadky */}
              {aktívneZakazky.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  Žiadne etapy s nastaveným timeline. Pridaj začiatok a deadline k etapám.
                </div>
              ) : aktívneZakazky.map(zakazka => (
                <div key={zakazka.id}>
                  {/* Zákazka header */}
                  <div className="flex items-center bg-gray-50 border-b border-gray-100" style={{ height: '28px' }}>
                    <div className="w-48 flex-shrink-0 px-4 text-xs font-600 text-gray-500 uppercase tracking-wide border-r border-gray-200 truncate" style={{ fontWeight: 600 }}>
                      {zakazka.nazov}
                    </div>
                    <div className="flex-1" />
                    <div className="w-20 flex-shrink-0 border-l border-gray-200" />
                  </div>

                  {/* Etapy */}
                  {zakazka.etapy.filter(e => e.datum_zaciatku && e.deadline).map(etapa => {
                    const startP = pct(etapa.datum_zaciatku);
                    const deadP = pct(etapa.deadline);
                    const planWidth = Math.max(0, deadP - startP);
                    const realPct = etapa.progresVyroby ?? 0;
                    const { date: odhadDate, meskanie } = odhadKonca(etapa.datum_zaciatku, etapa.deadline, realPct);
                    const odhadP = pct(odhadDate);

                    const notStarted = today < new Date(etapa.datum_zaciatku);
                    const elapsed = Math.max(0, (today - new Date(etapa.datum_zaciatku)) / DAY);
                    const planDays = (new Date(etapa.deadline) - new Date(etapa.datum_zaciatku)) / DAY;
                    const planNowPct = planDays > 0 ? Math.min(100, elapsed / planDays * 100) : 0;
                    const planNowP = startP + planWidth * planNowPct / 100;
                    const realBarWidth = planWidth * realPct / 100;

                    const green = '#3B6D11';
                    const red = '#A32D2D';
                    const barColor = meskanie ? red : green;
                    const bgColor = meskanie ? '#FCEBEB' : '#EAF3DE';
                    const lineColor = meskanie ? red : green;

                    let statusLabel, statusColor;
                    if (notStarted) { statusLabel = 'Čaká'; statusColor = 'text-gray-400'; }
                    else if (meskanie) { statusLabel = 'Mešká'; statusColor = 'text-red-700'; }
                    else { statusLabel = 'Ok'; statusColor = 'text-green-700'; }

                    return (
                      <div key={etapa.id} className="flex items-center border-b border-gray-100 hover:bg-gray-50" style={{ height: '44px' }}>
                        <div className="w-48 flex-shrink-0 px-4 border-r border-gray-200" style={{ paddingLeft: '24px' }}>
                          <div className="text-sm text-gray-800 truncate">{etapa.nazov}</div>
                          <div className="text-xs text-gray-400">
                            {realPct}% vyrobené
                          </div>
                        </div>

                        {/* Chart area */}
                        <div className="flex-1 relative" style={{ height: '44px' }}>
                          {/* Dnešná čiara */}
                          <div style={{ position: 'absolute', left: `${todayP}%`, top: 0, bottom: 0, width: '2px', background: '#111', opacity: 0.5, zIndex: 8 }} />

                          {/* Plán bg */}
                          {planWidth > 0 && (
                            <div style={{ position: 'absolute', left: `${startP}%`, width: `${planWidth}%`, height: '10px', top: '50%', transform: 'translateY(-50%)', borderRadius: '3px', background: bgColor }} />
                          )}

                          {/* Realita */}
                          {!notStarted && realPct > 0 && (
                            <div style={{ position: 'absolute', left: `${startP}%`, width: `${realBarWidth}%`, height: '10px', top: '50%', transform: 'translateY(-50%)', borderRadius: '3px', background: barColor, zIndex: 3 }} />
                          )}

                          {/* Deadline čiara */}
                          <div style={{ position: 'absolute', left: `${deadP}%`, top: '8px', bottom: '8px', width: '3px', borderRadius: '1.5px', background: lineColor, zIndex: 6, transform: 'translateX(-50%)' }} />

                          {/* Ak mešká */}
                          {meskanie && !notStarted && (
                            <>
                              {/* Kde mal byť */}
                              <div style={{ position: 'absolute', left: `${planNowP}%`, top: '6px', bottom: '6px', width: '2px', borderRadius: '1px', background: '#E24B4A', opacity: 0.85, zIndex: 5, transform: 'translateX(-50%)' }} />
                              {/* Odhadovaný koniec */}
                              <div style={{ position: 'absolute', left: `${odhadP}%`, top: '6px', bottom: '6px', width: '2px', borderRadius: '1px', background: '#E24B4A', opacity: 0.55, zIndex: 5, transform: 'translateX(-50%)', borderRight: '2px dashed #E24B4A' }} />
                              <span style={{ position: 'absolute', left: `${odhadP}%`, bottom: '3px', transform: 'translateX(-50%)', fontSize: '10px', color: '#A32D2D', whiteSpace: 'nowrap', zIndex: 9 }}>
                                {fmt(odhadDate)}
                              </span>
                            </>
                          )}
                        </div>

                        <div className={`w-20 flex-shrink-0 px-3 text-xs font-medium text-right border-l border-gray-200 ${statusColor}`}>
                          {statusLabel}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legenda */}
          <div className="px-4 py-3 border-t border-gray-100 flex gap-4 flex-wrap text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <span style={{ width: '16px', height: '6px', borderRadius: '3px', background: '#EAF3DE', display: 'inline-block' }} />
              Plán etapy
            </span>
            <span className="flex items-center gap-1.5">
              <span style={{ width: '16px', height: '6px', borderRadius: '3px', background: '#3B6D11', display: 'inline-block' }} />
              Výroba (poskladané + zvarené)
            </span>
            <span className="flex items-center gap-1.5">
              <span style={{ width: '3px', height: '14px', borderRadius: '1.5px', background: '#3B6D11', display: 'inline-block' }} />
              Deadline (ok)
            </span>
            <span className="flex items-center gap-1.5">
              <span style={{ width: '3px', height: '14px', borderRadius: '1.5px', background: '#A32D2D', display: 'inline-block' }} />
              Deadline (mešká)
            </span>
            <span className="flex items-center gap-1.5">
              <span style={{ width: '2px', height: '14px', background: '#E24B4A', opacity: 0.85, display: 'inline-block' }} />
              Kde mal byť
            </span>
            <span className="flex items-center gap-1.5">
              <span style={{ width: '2px', height: '14px', background: '#111', opacity: 0.5, display: 'inline-block' }} />
              Dnes
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
