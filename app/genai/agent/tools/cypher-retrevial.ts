import { GraphCypherQAChain } from "@langchain/community/chains/graph_qa/cypher";
import { DynamicStructuredTool } from "langchain/tools";
import { z } from "zod";
import { initGraph } from "../../graph";
import { llm } from "../../llm";
import { PromptTemplate } from "@langchain/core/prompts";
import { formattedOutput } from "./formatedoutput";

export async function initCypherQAChain() {
  const graph = await initGraph();

  await graph.refreshSchema();
  const INDEXES = await graph.query("SHOW INDEXES");

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
Include extra information about the nodes that may help an LLM provide a more informative answer, for example the release thumbnails, price, allergens or warnings.

Fine Tuning:
When perfoming string matching queries always  the following FULLTEXT SEARCH examples from the following indexes "${INDEXES}" to guide your answer:
Example Cypher Statements:
 Example Question #1 *Fetching a product based on a single ingredient *:  Which supplements have Copper ingredient?
    Example Cypher:
    \`\`\`
      CALL db.index.fulltext.queryNodes("namesAndDetails", "copper") YIELD node, score
      MATCH (node)<-[:HAS_INGREDIENT]-(s)-[:HAS_BRAND]->(b)
      WITH  score,s ,b 
      RETURN  s.name AS name, s.description AS description, s.thumbnails as thumbnails,  score , s.url as url, s.price as price, s.allergens as allergens, s.warnings as warnings, b.name as brand
      ORDER BY score DESC
      LIMIT 10
    \`\`\`
  
    Example Question #2 *Fetching a product based on a multiple ingredients *:  Which supplements have zinc and copper?
    Example Cypher:
    \`\`\`
    WITH ["Zinc", "Copper"] AS ingredients
    MATCH (i:Ingredient)<-[:HAS_INGREDIENT]-(s)-[:HAS_BRAND]->(b)
    WHERE ANY(ingredient IN ingredients WHERE i.name CONTAINS ingredient OR i.details CONTAINS ingredient)
    WITH  score,s ,b 
      RETURN i s.name AS name, s.description AS description, s.thumbnails as thumbnails,  score , s.url as url, s.price as price, s.allergens as allergens, s.warnings as warnings, b.name as brand
      ORDER BY score DESC
      LIMIT 10
    \`\`\`

  Example Question #3  :  Which supplements are in the brand Natural Factors?
    Example Cypher:
    \`\`\`
    CALL db.index.fulltext.queryNodes("brandNames", "Natural Factors") YIELD node,score
    MATCH (node)<-[:IN_BRAND]-(s)
    WITH  score,s 
      RETURN  s.name AS name, s.description AS description, s.thumbnails as thumbnails,  score , s.url as url, s.price as price, s.allergens as allergens, s.warnings as warnings
      ORDER BY score DESC
      LIMIT 10
    \`\`\`

    Example Question #4:  Which supplements are in category Vitamins?
    Example Cypher:
    \`\`\`
    CALL db.index.fulltext.queryNodes("categoryNames", "Vitamins") YIELD node,score
    MATCH (node)<-[:IN_CATEGORY]-(s)-[:HAS_BRAND]->(b)
    WITH  score,s ,b
      RETURN score, s.name AS name, s.description AS description, s.thumbnails as thumbnails,  score , s.url as url, s.price as price, s.allergens as allergens, s.warnings as warnings, b.name as brand
      ORDER BY score DESCnpm
    Example Question #1: List some suppliments available.
    Example Cypher:
    \`\`\`
    MATCH (b)<-[:HAS_BRAND]-(p:Suppliment:Product)-[:HAS_INGREDIENT]->(i)
    RETURN p.name AS name, p.description AS description, p.thumbnails as thumbnails, p.price as price, p.allergens as allergens, p.warnings as warnings, p.url as url, b.name as brand, i.name as ingredient 
    ORDER BY p.name
    LIMIT 10
    \`\`\`



Question:

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
    returnDirect: true,
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
      const formatedOutput = await formattedOutput(
        {
          input: input.input,
          output: res.result,
          log: [],
          messages: [],
          rephrased: "",
        },
        res.result,
        res.intermediateSteps[0]?.query
      );
      return formatedOutput;
    },
  });
}
