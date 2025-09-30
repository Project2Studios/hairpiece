import { GoogleGenAI } from '@google/genai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error('VITE_GEMINI_API_KEY is not set in environment variables');
}

const genAI = new GoogleGenAI({ apiKey: API_KEY });

export async function generateHairstyleImage(
  imageFile: File,
  hairstyle: string
): Promise<string> {
  try {
    // Convert image to base64
    const base64Image = await fileToBase64(imageFile);

    // Use Gemini 2.5 Flash Image model (nano-banana) for image editing
    const model = genAI.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: [
        {
          inlineData: {
            mimeType: imageFile.type,
            data: base64Image,
          },
        },
        {
          text: `IMPORTANT: Only modify the hair. Do not change anything else.

Change the hair to: ${hairstyle}

STRICT REQUIREMENTS:
- ONLY edit the hair/hairstyle - nothing else
- Keep the person's face COMPLETELY unchanged (eyes, nose, mouth, facial structure, expression, skin, makeup)
- Keep the background COMPLETELY unchanged
- Keep clothing COMPLETELY unchanged
- Keep body position and pose COMPLETELY unchanged
- If only changing hair color: keep the EXACT same hairstyle, length, texture, and shape - ONLY change the color
- If changing hairstyle: keep the person's face, skin tone, and all facial features EXACTLY as they appear in the original photo
- The edit should be seamless and natural-looking
- Preserve the original photo quality and lighting`,
        },
      ],
    });

    const response = await model;

    // Extract the generated image from the response
    const imagePart = response.candidates?.[0]?.content?.parts?.find(
      (part: any) => part.inlineData
    );

    if (!imagePart?.inlineData?.data) {
      throw new Error('No image generated in response');
    }

    // Return the base64 image data as a data URL
    return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
  } catch (error) {
    console.error('Error generating image:', error);
    throw new Error(
      `Failed to generate image: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}