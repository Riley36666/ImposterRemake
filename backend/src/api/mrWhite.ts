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
  categories: string[];
  players: number;
  imposters: number;
};


let settings: GameSettings = {
  categories: ["animals"],
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
  const { selectedCategories: selectedCategories, players, imposters } = req.body;

  if (!selectedCategories || selectedCategories.length === 0) {
    return res.status(400).json({ error: "No categories selected" });
  }

  for (const cat of selectedCategories) {
    if (!categories[cat]) {
      return res.status(400).json({ error: `Invalid category: ${cat}` });
    }
  }

  if (!players || players < 2) {
    return res.status(400).json({ error: "Need at least 2 players" });
  }

  if (!imposters || imposters < 1 || imposters >= players) {
    return res.status(400).json({ error: "Invalid imposter count" });
  }

  settings = {
    categories: selectedCategories,
    players,
    imposters
  };

  /* pick random category */
  const randomCategory =
    settings.categories[Math.floor(Math.random() * settings.categories.length)];

  const categoryData = categories[randomCategory!];

  const randomIndex = Math.floor(Math.random() * categoryData!.pairs.length);
  const pair = categoryData!.pairs[randomIndex]!;

  const words = Array(settings.players).fill(pair.normal);

  const imposterIndexes: number[] = [];

  while (imposterIndexes.length < settings.imposters) {
    const rand = Math.floor(Math.random() * settings.players);

    if (!imposterIndexes.includes(rand)) {
      imposterIndexes.push(rand);

      
      words[rand] = "";
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
    category: randomCategory,
    players: settings.players,
    imposters: settings.imposters
  });
});







router.get("/player/:id", (req: Request, res: Response) => {

  if (!game) {
    return res.status(400).json({ error: "Game has not started" });
  }

  const playerId = parseInt(req.params.id as string);

  if (isNaN(playerId) || playerId < 0 || playerId >= game.players) {
    return res.status(400).json({ error: "Invalid player ID" });
  }

  let word = game.words[playerId];
  const isImposter = game.imposters.includes(playerId);
  
  if(isImposter) {
    word = ""
  }

  res.json({
    player: playerId,
    word,
    isImposter
  });

});

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
    votes: game.votes,
    mrWhite: game.imposters 
  });

});





router.get("/categories", (req: Request, res: Response) => {

  res.json(Object.keys(categories));

});


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

router.post("/guess", (req:Request, res:Response) => {
  const guess = req.body?.guess;
  
if (!guess) {
  return res.status(400).json({ error: "Guess required" });
}
if (!game) {
  return res.status(400).json({ error: "Game has not started" })
}
const word = game.words.find(w => w !== "")
  if(word === guess){
    res.json({
      success: true,
      message: "won"
    })
  }else{
    res.json({
      success: true,
      message: "lost"
    })
  }
})




export default router;