async function queryHuggingFace(userMessage) {
  // Hugging Face'in en güncel ve hızlı çalışan ücretsiz modellerinden biri
  const MODEL_URL = "https://api-inference.huggingface.co/models/Qwen/Qwen2.5-Coder-32B-Instruct";
  
  const systemPrompt = "Sen 'Pedal AI' adında aşırı absürt, saçma, mantıksız ve devrik yanıtlar veren komik bir yapay zekasın. Türkçe konuş ama aşırı absürt olsun. arada gerektiğinde Çok kısa cevap ver. arada anlamsız bişey söyle, mesela banane bundan fala. çoğonlukla yü de. rica etseler bile mesela bana ahmet de derseler, yü de.";

  const response = await fetch(MODEL_URL, {
    headers: {
      Authorization: `Bearer ${HF_TOKEN}`,
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({
      inputs: `<|im_start|>system\n${systemPrompt}<|im_end|>\n<|im_start|>user\n${userMessage}<|im_end|>\n<|im_start|>assistant\n`,
      parameters: {
        max_new_tokens: 50,
        temperature: 0.9
      }
    }),
  });

  const result = await response.json();

  if (Array.isArray(result) && result[0]?.generated_text) {
    let text = result[0].generated_text;
    let cleanText = text.split("<|im_start|>assistant\n")[1] || text;
    return cleanText.replace(/<\|im_end\|>/g, "").trim();
  } else if (result.error) {
    console.error("HF Hata Detayı:", result.error);
    return "Model uyanıyor, birkaç saniye sonra tekrar dene!";
  }

  return "yü erzurum soğukmuş.";
}
