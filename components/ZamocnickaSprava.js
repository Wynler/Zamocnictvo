'use client'

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ChevronRight, Upload, X, ArrowLeft, Wrench, Pencil } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function ZamocnickaSprava() {
  const [zakazky, setZakazky] = useState([]);
  const [zobrazenie, setZobrazenie] = useState('zoznam');
  const [aktualnaZakazka, setAktualnaZakazka] = useState(null);
  const [aktualnaEtapa, setAktualnaEtapa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [novaZakazka, setNovaZakazka] = useState({
    nazov: '', zakaznik: '', kontaktnaOsoba: '', telefon: '', email: '',
    nazovFirmy: '', ico: '', dic: '', adresa: '', stav: 'priprava'
  });
  const [novaEtapa, setNovaEtapa] = useState({
    nazov: '', kontaktnaOsoba: '', telefon: '', email: '', hmotnostPodlaVykazu: '',
    datumUkoncenia: '', datumVyrobyOd: '', datumVyrobyDo: '',
    datumPovrchovejUpravyOd: '', datumPovrchovejUpravyDo: '',
    datumMontazeOd: '', datumMontazeDo: '', zinkovanie: 'nic',
    farba: 'nic', farbaTon: '', popis: '', stav: 'planovane'
  });
  const [novyDielec, setNovyDielec] = useState({
    nazov: '', hmotnostJednehoKs: '', mnozstvo: '', jednotka: 'ks'
  });
  const [importStatus, setImportStatus] = useState('');
  const [showImportStatus, setShowImportStatus] = useState(false);
  const [filterStav, setFilterStav] = useState('vsetky');
  const [showInfoZakazky, setShowInfoZakazky] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [zakazkaToDelete, setZakazkaToDelete] = useState(null);
  const [editujemZakazku, setEditujemZakazku] = useState(false);
  const [editovanaZakazka, setEditovanaZakazka] = useState(null);
  const [editujemEtapu, setEditujemEtapu] = useState(false);
  const [editovanaEtapa, setEditovanaEtapa] = useState(null);
  const [editujemDielec, setEditujemDielec] = useState(false);
  const [editovanyDielec, setEditovanyDielec] = useState(null);

  useEffect(() => { nacitajZakazky(); }, []);

  const nacitajZakazky = async () => {
    try {
      setLoading(true);
      const { data: zakazkyData, error: zakazkyError } = await supabase
        .from('zakazky')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (zakazkyError) throw zakazkyError;

      const zakazkySEtapami = await Promise.all(
        (zakazkyData || []).map(async (zakazka) => {
          const { data: etapyData, error: etapyError } = await supabase
            .from('etapy')
            .select('*')
            .eq('zakazka_id', zakazka.id)
            .order('created_at', { ascending: false });
          
          if (etapyError) throw etapyError;

          const etapySDielcami = await Promise.all(
            (etapyData || []).map(async (etapa) => {
              const { data: dielceData, error: dielceError } = await supabase
                .from('dielce')
                .select('*')
                .eq('etapa_id', etapa.id)
                .order('created_at', { ascending: false });
              
              if (dielceError) throw dielceError;

              return {
                ...etapa,
                kontaktnaOsoba: etapa.kontaktna_osoba,
                hmotnostPodlaVykazu: etapa.hmotnost_podla_vykazu,
                datumUkoncenia: etapa.datum_ukoncenia,
                datumVyrobyOd: etapa.datum_vyroby_od,
                datumVyrobyDo: etapa.datum_vyroby_do,
                datumPovrchovejUpravyOd: etapa.datum_povrchovej_upravy_od,
                datumPovrchovejUpravyDo: etapa.datum_povrchovej_upravy_do,
                datumMontazeOd: etapa.datum_montaze_od,
                datumMontazeDo: etapa.datum_montaze_do,
                farbaTon: etapa.farba_ton,
                dielce: (dielceData || []).map(d => ({
                  ...d,
                  hmotnostJednehoKs: d.hmotnost_jedneho_ks
                })),
                polozky: [], spojovaciMaterial: [], tyc: [], platne: [], spotrebny: []
              };
            })
          );

          return {
            ...zakazka,
            kontaktnaOsoba: zakazka.kontaktna_osoba,
            nazovFirmy: zakazka.nazov_firmy,
            etapy: etapySDielcami
          };
        })
      );

      setZakazky(zakazkySEtapami);
    } catch (error) {
      console.error('Chyba pri načítaní:', error);
      alert('Chyba pri načítaní dát z databázy');
    } finally {
      setLoading(false);
    }
  };

  const stavyZakaziek = {
    'priprava': { label: 'Príprava', farba: 'bg-yellow-100 text-yellow-700' },
    'aktivna': { label: 'Aktívna', farba: 'bg-blue-100 text-blue-700' },
    'ukoncena': { label: 'Ukončená', farba: 'bg-green-100 text-green-700' },
    'vymazane': { label: 'Vymazané', farba: 'bg-red-100 text-red-700' }
  };

  const stavyEtap = {
    'planovane': { label: 'Plánované', farba: 'bg-gray-100 text-gray-600' },
    'prebiehajuce': { label: 'Prebieha', farba: 'bg-blue-100 text-blue-600' },
    'dokoncene': { label: 'Dokončené', farba: 'bg-green-100 text-green-600' }
  };

  const zinkovaniePopisky = {
    'nic': 'Bez úpravy', 'ziarove': 'Žiarovo zinkované', 'galvanicke': 'Galvanicky zinkované',
    'praskovy-zaklad': 'Práškový základ', 'mokry-zaklad': 'Mokrý základ'
  };

  const farbaPopisky = {
    'nic': 'Bez farby', 'praskova': 'Prášková farba', 'mokry-vrch': 'Mokrý vrch'
  };

  const pridatZakazku = async () => {
    if (!novaZakazka.nazov || !novaZakazka.zakaznik) {
      alert('Vyplň aspoň názov a meno zákazníka'); return;
    }
    try {
      const { error } = await supabase.from('zakazky').insert([{
        nazov: novaZakazka.nazov, zakaznik: novaZakazka.zakaznik,
        kontaktna_osoba: novaZakazka.kontaktnaOsoba, telefon: novaZakazka.telefon,
        email: novaZakazka.email, nazov_firmy: novaZakazka.nazovFirmy,
        ico: novaZakazka.ico, dic: novaZakazka.dic, adresa: novaZakazka.adresa, stav: novaZakazka.stav
      }]);
      if (error) throw error;
      await nacitajZakazky();
      setNovaZakazka({ nazov: '', zakaznik: '', kontaktnaOsoba: '', telefon: '', email: '', nazovFirmy: '', ico: '', dic: '', adresa: '', stav: 'priprava' });
      setZobrazenie('zoznam');
    } catch (error) {
      console.error('Chyba:', error); alert('Chyba pri ukladaní');
    }
  };

  const vymazatZakazku = async (id) => {
    try {
      const { error } = await supabase.from('zakazky').update({ stav: 'vymazane' }).eq('id', id);
      if (error) throw error;
      await nacitajZakazky();
      setShowDeleteConfirm(false); setZakazkaToDelete(null);
      if (aktualnaZakazka?.id === id) setZobrazenie('zoznam');
    } catch (error) {
      console.error('Chyba:', error); alert('Chyba pri vymazávaní');
    }
  };

  const pridatEtapu = async (zakazkaId) => {
    if (!novaEtapa.nazov) { alert('Vyplň názov etapy'); return; }
    try {
      const { error } = await supabase.from('etapy').insert([{
        zakazka_id: zakazkaId, nazov: novaEtapa.nazov,
        kontaktna_osoba: novaEtapa.kontaktnaOsoba, telefon: novaEtapa.telefon, email: novaEtapa.email,
        hmotnost_podla_vykazu: novaEtapa.hmotnostPodlaVykazu || null,
        datum_ukoncenia: novaEtapa.datumUkoncenia || null,
        datum_vyroby_od: novaEtapa.datumVyrobyOd || null, datum_vyroby_do: novaEtapa.datumVyrobyDo || null,
        datum_povrchovej_upravy_od: novaEtapa.datumPovrchovejUpravyOd || null,
        datum_povrchovej_upravy_do: novaEtapa.datumPovrchovejUpravyDo || null,
        datum_montaze_od: novaEtapa.datumMontazeOd || null, datum_montaze_do: novaEtapa.datumMontazeDo || null,
        zinkovanie: novaEtapa.zinkovanie, farba: novaEtapa.farba, farba_ton: novaEtapa.farbaTon,
        popis: novaEtapa.popis, stav: novaEtapa.stav
      }]);
      if (error) throw error;
      await nacitajZakazky();
      setAktualnaZakazka(zakazky.find(z => z.id === zakazkaId));
      setNovaEtapa({ nazov: '', kontaktnaOsoba: '', telefon: '', email: '', hmotnostPodlaVykazu: '', datumUkoncenia: '', datumVyrobyOd: '', datumVyrobyDo: '', datumPovrchovejUpravyOd: '', datumPovrchovejUpravyDo: '', datumMontazeOd: '', datumMontazeDo: '', zinkovanie: 'nic', farba: 'nic', farbaTon: '', popis: '', stav: 'planovane' });
      setZobrazenie('detail');
    } catch (error) {
      console.error('Chyba:', error); alert('Chyba pri ukladaní');
    }
  };

  const pridatDielec = async (zakazkaId, etapaId) => {
    if (!novyDielec.nazov || !novyDielec.mnozstvo) {
      alert('Vyplň názov a množstvo'); return;
    }
    try {
      const { error } = await supabase.from('dielce').insert([{
        etapa_id: etapaId, nazov: novyDielec.nazov,
        hmotnost_jedneho_ks: novyDielec.hmotnostJednehoKs || null,
        mnozstvo: parseFloat(novyDielec.mnozstvo), jednotka: novyDielec.jednotka
      }]);
      if (error) throw error;
      await nacitajZakazky();
      const z = zakazky.find(z => z.id === zakazkaId);
      const e = z?.etapy.find(e => e.id === etapaId);
      setAktualnaZakazka(z); setAktualnaEtapa(e);
      setNovyDielec({ nazov: '', hmotnostJednehoKs: '', mnozstvo: '', jednotka: 'ks' });
      setZobrazenie('detail-etapy');
    } catch (error) {
      console.error('Chyba:', error); alert('Chyba pri ukladaní');
    }
  };

  const ulozitUpravuZakazky = async () => {
    if (!editovanaZakazka.nazov || !editovanaZakazka.zakaznik) {
      alert('Vyplň aspoň názov a meno zákazníka'); return;
    }
    try {
      const { error } = await supabase.from('zakazky').update({
        nazov: editovanaZakazka.nazov, zakaznik: editovanaZakazka.zakaznik,
        kontaktna_osoba: editovanaZakazka.kontaktnaOsoba, telefon: editovanaZakazka.telefon,
        email: editovanaZakazka.email, nazov_firmy: editovanaZakazka.nazovFirmy,
        ico: editovanaZakazka.ico, dic: editovanaZakazka.dic, adresa: editovanaZakazka.adresa
      }).eq('id', editovanaZakazka.id);
      if (error) throw error;
      await nacitajZakazky();
      setAktualnaZakazka(zakazky.find(z => z.id === editovanaZakazka.id));
      setEditujemZakazku(false); setEditovanaZakazka(null);
    } catch (error) {
      console.error('Chyba:', error); alert('Chyba pri ukladaní');
    }
  };

  const ulozitUpravuEtapy = async () => {
    if (!editovanaEtapa.nazov) { alert('Vyplň názov etapy'); return; }
    try {
      const { error } = await supabase.from('etapy').update({
        nazov: editovanaEtapa.nazov, kontaktna_osoba: editovanaEtapa.kontaktnaOsoba,
        telefon: editovanaEtapa.telefon, email: editovanaEtapa.email,
        hmotnost_podla_vykazu: editovanaEtapa.hmotnostPodlaVykazu || null,
        datum_ukoncenia: editovanaEtapa.datumUkoncenia || null,
        datum_vyroby_od: editovanaEtapa.datumVyrobyOd || null,
        datum_vyroby_do: editovanaEtapa.datumVyrobyDo || null,
        datum_povrchovej_upravy_od: editovanaEtapa.datumPovrchovejUpravyOd || null,
        datum_povrchovej_upravy_do: editovanaEtapa.datumPovrchovejUpravyDo || null,
        datum_montaze_od: editovanaEtapa.datumMontazeOd || null,
        datum_montaze_do: editovanaEtapa.datumMontazeDo || null,
        zinkovanie: editovanaEtapa.zinkovanie, farba: editovanaEtapa.farba,
        farba_ton: editovanaEtapa.farbaTon, popis: editovanaEtapa.popis
      }).eq('id', editovanaEtapa.id);
      if (error) throw error;
      await nacitajZakazky();
      const z = zakazky.find(z => z.id === aktualnaZakazka.id);
      const e = z?.etapy.find(e => e.id === editovanaEtapa.id);
      setAktualnaZakazka(z); setAktualnaEtapa(e);
      setEditujemEtapu(false); setEditovanaEtapa(null);
    } catch (error) {
      console.error('Chyba:', error); alert('Chyba pri ukladaní');
    }
  };

  const ulozitUpravuDielca = async () => {
    if (!editovanyDielec.nazov || !editovanyDielec.mnozstvo) {
      alert('Vyplň názov a množstvo'); return;
    }
    try {
      const { error } = await supabase.from('dielce').update({
        nazov: editovanyDielec.nazov, hmotnost_jedneho_ks: editovanyDielec.hmotnostJednehoKs || null,
        mnozstvo: parseFloat(editovanyDielec.mnozstvo), jednotka: editovanyDielec.jednotka
      }).eq('id', editovanyDielec.id);
      if (error) throw error;
      await nacitajZakazky();
      const z = zakazky.find(z => z.id === aktualnaZakazka.id);
      const e = z?.etapy.find(e => e.id === aktualnaEtapa.id);
      setAktualnaZakazka(z); setAktualnaEtapa(e);
      setEditujemDielec(false); setEditovanyDielec(null);
    } catch (error) {
      console.error('Chyba:', error); alert('Chyba pri ukladaní');
    }
  };

  const vymazatDielec = async (dielecId) => {
    if (!confirm('Naozaj chceš vymazať tento dielec?')) return;
    try {
      const { error } = await supabase.from('dielce').delete().eq('id', dielecId);
      if (error) throw error;
      await nacitajZakazky();
      const z = zakazky.find(z => z.id === aktualnaZakazka.id);
      const e = z?.etapy.find(e => e.id === aktualnaEtapa.id);
      setAktualnaZakazka(z); setAktualnaEtapa(e);
    } catch (error) {
      console.error('Chyba:', error); alert('Chyba pri vymazávaní');
    }
  };

  const zmenitStavZakazky = async (zakazkaId, novyStav) => {
    try {
      const { error } = await supabase.from('zakazky').update({ stav: novyStav }).eq('id', zakazkaId);
      if (error) throw error;
      await nacitajZakazky();
      setAktualnaZakazka(zakazky.find(z => z.id === zakazkaId));
    } catch (error) {
      console.error('Chyba:', error); alert('Chyba pri zmene stavu');
    }
  };

  const zmenitStavEtapy = async (zakazkaId, etapaId, novyStav) => {
    try {
      const { error } = await supabase.from('etapy').update({ stav: novyStav }).eq('id', etapaId);
      if (error) throw error;
      await nacitajZakazky();
      if (zobrazenie === 'detail-etapy') {
        const z = zakazky.find(z => z.id === zakazkaId);
        const e = z?.etapy.find(e => e.id === etapaId);
        setAktualnaEtapa(e);
      }
      if (aktualnaZakazka) {
        setAktualnaZakazka(zakazky.find(z => z.id === zakazkaId));
      }
    } catch (error) {
      console.error('Chyba:', error); alert('Chyba pri zmene stavu');
    }
  };

const otvorDetailEtapy = (zakazka, etapa) => {
    setAktualnaZakazka(zakazka);
    setAktualnaEtapa(etapa);
    setZobrazenie('detail-etapy');
  };

  const vypocitajPracovneDni = (datumOd, datumDo) => {
    if (!datumOd || !datumDo) return null;
    const start = new Date(datumOd);
    const end = new Date(datumDo);
    let pocetDni = 0;
    let aktualnyDatum = new Date(start);
    while (aktualnyDatum <= end) {
      const denVTyzdni = aktualnyDatum.getDay();
      if (denVTyzdni !== 0 && denVTyzdni !== 6) pocetDni++;
      aktualnyDatum.setDate(aktualnyDatum.getDate() + 1);
    }
    return pocetDni;
  };

  const generateKalendar = (etapa) => {
    if (!etapa.datumVyrobyOd && !etapa.datumPovrchovejUpravyOd && !etapa.datumMontazeOd) return null;
    const datumy = [
      etapa.datumVyrobyOd, etapa.datumVyrobyDo,
      etapa.datumPovrchovejUpravyOd, etapa.datumPovrchovejUpravyDo,
      etapa.datumMontazeOd, etapa.datumMontazeDo
    ].filter(d => d).map(d => new Date(d));
    const minDatum = new Date(Math.min(...datumy));
    const maxDatum = new Date(Math.max(...datumy));
    const datumUkoncenia = etapa.datumUkoncenia ? new Date(etapa.datumUkoncenia) : null;
    const start = new Date(minDatum.getFullYear(), minDatum.getMonth(), 1);
    const end = new Date(maxDatum.getFullYear(), maxDatum.getMonth() + 1, 0);
    const mesiace = [];
    let aktualnyMesiac = new Date(start);
    while (aktualnyMesiac <= end) {
      const rok = aktualnyMesiac.getFullYear();
      const mesiac = aktualnyMesiac.getMonth();
      const prvyDen = new Date(rok, mesiac, 1);
      const denVTyzdni = prvyDen.getDay();
      const zaciatok = denVTyzdni === 0 ? 6 : denVTyzdni - 1;
      const poslednyDen = new Date(rok, mesiac + 1, 0).getDate();
      const dni = [];
      for (let i = 0; i < zaciatok; i++) dni.push(null);
      for (let den = 1; den <= poslednyDen; den++) {
        const datum = new Date(rok, mesiac, den);
        let farba = null, label = '';
        let jeUkoncenie = datumUkoncenia && datum.toDateString() === datumUkoncenia.toDateString();
        if (etapa.datumVyrobyOd && etapa.datumVyrobyDo) {
          const vyrobaOd = new Date(etapa.datumVyrobyOd);
          const vyrobaDo = new Date(etapa.datumVyrobyDo);
          if (datum >= vyrobaOd && datum <= vyrobaDo) { farba = 'bg-blue-400'; label = 'Výroba'; }
        }
        if (etapa.datumPovrchovejUpravyOd && etapa.datumPovrchovejUpravyDo) {
          const povOd = new Date(etapa.datumPovrchovejUpravyOd);
          const povDo = new Date(etapa.datumPovrchovejUpravyDo);
          if (datum >= povOd && datum <= povDo) { farba = 'bg-purple-400'; label = 'Povrch'; }
        }
        if (etapa.datumMontazeOd && etapa.datumMontazeDo) {
          const montOd = new Date(etapa.datumMontazeOd);
          const montDo = new Date(etapa.datumMontazeDo);
          if (datum >= montOd && datum <= montDo) { farba = 'bg-green-400'; label = 'Montáž'; }
        }
        const denTyzd = datum.getDay();
        const jeVikend = denTyzd === 0 || denTyzd === 6;
        dni.push({ den, farba, label, jeVikend, jeUkoncenie, datum });
      }
      mesiace.push({
        nazov: aktualnyMesiac.toLocaleDateString('sk-SK', { month: 'long', year: 'numeric' }),
        dni
      });
      aktualnyMesiac = new Date(rok, mesiac + 1, 1);
    }
    return mesiace;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Načítavam dáta...</p>
        </div>
      </div>
    );
  }

  if (zobrazenie === 'zoznam') {
    const filtrovanieZakazky = filterStav === 'vsetky' ? zakazky : zakazky.filter(z => z.stav === filterStav);
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Presunúť do vymazaných?</h3>
                <p className="text-gray-600 mb-6">
                  Zákazka <span className="font-semibold">"{zakazkaToDelete?.nazov}"</span> bude presunutá do stavu "Vymazané".
                </p>
                <div className="flex gap-3">
                  <button onClick={() => vymazatZakazku(zakazkaToDelete.id)}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-medium">
                    Presunúť do vymazaných
                  </button>
                  <button onClick={() => { setShowDeleteConfirm(false); setZakazkaToDelete(null); }}
                    className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 font-medium">
                    Zrušiť
                  </button>
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Zákazky</h1>
            <button onClick={() => setZobrazenie('nova')}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              <Plus size={20} />Nová zákazka
            </button>
          </div>
          <div className="bg-white rounded-lg shadow p-4 mb-4">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm font-medium text-gray-700">Filter:</span>
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => setFilterStav('vsetky')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filterStav === 'vsetky' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                  Všetky ({zakazky.length})
                </button>
                {Object.entries(stavyZakaziek).map(([hodnota, {label, farba}]) => (
                  <button key={hodnota} onClick={() => setFilterStav(hodnota)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filterStav === hodnota ? farba + ' ring-2 ring-offset-2 ring-blue-500' : farba.replace('100', '50') + ' hover:' + farba}`}>
                    {label} ({zakazky.filter(z => z.stav === hodnota).length})
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="grid gap-4">
            {filtrovanieZakazky.map(zakazka => (
              <div key={zakazka.id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-800 mb-1">{zakazka.nazov}</h3>
                    <p className="text-gray-600">Zákazník: {zakazka.zakaznik}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${stavyZakaziek[zakazka.stav]?.farba || 'bg-gray-100 text-gray-700'}`}>
                    {stavyZakaziek[zakazka.stav]?.label || 'Príprava'}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <span>📋 {zakazka.etapy?.length || 0} etáp</span>
                  {zakazka.etapy?.length > 0 && (
                    <span>✅ {zakazka.etapy.filter(e => e.stav === 'dokoncene').length} dokončených</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setAktualnaZakazka(zakazka); setZobrazenie('detail'); }}
                    className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200">
                    Detail<ChevronRight size={16} />
                  </button>
                  <button onClick={() => { setZakazkaToDelete(zakazka); setShowDeleteConfirm(true); }}
                    className="flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded hover:bg-red-200">
                    <Trash2 size={16} />Vymazať
                  </button>
                </div>
              </div>
            ))}
            {filtrovanieZakazky.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg mb-2">{filterStav === 'vsetky' ? 'Žiadne zákazky' : `Žiadne zákazky v stave "${stavyZakaziek[filterStav]?.label}"`}</p>
                <p className="text-sm">{filterStav === 'vsetky' ? 'Začni pridaním novej zákazky' : 'Skús zmeniť filter'}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
}
