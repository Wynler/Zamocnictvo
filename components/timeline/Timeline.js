'use client'
import { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { nacitajTimelineData } from '../../lib/api/timeline';

const DAY = 86400000;
const KAPACITA = 10;
const LABEL_W = 220;
const ROW_H = 52;
const ZAK_H = 28;

function fmt(date) {
  const d = new Date(date);
  return `${d.getDate()}.${d.getMonth() + 1}.`;
}

function odhadKonca(startStr, deadlineStr, realPct) {
  const start = new Date(startStr);
  const deadline = new Date(deadlineStr);
  const today = new Date(); today.setHours(0,0,0,0);
  const elapsed = (today - start) / DAY;
  if (realPct <= 0 || elapsed <= 0) return { date: deadline, meskanie: false };
  const tempo = realPct / elapsed;
  const zostDni = (100 - realPct) / tempo;
  const odhadDate = new Date(today.getTime() + zostDni * DAY);
  return { date: odhadDate, meskanie: odhadDate > deadline };
}

export default function Timeline({ onSpat }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offsetDni, setOffsetDni] = useState(-7);
  const [rozsahDni, setRozsahDni] = useState(42);

  useEffect(() => { nacitaj(); }, []);

  async function nacitaj() {
    setLoading(true);
    try {
      const d = await nacitajTimelineData();
      setData(d);
    } catch (err) {
      alert('Chyba: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  const today = new Date(); today.setHours(0,0,0,0);
  const axisStart = new Date(today.getTime() + offsetDni * DAY);
  const axisEnd = new Date(axisStart.getTime() + rozsahDni * DAY);

  function p(date) {
    return (new Date(date) - axisStart) / DAY / rozsahDni * 100;
  }

  const todayP = p(today);

  // Ticky každé 2 dni
  const ticks = [];
  let td = new Date(axisStart);
  while (td <= axisEnd) {
    ticks.push(new Date(td));
    td = new Date(td.getTime() + 2 * DAY);
  }

  // Kapacita na každý deň
  function kapacitaVDen(date) {
    const d = new Date(date); d.setHours(0,0,0,0);
    let total = 0;
    data.forEach(z => z.etapy.forEach(e => {
      if (!e.datum_zaciatku || !e.deadline || !e.pocet_ludi) return;
      const s = new Date(e.datum_zaciatku); s.setHours(0,0,0,0);
      const dl = new Date(e.deadline); dl.setHours(0,0,0,0);
      if (d >= s && d <= dl) total += parseInt(e.pocet_ludi);
    }));
    return total;
  }

  const kapDni = [];
  let kd = new Date(axisStart);
  while (kd <= axisEnd) {
    kapDni.push({ date: new Date(kd), kap: kapacitaVDen(kd) });
    kd = new Date(kd.getTime() + DAY);
  }
  const maxKap = Math.max(KAPACITA, ...kapDni.map(k => k.kap));
  const maxKapValue = kapDni.reduce((m, k) => k.kap > m ? k.kap : m, 0);

  const aktívne = data.filter(z => z.etapy.some(e => e.datum_zaciatku && e.deadline));

  if (loading) return (
    <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
      <p className="text-gray-400">Načítavam...</p>
    </div>
  );

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

        {/* Upozornenie na kapacitu */}
        {maxKapValue > KAPACITA && (
          <div className="mb-3 px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
            <span className="font-medium">⚠ Prekročená kapacita!</span>
            Niektoré dni máš pridelených viac ako {KAPACITA} ľudí naprieč etapami.
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">

          {/* Navigácia */}
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-gray-50">
            <button onClick={() => setOffsetDni(o => o - 14)} className="p-1.5 rounded hover:bg-gray-200 flex"><ChevronLeft size={14} /><ChevronLeft size={14} /></button>
            <button onClick={() => setOffsetDni(o => o - 7)} className="p-1.5 rounded hover:bg-gray-200"><ChevronLeft size={14} /></button>
            <button onClick={() => setOffsetDni(-7)} className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 font-medium">Dnes</button>
            <button onClick={() => setOffsetDni(o => o + 7)} className="p-1.5 rounded hover:bg-gray-200"><ChevronRight size={14} /></button>
            <button onClick={() => setOffsetDni(o => o + 14)} className="p-1.5 rounded hover:bg-gray-200 flex"><ChevronRight size={14} /><ChevronRight size={14} /></button>
            <div className="ml-auto flex items-center gap-1.5 text-xs text-gray-500">
              <span className="mr-1">Rozsah:</span>
              {[14,28,42,60].map(r => (
                <button key={r} onClick={() => setRozsahDni(r)}
                  className={`px-2.5 py-1 rounded border text-xs ${rozsahDni === r ? 'bg-gray-800 text-white border-gray-800' : 'border-gray-300 hover:bg-gray-100'}`}>
                  {r}d
                </button>
              ))}
            </div>
          </div>

          <div style={{ overflowX: 'hidden' }}>
            <div style={{ minWidth: 700 }}>

              {/* Os dátumov */}
              <div className="flex border-b border-gray-200" style={{ height: 34 }}>
                <div style={{ width: LABEL_W, flexShrink: 0 }} className="border-r border-gray-200" />
                <div className="flex-1 relative">
                  {ticks.map((tick, i) => {
                    const pp = p(tick);
                    if (pp < 0 || pp > 100) return null;
                    const isTod = tick.toDateString() === today.toDateString();
                    return (
                      <span key={i} style={{ position: 'absolute', left: `${pp}%`, transform: 'translateX(-50%)', bottom: 5, fontSize: 11, color: isTod ? '#111' : '#9CA3AF', fontWeight: isTod ? 700 : 400, whiteSpace: 'nowrap' }}>
                        {fmt(tick)}
                      </span>
                    );
                  })}
                  <div style={{ position: 'absolute', left: `${todayP}%`, top: 0, bottom: 0, width: 2, background: '#111', opacity: 0.6 }} />
                </div>
                <div style={{ width: 64, flexShrink: 0 }} className="border-l border-gray-200" />
              </div>

              {/* Kapacitný bar */}
              <div className="flex border-b border-gray-200" style={{ height: 32, background: '#fafafa' }}>
                <div style={{ width: LABEL_W, flexShrink: 0, fontSize: 10, color: '#9CA3AF', display: 'flex', alignItems: 'center', paddingLeft: 12 }} className="border-r border-gray-200">
                  Ľudia / deň
                </div>
                <div className="flex-1 relative" style={{ height: 32 }}>
                  {kapDni.map((kd, i) => {
                    const pp = p(kd.date);
                    const nextPp = p(new Date(kd.date.getTime() + DAY));
                    if (pp > 100 || nextPp < 0) return null;
                    const w = Math.max(0, Math.min(100, nextPp) - Math.max(0, pp));
                    const over = kd.kap > KAPACITA;
                    const h = kd.kap > 0 ? Math.min(100, (kd.kap / maxKap) * 90) : 0;
                    return (
                      <div key={i} title={`${fmt(kd.date)}: ${kd.kap} ľudí`} style={{
                        position: 'absolute', left: `${Math.max(0,pp)}%`, width: `${w}%`,
                        bottom: 0, height: `${h}%`,
                        background: over ? '#E24B4A' : '#3B6D11',
                        opacity: over ? 0.65 : 0.3,
                        borderRadius: '1px 1px 0 0'
                      }} />
                    );
                  })}
                  <div style={{ position: 'absolute', bottom: `${(KAPACITA / maxKap) * 90}%`, left: 0, right: 0, height: 1, background: '#E24B4A', opacity: 0.5 }} />
                  <div style={{ position: 'absolute', left: `${todayP}%`, top: 0, bottom: 0, width: 2, background: '#111', opacity: 0.3 }} />
                </div>
                <div style={{ width: 64, flexShrink: 0, fontSize: 10, color: '#9CA3AF', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 8 }} className="border-l border-gray-200">
                  max {KAPACITA}
                </div>
              </div>

              {/* Zákazky + etapy */}
              {aktívne.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">Žiadne etapy s nastaveným timeline. Pridaj začiatok a deadline k etapám.</div>
              ) : aktívne.map(zakazka => {
                const deadlines = zakazka.etapy.filter(e => e.deadline).map(e => new Date(e.deadline));
                const starts = zakazka.etapy.filter(e => e.datum_zaciatku).map(e => new Date(e.datum_zaciatku));
                const zakDeadline = deadlines.length ? new Date(Math.max(...deadlines)) : null;
                const zakStart = starts.length ? new Date(Math.min(...starts)) : null;

                return (
                  <div key={zakazka.id}>
                    {/* Zákazka header riadok */}
                    <div className="flex items-center border-b border-gray-100" style={{ height: ZAK_H, background: '#f9fafb' }}>
                      <div style={{ width: LABEL_W, flexShrink: 0, fontSize: 12, fontWeight: 700, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '0 12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} className="border-r border-gray-200">
                        {zakazka.nazov}
                      </div>
                      <div className="flex-1 relative" style={{ height: ZAK_H }}>
                        <div style={{ position: 'absolute', left: `${todayP}%`, top: 0, bottom: 0, width: 2, background: '#111', opacity: 0.25 }} />
                        {zakStart && zakDeadline && (() => {
                          const sp = p(zakStart), dp = p(zakDeadline);
                          return <div style={{ position: 'absolute', left: `${sp}%`, width: `${Math.max(0,dp-sp)}%`, height: 5, top: '50%', transform: 'translateY(-50%)', borderRadius: 2, background: '#D3D1C7' }} />;
                        })()}
                        {zakDeadline && <div style={{ position: 'absolute', left: `${p(zakDeadline)}%`, top: 5, bottom: 5, width: 3, borderRadius: 1.5, background: '#444441', transform: 'translateX(-50%)' }} />}
                      </div>
                      <div style={{ width: 64, flexShrink: 0 }} className="border-l border-gray-200" />
                    </div>

                    {/* Etapy */}
                    {zakazka.etapy.filter(e => e.datum_zaciatku && e.deadline).map(etapa => {
                      const startPP = p(etapa.datum_zaciatku);
                      const deadPP = p(etapa.deadline);
                      const planW = Math.max(0, deadPP - startPP);
                      const realPct = etapa.progresVyroby ?? 0;
                      const { date: odhadDate, meskanie } = odhadKonca(etapa.datum_zaciatku, etapa.deadline, realPct);
                      const odhadPP = p(odhadDate);
                      const elapsed = Math.max(0, (today - new Date(etapa.datum_zaciatku)) / DAY);
                      const planDays = (new Date(etapa.deadline) - new Date(etapa.datum_zaciatku)) / DAY;
                      const planNowPct = planDays > 0 ? Math.min(100, elapsed / planDays * 100) : 0;
                      const planNowPP = startPP + planW * planNowPct / 100;
                      const realW = planW * realPct / 100;
                      const notStarted = today < new Date(etapa.datum_zaciatku);
                      const barColor = meskanie ? '#A32D2D' : '#3B6D11';
                      const bgColor = meskanie ? '#FCEBEB' : '#EAF3DE';
                      const lineColor = meskanie ? '#A32D2D' : '#3B6D11';
                      let statusLabel, statusColor;
                      if (notStarted) { statusLabel = 'Čaká'; statusColor = '#9CA3AF'; }
                      else if (meskanie) { statusLabel = 'Mešká'; statusColor = '#A32D2D'; }
                      else { statusLabel = 'Ok'; statusColor = '#0F6E56'; }

                      return (
                        <div key={etapa.id} className="flex items-center border-b border-gray-100 hover:bg-gray-50" style={{ height: ROW_H }}>
                          <div style={{ width: LABEL_W, flexShrink: 0, padding: '0 12px 0 20px' }} className="border-r border-gray-200">
                            <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{etapa.nazov}</div>
                            <div style={{ fontSize: 12, color: '#6B7280' }}>
                              {realPct}% · {etapa.pocet_ludi ? `${etapa.pocet_ludi} ľudí` : '—'}
                            </div>
                          </div>
                          <div className="flex-1 relative" style={{ height: ROW_H }}>
                            <div style={{ position: 'absolute', left: `${todayP}%`, top: 0, bottom: 0, width: 2, background: '#111', opacity: 0.4, zIndex: 8 }} />
                            {planW > 0 && <div style={{ position: 'absolute', left: `${startPP}%`, width: `${planW}%`, height: 10, top: '50%', transform: 'translateY(-50%)', borderRadius: 3, background: bgColor }} />}
                            {!notStarted && realPct > 0 && <div style={{ position: 'absolute', left: `${startPP}%`, width: `${realW}%`, height: 10, top: '50%', transform: 'translateY(-50%)', borderRadius: 3, background: barColor, zIndex: 3 }} />}
                            <div style={{ position: 'absolute', left: `${deadPP}%`, top: 8, bottom: 8, width: 3, borderRadius: 1.5, background: lineColor, zIndex: 6, transform: 'translateX(-50%)' }} />
                            {meskanie && !notStarted && <>
                              <div style={{ position: 'absolute', left: `${planNowPP}%`, top: 6, bottom: 6, width: 2, borderRadius: 1, background: '#E24B4A', opacity: 0.85, zIndex: 5, transform: 'translateX(-50%)' }} />
                              {odhadPP <= 105 && <>
                                <div style={{ position: 'absolute', left: `${odhadPP}%`, top: 6, bottom: 6, width: 2, borderRadius: 1, background: '#E24B4A', opacity: 0.55, zIndex: 5, transform: 'translateX(-50%)' }} />
                                <span style={{ position: 'absolute', left: `${odhadPP}%`, bottom: 2, transform: 'translateX(-50%)', fontSize: 10, color: '#A32D2D', whiteSpace: 'nowrap', zIndex: 9 }}>{fmt(odhadDate)}</span>
                              </>}
                            </>}
                          </div>
                          <div style={{ width: 64, flexShrink: 0, textAlign: 'right', padding: '0 12px', fontSize: 11, fontWeight: 500, color: statusColor }} className="border-l border-gray-200">
                            {statusLabel}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legenda */}
          <div className="px-4 py-3 border-t border-gray-100 flex gap-4 flex-wrap text-xs text-gray-400 items-center">
            <span className="flex items-center gap-1.5"><span style={{ width:16,height:6,borderRadius:3,background:'#EAF3DE',display:'inline-block' }} />Plán etapy</span>
            <span className="flex items-center gap-1.5"><span style={{ width:16,height:6,borderRadius:3,background:'#3B6D11',display:'inline-block' }} />Výroba</span>
            <span className="flex items-center gap-1.5"><span style={{ width:3,height:14,borderRadius:1.5,background:'#3B6D11',display:'inline-block' }} />Deadline ok</span>
            <span className="flex items-center gap-1.5"><span style={{ width:3,height:14,borderRadius:1.5,background:'#A32D2D',display:'inline-block' }} />Deadline mešká</span>
            <span className="flex items-center gap-1.5"><span style={{ width:2,height:14,background:'#E24B4A',opacity:0.85,display:'inline-block' }} />Kde mal byť</span>
            <span className="flex items-center gap-1.5"><span style={{ width:2,height:14,background:'#111',opacity:0.5,display:'inline-block' }} />Dnes</span>
            <span className="flex items-center gap-1.5 ml-auto"><span style={{ width:10,height:10,borderRadius:2,background:'#E24B4A',opacity:0.65,display:'inline-block' }} />Kapacita prekročená</span>
          </div>
        </div>
      </div>
    </div>
  );
}
