import { DynamicStructuredTool } from "@langchain/core/tools";
import initCypherRetrievalChain from "./cypher-retrieval.chain";
import { llm } from "../../../llm";
import { initGraph } from "../../../graph";
import { z } from "zod";
import { RunnableConfig } from "@langchain/core/runnables";

export function cypherChainTool() {
  return new DynamicStructuredTool({
    name: "cypher-search",
    description:
      "useful for for answering questions about products or suppliments based on ingredients or brands or categories using cypher statements",
    schema: z.object({
      input: z.string(),
    }),
    func: async (input, _runManager, config) => {
      const graph = await initGraph();

      const chain = await initCypherRetrievalChain(llm, graph);
      const res = await chain.invoke(input, config);
      console.log(res);
      return res as unknown as string;
    },
  });
}
