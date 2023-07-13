class Combinator extends createjs.Container {
    constructor(stage, text, nInputs) {
        super()
        this.nInputs = nInputs
        var width = nInputs * 50
        var height = 50

        this.outputX = width / 2 + 50
        this.outputY = 0

        const inputs = Array(nInputs)
        this.inputs = inputs
        this.output = text
        this.fillCommands = []

        for (let i = 0; i < nInputs * 50; i += 50) {
            var polygon = new createjs.Shape()
            this.fillCommands.push(polygon.graphics.beginFill("lightgreen").command)
            polygon.graphics.beginStroke().moveTo(25 + i, 25).lineTo(i, -25).lineTo(50 + i, -25).lineTo(25 + i, 25)
            polygon.name = "input" + i / 50
            this.addChild(polygon)
        }

        var rect = new createjs.Shape()
        rect.graphics.beginFill("lightgreen").drawRect(0, 0, width, height)
        this.addChild(rect)

        var out = new createjs.Shape()
        out.graphics.beginFill("lightgreen").drawRect(width / 2 - 50 / 2, height, 50, 25)
        this.addChild(out)

        var text = new createjs.Text(text)
        text.x = width / 2;
        text.y = height / 2
        text.textAlign = "center"
        text.textBaseline = "middle"
        this.addChild(text)
        this.on('pressmove', function(e){
            this.x = e.stageX - width / 2;
            this.y = e.stageY - height / 2;
            stage.update();
        })
    }

    onTouched(stage, x, y) {
        for (let i = 0; i < this.inputs.length; i++) {
            this.inputs[i] = getItemsUnderPoint(stage, this.x - 25, this.y + 25 + i * 50, this)[0]
        }
    }
}

class Printer extends createjs.Container {
    constructor(stage) {
        super()

        var rect = new createjs.Shape()
        rect.graphics.beginFill("yellow").drawRect(0, 0, 50, 50)
        this.addChild(rect)

        var text = new createjs.Text("print")
        this.text = text
        text.x = 50 / 2;
        text.y = 50 / 2
        text.textAlign = "center"
        text.textBaseline = "middle"
        this.addChild(text)
        
        this.on('pressmove', function(e){
            this.x = e.stageX - 50 / 2;
            this.y = e.stageY - 50 / 2;
            stage.update();
        })

        this.addEventListener("touched", function(e) {
            console.log("touched")
        })
    }
    
    onTouched(stage, x, y) {
        var under = getItemsUnderPoint(stage, this.x, this.y + 50 / 2, this)[0]
        if (under != null) {
            this.text.text = getItemsUnderPoint(stage, this.x, this.y + 50 / 2, this)[0].output
        } else {
            this.text.text = "print"
        }
    }
}

class Function extends createjs.Container {
    constructor(stage, output) {
        super()

        var rectColorIndex = 0
        var rect = new createjs.Shape()
        var rectFillCommand = rect.graphics.beginFill("lightblue").command
        rect.graphics.drawRect(0, 0, 50, 50)
        rect.on("dblclick", () => {
            rectFillCommand.style = this.parent.usedColors[rectColorIndex]
            rectColorIndex = (rectColorIndex + 1) % this.parent.usedColors.length
            stage.update()
        })
        this.addChild(rect)

        var input = null
        var newInput = new createjs.Shape()
        newInput.graphics.beginFill("red").drawRoundRect(25 - 4, -4, 8, 8, 3)
        newInput.on("click", () => {
            input = new Input(stage, this.x, this.y)
            this.parent.addChildAt(input, 0)
            this.removeChild(newInput)
            stage.update()
        })
        this.addChild(newInput)

        var newOutput = new createjs.Shape()
        newOutput.graphics.beginFill("red").drawRoundRect(50 - 4, 50 / 2 - 4, 8, 8, 3)
        newOutput.on("click", () => {
            var func = new Function(stage)
            func.y = this.y
            func.x = this.x + 50 + 25
            this.parent.addChild(func)
            this.removeChild(newOutput)
            this.parent.addChild(new Output(stage, this.x, this.y, input != null && input.isParameter))
            if (input != null && input.isParameter) this.parent.removeChild(this)
            stage.update()
        })
        this.addChild(newOutput)

        this.output = output
    }
}

class Input extends createjs.Container {
    constructor(stage, x, y) {
        super()

        var polygon = new createjs.Shape()
        var polyFillCommand = polygon.graphics.beginFill("lightblue").command
        this.isParameter = false
        polygon.graphics.beginStroke().moveTo(x, y - 25).lineTo(x + 50, y - 25).lineTo(x + 25 + 25/2, y).lineTo(x + 25 / 2, y).lineTo(x, y - 25)
        polygon.on("dblclick", () => {
            if (polyFillCommand.style == "lightblue") {
                polyFillCommand.style = unusedColors.shift()
                this.parent.usedColors.push(polyFillCommand.style)
                this.removeChild(newInput)
                this.isParameter = true
                stage.update()
            } else {
                unusedColors.unshift(polyFillCommand.style)
                this.parent.usedColors.splice(this.parent.usedColors.indexOf(polyFillCommand.style), 1)
                polyFillCommand.style = "lightblue"
                this.addChild(newInput)
                this.isParameter = false
                stage.update()
            }
            stage.update()
        })
        this.addChild(polygon)

        var newInput = new createjs.Shape()
        newInput.graphics.beginFill("red").drawRoundRect(x + 25 - 4, y - 25 - 4, 8, 8, 3)
        newInput.on("click", () => {
            var func = new Function(stage)
            func.x = x
            func.y = y - 25 - 50
            this.parent.addChild(func)
            this.removeChild(newInput)
            stage.update()
        })
        newInput.name = "newInput"
        this.addChild(newInput)
    }
}

class Output extends createjs.Container {
    constructor(stage, x, y, isParameter) {
        super()

        if (isParameter) {
            var down = new createjs.Shape()
            down.graphics.beginFill("black").drawRect(x + 25 - 2, y, 4, 25 + 2)
            this.addChild(down)
    
            var line = new createjs.Shape()
            line.graphics.beginFill("black").drawRect(x + 25 - 2, y + 25 - 2, 50 + 2 - 10, 4)
            this.addChild(line)
    
            var point = new createjs.Shape()
            point.graphics.beginFill("black").beginStroke().moveTo(x + 65, y + 25 - 10).lineTo(x + 65 + 10, y + 25).lineTo(x + 65, y + 25 + 10).lineTo(x + 65, y + 25 - 10)
            this.addChild(point)
        } else {
            var line = new createjs.Shape()
            line.graphics.beginFill("black").drawRect(x + 50, y + 25 - 2, 15, 4)
            this.addChild(line)

            var point = new createjs.Shape()
            point.graphics.beginFill("black").beginStroke().moveTo(x + 65, y + 25 - 10).lineTo(x + 75, y + 25).lineTo(x + 65, y + 25 + 10).lineTo(x + 65, y + 25 - 10)
            this.addChild(point)
        }
        
    }
}

class Expression extends createjs.Container {
    constructor(stage) {
        super()

        this.on("mousedown", e => {
            this.clickX = e.stageX - this.x
            this.clickY = e.stageY - this.y
            stage.setChildIndex(this, stage.numChildren - 1)
        })

        this.on('pressmove', function(e) {
            this.x = e.stageX - this.clickX;
            this.y = e.stageY - this.clickY;
            stage.update();
        })
        this.usedColors = ["lightblue"]
    }


}

class Button extends createjs.Container {
    constructor(displayText, onClick) {
        super()

        var rect = new createjs.Shape()
        rect.graphics.beginFill("green").drawRect(0, 0, 100, 50)
        this.addChild(rect)

        var text = new createjs.Text(displayText)
        text.x = 100 / 2;
        text.y = 50 / 2
        text.textAlign = "center"
        text.textBaseline = "middle"
        this.addChild(text)

        this.on("click", onClick)
    }
}

function getItemsUnderPoint(stage, x, y, obj = undefined) {
    return [... new Set((stage.getObjectsUnderPoint(x, y)).map(function(value){return value.parent}))]
    .filter(function(item){return item != obj})
}

function getObjectsInBounds(stage, boxObj) {
    var box = boxObj.getBounds()
    var objects = []
    for (let i = box.x; i < box.x + box.width; i += 10) {
        for (let j = box.y; j < box.y + box.height; j += 10) {
            var under = [...new Set(stage.getObjectsUnderPoint(i, j).filter(k => k != boxObj).map(k => k.parent))].filter(k => k != boxObj)
            if (under.length > 0) {
                objects = objects.concat(under)
            }
        }
    }
    return [...new Set(objects)]
}

function init() {
    var canvas = document.getElementById("canvas")
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    var stage = new createjs.Stage("canvas")

    var addLambda = new Button("add lambda", () => {
        var expression = new Expression(stage)
        var func = new Function(stage);
        expression.addChild(func)
        stage.addChild(expression)
        expression.x = window.innerWidth / 2;
        expression.y = window.innerHeight / 2;
        stage.update()
    })
    stage.addChild(addLambda)

    var addCombinator = new Button("add combinator", () => {
        var boxObj = stage.getChildByName("selectbox")
        console.log(getObjectsInBounds(stage, boxObj))
        stage.addChild(new Combinator(stage, "Combinator", getObjectsInBounds(stage, stage.getChildByName("selectbox"))[0].parent.usedColors.length - 1))
        stage.update()
    })
    addCombinator.x = 100
    stage.addChild(addCombinator)

    var trash = new Button("trash", () => {
        stage.removeChild(getObjectsInBounds(stage, stage.getChildByName("selectbox"))[0].parent)
        stage.update()
    })
    trash.x = 200
    stage.addChild(trash)

    stage.on("stagemousedown", (e) => {
        stage.pressed = true
        stage.downX = e.stageX
        stage.downY = e.stageY
    })

    stage.on("stagemouseup", (e) => {
        stage.pressed = false
    })

    stage.on("stagemousemove", (e) => {
        if (stage.pressed && stage.getObjectsUnderPoint(e.stageX, e.stageY).filter((i) => i != stage.getChildByName("selectbox")).length == 0) {
            stage.removeChild(stage.getChildByName("selectbox"))
            var box = new createjs.Shape()
            box.graphics.beginFill("aliceblue").drawRect(stage.downX, stage.downY, e.stageX - stage.downX, e.stageY - stage.downY)
            box.name = "selectbox"
            box.setBounds(stage.downX, stage.downY, e.stageX - stage.downX, e.stageY - stage.downY)
            stage.addChildAt(box, 0)
            stage.update()
        }
    })

    document.onkeydown = (e) => {
        switch (e.key) {
            case "Escape":
                stage.removeChild(stage.getChildByName("selectbox"))
                stage.update()
                break
        }
    }

    stage.update();
}

const colorList = ["red", "orange", "yellow", "green", "cyan", "blue", "purple", "pink", "gray", "brown"]
var unusedColors = colorList

window.onload = init