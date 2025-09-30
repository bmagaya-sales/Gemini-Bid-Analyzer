import { GoogleGenAI, Type } from "@google/genai";
import { BidAnalysis } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const bidAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    solicitationDetails: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        agency: { type: Type.STRING },
        summary: { type: Type.STRING },
      },
       required: ['title', 'agency', 'summary'],
    },
    relevanceAnalysis: {
      type: Type.OBJECT,
      properties: {
        isRelevant: { type: Type.BOOLEAN },
        reason: { type: Type.STRING },
      },
      required: ['isRelevant', 'reason'],
    },
    keyRequirements: {
      type: Type.OBJECT,
      properties: {
        eligibility: { type: Type.ARRAY, items: { type: Type.STRING } },
        objectives: { type: Type.ARRAY, items: { type: Type.STRING } },
        lineItems: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "The name of the equipment, supply, or service." },
                    quantity: { type: Type.STRING, description: "The quantity required. Can be a number or text like 'As needed'." },
                    description: { type: Type.STRING, description: "A brief description of the item." },
                    partNumber: { type: Type.STRING, description: "The manufacturer part number, if available." },
                },
                required: ['name'],
            }
        },
        productFit: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING },
            details: { type: Type.STRING },
            isCarriedBrand: { type: Type.BOOLEAN },
          },
          required: ['type', 'details', 'isCarriedBrand'],
        },
      },
      required: ['eligibility', 'objectives', 'lineItems', 'productFit'],
    },
    submissionInstructions: {
      type: Type.OBJECT,
      properties: {
        deadline: { type: Type.STRING },
        formattingAndDelivery: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
      },
      required: ['deadline', 'formattingAndDelivery'],
    },
    financials: {
      type: Type.OBJECT,
      properties: {
        budgetRange: { type: Type.STRING },
        contractTerm: { type: Type.STRING },
      },
      required: ['budgetRange', 'contractTerm'],
    },
    contactAndCompliance: {
      type: Type.OBJECT,
      properties: {
        pointOfContact: { type: Type.STRING },
        complianceRequirements: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
      },
      required: ['pointOfContact', 'complianceRequirements'],
    },
    flags_for_human_review: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
  },
   required: [
    'solicitationDetails', 
    'relevanceAnalysis', 
    'keyRequirements', 
    'submissionInstructions', 
    'financials', 
    'contactAndCompliance', 
    'flags_for_human_review'
  ],
};

const createBasePrompt = (): string => `
  You are an expert Government Bid Analyst. Your primary function is to serve as an intelligent filtering layer and an insight extraction tool. 
  Your task is to transform the raw, unstructured government bid solicitation data provided into a structured, deterministic JSON output.
  Do not invent, infer, or paraphrase information. Your output must be directly extracted from the source text.
  
  CRITICAL RULES:
  1.  **Human Validation is Mandatory**: If you encounter conflicting information (e.g., two different submission deadlines), you MUST NOT choose one. Extract both pieces of information into the relevant field and add a detailed explanation to the 'flags_for_human_review' array.
  2.  **No Hallucinations**: If information for a specific field is not present in the source document, you MUST use 'null' for string/boolean fields or an empty array '[]' for array fields.
  3.  **No Legal Interpretation**: Extract the names of compliance documents and requirements verbatim. Flag any ambiguous clauses for human review.
  4.  **Relevance Analysis**: Your primary focus is on bids matching medical/dental/hospital equipment and supplies. Relevant NAICS codes include 33911, 339112, 423450, 621210. Mark bids from unrelated industries (e.g., construction) as not relevant.
  5.  **Line Item Extraction**: Identify all specific equipment, supplies, or services being requested. For each item, extract its name, quantity, a brief description, and any part/model number. Structure this as an array of objects in the 'lineItems' field. If a detail isn't specified for an item, use null.
  6.  **Product Fit**: For 'productFit.type', use one of these exact values: 'brand_name_or_equal', 'specific_brand', or 'unspecified'. For 'isCarriedBrand', assume you do not carry any specific brands mentioned and return 'false' if a specific brand is named, otherwise return 'null'.
  7.  **Expired Bids**: If the submission deadline has passed or is today, add a flag to 'flags_for_human_review' noting the urgency or expiration.

  Analyze the following bid text or document and return a single, valid JSON object matching the provided schema.
`;

export const analyzeBid = async (content: { text?: string; file?: { mimeType: string; data: string } }): Promise<BidAnalysis> => {
  if (!content.text?.trim() && !content.file) {
    throw new Error("Bid text or file cannot be empty.");
  }
  
  if (!process.env.API_KEY) {
    throw new Error("API key is not configured.");
  }

  const basePrompt = createBasePrompt();
  let contents;

  if (content.text) {
    contents = `${basePrompt}\n\n--- BID TEXT ---\n${content.text}\n--- END BID TEXT ---`;
  } else if (content.file) {
    contents = {
      parts: [
        { text: basePrompt },
        {
          inlineData: {
            mimeType: content.file.mimeType,
            data: content.file.data,
          },
        },
      ],
    };
  } else {
    throw new Error("No content provided to analyze.");
  }
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: contents,
    config: {
      responseMimeType: "application/json",
      responseSchema: bidAnalysisSchema,
    },
  });

  const jsonText = response.text.trim();
  try {
    return JSON.parse(jsonText) as BidAnalysis;
  } catch (e) {
    console.error("Failed to parse JSON response:", jsonText);
    throw new Error("The AI returned an invalid data structure. Please try again.");
  }
};