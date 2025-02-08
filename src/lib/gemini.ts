import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyC7LBGoSHpyJL0LAdxjzKaX-S-A7i9LCUM");

const knowledgeBase = `
KABARAK UNIVERSITY TVET PROGRAMS:
- Diploma Programs (Entry: KCSE C-, Duration: 3-7 terms, Tuition: KES 23,000/semester):
  * Information & Communication Technology
  * Banking and Finance
  * Entrepreneurship Development
  * Nutrition and Dietetics Management
  * Tourism Management
  * Computer Science
  * Electrical and Electronics Engineering
  * Building and Civil Engineering
  * Mechanical Engineering
  * Automotive Engineering

- Certificate Programs (Entry: KCSE D plain, Duration: 2-3 terms, Tuition: KES 20,000/semester):
  * Information & Communication Technology
  * Banking and Finance
  * Entrepreneurship Development
  * Secretarial Studies
  * Tourism Management
  * Engineering Programs (Electrical, Building, Mechanical, Automotive)

MERU UNIVERSITY TVET PROGRAMS:
- Diploma Programs (Entry: KCSE C- or equivalent):
  * Animal Health and Production
  * Agriculture
  * Horticultural Production
  * Business Management
  * Information Technology
  * Electrical Engineering

- Certificate Programs:
  * Animal Health and Production (Entry: KCSE C-)
  * Agriculture (Entry: KCSE D plain)

PWANI UNIVERSITY TVET PROGRAMS:
- Diploma Programs (Entry: KCSE C-, Duration: 2 years, Tuition: KES 91,400/year):
  * Agricultural Extension
  * Business Management
  * Information Technology

- Certificate Programs (Entry: KCSE D+, Duration: 2 years, Tuition: KES 56,400/year):
  * Community and Public Health
  * General Agriculture

APPLICATION PROCESSES:
- Multiple intakes: January, May, September
- Online applications available
- Application fees range from KES 500-1000
- Required documents: KCSE certificate/result slip
`;

export async function getGeminiResponse(prompt: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const systemContext = `You are an expert educational advisor specializing in Kenyan tertiary institutions and universities, with specific knowledge about TVET programs. Use the following information as your primary reference for questions about these institutions and their programs:

${knowledgeBase}

When answering questions:
1. If the question relates to programs, requirements, or costs mentioned in the knowledge base, use that information FIRST
2. Be specific about entry requirements, duration, and costs when available
3. Mention which institution offers the program being discussed
4. Include information about application processes when relevant
5. If information isn't in the knowledge base, clearly state that and provide general guidance based on your knowledge of Kenyan education

Your role is to provide accurate, helpful information about:
- Specific TVET programs and their requirements
- Admission processes and requirements
- Program durations and costs
- Career prospects
- Application procedures
`;

    const fullPrompt = `${systemContext}\n\nUser query: ${prompt}`;
    
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return "I apologize, but I'm having trouble processing your request at the moment. Please try again.";
  }
}