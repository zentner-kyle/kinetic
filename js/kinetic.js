function write(str) {
  var s = str.replace('\n', '<br>')
  document.getElementById('output').innerHTML += s
}

var vm = {
  threads: [],
  outputs: {motor0: 0, motor1: 0},
  intputs: {time: 0},
}

function tick() {
  for (thread of vm.threads) {
    var {state, data} = thread
    var the_state = states[state]
    switch_state(vm, thread, the_state, the_state.tick(vm, data))
  }
}

function switch_state(vm, thread, new_state) {
  if (new_state !== '(keep_current_state)') {
    the_state.exit(vm, thread.data)
    thread.state = new_state
    states[new_state].enter(vm, thread.data)
  }
}

var states = {
  stop = State(
      (vm, data) => {
        data.startTime = vm.inputs.time
      }, 
      (vm, data) => {
        if (data.startTime + 1000 > vm.inputs.time) {
          return 'forward'
        } else {
          return '(keep_current_state)'
        }
      },
  }

}

//function main() {
  //setTimeout(() => tick(vm), 100)
//}
