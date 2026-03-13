import React, { useEffect, useState } from "react";
import "./App.css";

const API = "https://sideprojectnotion.duckdns.org/api";
const mrWhiteAPI = "https://sideprojectnotion.duckdns.org/mrWhite"

export default function App() {

  const [screen, setScreen] = useState<"settings" | "player" | "vote" | "result">("settings");

  const [categories, setCategories] = useState<string[]>([]);
  const [category, setCategory] = useState("animals");
  const [players, setPlayers] = useState(4);
  const [imposters, setImposters] = useState(1);

  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [word, setWord] = useState("");
  const [role, setRole] = useState("");

  const [votes, setVotes] = useState<number[]>([]);
  const [result, setResult] = useState<any>(null);

  
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    fetch(`${API}/categories`)
      .then(res => res.json())
      .then(data => setCategories(data));
  }, []);

  function goBack() {
    if (screen === "vote") {
      setScreen("settings");
    } else if (screen === "player") {
      setScreen("settings");
    }
  }

  async function startNormal() {

    await fetch(`${API}/start`, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ category, players, imposters })
    });

    setVotes(Array(players).fill(0));
    setCurrentPlayer(0);
    setHasVoted(false); 
    setScreen("player");
  }
  async function startMrwhite() {

    await fetch(`${mrWhiteAPI}/start`, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ category, players, imposters })
    });

    setVotes(Array(players).fill(0));
    setCurrentPlayer(0);
    setHasVoted(false); 
    setScreen("player");
  }
  async function revealWord() {

    const res = await fetch(`${API}/player/${currentPlayer}`);
    const data = await res.json();
    if(!data.word) {
      setWord("You are Mr White")
    } else{
    setWord("Your word is: " + data.word || "You are Mr White");
    }
    setRole(data.isImposter ? "IMPOSTER" : "NORMAL");
  }

  function nextPlayer() {

    setWord("");

    if (currentPlayer + 1 >= players) {
      setScreen("vote");
    } else {
      setCurrentPlayer(currentPlayer + 1);
    }
  }

  async function vote(id:number) {

    if (hasVoted) return; 

    const res = await fetch(`${API}/voteplayer/${id}`, { method:"POST" });
    const data = await res.json();

    setVotes(data.votes);
    setHasVoted(true); 
  }

  async function showResult() {

    const res = await fetch(`${API}/result`);
    const data = await res.json();

    setResult(data);
    setScreen("result");
  }

  async function restart() {

    await fetch(`${API}/restart`, { method:"POST" });

    setScreen("settings");
    setResult(null);
    setWord("");
    setHasVoted(false);
  }

  return (
    <div className="app">

      {/* Global Back Arrow */}
      {screen !== "settings" && screen !== "result" && (
        <button className="backArrow" onClick={goBack}>
          ←
        </button>
      )}

      {screen === "settings" && (
        <div className="card">

          <h1>Imposter Game</h1>

          <select value={category} onChange={e=>setCategory(e.target.value)}>
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>

          <input
            type="number"
            value={players}
            onChange={e=>setPlayers(Number(e.target.value))}
            placeholder="Players"
          />

          <input
            type="number"
            value={imposters}
            onChange={e=>setImposters(Number(e.target.value))}
            placeholder="Imposters"
          />

          <button onClick={startNormal}>
            Start Game
          </button>
          <button onClick={startMrwhite}>
            MrWhite
          </button>
        </div>
      )}

      {screen === "player" && (
        <div className="card">

          <h2>Player {currentPlayer+1}</h2>

          {!word && (
            <button className="big" onClick={revealWord}>
              Reveal Word
            </button>
          )}

          {word && (
            <div className="roleCard">

              <img
                className="roleImage"
                src={role === "IMPOSTER"
                  ? "/imposter.png"
                  : "/normal.png"}
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

          {Array.from({length:players}).map((_,i)=>(
            <button
              key={i}
              onClick={async () => {
                  await vote(i);
                  await showResult();
                }}
              disabled={hasVoted}
              
            >
              Player {i+1} 
            </button>
          ))}


        </div>
      )}

      {screen === "result" && result && (
        <div className="card">

          <h2>Player {result.votedOut+1} was voted out</h2>

          <h3>
            {result.imposterCaught ? "Imposter Caught!" : "Imposter Escaped!"}
          </h3>

          <p>Imposters: {result.imposters.map((i:number)=>i+1).join(", ")}</p>

          <button onClick={restart}>
            New Game
          </button>

        </div>
      )}

    </div>
  );
}
