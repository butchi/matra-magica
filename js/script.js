"use strict"

const canvas = []
const content = []

pdfMake.fonts = {
  Roboto: {
    normal: "Roboto-Regular.ttf",
  },
}

const docDefinition = {
  content,
  defaultStyle: {
    color: "gray",
  }
}

const btnCreateElm = document.getElementById("button-create")
btnCreateElm.addEventListener("click", _evt => {
  pdfMake.createPdf(docDefinition).open()
})
mdc.ripple.MDCRipple.attachTo(btnCreateElm);


const tabMenuElmArr = document.querySelectorAll(".mdc-tab")
const tabContentElmArr = document.querySelectorAll("[data-tab-content]")

tabMenuElmArr.forEach(tabMenuElm => {
  const label = tabMenuElm.getAttribute("data-tab-label")

  tabMenuElm.addEventListener('click', _evt => {
    tabContentElmArr.forEach((tabContentElm) => {
      if (tabContentElm.getAttribute("data-tab-label") === label) {
        tabContentElm.style.display = "block"
      } else {
        tabContentElm.style.display = "none"
      }
    })
  })
})

const baseWidth = 377
const baseHeight = 610

const svgNs = "http://www.w3.org/2000/svg"

const drawBaseElm = document.querySelector(".draw-base")
drawBaseElm.style.position = "relative"
drawBaseElm.style.width = `${baseWidth}px`
drawBaseElm.style.height = `${baseHeight}px`

const svgElm = document.createElementNS(svgNs, "svg")
svgElm.setAttribute("width", baseWidth)
svgElm.setAttribute("height", baseHeight)
svgElm.setAttribute("viewBox", `0 0 ${baseWidth} ${baseHeight}`)
svgElm.style.position = "absolute"

const canvasElm = document.createElement("canvas")
canvasElm.width = baseWidth
canvasElm.height = baseHeight
canvasElm.style.position = "absolute"

const g = document.createElementNS(svgNs, "g")
svgElm.appendChild(g)

let svgContentTxt = ""

// 一応3次元以上も見越している
const vector = (...argArr) => {
  if (argArr.length === 0) {
    return vector(0, 0)
  } else if (argArr.length === 1) {
    const arg = argArr[0]

    if (typeof arg === "number") {
      return vector({
        x: arg,
        y: 0,
      })
    } else if (arg instanceof Array) {
      return vec(...arg)
    } else if (arg instanceof Object) {
      return vector(arg.vector)
    } else {
      return arg
    }
  } else if (argArr.length >= 2) {
    return ({
      x: argArr[0] || 0,
      y: argArr[1] || 0,
    })
  }
}

const vec = (x = 0, y = 0, z = 0, w = 0) => {
  return ({
    x,
    y,
    z,
    w,
  })
}

const angleVector = (...argArr) => {
  let ret = vector(0, 0)

  if (argArr.length === 0) {
    ret = vector(1, 0)
  } else if (argArr.length === 1) {
    const arg = argArr[0]

    if (typeof arg === "number") {
      ret = vector(Math.cos(arg), Math.sin(arg))
    } else if (arg instanceof Array) {
      ret = angleVector(arg[0], arg[1])
    } else {
      ret = arg
    }
  } else if (argArr.length === 2) {
    const arg0 = argArr[0]
    const arg1 = argArr[1]

    let origin = vector(0, 0)
    let offset = vector(1, 0)

    if (typeof arg0 === "number") {
      const v = angleVector(arg1)
      offset = vector(arg0 * v.x, arg0 * v.y)
    } else {
      origin = vector(arg0)
      offset = angleVector(arg1)
    }

    ret = vector(origin.x + offset.x, origin.y + offset.y)
  }

  return ret
}

let unit = 25

const font = {
  size: 1,
}

const stroke = {
  color: null,
  width: null,
}

const face = {
  color: "#000"
}

const convertSize = arg => {
  if (typeof arg === "undefined") {
    return unit
  } else if (typeof arg === "number") {
    return arg * unit
  } else if (typeof arg === "string") {
    return arg
  } else {
    return unit
  }
}


const setFunctionList = {
  setUnit: arg => {
    unit = arg

    return unit
  },

  setFont: arg => {
    const { size, family } = arg

    font.size = size
    font.family = family

    return font
  },

  setStroke: arg => {
    if (arg === undefined) {
      stroke.color = "black"
      stroke.width = 1
    } else if (arg == null) {
      stroke.color = null
      stroke.width = null
    } else {
      const { color, width } = arg

      if (color != null) {
        stroke.color = color
      }

      if (width != null) {
        stroke.width = width
      }
    }

    return stroke
  },

  setFace: arg => {
    const { color } = arg

    face.color = color

    return face
  },
}


const createSvgElement = ({ elementName, attribute, content }) => {
  let ret

  const element = document.createElementNS(svgNs, elementName)

  Object.keys(attribute).forEach(key => {
    element.setAttribute(key, attribute[key])
  })

  if (content != null) {
    element.innerHTML = content
  }

  const text = `<${elementName} ${Object.keys(attribute).map(key => {
    return `${key}="${attribute[key]}"`
  }).join(" ")}>${content != null ? content : ""}</${elementName}>
  `

  ret = { element, text }

  return ret
}


const colorFunctionList = {
}

const colorLi = {
  "black": "black",
  "white": "white",
  "red": "red",
  "green": "green",
  "blue": "blue",
  "yellow": "yellow",
}

Object.keys(colorLi).forEach(key => {
  colorFunctionList[key] = _ => setFunctionList.setFace({
    color: colorLi[key],
  });
})

const drawFunctionList = {
  line: argLi => {
    const propObj = {
      coordArray: [vector(0, 0), vector(1, 0)],
      stroke: Object.assign({}, stroke),
      face: Object.assign({}, face),
    }

    propObj.cArr = argLi.coordArray.map(coord => vector(coord)) || [vector(0, 0), vector(1, 0)]

    let elmName
    let attrObj

    if (propObj.cArr.length < 3) {
      elmName = "line"

      attrObj = {
        "x1": convertSize(propObj.cArr[0].x),
        "y1": convertSize(propObj.cArr[0].y),
        "x2": convertSize(propObj.cArr[1].x),
        "y2": convertSize(propObj.cArr[1].y),
      }
    } else {
      elmName = "polygon"

      attrObj = {
        "points": propObj.cArr.map(c => `${convertSize(c.x)},${convertSize(c.y)}`).join(" "),
      }

      if (propObj.face.color != null) {
        attrObj["fill"] = propObj.face.color
      }
    }

    if (propObj.stroke.color != null) {
      attrObj["stroke"] = propObj.stroke.color
    }

    if (propObj.stroke.width != null) {
      attrObj["stroke-width"] = propObj.stroke.width
    }

    const { element: svgElm, text: svgTxt } = createSvgElement({
      elementName: elmName,
      attribute: attrObj,
    })

    svgContentTxt += svgTxt

    g.appendChild(svgElm)

    return propObj
  },

  rectangle: argLi => {
    const propObj = {
      coord: vector(0, 0),
      size: vector(1, 1),
      stroke: Object.assign({}, stroke),
      face: Object.assign({}, face),
    }

    propObj.coord = vector(argLi.coord) || vector(0, 0)
    propObj.size = vector(argLi.size) || vector(1, 1)

    const attrObj = {
      "x": convertSize(propObj.coord.x),
      "y": convertSize(propObj.coord.y),
      "width": convertSize(propObj.size.x),
      "height": convertSize(propObj.size.y),
    }

    if (propObj.stroke.color != null) {
      attrObj["stroke"] = propObj.stroke.color
    }

    if (propObj.stroke.width != null) {
      attrObj["stroke-width"] = propObj.stroke.width
    }

    if (propObj.face.color != null) {
      attrObj["fill"] = propObj.face.color
    }

    const { element: svgElm, text: svgTxt } = createSvgElement({
      elementName: "rect",
      attribute: attrObj,
    })

    svgContentTxt += svgTxt

    g.appendChild(svgElm)

    return propObj
  },

  circle: argLi => {
    const propObj = {
      coord: vector(0, 0),
      radius: 1,
      stroke: Object.assign({}, stroke),
      face: Object.assign({}, face),
    }

    propObj.coord = vector(argLi.coord) || vector(0, 0)
    propObj.radius = argLi.radius || 1
    propObj.stroke = Object.assign({}, propObj.stroke, argLi.stroke)
    propObj.face = Object.assign({}, propObj.face, argLi.face)

    const attrObj = {
      "cx": convertSize(propObj.coord.x),
      "cy": convertSize(propObj.coord.y),
      "r": convertSize(propObj.radius),
    }

    if (propObj.stroke.color != null) {
      attrObj["stroke"] = propObj.stroke.color
    }

    if (propObj.stroke.width != null) {
      attrObj["stroke-width"] = propObj.stroke.width
    }

    if (propObj.face.color != null) {
      attrObj["fill"] = propObj.face.color
    }

    const pdfObj = {
      type: "ellipse",
      x: convertSize(propObj.coord.x),
      y: convertSize(propObj.coord.y),
      r1: convertSize(propObj.radius),
      r2: convertSize(propObj.radius),
    }

    const { element: svgElm, text: svgTxt } = createSvgElement({
      elementName: "circle",
      attribute: attrObj,
    })

    svgContentTxt += svgTxt

    g.appendChild(svgElm)

    return propObj
  },

  text: argLi => {
    const propObj = {
      content: "",
      coord: vector(0, 0),
      font: Object.assign({}, font),
      stroke: Object.assign({}, stroke),
      face: Object.assign({}, face),
      align: 0,
    }

    if (content != null) {
      propObj.content = argLi.content
    }
    propObj.coord = vector(argLi.coord) || propObj.coord
    propObj.stroke = Object.assign({}, propObj.stroke, argLi.stroke)
    propObj.face = Object.assign({}, propObj.face, argLi.face)
    propObj.font = Object.assign({}, propObj.font, argLi.font)
    propObj.align = argLi.align || propObj.align

    const attrObj = {
      "x": convertSize(propObj.coord.x),
      "y": convertSize(propObj.coord.y),
    }

    if (propObj.stroke.color != null) {
      attrObj["stroke"] = propObj.stroke.color
    }

    if (propObj.stroke.width != null) {
      attrObj["stroke-width"] = convertSize(propObj.stroke.width)
    }

    if (propObj.face.color != null) {
      attrObj["fill"] = propObj.face.color
    }

    if (propObj.font.family != null) {
      attrObj["font-family"] = propObj.font.family
    }

    if (propObj.font.size != null) {
      attrObj["font-size"] = convertSize(propObj.font.size)
    }

    if (propObj.align != null) {
      attrObj["text-anchor"] = {
        "-1": "start",
        "0": "middle",
        "1": "end",
      }[(propObj.align + 4) % 3 - 1]
      attrObj["dominant-baseline"] = {
        "-1": "text-top",
        "0": "middle",
        "1": "baseline",
      }[Math.floor((propObj.align + 1) / 3)]
    }

    const { element: svgElm, text: svgTxt } = createSvgElement({
      elementName: "text",
      attribute: attrObj,
      content: propObj.content,
    })

    svgContentTxt += svgTxt

    g.appendChild(svgElm)

    return propObj
  }
}

const setFuncLi = {
  font: (size, family = null) => {
    return setFunctionList.setFont({ size, family })
  },

  stroke: (color, width = null) => {
    return setFunctionList.setStroke({ color, width })
  },

  face: color => {
    return setFunctionList.setFace({ color })
  },
}

const drawFuncLi = {
  lin: (arr0, arr1) => {
    const coordArr = [vector(arr0), vector(arr1)]

    return drawFunctionList.line({ coordArray: coordArr })
  },

  rect: (coord = vector(0, 0), size = vector(1, 1)) => {
    return drawFunctionList.rectangle({
      coord,
      size,
    });
  },

  circ: (coord = vector(argArr[0]), radius = 1) => {
    return drawFunctionList.circle({
      coord,
      radius,
    })
  },

  txt: (coord = vector(0, 0), content = null) => {
    return drawFunctionList.text({
      coord,
      content,
    })
  },
}

const funcLi = Object.assign(setFunctionList, colorFunctionList, drawFunctionList, setFuncLi, drawFuncLi)


const evalJSON = seq => {
  seq.map(item => {
    Object.keys(item).map(key => {
      const f = funcLi[key]
      const prop = item[key]

      if (["lin", "rect", "circ", "txt"].includes(key)) {
        return f(...prop)
      } else {
        return f(prop)
      }
    })
  })
}


const codeElm = document.getElementById("matra-script-code")
codeElm.style.fontFamily = `"Courier New", monospace`
codeElm.style.fontSize = `${11}px`


const jsonElm = document.getElementById("matra-json")
jsonElm.style.fontFamily = `"Courier New", monospace`
jsonElm.style.fontSize = `${11}px`


const yamlElm = document.getElementById("matra-yaml")
yamlElm.style.fontFamily = `"Courier New", monospace`
yamlElm.style.fontSize = `${11}px`


const inputHandler = (evt = {}) => {
  canvas.length = 0
  content.length = 0
  content.push({ canvas })
  g.innerHTML = ""
  svgContentTxt = ""

  const val = evt.target && evt.target.value || codeElm.innerHTML

  try {
    const obj = jsyaml.load(val)
    jsonElm.innerHTML = JSON5.stringify(obj, null, 2)
    yamlElm.innerHTML = jsyaml.dump(obj)

    evalJSON(obj)

    content.push({
      svg: `<svg width="610" height="377" viewBox="0 0 610 377"><g>${svgContentTxt
        }</g></svg>`,
      width: 610,
      height: 377,
    })
  } catch (e) {
    console.log(e)
  }
}

codeElm.addEventListener("input", inputHandler)


const range = (...argArr) => {
  let ret = []
  let start = 1
  let end = 1

  if (argArr.length === 0) {
    start = 1
    end = 1
  } else if (argArr.length === 1) {
    start = 1
    end = argArr[0]
  } else {
    start = argArr[0]
    end = argArr[1]
  }

  for (let i = start; i <= end; i++) {
    ret.push(i)
  }

  return ret
}

const color = arg => {
  return tinycolor(arg)
}

const exampleYaml = `
- text:
    content: "Hello, world!"
    coord:
      vector: [5, 1]
    font: { size: 1 }
    face: { color: red }
    align: 0
- setFace:
    color:
      red
- setStroke:
    width: 3
    color: black
- line:
    coordArray:
      - vector: [1, 3]
      - vector: [3, 3]
- rectangle:
    coord:
      vector: [8, 3]
    size:
      vector: [3, 5]
- setFace:
    color: green
- rect: [[1, 5], [3, 3]]
- face: blue
- circle:
    coord: [6, 3]
    radius: 1
    face:
      color: "#ff0"
    stroke:
      width: 8
- circ: [[6, 6], 1]
- line:
    coordArray:
      - vector: [1, 11]
      - vector: [3, 11]
      - vector: [3, 13]
- setStroke:
    width: 0
- txt: [vector: [5, 15], "Thanks, world!"]
`.slice(1)

const exampleJs = `
const { setStroke } = setFunctionList;
const { red, green, blue, yellow } = colorFunctionList;
const { line, rectangle, circle, text } = drawFunctionList;
const { lin, rect, circ, txt } = drawFuncLi;

[
  text({ content: "Hello, world!", coord: vector(5, 1), font: { size: 1 }, face: { color: "red" }, align: 0 }),
  red(),
  setStroke({ width: 3, color: "black" }),
  rectangle({ coord: vector(8, 3), size: vector(3, 5) }),
  green(),
  rect([1, 5], [3, 3]),
  blue(),
  circle({
    coord: [6, 3],
    radius: 1,
    face: {
      color: "#ff0",
    },
    stroke: {
      width: 8,
    },
  }),
  circ([6, 6], 1),
  setStroke({ width: 0 }),
  txt(vector(5, 11), "Thanks, world!"),
]
`.slice(1)


codeElm.innerHTML = exampleYaml

drawBaseElm.appendChild(canvasElm)
drawBaseElm.appendChild(svgElm)

inputHandler()