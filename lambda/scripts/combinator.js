class Combinator extends createjs.Container {
    constructor(name, nInputs, tree, coord) {
        super()
        this.nInputs = nInputs
        this.coord = coord
        this.tree = tree
        this.name = name
        this.func = this

        var width = nInputs * (50 + 25) - 25
        var height = 50
        this.width = width
        this.height = height

        const inputs = Array(nInputs)
        this.inputs = inputs
        this.fillCommands = []

        for (let i = 0; i < nInputs; i++) {
            var x = i * (50 + 25)
            var polygon = new createjs.Shape()
            this.fillCommands.push(polygon.graphics.beginFill("lightgreen").command)
            polygon.graphics.beginStroke().moveTo(25 + x, 25).lineTo(x, -25).lineTo(50 + x, -25).lineTo(25 + x, 25)
            this.addChild(polygon)
        }

        var rect = new createjs.Shape()
        rect.graphics.beginFill("lightgreen").drawRect(0, 0, width, height)
        this.addChild(rect)

        var newOutput = new createjs.Shape()
        this.newOutput = newOutput
        newOutput.graphics.beginFill("red").drawRoundRect(width - 4, height / 2 - 4, 8, 8, 3)
        newOutput.on("click", () => {this.onNewOutput("lightblue")})
        this.addChild(newOutput)

        var text = new createjs.Text(name)
        text.x = width / 2;
        text.y = height / 2
        text.textAlign = "center"
        text.textBaseline = "middle"
        this.addChild(text)
    }

    onNewOutput(color) {
        var isParameter = false
        var func = new Function(stage, (this.coord.length == 0) ? ["r"] : [...this.coord, "r"], color)
        if (isParameter) this.parent.tree.getCoord(this.coord).right.obj = func
        if (color == "lightblue") func.coord = [...this.coord]
        func.y = this.y
        func.x = this.x + this.width + 25
        this.parent.addChild(func)
        this.removeChild(this.newOutput)
        var output = new Output(this.x + this.width - 50, this.y, this.input != null && isParameter)
        this.parent.addChild(output)
        if (this.input != null) this.input.output = output
        this.output = output
        this.parent.rightmostFunction = this.parent.children.reduce((p, c) => {return p.x > c.x ? p : c})
        stage.update()
    }
}