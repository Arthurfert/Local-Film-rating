'use client';

import { useEffect, useRef } from 'react';
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';
import type { StreamResponse } from '@/lib/stream';

interface VideoPlayerProps {
  stream: StreamResponse;
  title?: string;
  poster?: string;
}

export default function VideoPlayer({ stream, title, poster }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const plyrRef = useRef<Plyr | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!videoRef.current || stream.embed) return;

    const container = containerRef.current;

    const handleFullscreenChange = () => {
      if (!container) return;
      const fe = document.fullscreenElement ?? (document as any).webkitFullscreenElement;
      const inFullscreen =
        (fe !== null && fe !== undefined && container.contains(fe)) ||
        container.classList.contains('plyr--fullscreen-fallback');
      container.classList.toggle('rounded-2xl', !inFullscreen);
      container.classList.toggle('overflow-hidden', !inFullscreen);
    };

    const player = new Plyr(videoRef.current, {
      controls: [
        'play-large',
        'play',
        'progress',
        'current-time',
        'mute',
        'volume',
        'captions',
        'settings',
        'pip',
        'fullscreen',
      ],
      settings: ['captions', 'quality', 'speed'],
      autoplay: false,
      fullscreen: { container: '.plyr-container' },
    });
    plyrRef.current = player;

    player.on('enterfullscreen', handleFullscreenChange);
    player.on('exitfullscreen', handleFullscreenChange);

    return () => {
      player.destroy();
    };
  }, [stream.embed]);

    if (stream.embed) {
    return (
      <div className="relative w-full aspect-video bg-dark-200 rounded-2xl overflow-hidden shadow-2xl group">
        <iframe
          src={stream.url}
          className="absolute inset-0 w-full h-full"
          allow="autoplay; fullscreen; picture-in-picture"
          title={title || 'Video Player'}
        />
        <button
          type="button"
          aria-label="Fullscreen"
          className="absolute bottom-3 right-3 z-10 bg-black/60 hover:bg-black/80 rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          onClick={(e) => {
            e.stopPropagation();
            const iframe = e.currentTarget.parentElement?.querySelector<HTMLIFrameElement>('iframe');
            iframe?.requestFullscreen?.();
          }}
        >
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" /></svg>
        </button>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full rounded-2xl overflow-hidden shadow-2xl bg-dark-200 plyr-container"
    >
      <video
        ref={videoRef}
        poster={poster || undefined}
        playsInline
        controls
        className="w-full aspect-video"
      >
        <source src={stream.url} type="video/mp4" />
      </video>
    </div>
  );
}
