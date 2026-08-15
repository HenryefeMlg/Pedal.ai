let isWaiting = false;

// Oturum veya Key Gerektirmeyen Doğrudan AI Bağlantısı
async function queryAI(userMessage) {
  const systemPrompt = "Sen 'Pedal AI' adında aşırı absürt, saçma, mantıksız ve devrik yanıtlar veren bir yapay zekasın. Türkçe konuş ama aşırı anlamsız ve isteksiz olsun. Arada gerektiğinde çok kısa cevap ver. Arada anlamsız bir şey söyle, mesela banane bundan falan. Çoğunlukla yü de. Rica etseler bile mesela bana ahmet de derseler, yü de.";

  const promptText = `${systemPrompt}\n\nKullanıcı: ${userMessage}\nPedal AI:`;
  const encodedPrompt = encodeURIComponent(promptText);

  try {
    const response = await fetch(`https://text.pollinations.ai/${encodedPrompt}?model=openai&cache=false`);

    if (!response.ok) {
      throw new Error("Bağlantı hatası");
    }

    const text = await response.text();
    return text.trim();
  } catch (err) {
    console.error("AI Hatası:", err);
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
    const aiResponse = await queryAI(messageText);
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
