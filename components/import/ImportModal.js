'use client'
import { useState } from 'react';
import { Upload, X, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';
import { importujVykazDielcov, importujKusovnik } from '../../lib/api/import';

export default function ImportModal({ etapaId, onClose, onSuccess }) {
  const [typ, setTyp] = useState(null);
  const [file, setFile] = useState(null);
  const [stav, setStav] = useState('idle');
  const [sprava, setSprava] = useState('');

  const handleImport = async () => {
    if (!file || !typ) return;
    setStav('loading');

    try {
      if (typ === 'dielce') {
        const pocet = await importujVykazDielcov(file, etapaId);
        setSprava(`Úspešne importovaných ${pocet} dielcov`);
      } else {
        const { celkomDielcov, celkomPoloziek } = await importujKusovnik(file, etapaId);
        setSprava(`Importovaných ${celkomDielcov} dielcov a ${celkomPoloziek} materiálových položiek`);
      }
      setStav('success');
      setTimeout(() => { onSuccess(); onClose(); }, 1500);
    } catch (err) {
      setStav('error');
      setSprava('Chyba pri importe: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Import z Excelu</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>

        {/* Výber typu */}
        <p className="text-sm text-gray-600 mb-3">Vyber typ súboru:</p>
        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            { key: 'dielce', label: 'Výkaz dielcov', popis: 'Plochý zoznam dielcov' },
            { key: 'kusovnik', label: 'Kusovník', popis: 'Dielce + materiálové položky' },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTyp(t.key)}
              className={`p-3 rounded-lg border-2 text-left transition-all ${
                typ === t.key
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <FileSpreadsheet size={20} className={typ === t.key ? 'text-blue-600' : 'text-gray-400'} />
              <p className="font-medium text-sm mt-1">{t.label}</p>
              <p className="text-xs text-gray-500">{t.popis}</p>
            </button>
          ))}
        </div>

        {/* Upload */}
        <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
          file ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-gray-400 bg-gray-50'
        }`}>
          <input
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={e => setFile(e.target.files[0])}
          />
          {file ? (
            <>
              <CheckCircle size={24} className="text-green-500 mb-1" />
              <p className="text-sm font-medium text-green-700">{file.name}</p>
            </>
          ) : (
            <>
              <Upload size={24} className="text-gray-400 mb-1" />
              <p className="text-sm text-gray-500">Klikni alebo pretiahni .xlsx súbor</p>
            </>
          )}
        </label>

        {/* Stav */}
        {stav === 'success' && (
          <div className="mt-4 flex items-center gap-2 text-green-700 bg-green-50 rounded-lg p-3">
            <CheckCircle size={18} />
            <span className="text-sm">{sprava}</span>
          </div>
        )}
        {stav === 'error' && (
          <div className="mt-4 flex items-center gap-2 text-red-700 bg-red-50 rounded-lg p-3">
            <AlertCircle size={18} />
            <span className="text-sm">{sprava}</span>
          </div>
        )}

        {/* Tlačidlá */}
        <div className="flex gap-3 mt-5">
          <button
            onClick={onClose}
            className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Zrušiť
          </button>
          <button
            onClick={handleImport}
            disabled={!file || !typ || stav === 'loading'}
            className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {stav === 'loading' ? 'Importujem...' : 'Importovať'}
          </button>
        </div>

      </div>
    </div>
  );
}
