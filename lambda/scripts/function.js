class Function extends createjs.Container {
    constructor(stage, coord, color) {
        super()
        this.color = color
        this.coord = coord

        var rectColorIndex = 0
        var rect = new createjs.Shape()
        this.rectFillCommand = rect.graphics.beginFill(color).command
        rect.graphics.drawRect(0, 0, 50, 50)
        rect.on("dblclick", () => {
            rectColorIndex = (rectColorIndex + 1) % stage.usedColors.length
            this.rectFillCommand.style = stage.usedColors[rectColorIndex]
            this.color = stage.usedColors[rectColorIndex]
            this.parent.tree.getCoord(this.coord).data = this.color
            stage.update()
        })
        this.addChild(rect)

        var input = null
        this.input = input
        var newInput = new createjs.Shape()
        this.newInput = newInput
        newInput.graphics.beginFill("red").drawRoundRect(25 - 4, -4, 8, 8, 3)
        newInput.on("click", () => {this.onNewInput()})
        this.addChild(newInput)

        var newOutput = new createjs.Shape()
        this.newOutput = newOutput
        newOutput.graphics.beginFill("red").drawRoundRect(50 - 4, 50 / 2 - 4, 8, 8, 3)
        newOutput.on("click", () => {this.onNewOutput("lightblue")})
        this.addChild(newOutput)
    }

    setColor(color) {
        this.rectFillCommand.style = color
    }

    onNewOutput(color) {
        var func = new Function(stage, (this.coord.length == 0) ? ["r"] : [...this.coord, "r"], color)
        // console.log(this.parent.tree)
        if (this.input.isParameter) this.parent.tree.getCoord(this.coord).right.obj = func
        // else //ok what do i do with light blue squares
        if (color == "lightblue") func.coord = [...this.coord]
        func.y = this.y
        func.x = this.x + 50 + 25
        // console.log(func)
        this.parent.addChild(func)
        this.removeChild(this.newOutput)
        var output = new Output(this.x, this.y, this.input != null && this.input.isParameter)
        this.parent.addChild(output)
        this.input.output = output
        this.output = output
        this.parent.rightmostFunction = this.parent.children.reduce((p, c) => {return p.x > c.x ? p : c})
        if (this.input != null && this.input.isParameter) this.parent.removeChild(this)
        stage.update()
    }

    onNewInput() {
        this.input = new Input(this, this.x, this.y, "lightblue")
        this.parent.addChildAt(this.input, 0)
        stage.update()
    }
}