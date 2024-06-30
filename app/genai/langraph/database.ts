import { Neo4jGraph } from "@langchain/community/graphs/neo4j_graph";
import { ChatOpenAI } from "@langchain/openai";
import { GraphCypherQAChain } from "@langchain/community/chains/graph_qa/cypher";
import dotenv from "dotenv";

dotenv.config();

export async function initCypherQAChain() {
  const llm = new ChatOpenAI({ model: "gpt-4-turbo" });
  const graph = await Neo4jGraph.initialize({
    url: process.env.NEO4J_URI as string,
    username: process.env.NEO4J_USERNAME as string,
    password: process.env.NEO4J_PASSWORD as string,
    database: process.env.NEO4J_DATABASE as string | undefined,
  });

  await graph.refreshSchema();
  const chain = GraphCypherQAChain.fromLLM({
    graph,
    llm,
    returnDirect: true,
  });

  return chain;
}
