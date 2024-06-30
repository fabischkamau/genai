import { initGraph } from "./graph";
import { Neo4jGraph } from "@langchain/community/graphs/neo4j_graph";
import dotenv from "dotenv";

dotenv.config();

describe("Neo4j Graph", () => {
  it("should have environment variables defined", () => {
    expect(process.env.NEO4J_URI).toBeDefined();
    expect(process.env.NEO4J_USERNAME).toBeDefined();
    expect(process.env.NEO4J_PASSWORD).toBeDefined();
  });

  describe("initGraph", () => {
    it("should instantiate Neo4jGraph", async () => {
      const graph = await initGraph();

      expect(graph).toBeInstanceOf(Neo4jGraph);

      await graph.query("MATCH (n) RETURN count(n) as count");

      await graph.close();
    });
  });
});
