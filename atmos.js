const url =
  "https://real-time-news-data.p.rapidapi.com/search?query=environment&limit=7&time_published=anytime&country=US&lang=en";
const options = {
  method: "GET",
  headers: {
    "x-rapidapi-key": "ffedbf993fmsh5f4be06e91bc37bp138a38jsn342b5f0d58f9",
    "x-rapidapi-host": "real-time-news-data.p.rapidapi.com",
  },
};


const posWords = [
  "hope", "peace", "love", "green", "growth", "renewable", "nature", "tree", "forest", "planet",
  "clean", "light", "life", "bloom", "flower", "recycle", "revive", "balance", "harmony", "future",
  "fresh", "energy", "restore", "sustain", "thriving", "wildlife", "ocean", "air", "pure", "garden",
  "healing", "coexist", "together", "unity", "joy", "care", "compassion", "earth", "water", "home",
  "respect", "connection", "seed", "leaf", "community", "protect", "flourish", "solace", "calm", "gentle",
  "renewal", "rebirth", "awakening", "gentleness", "careful", "preserve", "clear", "embrace", "listen", "soft",
  "responsibility", "gratitude", "sunrise", "breeze", "rain", "river", "mountain", "soil", "organic", "cleanse",
  "transition", "restoration", "peaceful", "mindful", "adapt", "evolve", "hopeful", "safe", "inclusive", "compassionate",
  "lightness", "warmth", "tender", "freedom", "togetherness", "breathe", "open", "homecoming", "friendship", "reconnect",
  "renew", "heal", "wild", "diversity", "respectful", "transparent", "serenity", "natural", "joyful", "alive",
  "balance", "kindness", "growthful", "reconnect", "compromise",
  "blossom", "ecology", "symbiosis", "purity", "soothing",
  "stability", "flourishing", "equilibrium", "generosity", "wisdom",
  "kindred", "illumination", "gratitude", "understanding", "gentlewind"
];
const negWords = [  "crisis", "war", "pollution", "disaster", "collapse", "extinction", "climate", "conflict", "toxic", "deforestation",
  "drought", "flood", "earthquake", "fire", "storm", "hurricane", "violence", "waste", "meltdown", "smoke",
  "contamination", "oil", "damage", "threat", "decline", "loss", "destruction", "overheat", "emission", "carbon",
  "acid", "bleaching", "burning", "erosion", "hazard", "fear", "scarcity", "infection", "disease", "famine",
  "poverty", "exploit", "industrial", "radiation", "plastic", "chaos", "turmoil", "danger", "overuse", "tragedy",
  "collapse", "decay", "loss", "damage", "ruin", "scar", "smog", "overheat", "overconsume", "shortage",
  "confusion", "warfare", "violence", "injustice", "poverty", "greed", "exhaustion", "toxicity", "stress", "chaos",
  "radiation", "burnout", "fearful", "suffering", "contaminated", "industrialization", "isolation", "alienation", "plasticity", "depletion",
  "overfishing", "bleach", "acidic", "dryness", "collapse", "devastation", "erosion", "abuse", "exploit", "wounded",
  "hunger", "emergency", "flooding", "melting", "unrest", "turbulence", "fatal", "smoke", "threatened", "darkness",
   "contamination", "overload", "scarcity", "polluted", "erosive",
  "displacement", "heatwave", "wildfire", "smokestorm", "toxicwater",
  "infection", "panic", "ruination", "decay", "greediness",
  "overmining", "unsustainable", "wasteland", "collapse", "fragmentation"
];


function map(value, low1, high1, low2, high2) {
  return low2 + ((high2 - low2) * (value - low1)) / (high1 - low1);
}

const logos = document.querySelectorAll(".atmosLogo");
logos.forEach((logo) => {
  logo.style.opacity = 0.4;
  logo.style.transition = "all 0.8s ease";
});

const todayBtn = document.getElementById("todayLogoBtn");


todayBtn.addEventListener("click", async () => {
  todayBtn.textContent = "Analyzing today’s news...";
  let articles = [];

  try {
    const res = await fetch(url, options);
    const result = await res.json();
    if (result.data && result.data.length > 0) {
      articles = result.data;
    } else throw new Error("empty");
  } catch (e) {
    console.warn("API fallbackarticles");
    articles = [
      { title: "hope peace nature harmony", summary: "growth love green" },
    ];
  }

  const text = (articles[0].title + " " + articles[0].summary).toLowerCase();
  let score = 0;
  posWords.forEach((w) => text.includes(w) && score++);
  negWords.forEach((w) => text.includes(w) && score--);



  const chosen = articles[0];

  const detectedPos = posWords.filter((w) => text.includes(w));
  const detectedNeg = negWords.filter((w) => text.includes(w));

  console.log("TITLE:", chosen.title);
  console.log("SUMMARY:", chosen.summary);
  console.log("Positive words:", detectedPos);
  console.log("Negative words:", detectedNeg);
  console.log("Score:", score);

  const infoDiv = document.getElementById("articleInfo");
  if (infoDiv) {
    infoDiv.innerHTML = `
      <p><strong>Today’s article title</strong><br>${chosen.title}</p>
      <p><strong>Summary</strong><br>${chosen.summary}</p>
      <p><strong>Detected positive words</strong>: ${detectedPos.join(", ") || "none"}</p>
      <p><strong>Detected negative words</strong>: ${detectedNeg.join(", ") || "none"}</p>
      <p><strong>Final score</strong>: ${score}</p>
    `;
  }


  const index = Math.max(0, Math.min(11, Math.floor(map(score, -5, 5, 0, 11))));


  logos.forEach((logo, i) => {
    logo.style.opacity = i === index ? 1 : 0;
    logo.style.transform = i === index ? "scale(1.05)" : "scale(0.9)";
    logo.style.pointerEvents = i === index ? "auto" : "none";
  });

  todayBtn.textContent = `TODAY LOGO(Logo ${index + 1})`;


  
});

