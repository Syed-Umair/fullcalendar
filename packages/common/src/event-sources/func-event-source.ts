import { unpromisify } from '../util/promise'
import { EventSourceDef } from '../structs/event-source-def'
import { EventSourceError } from '../structs/event-source'
import { EventInput } from '../structs/event-parse'
import { createPlugin } from '../plugin-system'
import { buildZonedRangeArg } from '../util/date'

export type EventSourceFunc = (
  arg: {
    start: Date
    end: Date
    startStr: string
    endStr: string
    timeZone: string
  },
  successCallback: (events: EventInput[]) => void,
  failureCallback: (error: EventSourceError) => void
) => (void | PromiseLike<EventInput[]>)


let eventSourceDef: EventSourceDef<EventSourceFunc> = {

  parseMeta(refined) {
    if (typeof refined.events === 'function') {
      return refined.events
    }
    return null
  },

  fetch(arg, success, failure) {
    let dateEnv = arg.context.dateEnv
    let func = arg.eventSource.meta

    unpromisify(
      func.bind(null, buildZonedRangeArg(dateEnv, arg.range)),
      function(rawEvents) { // success
        success({ rawEvents }) // needs an object response
      },
      failure // send errorObj directly to failure callback
    )
  }

}

export const funcEventSourcePlugin = createPlugin({
  eventSourceDefs: [ eventSourceDef ]
})
