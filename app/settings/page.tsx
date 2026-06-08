'use client';

import { useEffect, useState } from 'react';

interface ConfigForm {
  tmdbApiKey: string;
  tmdbApiReadAccessToken: string;
  streamProvider: string;
  streamMovieUrlPattern: string;
  streamTvUrlPattern: string;
}

export default function SettingsPage() {
  const [config, setConfig] = useState<ConfigForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetch('/api/config')
      .then((r) => r.json())
      .then(setConfig)
      .catch(() => setMessage({ type: 'error', text: 'Impossible de charger la configuration' }));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!config) return;
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur lors de la sauvegarde');
      }

      setMessage({ type: 'success', text: 'Configuration sauvegardée' });
    } catch (err) {
      setMessage({ type: 'error', text: (err as Error).message });
    } finally {
      setSaving(false);
    }
  }

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-white/40 animate-spin" />
          <div className="text-white/40 text-sm">Chargement...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-16 px-4 sm:px-8 max-w-2xl mx-auto relative">
      {/* Effets de lueur d'ambiance en arrière-plan */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[700px] pointer-events-none -z-10 select-none">
        <div className="absolute top-[5%] left-[10%] w-[40%] h-[50%] rounded-full bg-red-500/20 blur-[120px] opacity-80" />
        <div className="absolute top-[10%] right-[10%] w-[35%] h-[50%] rounded-full bg-amber-500/20 blur-[120px] opacity-80" />
        <div className="absolute top-[-5%] left-[35%] w-[30%] h-[45%] rounded-full bg-purple-600/20 blur-[100px] opacity-60" />
      </div>

      <div className="text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-3">
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-300">
            Paramètres
          </span>
        </h1>
        <p className="text-gray-400 text-base max-w-lg mx-auto">
          Configurez vos clés API et votre source de streaming
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        <section className="glass rounded-2xl p-6 space-y-5 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-red-500/5 blur-[60px]" />
          <h2 className="text-lg font-semibold text-white/80">API TMDB</h2>
          <p className="text-sm text-white/40 -mt-3">
            Obligatoire pour rechercher des films et séries. 
            Obtenez vos clés sur{' '}
            <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noopener noreferrer"
               className="text-blue-400 hover:text-blue-300 underline">
              themoviedb.org
            </a>
          </p>

          <Field
            label="Clé API (API Key)"
            value={config.tmdbApiKey}
            onChange={(v) => setConfig({ ...config, tmdbApiKey: v })}
            placeholder="Entrez votre clé API TMDB"
          />

          <Field
            label="Jeton d'accès (Read Access Token)"
            value={config.tmdbApiReadAccessToken}
            onChange={(v) => setConfig({ ...config, tmdbApiReadAccessToken: v })}
            placeholder="Entrez votre jeton d'accès TMDB"
          />
        </section>

        <section className="glass rounded-2xl p-6 space-y-5 relative overflow-hidden">
          <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-amber-500/5 blur-[60px]" />
          <h2 className="text-lg font-semibold text-white/80">Streaming</h2>
          <p className="text-sm text-white/40 -mt-3">
            Configurez la source de streaming. Laissez vide pour désactiver.
          </p>

          <SelectField
            label="Fournisseur"
            value={config.streamProvider}
            onChange={(v) => setConfig({ ...config, streamProvider: v })}
            options={[
              { value: 'embed', label: 'Embed (iframe)' },
              { value: 'direct', label: 'Direct (URL directe)' },
            ]}
          />

          <Field
            label="Pattern URL Films"
            value={config.streamMovieUrlPattern}
            onChange={(v) => setConfig({ ...config, streamMovieUrlPattern: v })}
            placeholder="ex: https://provider/movie/{id}"
            hint="Utilisez {'{id}'} pour l'ID du film"
          />

          <Field
            label="Pattern URL Séries"
            value={config.streamTvUrlPattern}
            onChange={(v) => setConfig({ ...config, streamTvUrlPattern: v })}
            placeholder="ex: https://provider/tv/{id}/{season}/{ep}"
            hint="Utilisez {'{id}'}, {'{season}'}, {'{ep}'}"
          />
        </section>

        {message && (
          <div className={`px-4 py-3 rounded-xl text-sm ${
            message.type === 'success'
              ? 'bg-green-500/10 text-green-400 border border-green-500/20'
              : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}>
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 px-6 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 
                     text-white font-medium transition-all duration-200 disabled:opacity-40 
                     disabled:cursor-not-allowed"
        >
          {saving ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm text-white/60 mb-1.5 block">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 
                   text-white placeholder-white/20 outline-none 
                   focus:border-white/30 focus:bg-white/[0.07] transition-all"
      />
      {hint && <span className="text-xs text-white/30 mt-1 block">{hint}</span>}
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="text-sm text-white/60 mb-1.5 block">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 
                   text-white outline-none cursor-pointer
                   focus:border-white/30 focus:bg-white/[0.07] transition-all"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-gray-900">
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
