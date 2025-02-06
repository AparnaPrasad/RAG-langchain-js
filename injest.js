import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { PineconeStore } from "@langchain/pinecone";

import dotenv from 'dotenv'
dotenv.config()


// Step 1: Load and split the PDF
async function loadAndSplitPDF(filePath) {
    const loader = new PDFLoader(filePath);
    const documents = await loader.load();
  
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
  
    const chunks = await splitter.splitDocuments(documents);
    console.log(`Split the document into ${chunks.length} chunks.`);
    return chunks;
}


async function uploadToPinecone(filePath) {

    // Step 1: Load the PDF and split it into chunks
    const docs = await loadAndSplitPDF(filePath);

    //Step 2: Initialize OpenAI Embeddings

    const embeddings = new OpenAIEmbeddings({
        openAIApiKey: process.env.OPENAI_API_KEY, // Replace with your OpenAI API key
    });

    //Step 3: Initialize the pinecone vectorStore
    const pinecone = new PineconeClient();
    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);

   // Step 4: Upload to store
    const vectorStore = await PineconeStore.fromDocuments(docs, embeddings, {
        pineconeIndex: pineconeIndex,
    });
}

// Main execution
(async () => {
  
    try {
      await uploadToPinecone('./ReAct LLM.pdf');
    } catch (error) {
      console.error('Error uploading data:', error);
    }
})();