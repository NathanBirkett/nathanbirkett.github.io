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


function add(exp) {
    stage.addChild(exp)
    exp.x = window.innerWidth / 2;
    exp.y = window.innerHeight / 2;
    stage.update()
}

function helperHelper(tree) {
    console.log(tree)
    var expr = parseHelper(tree)
    if (tree.data == "app") {
        // expr.rightmostFunction.onNewOutput("lightblue")
    }
    return expr
}

function parseHelper(tree) { //perhaps include callback
    // console.log(tree)
    var expr
    if (!["abs", "app"].includes(tree.data)){
        expr = new Expression(stage, tree.data)
    } else if (tree.data == "abs") {
        expr = new Expression(stage, tree.left.data)
        var func = expr.children[0]
        func.onNewInput() 
        func.input.onDoubleClick(tree.left.data, tree.left.data)
        parseTree(expr.tree.right.obj, tree.right)
    } else if (tree.data == "app") {
        var left = parseHelper(tree.left)
        var right = parseHelper(tree.right)
        if (right.tree.data != "abs" && right.tree.data != "app") {
            right.children[0].onNewInput()
        }
        // console.log(right.tree)
        var applier
        if (right.tree.data == "abs") applier = right.tree.obj
        else if (right.tree.data == "app") {
            if (right.tree.right.data != "abs") {
                right.rightmostFunction.onNewOutput("lightblue") //maybe better way to find new output
                right.rightmostFunction.onNewInput()
                applier = right.rightmostFunction.input
            } else {
                var coord = []
                while (true) {
                    if (!["abs", "app"].includes(right.tree.getCoord(coord).data)) break
                    coord = [...coord, "r"]
                }
                applier = right.tree.getCoord(coord.slice(0, -1)).obj
            }
        }
        else applier = right.tree.obj.input
        // console.log(applier)
        expr = left.applyTo(applier)
    }
    return expr
}


function parseTree(currObj, tree) {
    if (tree == null) return tree
    else if (tree.data == "abs") {
        currObj.onNewInput()
        currObj.input.onDoubleClick(tree.left.data, tree.left.data)
        parseTree(currObj.input.parent.tree.getCoord(currObj.coord).right.obj, tree.right)
    } else if (tree.data == "app") {
        currObj.setColor(tree.right.data)
        currObj.onNewInput() //tree.right isn't used??
        var left = parseHelper(tree.left)
        left.applyTo(currObj.input)
    } else {
        currObj.setColor(tree.data)
    }
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
        // console.log(getObjectsInBounds(stage, boxObj))
        stage.addChild(new Combinator(stage, "Combinator", getObjectsInBounds(stage, stage.getChildByName("selectbox"))[0].parent.usedColors.length - 1))
        stage.update()
    })
    addCombinator.x = 100
    stage.addChild(addCombinator)

    var betaReduce = new Button("\u03b2-reduce", () => {
        var expr = getObjectsInBounds(stage, stage.getChildByName("selectbox"), true)[0]
        // console.log(expr.tree)
        postOrder(expr.tree, node => {if (node.data == "app" && node.right.data == "abs") {
            // console.log("next")
            var variable = node.right.left.data
            postOrder(node.right.right, n => {
                if (n.data == variable) {
                    n.obj.parent.tree.setCoord(n.obj.coord, node.left) // for some reason this is not visiting the left node
                }
            })
            // console.log(node.right.obj.coord.slice(0, -1))
            // console.log(node.right.right)
            node.right.obj.parent.tree.setCoord(node.right.obj.coord.slice(0, -1), node.right.right)
            expr.tree = node.right.obj.parent.tree
            return false
        }
        })
        stage.removeChild(expr)
        // tree = new TreeNode("app", new TreeNode("yellow"), new TreeNode("red"))
        tree = expr.tree
        var newExpr = helperHelper(tree)
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
        var newExpr = helperHelper(expr.tree)
        // console.log(newExpr)
        stage.addChild(newExpr)
        newExpr.x = window.innerWidth / 2;
        newExpr.y = window.innerHeight / 2;

        stage.update()
    })
    parse.x = 400
    stage.addChild(parse)

    var print = new Button("print", () => {
        console.log(getObjectsInBounds(stage, stage.getChildByName("selectbox"), true)[0])
    })
    print.x = 500
    stage.addChild(print)

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