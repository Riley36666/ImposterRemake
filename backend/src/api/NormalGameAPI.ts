import express, { Request, Response } from "express";
import fs from "fs";
import path from "path";
const router = express.Router();

type WordPair = {
  normal: string;
  imposter: string;
};

type CategoryFile = {
  pairs: WordPair[];
};

type GameSettings = {
  category: string;
  players: number;
  imposters: number;
};

let settings: GameSettings = {
  category: "animals",
  players: 4,
  imposters: 1
};

let game: {
  players: number;
  words: string[];
  imposters: number[];
  votes: number[];
} | null = null;

const categories: Record<string, CategoryFile> = {};

const dataPath = path.join(__dirname, "../data");

const files = fs.readdirSync(dataPath);

for (const file of files) {

  if (file.endsWith(".json")) {

    const categoryName = file.replace(".json", "");

    const filePath = path.join(dataPath, file);

    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

    categories[categoryName] = data;

  }

}



router.post("/start", (req: Request, res: Response) => {
  const { category, players, imposters } = req.body;

  if (!categories[category]) {
    return res.status(400).json({ error: "Invalid category" });
  }

  if (!players || players < 2) {
    return res.status(400).json({ error: "Need at least 2 players" });
  }

  if (!imposters || imposters < 1 || imposters >= players) {
    return res.status(400).json({ error: "Invalid imposter count" });
  }

  settings = {
    category,
    players,
    imposters
  };

  const categoryData = categories[settings.category];
  if (!categoryData) {
  return res.status(400).json({ error: "Invalid category" });
  }
  const randomIndex = Math.floor(Math.random() * categoryData.pairs.length);
  const pair = categoryData.pairs[randomIndex]!;

  const words = Array(settings.players).fill(pair.normal);

  const imposterIndexes: number[] = [];

  while (imposterIndexes.length < settings.imposters) {

    const rand = Math.floor(Math.random() * settings.players);

    if (!imposterIndexes.includes(rand)) {
      imposterIndexes.push(rand);
      words[rand] = pair.imposter;
    }
  }

  const votes = Array(settings.players).fill(0);

  game = {
    players: settings.players,
    words,
    imposters: imposterIndexes,
    votes
  };

  res.json({
    success: true,
    category: settings.category,
    players: settings.players,
    imposters: settings.imposters
  });
});





/* GET PLAYER WORD */
router.get("/player/:id", (req: Request, res: Response) => {

  if (!game) {
    return res.status(400).json({ error: "Game has not started" });
  }

  const playerId = parseInt(req.params.id as string);

  if (isNaN(playerId) || playerId < 0 || playerId >= game.players) {
    return res.status(400).json({ error: "Invalid player ID" });
  }

  const word = game.words[playerId];
  const isImposter = game.imposters.includes(playerId);

  res.json({
    player: playerId,
    word,
    isImposter
  });

});

/* VOTE PLAYER */
router.post("/voteplayer/:id", (req: Request, res: Response) => {

  if (!game) {
    return res.status(400).json({ error: "Game has not started" });
  }

  const currentGame = game;

  const playerId = parseInt(req.params.id as string);

  if (isNaN(playerId) || playerId < 0 || playerId >= currentGame.players) {
    return res.status(400).json({ error: "Invalid player ID" });
  }

  if (currentGame.votes[playerId] === undefined) {
    return res.status(400).json({ error: "Vote slot does not exist" });
  }

  currentGame.votes[playerId]++;

  res.json({
    success: true,
    votedPlayer: playerId,
    votes: currentGame.votes
  });

});




/* GAME RESULT */
router.get("/result", (req: Request, res: Response) => {

  if (!game) {
    return res.status(400).json({ error: "Game has not started" });
  }

  const maxVotes = Math.max(...game.votes);
  const votedOut = game.votes.indexOf(maxVotes);

  const imposterCaught = game.imposters.includes(votedOut);

  res.json({
    imposters: game.imposters,
    votedOut,
    imposterCaught,
    votes: game.votes
  });

});




/* GET AVAILABLE CATEGORIES */
router.get("/categories", (req: Request, res: Response) => {

  res.json(Object.keys(categories));

});

/* RESTART GAME */
router.post("/restart", (req: Request, res: Response) => {

  if (!game) {
    return res.status(400).json({ error: "Game has not started" });
  }

  game = null;

  res.json({
    success: true,
    message: "Game restarted"
  });

});

export default router;