import { GoogleGenAI, VideoGenerationReferenceType } from "@google/genai";
import { UploadedAsset, VideoResult } from "../types";

// Helper to check if API key is selected
export const checkApiKey = async (): Promise<boolean> => {
  if (window.aistudio && window.aistudio.hasSelectedApiKey) {
    return await window.aistudio.hasSelectedApiKey();
  }
  return false;
};

// Helper to open key selection
export const promptApiKey = async (): Promise<void> => {
  if (window.aistudio && window.aistudio.openSelectKey) {
    await window.aistudio.openSelectKey();
  }
};

export const generateCopilofVideo = async (
  leaderAsset: UploadedAsset,
  logoAsset: UploadedAsset,
  promptText: string
): Promise<string> => {
  
  // 1. Initialize AI with environment key (injected by the platform)
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // 2. Prepare reference images
  // Veo supports up to 3 reference images. We use the leader and the logo.
  const referenceImagesPayload = [
    {
      image: {
        imageBytes: leaderAsset.base64,
        mimeType: leaderAsset.mimeType,
      },
      referenceType: VideoGenerationReferenceType.ASSET,
    },
    {
      image: {
        imageBytes: logoAsset.base64,
        mimeType: logoAsset.mimeType,
      },
      referenceType: VideoGenerationReferenceType.ASSET,
    }
  ];

  // 3. Start Generation
  // Model 'veo-3.1-generate-preview' is required for referenceImages
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-generate-preview',
    prompt: promptText,
    config: {
      numberOfVideos: 1,
      referenceImages: referenceImagesPayload,
      resolution: '720p', // Required for reference images feature
      aspectRatio: '16:9'
    }
  });

  // 4. Poll for completion
  // Video generation takes time, so we must poll the operation
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5 seconds
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  // 5. Extract Result
  const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
  
  if (!videoUri) {
    throw new Error("Video generation completed but no URI was returned.");
  }

  // The URI requires the API key appended for access
  return `${videoUri}&key=${process.env.API_KEY}`;
};
