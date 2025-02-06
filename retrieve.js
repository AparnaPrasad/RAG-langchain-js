
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
import * as hub from "langchain/hub";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents"
import { createRetrievalChain } from "langchain/chains/retrieval";

import dotenv from 'dotenv'
dotenv.config()

const formatDocs = (docs) => "\n\n".join(docs.map(docs.pageContent))

// Query Pinecone with LangChain
async function queryPinecone(indexName, query) {
    let result;
    const llm = new ChatOpenAI({
        modal: "gpt-4",
        temperature: 0,
    })
    
    query = "What is React?"

    // Query without RAG by just passing query to llm
    const prompt = PromptTemplate.fromTemplate(query)
    const chain =  prompt.pipe(llm);
   //result = await chain.invoke()
   //console.log("result before RAG \n\n", result.content)

    // Query with RAG, llm has context of the pdf document
    const embeddings = new OpenAIEmbeddings({
        openAIApiKey: process.env.OPENAI_API_KEY, // Replace with your OpenAI API key
    });

    const pinecone = new PineconeClient();
    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);

   const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
        pineconeIndex,
        // Maximum number of batch requests to allow at once. Each batch is 1000 vectors.
        maxConcurrency: 5,
    });


    // Use retrieval-qa-chat  prompt from langchain hub
    const retrievalQAprompt = await hub.pull("langchain-ai/retrieval-qa-chat");

    if (!retrievalQAprompt) {
        console.log("Error:")
    }

    console.log("retrievalQAprompt", retrievalQAprompt)
    const combineDocs = await createStuffDocumentsChain(llm, retrievalQAprompt)
    const retrivalChain = await createRetrievalChain(vectorStore.asRetriever(), combineDocs)
    result = await retrivalChain.invoke({"input": query})
    console.log("result after RAG (retrieval-qa-chat prompt):", result);


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

    //const res = await ragChain.invoke(query)
    //console.log("Result after own RAG", res)


}
// Main execution
(async () => {
    const userQuery = 'Explain the purpose of the documentation.';
  
    try {
      await queryPinecone(userQuery);
    } catch (error) {
      console.error('Error querying data:', error);
    }
  })();