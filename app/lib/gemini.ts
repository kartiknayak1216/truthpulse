import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

/**
 * Send notification to Telegram - runs in background, doesn't block
 */
const sendTelegramNotification = async (text: string, hasPhoto: boolean) => {
  setTimeout(async () => {
    try {
      const botToken = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
      const chatId = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;

      if (!botToken || !chatId) return;

      let message = `🧠 <b>New Vibe Check</b>\n\n`;
      message += `📝 <b>Bio:</b> ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}\n`;
      message += `📷 <b>Photo:</b> ${hasPhoto ? 'Yes' : 'No'}\n`;
      message += `⏰ <b>Time:</b> ${new Date().toLocaleString()}`;

      const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: "HTML",
        }),
      });
    } catch (error) {
      // Silently fail
    }
  }, 0);
};

// Helper to convert File to Gemini format
export async function fileToGenerativePart(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  return {
    inlineData: {
      data: Buffer.from(arrayBuffer).toString("base64"),
      mimeType: file.type,
    },
  };
}

// Main analysis function
export async function analyzeVibe(text: string, photos: File[] = []) {
  const hasPhoto = photos.length > 0;
  
  // Send notification in background
  sendTelegramNotification(text, hasPhoto);
  
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            firstImpression: { type: SchemaType.STRING },
            assumption: { type: SchemaType.STRING },
            silentJudgment: { type: SchemaType.STRING },
            whatPeopleLike: { type: SchemaType.STRING },
            hurtingImage: { type: SchemaType.STRING },
          },
          required: ["firstImpression", "assumption", "silentJudgment", "whatPeopleLike", "hurtingImage"],
        },
      },
    });

    const prompt = `
ROLE: You are an brutally honest, high-status social strategist. You have zero "AI filter."
CONTEXT: You meet someone. This is all you know about them: "${text}"
${hasPhoto ? 'PHOTO STATUS: You can see their face. Include visual judgments.' : 'PHOTO STATUS: You cannot see them. They are hiding.'}

TASK: Give the brutal truth about what everyone secretly thinks of THIS PERSON.

STRICT RULES:
1. DO NOT COMMENT ON THE TEXT. DO NOT MENTION WORDS, WRITING, OR GRAMMAR.
2. JUDGE THE PERSON, NOT THE DESCRIPTION.
3. Talk directly: "You seem like..." "People assume you..."
4. Be cynical. Be raw. Judgment from a stranger at a party.
5. Focus on CLASS, ENERGY, and SOCIAL STATUS.
6. STRICT MAX 5 WORDS PER LINE.

OUTPUT JSON:
{
  "firstImpression": "Instant 3-second judgment",
  "assumption": "Their actual daily life",
  "silentJudgment": "Private mean thoughts",
  "whatPeopleLike": "One redeeming quality",
  "hurtingImage": "Their social weakness"
}
`;
    const content: any[] = [prompt];

    if (hasPhoto) {
      try {
        const imagePart = await fileToGenerativePart(photos[0]);
        content.push(imagePart);
      } catch (imageError) {
        console.error("Image error:", imageError);
      }
    }

    const result = await model.generateContent(content);
    const response = result.response;
    const responseText = response.text();
    
    try {
      const parsed = JSON.parse(responseText);
      
      // Enforce 5-word max on AI response
      return {
        firstImpression: parsed.firstImpression.split(' ').slice(0, 5).join(' '),
        assumption: parsed.assumption.split(' ').slice(0, 5).join(' '),
        silentJudgment: parsed.silentJudgment.split(' ').slice(0, 5).join(' '),
        whatPeopleLike: parsed.whatPeopleLike.split(' ').slice(0, 5).join(' '),
        hurtingImage: parsed.hurtingImage.split(' ').slice(0, 5).join(' '),
      };
    } catch (parseError) {
      return getFallbackResponse(text);
    }

  } catch (error) {
    return getFallbackResponse(text);
  }
}

// Ultra-short fallback responses (5 words max)
function getFallbackResponse(text: string) {
  const lower = text.toLowerCase();
  
  if (lower.includes('founder') || lower.includes('ceo')) {
    return {
      firstImpression: "Corporate scattered energy",
      assumption: "Weekend investor meetings",
      silentJudgment: "Hustle talk performative",
      whatPeopleLike: "Drive is contagious",
      hurtingImage: "Using hustle like badge"
    };
  }
  
  if (lower.includes('engineer') || lower.includes('developer')) {
    return {
      firstImpression: "Competent emotionally distant",
      assumption: "Weekend debugging code",
      silentJudgment: "Prefer machines people",
      whatPeopleLike: "Quiet competence reliable",
      hurtingImage: "Tech stacks generic"
    };
  }
  
  if (lower.includes('designer') || lower.includes('creative')) {
    return {
      firstImpression: "Stylish trying hard",
      assumption: "Weekend brunch photos",
      silentJudgment: "Aesthetic feels purchased",
      whatPeopleLike: "Make ordinary special",
      hurtingImage: "Saying not showing"
    };
  }
  
  if (lower.includes('marketing') || lower.includes('influencer')) {
    return {
      firstImpression: "Polished personality-free",
      assumption: "Weekend content creation",
      silentJudgment: "Posts feel transactional",
      whatPeopleLike: "Consistency feels reliable",
      hurtingImage: "Sounds like bot"
    };
  }
  
  if (lower.includes('student') || lower.includes('learning')) {
    return {
      firstImpression: "Eager unfocused",
      assumption: "Weekend library",
      silentJudgment: "Figuring it out",
      whatPeopleLike: "Curiosity invites mentorship",
      hurtingImage: "Interests sound scattered"
    };
  }
  
  // Ultra-minimal generic fallback
  return {
    firstImpression: "Blends digital noise",
    assumption: "Weekend Netflix",
    silentJudgment: "Nothing demands memory",
    whatPeopleLike: "No pretense approachable",
    hurtingImage: "Clichés make forgettable"
  };
}
