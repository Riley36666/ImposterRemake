import React, { useEffect, useState } from "react";
import "./App.css";

const API = "https://sideprojectnotion.duckdns.org/api";
const mrWhiteAPI = "https://sideprojectnotion.duckdns.org/mrWhite";

type Screen = "main-menu" | "settings" | "player" | "vote" | "result";

type Result = {
  votedOut: number;
  imposterCaught: boolean;
  imposters: number[];
};

export default function App() {
  const [screen, setScreen] = useState<Screen>("main-menu");

  const [categories, setCategories] = useState<string[]>([]);
  const [category, setCategory] = useState("animals");

  const [players, setPlayers] = useState(4);
  const [imposters, setImposters] = useState(1);
  const [mrWhite, setMrWhite] = useState(false);

  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [word, setWord] = useState("");
  const [role, setRole] = useState("");
  // eslint-disable-next-line
  const [votes, setVotes] = useState<number[]>([]);
  const [result, setResult] = useState<Result | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  const baseAPI = mrWhite ? mrWhiteAPI : API;

  useEffect(() => {
    fetch(`${API}/categories`)
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(() => console.log("Failed to load categories"));
  }, []);

  function goBack() {
    setScreen("main-menu");
  }

  function goSettings() {
    setScreen("settings");
  }

  async function start() {
    if (players < 3) {
      alert("Minimum 3 players");
      return;
    }

    await fetch(`${baseAPI}/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, players, imposters })
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
        method: "POST"
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

  async function restart() {
    await fetch(`${baseAPI}/restart`, { method: "POST" });

    setScreen("main-menu");
    setResult(null);
    setWord("");
    setHasVoted(false);
  }

  return (
    <div className="app">

      {screen !== "main-menu" && screen !== "result" && screen !== "settings" && (
        <button className="backArrow" onClick={goBack}>←</button>
      )}

      {screen === "main-menu" && (
        <div className="card">
          <h1>Imposter Game</h1>

          <button onClick={start}>
            Start Game
          </button>

          <button onClick={goSettings}>
            Settings
          </button>
        </div>
      )}

      {screen === "settings" && (
        <div className="settingsPanel">

          <div className="catergoryGroup">
            <label>Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
            >
              {categories.map(c => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="formGroup">
            <label>Players</label>
            <input
              type="number"
              value={players}
              onChange={e => setPlayers(Number(e.target.value))}
            />
          </div>

          <div className="formGroup">
            <label>Imposters</label>
            <input
              type="number"
              value={imposters}
              onChange={e => setImposters(Number(e.target.value))}
            />
          </div>

          <div className="formGroup checkbox">
            <label htmlFor="mrwhite">Mr White Mode</label>
            <input
              id="mrwhite"
              type="checkbox"
              checked={mrWhite}
              onChange={e => setMrWhite(e.target.checked)}
            />
          </div>

          <button onClick={goBack}>
            Return to Main Menu
          </button>

        </div>
      )}

      {screen === "player" && (
        <div className="card">

          <h2>Player {currentPlayer + 1}</h2>

          {!word && (
            <button className="big" onClick={revealWord}>
              Reveal Word
            </button>
          )}

          {word && (
            <div className="roleCard">

              <img
                className="roleImage"
                src={role === "IMPOSTER" ? "/imposter.png" : "/normal.png"}
                alt="role"
              />

              <div className="roleDesc">
                {word}
              </div>

              <button onClick={nextPlayer}>
                Pass Phone
              </button>

            </div>
          )}

        </div>
      )}

      {screen === "vote" && (
        <div className="card">

          <h2>Vote Player</h2>

          {Array.from({ length: players }).map((_, i) => (
            <button
              key={i}
              onClick={async () => {
                await vote(i);
                await showResult();
              }}
              disabled={hasVoted}
            >
              Player {i + 1}
            </button>
          ))}

        </div>
      )}

      {screen === "result" && result && (
        <div className="card">

          <h2>Player {result.votedOut + 1} was voted out</h2>

          <h3>
            {result.imposterCaught
              ? "Imposter Caught!"
              : "Imposter Escaped!"}
          </h3>

          <p>
            Imposters: {result.imposters.map(i => i + 1).join(", ")}
          </p>

          <button onClick={restart}>
            New Game
          </button>

        </div>
      )}

    </div>
  );
}