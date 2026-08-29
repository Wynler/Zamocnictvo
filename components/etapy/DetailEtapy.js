'use client'
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Pencil, Plus, Trash2, Upload, X, Scissors, LayoutList, Edit, ChevronDown, ChevronRight } from 'lucide-react';
import ImportModal from '../import/ImportModal';
import RozdelitEtapuModal from '../casti/RozdelitEtapuModal';
import PrehladCasti from '../casti/PrehladCasti';

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
  onPridatDielec,
  onVymazatDielec,
  onZacatEditovatDielec,
  onUlozitDielec,
  onZrusitEditaciuDielca,
  onImportExcel,
  vypocitajPracovneDni,
  generateKalendar,
  nacitajData,
  onDetailCasti
}) {
  const dniVyroba = vypocitajPracovneDni(aktualnaEtapa.datumVyrobyOd, aktualnaEtapa.datumVyrobyDo);
  const dniPovrch = vypocitajPracovneDni(aktualnaEtapa.datumPovrchovejUpravyOd, aktualnaEtapa.datumPovrchovejUpravyDo);
  const dniMontaz = vypocitajPracovneDni(aktualnaEtapa.datumMontazeOd, aktualnaEtapa.datumMontazeDo);
  const kalendar = generateKalendar(aktualnaEtapa);
  const [showImport, setShowImport] = useState(false);
  const [showRozdelit, setShowRozdelit] = useState(false);
  const [showDielce, setShowDielce] = useState(false);
  const [pocetLudiEdit, setPocetLudiEdit] = useState(aktualnaEtapa.pocetLudi || 1);
  const [progres, setProgres] = useState(null);
  const [ukladamLudi, setUkladamLudi] = useState(false);

  // Načítaj progres pri mount
  React.useEffect(() => {
    if (aktualnaEtapa.id) {
      import('../../lib/api/progres').then(m => {
        m.nacitajProgresEtapy(aktualnaEtapa.id).then(p => setProgres(p)).catch(() => setProgres(0));
      });
    }
  }, [aktualnaEtapa.id]);

  async function handleUlozitLudi() {
    setUkladamLudi(true);
    try {
      const m = await import('../../lib/api/progres');
      await m.aktualizujPocetLudi(aktualnaEtapa.id, pocetLudiEdit);
      await nacitajData();
    } catch(e) { alert('Chyba: ' + e.message); }
    finally { setUkladamLudi(false); }
  }

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

        {/* SPÄŤ */}
        <button onClick={onSpat} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
          <ArrowLeft size={20} /> Späť na zákazku
        </button>

        {/* INFORMÁCIE O PROJEKTE */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {editujemEtapu ? 'Upraviť projekt' : aktualnaEtapa.nazov}
            </h2>
            {!editujemEtapu && (
              <button
                onClick={onZacatEditovatEtapu}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                <Edit size={16} />
                Upraviť
              </button>
            )}
          </div>

          {editujemEtapu ? (
            <div className="space-y-6">
              {/* ZÁKLADNÉ */}
              <div className="border-b pb-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Základné informácie</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Názov projektu</label>
                    <input
                      type="text"
                      value={editovanaEtapa.nazov}
                      onChange={(e) => setEditovanaEtapa({...editovanaEtapa, nazov: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Kontaktná osoba</label>
                    <input type="text" value={editovanaEtapa.kontaktnaOsoba || ''}
                      onChange={(e) => setEditovanaEtapa({...editovanaEtapa, kontaktnaOsoba: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Telefón</label>
                    <input type="tel" value={editovanaEtapa.telefon || ''}
                      onChange={(e) => setEditovanaEtapa({...editovanaEtapa, telefon: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input type="email" value={editovanaEtapa.email || ''}
                      onChange={(e) => setEditovanaEtapa({...editovanaEtapa, email: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hmotnosť podľa výkazu (kg)</label>
                    <input type="number" step="0.01" value={editovanaEtapa.hmotnostPodlaVykazu || ''}
                      onChange={(e) => setEditovanaEtapa({...editovanaEtapa, hmotnostPodlaVykazu: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                  </div>
                </div>
              </div>

              {/* TIMELINE */}
              <div className="border-b pb-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Timeline</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dátum začiatku</label>
                    <input type="date" value={editovanaEtapa.datumZaciatku || ''}
                      onChange={(e) => setEditovanaEtapa({...editovanaEtapa, datumZaciatku: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Deadline (požadovaný dátum)</label>
                    <input type="date" value={editovanaEtapa.deadline || ''}
                      onChange={(e) => setEditovanaEtapa({...editovanaEtapa, deadline: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Človekodiny celkom</label>
                    <input type="number" step="1" value={editovanaEtapa.clovekohod || ''}
                      onChange={(e) => setEditovanaEtapa({...editovanaEtapa, clovekohod: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Počet ľudí</label>
                    <input type="number" step="1" min="1" value={editovanaEtapa.pocetLudi || ''}
                      onChange={(e) => setEditovanaEtapa({...editovanaEtapa, pocetLudi: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                  </div>
                </div>
              </div>

              {/* PODROBNÉ TERMÍNY */}
              <div className="border-b pb-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Podrobné termíny</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dátum ukončenia</label>
                    <input type="date" value={editovanaEtapa.datumUkoncenia || ''}
                      onChange={(e) => setEditovanaEtapa({...editovanaEtapa, datumUkoncenia: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div></div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Výroba od</label>
                    <input type="date" value={editovanaEtapa.datumVyrobyOd || ''}
                      onChange={(e) => setEditovanaEtapa({...editovanaEtapa, datumVyrobyOd: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Výroba do</label>
                    <input type="date" value={editovanaEtapa.datumVyrobyDo || ''}
                      onChange={(e) => setEditovanaEtapa({...editovanaEtapa, datumVyrobyDo: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Povrchová úprava od</label>
                    <input type="date" value={editovanaEtapa.datumPovrchovejUpravyOd || ''}
                      onChange={(e) => setEditovanaEtapa({...editovanaEtapa, datumPovrchovejUpravyOd: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Povrchová úprava do</label>
                    <input type="date" value={editovanaEtapa.datumPovrchovejUpravyDo || ''}
                      onChange={(e) => setEditovanaEtapa({...editovanaEtapa, datumPovrchovejUpravyDo: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Montáž od</label>
                    <input type="date" value={editovanaEtapa.datumMontazeOd || ''}
                      onChange={(e) => setEditovanaEtapa({...editovanaEtapa, datumMontazeOd: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Montáž do</label>
                    <input type="date" value={editovanaEtapa.datumMontazeDo || ''}
                      onChange={(e) => setEditovanaEtapa({...editovanaEtapa, datumMontazeDo: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                  </div>
                </div>
              </div>

              {/* POVRCHOVÉ ÚPRAVY */}
              <div className="border-b pb-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Povrchové úpravy</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Zinkovanie</label>
                    <select value={editovanaEtapa.zinkovanie}
                      onChange={(e) => setEditovanaEtapa({...editovanaEtapa, zinkovanie: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                      <option value="nic">Žiadne</option>
                      <option value="ponorove">Ponorové</option>
                      <option value="galvanicke">Galvanické</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Farba</label>
                    <select value={editovanaEtapa.farba}
                      onChange={(e) => setEditovanaEtapa({...editovanaEtapa, farba: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                      <option value="nic">Žiadna</option>
                      <option value="praskovaMat">Prášková mat</option>
                      <option value="praskovaLes">Prášková lesk</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Odtieň farby (RAL)</label>
                    <input type="text" value={editovanaEtapa.farbaTon || ''}
                      onChange={(e) => setEditovanaEtapa({...editovanaEtapa, farbaTon: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="napr. RAL 9005" />
                  </div>
                </div>
              </div>

              {/* POPIS + STAV */}
              <div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Popis / Poznámky</label>
                    <textarea value={editovanaEtapa.popis || ''}
                      onChange={(e) => setEditovanaEtapa({...editovanaEtapa, popis: e.target.value})}
                      rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Stav projektu</label>
                    <select value={editovanaEtapa.stav}
                      onChange={(e) => setEditovanaEtapa({...editovanaEtapa, stav: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                      {Object.entries(stavyEtap).map(([hodnota, {label}]) => (
                        <option key={hodnota} value={hodnota}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onUlozitEtapu}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Uložiť zmeny
                </button>
                <button
                  onClick={onZrusitEditaciuEtapy}
                  className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300"
                >
                  Zrušiť
                </button>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Stav:</span>
                <span className="ml-2 font-medium">{stavyEtap[aktualnaEtapa.stav]?.label || 'Plánované'}</span>
              </div>
              {aktualnaEtapa.kontaktnaOsoba && (
                <div>
                  <span className="text-gray-600">Kontakt:</span>
                  <span className="ml-2 font-medium">{aktualnaEtapa.kontaktnaOsoba}</span>
                </div>
              )}
              {aktualnaEtapa.telefon && (
                <div>
                  <span className="text-gray-600">Telefón:</span>
                  <span className="ml-2 font-medium">{aktualnaEtapa.telefon}</span>
                </div>
              )}
              {aktualnaEtapa.email && (
                <div>
                  <span className="text-gray-600">Email:</span>
                  <span className="ml-2 font-medium">{aktualnaEtapa.email}</span>
                </div>
              )}
              {aktualnaEtapa.hmotnostPodlaVykazu && (
                <div>
                  <span className="text-gray-600">Hmotnosť podľa výkazu:</span>
                  <span className="ml-2 font-medium">{aktualnaEtapa.hmotnostPodlaVykazu} kg</span>
                </div>
              )}
              {aktualnaEtapa.zinkovanie && aktualnaEtapa.zinkovanie !== 'nic' && (
                <div>
                  <span className="text-gray-600">Zinkovanie:</span>
                  <span className="ml-2 font-medium">{aktualnaEtapa.zinkovanie}</span>
                </div>
              )}
              {aktualnaEtapa.farba && aktualnaEtapa.farba !== 'nic' && (
                <div>
                  <span className="text-gray-600">Farba:</span>
                  <span className="ml-2 font-medium">{aktualnaEtapa.farba}{aktualnaEtapa.farbaTon ? ` (${aktualnaEtapa.farbaTon})` : ''}</span>
                </div>
              )}
              {aktualnaEtapa.popis && (
                <div className="md:col-span-2">
                  <span className="text-gray-600">Popis:</span>
                  <span className="ml-2 font-medium">{aktualnaEtapa.popis}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* TIMELINE BLOK */}
        {(aktualnaEtapa.datumZaciatku || aktualnaEtapa.deadline || aktualnaEtapa.clovekohod) && (() => {
          const hodiny = parseFloat(aktualnaEtapa.clovekohod) || 0;
          const ludi = parseInt(pocetLudiEdit) || 1;
          const progresPct = progres ?? 0;
          const zostatok = hodiny * (1 - progresPct / 100);
          const zostDni = zostatok > 0 ? Math.ceil(zostatok / (ludi * 8)) : 0;
          const dnes = new Date();
          dnes.setHours(0,0,0,0);
          const datumKonca = zostDni > 0
            ? (() => { const d = new Date(dnes); d.setDate(d.getDate() + zostDni); return d.toISOString().split('T')[0]; })()
            : null;
          const ok = datumKonca && aktualnaEtapa.deadline ? datumKonca <= aktualnaEtapa.deadline : null;

          return (
            <div className="bg-white rounded-lg shadow p-5 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800 text-lg">{aktualnaEtapa.nazov}</h3>
                {ok !== null && (
                  <span className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                    ok ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${ok ? 'bg-green-500' : 'bg-red-500'}`} />
                    {ok ? 'Stihnete deadline' : 'Nestihnete deadline'}
                  </span>
                )}
              </div>

              {/* Progres bar */}
              {progres !== null && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Postup výroby</span>
                    <span className="font-medium">{progresPct}% hotových dielcov</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${progresPct}%`,
                        background: progresPct >= 100 ? '#22c55e' : progresPct > 50 ? '#3b82f6' : '#f59e0b'
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 items-end">
                {aktualnaEtapa.datumZaciatku && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Začiatok</p>
                    <p className="font-medium text-gray-800">{new Date(aktualnaEtapa.datumZaciatku).toLocaleDateString('sk-SK')}</p>
                  </div>
                )}
                {aktualnaEtapa.deadline && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Deadline</p>
                    <p className="font-medium text-gray-800">{new Date(aktualnaEtapa.deadline).toLocaleDateString('sk-SK')}</p>
                  </div>
                )}
                {hodiny > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Zostatok práce</p>
                    <p className="font-medium text-gray-800">{Math.round(zostatok)} hod.</p>
                  </div>
                )}
                {/* Inline edit počtu ľudí */}
                <div>
                  <p className="text-xs text-gray-500 mb-1">Počet ľudí</p>
                  <div className="flex gap-1 items-center">
                    <input
                      type="number" min="1" step="1"
                      value={pocetLudiEdit}
                      onChange={e => setPocetLudiEdit(e.target.value)}
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-sm font-medium"
                    />
                    <button
                      onClick={handleUlozitLudi}
                      disabled={ukladamLudi}
                      className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50"
                    >
                      {ukladamLudi ? '...' : 'OK'}
                    </button>
                  </div>
                </div>
                {datumKonca && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Odhadovaný koniec</p>
                    <p className={`font-medium ${ok ? 'text-green-700' : 'text-red-700'}`}>
                      {new Date(datumKonca).toLocaleDateString('sk-SK')}
                      <span className="text-xs ml-1">({zostDni} dní)</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

       {/* DIELCE TABUĽKA */}
       <div className="bg-white rounded-lg shadow p-6 mb-6">
  <div className="flex justify-between items-center mb-4">
    <button
      onClick={() => setShowDielce(v => !v)}
      className="flex items-center gap-2 text-xl font-semibold text-gray-800 hover:text-blue-600"
    >
      {showDielce ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
      Dielce ({aktualnaEtapa.dielce?.length || 0})
    </button>
    <div className="flex gap-2">
      <button
        onClick={() => setShowImport(true)}
        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
      >
        <Upload size={16} />
        Import Excel
      </button>
      <button
        onClick={() => setShowRozdelit(true)}
        className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
      >
        <Scissors size={16} />
        Rozdeliť projekt
      </button>
      <button
        onClick={onDetailCasti}
        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
      >
        <LayoutList size={16} />
        Časti
      </button>
    </div>
  </div>

  {showDielce && (
    <>
          {/* PREHĽAD ČASTÍ */}
          <PrehladCasti etapa={aktualnaEtapa} />

          {/* TABLE */}
          {aktualnaEtapa.dielce && aktualnaEtapa.dielce.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Č. dielca</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Názov</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profil</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Materiál</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Počet</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">1ks kg</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Celk. kg</th>
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
                              value={editovanyDielec.cislo_dielca || ''}
                              onChange={(e) => setEditovanyDielec({...editovanyDielec, cislo_dielca: e.target.value})}
                              className="w-full px-2 py-1 border border-blue-300 rounded"
                            />
                          </td>
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
                              type="text"
                              value={editovanyDielec.profil || ''}
                              onChange={(e) => setEditovanyDielec({...editovanyDielec, profil: e.target.value})}
                              className="w-full px-2 py-1 border border-blue-300 rounded"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={editovanyDielec.material || ''}
                              onChange={(e) => setEditovanyDielec({...editovanyDielec, material: e.target.value})}
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
                              value={editovanyDielec.hmotnost_celkova || ''}
                              onChange={(e) => setEditovanyDielec({...editovanyDielec, hmotnost_celkova: e.target.value})}
                              className="w-full px-2 py-1 border border-blue-300 rounded"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button onClick={onUlozitDielec} className="text-green-600 hover:text-green-700 text-sm">✓ Uložiť</button>
                              <button onClick={onZrusitEditaciuDielca} className="text-gray-600 hover:text-gray-700 text-sm">Zrušiť</button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-3 text-gray-500 font-mono text-sm">{dielec.cislo_dielca || '-'}</td>
                          <td className="px-4 py-3 font-medium text-gray-800">{dielec.nazov || '-'}</td>
                          <td className="px-4 py-3 text-gray-600">{dielec.profil || '-'}</td>
                          <td className="px-4 py-3 text-gray-600">{dielec.material || '-'}</td>
                          <td className="px-4 py-3 text-gray-600">{dielec.mnozstvo}</td>
                          <td className="px-4 py-3 text-gray-600">{dielec.hmotnostJednehoKs || '-'}</td>
                          <td className="px-4 py-3 text-gray-600">{dielec.hmotnost_celkova || '-'}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button onClick={() => onZacatEditovatDielec(dielec)} className="text-blue-600 hover:text-blue-700">
                                <Pencil size={16} />
                              </button>
                              <button onClick={() => onVymazatDielec(dielec.id)} className="text-red-600 hover:text-red-700">
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

          {/* PRIDAŤ DIELEC FORM */}
          <div className="bg-gray-50 rounded-lg p-4 mt-4">
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
    </>
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

        {/* MODALY */}
        {showImport && (
          <ImportModal
            etapaId={aktualnaEtapa.id}
            onClose={() => setShowImport(false)}
            onSuccess={() => { setShowImport(false); nacitajData(); }}
          />
        )}

        {showRozdelit && (
          <RozdelitEtapuModal
            etapa={aktualnaEtapa}
            onClose={() => setShowRozdelit(false)}
            onSuccess={() => { setShowRozdelit(false); nacitajData(); }}
          />
        )}

      </div>
    </div>
  );
}
