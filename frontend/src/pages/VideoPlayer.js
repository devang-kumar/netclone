import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactPlayer from 'react-player';
import './VideoPlayer.css';

const VideoPlayer = () => {
  const { episodeId } = useParams();
  const navigate = useNavigate();
  const [episode, setEpisode] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEpisode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [episodeId]);

  const fetchEpisode = async () => {
    try {
      const res = await axios.get(`/api/episodes/${episodeId}`);
      setEpisode(res.data.data);
      
      // Add to watch history
      await axios.post('/api/users/history', {
        seriesId: res.data.data.series._id,
        episodeId: episodeId,
        progress: 0
      });
    } catch (error) {
      console.error('Error fetching episode:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!episode) {
    return <div className="loading">Episode not found</div>;
  }

  return (
    <div className="video-player-page">
      <div className="video-player-header">
        <button className="back-button" onClick={() => navigate(`/series/${episode.series._id}`)}>
          ← Back to Series
        </button>
      </div>

      <div className="video-player-container">
        <ReactPlayer
          url={episode.video.url}
          controls
          playing
          width="100%"
          height="100%"
          config={{
            file: {
              attributes: {
                controlsList: 'nodownload'
              }
            }
          }}
        />
      </div>

      <div className="video-info">
        <h1>{episode.series.title}</h1>
        <h2>Episode {episode.episodeNumber}: {episode.title}</h2>
        <p>{episode.description}</p>
      </div>
    </div>
  );
};

export default VideoPlayer;
