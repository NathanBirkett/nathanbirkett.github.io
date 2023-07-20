function getItemsUnderPoint(stage, x, y, obj = undefined) {
    return [... new Set((stage.getObjectsUnderPoint(x, y)).map(function(value){return value.parent}))]
    .filter(function(item){return item != obj})
}

function getObjectsInBounds(stage, boxObj, highestLevel) {
    if (highestLevel == null) highestLevel = false
    var box = boxObj.getBounds()
    var objects = []
    function r(obj) {
        if (obj.parent == stage) return obj
        return r(obj.parent)
    }
    for (let i = box.x; i < box.x + box.width; i += 10) {
        for (let j = box.y; j < box.y + box.height; j += 10) {
            var under = [...new Set(stage.getObjectsUnderPoint(i, j).filter(k => k != boxObj && k != stage).map(k => {return highestLevel ? r(k) : k.parent}))].filter(k => k != boxObj)
            if (under.length > 0) {
                objects = objects.concat(under)
            }
        }
    }
    return [...new Set(objects)]
}


function parseTree(tree) {//TODO this function needs to do recursion properly
    console.log(tree)
    var newExpr
    postOrder(tree, node => {
        if (!["abs", "app"].includes(node.data)) {
            newExpr = new Expression(stage, node.data)
            return true //AHHH this still needs to recurse properly
        } else if (node.data == "abs") {
            var expr = new Expression(stage, node.left.data)
            var func = expr.children[0]
            func.onNewInput()
            func.input.onDoubleClick(node.left.data)
        }
        // if (node.data == "abs") {
        //     newExpr = new Expression(stage, node.left.data)
        //     var func = newExpr.children[0]
        //     func.onNewInput()
        //     func.input.onDoubleClick(node.right.data) 
        // } else if (node.data == "app") {

        // } else {
        //     newExpr = new Expression(stage, node.data)
        //     console.log(newExpr)
        // }
    })
    return newExpr
}

var stage

function init() {

    

    var canvas = document.getElementById("canvas")
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    stage = new createjs.Stage("canvas")
    stage.usedColors = []

    var addLambda = new Button("add lambda", () => {
        var expression = new Expression(stage, unusedColors.shift())
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

    var betaReduce = new Button("\u03b2-reduce", () => {
        var expr = getObjectsInBounds(stage, stage.getChildByName("selectbox"), true)[0]
        postOrder(expr.tree, node => {if (node.data == "app") {
            var variable = node.right.left.data
            postOrder(node.right.right, n => {
                if (n.data == variable) {
                    n.data = node.left.data
                }
            })
            expr.tree = node.right.right
        }
        })
        tree = expr.tree
        stage.removeChild(expr)
        console.log(tree)
        var newExpr = parseTree(tree, newExpr)
        console.log(newExpr.tree)
        stage.addChild(newExpr)
        newExpr.x = window.innerWidth / 2;
        newExpr.y = window.innerHeight / 2;

        stage.update()
    })
    betaReduce.x = 200
    stage.addChild(betaReduce)

    var trash = new Button("trash", () => {
        stage.removeChild(getObjectsInBounds(stage, stage.getChildByName("selectbox"))[0].parent)
        stage.update()
    })
    trash.x = 300
    stage.addChild(trash)

    var parse = new Button("parse", () => {
        var expr = getObjectsInBounds(stage, stage.getChildByName("selectbox"), true)[0]
        stage.removeChild(expr)
        var newExpr = parseTree(expr.tree)
        console.log(newExpr)
        stage.addChild(newExpr)
        newExpr.x = window.innerWidth / 2;
        newExpr.y = window.innerHeight / 2;

        stage.update()
    })
    parse.x = 400
    stage.addChild(parse)

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