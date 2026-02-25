import { supabase } from '../supabase';

/**
 * Pridá nový dielec k etape
 */
export async function pridajDielec(etapaId, dielec) {
  console.log('🟡 API: Pridávam dielec k etape', etapaId);
  
  try {
    const { error } = await supabase.from('dielce').insert([{
      etapa_id: etapaId,
      nazov: dielec.nazov,
      hmotnost_jedneho_ks: dielec.hmotnostJednehoKs || null,
      mnozstvo: parseFloat(dielec.mnozstvo),
      jednotka: dielec.jednotka,
      poznamka: dielec.poznamka
    }]);
    
    if (error) throw error;
    
    console.log('✅ API: Dielec pridaný');
    return true;
    
  } catch (error) {
    console.error('❌ API: Chyba pri pridávaní dielca:', error);
    throw error;
  }
}

/**
 * Aktualizuje dielec
 */
export async function aktualizujDielec(dielecId, dielec) {
  console.log('🟡 API: Aktualizujem dielec', dielecId);
  
  try {
    const { error } = await supabase.from('dielce').update({
      nazov: dielec.nazov,
      hmotnost_jedneho_ks: dielec.hmotnostJednehoKs || null,
      mnozstvo: parseFloat(dielec.mnozstvo),
      jednotka: dielec.jednotka,
      poznamka: dielec.poznamka
    }).eq('id', dielecId);
    
    if (error) throw error;
    
    console.log('✅ API: Dielec aktualizovaný');
    return true;
    
  } catch (error) {
    console.error('❌ API: Chyba pri aktualizácii dielca:', error);
    throw error;
  }
}

/**
 * Vymaže dielec
 */
export async function vymazDielec(dielecId) {
  console.log('🟡 API: Mažem dielec', dielecId);
  
  try {
    const { error } = await supabase
      .from('dielce')
      .delete()
      .eq('id', dielecId);
    
    if (error) throw error;
    
    console.log('✅ API: Dielec vymazaný');
    return true;
    
  } catch (error) {
    console.error('❌ API: Chyba pri vymazávaní dielca:', error);
    throw error;
  }
}
