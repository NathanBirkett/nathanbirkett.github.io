function Abstraction(stage, output) {
    var expression = new Expression(stage)
    var func = new Function(stage);
    expression.addChild(func)
    stage.addChild(expression)
    expression.x = window.innerWidth / 2;
    expression.y = window.innerHeight / 2;
    stage.update()

    input = new Input(stage, func.x, func.y)
    func.parent.addChildAt(input, 0)
    // func.removeChild(newInput)
    stage.update()

    polyFillCommand.style = unusedColors.shift()
    this.parent.usedColors.push(polyFillCommand.style)
    this.removeChild(newInput)
    this.isParameter = true
    stage.update()

    var nFunc = new Function(stage)
    nFunc.y = func.y
    nFunc.x = func.x + 50 + 25
    func.parent.addChild(nFunc)
    // func.removeChild(newOutput)
    func.parent.addChild(new Output(stage, func.x, func.y, input != null && input.isParameter))
    if (input != null && input.isParameter) func.parent.removeChild(func)
    stage.update()
}