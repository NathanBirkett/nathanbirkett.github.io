class Input extends createjs.Container {
    constructor(stage, x, y, color) {
        super()

        var polygon = new createjs.Shape()
        var polyFillCommand = polygon.graphics.beginFill(color).command
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