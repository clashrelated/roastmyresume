 import OpenAI from "openai";
// Import dotenv for loading environment variables from .env file
import dotenv from "dotenv";

// Initialize dotenv to load environment variables
// This loads API keys and other sensitive data from a .env file
dotenv.config();

// Initialize OpenAI client with API key from environment variables
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function roastResume(resumeText: string): Promise<string> {
  try {
    const prompt = `You are a savage but witty career coach. Roast this resume with sarcastic humor. Make it funny but not offensive. Format it like a snarky tweet or stand-up comedy joke. Here's the resume: ${resumeText}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
    });

    return (
      response.choices[0].message.content ||
      "Could not generate a roast. Please try again."
    );
  } catch (error: any) {
    console.error("Error roasting resume:", error);
    // Check for specific API errors
    if (error && error.code === "insufficient_quota") {
      throw new Error(
        "OpenAI API quota exceeded. Please try again later or contact support for assistance.",
      );
    } else if (error && error.status === 429) {
      throw new Error(
        "Too many requests to AI service. Please try again in a few moments.",
      );
    } else {
      throw new Error(
        "Failed to generate resume roast. Please try again later.",
      );
    }
  }
}

export interface ResumeAnalysis {
  scores: {
    clarity: number;
    impact: number;
    formatting: number;
    relevance: number;
    atsCompatibility: number;
  };
  feedback: string;
}

export async function analyzeResume(
  resumeText: string,
): Promise<ResumeAnalysis> {
  try {
    const prompt = `You are a professional career advisor. Give constructive feedback on this resume. Score it in the following categories from 1–10:
1. Clarity
2. Impact
3. Formatting
4. Relevance
5. ATS compatibility

Then write a paragraph of actionable suggestions.

Return the scores as JSON and feedback as text.

Here's the resume: ${resumeText}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 800,
      response_format: { type: "json_object" },
    });

    const content =
      response.choices[0].message.content ||
      '{"scores":{"clarity":5,"impact":5,"formatting":5,"relevance":5,"atsCompatibility":5},"feedback":"Could not analyze the resume. Please try again."}';

    try {
      const result = JSON.parse(content);
      return {
        scores: {
          clarity: result.scores?.clarity || 5,
          impact: result.scores?.impact || 5,
          formatting: result.scores?.formatting || 5,
          relevance: result.scores?.relevance || 5,
          atsCompatibility: result.scores?.atsCompatibility || 5,
        },
        feedback:
          result.feedback ||
          "Could not generate analysis feedback. Please try again.",
      };
    } catch (parseError) {
      console.error("Error parsing OpenAI response:", parseError);
      // If JSON parsing fails, extract scores and feedback using regex
      const scores = {
        clarity: extractScore(content, "Clarity") || 5,
        impact: extractScore(content, "Impact") || 5,
        formatting: extractScore(content, "Formatting") || 5,
        relevance: extractScore(content, "Relevance") || 5,
        atsCompatibility: extractScore(content, "ATS compatibility") || 5,
      };

      // The feedback is likely the last paragraph
      const feedbackMatch = content.match(/suggestions\.?\s*([^{}\[\]]+)$/);
      const feedback = feedbackMatch
        ? feedbackMatch[1].trim()
        : "Could not extract feedback. Please try again.";

      return { scores, feedback };
    }
  } catch (error: any) {
    console.error("Error analyzing resume:", error);
    // Check for specific API errors
    if (error && error.code === "insufficient_quota") {
      throw new Error(
        "OpenAI API quota exceeded. Please try again later or contact support for assistance.",
      );
    } else if (error && error.status === 429) {
      throw new Error(
        "Too many requests to AI service. Please try again in a few moments.",
      );
    } else {
      throw new Error("Failed to analyze resume. Please try again later.");
    }
  }
}

export async function rewriteResume(
  resumeText: string,
  options?: { preserveFormat?: boolean; originalFormat?: string },
): Promise<string> {
  try {
    const systemPrompt = options?.preserveFormat
      ? "You are a professional resume writer. Rewrite the given resume to be more professional and impactful while maintaining accuracy. IMPORTANT: Preserve the exact formatting, spacing, and structure of the original text. Only replace the content while keeping all formatting intact."
      : "You are a professional resume writer. Rewrite the given resume to be more professional and impactful while maintaining accuracy.";

    const prompt = `${systemPrompt}

Here's the resume: ${resumeText}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1500,
    });

    return (
      response.choices[0].message.content ||
      "Could not rewrite the resume. Please try again."
    );
  } catch (error: any) {
    console.error("Error rewriting resume:", error);
    // Check for specific API errors
    if (error && error.code === "insufficient_quota") {
      throw new Error(
        "OpenAI API quota exceeded. Please try again later or contact support for assistance.",
      );
    } else if (error && error.status === 429) {
      throw new Error(
        "Too many requests to AI service. Please try again in a few moments.",
      );
    } else {
      throw new Error("Failed to rewrite resume. Please try again later.");
    }
  }
}

// Helper function to extract scores if JSON parsing fails
function extractScore(text: string, category: string): number | null {
  const regex = new RegExp(`${category}[^0-9]*([1-9]|10)`, "i");
  const match = text.match(regex);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  return null;
}
