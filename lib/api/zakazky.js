import { supabase } from '../supabase';

/**
 * Načíta všetky zákazky s etapami a dielcami
 */
export async function nacitajZakazky() {
  console.log('🟢 API: Načítavam zákazky z Supabase');
  
  try {
    // 1. Načítame zákazky
    const { data: zakazkyData, error: zakazkyError } = await supabase
      .from('zakazky')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (zakazkyError) throw zakazkyError;

    // 2. Pre každú zákazku načítame etapy
    const zakazkySEtapami = await Promise.all(
      (zakazkyData || []).map(async (zakazka) => {
        const { data: etapyData, error: etapyError } = await supabase
          .from('etapy')
          .select('*')
          .eq('zakazka_id', zakazka.id)
          .order('created_at', { ascending: false });
        
        if (etapyError) throw etapyError;

        // 3. Pre každú etapu načítame dielce
        const etapySDielcami = await Promise.all(
          (etapyData || []).map(async (etapa) => {
            const { data: dielceData, error: dielceError } = await supabase
              .from('dielce')
              .select('*')
              .eq('etapa_id', etapa.id)
              .order('created_at', { ascending: false});
            
            if (dielceError) throw dielceError;

            // Mapovanie snake_case → camelCase
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
              datumZaciatku: etapa.datum_zaciatku,
              deadline: etapa.deadline,
              clovekohod: etapa.clovekohod,
              pocetLudi: etapa.pocet_ludi,
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

        // Mapovanie snake_case → camelCase pre zákazku
        return {
          ...zakazka,
          cisloZakazky: zakazka.cislo_zakazky,
          kontaktnaOsoba: zakazka.kontaktna_osoba,
          nazovFirmy: zakazka.nazov_firmy,
          etapy: etapySDielcami
        };
      })
    );

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
      adresa: zakazka.adresa
    }).eq('id', zakazkaId);
    
    if (error) throw error;
    
    console.log('✅ API: Zákazka aktualizovaná');
    return true;
    
  } catch (error) {
    console.error('❌ API: Chyba pri aktualizácii zákazky:', error);
    throw error;
  }
}

/**
 * Zmení stav zákazky
 */
export async function zmenStavZakazky(zakazkaId, novyStav) {
  console.log('🟡 API: Mením stav zákazky', zakazkaId, '→', novyStav);
  
  try {
    const { error } = await supabase
      .from('zakazky')
      .update({ stav: novyStav })
      .eq('id', zakazkaId);
    
    if (error) throw error;
    
    console.log('✅ API: Stav zákazky zmenený');
    return true;
    
  } catch (error) {
    console.error('❌ API: Chyba pri zmene stavu:', error);
    throw error;
  }
}
