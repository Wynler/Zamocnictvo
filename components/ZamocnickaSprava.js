'use client'

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ChevronRight, Upload, X, ArrowLeft, Wrench, Edit, Pencil } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function ZamocnickaSprava() {
  const [zakazky, setZakazky] = useState([]);
  const [zobrazenie, setZobrazenie] = useState('zoznam');
  const [aktualnaZakazka, setAktualnaZakazka] = useState(null);
  const [aktualnaEtapa, setAktualnaEtapa] = useState(null);
  const [rozbalenieEtapy, setRozbalenieEtapy] = useState({});
  const [loading, setLoading] = useState(true);
  const [novaZakazka, setNovaZakazka] = useState({
    nazov: '',
    zakaznik: '',
    kontaktnaOsoba: '',
    telefon: '',
    email: '',
    nazovFirmy: '',
    ico: '',
    dic: '',
    adresa: '',
    stav: 'priprava'
  });
  const [novaEtapa, setNovaEtapa] = useState({
    nazov: '',
    kontaktnaOsoba: '',
    telefon: '',
    email: '',
    hmotnostPodlaVykazu: '',
    datumUkoncenia: '',
    datumVyrobyOd: '',
    datumVyrobyDo: '',
    datumPovrchovejUpravyOd: '',
    datumPovrchovejUpravyDo: '',
    datumMontazeOd: '',
    datumMontazeDo: '',
    zinkovanie: 'nic',
    farba: 'nic',
    farbaTon: '',
    popis: '',
    stav: 'planovane',
    subory: []
  });
  const [novyDielec, setNovyDielec] = useState({
    nazov: '',
    mnozstvo: '',
    jednotka: 'm',
    poznamka: ''
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

  // SUPABASE: Načítanie dát pri štarte
  useEffect(() => { 
    console.log('🔵 COMPONENT MOUNTED - volám nacitajZakazky()');
    nacitajZakazky(); 
  }, []);

  // SUPABASE: Funkcia na načítanie všetkých zákaziek s etapami a dielcami
  const nacitajZakazky = async () => {
    console.log('🟢 NAČÍTAVAM Z SUPABASE!');
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
                .order('created_at', { ascending: false});
              
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
                polozky: [],
                spojovaciMaterial: [],
                tyc: [],
                platne: [],
                spotrebny: [],
                subory: []
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
      console.log('✅ Načítané zákazky:', zakazkySEtapami.length);
    } catch (error) {
      console.error('❌ Chyba pri načítaní:', error);
      alert('Chyba pri načítaní dát z databázy: ' + error.message);
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
    'nic': 'Bez úpravy',
    'ziarove': 'Žiarovo zinkované',
    'galvanicke': 'Galvanicky zinkované',
    'praskovy-zaklad': 'Práškový základ',
    'mokry-zaklad': 'Mokrý základ'
  };

  const farbaPopisky = {
    'nic': 'Bez farby',
    'praskova': 'Prášková farba',
    'mokry-vrch': 'Mokrý vrch'
  };

  // SUPABASE: Pridať zákazku
  const pridatZakazku = async () => {
    console.log('🟡 PRIDÁVAM ZÁKAZKU DO SUPABASE!');
    if (!novaZakazka.nazov || !novaZakazka.zakaznik) {
      alert('Vyplň aspoň názov a meno zákazníka');
      return;
    }
    
    try {
      const { error } = await supabase.from('zakazky').insert([{
        nazov: novaZakazka.nazov,
        zakaznik: novaZakazka.zakaznik,
        kontaktna_osoba: novaZakazka.kontaktnaOsoba,
        telefon: novaZakazka.telefon,
        email: novaZakazka.email,
        nazov_firmy: novaZakazka.nazovFirmy,
        ico: novaZakazka.ico,
        dic: novaZakazka.dic,
        adresa: novaZakazka.adresa,
        stav: novaZakazka.stav
      }]);
      
      if (error) throw error;
      
      await nacitajZakazky();
      setNovaZakazka({ 
        nazov: '', 
        zakaznik: '', 
        kontaktnaOsoba: '',
        telefon: '',
        email: '',
        nazovFirmy: '',
        ico: '',
        dic: '',
        adresa: '',
        stav: 'priprava' 
      });
      setZobrazenie('zoznam');
      console.log('✅ Zákazka pridaná');
    } catch (error) {
      console.error('❌ Chyba:', error);
      alert('Chyba pri ukladaní: ' + error.message);
    }
  };

  // SUPABASE: Vymazať zákazku (zmena stavu)
  const vymazatZakazku = async (id) => {
    try {
      const { error } = await supabase
        .from('zakazky')
        .update({ stav: 'vymazane' })
        .eq('id', id);
      
      if (error) throw error;
      
      await nacitajZakazky();
      setShowDeleteConfirm(false);
      setZakazkaToDelete(null);
      
      if (aktualnaZakazka?.id === id) {
        setZobrazenie('zoznam');
      }
    } catch (error) {
      console.error('❌ Chyba:', error);
      alert('Chyba pri vymazávaní: ' + error.message);
    }
  };

  // SUPABASE: Pridať etapu
  const pridatEtapu = async (zakazkaId) => {
    if (!novaEtapa.nazov) {
      alert('Vyplň názov etapy');
      return;
    }
    
    try {
      const { error } = await supabase.from('etapy').insert([{
        zakazka_id: zakazkaId,
        nazov: novaEtapa.nazov,
        kontaktna_osoba: novaEtapa.kontaktnaOsoba,
        telefon: novaEtapa.telefon,
        email: novaEtapa.email,
        hmotnost_podla_vykazu: novaEtapa.hmotnostPodlaVykazu || null,
        datum_ukoncenia: novaEtapa.datumUkoncenia || null,
        datum_vyroby_od: novaEtapa.datumVyrobyOd || null,
        datum_vyroby_do: novaEtapa.datumVyrobyDo || null,
        datum_povrchovej_upravy_od: novaEtapa.datumPovrchovejUpravyOd || null,
        datum_povrchovej_upravy_do: novaEtapa.datumPovrchovejUpravyDo || null,
        datum_montaze_od: novaEtapa.datumMontazeOd || null,
        datum_montaze_do: novaEtapa.datumMontazeDo || null,
        zinkovanie: novaEtapa.zinkovanie,
        farba: novaEtapa.farba,
        farba_ton: novaEtapa.farbaTon,
        popis: novaEtapa.popis,
        stav: novaEtapa.stav
      }]);
      
      if (error) throw error;
      
      await nacitajZakazky();
      setAktualnaZakazka(zakazky.find(z => z.id === zakazkaId));
      setNovaEtapa({ 
        nazov: '',
        kontaktnaOsoba: '',
        telefon: '',
        email: '',
        hmotnostPodlaVykazu: '',
        datumUkoncenia: '',
        datumVyrobyOd: '',
        datumVyrobyDo: '',
        datumPovrchovejUpravyOd: '',
        datumPovrchovejUpravyDo: '',
        datumMontazeOd: '',
        datumMontazeDo: '',
        zinkovanie: 'nic',
        farba: 'nic',
        farbaTon: '',
        popis: '',
        stav: 'planovane',
        subory: []
      });
      setZobrazenie('detail');
    } catch (error) {
      console.error('❌ Chyba:', error);
      alert('Chyba pri ukladaní: ' + error.message);
    }
  };

  // SUPABASE: Pridať dielec
  const pridatDielec = async (zakazkaId, etapaId) => {
    if (!novyDielec.nazov || !novyDielec.mnozstvo) {
      alert('Vyplň názov a množstvo');
      return;
    }
    
    try {
      const { error } = await supabase.from('dielce').insert([{
        etapa_id: etapaId,
        nazov: novyDielec.nazov,
        hmotnost_jedneho_ks: novyDielec.hmotnostJednehoKs || null,
        mnozstvo: parseFloat(novyDielec.mnozstvo),
        jednotka: novyDielec.jednotka,
        poznamka: novyDielec.poznamka
      }]);
      
      if (error) throw error;
      
      await nacitajZakazky();
      const z = zakazky.find(z => z.id === zakazkaId);
      const e = z?.etapy.find(e => e.id === etapaId);
      setAktualnaZakazka(z);
      setAktualnaEtapa(e);
      setNovyDielec({ nazov: '', mnozstvo: '', jednotka: 'm', poznamka: '' });
      setZobrazenie('detail-etapy');
    } catch (error) {
      console.error('❌ Chyba:', error);
      alert('Chyba pri ukladaní: ' + error.message);
    }
  };

  // SUPABASE: Upraviť zákazku
  const ulozitUpravuZakazky = async () => {
    if (!editovanaZakazka.nazov || !editovanaZakazka.zakaznik) {
      alert('Vyplň aspoň názov a meno zákazníka');
      return;
    }

    try {
      const { error } = await supabase.from('zakazky').update({
        nazov: editovanaZakazka.nazov,
        zakaznik: editovanaZakazka.zakaznik,
        kontaktna_osoba: editovanaZakazka.kontaktnaOsoba,
        telefon: editovanaZakazka.telefon,
        email: editovanaZakazka.email,
        nazov_firmy: editovanaZakazka.nazovFirmy,
        ico: editovanaZakazka.ico,
        dic: editovanaZakazka.dic,
        adresa: editovanaZakazka.adresa
      }).eq('id', editovanaZakazka.id);
      
      if (error) throw error;
      
      await nacitajZakazky();
      setAktualnaZakazka(zakazky.find(z => z.id === editovanaZakazka.id));
      setEditujemZakazku(false);
      setEditovanaZakazka(null);
    } catch (error) {
      console.error('❌ Chyba:', error);
      alert('Chyba pri ukladaní: ' + error.message);
    }
  };

  // SUPABASE: Upraviť etapu
  const ulozitUpravuEtapy = async () => {
    if (!editovanaEtapa.nazov) {
      alert('Vyplň názov etapy');
      return;
    }

    try {
      const { error } = await supabase.from('etapy').update({
        nazov: editovanaEtapa.nazov,
        kontaktna_osoba: editovanaEtapa.kontaktnaOsoba,
        telefon: editovanaEtapa.telefon,
        email: editovanaEtapa.email,
        hmotnost_podla_vykazu: editovanaEtapa.hmotnostPodlaVykazu || null,
        datum_ukoncenia: editovanaEtapa.datumUkoncenia || null,
        datum_vyroby_od: editovanaEtapa.datumVyrobyOd || null,
        datum_vyroby_do: editovanaEtapa.datumVyrobyDo || null,
        datum_povrchovej_upravy_od: editovanaEtapa.datumPovrchovejUpravyOd || null,
        datum_povrchovej_upravy_do: editovanaEtapa.datumPovrchovejUpravyDo || null,
        datum_montaze_od: editovanaEtapa.datumMontazeOd || null,
        datum_montaze_do: editovanaEtapa.datumMontazeDo || null,
        zinkovanie: editovanaEtapa.zinkovanie,
        farba: editovanaEtapa.farba,
        farba_ton: editovanaEtapa.farbaTon,
        popis: editovanaEtapa.popis
      }).eq('id', editovanaEtapa.id);
      
      if (error) throw error;
      
      await nacitajZakazky();
      const z = zakazky.find(z => z.id === aktualnaZakazka.id);
      const e = z?.etapy.find(e => e.id === editovanaEtapa.id);
      setAktualnaZakazka(z);
      setAktualnaEtapa(e);
      setEditujemEtapu(false);
      setEditovanaEtapa(null);
    } catch (error) {
      console.error('❌ Chyba:', error);
      alert('Chyba pri ukladaní: ' + error.message);
    }
  };

  // SUPABASE: Upraviť dielec
  const ulozitUpravuDielca = async () => {
    if (!editovanyDielec.nazov || !editovanyDielec.mnozstvo) {
      alert('Vyplň názov a množstvo');
      return;
    }

    try {
      const { error } = await supabase.from('dielce').update({
        nazov: editovanyDielec.nazov,
        hmotnost_jedneho_ks: editovanyDielec.hmotnostJednehoKs || null,
        mnozstvo: parseFloat(editovanyDielec.mnozstvo),
        jednotka: editovanyDielec.jednotka,
        poznamka: editovanyDielec.poznamka
      }).eq('id', editovanyDielec.id);
      
      if (error) throw error;
      
      await nacitajZakazky();
      const z = zakazky.find(z => z.id === aktualnaZakazka.id);
      const e = z?.etapy.find(e => e.id === aktualnaEtapa.id);
      setAktualnaZakazka(z);
      setAktualnaEtapa(e);
      setEditujemDielec(false);
      setEditovanyDielec(null);
    } catch (error) {
      console.error('❌ Chyba:', error);
      alert('Chyba pri ukladaní: ' + error.message);
    }
  };

  // SUPABASE: Vymazať dielec
  const vymazatDielec = async (dielecId) => {
    if (!confirm('Naozaj chceš vymazať tento dielec?')) return;
    
    try {
      const { error } = await supabase.from('dielce').delete().eq('id', dielecId);
      
      if (error) throw error;
      
      await nacitajZakazky();
      const z = zakazky.find(z => z.id === aktualnaZakazka.id);
      const e = z?.etapy.find(e => e.id === aktualnaEtapa.id);
      setAktualnaZakazka(z);
      setAktualnaEtapa(e);
    } catch (error) {
      console.error('❌ Chyba:', error);
      alert('Chyba pri vymazávaní: ' + error.message);
    }
  };

  // SUPABASE: Zmeniť stav zákazky
  const zmenitStavZakazky = async (zakazkaId, novyStav) => {
    try {
      const { error } = await supabase
        .from('zakazky')
        .update({ stav: novyStav })
        .eq('id', zakazkaId);
      
      if (error) throw error;
      
      await nacitajZakazky();
      setAktualnaZakazka(zakazky.find(z => z.id === zakazkaId));
    } catch (error) {
      console.error('❌ Chyba:', error);
      alert('Chyba pri zmene stavu: ' + error.message);
    }
  };

  // SUPABASE: Zmeniť stav etapy
  const zmenitStavEtapy = async (zakazkaId, etapaId, novyStav) => {
    try {
      const { error } = await supabase
        .from('etapy')
        .update({ stav: novyStav })
        .eq('id', etapaId);
      
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
      console.error('❌ Chyba:', error);
      alert('Chyba pri zmene stavu: ' + error.message);
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
      if (denVTyzdni !== 0 && denVTyzdni !== 6) {
        pocetDni++;
      }
      aktualnyDatum.setDate(aktualnyDatum.getDate() + 1);
    }
    
    return pocetDni;
  };
    const start = new Date(datumOd);
    const end = new Date(datumDo);
    
    let pocetDni = 0;
    let aktualnyDatum = new Date(start);
    
    while (aktualnyDatum <= end) {
      const denVTyzdni = aktualnyDatum.getDay();
      if (denVTyzdni !== 0 && denVTyzdni !== 6) {
        pocetDni++;
      }
      aktualnyDatum.setDate(aktualnyDatum.getDate() + 1);
    }
    
    return pocetDni;
  };

  const generateKalendar = (etapa) => {
    if (!etapa.datumVyrobyOd && !etapa.datumPovrchovejUpravyOd && !etapa.datumMontazeOd) {
      return null;
    }

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
      
      for (let i = 0; i < zaciatok; i++) {
        dni.push(null);
      }
      
      for (let den = 1; den <= poslednyDen; den++) {
        const datum = new Date(rok, mesiac, den);
        const datumStr = datum.toISOString().split('T')[0];
        
        let farba = null;
        let label = '';
        let jeUkoncenie = datumUkoncenia && datum.toDateString() === datumUkoncenia.toDateString();
        
        if (etapa.datumVyrobyOd && etapa.datumVyrobyDo) {
          const vyrobaOd = new Date(etapa.datumVyrobyOd);
          const vyrobaDo = new Date(etapa.datumVyrobyDo);
          if (datum >= vyrobaOd && datum <= vyrobaDo) {
            farba = 'bg-blue-400';
            label = 'Výroba';
          }
        }
        
        if (etapa.datumPovrchovejUpravyOd && etapa.datumPovrchovejUpravyDo) {
          const povOd = new Date(etapa.datumPovrchovejUpravyOd);
          const povDo = new Date(etapa.datumPovrchovejUpravyDo);
          if (datum >= povOd && datum <= povDo) {
            farba = 'bg-purple-400';
            label = 'Povrch';
          }
        }
        
        if (etapa.datumMontazeOd && etapa.datumMontazeDo) {
          const montOd = new Date(etapa.datumMontazeOd);
          const montDo = new Date(etapa.datumMontazeDo);
          if (datum >= montOd && datum <= montDo) {
            farba = 'bg-green-400';
            label = 'Montáž';
          }
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

  // ZOZNAM ZÁKAZIEK
  if (zobrazenie === 'zoznam') {
    const filtrovanieZakazky = filterStav === 'vsetky' 
      ? zakazky 
      : zakazky.filter(z => z.stav === filterStav);

    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Presunúť do vymazaných?</h3>
                <p className="text-gray-600 mb-6">
                  Zákazka <span className="font-semibold">"{zakazkaToDelete?.nazov}"</span> bude presunutá do stavu "Vymazané". 
                  Neskôr ju môžeš obnoviť zmenou stavu.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => vymazatZakazku(zakazkaToDelete.id)}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-medium"
                  >
                    Presunúť do vymazaných
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setZakazkaToDelete(null);
                    }}
                    className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 font-medium"
                  >
                    Zrušiť
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Zákazky</h1>
            <button
              onClick={() => setZobrazenie('nova')}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Plus size={20} />
              Nová zákazka
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-4 mb-4">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm font-medium text-gray-700">Filter:</span>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setFilterStav('vsetky')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    filterStav === 'vsetky' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Všetky ({zakazky.length})
                </button>
                {Object.entries(stavyZakaziek).map(([hodnota, {label, farba}]) => (
                  <button
                    key={hodnota}
                    onClick={() => setFilterStav(hodnota)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      filterStav === hodnota 
                        ? farba + ' ring-2 ring-offset-2 ring-blue-500'
                        : farba.replace('100', '50') + ' hover:' + farba
                    }`}
                  >
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
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${stavyZakaziek[zakazka.stav]?.farba || 'bg-gray-100 text-gray-700'}`}>
                      {stavyZakaziek[zakazka.stav]?.label || 'Príprava'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <span>📋 {zakazka.etapy?.length || 0} etáp</span>
                  {zakazka.etapy?.length > 0 && (
                    <span>
                      ✅ {zakazka.etapy.filter(e => e.stav === 'dokoncene').length} dokončených
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setAktualnaZakazka(zakazka);
                      setZobrazenie('detail');
                    }}
                    className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200"
                  >
                    Detail
                    <ChevronRight size={16} />
                  </button>
                  <button
                    onClick={() => {
                      setZakazkaToDelete(zakazka);
                      setShowDeleteConfirm(true);
                    }}
                    className="flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded hover:bg-red-200"
                  >
                    <Trash2 size={16} />
                    Vymazať
                  </button>
                </div>
              </div>
            ))}

            {filtrovanieZakazky.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg mb-2">
                  {filterStav === 'vsetky' ? 'Žiadne zákazky' : `Žiadne zákazky v stave "${stavyZakaziek[filterStav]?.label}"`}
                </p>
                <p className="text-sm">
                  {filterStav === 'vsetky' ? 'Začni pridaním novej zákazky' : 'Skús zmeniť filter'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // NOVÁ ZÁKAZKA
  if (zobrazenie === 'nova') {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Nová zákazka</h2>
            
            <div className="space-y-6">
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Základné údaje</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Názov zákazky *</label>
                    <input
                      type="text"
                      value={novaZakazka.nazov}
                      onChange={(e) => setNovaZakazka({...novaZakazka, nazov: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="napr. Zábradlie rodinný dom"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Meno zákazníka *</label>
                    <input
                      type="text"
                      value={novaZakazka.zakaznik}
                      onChange={(e) => setNovaZakazka({...novaZakazka, zakaznik: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="napr. Ján Novák"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Kontaktná osoba</label>
                    <input
                      type="text"
                      value={novaZakazka.kontaktnaOsoba}
                      onChange={(e) => setNovaZakazka({...novaZakazka, kontaktnaOsoba: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Telefón</label>
                    <input
                      type="tel"
                      value={novaZakazka.telefon}
                      onChange={(e) => setNovaZakazka({...novaZakazka, telefon: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={novaZakazka.email}
                      onChange={(e) => setNovaZakazka({...novaZakazka, email: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Fakturačné údaje</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Názov firmy</label>
                    <input
                      type="text"
                      value={novaZakazka.nazovFirmy}
                      onChange={(e) => setNovaZakazka({...novaZakazka, nazovFirmy: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">IČO</label>
                    <input
                      type="text"
                      value={novaZakazka.ico}
                      onChange={(e) => setNovaZakazka({...novaZakazka, ico: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">DIČ</label>
                    <input
                      type="text"
                      value={novaZakazka.dic}
                      onChange={(e) => setNovaZakazka({...novaZakazka, dic: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fakturačná adresa</label>
                    <input
                      type="text"
                      value={novaZakazka.adresa}
                      onChange={(e) => setNovaZakazka({...novaZakazka, adresa: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Stav zákazky</h3>
                <select
                  value={novaZakazka.stav}
                  onChange={(e) => setNovaZakazka({...novaZakazka, stav: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  {Object.entries(stavyZakaziek).map(([hodnota, {label}]) => (
                    <option key={hodnota} value={hodnota}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={pridatZakazku}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
              >
                Vytvoriť zákazku
              </button>
              <button
                onClick={() => {
                  setNovaZakazka({ 
                    nazov: '', zakaznik: '', kontaktnaOsoba: '', telefon: '', email: '',
                    nazovFirmy: '', ico: '', dic: '', adresa: '', stav: 'priprava' 
                  });
                  setZobrazenie('zoznam');
                }}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Zrušiť
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // DETAIL ZÁKAZKY - zjednodušený zoznam etáp
  if (zobrazenie === 'detail' && aktualnaZakazka) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => setZobrazenie('zoznam')}
            className="mb-4 text-blue-600 hover:text-blue-700 flex items-center gap-2"
          >
            ← Späť na zoznam
          </button>

          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-gray-800 mb-3">{aktualnaZakazka.nazov}</h2>
              </div>
              
              <div className="flex flex-col items-end gap-2">
                <label className="text-xs text-gray-500 font-medium">Stav zákazky</label>
                <select
                  value={aktualnaZakazka.stav}
                  onChange={(e) => zmenitStavZakazky(aktualnaZakazka.id, e.target.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border-2 cursor-pointer ${stavyZakaziek[aktualnaZakazka.stav]?.farba || 'bg-gray-100 text-gray-700'}`}
                  style={{ appearance: 'none', paddingRight: '2rem', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%23333\' d=\'M6 9L1 4h10z\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center' }}
                >
                  {Object.entries(stavyZakaziek).map(([hodnota, {label}]) => (
                    <option key={hodnota} value={hodnota}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <button
                  onClick={() => setShowInfoZakazky(!showInfoZakazky)}
                  className="flex-1 flex justify-between items-center text-left hover:bg-gray-50 p-3 rounded-lg transition"
                >
                  <span className="font-medium text-gray-700">
                    📋 Detailné informácie o zákazke
                  </span>
                  <span className="text-gray-400 text-xl">
                    {showInfoZakazky ? '−' : '+'}
                  </span>
                </button>
                
                {showInfoZakazky && (
                  <button
                    onClick={() => {
                      setEditovanaZakazka({...aktualnaZakazka});
                      setEditujemZakazku(true);
                    }}
                    className="ml-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                  >
                    ✏️ Upraviť
                  </button>
                )}
              </div>

              {showInfoZakazky && !editujemZakazku && (
                <div className="mt-4 grid md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-800 border-b pb-2">Kontaktné údaje</h4>
                    
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Meno zákazníka</p>
                      <p className="text-gray-800 font-medium">{aktualnaZakazka.zakaznik}</p>
                    </div>

                    {aktualnaZakazka.kontaktnaOsoba && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Kontaktná osoba</p>
                        <p className="text-gray-800">{aktualnaZakazka.kontaktnaOsoba}</p>
                      </div>
                    )}

                    {aktualnaZakazka.telefon && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Telefón</p>
                        <p className="text-gray-800">
                          <a href={`tel:${aktualnaZakazka.telefon}`} className="text-blue-600 hover:underline">
                            {aktualnaZakazka.telefon}
                          </a>
                        </p>
                      </div>
                    )}

                    {aktualnaZakazka.email && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Email</p>
                        <p className="text-gray-800">
                          <a href={`mailto:${aktualnaZakazka.email}`} className="text-blue-600 hover:underline">
                            {aktualnaZakazka.email}
                          </a>
                        </p>
                      </div>
                    )}

                    {!aktualnaZakazka.kontaktnaOsoba && !aktualnaZakazka.telefon && !aktualnaZakazka.email && (
                      <p className="text-sm text-gray-400 italic">Žiadne ďalšie kontaktné údaje</p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-800 border-b pb-2">Fakturačné údaje</h4>
                    
                    {aktualnaZakazka.nazovFirmy && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Názov firmy</p>
                        <p className="text-gray-800 font-medium">{aktualnaZakazka.nazovFirmy}</p>
                      </div>
                    )}

                    {aktualnaZakazka.ico && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">IČO</p>
                        <p className="text-gray-800">{aktualnaZakazka.ico}</p>
                      </div>
                    )}

                    {aktualnaZakazka.dic && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">DIČ</p>
                        <p className="text-gray-800">{aktualnaZakazka.dic}</p>
                      </div>
                    )}

                    {aktualnaZakazka.adresa && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Fakturačná adresa</p>
                        <p className="text-gray-800">{aktualnaZakazka.adresa}</p>
                      </div>
                    )}

                    {!aktualnaZakazka.nazovFirmy && !aktualnaZakazka.ico && !aktualnaZakazka.dic && !aktualnaZakazka.adresa && (
                      <p className="text-sm text-gray-400 italic">Žiadne fakturačné údaje</p>
                    )}
                  </div>
                </div>
              )}

              {showInfoZakazky && editujemZakazku && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                  <h4 className="font-semibold text-gray-800 mb-4">Úprava informácií</h4>
                  
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Názov zákazky *</label>
                        <input
                          type="text"
                          value={editovanaZakazka.nazov}
                          onChange={(e) => setEditovanaZakazka({...editovanaZakazka, nazov: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Meno zákazníka *</label>
                        <input
                          type="text"
                          value={editovanaZakazka.zakaznik}
                          onChange={(e) => setEditovanaZakazka({...editovanaZakazka, zakaznik: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Kontaktná osoba</label>
                        <input
                          type="text"
                          value={editovanaZakazka.kontaktnaOsoba || ''}
                          onChange={(e) => setEditovanaZakazka({...editovanaZakazka, kontaktnaOsoba: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Telefón</label>
                        <input
                          type="tel"
                          value={editovanaZakazka.telefon || ''}
                          onChange={(e) => setEditovanaZakazka({...editovanaZakazka, telefon: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          value={editovanaZakazka.email || ''}
                          onChange={(e) => setEditovanaZakazka({...editovanaZakazka, email: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h5 className="font-medium text-gray-700 mb-3">Fakturačné údaje</h5>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Názov firmy</label>
                          <input
                            type="text"
                            value={editovanaZakazka.nazovFirmy || ''}
                            onChange={(e) => setEditovanaZakazka({...editovanaZakazka, nazovFirmy: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">IČO</label>
                          <input
                            type="text"
                            value={editovanaZakazka.ico || ''}
                            onChange={(e) => setEditovanaZakazka({...editovanaZakazka, ico: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">DIČ</label>
                          <input
                            type="text"
                            value={editovanaZakazka.dic || ''}
                            onChange={(e) => setEditovanaZakazka({...editovanaZakazka, dic: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Fakturačná adresa</label>
                          <input
                            type="text"
                            value={editovanaZakazka.adresa || ''}
                            onChange={(e) => setEditovanaZakazka({...editovanaZakazka, adresa: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={ulozitUpravuZakazky}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium"
                      >
                        ✓ Uložiť zmeny
                      </button>
                      <button
                        onClick={() => {
                          setEditujemZakazku(false);
                          setEditovanaZakazka(null);
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium"
                      >
                        Zrušiť
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ZJEDNODUŠENÝ ZOZNAM ETÁP */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Etapy</h3>
              <button
                onClick={() => {
                  setNovaEtapa({
                    ...novaEtapa,
                    kontaktnaOsoba: aktualnaZakazka.kontaktnaOsoba || '',
                    telefon: aktualnaZakazka.telefon || '',
                    email: aktualnaZakazka.email || ''
                  });
                  setZobrazenie('nova-etapa');
                }}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <Plus size={16} />
                Pridať etapu
              </button>
            </div>

            {aktualnaZakazka.etapy?.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Zatiaľ žiadne etapy</p>
            ) : (
              <div className="space-y-3">
                {aktualnaZakazka.etapy.map((etapa) => (
                  <div 
                    key={etapa.id} 
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer"
                    onClick={() => otvorDetailEtapy(aktualnaZakazka, etapa)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg text-gray-800 mb-2">{etapa.nazov}</h4>
                        <div className="flex items-center gap-4 text-sm flex-wrap">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${stavyEtap[etapa.stav].farba}`}>
                            {stavyEtap[etapa.stav].label}
                          </span>
                          {etapa.datumUkoncenia && (
                            <span className="text-gray-600">
                              📅 Do: <span className="font-medium">{etapa.datumUkoncenia}</span>
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-gray-400">
                        <ChevronRight size={20} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // DETAIL ETAPY - nová samostatná stránka
  if (zobrazenie === 'detail-etapy' && aktualnaEtapa) {
    const dniVyroba = vypocitajPracovneDni(aktualnaEtapa.datumVyrobyOd, aktualnaEtapa.datumVyrobyDo);
    const dniPovrch = vypocitajPracovneDni(aktualnaEtapa.datumPovrchovejUpravyOd, aktualnaEtapa.datumPovrchovejUpravyDo);
    const dniMontaz = vypocitajPracovneDni(aktualnaEtapa.datumMontazeOd, aktualnaEtapa.datumMontazeDo);
    const kalendar = generateKalendar(aktualnaEtapa);

    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {showImportStatus && (
            <div className="fixed top-4 right-4 bg-white shadow-lg rounded-lg p-4 border-l-4 border-blue-500 z-50 max-w-md">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{importStatus}</p>
                </div>
                <button
                  onClick={() => setShowImportStatus(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}

          {/* HLAVIČKA S NÁVRATOM */}
          <div className="mb-6">
            <button
              onClick={() => setZobrazenie('detail')}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
            >
              <ArrowLeft size={20} />
              Späť na zákazku
            </button>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start flex-wrap gap-4">
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">Zákazka: {aktualnaZakazka.nazov}</p>
                  {!editujemEtapu ? (
                    <h1 className="text-3xl font-bold text-gray-800 mb-3">{aktualnaEtapa.nazov}</h1>
                  ) : (
                    <input
                      type="text"
                      value={editovanaEtapa.nazov}
                      onChange={(e) => setEditovanaEtapa({...editovanaEtapa, nazov: e.target.value})}
                      className="text-3xl font-bold text-gray-800 mb-3 border-2 border-blue-300 rounded px-2 py-1"
                    />
                  )}
                </div>
                <div className="flex gap-2 items-start">
                  {!editujemEtapu ? (
                    <>
                      <button
                        onClick={() => {
                          setEditovanaEtapa({...aktualnaEtapa});
                          setEditujemEtapu(true);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                      >
                        <Pencil size={16} />
                        Upraviť
                      </button>
                      <select
                        value={aktualnaEtapa.stav}
                        onChange={(e) => zmenitStavEtapy(aktualnaZakazka.id, aktualnaEtapa.id, e.target.value)}
                        className={`px-4 py-2 rounded-full text-sm font-medium border-2 cursor-pointer ${stavyEtap[aktualnaEtapa.stav].farba}`}
                        style={{ appearance: 'none', paddingRight: '2rem', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%23333\' d=\'M6 9L1 4h10z\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center' }}
                      >
                        {Object.entries(stavyEtap).map(([hodnota, {label}]) => (
                          <option key={hodnota} value={hodnota}>{label}</option>
                        ))}
                      </select>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={ulozitUpravuEtapy}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                      >
                        ✓ Uložiť
                      </button>
                      <button
                        onClick={() => {
                          setEditujemEtapu(false);
                          setEditovanaEtapa(null);
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                      >
                        Zrušiť
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ZÁKLADNÉ INFO */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {(aktualnaEtapa.hmotnostPodlaVykazu || editujemEtapu) && (
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-500 mb-1">Hmotnosť podľa výkazu</p>
                {!editujemEtapu ? (
                  <p className="text-2xl font-bold text-gray-800">{aktualnaEtapa.hmotnostPodlaVykazu} kg</p>
                ) : (
                  <input
                    type="number"
                    step="0.1"
                    value={editovanaEtapa.hmotnostPodlaVykazu || ''}
                    onChange={(e) => setEditovanaEtapa({...editovanaEtapa, hmotnostPodlaVykazu: e.target.value})}
                    className="text-2xl font-bold text-gray-800 border-2 border-blue-300 rounded px-2 py-1 w-full"
                    placeholder="0.0"
                  />
                )}
              </div>
            )}
            {(aktualnaEtapa.datumUkoncenia || editujemEtapu) && (
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-500 mb-1">Termín ukončenia</p>
                {!editujemEtapu ? (
                  <p className="text-2xl font-bold text-gray-800">{aktualnaEtapa.datumUkoncenia}</p>
                ) : (
                  <input
                    type="date"
                    value={editovanaEtapa.datumUkoncenia || ''}
                    onChange={(e) => setEditovanaEtapa({...editovanaEtapa, datumUkoncenia: e.target.value})}
                    className="text-xl font-bold text-gray-800 border-2 border-blue-300 rounded px-2 py-1 w-full"
                  />
                )}
              </div>
            )}
            {(dniVyroba || dniPovrch || dniMontaz) && !editujemEtapu && (
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-500 mb-1">Celkom pracovných dní</p>
                <p className="text-2xl font-bold text-gray-800">{(dniVyroba || 0) + (dniPovrch || 0) + (dniMontaz || 0)} dní</p>
              </div>
            )}
          </div>

          {/* POVRCHOVÁ ÚPRAVA */}
          {((aktualnaEtapa.zinkovanie !== 'nic' || aktualnaEtapa.farba !== 'nic') || editujemEtapu) && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">🎨 Povrchová úprava</h3>
              {!editujemEtapu ? (
                <div className="flex flex-wrap gap-3">
                  {aktualnaEtapa.zinkovanie !== 'nic' && (
                    <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-medium">
                      🛡️ {zinkovaniePopisky[aktualnaEtapa.zinkovanie]}
                    </span>
                  )}
                  {aktualnaEtapa.farba !== 'nic' && (
                    <span className="bg-purple-100 text-purple-800 px-4 py-2 rounded-lg font-medium">
                      🎨 {farbaPopisky[aktualnaEtapa.farba]}
                      {aktualnaEtapa.farbaTon && ` - ${aktualnaEtapa.farbaTon}`}
                    </span>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Zinkovanie</label>
                      <select
                        value={editovanaEtapa.zinkovanie}
                        onChange={(e) => setEditovanaEtapa({...editovanaEtapa, zinkovanie: e.target.value})}
                        className="w-full px-3 py-2 border-2 border-blue-300 rounded-lg"
                      >
                        <option value="nic">Bez povrchovej úpravy</option>
                        <option value="ziarove">Žiarovo zinkované</option>
                        <option value="galvanicke">Galvanicky zinkované</option>
                        <option value="praskovy-zaklad">Práškový základ</option>
                        <option value="mokry-zaklad">Mokrý základ</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Farba</label>
                      <select
                        value={editovanaEtapa.farba}
                        onChange={(e) => setEditovanaEtapa({...editovanaEtapa, farba: e.target.value})}
                        className="w-full px-3 py-2 border-2 border-blue-300 rounded-lg"
                      >
                        <option value="nic">Bez farby</option>
                        <option value="praskova">Prášková farba</option>
                        <option value="mokry-vrch">Mokrý vrch</option>
                      </select>
                    </div>
                  </div>
                  {editovanaEtapa.farba !== 'nic' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Odtieň farby</label>
                      <input
                        type="text"
                        value={editovanaEtapa.farbaTon || ''}
                        onChange={(e) => setEditovanaEtapa({...editovanaEtapa, farbaTon: e.target.value})}
                        className="w-full px-3 py-2 border-2 border-blue-300 rounded-lg"
                        placeholder="napr. RAL 7016"
                      />
                    </div>
                  )}
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-700 mb-3">Dátumy povrchovej úpravy</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Od</label>
                        <input
                          type="date"
                          value={editovanaEtapa.datumPovrchovejUpravyOd || ''}
                          onChange={(e) => setEditovanaEtapa({...editovanaEtapa, datumPovrchovejUpravyOd: e.target.value})}
                          className="w-full px-3 py-2 border-2 border-blue-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Do</label>
                        <input
                          type="date"
                          value={editovanaEtapa.datumPovrchovejUpravyDo || ''}
                          onChange={(e) => setEditovanaEtapa({...editovanaEtapa, datumPovrchovejUpravyDo: e.target.value})}
                          className="w-full px-3 py-2 border-2 border-blue-300 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VÝROBA A MONTÁŽ - len pri editácii */}
          {editujemEtapu && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">🔧 Výroba</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Od</label>
                      <input
                        type="date"
                        value={editovanaEtapa.datumVyrobyOd || ''}
                        onChange={(e) => setEditovanaEtapa({...editovanaEtapa, datumVyrobyOd: e.target.value})}
                        className="w-full px-3 py-2 border-2 border-blue-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Do</label>
                      <input
                        type="date"
                        value={editovanaEtapa.datumVyrobyDo || ''}
                        onChange={(e) => setEditovanaEtapa({...editovanaEtapa, datumVyrobyDo: e.target.value})}
                        className="w-full px-3 py-2 border-2 border-blue-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">🚚 Montáž</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Od</label>
                      <input
                        type="date"
                        value={editovanaEtapa.datumMontazeOd || ''}
                        onChange={(e) => setEditovanaEtapa({...editovanaEtapa, datumMontazeOd: e.target.value})}
                        className="w-full px-3 py-2 border-2 border-blue-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Do</label>
                      <input
                        type="date"
                        value={editovanaEtapa.datumMontazeDo || ''}
                        onChange={(e) => setEditovanaEtapa({...editovanaEtapa, datumMontazeDo: e.target.value})}
                        className="w-full px-3 py-2 border-2 border-blue-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* KALENDÁR */}
          {kalendar && kalendar.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">📅 Kalendárový harmonogram</h3>
              
              <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                <div className="flex gap-4 text-sm flex-wrap">
                  {dniVyroba > 0 && (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-400 rounded"></div>
                      🔧 Výroba ({dniVyroba}d)
                    </span>
                  )}
                  {dniPovrch > 0 && (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-purple-400 rounded"></div>
                      🎨 Povrch ({dniPovrch}d)
                    </span>
                  )}
                  {dniMontaz > 0 && (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-400 rounded"></div>
                      🚚 Montáž ({dniMontaz}d)
                    </span>
                  )}
                  {aktualnaEtapa.datumUkoncenia && (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-600 rounded"></div>
                      🏁 Deadline
                    </span>
                  )}
                </div>
              </div>

              {kalendar.map((mesiac, idx) => (
                <div key={idx} className="mb-6 last:mb-0">
                  <h4 className="font-semibold text-gray-800 mb-3 capitalize text-lg">{mesiac.nazov}</h4>
                  
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['Po', 'Ut', 'St', 'Št', 'Pi', 'So', 'Ne'].map(den => (
                      <div key={den} className="text-center text-sm font-semibold text-gray-600 py-2">
                        {den}
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-7 gap-1">
                    {mesiac.dni.map((denData, denIdx) => {
                      if (!denData) {
                        return <div key={`empty-${denIdx}`} className="aspect-square"></div>;
                      }
                      
                      const { den, farba, label, jeVikend, jeUkoncenie } = denData;
                      
                      return (
                        <div
                          key={denIdx}
                          className={`
                            aspect-square flex items-center justify-center text-sm font-medium rounded relative
                            ${jeUkoncenie ? 'ring-4 ring-red-600 ring-inset' : ''}
                            ${farba ? `${farba} text-white` : jeVikend ? 'bg-gray-200 text-gray-500' : 'bg-white border border-gray-200 text-gray-800'}
                            ${farba ? 'shadow' : ''}
                          `}
                          title={jeUkoncenie ? `${label || 'Deadline'} - Ukončenie etapy` : label}
                        >
                          {den}
                          {jeUkoncenie && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full"></div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* POPIS */}
          {(aktualnaEtapa.popis || editujemEtapu) && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">📝 Popis</h3>
              {!editujemEtapu ? (
                <p className="text-gray-700 whitespace-pre-wrap">{aktualnaEtapa.popis}</p>
              ) : (
                <textarea
                  value={editovanaEtapa.popis || ''}
                  onChange={(e) => setEditovanaEtapa({...editovanaEtapa, popis: e.target.value})}
                  className="w-full px-3 py-2 border-2 border-blue-300 rounded-lg text-gray-700"
                  rows="4"
                  placeholder="Popis etapy..."
                />
              )}
            </div>
          )}

          {/* DIELCE */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Wrench size={20} />
                Dielce ({aktualnaEtapa.dielce?.length || 0})
              </h3>
              <div className="flex gap-2">
                <label className="flex items-center gap-1 text-sm bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 cursor-pointer">
                  <Upload size={14} />
                  Excel
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      
                      setImportStatus('⏳ Načítavam dielce...');
                      setShowImportStatus(true);
                      
                      try {
                        const XLSX = await import('https://cdn.sheetjs.com/xlsx-latest/package/xlsx.mjs');
                        
                        const data = await file.arrayBuffer();
                        const workbook = XLSX.read(data, { type: 'array' });
                        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: '' });
                        
                        const dielceData = jsonData.slice(4).filter(row => row[0] && row[0].toString().trim() !== '')
                          .map((row, index) => ({
                            id: Date.now() + index,
                            nazov: row[0]?.toString() || '',
                            hmotnostJednehoKs: parseFloat(row[1]) || 0,
                            mnozstvo: parseFloat(row[2]) || 0,
                            jednotka: 'ks'
                          }));
                        
                        const novyZoznam = zakazky.map(z => {
                          if (z.id === aktualnaZakazka.id) {
                            const noveEtapy = z.etapy.map(e => {
                              if (e.id === aktualnaEtapa.id) {
                                return { ...e, dielce: [...(e.dielce || []), ...dielceData] };
                              }
                              return e;
                            });
                            return { ...z, etapy: noveEtapy };
                          }
                          return z;
                        });
                        
                        setZakazky(novyZoznam);
                        setAktualnaEtapa(novyZoznam.find(z => z.id === aktualnaZakazka.id)?.etapy.find(e => e.id === aktualnaEtapa.id));
                        setImportStatus(`✅ ${dielceData.length} dielcov!`);
                        setTimeout(() => setShowImportStatus(false), 3000);
                      } catch (error) {
                        setImportStatus(`❌ ${error.message}`);
                      }
                      e.target.value = '';
                    }}
                    style={{ display: 'none' }}
                  />
                </label>
                <button
                  onClick={() => setZobrazenie('novy-dielec')}
                  className="text-sm bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700"
                >
                  + Manuálne
                </button>
              </div>
            </div>
            
            {!aktualnaEtapa.dielce || aktualnaEtapa.dielce.length === 0 ? (
              <p className="text-sm text-gray-400 italic text-center py-8">Žiadne dielce</p>
            ) : (
              <div className="overflow-x-auto">
                <div className="bg-gray-50 rounded overflow-hidden min-w-full">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-200">
                      <tr>
                        <th className="text-left py-3 px-4">Názov</th>
                        <th className="text-right py-3 px-4">Hmot. ks</th>
                        <th className="text-right py-3 px-4">Množstvo</th>
                        <th className="text-right py-3 px-4">Celkom</th>
                        <th className="text-center py-3 px-4 w-24">Akcie</th>
                      </tr>
                    </thead>
                    <tbody>
                      {aktualnaEtapa.dielce.map(d => (
                        <tr key={d.id} className="border-t border-gray-200">
                          {editujemDielec && editovanyDielec?.id === d.id ? (
                            <>
                              <td className="py-3 px-4">
                                <input
                                  type="text"
                                  value={editovanyDielec.nazov}
                                  onChange={(e) => setEditovanyDielec({...editovanyDielec, nazov: e.target.value})}
                                  className="w-full px-2 py-1 border border-blue-300 rounded"
                                />
                              </td>
                              <td className="py-3 px-4">
                                <input
                                  type="number"
                                  step="0.01"
                                  value={editovanyDielec.hmotnostJednehoKs || ''}
                                  onChange={(e) => setEditovanyDielec({...editovanyDielec, hmotnostJednehoKs: parseFloat(e.target.value) || 0})}
                                  className="w-full px-2 py-1 border border-blue-300 rounded text-right"
                                />
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex gap-1">
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={editovanyDielec.mnozstvo}
                                    onChange={(e) => setEditovanyDielec({...editovanyDielec, mnozstvo: e.target.value})}
                                    className="flex-1 px-2 py-1 border border-blue-300 rounded text-right"
                                  />
                                  <select
                                    value={editovanyDielec.jednotka}
                                    onChange={(e) => setEditovanyDielec({...editovanyDielec, jednotka: e.target.value})}
                                    className="px-2 py-1 border border-blue-300 rounded text-sm"
                                  >
                                    <option value="ks">ks</option>
                                    <option value="m">m</option>
                                    <option value="kg">kg</option>
                                  </select>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-right font-semibold">
                                {editovanyDielec.hmotnostJednehoKs ? `${(editovanyDielec.hmotnostJednehoKs * parseFloat(editovanyDielec.mnozstvo || 0)).toFixed(2)} kg` : '-'}
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex gap-1 justify-center">
                                  <button
                                    onClick={ulozitUpravuDielca}
                                    className="p-1 bg-green-600 text-white rounded hover:bg-green-700"
                                    title="Uložiť"
                                  >
                                    <span className="text-xs">✓</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditujemDielec(false);
                                      setEditovanyDielec(null);
                                    }}
                                    className="p-1 bg-gray-400 text-white rounded hover:bg-gray-500"
                                    title="Zrušiť"
                                  >
                                    <X size={12} />
                                  </button>
                                </div>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="py-3 px-4">{d.nazov}</td>
                              <td className="py-3 px-4 text-right">
                                {d.hmotnostJednehoKs ? `${d.hmotnostJednehoKs} kg` : '-'}
                              </td>
                              <td className="py-3 px-4 text-right font-medium">{d.mnozstvo} {d.jednotka}</td>
                              <td className="py-3 px-4 text-right font-semibold">
                                {d.hmotnostJednehoKs ? `${(d.hmotnostJednehoKs * d.mnozstvo).toFixed(2)} kg` : '-'}
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex gap-1 justify-center">
                                  <button
                                    onClick={() => {
                                      setEditovanyDielec({...d});
                                      setEditujemDielec(true);
                                    }}
                                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                    title="Upraviť"
                                  >
                                    <Pencil size={14} />
                                  </button>
                                  <button
                                    onClick={() => vymazatDielec(d.id)}
                                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                                    title="Vymazať"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                      <tr className="bg-gray-100 font-bold">
                        <td colSpan="3" className="py-3 px-4 text-right">CELKOVÁ HMOTNOSŤ:</td>
                        <td className="py-3 px-4 text-right text-lg">
                          {aktualnaEtapa.dielce.reduce((sum, d) => sum + (d.hmotnostJednehoKs ? d.hmotnostJednehoKs * d.mnozstvo : 0), 0).toFixed(2)} kg
                        </td>
                        <td></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // NOVÝ DIELEC
  if (zobrazenie === 'novy-dielec') {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Nový dielec</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Názov dielca *</label>
                <input
                  type="text"
                  value={novyDielec.nazov}
                  onChange={(e) => setNovyDielec({...novyDielec, nazov: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="napr. Profil 40x40x2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Množstvo *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={novyDielec.mnozstvo}
                    onChange={(e) => setNovyDielec({...novyDielec, mnozstvo: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Jednotka</label>
                  <select
                    value={novyDielec.jednotka}
                    onChange={(e) => setNovyDielec({...novyDielec, jednotka: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="m">m</option>
                    <option value="ks">ks</option>
                    <option value="kg">kg</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => pridatDielec(aktualnaZakazka.id, aktualnaEtapa.id)}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
              >
                Pridať dielec
              </button>
              <button
                onClick={() => {
                  setNovyDielec({ nazov: '', mnozstvo: '', jednotka: 'm', poznamka: '' });
                  setZobrazenie('detail-etapy');
                }}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Zrušiť
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // NOVÁ ETAPA
  if (zobrazenie === 'nova-etapa') {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Nová etapa</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Názov etapy *</label>
                <input
                  type="text"
                  value={novaEtapa.nazov}
                  onChange={(e) => setNovaEtapa({...novaEtapa, nazov: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="napr. Výroba konštrukcie"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hmotnosť podľa výkazu (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={novaEtapa.hmotnostPodlaVykazu}
                    onChange={(e) => setNovaEtapa({...novaEtapa, hmotnostPodlaVykazu: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dátum ukončenia</label>
                  <input
                    type="date"
                    value={novaEtapa.datumUkoncenia}
                    onChange={(e) => setNovaEtapa({...novaEtapa, datumUkoncenia: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">🔧 Výroba</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Od</label>
                    <input
                      type="date"
                      value={novaEtapa.datumVyrobyOd}
                      onChange={(e) => setNovaEtapa({...novaEtapa, datumVyrobyOd: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Do</label>
                    <input
                      type="date"
                      value={novaEtapa.datumVyrobyDo}
                      onChange={(e) => setNovaEtapa({...novaEtapa, datumVyrobyDo: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">🎨 Povrchová úprava</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Zinkovanie</label>
                    <select
                      value={novaEtapa.zinkovanie}
                      onChange={(e) => setNovaEtapa({...novaEtapa, zinkovanie: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="nic">Bez povrchovej úpravy</option>
                      <option value="ziarove">Žiarovo zinkované</option>
                      <option value="galvanicke">Galvanicky zinkované</option>
                      <option value="praskovy-zaklad">Práškový základ</option>
                      <option value="mokry-zaklad">Mokrý základ</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Farba</label>
                    <select
                      value={novaEtapa.farba}
                      onChange={(e) => setNovaEtapa({...novaEtapa, farba: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="nic">Bez farby</option>
                      <option value="praskova">Prášková farba</option>
                      <option value="mokry-vrch">Mokrý vrch</option>
                    </select>
                  </div>

                  {novaEtapa.farba !== 'nic' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Odtieň farby</label>
                      <input
                        type="text"
                        value={novaEtapa.farbaTon}
                        onChange={(e) => setNovaEtapa({...novaEtapa, farbaTon: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder="napr. RAL 7016 Antracit"
                      />
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Od</label>
                      <input
                        type="date"
                        value={novaEtapa.datumPovrchovejUpravyOd}
                        onChange={(e) => setNovaEtapa({...novaEtapa, datumPovrchovejUpravyOd: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Do</label>
                      <input
                        type="date"
                        value={novaEtapa.datumPovrchovejUpravyDo}
                        onChange={(e) => setNovaEtapa({...novaEtapa, datumPovrchovejUpravyDo: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">🚚 Montáž</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Od</label>
                    <input
                      type="date"
                      value={novaEtapa.datumMontazeOd}
                      onChange={(e) => setNovaEtapa({...novaEtapa, datumMontazeOd: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Do</label>
                    <input
                      type="date"
                      value={novaEtapa.datumMontazeDo}
                      onChange={(e) => setNovaEtapa({...novaEtapa, datumMontazeDo: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Popis</label>
                <textarea
                  value={novaEtapa.popis}
                  onChange={(e) => setNovaEtapa({...novaEtapa, popis: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  rows="4"
                  placeholder="Dodatočné poznámky k etape..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => pridatEtapu(aktualnaZakazka.id)}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
              >
                Vytvoriť etapu
              </button>
              <button
                onClick={() => setZobrazenie('detail')}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Zrušiť
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

