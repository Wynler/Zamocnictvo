import { supabase } from '../supabase';

/**
 * Načíta všetky zákazky s etapami a dielcami
 */
export async function nacitajZakazky() {
  console.log('🟢 API: Načítavam zákazky z Supabase');

  try {
    const { data: zakazkyData, error } = await supabase
      .from('zakazky')
      .select('*, etapy(*, dielce(*))')
      .order('created_at', { ascending: false })
      .order('created_at', { ascending: false, foreignTable: 'etapy' })
      .order('created_at', { ascending: false, foreignTable: 'etapy.dielce' });

    if (error) throw error;

    const zakazkySEtapami = (zakazkyData || []).map((zakazka) => ({
      ...zakazka,
      cisloZakazky: zakazka.cislo_zakazky,
      kontaktnaOsoba: zakazka.kontaktna_osoba,
      nazovFirmy: zakazka.nazov_firmy,
      etapy: (zakazka.etapy || []).map((etapa) => ({
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
        datumZaciatku: etapa.datum_zaciatku,
        deadline: etapa.deadline,
        clovekohod: etapa.clovekohod,
        pocetLudi: etapa.pocet_ludi,
        dielce: (etapa.dielce || []).map(d => ({
          ...d,
          hmotnostJednehoKs: d.hmotnost_jedneho_ks
        })),
        polozky: [],
        spojovaciMaterial: [],
        tyc: [],
        platne: [],
        spotrebny: [],
        subory: []
      }))
    }));

    console.log('✅ API: Načítané', zakazkySEtapami.length, 'zákaziek');
    return zakazkySEtapami;

  } catch (error) {
    console.error('❌ API: Chyba pri načítaní zákaziek:', error);
    throw error;
  }
}

/**
 * Pridá novú zákazku
 */
export async function pridajZakazku(zakazka) {
  console.log('🟡 API: Pridávam zákazku');
  
  try {
    const { error } = await supabase.from('zakazky').insert([{
      nazov: zakazka.nazov,
      cislo_zakazky: zakazka.cisloZakazky,
      zakaznik: zakazka.zakaznik,
      kontaktna_osoba: zakazka.kontaktnaOsoba,
      telefon: zakazka.telefon,
      email: zakazka.email,
      nazov_firmy: zakazka.nazovFirmy,
      ico: zakazka.ico,
      dic: zakazka.dic,
      adresa: zakazka.adresa,
      stav: zakazka.stav
    }]);
    
    if (error) throw error;
    
    console.log('✅ API: Zákazka pridaná');
    return true;
    
  } catch (error) {
    console.error('❌ API: Chyba pri pridávaní zákazky:', error);
    throw error;
  }
}

/**
 * Vymaže zákazku (zmena stavu na 'vymazane')
 */
export async function vymazZakazku(zakazkaId) {
  console.log('🟡 API: Mažem zákazku', zakazkaId);
  
  try {
    const { error } = await supabase
      .from('zakazky')
      .update({ stav: 'vymazane' })
      .eq('id', zakazkaId);
    
    if (error) throw error;
    
    console.log('✅ API: Zákazka vymazaná');
    return true;
    
  } catch (error) {
    console.error('❌ API: Chyba pri vymazávaní zákazky:', error);
    throw error;
  }
}

/**
 * Aktualizuje zákazku
 */
export async function aktualizujZakazku(zakazkaId, zakazka) {
  console.log('🟡 API: Aktualizujem zákazku', zakazkaId);
  
  try {
    const { error } = await supabase.from('zakazky').update({
      nazov: zakazka.nazov,
      cislo_zakazky: zakazka.cisloZakazky,
      zakaznik: zakazka.zakaznik,
      kontaktna_osoba: zakazka.kontaktnaOsoba,
      telefon: zakazka.telefon,
      email: zakazka.email,
      nazov_firmy: zakazka.nazovFirmy,
      ico: zakazka.ico,
      dic: zakazka.dic,
      adresa: zakazka.adresa,
      stav: zakazka.stav
    }).eq('id', zakazkaId);
    
    if (error) throw error;
    
    console.log('✅ API: Zákazka aktualizovaná');
    return true;
    
  } catch (error) {
    console.error('❌ API: Chyba pri aktualizácii zákazky:', error);
    throw error;
  }
}
