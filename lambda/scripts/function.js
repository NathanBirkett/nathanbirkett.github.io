class Function extends createjs.Container {
    constructor(stage, output, color) {
        super()

        var rectColorIndex = 0
        var rect = new createjs.Shape()
        console.log(color)
        this.rectFillCommand = rect.graphics.beginFill(color).command
        rect.graphics.drawRect(0, 0, 50, 50)
        rect.on("dblclick", () => {
            console.log(stage.usedColors)
            rectColorIndex = (rectColorIndex + 1) % stage.usedColors.length
            this.rectFillCommand.style = stage.usedColors[rectColorIndex]
            color = stage.usedColors[rectColorIndex]
            console.log(this.parent.tree)
            stage.update()
        })
        this.addChild(rect)

        var input = null
        var newInput = new createjs.Shape()
        newInput.graphics.beginFill("red").drawRoundRect(25 - 4, -4, 8, 8, 3)
        newInput.on("click", () => {
            if (this.parent.tree.data == "abs") {
                color = unusedColors[0]
                stage.usedColors.push(unusedColors.shift())
            } 
            input = new Input(stage, this.x, this.y, color)
            this.parent.addChildAt(input, 0)

            function r(t) {
                if (t.right == null) {
                    return new TreeNode("abs", color, t)
                }
                return new TreeNode(t.data, t.left, r(t.right))
            }
            this.parent.tree = r(this.parent.tree)
            console.log(this.parent.tree)

            this.removeChild(newInput)
            var func = new Function(stage, null, color)
            func.y = this.y
            func.x = this.x + 50 + 25
            this.parent.addChild(func)
            this.removeChild(newOutput)
            this.parent.addChild(new Output(stage, this.x, this.y, input != null))
            this.parent.removeChild(this)
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

    setColor(color) {
        this.rectFillCommand.style = color
    }
}