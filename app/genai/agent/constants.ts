import { BaseMessage } from "@langchain/core/messages";

export type AgentState = {
  input: string;
  rephrased: string;
  messages: BaseMessage[];
  output: string;
  log: string[];
};

export const NODE_REPHRASE = "rephrase";
export const NODE_ROUTER = "router";
export const NODE_PORDUCTS_SEARCH = "products_search";
export const NODE_CYPHER_RETRIEVER = "cypher_retriever";
