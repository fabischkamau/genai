import { GraphCypherQAChain } from "@langchain/community/chains/graph_qa/cypher";
import { DynamicStructuredTool } from "langchain/tools";
import { z } from "zod";
import { initGraph } from "../../graph";
import { llm } from "../../llm";
import { PromptTemplate } from "@langchain/core/prompts";

export async function initCypherQAChain() {
  const graph = await initGraph();

  await graph.refreshSchema();
  console.log("Cypher QAChain");

  const cypherTemplate = `Task:Generate Cypher statement to query a graph database.
Instructions:
Use only the provided relationship types and properties in the schema.
Do not use any other relationship types or properties that are not provided.

Schema:
{schema}
Note: Do not include any explanations or apologies in your responses.
Do not respond to any questions that might ask anything else than for you to construct a Cypher statement.
Do not include any text except the generated Cypher statement.
Limit the maximum number of results to 10.
Do not return embedding property.
Include any extra information in your response.
Include thumbnails to products or suppliments as extra information where applicable.


The question is:
{question}`;

  const cypherPrompt = new PromptTemplate({
    template: cypherTemplate,
    inputVariables: ["schema", "question"],
  });

  const chain = GraphCypherQAChain.fromLLM({
    graph,
    llm: llm,
    cypherPrompt,
    returnIntermediateSteps: true,
    returnDirect: false,
  });
  return chain;
}

export function cypherTool() {
  return new DynamicStructuredTool({
    name: "cypher-search",
    description:
      "useful for for answering questions about products or suppliments based on ingredients or brands or categories using cypher statements",
    schema: z.object({
      input: z.string(),
    }),
    func: async (input) => {
      console.log({ input });

      const chain = await initCypherQAChain();
      const res = await chain.invoke({ query: input.input });
      console.log(res);
      return res.result as unknown as string;
    },
  });
}
