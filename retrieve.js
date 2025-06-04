
import { ChatOpenAI } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import {
    RunnableSequence,
    RunnablePassthrough,
} from "@langchain/core/runnables";
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";
import { PromptTemplate } from "@langchain/core/prompts";
import { formatDocumentsAsString } from "langchain/util/document";
import { StringOutputParser } from "@langchain/core/output_parsers";


import dotenv from 'dotenv'
dotenv.config()

// Query Pinecone with LangChain
async function queryPinecone(query) {
    let result;
    const llm = new ChatOpenAI({
        modal: "gpt-4",
        temperature: 0,
    })
    
    // Query without RAG by just passing query to llm
    const prompt = PromptTemplate.fromTemplate(query)
    const chain =  prompt.pipe(llm);
   
    result = await chain.invoke(query)
    console.log("\nResult before RAG:\n", result.content)

    
    const embeddings = new OpenAIEmbeddings({
        openAIApiKey: process.env.OPENAI_API_KEY, // Replace with your OpenAI API key
    });

    const pinecone = new PineconeClient();
    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);

    // initialize vector store
    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
          pineconeIndex,
          // Maximum number of batch requests to allow at once. Each batch is 1000 vectors.
          maxConcurrency: 5,
      });

    // Use custom prompt
    const template = `Use the following peices of context to answer the question at the end. 
    If you dont know the answer, just say you dont know. Do not make up an answer. Use three sentences maximum
    and keep the answer concise. Always say "thanks for asking!" at the end.
    
    context: {context}
    
    Question: {question}
    
    Helpful Answer:`

    const customRagPrompt = PromptTemplate.fromTemplate(template)
    const ragChain = RunnableSequence.from([
        {
          context: vectorStore.asRetriever().pipe(formatDocumentsAsString),
          question: new RunnablePassthrough(),
        },
        customRagPrompt,
        llm,
        new StringOutputParser(),
      ]);

    // Result after RAG
    const res = await ragChain.invoke(query)
    console.log("\n\nResult after RAG:\n", res)


}
// Main execution
(async () => {
    const userQuery = 'What is attention?';
  
    try {
      await queryPinecone(userQuery);
    } catch (error) {
      console.error('Error querying data:', error);
    }
  })();