import { useEffect, useRef, useState } from "react";
import StarRating from "./StarRating";
import { useMovies } from "./useMovies";
import { useLocalStorage } from "./useLocalStorageState";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);
const API_KEY = "572b4bd1";

export default function App() {
  const [query, setQuery] = useState("saw");
  const [selectedId, setSelectedId] = useState(null);
  // const [watched, setWatched] = useState(tempWatchedData);
  const [watched, setWatched] = useLocalStorage([], "watched");
  // const [watched, setWatched] = useState(function () {
  //   const storedValue = localStorage.getItem("watched");
  //   console.log(storedValue);
  //   return JSON.parse(storedValue);
  // });
  const { movies, isLoading, error } = useMovies(query);

  function handleSelectMovie(id) {
    setSelectedId((selectedId) => (id === selectedId ? null : id));
  }
  function handleCloseMovie() {
    setSelectedId(null);
  }
  function handleAddWatch(movie) {
    if (!watched) return setWatched([movie]);
    setWatched((watched) => [...watched, movie]);
  }
  function handleDeleteWatched(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }

  return (
    <>
      <Navigation query={query} setQuery={setQuery}>
        <NumResult movies={movies} />
      </Navigation>

      <Main>
        <Box>
          {error && <ErrorMessage message={error} />}
          {!isLoading && !error && (
            <MovieList movies={movies} onSelectMovie={handleSelectMovie} />
          )}
          {isLoading && <Loader />}
        </Box>
        <Box>
          {selectedId ? (
            <MovieDetails
              onAddWatched={handleAddWatch}
              selectedId={selectedId}
              onCloseMovie={handleCloseMovie}
              watched={watched}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedList
                watched={watched}
                onDeleteWatched={handleDeleteWatched}
              />
              {/* <StarRating onSetRating={() => {}} size={24} /> */}
            </>
          )}
        </Box>
      </Main>
    </>
  );
}
function ErrorMessage({ message }) {
  return <p className="error">{message}</p>;
}
function Loader() {
  return <p className="loader">loading...</p>;
}
function Main({ children }) {
  return <main className="main">{children}</main>;
}
function WatchedList({ watched, onDeleteWatched }) {
  if (!watched) return;
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedListItem
          movie={movie}
          key={movie.imdbID}
          onDeleteWatched={onDeleteWatched}
        />
      ))}
    </ul>
  );
}
function WatchedListItem({ movie, onDeleteWatched }) {
  return (
    <li>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <button
          className="btn-delete"
          onClick={() => {
            onDeleteWatched(movie.imdbID);
          }}
        >
          X
        </button>
      </div>
    </li>
  );
}
function WatchedSummary({ watched }) {
  const avgImdbRating = !watched
    ? 0
    : average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = !watched
    ? 0
    : average(watched.map((movie) => movie.userRating));
  const avgRuntime = !watched
    ? 0
    : average(watched.map((movie) => movie.runtime));
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{!watched ? 0 : watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}
function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}
function MovieList({ movies, onSelectMovie }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie key={movie.imdbID} movie={movie} onSelectMovie={onSelectMovie} />
      ))}
    </ul>
  );
}
// function WatchedBox() {
//   const [watched, setWatched] = useState(tempWatchedData);
//   const [isOpen2, setIsOpen2] = useState(true);

//   return (
//     <div className="box">
//       <button
//         className="btn-toggle"
//         onClick={() => setIsOpen2((open) => !open)}
//       >
//         {isOpen2 ? "–" : "+"}
//       </button>
//       {isOpen2 && (
//         <>
//           <WatchedSummary watched={watched} />
//           <WatchedList watched={watched} />
//         </>
//       )}
//     </div>
//   );
// }
function Movie({ movie, onSelectMovie }) {
  return (
    <li onClick={() => onSelectMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}
function MovieDetails({ selectedId, onCloseMovie, onAddWatched, watched }) {
  const isWatched = !watched
    ? false
    : watched.map((movie) => movie.imdbID).includes(selectedId);
  const [movie, setMovie] = useState({});
  const [userRating, setUserRating] = useState(
    isWatched ? watched.filter((movie) => movie.imdbID === selectedId).at(0) : 0
  );
  const countRef = useRef(0);
  useEffect(
    function () {
      if (userRating) countRef.current++;
    },
    [userRating]
  );
  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: realeased,
    Actors: actors,
    Director: director,

    Genre: genre,
  } = movie;
  const [isLoading, setIsLoading] = useState(false);

  useEffect(
    function () {
      const cb = function (e) {
        if (e.code === "Escape") {
          onCloseMovie();
        }
      };
      document.addEventListener("keydown", cb);
      return function () {
        document.removeEventListener("keydown", cb);
      };
    },
    [onCloseMovie]
  );
  useEffect(
    function () {
      async function getMovieDetails() {
        setIsLoading(true);
        const res = await fetch(
          `https://www.omdbapi.com/?apikey=${API_KEY}&i=${selectedId}`
        );
        if (!res.ok) {
          throw new Error("Something went Wrong with fetching movie data");
        }
        const data = await res.json();
        if (data.Response === "False") throw new Error("Movie not found");
        setIsLoading(false);
        setMovie(data);
      }
      getMovieDetails();
    },
    [selectedId]
  );
  function handleAdd() {
    const newMovie = {
      imdbID: selectedId,
      title,
      year,
      Poster: poster,
      runtime: Math.round(Number(runtime.split(" ")[0])),
      imdbRating: Math.round(Number(imdbRating)),
      plot,
      realeased,
      actors,
      director,
      genre,
      userRating,
      countRatingDecisions: countRef.current,
    };
    onAddWatched(newMovie);
    onCloseMovie();
  }
  useEffect(
    function () {
      if (!title) return;
      document.title = `Movie | ${title}`;
      return function () {
        document.title = "UsePopCorn";
      };
    },
    [title]
  );
  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={onCloseMovie}>
              x
            </button>

            <img src={poster} alt={`Poster for ${title}`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {realeased} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>🌟</span> {imdbRating}
              </p>
            </div>
          </header>

          <section>
            <div className="rating">
              {!isWatched ? (
                <>
                  <StarRating
                    defaultRating={userRating}
                    maxRating={10}
                    size={24}
                    onSetRating={setUserRating}
                  />
                  <button className="btn-add" onClick={handleAdd}>
                    Watched ✅
                  </button>
                </>
              ) : (
                <p>You already watched this movie </p>
              )}
            </div>

            <p>
              <em>{plot}</em>
            </p>
            <p>Starring {actors}</p>
            <p>Directed by {director}</p>
          </section>
        </>
      )}
    </div>
  );
}
function Navigation({ children, query, setQuery }) {
  return (
    <nav className="nav-bar">
      <Logo />
      <Search query={query} setQuery={setQuery} />
      {children}
    </nav>
  );
}
function NumResult({ movies }) {
  return (
    <p className="num-results">
      Found <strong> {movies.length}</strong> results
    </p>
  );
}
function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}
function Search({ query, setQuery }) {
  const inputEl = useRef(null);
  useEffect(
    function () {
      inputEl.current.focus();
    },
    [inputEl]
  );
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      ref={inputEl}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}
