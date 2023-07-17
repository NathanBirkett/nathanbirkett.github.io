class Combinator extends createjs.Container {
    constructor(stage, text, nInputs) {
        super()
        this.nInputs = nInputs
        var width = nInputs * 50
        var height = 50

        this.outputX = width / 2 + 50
        this.outputY = 0

        const inputs = Array(nInputs)
        this.inputs = inputs
        this.output = text
        this.fillCommands = []

        for (let i = 0; i < nInputs * 50; i += 50) {
            var polygon = new createjs.Shape()
            this.fillCommands.push(polygon.graphics.beginFill("lightgreen").command)
            polygon.graphics.beginStroke().moveTo(25 + i, 25).lineTo(i, -25).lineTo(50 + i, -25).lineTo(25 + i, 25)
            polygon.name = "input" + i / 50
            this.addChild(polygon)
        }

        var rect = new createjs.Shape()
        rect.graphics.beginFill("lightgreen").drawRect(0, 0, width, height)
        this.addChild(rect)

        var out = new createjs.Shape()
        out.graphics.beginFill("lightgreen").drawRect(width / 2 - 50 / 2, height, 50, 25)
        this.addChild(out)

        var text = new createjs.Text(text)
        text.x = width / 2;
        text.y = height / 2
        text.textAlign = "center"
        text.textBaseline = "middle"
        this.addChild(text)
        this.on('pressmove', function(e){
            this.x = e.stageX - width / 2;
            this.y = e.stageY - height / 2;
            stage.update();
        })
    }

    onTouched(stage, x, y) {
        for (let i = 0; i < this.inputs.length; i++) {
            this.inputs[i] = getItemsUnderPoint(stage, this.x - 25, this.y + 25 + i * 50, this)[0]
        }
    }
}