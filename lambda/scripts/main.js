function getItemsUnderPoint(stage, x, y, obj = undefined) {
    return [... new Set((stage.getObjectsUnderPoint(x, y)).map(function(value){return value.parent}))]
    .filter(function(item){return item != obj && item != stage})
}

function log(e) {
    console.log({...e})
}

function getObjectsInBounds(stage, boxObj, highestLevel) {
    if (highestLevel == null) highestLevel = false
    var box = boxObj.getBounds()
    var objects = []
    function r(obj) {
        if (obj.parent == stage) return obj
        return r(obj.parent)
    }
    for (let i = box.x; i < box.x + box.width; i += 20) {
        for (let j = box.y; j < box.y + box.height; j += 20) {
            var under = [...new Set(stage.getObjectsUnderPoint(i, j).filter(k => k != boxObj && k != stage).map(k => {return highestLevel ? r(k) : k.parent}))].filter(k => k != boxObj)
            if (under.length > 0) {
                objects = objects.concat(under)
            }
        }
    }
    return [...new Set(objects)]
}

function getObjectsInCoords(x, y, width, height, highestLevel) {
    if (highestLevel == null) highestLevel = false
    var objects = []
    function r(obj) {
        if (obj.parent == stage) return obj
        return r(obj.parent)
    }
    for (let i = x; i < x + width; i += 20) {
        for (let j = y; j < y + height; j += 20) {
            var under = [...new Set(
                stage.getObjectsUnderPoint(i, j)
                .filter(k => k != stage)
                .map(k => {return highestLevel ? r(k) : k.parent})
            )]
            // .filter(k => k != boxObj)
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

function replaceCombinators(tree, expr) {
    console.log(tree.copy())
    var nInputs = 0
    reversePostOrder(tree, n => {
        if (n.obj != null && n.obj.tree != null
            && n.obj.coord.length >= n.obj.nInputs
        ) {
            var full = true
            for (var i = 1; i <= n.obj.nInputs; i++) { 
                if (tree.getCoord(n.obj.coord.slice(0, -i)).data != "app") full = false
            }
            console.log(full)
            console.log(n.obj.coord)
            console.log([...n.obj.coord.slice(0, -n.obj.nInputs), ...Array(n.obj.nInputs).fill("r")])
            // if ([...n.obj.coord.slice(0, -n.obj.nInputs), ...Array(n.obj.nInputs).fill("r")] != n.obj.coord) full = false
            for (var i = 0; i < n.obj.coord.length; i++) {
                if (n.obj.coord[i] != [...n.obj.coord.slice(0, -n.obj.nInputs), ...Array(n.obj.nInputs).fill("r")][i]) {
                    full = false
                }
            }
            console.log(full)
            if (full) {
                console.log(n.obj.coord)
                tree.setCoord(n.obj.coord, n.obj.tree)
                postOrder(tree.getCoord(n.obj.coord), node => {
                    if (node.obj != null && node.obj.coord != null) {
                        node.obj.coord = [...n.obj.coord, ...node.obj.coord]
                        node.obj.parent = expr
                    }
                })
                nInputs = n.obj.nInputs
                return false
            }
        }
    })
    return nInputs
}

function helperHelper(tree) {
    console.log(tree)
    var expr = parseHelper(tree)
    if (tree.data == "app") {
        // expr.rightmostFunction.onNewOutput("lightblue")
    }
    return expr
}

function parseHelper(tree) {
    var expr
    console.log(tree.data)
    console.log(colorList)
    console.log(colorList.includes(tree.data))
    if (colorList.includes(tree.data) || colorList.includes(tree.data.slice(0, -1))) {
        var obj = null
        // if (tree.obj instanceof Combinator) {
        //     tree.obj.y = 0
        //     tree.obj.x = 0
        //     obj = tree.obj
        // }
        expr = new Expression(stage, tree.data, obj)
    } else if (tree.data == "abs") {
        expr = new Expression(stage, tree.left.data)
        var func = expr.children[0]
        func.onNewInput() 
        func.input.onDoubleClick(tree.left.data, tree.left.data)
        parseTree(expr.tree.right.obj, tree.right)
    } else if (tree.data == "app") {
        var left = parseHelper(tree.left)
        console.log(left)
        // add(left)
        var right = parseHelper(tree.right)
        console.log(right)
        // add(right)
        if (colorList.includes(right.tree.data.replace(/[0-9]/g, ''))) {
            right.children[0].onNewInput()
        }
        var applier
        if (right.tree.data == "abs") applier = right.tree.obj
        else if (right.tree.data == "app") {
            if (right.tree.right.data != "abs") { 
                if (!["abs", "app", ...colorList].includes(right.tree.right.data)) {
                    console.log(right.rightmostFunction.inputs)
                    applier = right.rightmostFunction.inputs[1] //woahoho there buster
                } else {
                    right.rightmostFunction.onNewOutput("lightblue")
                    right.rightmostFunction.onNewInput()
                    applier = right.rightmostFunction.input
                }
            } else {
                var coord = ["r"]
                while (true) {
                    if (!["abs"].includes(right.tree.getCoord(coord).data)) break
                    coord = [...coord, "r"]
                }
                console.log(coord.slice(0, -1))
                applier = right.tree.getCoord(coord.slice(0, -1)).obj
            }
        } else if (!colorList.includes(right.tree.data.replace(/[0-9]/g, ''))) {
            console.log(right.tree.obj)
            applier = right.tree.obj.inputs[0]
        }
        else applier = right.tree.obj.input
        // console.log(applier)
        expr = left.applyTo(applier)
        // add(expr)
    } else {
        console.log(tree)
        var obj = _.cloneDeep(tree.obj)
        obj.x = 0
        obj.y = 0
        obj.coord = []
        obj.inputs.forEach(i => {i.coord = obj.coord})
        console.log(obj)
        expr = new Expression(stage, tree.data, obj)
        console.log({...expr}.children)
    }
    return expr
}

function parseTree(currObj, tree) {
    var inputIndex
    console.log(tree)
    console.log({...currObj})
    if (tree == null) return tree
    else if (tree.data == "abs") {
        currObj.onNewInput()
        currObj.input.onDoubleClick(tree.left.data, tree.left.data)
        parseTree(currObj.input.parent.tree.getCoord(currObj.coord).right.obj, tree.right)
    } else if (tree.data == "app") { //FIX THIS! ok im on it
        var left = parseHelper(tree.left)
        var c = []
        while (true) {
            if (tree.getCoord(c).right == null) break
            c = [...c, "r"]
        }
        if (tree.obj instanceof Combinator) {
            for (var i = 0; i <= combinatorList.map(e => e.name).indexOf(tree.data); i++) {
                currObj.onChangeCombinator()
            }
            inputIndex = 0
        } else if (tree.getCoord(c).obj instanceof Combinator) {
            var index = parseTree(currObj, tree.right)
            console.log(index)
            console.log(currObj)
            left.applyTo(currObj.comb.inputs[index])
            inputIndex = index + 1
        } else {
            currObj.setColor(tree.right.data)
            currObj.onNewInput()
            left.applyTo(currObj.input)
        }
    } else if (colorList.includes(tree.data) || colorList.includes(tree.data.slice(0, -1))) {
        currObj.setColor(tree.data)
    } else {
        console.log(combinatorList)
        console.log(combinatorList.map(e => e.name))
        console.log(tree.data)
        console.log(combinatorList.map(e => e.name).indexOf(tree.data))
        for (var i = 0; i <= combinatorList.map(e => e.name).indexOf(tree.data); i++) {
            currObj.onChangeCombinator()
        }
        inputIndex = 0
    }
    return inputIndex
}

function newCombinator() {
    var name = document.getElementById("name").value.toUpperCase()
    var inputs = parseInt(document.getElementById("inputs").value)

    var detected = getObjectsInBounds(stage, stage.getChildByName("selectbox"), true)[0]
    var expr = new Expression(stage)
    var tree = detected.tree.copy()
    postHelper(tree, n => {
        if (!["abs", "app"].includes(n.data)) n.data =  n.data + numCombinators
    })
    var comb = new Combinator(name, inputs, tree, [])
    expr.addChild(comb)
    expr.tree = new TreeNode(name, null, null, comb)
    expr.rightmostFunction = comb
    stage.addChild(expr)
    expr.x = window.innerWidth / 2;
    expr.y = window.innerHeight / 2;
    numCombinators++
    keyListening = false
    combinatorList.push(new Combinator(name, inputs, tree, []))
    updateCombinators()
    document.getElementById("popup").style.zIndex = "-1"
    document.getElementById("name").value = ""
    document.getElementById("inputs").value = ""
    stage.update()
}

function updateCombinators() {
    var background = new createjs.Shape()
    background.graphics.beginFill("lightgrey").drawRect(0, 0, 200, window.innerHeight)
    stage.addChildAt(background, 0)
    for (var i = 0; i < combinatorList.length; i++) {
        var comb = combinatorList[i]
        stage.addChild(comb.clone())
        console.log(comb)
        var view = new CombinatorViewer(comb)
        view.x = 50
        view.y = i * 200 + 100 + 25
        // console.log(view)
        stage.addChild(view)
    }
    stage.update()
}

var stage
var keyListening
var combinatorName
var combinatorInputs
var numCombinators = 0
var combinatorList = []

function init() {
    var canvas = document.getElementById("canvas")
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    stage = new createjs.Stage("canvas")
    stage.usedColors = []

    var addLambda = new Button("add lambda", () => {
        var expression = new Expression(stage, "red")
        console.log(unusedColors)
        unusedColors.splice(unusedColors.indexOf("red"), 1)
        console.log(unusedColors)
        stage.addChild(expression)
        expression.x = window.innerWidth / 2;
        expression.y = window.innerHeight / 2;
        stage.update()
    })
    stage.addChild(addLambda)

    var addCombinator = new Button("add combinator", () => {
        document.getElementById("popup").style.zIndex = "1"
        keyListening = true
        stage.update()
    }, true)
    addCombinator.x = 100
    stage.addChild(addCombinator)

    var betaReduce = new Button("\u03b2-reduce", () => {
        var expr = getObjectsInBounds(stage, stage.getChildByName("selectbox"), true)[0]
        var iterations = (expr.tree.data == "app" && expr.tree.right.data == "abs") ? 1 : Math.max(1, replaceCombinators(expr.tree, expr))
        const x = expr.rightmostFunction.x + expr.x
        const y = expr.rightmostFunction.y + expr.y
        stage.removeChild(expr)
        var newExpr
        console.log(iterations)
        // var iterated = 0;
        for (var i = 0; i < iterations; i++) {
            console.log(expr.tree.copy())
            postOrder(expr.tree, node => {if (node.data == "app" && node.right.data == "abs") { //for some reason this stops working with combinators
                var variable = node.right.left.data
                console.log(variable)
                postHelper(node.right.right, n => {
                    if (n.data == variable) {
                        n.obj.parent.tree.setCoord(n.obj.coord, node.left)
                    }
                })
                node.right.obj.parent.tree.setCoord(node.right.obj.coord.slice(0, -1), node.right.right)
                // iterated++
                return false
            }
            })
            console.log(expr.tree.copy())
            newExpr = helperHelper(expr.tree)
            expr = newExpr
        }

        console.log(newExpr)
        add(newExpr)
        
        // stage.removeChild(expr)
        // var tree = expr.tree
        // var newExpr = helperHelper(tree)
        // stage.addChild(newExpr)
        // newExpr.x = x - newExpr.rightmostFunction.x
        // newExpr.y = y - newExpr.rightmostFunction.y

        stage.update()
    })
    betaReduce.x = 200
    stage.addChild(betaReduce)

    var trash = new Button("trash", () => {
        var obj = getObjectsInBounds(stage, stage.getChildByName("selectbox"), true)[0]
        console.log(obj)
        stage.removeChild(obj)
        stage.update()
    })
    trash.x = 300
    stage.addChild(trash)

    var parse = new Button("parse", () => {
        var expr = getObjectsInBounds(stage, stage.getChildByName("selectbox"), true)[0]
        stage.removeChild(expr)
        var newExpr = helperHelper(expr.tree)
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
        document.getElementById("popup").style.zIndex = "-1"
        if (!(getItemsUnderPoint(stage, e.stageX, e.stageY)[0] instanceof Button)) {
            stage.removeChild(stage.getChildByName("selectbox"))
            stage.update()
        }
        if (stage.getObjectsUnderPoint(e.stageX, e.stageY).filter((i) => i != stage.getChildByName("selectbox")).length == 0) {
            stage.pressed = true
            stage.downX = e.stageX
            stage.downY = e.stageY
        }
    })

    

    stage.on("stagemousemove", (e) => {
        stage.children.forEach(i => {
            if (i.clicked) e.target = i
        });
        if (e.target != stage) e.target.pressMove(e)
        if (stage.pressed) {
            stage.removeChild(stage.getChildByName("selectbox"))
            var box = new createjs.Shape()
            box.graphics.beginFill("aliceblue").drawRect(stage.downX, stage.downY, e.stageX - stage.downX, e.stageY - stage.downY)
            box.name = "selectbox"
            box.setBounds(stage.downX, stage.downY, e.stageX - stage.downX, e.stageY - stage.downY)
            stage.addChildAt(box, 0)
            stage.update()
        }
    })

    stage.on("stagemouseup", (e) => {
        stage.pressed = false
        stage.children.forEach(i =>{
            if (i.clicked) i.clicked = false
        })
        // stage.off("stagemousemove", stageMouseMove)
    })

    

    document.onkeydown = (e) => {
        switch (e.key) {
            case "Escape":
                stage.removeChild(stage.getChildByName("selectbox"))
                stage.update()
                break
        }
        if (keyListening) {
            if (combinatorName == null) combinatorName = e.key.toUpperCase()
            else if (combinatorInputs == null) {
                combinatorInputs = e.key
                // var detected = getObjectsInBounds(stage, stage.getChildByName("selectbox"), true)[0]
                // var expr = new Expression(stage)
                // var tree = detected.tree.copy()
                // postHelper(tree, n => {
                //     if (!["abs", "app"].includes(n.data)) n.data = numCombinators + n.data
                // })
                // var comb = new Combinator(combinatorName, combinatorInputs, tree, [])
                // expr.addChild(comb)
                // expr.tree = new TreeNode(combinatorName, null, null, comb)
                // expr.rightmostFunction = comb
                // stage.addChild(expr)
                // expr.x = window.innerWidth / 2;
                // expr.y = window.innerHeight / 2;
                // numCombinators++
                // keyListening = false
                // combinatorList.push(new Combinator(combinatorName, combinatorInputs, tree, []))
                // combinatorName = null
                // combinatorInputs = null
                // updateCombinators()
                // stage.update()
            }
        }
    }

    

    // var K = new TreeNode("abstraction", "red", new TreeNode("abstraction", "orange", "red"))

    stage.update();
}

const colorList = ["red", "orange", "yellow", "lime", "olive", "green", "teal", "navy", "cyan", "blue", "purple", "magenta", "maroon", "gray", "silver", "tan"]
var unusedColors = [...colorList]

window.onload = init