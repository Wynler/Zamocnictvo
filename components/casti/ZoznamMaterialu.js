// Súhrn podľa materiálu + profilu + dĺžky, naprieč tyč aj platňami
function SuhrnMaterialu({ vsetkyPolozky }) {
  const skupiny = {};

  for (const p of vsetkyPolozky) {
    const material = p.material || '—';
    const profil = p.profil || '—';
    const dlzka = p.dlzka_mm ?? '—';
    const kluc = `${material}__${profil}__${dlzka}`;

    if (!skupiny[kluc]) {
      skupiny[kluc] = { material, profil, dlzka, pocet: 0, hmotnost: 0 };
    }
    skupiny[kluc].pocet += (p.pocet || 0);
    skupiny[kluc].hmotnost += vypocitajHmotnostCelkovu(p);
  }

  const riadky = Object.values(skupiny).sort((a, b) => {
    const m = a.material.localeCompare(b.material, 'sk');
    if (m !== 0) return m;
    const pr = a.profil.localeCompare(b.profil, 'sk', { numeric: true });
    if (pr !== 0) return pr;
    return (Number(a.dlzka) || 0) - (Number(b.dlzka) || 0);
  });

  const celkovaHmotnost = riadky.reduce((s, r) => s + r.hmotnost, 0);

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '8px 12px',
        borderRadius: 'var(--border-radius-md)',
        marginBottom: '8px',
        background: '#F3E8FF'
      }}>
        <span style={{ fontSize: '14px', fontWeight: 500, color: '#6B21A8' }}>
          Súhrn podľa materiálu, profilu a dĺžky
        </span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '0.5px solid var(--color-border-secondary)' }}>
              {['Materiál', 'Profil', 'Dĺžka (mm)', 'Počet ks', 'Hmot. celk. (kg)'].map((h, i) => (
                <th key={h} style={{
                  textAlign: i >= 2 ? 'right' : 'left',
                  padding: '7px 10px',
                  fontSize: '11px', fontWeight: 500,
                  color: 'var(--color-text-tertiary)',
                  textTransform: 'uppercase', letterSpacing: '0.04em'
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {riadky.map((r, i) => (
              <tr key={i} style={{ borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
                <td style={{ padding: '8px 10px', color: 'var(--color-text-secondary)' }}>{r.material}</td>
                <td style={{ padding: '8px 10px', fontWeight: 500, color: 'var(--color-text-primary)' }}>{r.profil}</td>
                <td style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--color-text-secondary)', fontVariantNumeric: 'tabular-nums' }}>{r.dlzka}</td>
                <td style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--color-text-secondary)', fontVariantNumeric: 'tabular-nums' }}>{Math.round(r.pocet * 100) / 100}</td>
                <td style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--color-text-secondary)', fontVariantNumeric: 'tabular-nums' }}>{Math.round(r.hmotnost * 10) / 10}</td>
              </tr>
            ))}
            <tr style={{ borderTop: '0.5px solid var(--color-border-secondary)', background: 'var(--color-background-secondary)' }}>
              <td colSpan={4} style={{ padding: '8px 10px', textAlign: 'right', fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                Celková hmotnosť (tyč + platne)
              </td>
              <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600, color: 'var(--color-text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                {Math.round(celkovaHmotnost * 10) / 10} kg
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Súhrn len podľa profilu (ignoruje materiál a dĺžku), s bežnými metrami
function SuhrnPodlaProfilu({ vsetkyPolozky }) {
  const skupiny = {};

  for (const p of vsetkyPolozky) {
    const profil = p.profil || '—';
    const dlzkaM = (p.dlzka_mm || 0) / 1000;
    const pocet = p.pocet || 0;

    if (!skupiny[profil]) {
      skupiny[profil] = { profil, pocet: 0, hmotnost: 0, bm: 0 };
    }
    skupiny[profil].pocet += pocet;
    skupiny[profil].hmotnost += vypocitajHmotnostCelkovu(p);
    skupiny[profil].bm += dlzkaM * pocet;
  }

  const riadky = Object.values(skupiny).sort((a, b) =>
    a.profil.localeCompare(b.profil, 'sk', { numeric: true })
  );

  const celkovaHmotnost = riadky.reduce((s, r) => s + r.hmotnost, 0);
  const celkoveBm = riadky.reduce((s, r) => s + r.bm, 0);

  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '8px 12px',
        borderRadius: 'var(--border-radius-md)',
        marginBottom: '8px',
        background: '#EEEDFE'
      }}>
        <span style={{ fontSize: '14px', fontWeight: 500, color: '#3C3489' }}>
          Súhrn podľa profilu
        </span>
        <span style={{
          fontSize: '12px', padding: '2px 8px', borderRadius: '99px',
          background: '#CECBF6',
          color: '#3C3489'
        }}>
          {riadky.length} {riadky.length === 1 ? 'profil' : 'profilov'}
        </span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '0.5px solid var(--color-border-secondary)' }}>
              {['Profil', 'Počet ks', 'Bm', 'Hmot. celk. (kg)'].map((h, i) => (
                <th key={h} style={{
                  textAlign: i >= 1 ? 'right' : 'left',
                  padding: '7px 10px',
                  fontSize: '11px', fontWeight: 500,
                  color: 'var(--color-text-tertiary)',
                  textTransform: 'uppercase', letterSpacing: '0.04em'
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {riadky.map((r, i) => (
              <tr key={i} style={{ borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
                <td style={{ padding: '8px 10px', fontWeight: 500, color: 'var(--color-text-primary)' }}>{r.profil}</td>
                <td style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--color-text-secondary)', fontVariantNumeric: 'tabular-nums' }}>{Math.round(r.pocet * 100) / 100}</td>
                <td style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--color-text-secondary)', fontVariantNumeric: 'tabular-nums' }}>{Math.round(r.bm * 100) / 100}</td>
                <td style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--color-text-secondary)', fontVariantNumeric: 'tabular-nums' }}>{Math.round(r.hmotnost * 10) / 10}</td>
              </tr>
            ))}
            <tr style={{ borderTop: '0.5px solid var(--color-border-secondary)', background: 'var(--color-background-secondary)' }}>
              <td colSpan={2} style={{ padding: '8px 10px', textAlign: 'right', fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                Celkovo
              </td>
              <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600, color: 'var(--color-text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                {Math.round(celkoveBm * 100) / 100} bm
              </td>
              <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600, color: 'var(--color-text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                {Math.round(celkovaHmotnost * 10) / 10} kg
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
