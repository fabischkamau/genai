import { createSession } from "~/utils/historysession.server";
import { call } from ".";
import { saveHistory } from "./agent/history";

describe("GenAi Test", () => {
  it("should call Generative AI", async () => {
    const res = await call(
      "Find 2 supplements for hair growth",
      "a86267e8-bf01-464f-9053-fa6964b8ff85"
    );
    expect(res).toBeDefined();
    console.log(res);
    await saveHistory(
      "a86267e8-bf01-464f-9053-fa6964b8ff85",
      "Find 2 supplements for hair growth",
      res
    );
  });
});
