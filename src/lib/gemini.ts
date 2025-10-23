import { GoogleGenerativeAI } from "@google/generative-ai";
import { getKnowledgeEntries, KnowledgeEntry } from './knowledgeBase';

const genAI = new GoogleGenerativeAI("AIzaSyC7LBGoSHpyJL0LAdxjzKaX-S-A7i9LCUM");

export async function getGeminiResponse(prompt: string) {
  try {
    // Fetch relevant knowledge base entries
    const allEntries = await getKnowledgeEntries();
    
    // Simple keyword matching to find relevant entries
    const relevantEntries = allEntries.filter(entry => {
      const searchText = `${entry.topic} ${entry.content}`.toLowerCase();
      const queryWords = prompt.toLowerCase().split(' ');
      return queryWords.some(word => searchText.includes(word));
    });

    // Create context from relevant entries
    const context = relevantEntries.map(entry => 
      `[${entry.category.toUpperCase()}] ${entry.topic}:\n${entry.content}`
    ).join('\n\n');

    // Create the prompt with context and specific instructions
    const fullPrompt = `You are a friendly and knowledgeable educational advisor specializing in Kenyan tertiary education. Your role is to help students make informed decisions about their education and career paths.

Key Instructions:
1. Be conversational and empathetic in your responses
2. Focus on Kenyan universities, TVET institutions, and educational pathways
3. Provide practical advice based on the Kenyan education system
4. If specific information isn't in the knowledge base, use your understanding of Kenyan education to give general guidance
5. Stay focused on academic and career-related topics
6. Consider both traditional university paths and technical/vocational options (TVET)

Knowledge Base Context (if relevant):
${context}

Student Question: ${prompt}

Please provide a helpful, friendly, and informative response. If the question is about specific courses or institutions, try to include both university and TVET options when applicable. Remember to be encouraging and supportive while maintaining accuracy in your advice about Kenyan education.`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return "I apologize, but I'm having trouble processing your request at the moment. Please try again.";
  }
}