// Ensure 'node-fetch' is installed: npm install node-fetch
import fetch from "node-fetch";
import env from "../env/env.config.js";

/**
 * Generates a concise "about" description (around 80 words) for a given institute object
 * using the Gemini API.
 *
 * @param {Object} instituteData - The institute object with details like name, category, state, etc.
 * Example:
 * {
 * "category": "PM Vidyalaxmi",
 * "aisheCode": "U-0589",
 * "name": "Visva Bharati, Shantiniketan",
 * "state": "West Bengal",
 * "yearOfEstablishment": "1921",
 * "location": "Rural",
 * "type": "Central University",
 * "management": "Central Government"
 * }
 * @returns {Promise<string|null>} A promise that resolves with the generated "about" text string.
 * Returns `null` if there's an error during the API call or if no description can be generated.
 */
export async function generateInstituteAbout(instituteData) {
  // Construct a comprehensive prompt based on the available institute data.
  // We emphasize key details and request a concise, engaging summary.
  let prompt = `Generate a concise "about" description (around 80 words) for the following educational institute.
Highlight its key characteristics based on the provided details.

Institute Details:
`;

  // Iterate over the instituteData object to include all relevant fields in the prompt,
  // skipping any null or undefined values.
  for (const key in instituteData) {
    if (instituteData[key] !== null && instituteData[key] !== undefined) {
      prompt += `- ${key}: ${instituteData[key]}\n`;
    }
  }

  prompt += `\nEnsure the description is engaging and informative.`;

  // Define the payload for the Gemini API request.
  const payload = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      // You can adjust these parameters for different response characteristics:
      // temperature: Controls randomness. Lower for more deterministic, higher for more creative. (0.0 - 1.0)
      // topP: Nucleus sampling. Limits tokens to a cumulative probability. (0.0 - 1.0)
      // topK: Top-k sampling. Considers only the top 'k' most likely tokens.
      // For concise, informative text, default values or slight adjustments are usually good.
      // temperature: 0.7,
      // topP: 0.95,
      // topK: 40,
    },
  };

  // The API key for accessing the Gemini API.
  // If running within a Canvas environment, `__api_key` will be automatically provided.
  // In a standalone Node.js environment, you should replace "" with your actual API key
  // or load it from environment variables (e.g., `process.env.GEMINI_API_KEY`).
  const apiKey = env.google.gemini.apiKey; // Canvas will automatically provide the API key at runtime

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  try {
    // Make the POST request to the Gemini API.
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    // Check if the HTTP response was successful.
    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `API request failed with status ${response.status}: ${errorText}`
      );
      return null; // Return null on API error
    }

    // Parse the JSON response from the API.
    const result = await response.json();

    // Validate the structure of the API response and extract the generated text.
    if (
      result.candidates &&
      result.candidates.length > 0 &&
      result.candidates[0].content &&
      result.candidates[0].content.parts &&
      result.candidates[0].content.parts.length > 0
    ) {
      return result.candidates[0].content.parts[0].text;
    } else {
      console.warn(
        "Unexpected API response structure or no content:",
        JSON.stringify(result, null, 2)
      );
      return null; // Return null if content is not found in expected structure
    }
  } catch (error) {
    // Catch any network or other unexpected errors during the fetch operation.
    console.error("Error calling Gemini API:", error);
    return null; // Return null on error
  }
}

console.log(
  await generateInstituteAbout({
    category: "Standalone",
    aisheCode: "S-26174",
    name: "GOVERNMENT POLYTECHNIC KOLHAR",
    state: "Karnataka",
    district: "Vijayapura",
    website: null,
    yearOfEstablishment: "2025",
    location: "Urban",
    type: "Technical/Polytechnic",
    management: "State Government",
    universityName: null,
    universityType: null,
    administrativeMinistry: null,
    universityId: null,
    imageUrl: null,
    instituteId: "8bab35ea-a735-4165-bb5b-aed5a50066c8",
  })
);
