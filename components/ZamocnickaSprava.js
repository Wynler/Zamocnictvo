'use client'

import React, { useState, useEffect } from 'react';

// API imports
import { nacitajZakazky, pridajZakazku, vymazZakazku, aktualizujZakazku, zmenStavZakazky } from '../lib/api/zakazky';
import { pridajEtapu, aktualizujEtapu, zmenStavEtapy } from '../lib/api/etapy';
import { pridajDielec, aktualizujDielec, vymazDielec } from '../lib/api/dielce';

// Component imports
import LoadingScreen from './shared/LoadingScreen';
import ZoznamZakaziek from './zakazky/ZoznamZakaziek';
import NovaZakazka from './zakazky/NovaZakazka';
import DetailZakazky from './zakazky/DetailZakazky';
import NovaEtapa from './etapy/NovaEtapa';
import DetailEtapy from './etapy/DetailEtapy';

export default function ZamocnickaSprava() {
  // STATE
  const [zakazky, setZakazky] = useState([]);
  const [zobrazenie, setZobrazenie] = useState('zoznam');
  const [aktualnaZakazka, setAktualnaZakazka] = useState(null);
  const [aktualnaEtapa, setAktualnaEtapa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterStav, setFilterStav] = useState('vsetky');
  
  // MODALS & CONFIRMATIONS
  const [showInfoZakazky, setShowInfoZakazky] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [zakazkaToDelete, setZakazkaToDelete] = useState(null);
  const [showImportStatus, setShowImportStatus] = useState(false);
  const [importStatus, setImportStatus] = useState('');
  
  // EDIT STATES
  const [editujemZakazku, setEditujemZakazku] = useState(false);
  const [editovanaZakazka, setEditovanaZakazka] = useState(null);
  const [editujemEtapu, setEditujemEtapu] = useState(false);
  const [editovanaEtapa, setEditovanaEtapa] = useState(null);
  const [editujemDielec, setEditujemDielec] = useState(false);
  const [editovanyDielec, setEditovanyDielec] = useState(null);
  
  // FORMS
  const [novaZakazka, setNovaZakazka] = useState({
    nazov: '',  cisloZakazky: '', zakaznik: '', kontaktnaOsoba: '', telefon: '', email: '',
    nazovFirmy: '', ico: '', dic: '', adresa: '', stav: 'priprava'
  });
  
  const [novaEtapa, setNovaEtapa] = useState({
    nazov: '',  cisloZakazky: '', kontaktnaOsoba: '', telefon: '', email: '', hmotnostPodlaVykazu: '',
    datumUkoncenia: '', datumVyrobyOd: '', datumVyrobyDo: '',
    datumPovrchovejUpravyOd: '', datumPovrchovejUpravyDo: '',
    datumMontazeOd: '', datumMontazeDo: '',
    zinkovanie: 'nic', farba: 'nic', farbaTon: '', popis: '', stav: 'planovane'
  });
  
  const [novyDielec, setNovyDielec] = useState({
    nazov: '', mnozstvo: '', jednotka: 'm', poznamka: ''
  });

  // CONSTANTS
  const stavyZakaziek = {
    'priprava': { label: 'Príprava', farba: 'bg-yellow-100 text-yellow-700' },
    'aktivna': { label: 'Aktívna', farba: 'bg-blue-100 text-blue-700' },
    'ukoncena': { label: 'Ukončená', farba: 'bg-green-100 text-green-700' },
    'vymazane': { label: 'Vymazané', farba: 'bg-red-100 text-red-700' }
  };

  const stavyEtap = {
    'planovane': { label: 'Plánované', farba: 'bg-gray-100 text-gray-700' },
    'vyroba': { label: 'Výroba', farba: 'bg-blue-100 text-blue-700' },
    'povrchovaUprava': { label: 'Povrchová úprava', farba: 'bg-purple-100 text-purple-700' },
    'montaz': { label: 'Montáž', farba: 'bg-orange-100 text-orange-700' },
    'dokoncene': { label: 'Dokončené', farba: 'bg-green-100 text-green-700' }
  };

  // INIT - Load data on mount
  useEffect(() => {
    nacitajData();
  }, []);

  // API FUNCTIONS
  const nacitajData = async () => {
    try {
      setLoading(true);
      const data = await nacitajZakazky();
      setZakazky(data);
    } catch (error) {
      console.error('❌ Chyba pri načítaní:', error);
      alert('Chyba pri načítaní dát: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePridatZakazku = async () => {
    if (!novaZakazka.nazov || !novaZakazka.zakaznik) {
      alert('Vyplň povinné polia (Názov a Zákazník)');
      return;
    }
    
    try {
      await pridajZakazku(novaZakazka);
      await nacitajData();
      setZobrazenie('zoznam');
      setNovaZakazka({
        nazov: '', cisloZakazky: '', cisloZakazky: '', zakaznik: '', kontaktnaOsoba: '', telefon: '', email: '',
        nazovFirmy: '', ico: '', dic: '', adresa: '', stav: 'priprava'
      });
    } catch (error) {
      alert('Chyba pri pridávaní zákazky: ' + error.message);
    }
  };

  const handleVymazat = async () => {
    if (!zakazkaToDelete) return;
    
    try {
      await vymazZakazku(zakazkaToDelete.id);
      await nacitajData();
      setShowDeleteConfirm(false);
      setZakazkaToDelete(null);
    } catch (error) {
      alert('Chyba pri vymazávaní: ' + error.message);
    }
  };

  const handleUlozitZakazku = async () => {
    try {
      await aktualizujZakazku(aktualnaZakazka.id, editovanaZakazka);
      await nacitajData();
      const aktualizovanaZakazka = zakazky.find(z => z.id === aktualnaZakazka.id);
      setAktualnaZakazka(aktualizovanaZakazka);
      setEditujemZakazku(false);
      setEditovanaZakazka(null);
    } catch (error) {
      alert('Chyba pri ukladaní: ' + error.message);
    }
  };

  const handleZmenitStavZakazky = async (novyStav) => {
    try {
      await zmenStavZakazky(aktualnaZakazka.id, novyStav);
      await nacitajData();
      const aktualizovanaZakazka = zakazky.find(z => z.id === aktualnaZakazka.id);
      setAktualnaZakazka(aktualizovanaZakazka);
    } catch (error) {
      alert('Chyba pri zmene stavu: ' + error.message);
    }
  };

  const handlePridatEtapu = async () => {
    if (!novaEtapa.nazov) {
      alert('Vyplň názov etapy');
      return;
    }
    
    try {
      await pridajEtapu(aktualnaZakazka.id, novaEtapa);
      await nacitajData();
      const aktualizovanaZakazka = zakazky.find(z => z.id === aktualnaZakazka.id);
      setAktualnaZakazka(aktualizovanaZakazka);
      setZobrazenie('detail');
      setNovaEtapa({
        nazov: '',  cisloZakazky: '',kontaktnaOsoba: '', telefon: '', email: '', hmotnostPodlaVykazu: '',
        datumUkoncenia: '', datumVyrobyOd: '', datumVyrobyDo: '',
        datumPovrchovejUpravyOd: '', datumPovrchovejUpravyDo: '',
        datumMontazeOd: '', datumMontazeDo: '',
        zinkovanie: 'nic', farba: 'nic', farbaTon: '', popis: '', stav: 'planovane'
      });
    } catch (error) {
      alert('Chyba pri pridávaní etapy: ' + error.message);
    }
  };

  const handleUlozitEtapu = async () => {
    try {
      await aktualizujEtapu(aktualnaEtapa.id, editovanaEtapa);
      await nacitajData();
      const aktualizovanaZakazka = zakazky.find(z => z.id === aktualnaZakazka.id);
      const aktualizovanaEtapa = aktualizovanaZakazka.etapy.find(e => e.id === aktualnaEtapa.id);
      setAktualnaZakazka(aktualizovanaZakazka);
      setAktualnaEtapa(aktualizovanaEtapa);
      setEditujemEtapu(false);
      setEditovanaEtapa(null);
    } catch (error) {
      alert('Chyba pri ukladaní etapy: ' + error.message);
    }
  };

  const handleZmenitStavEtapy = async (novyStav) => {
    try {
      await zmenStavEtapy(aktualnaEtapa.id, novyStav);
      await nacitajData();
      const aktualizovanaZakazka = zakazky.find(z => z.id === aktualnaZakazka.id);
      const aktualizovanaEtapa = aktualizovanaZakazka.etapy.find(e => e.id === aktualnaEtapa.id);
      setAktualnaZakazka(aktualizovanaZakazka);
      setAktualnaEtapa(aktualizovanaEtapa);
    } catch (error) {
      alert('Chyba pri zmene stavu etapy: ' + error.message);
    }
  };

  const handlePridatDielec = async () => {
    if (!novyDielec.nazov || !novyDielec.mnozstvo) {
      alert('Vyplň názov a množstvo');
      return;
    }
    
    try {
      await pridajDielec(aktualnaEtapa.id, novyDielec);
      await nacitajData();
      const aktualizovanaZakazka = zakazky.find(z => z.id === aktualnaZakazka.id);
      const aktualizovanaEtapa = aktualizovanaZakazka.etapy.find(e => e.id === aktualnaEtapa.id);
      setAktualnaZakazka(aktualizovanaZakazka);
      setAktualnaEtapa(aktualizovanaEtapa);
      setNovyDielec({ nazov: '', mnozstvo: '', jednotka: 'm', poznamka: '' });
    } catch (error) {
      alert('Chyba pri pridávaní dielca: ' + error.message);
    }
  };

  const handleUlozitDielec = async () => {
    try {
      await aktualizujDielec(editovanyDielec.id, editovanyDielec);
      await nacitajData();
      const aktualizovanaZakazka = zakazky.find(z => z.id === aktualnaZakazka.id);
      const aktualizovanaEtapa = aktualizovanaZakazka.etapy.find(e => e.id === aktualnaEtapa.id);
      setAktualnaZakazka(aktualizovanaZakazka);
      setAktualnaEtapa(aktualizovanaEtapa);
      setEditujemDielec(false);
      setEditovanyDielec(null);
    } catch (error) {
      alert('Chyba pri ukladaní dielca: ' + error.message);
    }
  };

  const handleVymazatDielec = async (dielecId) => {
    if (!confirm('Naozaj vymazať dielec?')) return;
    
    try {
      await vymazDielec(dielecId);
      await nacitajData();
      const aktualizovanaZakazka = zakazky.find(z => z.id === aktualnaZakazka.id);
      const aktualizovanaEtapa = aktualizovanaZakazka.etapy.find(e => e.id === aktualnaEtapa.id);
      setAktualnaZakazka(aktualizovanaZakazka);
      setAktualnaEtapa(aktualizovanaEtapa);
    } catch (error) {
      alert('Chyba pri vymazávaní dielca: ' + error.message);
    }
  };

  const handleImportExcel = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setImportStatus('Načítavam Excel súbor...');
      setShowImportStatus(true);

      const data = await file.arrayBuffer();
      const XLSX = await import('xlsx');

      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: '' });

      let importedCount = 0;
      
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (!row[0]) continue;

        const dielec = {
          nazov: String(row[0] || ''),
          hmotnostJednehoKs: row[1] ? parseFloat(row[1]) : null,
          mnozstvo: parseFloat(row[2] || 0),
          jednotka: String(row[3] || 'm'),
          poznamka: String(row[4] || '')
        };

        await pridajDielec(aktualnaEtapa.id, dielec);
        importedCount++;
      }

      setImportStatus(`✓ Importované ${importedCount} dielcov`);
      await nacitajData();
      const aktualizovanaZakazka = zakazky.find(z => z.id === aktualnaZakazka.id);
      const aktualizovanaEtapa = aktualizovanaZakazka.etapy.find(e => e.id === aktualnaEtapa.id);
      setAktualnaZakazka(aktualizovanaZakazka);
      setAktualnaEtapa(aktualizovanaEtapa);

      setTimeout(() => setShowImportStatus(false), 3000);
    } catch (error) {
      setImportStatus('❌ Chyba pri importe: ' + error.message);
      setTimeout(() => setShowImportStatus(false), 5000);
    }

    event.target.value = '';
  };

  // HELPER FUNCTIONS
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
    const udalosti = [];
    
    if (etapa.datumVyrobyOd && etapa.datumVyrobyDo) {
      udalosti.push({
        datum: etapa.datumVyrobyOd,
        typ: 'vyroba',
        popis: `Začiatok výroby`
      });
      udalosti.push({
        datum: etapa.datumVyrobyDo,
        typ: 'vyroba',
        popis: `Koniec výroby`
      });
    }
    
    if (etapa.datumPovrchovejUpravyOd && etapa.datumPovrchovejUpravyDo) {
      udalosti.push({
        datum: etapa.datumPovrchovejUpravyOd,
        typ: 'povrch',
        popis: `Začiatok povrchovej úpravy`
      });
      udalosti.push({
        datum: etapa.datumPovrchovejUpravyDo,
        typ: 'povrch',
        popis: `Koniec povrchovej úpravy`
      });
    }
    
    if (etapa.datumMontazeOd && etapa.datumMontazeDo) {
      udalosti.push({
        datum: etapa.datumMontazeOd,
        typ: 'montaz',
        popis: `Začiatok montáže`
      });
      udalosti.push({
        datum: etapa.datumMontazeDo,
        typ: 'montaz',
        popis: `Koniec montáže`
      });
    }
    
    return udalosti.sort((a, b) => new Date(a.datum) - new Date(b.datum));
  };

  // LOADING
  if (loading) {
    return <LoadingScreen />;
  }

  // ROUTING - which component to show
  if (zobrazenie === 'zoznam') {
    return (
      <ZoznamZakaziek
        zakazky={zakazky}
        filterStav={filterStav}
        setFilterStav={setFilterStav}
        onNovaZakazka={() => setZobrazenie('nova')}
        onDetailZakazky={(zakazka) => {
          setAktualnaZakazka(zakazka);
          setZobrazenie('detail');
        }}
        onVymazatZakazku={(zakazka) => {
          setZakazkaToDelete(zakazka);
          setShowDeleteConfirm(true);
        }}
        showDeleteConfirm={showDeleteConfirm}
        setShowDeleteConfirm={setShowDeleteConfirm}
        zakazkaToDelete={zakazkaToDelete}
        setZakazkaToDelete={setZakazkaToDelete}
        handleVymazat={handleVymazat}
      />
    );
  }

  if (zobrazenie === 'nova') {
    return (
      <NovaZakazka
        novaZakazka={novaZakazka}
        setNovaZakazka={setNovaZakazka}
        onPridat={handlePridatZakazku}
        onZrusit={() => setZobrazenie('zoznam')}
      />
    );
  }

  if (zobrazenie === 'detail' && aktualnaZakazka) {
    return (
      <DetailZakazky
        zakazka={aktualnaZakazka}
        stavyZakaziek={stavyZakaziek}
        stavyEtap={stavyEtap}
        showInfoZakazky={showInfoZakazky}
        setShowInfoZakazky={setShowInfoZakazky}
        editujemZakazku={editujemZakazku}
        editovanaZakazka={editovanaZakazka}
        setEditovanaZakazka={setEditovanaZakazka}
        onSpat={() => setZobrazenie('zoznam')}
        onNovaEtapa={() => {
          setNovaEtapa({
            ...novaEtapa,
            kontaktnaOsoba: aktualnaZakazka.kontaktnaOsoba || '',
            telefon: aktualnaZakazka.telefon || '',
            email: aktualnaZakazka.email || ''
          });
          setZobrazenie('nova-etapa');
        }}
        onDetailEtapy={(etapa) => {
          setAktualnaEtapa(etapa);
          setZobrazenie('detail-etapy');
        }}
        onZacatEditovatZakazku={() => {
          setEditovanaZakazka({...aktualnaZakazka});
          setEditujemZakazku(true);
        }}
        onUlozitZakazku={handleUlozitZakazku}
        onZrusitEditaciu={() => {
          setEditujemZakazku(false);
          setEditovanaZakazka(null);
        }}
        onZmenitStavZakazky={handleZmenitStavZakazky}
      />
    );
  }

  if (zobrazenie === 'nova-etapa' && aktualnaZakazka) {
    return (
      <NovaEtapa
        aktualnaZakazka={aktualnaZakazka}
        novaEtapa={novaEtapa}
        setNovaEtapa={setNovaEtapa}
        onPridat={handlePridatEtapu}
        onZrusit={() => setZobrazenie('detail')}
      />
    );
  }

  if (zobrazenie === 'detail-etapy' && aktualnaEtapa) {
    return (
      <DetailEtapy
        aktualnaZakazka={aktualnaZakazka}
        aktualnaEtapa={aktualnaEtapa}
        stavyEtap={stavyEtap}
        editujemEtapu={editujemEtapu}
        editovanaEtapa={editovanaEtapa}
        setEditovanaEtapa={setEditovanaEtapa}
        novyDielec={novyDielec}
        setNovyDielec={setNovyDielec}
        editujemDielec={editujemDielec}
        editovanyDielec={editovanyDielec}
        setEditovanyDielec={setEditovanyDielec}
        importStatus={importStatus}
        showImportStatus={showImportStatus}
        setShowImportStatus={setShowImportStatus}
        onSpat={() => setZobrazenie('detail')}
        onZacatEditovatEtapu={() => {
          setEditovanaEtapa({...aktualnaEtapa});
          setEditujemEtapu(true);
        }}
        onUlozitEtapu={handleUlozitEtapu}
        onZrusitEditaciuEtapy={() => {
          setEditujemEtapu(false);
          setEditovanaEtapa(null);
        }}
        onZmenitStavEtapy={handleZmenitStavEtapy}
        onPridatDielec={handlePridatDielec}
        onVymazatDielec={handleVymazatDielec}
        onZacatEditovatDielec={(dielec) => {
          setEditovanyDielec({...dielec});
          setEditujemDielec(true);
        }}
        onUlozitDielec={handleUlozitDielec}
        onZrusitEditaciuDielca={() => {
          setEditujemDielec(false);
          setEditovanyDielec(null);
        }}
        onImportExcel={handleImportExcel}
        vypocitajPracovneDni={vypocitajPracovneDni}
        generateKalendar={generateKalendar}
      />
    );
  }

  return null;
}
