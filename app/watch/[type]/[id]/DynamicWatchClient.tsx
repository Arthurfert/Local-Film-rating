'use client';

import dynamic from 'next/dynamic';

export const WatchClientLazy = dynamic(() => import('./WatchClient'), { ssr: false });
