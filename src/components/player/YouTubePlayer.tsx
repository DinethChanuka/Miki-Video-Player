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
  const isInitialMount = useRef(true);

  // Listen for timeline scrubber seeking
  useEffect(() => {
    const handleSeek = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (typeof detail?.positionSec === 'number' && iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'seekTo', args: [detail.positionSec, true] }),
          '*'
        );
      }
    };
    window.addEventListener('miki:youtube-seek', handleSeek);
    return () => window.removeEventListener('miki:youtube-seek', handleSeek);
  }, []);

  useEffect(() => {
    // Post initial time
    if (initialPositionMs > 0) {
      setPlayerState({ positionMs: initialPositionMs });
    }

    const handleWindowMessage = (event: MessageEvent) => {
      if (typeof event.data !== 'string') return;
      try {
        const payload = JSON.parse(event.data);
        if (payload.event === 'infoDelivery' && payload.info) {
          const info = payload.info;

          // Check for YouTube API errors
          if (typeof info.errorCode === 'number') {
            let msg = 'Failed to stream YouTube video.';
            if (info.errorCode === 101 || info.errorCode === 150) {
              msg = 'The video owner does not allow embedded playback outside YouTube.';
            } else if (info.errorCode === 100) {
              msg = 'This YouTube video has been removed or is marked private.';
            } else if (info.errorCode === 2) {
              msg = 'Invalid YouTube video ID parameter.';
            }
            setPlayerState({
              isBuffering: false,
              lastError: {
                code: 'STREAM_ERROR',
                message: msg,
                details: `YouTube API Error code ${info.errorCode}`,
                severity: 'recoverable',
                recovery: 'none',
                timestampMs: Date.now(),
              },
            });
            return;
          }

          if (typeof info.currentTime === 'number') {
            const curPosMs = Math.round(info.currentTime * 1000);
            const totalDurMs =
              typeof info.duration === 'number' && info.duration > 0
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
            setPlayerState({ isPaused: true, isBuffering: false });
            onEnded?.();
          } else if (info.playerState === 1) {
            // Playing
            setPlayerState({ isPaused: false, isBuffering: false });
          } else if (info.playerState === 2) {
            // Paused
            setPlayerState({ isPaused: true, isBuffering: false });
            const curPosMs = usePlayerStore.getState().positionMs;
            const durMs = usePlayerStore.getState().durationMs;
            usePlayerStore.getState().saveYouTubeProgress(youtubeId, curPosMs, durMs);
          } else if (info.playerState === 3) {
            // Buffering
            setPlayerState({ isBuffering: true });
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

  // Sync pause/play state to iframe (skip initial mount to let autoplay proceed smoothly)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
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
        JSON.stringify({ event: 'command', func: 'setVolume', args: [Math.min(100, volume)] }),
        '*'
      );
    }
  }, [volume, isMuted]);

  const originParam =
    typeof window !== 'undefined' && window.location.origin
      ? `&origin=${encodeURIComponent(window.location.origin)}`
      : '';

  return (
    <div className="w-full h-full z-10 bg-black flex items-center justify-center relative">
      <iframe
        ref={iframeRef}
        src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&enablejsapi=1&playsinline=1&rel=0&modestbranding=1&start=${startSec}${originParam}`}
        title="YouTube video player"
        className="w-full h-full border-0 select-none"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
        allowFullScreen
      />
    </div>
  );
};
