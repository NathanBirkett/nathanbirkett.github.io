class Function extends createjs.Container {
    constructor(stage, parentNode, color) {
        super()
        this.color = color
        this.parentNode = parentNode

        var rectColorIndex = 0
        var rect = new createjs.Shape()
        this.rectFillCommand = rect.graphics.beginFill(color).command
        rect.graphics.drawRect(0, 0, 50, 50)
        rect.on("dblclick", () => {
            console.log(stage.usedColors)
            rectColorIndex = (rectColorIndex + 1) % stage.usedColors.length
            this.rectFillCommand.style = stage.usedColors[rectColorIndex]
            color = stage.usedColors[rectColorIndex]
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
        var func = new Function(stage, (this.parentNode == null) ? this.parent.tree : this.parent.tree.right, color)
            func.y = this.y
            func.x = this.x + 50 + 25
            console.log(func)
            this.parent.addChild(func)
            this.removeChild(this.newOutput)
            this.parent.addChild(new Output(this.x, this.y, this.input != null && this.input.isParameter))
            if (this.input != null && this.input.isParameter) this.parent.removeChild(this)
            stage.update()
    }

    onNewInput() {
        this.input = new Input(this, this.x, this.y, "lightblue")
        this.parent.addChildAt(this.input, 0)
        
        // var ths = this
        // function r(t) {
        //     if (t.right == null) {
        //         return new TreeNode("abs", new TreeNode(ths.color), t)
        //     }
        //     return new TreeNode(t.data, t.left, r(t.right))
        // }
        // this.parent.tree = r(this.parent.tree)
        // console.log(this.treeNode(this.parent.tree))

        // this.parent.addChild(new Output(stage, this.x, this.y, this.input != null))
        // var func = new Function(stage, null, this.color)
        // func.y = this.y
        // func.x = this.x + 50 + 25
        // this.parent.addChild(func)
        // this.parent.removeChild(this)
        stage.update()
    }
}