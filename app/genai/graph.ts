import { Neo4jGraph } from "@langchain/community/graphs/neo4j_graph";

let graph: Neo4jGraph;

export async function initGraph(): Promise<Neo4jGraph> {
  if (!graph) {
    // Create singleton and wait for connection to be verified
    graph = await Neo4jGraph.initialize({
      url: process.env.NEO4J_URI as string,
      username: process.env.NEO4J_USERNAME as string,
      password: process.env.NEO4J_PASSWORD as string,
      database: process.env.NEO4J_DATABASE as string | undefined,
    });
  }
  return graph;
}
