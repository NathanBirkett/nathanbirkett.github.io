class Button extends createjs.Container {
    constructor(displayText, onClick, keepSelection) {
        super()
        var rect = new createjs.Shape()
        rect.graphics.beginFill("green").drawRect(0, 0, 100, 50)
        this.addChild(rect)

        var text = new createjs.Text(displayText)
        text.x = 100 / 2;
        text.y = 50 / 2
        text.textAlign = "center"
        text.textBaseline = "middle"
        this.addChild(text)

        this.on("click", e => {
            onClick()
            if (keepSelection != true) stage.removeChild(stage.getChildByName("selectbox"))
            stage.update()
        })
    }
}