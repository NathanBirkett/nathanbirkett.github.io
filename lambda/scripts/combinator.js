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

        const inputs = Array()
        this.inputs = inputs
        this.fillCommands = []

        for (let i = 0; i < nInputs; i++) {
            var x = i * (50 + 25)
            var input = new CombinatorInput(this)
            input.x = x
            this.inputs.push(input)
            this.addChild(input)
        }

        // var rect = new createjs.Shape()
        // rect.graphics.beginFill("lightgreen").drawRect(0, 0, width, height)
        // this.addChild(rect)
        var body = new createjs.Shape()
        // body.graphics.beginFill("lightgreen").beginStroke().moveTo(0, 0).lineTo(this.width, 0).lineTo(this.width, 25).lineTo(this.width / 2 + 25, 50).lineTo(this.width / 2 - 25, 50).lineTo(0, 25).lineTo(0, 0)
        body.graphics.beginFill("lightgreen").beginStroke().moveTo(0, 0).lineTo(this.width, 0).lineTo(this.width, 50).lineTo(this.width - 50, 50).lineTo(0, 25).lineTo(0, 0)
        this.addChild(body)

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

    copy() {
        return new Combinator((" " +this.name).slice(1), this.nInputs, this.tree.copy(), [...this.coord])
    }
}

class CombinatorViewer extends createjs.Container {
    constructor(comb) {
        super()
        this.comb = comb

        this.addChild(comb)

        this.on("mousedown", e => {
            var expr = new Expression(stage)
            var newComb = this.comb.copy()
            console.log(newComb.tree)
            expr.addChild(newComb)
            expr.tree = new TreeNode(newComb.name, null, null, newComb)
            stage.addChild(expr)
            expr.x = window.innerWidth / 2;
            expr.y = window.innerHeight / 2;
            expr.rightmostFunction = newComb
            stage.setChildIndex(expr, stage.numChildren - 1)
            stage.update()
        })
    }
}