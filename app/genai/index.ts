import {
  AgentExecutor,
  createOpenAIFunctionsAgent,
  createOpenAIToolsAgent,
} from "langchain/agents";
import { END, START, StateGraph, StateGraphArgs } from "@langchain/langgraph";
import { llm } from "./llm";
import { AgentState } from "./agent/constants";
import { rephraseQuestion } from "./agent/rephrase";
import { router } from "./agent/router";
import {
  NODE_CYPHER_RETRIEVER,
  NODE_REPHRASE,
  NODE_PORDUCTS_SEARCH,
} from "./agent/constants";
import { initRetrievalChain } from "./agent/tools/products";
import { cypherTool, initCypherQAChain } from "./agent/tools/cypher-retrevial";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  MessagesPlaceholder,
  SystemMessagePromptTemplate,
} from "@langchain/core/prompts";

const agentState: StateGraphArgs<AgentState>["channels"] = {
  input: null,
  rephrased: null,
  messages: null,
  output: null,
  log: {
    value: (x: string[], y: string[]) => x.concat(y),
    default: () => [],
  },
};

/**
- router
- conditional:
 */

export async function buildLangGraphAgent() {
  const vectorChain = await initRetrievalChain();
  const cypherChain = await initCypherQAChain();

  const graph = new StateGraph({
    channels: agentState,
  })

    // 1. Get conversation history and rephrase the question
    .addNode(NODE_REPHRASE, rephraseQuestion)
    .addEdge(START, NODE_REPHRASE)

    // 2. route the request
    .addConditionalEdges(NODE_REPHRASE, router)

    // 3. Call Vector tool
    .addNode(NODE_PORDUCTS_SEARCH, async (data: AgentState) => {
      const output = await vectorChain.invoke({ message: data.input });
      return { output };
    })
    .addEdge(NODE_PORDUCTS_SEARCH, END)

    // 4. Call CypherQAChain
    .addNode(NODE_CYPHER_RETRIEVER, async (data: AgentState) => {
      const output = await cypherChain.invoke({
        query: data.input,
      });

      return { output: output.result as string };
    })
    .addEdge(NODE_CYPHER_RETRIEVER, END);

  const app = await graph.compile();

  return app;
}

export async function call(input: string, sessionId?: string) {
  const agent = await buildLangGraphAgent();

  const res = await agent.invoke({ input }, { configurable: { sessionId } });

  return res.output;
}
