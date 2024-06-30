import { Neo4jVectorStore } from "@langchain/community/vectorstores/neo4j_vector";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { OpenAIEmbeddings } from "@langchain/openai";
import { ChatOpenAI } from "@langchain/openai";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from "@langchain/core/prompts";
import {
  RunnablePassthrough,
  RunnablePick,
  RunnableSequence,
} from "@langchain/core/runnables";

export async function initRetrievalChain() {
  //* Specify embedding model
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPEN_AI_API_KEY,
  });

  //* Create vector store
  const store = await Neo4jVectorStore.fromExistingGraph(embeddings, {
    url: process.env.NEO4J_URI!,
    username: process.env.NEO4J_USERNAME!,
    password: process.env.NEO4J_PASSWORD!,
    nodeLabel: "Product",
    textNodeProperties: ["name", "description"],
    indexName: "product_embeddings",
    embeddingNodeProperty: "embedding",
  });

  //* Retrieve Documents from Vector Index
  const retriever = store.asRetriever();

  //* 1. create a prompt template
  const prompt = ChatPromptTemplate.fromMessages([
    SystemMessagePromptTemplate.fromTemplate(
      `You are a helpful assistant helping users with queries
      about suppliment products.
      Answer the user's question to the best of your ability.
      If you do not know the answer, just say you don't know.
      `
    ),
    SystemMessagePromptTemplate.fromTemplate(
      `
      Here are some suppliments to help you answer the question.
      Don't use your pre-trained knowledge to answer the question.
      Always include images or thumbnails if they exist.
      Always Return the answer in a string of markup.
      If the answer isn't included in the documents, say you don't know.

      Documents:
      {documents}
    `
    ),
    HumanMessagePromptTemplate.fromTemplate(`Question: {message}`),
  ]);

  //* 2. choose an LLM
  const llm = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    temperature: 0,
  });

  //* 3. parse the response
  const parser = new StringOutputParser();

  //* 4. runnable sequence (LCEL)
  const chain = RunnableSequence.from<
    { message: string; documents?: string },
    string
  >([
    RunnablePassthrough.assign({
      documents: new RunnablePick("message").pipe(
        retriever.pipe((docs) => JSON.stringify(docs))
      ),
    }),
    prompt,
    llm,
    parser,
  ]);

  return chain;
}
