"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { LessonVideo } from "@/types";
import {
  Play, Pause, Volume2, VolumeX, Volume1,
  Maximize, Minimize, PictureInPicture2,
  Settings, SkipForward, SkipBack,
} from "lucide-react";
import { cx } from "@/lib/format";

interface VideoPlayerProps {
  video: LessonVideo;
  onProgress: (watchedSeconds: number) => void;
  onComplete: () => void;
  startAt?: number;
  onNext?: () => void;
  onPrev?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
}

function getYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) return u.searchParams.get("v");
    if (u.hostname === "youtu.be") return u.pathname.slice(1);
    return null;
  } catch { return null; }
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function VideoPlayer({
  video,
  onProgress,
  onComplete,
  startAt = 0,
  onNext,
  onPrev,
  hasNext,
  hasPrev,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const volumeBarRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [toast, setToast] = useState("");
  const [seeking, setSeeking] = useState(false);
  const [hoverTime, setHoverTime] = useState<{ x: number; time: number } | null>(null);
  const [pip, setPip] = useState(false);

  const youtubeId = getYouTubeId(video.videoUrl);

  // ── Setup video source ─────────────────────────────────────────────────────
  useEffect(() => {
    if (youtubeId || !videoRef.current) return;
    const el = videoRef.current;

    const setup = async () => {
      if (video.videoUrl.includes(".m3u8")) {
        const Hls = (await import("hls.js")).default;
        if (Hls.isSupported()) {
          const hls = new Hls();
          hls.loadSource(video.videoUrl);
          hls.attachMedia(el);
          return () => hls.destroy();
        }
      }
      el.src = video.videoUrl;
    };

    const cleanup = setup();
    return () => { cleanup.then((fn) => fn?.()) };
  }, [video.videoUrl, youtubeId]);

  // ── Resume at startAt ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!videoRef.current || startAt <= 0) return;
    const el = videoRef.current;
    const onCanPlay = () => { el.currentTime = startAt; };
    el.addEventListener("canplay", onCanPlay, { once: true });
    return () => el.removeEventListener("canplay", onCanPlay);
  }, [startAt]);

  // ── Video event listeners ──────────────────────────────────────────────────
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onDurationChange = () => setDuration(el.duration);
    const onTimeUpdate = () => {
      setCurrentTime(el.currentTime);
      if (el.buffered.length > 0) {
        setBuffered(el.buffered.end(el.buffered.length - 1));
      }
    };
    const onEnded = () => {
      setPlaying(false);
      onComplete();
    };
    const onEnterpip = () => setPip(true);
    const onLeavepip = () => setPip(false);

    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("durationchange", onDurationChange);
    el.addEventListener("timeupdate", onTimeUpdate);
    el.addEventListener("ended", onEnded);
    el.addEventListener("enterpictureinpicture", onEnterpip);
    el.addEventListener("leavepictureinpicture", onLeavepip);

    return () => {
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("durationchange", onDurationChange);
      el.removeEventListener("timeupdate", onTimeUpdate);
      el.removeEventListener("ended", onEnded);
      el.removeEventListener("enterpictureinpicture", onEnterpip);
      el.removeEventListener("leavepictureinpicture", onLeavepip);
    };
  }, [onComplete]);

  // ── Auto-save progress every 10s while playing ─────────────────────────────
  useEffect(() => {
    if (playing) {
      progressInterval.current = setInterval(() => {
        if (videoRef.current) onProgress(Math.floor(videoRef.current.currentTime));
      }, 10000);
    } else {
      if (progressInterval.current) clearInterval(progressInterval.current);
      if (videoRef.current) onProgress(Math.floor(videoRef.current.currentTime));
    }
    return () => { if (progressInterval.current) clearInterval(progressInterval.current); };
  }, [playing, onProgress]);

  // ── Fullscreen change listener ─────────────────────────────────────────────
  useEffect(() => {
    const onChange = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  // ── Controls auto-hide ─────────────────────────────────────────────────────
  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (playing) setShowControls(false);
    }, 3000);
  }, [playing]);

  useEffect(() => {
    if (!playing) setShowControls(true);
  }, [playing]);

  // ── Toast notifications ────────────────────────────────────────────────────
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 1500);
  }, []);

  // ── Player actions ─────────────────────────────────────────────────────────
  const togglePlay = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) { el.play(); } else { el.pause(); }
  }, []);

  const seek = useCallback((seconds: number) => {
    const el = videoRef.current;
    if (!el) return;
    el.currentTime = Math.max(0, Math.min(el.duration, el.currentTime + seconds));
    showToast(seconds > 0 ? `+${seconds}s` : `${seconds}s`);
  }, [showToast]);

  const seekTo = useCallback((fraction: number) => {
    const el = videoRef.current;
    if (!el) return;
    el.currentTime = fraction * el.duration;
  }, []);

  const changeVolume = useCallback((v: number) => {
    const el = videoRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(1, v));
    el.volume = clamped;
    setVolume(clamped);
    if (clamped === 0) { el.muted = true; setMuted(true); }
    else { el.muted = false; setMuted(false); }
  }, []);

  const toggleMute = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = !el.muted;
    setMuted(el.muted);
    showToast(el.muted ? "Muted" : "Unmuted");
  }, [showToast]);

  const changeSpeed = useCallback((s: number) => {
    const el = videoRef.current;
    if (!el) return;
    el.playbackRate = s;
    setSpeed(s);
    setShowSettings(false);
    showToast(`${s}×`);
  }, [showToast]);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  const togglePip = useCallback(async () => {
    const el = videoRef.current;
    if (!el) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await el.requestPictureInPicture();
      }
    } catch {}
  }, []);

  // ── Keyboard shortcuts ─────────────────────────────────────────────────────
  useEffect(() => {
    if (youtubeId) return;

    const onKey = (e: KeyboardEvent) => {
      // Don't fire if user is typing in an input
      if (["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement).tagName)) return;

      switch (e.key.toLowerCase()) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          showToast(videoRef.current?.paused ? "▶ Play" : "⏸ Pause");
          break;
        case "arrowleft":
        case "j":
          e.preventDefault();
          seek(-10);
          break;
        case "arrowright":
        case "l":
          e.preventDefault();
          seek(10);
          break;
        case "arrowup":
          e.preventDefault();
          changeVolume(volume + 0.1);
          showToast(`Volume ${Math.round(Math.min(volume + 0.1, 1) * 100)}%`);
          break;
        case "arrowdown":
          e.preventDefault();
          changeVolume(volume - 0.1);
          showToast(`Volume ${Math.round(Math.max(volume - 0.1, 0) * 100)}%`);
          break;
        case "m":
          toggleMute();
          break;
        case "f":
          toggleFullscreen();
          break;
        case "i":
          togglePip();
          break;
        case "0": case "1": case "2": case "3": case "4":
        case "5": case "6": case "7": case "8": case "9":
          e.preventDefault();
          seekTo(parseInt(e.key) / 10);
          showToast(`${e.key}0%`);
          break;
        case ">":
          changeSpeed(Math.min(speed + 0.25, 2));
          break;
        case "<":
          changeSpeed(Math.max(speed - 0.25, 0.25));
          break;
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [youtubeId, togglePlay, seek, seekTo, changeVolume, toggleMute, toggleFullscreen, togglePip, changeSpeed, volume, speed, showToast]);

  // ── Progress bar mouse interactions ───────────────────────────────────────
  const handleProgressMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const bar = progressBarRef.current;
    if (!bar || !duration) return;
    const rect = bar.getBoundingClientRect();
    const fraction = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverTime({ x: e.clientX - rect.left, time: fraction * duration });
    if (seeking) seekTo(fraction);
  }, [duration, seeking, seekTo]);

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const bar = progressBarRef.current;
    if (!bar || !duration) return;
    const rect = bar.getBoundingClientRect();
    const fraction = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    seekTo(fraction);
  }, [duration, seekTo]);

  // ── Volume bar interactions ────────────────────────────────────────────────
  const handleVolumeClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const bar = volumeBarRef.current;
    if (!bar) return;
    const rect = bar.getBoundingClientRect();
    const fraction = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    changeVolume(fraction);
  }, [changeVolume]);

  // ── YouTube fallback ───────────────────────────────────────────────────────
  if (youtubeId) {
    return (
      <div className="relative aspect-video w-full bg-ink-950">
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&start=${startAt}&modestbranding=1`}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Lesson video"
        />
      </div>
    );
  }

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;
  const bufferedPercent = duration ? (buffered / duration) * 100 : 0;

  const VolumeIcon = muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <div
      ref={containerRef}
      className={cx(
        "group relative aspect-video w-full select-none overflow-hidden bg-ink-950",
        fullscreen && "aspect-auto h-screen"
      )}
      onMouseMove={showControlsTemporarily}
      onMouseLeave={() => playing && setShowControls(false)}
      onClick={() => { togglePlay(); showControlsTemporarily(); }}
    >
      <video
        ref={videoRef}
        className="h-full w-full"
        playsInline
      />

      {/* Toast notification */}
      {toast && (
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-ink-950/90 px-5 py-3 font-mono text-lg font-bold text-paper-50">
          {toast}
        </div>
      )}

      {/* Controls overlay */}
      <div
        className={cx(
          "absolute inset-0 flex flex-col justify-end transition-opacity duration-200",
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gradient so controls stay legible over any video */}
        <div className="absolute inset-0 bg-linear-to-t from-ink-950/90 via-transparent to-transparent pointer-events-none" />

        <div className="relative px-4 pb-3 pt-6">
          {/* Progress bar */}
          <div
            ref={progressBarRef}
            className="group/bar relative mb-3 h-1 cursor-pointer rounded-full bg-ink-700 hover:h-2.5 transition-all"
            onMouseMove={handleProgressMouseMove}
            onMouseLeave={() => setHoverTime(null)}
            onClick={handleProgressClick}
            onMouseDown={() => setSeeking(true)}
            onMouseUp={() => setSeeking(false)}
          >
            {/* Buffered */}
            <div
              className="absolute h-full rounded-full bg-ink-600"
              style={{ width: `${bufferedPercent}%` }}
            />
            {/* Played */}
            <div
              className="absolute h-full rounded-full bg-signal-500"
              style={{ width: `${progressPercent}%` }}
            />
            {/* Thumb */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-3.5 w-3.5 rounded-full bg-signal-500 opacity-0 group-hover/bar:opacity-100 transition-opacity shadow"
              style={{ left: `${progressPercent}%` }}
            />
            {/* Hover time tooltip */}
            {hoverTime && (
              <div
                className="absolute bottom-5 -translate-x-1/2 rounded bg-ink-950 px-2 py-1 font-mono text-xs text-paper-50 pointer-events-none"
                style={{ left: hoverTime.x }}
              >
                {formatTime(hoverTime.time)}
              </div>
            )}
          </div>

          {/* Controls row */}
          <div className="flex items-center gap-3">
            {/* Prev */}
            {hasPrev && (
              <button onClick={onPrev} className="text-paper-200 hover:text-paper-50 transition-colors" title="Previous lesson (Shift+P)">
                <SkipBack className="h-5 w-5" />
              </button>
            )}

            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="text-paper-50 hover:text-signal-400 transition-colors"
              title="Play/Pause (Space or K)"
            >
              {playing ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </button>

            {/* Next */}
            {hasNext && (
              <button onClick={onNext} className="text-paper-200 hover:text-paper-50 transition-colors" title="Next lesson (Shift+N)">
                <SkipForward className="h-5 w-5" />
              </button>
            )}

            {/* Volume */}
            <div className="flex items-center gap-2">
              <button onClick={toggleMute} className="text-paper-200 hover:text-paper-50 transition-colors" title="Mute (M)">
                <VolumeIcon className="h-5 w-5" />
              </button>
              <div
                ref={volumeBarRef}
                className="hidden sm:block w-20 h-1 cursor-pointer rounded-full bg-ink-700 hover:h-2 transition-all"
                onClick={handleVolumeClick}
              >
                <div
                  className="h-full rounded-full bg-paper-100"
                  style={{ width: `${muted ? 0 : volume * 100}%` }}
                />
              </div>
            </div>

            {/* Time */}
            <span className="font-mono text-xs text-paper-200 tabular-nums">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            <div className="ml-auto flex items-center gap-2">
              {/* Speed */}
              <div className="relative">
                <button
                  onClick={(e) => { e.stopPropagation(); setShowSettings((v) => !v); }}
                  className="flex items-center gap-1 rounded border border-ink-700 px-2 py-1 font-mono text-xs text-paper-200 hover:border-ink-600 hover:text-paper-50 transition-colors"
                  title="Playback speed"
                >
                  {speed}×
                </button>
                {showSettings && (
                  <div
                    className="absolute bottom-full right-0 mb-2 overflow-hidden rounded-lg border border-ink-700 bg-ink-900 py-1 shadow-card"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <p className="px-3 py-1.5 font-mono text-[10px] uppercase tracking-wide text-ink-500">Speed</p>
                    {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((s) => (
                      <button
                        key={s}
                        onClick={() => changeSpeed(s)}
                        className={cx(
                          "block w-full px-3 py-1.5 text-left font-mono text-sm hover:bg-ink-800",
                          speed === s ? "text-signal-500" : "text-paper-200"
                        )}
                      >
                        {s === 1 ? "Normal" : `${s}×`}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* PiP */}
              {"pictureInPictureEnabled" in document && (
                <button
                  onClick={togglePip}
                  className={cx("text-paper-200 hover:text-paper-50 transition-colors", pip && "text-signal-500")}
                  title="Picture in Picture (I)"
                >
                  <PictureInPicture2 className="h-5 w-5" />
                </button>
              )}

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="text-paper-200 hover:text-paper-50 transition-colors"
                title="Fullscreen (F)"
              >
                {fullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}