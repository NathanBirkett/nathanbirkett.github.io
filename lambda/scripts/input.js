class Input extends createjs.Container {
    constructor(func, x, y, color, coord) {
        super()
        this.color = color
        this.func = func
        this.coord = coord

        var polygon = new createjs.Shape()
        var polyFillCommand = polygon.graphics.beginFill(color).command
        this.polyFillCommand = polyFillCommand
        this.isParameter = false
        this.x = x
        this.y = y
        polygon.graphics.beginStroke().moveTo(0, -25).lineTo(50, -25).lineTo(25 + 25/2, 0).lineTo(25 / 2, 0).lineTo(0, -25)
        this.colorIndex = 0
        polygon.on("dblclick", () => {this.onDoubleClick()})
        this.addChild(polygon)

        // var newInput = new createjs.Shape()
        // newInput.graphics.beginFill("red").drawRoundRect(x + 25 - 4, y - 25 - 4, 8, 8, 3)
        // newInput.on("click", () => {
        //     var func = new Function(stage)
        //     func.x = x
        //     func.y = y - 25 - 50
        //     this.parent.addChild(func)
        //     this.removeChild(newInput)
        //     stage.update()
        // })
        // newInput.name = "newInput"
        // this.addChild(newInput)
    }

    onDoubleClick(newColor, myColor) {
        if (this.polyFillCommand.style == "lightblue") {
            if (!(["abs", "app"].includes(this.parent.tree.data))) {
                this.color = this.func.color
                this.parent.inputColors.push(this.color)
                this.coord = []
                this.isParameter = true
                this.parent.tree = new TreeNode("abs", new TreeNode(this.color), this.parent.tree, this)
                this.func.onNewOutput((newColor == null) ? this.color : newColor)
            } else {
                if (myColor == null) {
                    console.log(this.parent)
                    this.color = colorList[this.parent.inputColors.length]
                    this.parent.inputColors.push(this.color)
                } else this.color = myColor
                console.log(this.color)
                this.isParameter = true
                this.coord = this.func.coord
                this.parent.tree.setCoord(this.coord, new TreeNode("abs", new TreeNode(this.color), this.parent.tree.getCoord(this.coord), this))
                this.func.onNewOutput((newColor == null) ? this.func.color : newColor)
                this.parent.tree.getCoord(this.coord.slice(0, -1)).obj.output.addLength(12.5)
            }
            this.polyFillCommand.style = this.color
        } else {
            this.colorIndex++
            var reset = false
            if (this.colorIndex == stage.usedColors.length) {
                stage.usedColors.push(unusedColors.shift())
                reset = true
            }
            this.color = stage.usedColors[this.colorIndex]
            if (reset) {
                this.colorIndex = -1
            }
            this.polyFillCommand.style = this.color
            //todo actually change tree
        }
        stage.update()
    }
}