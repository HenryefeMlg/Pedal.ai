// Token metin (string) olduğu için tırnak içinde olmalıdır
const HF_TOKEN = "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";

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
