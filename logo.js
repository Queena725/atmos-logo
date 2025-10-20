// ---- State ----------------------------------------------------
let points = [];             // sampled points from bitmap text
let temperature = 25;        // °C
let humidity = 70;           // %
let titleEl;                 // "Loading..." text in controls

// ---- p5 lifecycle --------------------------------------------
function setup(){
  createCanvas(windowWidth, windowHeight);
  noStroke();
  titleEl = document.querySelector('#controls > div');

  // hook sliders
  select("#tempSlider").input(() => temperature = parseFloat(select("#tempSlider").value()));
  select("#humiditySlider").input(() => humidity = parseFloat(select("#humiditySlider").value()));
  select("#refreshData").mousePressed(fetchWeather);

  // build points from bitmap text (no font file needed)
  buildPointsFromBitmap();
  // try API once at start (will fall back silently if blocked)
  fetchWeather();
}

function draw(){
  background(255);

  if(points.length === 0){
    // still preparing bitmap
    fill(0); textAlign(CENTER,CENTER); textSize(18);
    text("Preparing logo…", width/2, height/2);
    return;
  }

  // map weather -> visuals
  const blurVal   = map(temperature, -10, 40, 0, 10);     // hotter -> blurrier
  const spread    = map(temperature, -10, 40, 0.05, 2.2); // hotter -> more jitter
  const density   = map(humidity, 0, 100, 2.2, 6.5);      // humid -> larger droplets
  const alphaMin  = map(humidity, 0, 100, 90, 170);       // humid -> denser/opaque

  // draw droplets
  for(const p of points){
    const n = noise(p.x*0.01, p.y*0.01, frameCount*0.01);
    const jx = random(-spread, spread);
    const jy = random(-spread, spread);
    const a  = constrain(alphaMin + n*85, 0, 255);
    fill(0, a);
    ellipse(p.x + jx, p.y + jy, n * density * 4);
  }

  // subtle vapor look
  addGrain(10);
  filter(BLUR, blurVal);

  // HUD
  fill(0); noStroke(); textSize(14); textAlign(CENTER);
  text(`Temp: ${nf(temperature,1,0)}°C   |   Humidity: ${nf(humidity,1,0)}%`, width/2, height-28);
}

// ---- Build points from bitmap text (robust; no font file) ----
function buildPointsFromBitmap(){
  // 1) create offscreen graphics
  const g = createGraphics(width, height);
  g.pixelDensity(1);
  g.clear();
  g.fill(0); g.noStroke();
  g.textAlign(LEFT, BASELINE);

  // 2) fit text size to width/height
  const target = "Atmos";
  let fs = min(width*0.22, height*0.45); // initial guess
  g.textSize(fs);
  g.textFont('sans-serif');
  // shrink if overflow
  while(g.textWidth(target) > width*0.8){ fs *= 0.95; g.textSize(fs); }
  const ascent = g.textAscent();
  const descent = g.textDescent();
  const textW = g.textWidth(target);
  const textH = ascent + descent;

  const x = (width - textW)/2;
  const y = (height + (ascent - descent))/2;

  // 3) draw
  g.background(255, 0); // transparent
  g.fill(0); g.text(target, x, y);
  g.loadPixels();

  // 4) sample pixels on grid
  points = [];
  const step = round(max(2, fs/60)); // density based on size
  for(let py = 0; py < height; py += step){
    for(let px = 0; px < width; px += step){
      const idx = 4 * (py * g.width + px);
      const r = g.pixels[idx], gch = g.pixels[idx+1], b = g.pixels[idx+2], a = g.pixels[idx+3];
      // inside text if pixel is dark/opaque
      if(a > 10 && (r+gch+b) < 200){
        points.push({x:px, y:py});
      }
    }
  }

  titleEl.textContent = "Live Weather Logo"; // UI title update
}

// ---- Weather API (works; falls back silently) -----------------
function fetchWeather(){
  // 7Timer via CORS proxy to avoid mixed content
  const url = "https://corsproxy.io/?http://www.7timer.info/bin/api.pl?lon=113.17&lat=23.09&product=astro&output=json";
  fetch(url)
    .then(r => r.json())
    .then(data => {
      const d = data.dataseries && data.dataseries[0];
      if(!d) throw new Error("No dataseries");
      temperature = d.temp2m;
      humidity = d.rh2m;
      // sync sliders
      const t = document.getElementById('tempSlider');
      const h = document.getElementById('humiditySlider');
      if(t) t.value = temperature;
      if(h) h.value = humidity;
      titleEl.textContent = "Live Weather Logo (API ✓)";
      console.log("Weather:", temperature, humidity);
    })
    .catch(err => {
      // graceful fallback — still fully works with sliders
      titleEl.textContent = "Live Weather Logo (API ✗ — using sliders)";
      console.warn("Weather API failed:", err);
    });
}

// ---- Grain texture --------------------------------------------
function addGrain(amount=5){
  loadPixels();
  for(let i=0; i<pixels.length; i+=4){
    const n = random(-amount, amount);
    pixels[i]   = constrain(pixels[i]  + n, 0, 255);
    pixels[i+1] = constrain(pixels[i+1]+ n, 0, 255);
    pixels[i+2] = constrain(pixels[i+2]+ n, 0, 255);
  }
  updatePixels();
}

// ---- Responsive ------------------------------------------------
function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
  buildPointsFromBitmap(); // rebuild points to keep centered & crisp
}