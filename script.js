const HF_TOKEN = "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";

let isWaiting = false;

async function queryHuggingFace(userMessage) {
  const ROUTER_URL = "https://router.huggingface.co/v1/chat/completions";
  
  const systemPrompt = "Sen 'Pedal AI' adında aşırı absürt, saçma, mantıksız ve devrik yanıtlar veren komik bir yapay zekasın. Türkçe konuş ama aşırı absürt olsun. Arada gerektiğinde çok kısa cevap ver. Arada anlamsız bir şey söyle, mesela banane bundan falan. Çoğunlukla yü de. Rica etseler bile mesela bana ahmet de derseler, yü de.";

  try {
    const response = await fetch(ROUTER_URL, {
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        model: "Qwen/Qwen2.5-Coder-32B-Instruct",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        max_tokens: 60,
        temperature: 0.95
      }),
    });

    const result = await response.json();

    if (result.choices && result.choices[0]?.message?.content) {
      return result.choices[0].message.content.trim();
    } else if (result.error) {
      console.error("HF Hata Detayı:", result.error);
      return "Model uyanıyor veya meşgul, birkaç saniye sonra tekrar dene!";
    }
  } catch (err) {
    console.error("Bağlantı Hatası:", err);
  }

  return "yü erzurum soğukmuş.";
}

async function sendMessage() {
  if (isWaiting) return;

  const input = document.getElementById("userInput");
  if (!input) return;

  const messageText = input.value.trim();
  if (messageText === "") return;

  appendMessage(messageText, "user-message");
  input.value = "";
  
  isWaiting = true;
  const sendBtn = document.getElementById("sendBtn");
  if (sendBtn) sendBtn.disabled = true;

  const typingIndicator = createTypingIndicator();
  const messagesContainer = document.getElementById("chatMessages");
  if (messagesContainer) {
    messagesContainer.appendChild(typingIndicator);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  try {
    const aiResponse = await queryHuggingFace(messageText);
    typingIndicator.remove();
    appendMessage(aiResponse, "ai-message");
  } catch (error) {
    typingIndicator.remove();
    appendMessage("karpuz kabuğu denize düştü, bağlantı koptu.", "ai-message");
  }

  isWaiting = false;
  if (sendBtn) sendBtn.disabled = false;
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
  if (!messagesContainer) return;

  const messageElement = document.createElement("div");
  messageElement.classList.add("message", className);
  messageElement.textContent = text;
  
  messagesContainer.appendChild(messageElement);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

document.addEventListener("DOMContentLoaded", function() {
  const sendBtn = document.getElementById("sendBtn");
  const userInput = document.getElementById("userInput");

  if (sendBtn) {
    sendBtn.addEventListener("click", sendMessage);
  }

  if (userInput) {
    userInput.addEventListener("keypress", function(e) {
      if (e.key === "Enter") sendMessage();
    });
  }
});
