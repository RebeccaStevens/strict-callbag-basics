import { Signal, Source } from "strict-callbag"
import { chain } from "./chain"
import { flatten } from "./flatten"
import { fromThunk } from "./fromThunk"
import { NONE } from "./none"
import { pipe } from "./pipe"
import { repeatWhile } from "./repeatWhile"

export const resource =
  <Acc, A, E, E1>(
    initial: Acc,
    project: (
      acc: Acc,
      index: number,
    ) => Source<readonly [Acc | NONE, Source<A, E>], E1>,
  ): Source<A, E | E1> =>
  (_, sink) => {
    let acc = initial
    let index = 0

    pipe(
      fromThunk(() => project(acc, index++)),
      flatten,
      repeatWhile((_, lastItem) => {
        if (lastItem !== NONE && lastItem[0] !== NONE) {
          acc = lastItem[0]
          return true
        }

        return false
      }),
      chain(([_, source]) => source),
    )(Signal.START, sink)
  }
