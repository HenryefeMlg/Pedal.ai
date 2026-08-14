let model;
let isWaiting = false;

// Yapay zekanın harf evreni
const chars = " abcçdefgğhıijklmnoöprsştuüvyz0123456789";
const charToIdx = {};
const idxToChar = {};

for (let i = 0; i < chars.length; i++) {
  charToIdx[chars[i]] = i;
  idxToChar[i] = chars[i];
}

// Derin Öğrenme Sinir Ağı Mimarisi
async function initGenerativeAI() {
  model = tf.sequential();
  
  // Nöron Katmanları
  model.add(tf.layers.dense({ units: 32, inputShape: [5, chars.length], activation: 'relu' }));
  model.add(tf.layers.flatten());
  model.add(tf.layers.dense({ units: 64, activation: 'relu' }));
  model.add(tf.layers.dense({ units: chars.length, activation: 'softmax' }));

  model.compile({
    optimizer: 'adam',
    loss: 'categoricalCrossentropy'
  });

  // Hızlı Eğitim İçin Sentetik Veri
  const sampleTexts = ["erzurum", "banane", "yü yü", "pedal", "saçma", "sistem", "lokum"];
  const xsList = [];
  const ysList = [];

  for (let text of sampleTexts) {
    for (let i = 0; i < text.length - 5; i++) {
      let seq = text.substring(i, i + 5);
      let nextChar = text[i + 5];
      
      let seqVec = [];
      for (let c of seq) {
        let vec = new Array(chars.length).fill(0);
        vec[charToIdx[c] || 0] = 1;
        seqVec.push(vec);
      }
      xsList.push(seqVec);

      let targetVec = new Array(chars.length).fill(0);
      targetVec[charToIdx[nextChar] || 0] = 1;
      ysList.push(targetVec);
    }
  }

  if (xsList.length > 0) {
    const xs = tf.tensor3d(xsList);
    const ys = tf.tensor2d(ysList);
    await model.fit(xs, ys, { epochs: 20 });
    xs.dispose();
    ys.dispose();
  }

  document.getElementById("statusDot").classList.add("ready");
  document.getElementById("systemStatus").textContent = "Sıfırdan Kelime Üreten YZ Aktif!";
  document.getElementById("userInput").disabled = false;
  document.getElementById("sendBtn").disabled = false;
}

// Harf Harf Yeni Kelime Türetme Fonksiyonu
function generateNewWord(prompt) {
  let cleanInput = prompt.toLowerCase().replace(/[^a-zçğıöşü0-9 ]/g, "");
  if (cleanInput.length < 5) {
    cleanInput = (cleanInput + "     ").substring(0, 5);
  }

  let currentSeq = cleanInput.substring(cleanInput.length - 5);
  let generatedResult = "";

  for (let step = 0; step < 8; step++) {
    let seqVec = [];
    for (let c of currentSeq) {
      let vec = new Array(chars.length).fill(0);
      vec[charToIdx[c] || 0] = 1;
      seqVec.push(vec);
    }

    const inputTensor = tf.tensor3d([seqVec]);
    const prediction = model.predict(inputTensor);
    const probs = prediction.dataSync();

    inputTensor.dispose();
    prediction.dispose();

    let chosenIdx = sampleFromProbs(probs, 1.8); 
    let nextChar = idxToChar[chosenIdx] || "a";

    generatedResult += nextChar;
    currentSeq = currentSeq.substring(1) + nextChar;
  }

  return generatedResult.trim();
}

function sampleFromProbs(probs, temperature) {
  let logits = probs.map(p => Math.log(p + 1e-7) / temperature);
  let expLogits = logits.map(l => Math.exp(l));
  let sumExp = expLogits.reduce((a, b) => a + b, 0);
  let normProbs = expLogits.map(e => e / sumExp);

  let r = Math.random();
  let acc = 0;
  for (let i = 0; i < normProbs.length; i++) {
    acc += normProbs[i];
    if (r <= acc) return i;
  }
  return normProbs.length - 1;
}

window.addEventListener('DOMContentLoaded', initGenerativeAI);

async function sendMessage() {
  if (isWaiting || !model) return;

  const input = document.getElementById("userInput");
  const messageText = input.value.trim();

  if (messageText === "") return;

  appendMessage(messageText, "user-message");
  input.value = "";
  
  isWaiting = true;
  document.getElementById("sendBtn").disabled = true;

  const typingIndicator = createTypingIndicator();
  const messagesContainer = document.getElementById("chatMessages");
  messagesContainer.appendChild(typingIndicator);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  setTimeout(() => {
    const generatedWord = generateNewWord(messageText);
    
    typingIndicator.remove();
    appendMessage(generatedWord, "ai-message");

    isWaiting = false;
    document.getElementById("sendBtn").disabled = false;
  }, 1000);
}

function createTypingIndicator() {
  const container = document.createElement("div");
  container.classList.add("typing-indicator");
  for (let i = 0; i < 3; i++) {
    const dot = document.createElement("div");
    dot.classList.add("typing-dot");
    container.appendChild(dot);
  }
  return container;
}

function appendMessage(text, className) {
  const messagesContainer = document.getElementById("chatMessages");
  const messageElement = document.createElement("div");
  messageElement.classList.add("message", className);
  messageElement.textContent = text;
  
  messagesContainer.appendChild(messageElement);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

document.getElementById("userInput").addEventListener("keypress", function(e) {
  if (e.key === "Enter") sendMessage();
});