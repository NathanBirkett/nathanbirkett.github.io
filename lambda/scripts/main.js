class Expression extends createjs.Container {
    constructor(stage) {
        super()

        this.on("mousedown", e => {
            this.clickX = e.stageX - this.x
            this.clickY = e.stageY - this.y
            stage.setChildIndex(this, stage.numChildren - 1)
        })

        this.on('pressmove', function(e) {
            var detector = new createjs.Shape()
            detector.setBounds(this.x, this.y + 25, 50, 50)
            // console.log(this.children[0])
            var det = getObjectsInBounds(stage, detector).filter(i => i instanceof Input && this.children[0] != i)
            if (det.length > 0) {
                var detected = det[0]
                console.log(detected.parent)
                this.x = detected.parent.x
                this.y = detected.parent.y - 75
            } else {
                this.x = e.stageX - this.clickX;
                this.y = e.stageY - this.clickY;
            }
            stage.update();
        })

        var color = unusedColors.shift()
        var func = new Function(stage, null, color);
        stage.usedColors.push(color)

        this.tree = new TreeNode(color)
        console.log(this.tree)

        this.addChild(func)
    }


}

function getItemsUnderPoint(stage, x, y, obj = undefined) {
    return [... new Set((stage.getObjectsUnderPoint(x, y)).map(function(value){return value.parent}))]
    .filter(function(item){return item != obj})
}

function getObjectsInBounds(stage, boxObj) {
    var box = boxObj.getBounds()
    var objects = []
    for (let i = box.x; i < box.x + box.width; i += 10) {
        for (let j = box.y; j < box.y + box.height; j += 10) {
            var under = [...new Set(stage.getObjectsUnderPoint(i, j).filter(k => k != boxObj).map(k => k.parent))].filter(k => k != boxObj)
            if (under.length > 0) {
                objects = objects.concat(under)
            }
        }
    }
    return [...new Set(objects)]
}

var stage

function init() {
    var canvas = document.getElementById("canvas")
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    stage = new createjs.Stage("canvas")
    stage.usedColors = []

    var addLambda = new Button("add lambda", () => {
        var expression = new Expression(stage)
        stage.addChild(expression)
        expression.x = window.innerWidth / 2;
        expression.y = window.innerHeight / 2;
        stage.update()
    })
    stage.addChild(addLambda)

    var addCombinator = new Button("add combinator", () => {
        var boxObj = stage.getChildByName("selectbox")
        console.log(getObjectsInBounds(stage, boxObj))
        stage.addChild(new Combinator(stage, "Combinator", getObjectsInBounds(stage, stage.getChildByName("selectbox"))[0].parent.usedColors.length - 1))
        stage.update()
    })
    addCombinator.x = 100
    stage.addChild(addCombinator)

    var trash = new Button("trash", () => {
        stage.removeChild(getObjectsInBounds(stage, stage.getChildByName("selectbox"))[0].parent)
        stage.update()
    })
    trash.x = 200
    stage.addChild(trash)

    stage.on("stagemousedown", (e) => {
        stage.pressed = true
        stage.downX = e.stageX
        stage.downY = e.stageY
    })

    stage.on("stagemouseup", (e) => {
        stage.pressed = false
    })

    stage.on("stagemousemove", (e) => {
        if (stage.pressed && stage.getObjectsUnderPoint(e.stageX, e.stageY).filter((i) => i != stage.getChildByName("selectbox")).length == 0) {
            stage.removeChild(stage.getChildByName("selectbox"))
            var box = new createjs.Shape()
            box.graphics.beginFill("aliceblue").drawRect(stage.downX, stage.downY, e.stageX - stage.downX, e.stageY - stage.downY)
            box.name = "selectbox"
            box.setBounds(stage.downX, stage.downY, e.stageX - stage.downX, e.stageY - stage.downY)
            stage.addChildAt(box, 0)
            stage.update()
        }
    })

    document.onkeydown = (e) => {
        switch (e.key) {
            case "Escape":
                stage.removeChild(stage.getChildByName("selectbox"))
                stage.update()
                break
        }
    }

    // var K = new TreeNode("abstraction", "red", new TreeNode("abstraction", "orange", "red"))

    stage.update();
}

const colorList = ["red", "orange", "yellow", "green", "cyan", "blue", "purple", "pink", "gray", "brown"]
var unusedColors = colorList

window.onload = init