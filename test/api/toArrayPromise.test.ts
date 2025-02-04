import { assert } from "chai"
import { pipe } from "../../index"
import { describe, test } from "mocha"
import * as CB from "../../index"

describe("toArrayPromise", () => {
  test("it emits a single array of every item", async () => {
    const result = await pipe(CB.fromIter([1, 2, 3, 4, 5]), CB.toArrayPromise)

    assert.deepEqual(result, [1, 2, 3, 4, 5])
  })
})
