import { useState, useEffect } from "react";
import axios from "axios";
import styles from "./SearchDialog.module.css";

export default function SearchDialog({
  onClose,
  onSelectTrack,
}: {
  onClose: () => void;
  onSelectTrack: (track: any) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // Added for error handling

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setError(""); // Reset error
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/api/jamendo/search?q=${query}`);
        setResults(response.data);
      } catch (error) {
        setError("Unable to fetch search results. Please try again."); // Display user-friendly error
      } finally {
        setLoading(false);
      }
    };

    const debounceFetch = setTimeout(() => fetchResults(), 500); // Added debounce
    return () => clearTimeout(debounceFetch); // Cleanup debounce
  }, [query]);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Search for a song</h2>
          <button onClick={onClose} className={styles.closeButton}>
            &times;
          </button>
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type at least 2 characters..."
          className={styles.searchInput}
        />
        {loading && <p className={styles.loading}>Searching...</p>}
        {error && <p className={styles.loading}>{error}</p>} {/* Show error */}
        <div className={styles.results}>
          {results.map((track: any) => (
            <div
              key={track.id}
              className={styles.card}
              onClick={() => onSelectTrack(track)}
            >
              <img
                src={track.image}
                alt={track.name}
                className={styles.cardImage}
              />
              <div className={styles.cardInfo}>
                <h4 className={styles.cardTitle}>{track.name}</h4>
                <p className={styles.cardArtist}>{track.artist_name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
