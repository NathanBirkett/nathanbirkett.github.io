class Combinator extends createjs.Container {
    constructor(name, nInputs, tree, coord) {
        super()
        this.nInputs = nInputs
        this.coord = coord
        this.tree = tree
        this.name = name
        this.func = this
        this.combIndex = 0

        var width = Math.max(nInputs * (50 + 25) - 25, 50)
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
        this.body = new createjs.Shape()
        // body.graphics.beginFill("lightgreen").beginStroke().moveTo(0, 0).lineTo(this.width, 0).lineTo(this.width, 25).lineTo(this.width / 2 + 25, 50).lineTo(this.width / 2 - 25, 50).lineTo(0, 25).lineTo(0, 0)
        this.body.graphics.beginFill("lightgreen").beginStroke().moveTo(0, 0).lineTo(this.width, 0).lineTo(this.width, 50).lineTo(this.width - 50, 50).lineTo(0, 25).lineTo(0, 0)
        this.addChild(this.body)

        this.newOutput = new createjs.Shape()
        this.newOutput.graphics.beginFill("red").drawRoundRect(width - 4, height / 2 - 4, 8, 8, 3)
        this.newOutput.on("click", () => {this.onNewOutput("lightblue")})
        this.addChild(this.newOutput)

        this.changeCombinator = new createjs.Shape()
        this.changeCombinator.graphics.beginFill("red").drawRoundRect(-4, height / 2 - 4, 8, 8, 3)
        this.changeCombinator.on("click", () => {this.onChangeCombinator()})
        this.addChild(this.changeCombinator)

        this.text = new createjs.Text(name)
        this.text.x = width / 2;
        this.text.y = height / 2
        this.text.textAlign = "center"
        this.text.textBaseline = "middle"
        this.addChild(this.text)
    }

    onChangeCombinator() {
        console.log(this.combIndex)
        var comb = combinatorList[this.combIndex].copy()
        comb.coord = this.coord
        comb.inputs.forEach(i => {i.coord = comb.coord})
        this.comb = comb
        this.parent.addChild(comb)
        this.parent.tree.setCoord(this.coord, new TreeNode(comb.name, null, null, comb))
        comb.x = this.x
        comb.y = this.y
        console.log(numCombinators)
        this.combIndex = (this.combIndex + 1) % numCombinators
        comb.combIndex = this.combIndex
        console.log(this.combIndex)
        if (this.parent.rightmostFunction == this) this.parent.rightmostFunction = this.comb
        this.parent.removeChild(this)
        stage.update()
    }

    addLength(length, input) {
        this.width += length
        this.body.graphics.clear().beginFill("lightgreen").beginStroke().moveTo(0, 0).lineTo(this.width, 0).lineTo(this.width, 50).lineTo(this.width - 50, 50).lineTo(0, 25).lineTo(0, 0)
        this.text.x = this.width / 2
        this.text.y = this.height / 2
        this.newOutput.graphics.clear().beginFill("red").drawRoundRect(this.width - 4, this.height / 2 - 4, 8, 8, 3)
        for (var i = input; i < this.nInputs; i++) {
            this.inputs[i].x += length
        }
        stage.update()
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
            console.log("mousedown")
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