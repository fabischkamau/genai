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
export const PRODUCTS_RETRIEVER = "products";
export const NODE_DATABASE_QUERY = "database";
