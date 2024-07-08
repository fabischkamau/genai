import { cypherTool } from "./cypher-retrevial";

describe("Cypher Chain ", () => {
  it("should be defined and invokable", async () => {
    const response = await cypherTool().invoke({
      input: "List 2 supplements that have Copper ingredient?",
    });
    expect(response).toBeDefined();
    console.log(response);
  });
});
