'use client';

import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import api from '@/lib/api';

interface VideoPlayerProps {
  lessonId?: string;
  videoUrl?: string | null;
  videoType?: 'external' | 'hls' | null;
  title?: string;
  onEnded?: () => void;
  autoPlay?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  lessonId,
  videoUrl,
  videoType,
  title,
  onEnded,
  autoPlay = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const tokenRef = useRef<string | null>(null);
  const refreshTimerRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videoLoading, setVideoLoading] = useState(false);

  /*
   * ---------------------------------------------------------
   * PROGRESS SYNC
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (!lessonId) return;

    const interval = setInterval(() => {
      const video = videoRef.current;

      if (!video || video.paused) {
        return;
      }

      const currentTime = Math.floor(video.currentTime);

      const isCompleted =
        video.duration > 0 &&
        currentTime >= video.duration * 0.9;

      api
        .patch(`/dashboard/lesson/${lessonId}/progress`, {
          watchedSeconds: currentTime,
          completed: isCompleted,
        })
        .catch((err) => {
          console.warn(
            'Progress sync warning:',
            err
          );
        });
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, [lessonId]);

  /*
   * ---------------------------------------------------------
   * GET PLAYBACK TOKEN
   * ---------------------------------------------------------
   */

  const getPlaybackToken = async () => {
    if (!lessonId) {
      return null;
    }

    try {
      const res = await api.get(
        `/lessons/${lessonId}/playback-token`
      );

      const token = res.data.data.token;
      const expiresIn = res.data.data.expiresIn;

      tokenRef.current = token;

      console.log(
        `Playback token received. Expires in ${expiresIn}s`
      );

      return {
        token,
        expiresIn,
      };
    } catch (error) {
      console.error(
        'Failed to get playback token:',
        error
      );

      return null;
    }
  };

  /*
   * ---------------------------------------------------------
   * TOKEN REFRESH
   * ---------------------------------------------------------
   */

  const scheduleTokenRefresh = (
    expiresIn: number
  ) => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }

    /*
     * Refresh one minute before expiry.
     *
     * Minimum refresh interval is 10 seconds.
     */

    const refreshAfter = Math.max(
      expiresIn * 1000 - 60 * 1000,
      10 * 1000
    );

    refreshTimerRef.current = setTimeout(
      async () => {
        if (!lessonId) {
          return;
        }

        try {
          const result =
            await getPlaybackToken();

          if (!result) {
            return;
          }

          console.log(
            `Playback token refreshed. Expires in ${result.expiresIn}s`
          );

          scheduleTokenRefresh(
            result.expiresIn
          );
        } catch (error) {
          console.error(
            'Failed to refresh playback token:',
            error
          );
        }
      },
      refreshAfter
    );
  };

  /*
   * ---------------------------------------------------------
   * HLS INITIALIZATION
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (
      videoType !== 'hls' ||
      !lessonId
    ) {
      return;
    }

    const video = videoRef.current;

    if (!video) {
      console.warn(
        'Video element is not available.'
      );

      return;
    }

    let cancelled = false;

    const initializeHls = async () => {
      setVideoLoading(true);

      /*
       * Get playback token.
       */

      const tokenData =
        await getPlaybackToken();

      if (
        !tokenData ||
        cancelled
      ) {
        setVideoLoading(false);
        return;
      }

      const {
        token,
        expiresIn,
      } = tokenData;

      /*
       * Schedule token refresh.
       */

      scheduleTokenRefresh(expiresIn);

      /*
       * HLS playlist URL.
       */
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

      const playlistUrl =
        `${API_BASE_URL}/lessons/${lessonId}/hls/playlist.m3u8`;

      /*
       * -----------------------------------------------------
       * hls.js
       * -----------------------------------------------------
       */

      if (Hls.isSupported()) {
        console.log(
          'Using hls.js'
        );

        const hls = new Hls({
          enableWorker: true,
        });

        hlsRef.current = hls;

        /*
         * Add playback token to EVERY HLS request.
         *
         * This includes:
         *
         * - playlist
         * - segments
         * - nested playlists
         */

        hls.config.xhrSetup = (
          xhr,
          url
        ) => {
          try {
            const urlObject =
              new URL(url);

            const currentToken =
              tokenRef.current;

            if (currentToken) {
              urlObject.searchParams.set(
                'token',
                currentToken
              );
            }

            xhr.open(
              'GET',
              urlObject.toString(),
              true
            );
          } catch (error) {
            console.error(
              'HLS xhrSetup error:',
              error
            );
          }
        };

        /*
         * ---------------------------------------------------
         * MEDIA ATTACHED
         * ---------------------------------------------------
         */

        hls.on(
          Hls.Events.MEDIA_ATTACHED,
          () => {
            console.log(
              'HLS media attached'
            );
          }
        );

        /*
         * ---------------------------------------------------
         * MANIFEST PARSED
         * ---------------------------------------------------
         *
         * IMPORTANT:
         *
         * We DO NOT call video.play() here.
         *
         * The <video autoPlay={autoPlay}> attribute
         * handles initial autoplay.
         *
         * This prevents us from accidentally overriding
         * the user's pause action later.
         */

        hls.on(
          Hls.Events.MANIFEST_PARSED,
          () => {
            console.log(
              'HLS manifest loaded'
            );

            setVideoLoading(false);
          }
        );

        /*
         * ---------------------------------------------------
         * BUFFER APPENDED
         * ---------------------------------------------------
         */

        hls.on(
          Hls.Events.BUFFER_APPENDED,
          () => {
            console.log(
              'HLS buffer appended'
            );

            /*
             * NEVER call video.play() here.
             *
             * If the user paused the video,
             * it must remain paused.
             */
          }
        );

        /*
         * ---------------------------------------------------
         * FRAGMENT BUFFERED
         * ---------------------------------------------------
         *
         * We only log the event.
         *
         * DO NOT call video.play().
         */

        hls.on(
          Hls.Events.FRAG_BUFFERED,
          (_, data) => {
            console.log(
              'HLS fragment buffered:',
              data.frag.sn
            );
          }
        );

        /*
         * ---------------------------------------------------
         * HTML5 VIDEO ERROR
         * ---------------------------------------------------
         */

        const handleVideoError = () => {
          console.error(
            'HTML5 video error:',
            video.error
          );
        };

        video.addEventListener(
          'error',
          handleVideoError
        );

        /*
         * ---------------------------------------------------
         * HLS ERROR
         * ---------------------------------------------------
         */

        hls.on(
          Hls.Events.ERROR,
          (_, data) => {
            console.error(
              'HLS error:',
              data
            );

            /*
             * Recover from fatal media errors.
             */

            if (
              data.fatal &&
              data.type ===
                Hls.ErrorTypes.MEDIA_ERROR
            ) {
              console.warn(
                'Attempting HLS media recovery...'
              );

              hls.recoverMediaError();
            }
          }
        );

        /*
         * ---------------------------------------------------
         * LOAD PLAYLIST
         * ---------------------------------------------------
         */

        hls.loadSource(
          `${playlistUrl}?token=${encodeURIComponent(
            token
          )}`
        );

        /*
         * ---------------------------------------------------
         * ATTACH VIDEO
         * ---------------------------------------------------
         */

        hls.attachMedia(video);

        /*
         * Cleanup listener.
         */

        return () => {
          video.removeEventListener(
            'error',
            handleVideoError
          );
        };
      }

      /*
       * -----------------------------------------------------
       * NATIVE HLS
       * -----------------------------------------------------
       *
       * Safari / browsers with native HLS support.
       */

      if (
        video.canPlayType(
          'application/vnd.apple.mpegurl'
        )
      ) {
        console.log(
          'Using native browser HLS'
        );

        /*
         * Native HLS does not use xhrSetup.
         *
         * Therefore the token is added to the
         * initial playlist URL.
         *
         * Your backend-generated playlist should
         * contain the tokenized segment URLs.
         */

        video.src =
          `${playlistUrl}?token=${encodeURIComponent(
            token
          )}`;

        video.addEventListener(
          'loadedmetadata',
          () => {
            console.log(
              'Native HLS metadata loaded'
            );

            setVideoLoading(false);

            /*
             * Do NOT manually call play().
             *
             * autoPlay on <video> handles this.
             */
          },
          {
            once: true,
          }
        );

        return;
      }

      /*
       * -----------------------------------------------------
       * HLS NOT SUPPORTED
       * -----------------------------------------------------
       */

      console.error(
        'HLS is not supported by this browser.'
      );

      setVideoLoading(false);
    };

    initializeHls();

    /*
     * -------------------------------------------------------
     * CLEANUP
     * -------------------------------------------------------
     */

    return () => {
      cancelled = true;

      console.log(
        'Cleaning up HLS player...'
      );

      /*
       * Stop token refresh.
       */

      if (
        refreshTimerRef.current
      ) {
        clearTimeout(
          refreshTimerRef.current
        );

        refreshTimerRef.current =
          null;
      }

      /*
       * Destroy hls.js.
       */

      if (hlsRef.current) {
        hlsRef.current.destroy();

        hlsRef.current = null;
      }

      /*
       * Reset native video source.
       */

      if (video) {
        video.pause();

        video.removeAttribute(
          'src'
        );

        video.load();
      }

      tokenRef.current = null;
    };
  }, [
    lessonId,
    videoType,
    autoPlay,
  ]);

  /*
   * ---------------------------------------------------------
   * TIME UPDATE
   * ---------------------------------------------------------
   */

  const handleTimeUpdate = () => {
    const video =
      videoRef.current;

    if (!video) {
      return;
    }

    const current =
      video.currentTime;

    const total =
      video.duration;

    if (
      total > 0 &&
      Number.isFinite(total)
    ) {
      setProgress(
        (current / total) * 100
      );
    }
  };

  /*
   * ---------------------------------------------------------
   * VIDEO ENDED
   * ---------------------------------------------------------
   */

  const handleVideoEnded = () => {
    if (
      lessonId &&
      videoRef.current
    ) {
      const currentTime =
        Math.floor(
          videoRef.current
            .currentTime
        );

      api
        .patch(
          `/dashboard/lesson/${lessonId}/progress`,
          {
            watchedSeconds:
              currentTime,
            completed: true,
          }
        )
        .catch((err) => {
          console.warn(
            'Progress complete sync warning:',
            err
          );
        });
    }

    onEnded?.();
  };

  /*
   * ---------------------------------------------------------
   * YOUTUBE DETECTION
   * ---------------------------------------------------------
   */

  const isExternalYouTube =
    !!videoUrl &&
    (
      videoUrl.includes(
        'youtube.com'
      ) ||
      videoUrl.includes(
        'youtu.be'
      )
    );

  /*
   * ---------------------------------------------------------
   * RENDER
   * ---------------------------------------------------------
   */

  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl flex flex-col justify-center items-center">

      {/* =====================================================
          EXTERNAL VIDEO
          ===================================================== */}

      {videoType === 'external' &&
      videoUrl ? (

        isExternalYouTube ? (

          <iframe
            src={videoUrl.replace(
              'watch?v=',
              'embed/'
            )}
            title={
              title ||
              'Lesson Video'
            }
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />

        ) : (

          <video
            ref={videoRef}
            src={videoUrl}
            controls
            autoPlay={autoPlay}
            playsInline
            onTimeUpdate={
              handleTimeUpdate
            }
            onEnded={
              handleVideoEnded
            }
            onPlay={() =>
              setPlaying(true)
            }
            onPause={() =>
              setPlaying(false)
            }
            className="w-full h-full object-contain"
          />

        )

      ) : videoType === 'hls' ? (

        /*
         * ===================================================
         * HLS VIDEO
         * ===================================================
         *
         * IMPORTANT:
         *
         * The video element is ALWAYS mounted.
         *
         * Loading is only an overlay.
         */

        <>

          <video
            ref={videoRef}
            controls
            autoPlay={autoPlay}
            playsInline
            onTimeUpdate={
              handleTimeUpdate
            }
            onEnded={
              handleVideoEnded
            }
            onPlay={() =>
              setPlaying(true)
            }
            onPause={() =>
              setPlaying(false)
            }
            className="w-full h-full object-contain"
          />

          {videoLoading && (

            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/70 pointer-events-none">

              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />

              <span className="mt-3 text-sm text-slate-400">
                Loading video...
              </span>

            </div>

          )}

        </>

      ) : (

        /*
         * ===================================================
         * NO VIDEO
         * ===================================================
         */

        <div className="p-8 text-center flex flex-col items-center gap-3 text-slate-500">

          <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600">
            ▶
          </div>

          <span className="text-sm font-medium">
            No video attached to this lesson yet.
          </span>

        </div>

      )}

    </div>
  );
};