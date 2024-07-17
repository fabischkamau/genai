import {
  ChatPromptTemplate,
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
} from "@langchain/core/prompts";
import { OpenAIEmbeddings } from "@langchain/openai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import {
  RunnableSequence,
  RunnablePassthrough,
  RunnablePick,
} from "@langchain/core/runnables";
import { Neo4jVectorStore } from "@langchain/community/vectorstores/neo4j_vector";

import { llm } from "../../llm";
import { z } from "zod";
import { DynamicStructuredTool } from "langchain/tools";

const template = `

## Here are some supplements that contain copper ingredient:

#### HMB for Lean Muscle Support - 1,000 MG (90 Tablets)

<div style="display: flex; flex-wrap: wrap; gap: 10px;">
  <img src="https://s7media.vitaminshoppe.com/is/image/VitaminShoppe/2247724_01?$OP_PLP$" alt="HMB Image 1" style="width: 30%; max-width: 200px;">
  <img src="https://s7media.vitaminshoppe.com/is/image/VitaminShoppe/1654177_01?$OP_PLP$" alt="HMB Image 2" style="width: 30%; max-width: 200px;">
  <img src="https://s7media.vitaminshoppe.com/is/image/VitaminShoppe/1991298_01?$OP_PLP$" alt="HMB Image 3" style="width: 30%; max-width: 200px;">
  <img src="https://s7media.vitaminshoppe.com/is/image/VitaminShoppe/2247724_01?$OP_PLP$" alt="HMB Image 4" style="width: 30%; max-width: 200px;">
</div>

- **Price:** $24
- **Form:** Tablet
- **Size:** 90 Tablets
- **Serving Size:** 90
- **Brand:** HMB
- **Contains ingredients like:** Calcium β-Hydroxy β-Methylbutyrate (HMB), Calcium, and more.

[View Details](https://www.vitaminshoppe.com/p/resveratrol-1000-mg-60-veggie-capsules/4r-1079)

#### One Daily Men's Sport Multivitamin (60 Tablets)

<div style="display: flex; flex-wrap: wrap; gap: 10px;">
  <img src="https://s7media.vitaminshoppe.com/is/image/VitaminShoppe/2247724_01?$OP_PLP$" alt="Men's Sport Multivitamin Image 1" style="width: 30%; max-width: 200px; height: 150px;">
  <img src="https://s7media.vitaminshoppe.com/is/image/VitaminShoppe/1654177_01?$OP_PLP$" alt="Men's Sport Multivitamin Image 2" style="width: 30%; max-width: 200px; height: 150px;">
  <img src="https://s7media.vitaminshoppe.com/is/image/VitaminShoppe/1991298_01?$OP_PLP$" alt="Men's Sport Multivitamin Image 3" style="width: 30%; max-width: 200px; height: 150px;">
  <img src="https://s7media.vitaminshoppe.com/is/image/VitaminShoppe/2247724_01?$OP_PLP$" alt="Men's Sport Multivitamin Image 4" style="width: 30%; max-width: 200px; height: 150px;">
</div>

- **Price:** $24
- **Form:** Tablet
- **Size:** 90 Tablets
- **Serving Size:** 90
- **Brand:** HMB
- **Contains ingredients like:** Calcium β-Hydroxy β-Methylbutyrate (HMB), Calcium, and more.

[View Details](https://www.vitaminshoppe.com/p/resveratrol-1000-mg-60-veggie-capsules/4r-1079)

These products offer different benefits to support your health and wellness goals. Refer to the details of each supplement to see if they align with your specific needs.


`;

export async function initRetrievalChain() {
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPEN_AI_API_KEY,
  });

  const store = await Neo4jVectorStore.fromExistingGraph(embeddings, {
    url: process.env.NEO4J_URI as string,
    username: process.env.NEO4J_USERNAME as string,
    password: process.env.NEO4J_PASSWORD as string,
    database: process.env.NEO4J_DATABASE as string | undefined,
    nodeLabel: "Product",
    textNodeProperties: ["name", "description"],
    indexName: "product_embeddings",
    embeddingNodeProperty: "embedding",
    retrievalQuery: `
    RETURN node.description as text, score,
    node{
    .name,.thumbnails,.price,.serving,.numberOfServings,.form,.warnings,.weightType,.url,
    ingredients:[(node)-[:HAS_INGREDIENT]->(ingredient) | ingredient{.name, .details,.rdaPercnt,.amountContained,.units}],
    categories:[(node)-[:HAS_CATEGORY]->(category) | category.name],
    brand:[(node)-[:HAS_BRAND]->(brand) | brand.name]
    } AS metadata
    `,
  });

  const retriever = store.asRetriever();

  // 1. create a prompt template
  const prompt = ChatPromptTemplate.fromMessages([
    SystemMessagePromptTemplate.fromTemplate(
      `You are a helpful assistant helping users with queries
      about the Nutritionals Supplements.
      Answer the user's question to the best of your ability.
      You are to format your answer based on the template provided.
      If you do not know the answer, just say you don't know.


      Template:
      {template}
      `
    ),
    SystemMessagePromptTemplate.fromTemplate(
      `Here are some Products to help you answer the question.
      Don't use your pre-trained knowledge to answer the question.
      If the answer isn't included in the documents, say you don't know.

      Documents:
      {documents}`
    ),
    HumanMessagePromptTemplate.fromTemplate(`Question: {message}`),
  ]);

  const parser = new StringOutputParser();

  // 4. runnable sequence (LCEL)
  const chain = RunnableSequence.from<
    { message: string; documents?: string },
    string
  >([
    RunnablePassthrough.assign({
      documents: new RunnablePick("message").pipe(
        retriever.pipe((docs) => JSON.stringify(docs))
      ),
      template: new RunnablePick("message").pipe(() => template),
    }),
    prompt,
    llm,
    parser,
  ]);

  return chain;
}

export function productsSearchTool() {
  return new DynamicStructuredTool({
    name: "products-semantic-search",
    description:
      "useful when the user wants to find information about a products by its description  or name",
    schema: z.object({
      input: z.string(),
    }),
    func: async (input) => {
      const chain = await initRetrievalChain();
      return chain.invoke({
        message: input.input,
      });
    },
  });
}
