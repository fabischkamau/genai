import { saveHistory } from "../history";
import { productsSearchTool } from "./products";

describe("Cypher Chain ", () => {
  it("should be defined and invokable", async () => {
    const response = await productsSearchTool().invoke({
      input: "Find 2 supplements that help in testosterone",
    });
    expect(response).toBeDefined();
    console.log(response);
  });
});
