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
            // rectColorIndex = (rectColorIndex + 1) % (stage.usedColors.length + 1)
            rectColorIndex++
            console.log(rectColorIndex)
            var reset = false
            if (rectColorIndex == stage.usedColors.length) {
                stage.usedColors.push(unusedColors.shift())
                reset = true
            }
            console.log(stage.usedColors)
            console.log(unusedColors) //what happened to yellow
            this.rectFillCommand.style = stage.usedColors[rectColorIndex]
            this.color = stage.usedColors[rectColorIndex]
            this.parent.tree.getCoord(this.coord).data = this.color
            if (reset) {
                rectColorIndex = -1
            }
            console.log(rectColorIndex)
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

        this.combIndex = 0
        var changeCombinator = new createjs.Shape()
        this.changeCombinator = changeCombinator
        changeCombinator.graphics.beginFill("red").drawRoundRect(-4, 50 / 2 - 4, 8, 8, 3)
        changeCombinator.on("click", () => {this.onChangeCombinator()})
        this.addChild(changeCombinator)

    }

    setColor(color) {
        this.color = color
        this.rectFillCommand.style = color
        this.parent.tree.getCoord(this.coord).data = color
    }

    onChangeCombinator() {
        var comb = combinatorList[this.combIndex].copy()
        this.comb = comb
        this.parent.addChild(comb)
        this.parent.tree.setCoord(this.coord, new TreeNode(comb.name, null, null, comb))
        comb.x = this.x
        comb.y = this.y
        this.combIndex = (this.combIndex + 1) % numCombinators
        this.parent.removeChild(this)
        stage.update()
    }

    onNewOutput(color) {
        var isParameter = false
        if (this.input != null) isParameter = this.input.isParameter
        var func = new Function(stage, (this.coord.length == 0) ? ["r"] : [...this.coord, "r"], color)
        console.log(func.coord)
        if (isParameter) this.parent.tree.getCoord(this.coord).right.obj = func
        if (color == "lightblue") func.coord = [...this.coord] //maybe leave as this.coord, "r"
        func.y = this.y
        func.x = this.x + 50 + 25
        this.removeChild(this.newOutput)
        var output = new Output(this.x, this.y, this.input != null && isParameter)
        this.parent.addChild(output)
        this.parent.addChild(func)
        if (this.input != null) this.input.output = output
        this.output = output
        this.parent.rightmostFunction = this.parent.children.reduce((p, c) => {return p.x > c.x ? p : c})
        if (this.input != null && isParameter) this.parent.removeChild(this)
        stage.update()
    }

    onNewInput() {
        this.input = new Input(this, this.x, this.y, "lightblue")
        this.parent.addChildAt(this.input, 0)
        stage.update()
    }
}