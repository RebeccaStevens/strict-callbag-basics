import { Signal, Source } from "strict-callbag"
import { createPipe } from "./createPipe"

const EOF = Symbol()
type EOF = typeof EOF

/**
 * Converts any type of stream into a pull based one.
 *
 * `bufferSize` configures the amount of items to keep in the queue
 */
export const buffer_ =
  <A, E>(self: Source<A, E>, bufferSize = 16, eager = false): Source<A, E> =>
  (_, sink) => {
    let sourceEnded = false
    let sourceError: E | undefined
    let waitingForData = false

    let buffer: A[] = []
    let bufferIndex = 0

    function cleanup() {
      buffer = []
      bufferIndex = 0
    }

    function maybeEnd() {
      if (sourceEnded && buffer.length === 0) {
        sink(Signal.END, sourceError)
      }
    }

    function pull(): A | EOF {
      const length = buffer.length
      if (bufferIndex >= length) {
        return EOF
      }

      const item = buffer[bufferIndex]
      buffer[bufferIndex] = undefined as any
      bufferIndex++

      if (bufferIndex >= length) {
        buffer = []
        bufferIndex = 0
      }

      return item
    }

    createPipe(self, sink, {
      onStart(s) {
        waitingForData = true
        s.pull()
      },
      onRequest(s) {
        const next = pull()

        if (next === EOF) {
          maybeEnd()

          if (!sourceEnded && (!waitingForData || eager)) {
            waitingForData = true
            s.pull()
          }
        } else {
          sink(Signal.DATA, next)

          if (eager) {
            s.pull()
          }
        }
      },
      onData(_s, data) {
        if (waitingForData) {
          waitingForData = false
          sink(Signal.DATA, data)
        } else if (buffer.length - bufferIndex < bufferSize) {
          buffer.push(data)
        }
      },
      onEnd(err) {
        sourceEnded = true
        sourceError = err
        maybeEnd()
      },
      onAbort() {
        cleanup()
      },
    })
  }

/**
 * Converts any type of stream into a pull based one.
 *
 * `bufferSize` configures the amount of items to keep in the queue
 */
export const buffer =
  (bufferSize?: number, eager?: boolean) =>
  <A, E>(self: Source<A, E>) =>
    buffer_(self, bufferSize, eager)
