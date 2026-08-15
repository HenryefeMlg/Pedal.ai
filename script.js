let isWaiting = false;

// Hugging Face Ücretsiz Tokenin (hf_... ile başlar)
const HF_TOKEN = "BURAYA_HUGGINGFACE_TOKENINI_YAZ";

// Kullanacağımız Gerçek Dil Modeli
const MODEL_URL = "https://api-inference.huggingface.co/models/google/gemma-2-2b-it";

async function queryHuggingFace(userMessage) {
  // Yapay zekaya saçmalamasını söyleyen sistem talimatı (System Prompt)
  const systemPrompt = "Sen 'Pedal AI' adında saçma sapan cevaplar veren absürt bir yapay zekasın. Mantıklı cümle kurma, Türkçe konuş ama aşırı absürt, komik, mantıksız ve devrik yanıtlar ver. Kısa cevap ver.";
  
  const fullPrompt = `<start_of_turn>user\n${systemPrompt}\n\nKullanıcı: ${userMessage}<end_of_turn>\n<start_of_turn>model\n`;

  const response = await fetch(MODEL_URL, {
    headers: {
      Authorization: `Bearer ${HF_TOKEN}`,
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({
      inputs: fullPrompt,
      parameters: {
        max_new_tokens: 60,
        temperature: 1.5, // Sıcaklığı tavan yapıyoruz ki saçmalasın
        top_p: 0.9,
        do_sample: true
      }
    }),
  });

  const result = await response.json();

  if (Array.isArray(result) && result[0]?.generated_text) {
    // Modelin ürettiği metni temizleme
    let text = result[0].generated_text;
    let cleanText = text.split("<start_of_turn>model\n")[1] || text;
    return cleanText.trim();
  } else if (result.error) {
    console.error("HF Error:", result.error);
    return "banane olm beyinim yandı (Model yükleniyor olabilir, tekrar dene).";
  }

  return "yü yü yü! erzurum soğukmuş.";
}

async function sendMessage() {
  if (isWaiting) return;

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

  try {
    const aiResponse = await queryHuggingFace(messageText);
    typingIndicator.remove();
    appendMessage(aiResponse, "ai-message");
  } catch (error) {
    typingIndicator.remove();
    appendMessage("karpuz kabuğu denize düştü, bağlantı koptu.", "ai-message");
  }

  isWaiting = false;
  document.getElementById("sendBtn").disabled = false;
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
