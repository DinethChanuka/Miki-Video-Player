import React, { useEffect, useRef } from 'react';
import { usePlayerStore } from '../../store/playerStore';

interface YouTubePlayerProps {
  youtubeId: string;
  initialPositionMs?: number;
  onTimeUpdate?: (positionMs: number, durationMs: number) => void;
  onEnded?: () => void;
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  youtubeId,
  initialPositionMs = 0,
  onTimeUpdate,
  onEnded,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const startSec = Math.max(0, Math.floor(initialPositionMs / 1000));
  const isPaused = usePlayerStore((s) => s.isPaused);
  const volume = usePlayerStore((s) => s.volume);
  const isMuted = usePlayerStore((s) => s.isMuted);

  const setPlayerState = usePlayerStore.setState;

  useEffect(() => {
    // Post initial time
    if (initialPositionMs > 0) {
      setPlayerState({ positionMs: initialPositionMs });
    }

    const handleWindowMessage = (event: MessageEvent) => {
      // Validate YouTube iframe message
      if (typeof event.data !== 'string') return;
      try {
        const payload = JSON.parse(event.data);
        if (payload.event === 'infoDelivery' && payload.info) {
          const info = payload.info;
          if (typeof info.currentTime === 'number') {
            const curPosMs = Math.round(info.currentTime * 1000);
            const totalDurMs = typeof info.duration === 'number' && info.duration > 0
              ? Math.round(info.duration * 1000)
              : usePlayerStore.getState().durationMs;

            setPlayerState({
              positionMs: curPosMs,
              ...(totalDurMs > 0 ? { durationMs: totalDurMs } : {}),
            });

            onTimeUpdate?.(curPosMs, totalDurMs);

            // Periodically update YouTube history stopped place in store
            usePlayerStore.getState().saveYouTubeProgress(youtubeId, curPosMs, totalDurMs);
          }

          if (info.playerState === 0) {
            // Ended
            setPlayerState({ isPaused: true });
            onEnded?.();
          } else if (info.playerState === 1) {
            // Playing
            setPlayerState({ isPaused: false });
          } else if (info.playerState === 2) {
            // Paused
            setPlayerState({ isPaused: true });
            const curPosMs = usePlayerStore.getState().positionMs;
            const durMs = usePlayerStore.getState().durationMs;
            usePlayerStore.getState().saveYouTubeProgress(youtubeId, curPosMs, durMs);
          }
        }
      } catch {}
    };

    window.addEventListener('message', handleWindowMessage);

    // Tell YouTube iframe to listen for time delivery events
    const pingTimer = setInterval(() => {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'listening', id: youtubeId }),
          '*'
        );
      }
    }, 1000);

    return () => {
      window.removeEventListener('message', handleWindowMessage);
      clearInterval(pingTimer);
      // Save last stopped position on unmount
      const curPosMs = usePlayerStore.getState().positionMs;
      const durMs = usePlayerStore.getState().durationMs;
      usePlayerStore.getState().saveYouTubeProgress(youtubeId, curPosMs, durMs);
    };
  }, [youtubeId, initialPositionMs, onTimeUpdate, onEnded, setPlayerState]);

  // Sync pause/play state to iframe
  useEffect(() => {
    if (!iframeRef.current?.contentWindow) return;
    const command = isPaused ? 'pauseVideo' : 'playVideo';
    iframeRef.current.contentWindow.postMessage(
      JSON.stringify({ event: 'command', func: command, args: [] }),
      '*'
    );
  }, [isPaused]);

  // Sync volume / mute to iframe
  useEffect(() => {
    if (!iframeRef.current?.contentWindow) return;
    if (isMuted) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'mute', args: [] }),
        '*'
      );
    } else {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'unMute', args: [] }),
        '*'
      );
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'setVolume', args: [volume] }),
        '*'
      );
    }
  }, [volume, isMuted]);

  return (
    <div className="w-full h-full z-10 bg-black flex items-center justify-center relative">
      <iframe
        ref={iframeRef}
        src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&enablejsapi=1&rel=0&modestbranding=1&start=${startSec}`}
        title="YouTube video player"
        className="w-full h-full border-0 select-none"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
};
