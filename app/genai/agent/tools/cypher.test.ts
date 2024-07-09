import { cypherChainTool } from "./cypher";
import { cypherTool } from "./cypher-retrevial";

describe("Cypher Chain ", () => {
  it("should be defined and invokable", async () => {
    const response = await cypherChainTool().invoke(
      {
        input: "Which suppliments have zinc ingredient?",
      },
      { configurable: { sessionId: "a86267e8-bf01-464f-9053-fa6964b8ff85" } }
    );

    console.log(response);
  });
});
