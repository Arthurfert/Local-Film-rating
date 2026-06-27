'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface StreamProviderConfig {
  name: string;
  type: 'embed' | 'direct';
  movieUrlPattern: string;
  tvUrlPattern: string;
}

interface ConfigForm {
  tmdbApiKey: string;
  tmdbApiReadAccessToken: string;
  streamProvider: string;
  streamMovieUrlPattern: string;
  streamTvUrlPattern: string;
  streamProviders: StreamProviderConfig[];
}

export default function SettingsPage() {
  const router = useRouter();
  const [config, setConfig] = useState<ConfigForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetch('/api/auth/check')
      .then((r) => r.json())
      .then(async (data) => {
        if (!data.authenticated) {
          await fetch('/api/auth/auto-login', { method: 'POST' });
        }
        fetch('/api/config')
          .then((r) => r.json())
          .then((c) => setConfig({ ...c, streamProviders: c.streamProviders || [] }))
          .catch(() => setMessage({ type: 'error', text: 'Impossible de charger la configuration' }));
      })
      .catch(() => {
        fetch('/api/config')
          .then((r) => r.json())
          .then((c) => setConfig({ ...c, streamProviders: c.streamProviders || [] }))
          .catch(() => setMessage({ type: 'error', text: 'Impossible de charger la configuration' }));
      });
  }, [router]);

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

  function addProvider() {
    if (!config) return;
    setConfig({
      ...config,
      streamProviders: [
        ...config.streamProviders,
        { name: '', type: 'embed', movieUrlPattern: '', tvUrlPattern: '' },
      ],
    });
  }

  function removeProvider(idx: number) {
    if (!config) return;
    setConfig({
      ...config,
      streamProviders: config.streamProviders.filter((_, i) => i !== idx),
    });
  }

  function updateProvider(idx: number, field: keyof StreamProviderConfig, value: string) {
    if (!config) return;
    const updated = [...config.streamProviders];
    updated[idx] = { ...updated[idx], [field]: value };
    setConfig({ ...config, streamProviders: updated });
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
          Configurez vos clés API et vos sources de streaming
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
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white/80">Sources de streaming</h2>
              <p className="text-sm text-white/40 mt-1">
                Ajoutez un ou plusieurs fournisseurs. Vous pourrez basculer entre eux sur la page de lecture.
              </p>
            </div>
            <button
              type="button"
              onClick={addProvider}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white/80 hover:text-white text-sm font-medium transition-all duration-200"
            >
              + Ajouter
            </button>
          </div>

          {config.streamProviders.length === 0 && (
            <div className="text-center py-8 text-white/30 text-sm">
              Aucun fournisseur configuré. Cliquez sur &quot;+ Ajouter&quot; pour en créer un.
            </div>
          )}

          {config.streamProviders.map((p, idx) => (
            <div key={idx} className="border border-white/10 rounded-xl p-4 space-y-4 relative">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-white/40 uppercase tracking-wide">
                  Fournisseur #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeProvider(idx)}
                  className="text-red-400 hover:text-red-300 text-xs font-medium transition-colors"
                >
                  Supprimer
                </button>
              </div>

              <Field
                label="Nom"
                value={p.name}
                onChange={(v) => updateProvider(idx, 'name', v)}
                placeholder="Choississez un nom pour ce fournisseur"
              />

              <SelectField
                label="Type"
                value={p.type}
                onChange={(v) => updateProvider(idx, 'type', v)}
                options={[
                  { value: 'embed', label: 'Embed (iframe)' },
                  { value: 'direct', label: 'Direct (URL directe)' },
                ]}
              />

              <Field
                label="Pattern URL Films"
                value={p.movieUrlPattern}
                onChange={(v) => updateProvider(idx, 'movieUrlPattern', v)}
                placeholder="ex: https://provider/movie/{id}"
                hint="Utilisez {'{id}'} pour l'ID du film"
              />

              <Field
                label="Pattern URL Séries"
                value={p.tvUrlPattern}
                onChange={(v) => updateProvider(idx, 'tvUrlPattern', v)}
                placeholder="ex: https://provider/tv/{id}/{season}/{ep}"
                hint="Utilisez {'{id}'}, {'{season}'}, {'{ep}'}"
              />
            </div>
          ))}
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
