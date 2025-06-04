# RAG Application with LangChain.js

This project demonstrates the implementation of a Retrieval Augmented Generation (RAG) application utilizing [LangChain.js](https://js.langchain.com/). RAG combines large language models (LLMs) with external data sources to enhance the generation of contextually relevant responses.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Output](#output)

## Introduction

Retrieval Augmented Generation (RAG) is a technique that enhances the capabilities of LLMs by incorporating external data during the generation process. This approach allows for more accurate and contextually relevant outputs, especially when dealing with information not present in the model's original training data.

In this project, I leverage LangChain.js to build a RAG application that retrieves pertinent information from a specified dataset and uses it to generate informed responses.

## Features

- **Data Loading**: Utilizes document loaders to ingest data from various sources.
- **Text Splitting**: Implements text splitters to manage large documents efficiently.
- **Vector Storage**: Employs vector databases for efficient similarity searches.
- **LLM Integration**: Integrates with large language models to generate responses based on retrieved data.

## Installation

To set up the project locally, follow these steps:

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/AparnaPrasad/RAG-langchain-js.git
   cd RAG-langchain-js
   ```

2. **Install Dependencies**:

   Ensure you have [Node.js](https://nodejs.org/) installed. Then, run:

   ```bash
   npm install
   ```

3. **Create Pinecone index**
   Create pinecone index at https://app.pinecone.io/.
   Choose text-embedding-3-small as we are using Open AI embeddings, we need an embedding model with 1536 dimension.
   ![image](https://github.com/user-attachments/assets/e31e9ce0-3a36-4821-9c7d-f0a5415a1d13)


5. **Set environemental variables**
   Set Open AI API key and pinecone index name and key in .env file
   ```bash
      OPENAI_API_KEY=<OPENAI_API_KEY>
      PINECONE_INDEX_NAME=<PINECONE_INDEX_NAME>
      PINECONE_API_KEY=<PINECONE_API_KEY>
   ```

## Usage

1. **Injest the docs**
   ```bash
      node injest.js
   ```
   Refresh your pinecone index, you should be able to see the embedded docs
2. **Get results for the query**
   ```bash
      node retrieve.js
   ```

## Output
You should see two outputs for the query: "What is Attention?"


**Result before RAG:**
 Attention is the cognitive process of selectively concentrating on a particular stimulus or information while ignoring other stimuli. It involves focusing mental resources on a specific task or input, and is essential for various cognitive processes such as perception, memory, and decision-making. Attention can be voluntary or involuntary, and can vary in terms of intensity and duration. It is a crucial aspect of human cognition and plays a key role in our ability to effectively process and respond to the world around us.


**Result after RAG:**
 Attention is an integral part of sequence modeling and transduction models, allowing for modeling dependencies without regard to their distance in sequences. It is a mechanism that relates different positions of a sequence to compute a representation of the sequence. The Transformer model relies entirely on attention mechanisms to draw global dependencies between input and output sequences. Thanks for asking!
