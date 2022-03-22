import { assert } from "chai"
import { describe, test } from "mocha"
import { Signal } from "strict-callbag"
import * as CB from "../../index"

describe("empty", () => {
  test("it only emits start and end", async () => {
    const signals: Signal[] = []
    let err: any

    CB.empty(Signal.START, (signal, data) => {
      signals.push(signal)

      if (signal === Signal.START) {
        data(Signal.DATA)
      } else if (signal === Signal.END) {
        err = data
      }
    })

    await new Promise((r) => setTimeout(r, 0))

    assert.deepEqual(signals, [Signal.START, Signal.END])
    assert.isUndefined(err)
  })
})
