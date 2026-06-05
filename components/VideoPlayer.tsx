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
      const isFullscreen =
        document.fullscreenElement === container ||
        (document as any).webkitFullscreenElement === container;
      container.classList.toggle('rounded-2xl', !isFullscreen);
      container.classList.toggle('overflow-hidden', !isFullscreen);
    };

    plyrRef.current = new Plyr(videoRef.current, {
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
    });

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      plyrRef.current?.destroy();
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, [stream.embed]);

  if (stream.embed) {
    return (
      <div className="relative w-full aspect-video bg-dark-200 rounded-2xl overflow-hidden shadow-2xl">
        <iframe
          src={stream.url}
          className="absolute inset-0 w-full h-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          title={title || 'Video Player'}
        />
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
