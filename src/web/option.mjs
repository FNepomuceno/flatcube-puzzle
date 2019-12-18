function getOrientOptions({ numDims }) {
  return {
    name: 'Re-orient Cube',
    sections: [
      {
        name: 'Displayed Dimensions',
        inputType: 'radio',
        inputId: 'dimX',
        inputChoices: [numDims-1, numDims-2]
      },
      {
        name: 'Undisplayed Dimensions',
        inputType: 'radio',
        inputId: 'dimY',
        inputChoices: Array.from(Array(numDims-2)).map((_, i) => numDims-3-i)
      },
      {
        name: 'Rotation Direction',
        inputType: 'radio',
        inputId: 'rotD',
        inputChoices: ['Forward', 'Backward']
      },
    ],
    submitName: 'Rotate',
    submitId: 'rotButton'
  }
}

function getTwistOptions({ dimSize }) {
  let twistOptions = {
    name: 'Twist Cube',
    sections: [
      {
        name: 'Select Side',
        inputType: 'radio',
        inputId: 'twsS',
        inputChoices: ['Top', 'Left', 'Bottom', 'Right']
      },
      {
        name: 'Twist Direction',
        inputType: 'radio',
        inputId: 'twsD',
        inputChoices: ['Forward', 'Backward']
      },
      {
        name: 'Twist Layer',
        inputType: 'radio',
        inputId: 'twsL',
        inputChoices:
          Array.from(Array(Math.floor(dimSize/2)))
            .map((_, i) => `Layer ${i}`)
      },
    ],
    submitName: 'Twist',
    submitId: 'twsButton'
  }
  return twistOptions
}

function getLayerOptions({ numDims, dimSize }) {
  let layerOptions = {
    name: 'Change View',
    sections: Array.from(Array(numDims-3)).map((_, i) => {
      return {
        name: `Dimension ${i+3}`,
        inputType: 'radio',
        inputId: `vew${i+3}`,
        inputChoices: Array.from(Array(Math.floor(dimSize/2)))
          .map((_, j) => `Layer ${j}`)
      }
    }),
    submitName: 'Change',
    submitId: 'vewButton'
  }
  return layerOptions
}

const otherOptions = {
  name: 'Options',
  sections: [
    {
      name: 'Choose Category',
      inputType: 'radio',
      inputId: 'optC',
      inputChoices: ['File', 'History']
    },
    {
      name: 'File',
      inputType: 'radio',
      inputId: 'optF',
      inputChoices: ['Reset', 'Load', 'Save']
    },
    {
      name: 'History',
      inputType: 'radio',
      inputId: 'optH',
      inputChoices: ['Undo', 'Redo', 'To Beginning', 'To End']
    }
  ],
  submitName: 'Apply',
  submitId: 'optButton'
}

function generateOptionDom(opt, tag, id) {
  let { name, sections, submitName, submitId } = opt
  let option = document.createElement('div')
  option.className = `${id}-option`

  let title = document.createElement('h3')
  title.innerHTML = name
  option.appendChild(title)

  for(let section of sections) {
    let { name, inputType, inputId } = section
    let sec = document.createElement('div')
    sec.className = `${inputType}-sec`
    option.appendChild(sec)

    let title = document.createElement('h4')
    title.innerHTML = name
    sec.appendChild(title)

    if(inputType === 'radio') {
      let choices = section.inputChoices || []

      choices.forEach((choice, i) => {
        let container = document.createElement('div')
        sec.appendChild(container)

        let radio = document.createElement('input')
        radio.type = 'radio'
        radio.name = `${tag}-${inputId}`
        radio.value = i
        radio.id = `${tag}-${inputId}-${i}`
        if (i === 0) radio.checked = true
        container.appendChild(radio)

        let label = document.createElement('label')
        label.htmlFor = radio.id
        label.innerHTML = choice
        container.appendChild(label)
      })
    }
  }

  let button = document.createElement('button')
  button.type = 'button'
  button.id = `${tag}-${submitId}`
  button.innerHTML = submitName
  button.style.marginTop = '1em'
  option.appendChild(button)

  return option
}

class Option {
  constructor(opt, tag, name) {
    this.name = name
    this.node = generateOptionDom(opt, tag, this.name)
  }

  poll() {
    let sections = Array.from(this.node.childNodes)
      .filter(node => node.tagName === 'DIV')
    let values = sections.map(node => {
      let type = node.className
      if(type === 'radio-sec') {
        let radioPicked = node.querySelector('input:checked')
        return +(radioPicked.value)
      }
    })
    return values
  }
}

export function createOption(cube, tag, type) {
  let choices = {
    orient: getOrientOptions,
    twist: getTwistOptions,
    layer: getLayerOptions,
    option: (_) => otherOptions
  }
  let newOption = new Option(choices[type](cube), tag, type)

  return newOption
}

