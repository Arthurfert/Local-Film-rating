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

  useEffect(() => {
    if (!videoRef.current || stream.embed) return;

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

    return () => {
      plyrRef.current?.destroy();
    };
  }, [stream.embed]);

  if (stream.embed) {
    return (
      <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
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
    <div className="w-full rounded-2xl overflow-hidden shadow-2xl bg-black">
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
