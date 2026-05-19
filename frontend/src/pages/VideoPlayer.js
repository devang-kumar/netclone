import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactPlayer from 'react-player';
import {
  FiX,
  FiPlay,
  FiPause,
  FiVolume2,
  FiVolumeX,
  FiMaximize,
  FiSkipBack,
  FiSkipForward,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';
import './VideoPlayer.css';

const formatTime = (seconds) => {
  if (!seconds || Number.isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const VideoPlayer = () => {
  const { episodeId } = useParams();
  const navigate = useNavigate();
  const playerRef = useRef(null);
  const hideTimer = useRef(null);

  const [episode, setEpisode] = useState(null);
  const [prevEpisode, setPrevEpisode] = useState(null);
  const [nextEpisode, setNextEpisode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [seeking, setSeeking] = useState(false);

  const fetchEpisode = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/episodes/${episodeId}`);
      const payload = res.data.data;
      const ep = payload.episode || payload;

      setEpisode(ep);
      setPrevEpisode(payload.prevEpisode || null);
      setNextEpisode(payload.nextEpisode || null);
      setPlaying(true);
      setPlayed(0);

      if (ep?.series?._id) {
        await axios.post('/api/users/history', {
          seriesId: ep.series._id,
          episodeId,
          progress: 0,
        });
      }
    } catch (error) {
      console.error('Error fetching episode:', error);
    } finally {
      setLoading(false);
    }
  }, [episodeId]);

  useEffect(() => {
    fetchEpisode();
  }, [fetchEpisode]);

  const revealControls = () => {
    setShowControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (playing) setShowControls(false);
    }, 3500);
  };

  const goBack = () => {
    if (episode?.series?._id) navigate(`/series/${episode.series._id}`);
    else navigate('/');
  };

  const skip = (sec) => {
    const player = playerRef.current;
    if (!player) return;
    const t = player.getCurrentTime() + sec;
    player.seekTo(Math.max(0, t), 'seconds');
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (episode?.series?._id) navigate(`/series/${episode.series._id}`);
        else navigate('/');
      }
      if (e.key === ' ') {
        e.preventDefault();
        setPlaying((p) => !p);
      }
      if (e.key === 'ArrowLeft') skip(-10);
      if (e.key === 'ArrowRight') skip(10);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [episode, navigate]);

  const handleProgress = ({ played: p }) => {
    if (!seeking) setPlayed(p);
  };

  const handleSeek = (e) => {
    const val = parseFloat(e.target.value);
    setPlayed(val);
    playerRef.current?.seekTo(val, 'fraction');
  };

  const goEpisode = (id) => {
    if (id) navigate(`/watch/${id}`);
  };

  const toggleFullscreen = () => {
    const el = document.querySelector('.video-player-page');
    if (!document.fullscreenElement && el?.requestFullscreen) {
      el.requestFullscreen();
    } else {
      document.exitFullscreen?.();
    }
  };

  if (loading) {
    return (
      <div className="video-player-page video-player-page--loading">
        <div className="netflix-loader" />
      </div>
    );
  }

  if (!episode) {
    return (
      <div className="video-player-page video-player-page--loading">
        <p>Episode not found</p>
        <button type="button" className="nf-btn nf-btn--primary" onClick={() => navigate('/')}>
          Go Home
        </button>
      </div>
    );
  }

  const progressPct = played * 100;

  return (
    <div
      className={`video-player-page ${showControls ? 'show-controls' : ''}`}
      onMouseMove={revealControls}
      onClick={revealControls}
    >
      <div className="video-player-stage">
        <ReactPlayer
          ref={playerRef}
          url={episode.video.url}
          playing={playing}
          volume={volume}
          muted={muted}
          controls={false}
          width="100%"
          height="100%"
          progressInterval={200}
          onProgress={handleProgress}
          onDuration={setDuration}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => {
            if (nextEpisode) goEpisode(nextEpisode._id);
          }}
          config={{
            file: {
              attributes: {
                controlsList: 'nodownload',
                playsInline: true,
              },
            },
          }}
        />

        {!playing && showControls && (
          <button
            type="button"
            className="video-center-play"
            onClick={() => setPlaying(true)}
            aria-label="Play"
          >
            <FiPlay size={48} fill="#fff" />
          </button>
        )}
      </div>

      <header className="video-player-top">
        <button type="button" className="video-icon-btn" onClick={goBack} aria-label="Back">
          <FiX size={28} />
        </button>
        <div className="video-player-title-bar">
          <span className="video-series-name">{episode.series?.title}</span>
          <span className="video-episode-label">
            E{episode.episodeNumber}: {episode.title}
          </span>
        </div>
      </header>

      <footer className="video-player-bottom">
        <div className="video-controls-row">
          <button
            type="button"
            className="video-icon-btn"
            onClick={() => setPlaying(!playing)}
            aria-label={playing ? 'Pause' : 'Play'}
          >
            {playing ? <FiPause size={22} /> : <FiPlay size={22} fill="currentColor" />}
          </button>
          <button type="button" className="video-icon-btn" onClick={() => skip(-10)} aria-label="Rewind 10s">
            <FiSkipBack size={20} />
          </button>
          <button type="button" className="video-icon-btn" onClick={() => skip(10)} aria-label="Forward 10s">
            <FiSkipForward size={20} />
          </button>

          <div className="video-progress-wrap">
            <input
              type="range"
              className="video-progress"
              min={0}
              max={1}
              step={0.001}
              value={played}
              onChange={handleSeek}
              onMouseDown={() => setSeeking(true)}
              onMouseUp={() => setSeeking(false)}
              style={{ '--progress': `${progressPct}%` }}
            />
            <span className="video-time">
              {formatTime(played * duration)} / {formatTime(duration)}
            </span>
          </div>

          <button
            type="button"
            className="video-icon-btn"
            onClick={() => setMuted(!muted)}
            aria-label={muted ? 'Unmute' : 'Mute'}
          >
            {muted || volume === 0 ? <FiVolumeX size={20} /> : <FiVolume2 size={20} />}
          </button>
          <input
            type="range"
            className="video-volume"
            min={0}
            max={1}
            step={0.05}
            value={muted ? 0 : volume}
            onChange={(e) => {
              setVolume(parseFloat(e.target.value));
              setMuted(false);
            }}
          />
          <button type="button" className="video-icon-btn" onClick={toggleFullscreen} aria-label="Fullscreen">
            <FiMaximize size={20} />
          </button>
        </div>

        <div className="video-episode-nav">
          <button
            type="button"
            className="video-ep-btn"
            disabled={!prevEpisode}
            onClick={() => goEpisode(prevEpisode?._id)}
          >
            <FiChevronLeft size={18} />
            Previous
          </button>
          <p className="video-ep-desc">{episode.description}</p>
          <button
            type="button"
            className="video-ep-btn"
            disabled={!nextEpisode}
            onClick={() => goEpisode(nextEpisode?._id)}
          >
            Next
            <FiChevronRight size={18} />
          </button>
        </div>
      </footer>
    </div>
  );
};

export default VideoPlayer;
