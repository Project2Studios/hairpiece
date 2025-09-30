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
          text: `Change the hairstyle of the person in the photo to ${hairstyle}. Maintain their exact facial features, skin tone, and face shape. The hairstyle should look natural and professionally styled.`,
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