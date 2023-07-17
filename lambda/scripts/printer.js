class Printer extends createjs.Container {
    constructor(stage) {
        super()

        var rect = new createjs.Shape()
        rect.graphics.beginFill("yellow").drawRect(0, 0, 50, 50)
        this.addChild(rect)

        var text = new createjs.Text("print")
        this.text = text
        text.x = 50 / 2;
        text.y = 50 / 2
        text.textAlign = "center"
        text.textBaseline = "middle"
        this.addChild(text)
        
        this.on('pressmove', function(e){
            this.x = e.stageX - 50 / 2;
            this.y = e.stageY - 50 / 2;
            stage.update();
        })

        this.addEventListener("touched", function(e) {
            console.log("touched")
        })
    }
    
    onTouched(stage, x, y) {
        var under = getItemsUnderPoint(stage, this.x, this.y + 50 / 2, this)[0]
        if (under != null) {
            this.text.text = getItemsUnderPoint(stage, this.x, this.y + 50 / 2, this)[0].output
        } else {
            this.text.text = "print"
        }
    }
}