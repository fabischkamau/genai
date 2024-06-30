import { call } from ".";

describe("GenAI", () => {
  it("It Should be able to Choose between CypherChain or VectorChain", async () => {
    const res = await call(
      "What is/are available product(s) containing DS ingredient  microcrystalline cellulose?"
    );
  });
});
