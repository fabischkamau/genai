import { END, START, StateGraph, StateGraphArgs } from "@langchain/langgraph";

import { AgentState, NOT_ANSWERED } from "./agent/constants";
import { rephraseQuestion } from "./agent/rephrase";
import { router } from "./agent/router";
import {
  NODE_CYPHER_RETRIEVER,
  NODE_REPHRASE,
  NODE_PORDUCTS_SEARCH,
  NODE_JOKE,
} from "./agent/constants";
import { initRetrievalChain, productsSearchTool } from "./agent/tools/products";
import { cypherTool, initCypherQAChain } from "./agent/tools/cypher-retrevial";
import { saveHistory } from "./agent/history";
import { RunnableConfig } from "@langchain/core/runnables";
import { tellJoke } from "./agent/tools/joke";
import { decides } from "./agent/tools/decides";

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
    .addNode(
      NODE_PORDUCTS_SEARCH,
      async (data: AgentState, config?: RunnableConfig) => {
        console.log("Running Vector Retrevial Tool");
        const output = await productsSearchTool().invoke({
          input: data.input,
        });
        const checkAnswer = await decides({
          input: data.input,
          output,
          log: [""],
          messages: [],
          rephrased: "",
        });
        console.log({ checkAnswer });
        if (checkAnswer.answer === NOT_ANSWERED) {
          console.log("Choosing Joke Tool");
          const newoutput = tellJoke(data);
          return newoutput;
        }
        return { output };
      }
    )
    .addEdge(NODE_PORDUCTS_SEARCH, END)

    // 4. Call CypherQAChain
    .addNode(NODE_CYPHER_RETRIEVER, async (data: AgentState) => {
      console.log("Running Cypher Tool");
      const output = await cypherTool().invoke({
        input: data.input,
      });
      const checkAnswer = await decides({
        input: data.input,
        output,
        log: [""],
        messages: [],
        rephrased: "",
      });
      console.log({ checkAnswer });
      if (checkAnswer.answer === NOT_ANSWERED) {
        console.log("Choosing Vector Tool");
        const output = await productsSearchTool().invoke({
          input: data.input,
        });
        const checkAnswer = await decides({
          input: data.input,
          output,
          log: [""],
          messages: [],
          rephrased: "",
        });
        if (checkAnswer.answer === NOT_ANSWERED) {
          console.log("Choosing Joke Tool");
          const newoutput = tellJoke(data);
          return newoutput;
        }
        return { output };
      }
      return { output: output as string };
    })
    .addEdge(NODE_CYPHER_RETRIEVER, END)
    // 5. Tell a joke
    .addNode(NODE_JOKE, tellJoke)
    .addEdge(NODE_JOKE, END);

  const app = await graph.compile();

  return app;
}

export async function call(input: string, sessionId?: string) {
  const agent = await buildLangGraphAgent();

  const res = await agent.invoke({ input }, { configurable: { sessionId } });
  await saveHistory(sessionId as string, input, res.output);

  return res.output;
}
