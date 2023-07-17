class Output extends createjs.Container {
    constructor(stage, x, y, isParameter) {
        super()

        if (isParameter) {
            var down = new createjs.Shape()
            down.graphics.beginFill("black").drawRect(x + 25 - 2, y, 4, 25 + 2)
            this.addChild(down)
    
            var line = new createjs.Shape()
            line.graphics.beginFill("black").drawRect(x + 25 - 2, y + 25 - 2, 50 + 2 - 10, 4)
            this.addChild(line)
    
            var point = new createjs.Shape()
            point.graphics.beginFill("black").beginStroke().moveTo(x + 65, y + 25 - 10).lineTo(x + 65 + 10, y + 25).lineTo(x + 65, y + 25 + 10).lineTo(x + 65, y + 25 - 10)
            this.addChild(point)
        } else {
            var line = new createjs.Shape()
            line.graphics.beginFill("black").drawRect(x + 50, y + 25 - 2, 15, 4)
            this.addChild(line)

            var point = new createjs.Shape()
            point.graphics.beginFill("black").beginStroke().moveTo(x + 65, y + 25 - 10).lineTo(x + 75, y + 25).lineTo(x + 65, y + 25 + 10).lineTo(x + 65, y + 25 - 10)
            this.addChild(point)
        }
        
    }
}