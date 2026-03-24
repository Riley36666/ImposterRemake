import React, { useEffect, useState } from "react";
import "./App.css";

const API = "/api";
const MR_WHITE_API = "/mrWhite";
const PC_API = "/pc";

type Screen =
  | "main-menu"
  | "settings"
  | "categories"
  | "player"
  | "vote"
  | "result"
  | "mrWhiteWinner"
  | "mrWhiteLoser"
  | "pcData";

type Result = {
  votedOut: number;
  imposterCaught: boolean;
  imposters: number[];
  mrWhite?: number[];
};

export default function App() {
  const [screen, setScreen] = useState<Screen>("main-menu");

  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>((["animals"]));

  const [players, setPlayers] = useState(4);
  const [imposters, setImposters] = useState(1);
  const [mrWhite, setMrWhite] = useState(false);

  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [word, setWord] = useState("");
  const [role, setRole] = useState("");

  const [votes, setVotes] = useState<number[]>([]);
  const [result, setResult] = useState<Result | null>(null);

  const [hasVoted, setHasVoted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60 * 3);

  const [guess, setGuess] = useState("");
  const [guessResult, setGuessResult] = useState("");

  const [pcData, setPcData] = useState<any>(null);
  const [loadingPc, setLoadingPc] = useState(false);

  // 🔥 unified APIs
  const baseAPI = mrWhite ? MR_WHITE_API : API;
  const basePCAPI = PC_API;

  useEffect(() => {
    fetch(`${API}/categories`)
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch(() => console.log("Failed to load categories"));
  }, []);

  function formatTime(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  useEffect(() => {
    if (screen !== "vote") return;

    setTimeLeft(60 * 5);

    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          showResult();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [screen]);

  function goBack() {
    setScreen("main-menu");
  }

  function goSettings() {
    setScreen("settings");
  }

  function goCategories() {
    setScreen("categories");
  }

  function toggleCategory(cat: string) {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  async function loadPcData() {
    try {
      setLoadingPc(true);

      const res = await fetch(`${basePCAPI}/info`);
      const json = await res.json();

      setPcData(json.data);
      setScreen("pcData");
    } catch {
      alert("Failed to load PC data");
    } finally {
      setLoadingPc(false);
    }
  }

  async function start() {
    if (players < 3) {
      alert("Minimum 3 players");
      return;
    }

    await fetch(`${baseAPI}/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        selectedCategories,
        players,
        imposters,
      }),
    });

    setVotes(Array(players).fill(0));
    setCurrentPlayer(0);
    setHasVoted(false);
    setWord("");

    setScreen("player");
  }

  async function revealWord() {
    try {
      const res = await fetch(`${baseAPI}/player/${currentPlayer}`);
      const data = await res.json();

      setWord(data.word ? `Your word is: ${data.word}` : "You are Mr White");
      setRole(data.isImposter ? "IMPOSTER" : "NORMAL");
    } catch {
      setWord("Server error");
    }
  }

  function nextPlayer() {
    setWord("");

    if (currentPlayer + 1 >= players) {
      setScreen("vote");
    } else {
      setCurrentPlayer(currentPlayer + 1);
    }
  }

  async function vote(id: number) {
    if (hasVoted) return;

    try {
      const res = await fetch(`${baseAPI}/voteplayer/${id}`, {
        method: "POST",
      });

      const data = await res.json();

      setVotes(data.votes);
      setHasVoted(true);
    } catch {
      alert("Vote failed");
    }
  }

  async function showResult() {
    try {
      const res = await fetch(`${baseAPI}/result`);
      const data = await res.json();

      setResult(data);
      setScreen("result");
    } catch {
      alert("Failed to fetch result");
    }
  }

  async function submitGuess() {
    try {
      const res = await fetch(`${baseAPI}/guess`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ guess }),
      });

      const data = await res.json();

      if (data.message === "won") {
        setScreen("mrWhiteWinner");
      } else {
        setScreen("mrWhiteLoser");
      }
    } catch {
      setGuessResult("Server error");
    }
  }

  async function restart() {
    await fetch(`${baseAPI}/restart`, {
      method: "POST",
    });

    setScreen("main-menu");
    setResult(null);

    setWord("");
    setGuess("");
    setGuessResult("");

    setHasVoted(false);
    setTimeLeft(60 * 5);
  }

  return (
    <div className="app">
      {screen !== "main-menu" &&
        screen !== "result" &&
        screen !== "mrWhiteWinner" &&
        screen !== "mrWhiteLoser" && (
          <button className="backArrow" onClick={goBack}>
            ←
          </button>
        )}

      {screen === "main-menu" && (
        <div className="card">
          <h1>Imposter Game</h1>
          <button onClick={start}>Start Game</button>
          <button onClick={goSettings}>Settings</button>
        </div>
      )}

      {screen === "settings" && (
        <div className="settingsPanel">
          <div className="formGroup">
            <label>Players</label>
            <input
              type="number"
              value={players}
              onChange={(e) => setPlayers(Number(e.target.value))}
            />
          </div>

          <div className="formGroup">
            <label>Imposters</label>
            <input
              type="number"
              value={imposters}
              onChange={(e) => setImposters(Number(e.target.value))}
            />
          </div>

          <div className="formGroup checkbox">
            <label>Mr White Mode</label>
            <input
              type="checkbox"
              checked={mrWhite}
              onChange={(e) => setMrWhite(e.target.checked)}
            />
          </div>

          <button onClick={goCategories}>Select Categories</button>
          <button onClick={loadPcData}>Open System Info</button>
        </div>
      )}

      {screen === "categories" && (
        <div className="settingsPanel">
          <h2>Select Categories</h2>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={selectedCategories.includes(cat) ? "selected" : ""}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {screen === "player" && (
        <div className="card">
          <h2>Player {currentPlayer + 1}</h2>

          {!word && (
            <button onClick={revealWord}>Reveal Word</button>
          )}

          {word && (
            <>
              <p>{word}</p>
              <button onClick={nextPlayer}>Next</button>
            </>
          )}
        </div>
      )}

      {screen === "vote" && (
        <div className="card">
          <h2>Vote Player</h2>
          <h3>⏱ {formatTime(timeLeft)}</h3>

          {Array.from({ length: players }).map((_, i) => (
            <button key={i} onClick={() => vote(i)}>
              Player {i + 1}
            </button>
          ))}
        </div>
      )}

      {screen === "result" && result && (
        <div className="card">
          <h2>Player {result.votedOut + 1} was voted out</h2>
          <h3>
            {result.imposterCaught ? "Imposter Caught!" : "Imposter Escaped!"}
          </h3>
          <button onClick={restart}>Restart</button>
        </div>
      )}
    </div>
  );
}