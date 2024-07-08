import { saveHistory } from "../history";
import { productsSearchTool } from "./products";

describe("Cypher Chain ", () => {
  it("should be defined and invokable", async () => {
    const response = await productsSearchTool().invoke({
      input: "Find 2 supplements that help in testosterone",
    });
    expect(response).toBeDefined();
    console.log(response);
    await saveHistory(
      "a86267e8-bf01-464f-9053-fa6964b8ff85",
      "Find 2 supplements that help in testosterone",
      response
    );
  });
});
