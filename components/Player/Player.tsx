'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause, faDownload, faSearch } from '@fortawesome/free-solid-svg-icons';
import SearchDialog from '@/components/SearchDialog/SearchDialog';
import styles from './Player.module.css';

const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });

interface Track {
  name: string;
  artist_name: string;
  audio: string;
  image: string;
}

const Player = () => {
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showSearch, setShowSearch] = useState(false);

  // Load track from Local Storage on mount
  useEffect(() => {
    const savedTrack = localStorage.getItem('selectedTrack');
    if (savedTrack) {
      setSelectedTrack(JSON.parse(savedTrack));
    }
  }, []);

  // Save selected track to Local Storage
  useEffect(() => {
    if (selectedTrack) {
      localStorage.setItem('selectedTrack', JSON.stringify(selectedTrack));
    }
  }, [selectedTrack]);

  const togglePlayPause = useCallback(() => {
    if (selectedTrack) setPlaying((prev) => !prev);
  }, [selectedTrack]);

  const formatTime = useCallback((time: number): string => {
    if (isNaN(time) || time < 0) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }, []);

  const progressBarClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (!duration) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const newProgress = (offsetX / rect.width) * duration;
      setProgress(newProgress);
    },
    [duration]
  );

  const resetPlayer = useCallback(() => {
    setPlaying(false);
    setProgress(0);
  }, []);

  const trackInfo = useMemo(() => {
    if (!selectedTrack) return null;
    return (
      <div className={styles.info}>
        <h3 className={styles.trackName}>{selectedTrack.name}</h3>
        <p className={styles.artist}>{selectedTrack.artist_name}</p>
      </div>
    );
  }, [selectedTrack]);

  return (
    <div className={styles.card}>
      <div className={styles.searchButton} onClick={() => setShowSearch(true)}>
        <FontAwesomeIcon icon={faSearch} size="lg" />
      </div>

      {selectedTrack && (
        <div className={styles.downloadButton}>
          <a
            href={selectedTrack.audio}
            download
            target="_blank"
            rel="noopener noreferrer"
          >
            <FontAwesomeIcon icon={faDownload} size="lg" />
          </a>
        </div>
      )}

      <div className={styles.content}>
        {selectedTrack ? (
          <>
            <div className={styles.coverContainer}>
              <img
                src={selectedTrack.image}
                alt={`${selectedTrack.name} Cover`}
                className={styles.cover}
              />
              <button className={styles.playButton} onClick={togglePlayPause}>
                <FontAwesomeIcon icon={playing ? faPause : faPlay} />
              </button>
            </div>
            {trackInfo}
            <div className={styles.progressContainer}>
              <span className={styles.timer}>{formatTime(progress)}</span>
              <div
                className={styles.progressBar}
                onClick={progressBarClick}
              >
                <div
                  className={styles.progressFiller}
                  style={{ width: `${(progress / duration) * 100}%` }}
                ></div>
              </div>
              <span className={styles.timer}>{formatTime(duration)}</span>
            </div>
          </>
        ) : (
          <p className={styles.noTrack}>No song selected</p>
        )}
      </div>

      {selectedTrack && (
        <ReactPlayer
          url={selectedTrack.audio}
          playing={playing}
          onProgress={({ playedSeconds }) => setProgress(playedSeconds)}
          onDuration={setDuration}
          style={{ display: 'none' }}
        />
      )}

      {showSearch && (
        <SearchDialog
          onClose={() => setShowSearch(false)}
          onSelectTrack={(track: Track) => {
            setSelectedTrack(track);
            setShowSearch(false);
            resetPlayer();
          }}
        />
      )}
    </div>
  );
};

export default Player;
