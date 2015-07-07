function write(str) {
  var s = str.replace('\n', '<br>')
  document.getElementById('output').innerHTML += s
}

function tick(vm) {
  update_inputs(vm)
  for (thread of vm.threads) {
    var {state, data} = thread
    var the_state = states[state]
    switch_state(vm, thread, the_state, the_state.tick(vm, data))
  }
  log_outputs(vm)
}

function get_time_ms() {
  var date = new Date()
  return date.getTime() + 0.001 * date.getMilliseconds()
}

function update_inputs(vm) {
  vm.inputs.time = get_time_ms()
}

function log_outputs(vm) {
  $('#output').text(JSON.stringify(vm.outputs))
}

const KEEP_CURRENT_STATE = undefined

function switch_state(vm, thread, old_state, new_state) {
  if (new_state !== KEEP_CURRENT_STATE) {
    var state = states[new_state]
    if (state === undefined) {
      console.error('Could not change states!')
    } else {
      old_state.exit(vm, thread.data)
      thread.state = new_state
      states[new_state].enter(vm, thread.data)
    }
  }
}

function spawn_state(vm, new_state) {
  var thread = {
    state: new_state,
    data: {},
  }
  var state = states[new_state]
  state.enter(vm, thread.data)
  vm.threads.push(thread)
}

function State(first, second, third) {
  if (first && second && third) {
    return {
      enter: first,
      tick: second,
      exit: third,
    }
  } else if (first && second) {
    return {
      enter: first,
      tick: second,
      exit: () => null
    }
  } else {
    return {
      enter: () => null,
      tick: first,
      exit: () => null,
    }
  }
}

var states = {
  start: State(
    (vm, data) => {
      data.startTime = vm.inputs.time
    }, 
    (vm, data) => {
      if (data.startTime + 1000 < vm.inputs.time) {
        return 'forward'
      } else {
        return KEEP_CURRENT_STATE
      }
    }),
  forward: State(
    (vm, data) => {
      vm.outputs.motor0 = vm.outputs.motor1 = 100
    })
}

var vm = {
  threads: [ ],
  outputs: {motor0: 0, motor1: 0},
  inputs: {time: 0},
}

function main() {
  tick(vm)
  spawn_state(vm, 'start')
  setInterval(() => tick(vm), 100)
}
