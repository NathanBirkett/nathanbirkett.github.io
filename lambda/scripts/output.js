class Output extends createjs.Container {
    constructor(x, y, isParameter, length) {
        super()
        this.x = x
        this.y = y
        if (length == null) length = 25
        this.length = length

        // if (isParameter) {
        //     var down = new createjs.Shape()
        //     down.graphics.beginFill("black").drawRect(25 - 2, 0, 4, 25 + 2)
        //     this.addChild(down)
    
        //     var line = new createjs.Shape()
        //     line.graphics.beginFill("black").drawRect(25 - 2, 0 + 25 - 2, 50 + 2 - 10, 4)
        //     this.addChild(line)
    
        //     var point = new createjs.Shape()
        //     point.graphics.beginFill("black").beginStroke().moveTo(65, 25 - 10).lineTo(65 + 10, 25).lineTo(65, 25 + 10).lineTo(65, 25 - 10)
        //     this.addChild(point)
        // } else {
        //     var line = new createjs.Shape()
        //     line.graphics.beginFill("black").drawRect(50, 25 - 2, 15, 4)
        //     this.addChild(line)

        //     var point = new createjs.Shape()
        //     point.graphics.beginFill("black").beginStroke().moveTo(65, 25 - 10).lineTo(75, 25).lineTo(65, 25 + 10).lineTo(65, 25 - 10)
        //     this.addChild(point)
        // }
        if (isParameter) {
            var down = new createjs.Shape()
            down.graphics.beginFill("lightblue").drawRect(12.5, 0, 25, 37.5)
            this.addChild(down)

            var across = new createjs.Shape()
            across.graphics.beginFill("lightblue")
            this.acrossFillCommand = across.graphics.drawRect(12.5, 12.5, 37.5 + this.length, 25).command
            this.addChild(across)
        } else {
            var across = new createjs.Shape()
            across.graphics.beginFill("lightblue")
            this.acrossFillCommand = across.graphics.drawRect(50, 12.5, this.length, 25).command
            this.addChild(across)
        }
    }

    setLength(length) {
        console.log(length)
        this.length = length
        this.acrossFillCommand.w = length
        console.log(this.acrossFillCommand)
    }

    addLength(length) {
        this.length = length
        this.acrossFillCommand.w += length
    }
}