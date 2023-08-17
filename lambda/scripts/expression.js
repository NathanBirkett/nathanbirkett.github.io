class Expression extends createjs.Container {
    constructor(stage, color, obj) {
        super()

        this.inputColors = []
        this.clicked = false
        this.on("mousedown", e => {
            this.clickX = e.stageX - this.x
            this.clickY = e.stageY - this.y
            stage.setChildIndex(this, stage.numChildren - 1)
            this.clicked = true
        })

        this.on("pressup", e => {
            this.clicked = false
        })

        

        this.on('pressmove', e => {this.pressMove(e)})

        if (obj != null) {
            this.tree = new TreeNode(obj.name, null, null, obj)
            this.addChild(obj)
            console.log(this.children)
            this.rightmostFunction = this.children.reduce((p, c) => {return p.x > c.x ? p : c})
        } else if (color != null) {
            var func = new Function(stage, [], color);
            this.tree = new TreeNode(color, null, null, func)
            if (!stage.usedColors.includes(color)) stage.usedColors.push(color)
            this.addChild(func)
            this.rightmostFunction = this.children.reduce((p, c) => {return p.x > c.x ? p : c})
        }
    }

    pressMove(e) {
        if (!(this.parent instanceof Expression) && !(this.parent.parent instanceof Expression)) {
            // var detector = new createjs.Shape()
            var rightmostX = this.rightmostFunction.x
            this.rightmostY = this.rightmostFunction.y
            if (this.rightmostFunction instanceof Combinator) {
                rightmostX = this.rightmostFunction.width - 50
            }
            // detector.setBounds(this.x + rightmostX, this.y + this.rightmostY+ 25, 50, 50)
            // var det = getObjectsInBounds(stage, detector).filter(i => (i instanceof Input || i instanceof CombinatorInput) && this.children[0] != i)
            var det = getObjectsInCoords(this.x + rightmostX, this.y + this.rightmostY + 25, 50, 50)
            det = det.filter(i => (i instanceof Input || i instanceof CombinatorInput) && this.children[0] != i)
            // console.log(det)
            if (det.length > 0) {
                var parent = (det[0] instanceof CombinatorInput) ? det[0].parent.parent : det[0].parent
                var x = parent.x + det[0].x + 25
                var y = parent.y + det[0].y - 36
                if (det[0] instanceof CombinatorInput) {
                    x += det[0].parent.x
                    y += det[0].parent.y
                }
                // var sqr = new createjs.Shape()
                // sqr.graphics.beginFill("blue").drawRect(x, y, 5, 5)
                // stage.addChild(sqr)
                if (getItemsUnderPoint(stage, x, y).length == 0) {
                    console.log(det[0])
                    this.applyTo(det[0])
                } else {
                    this.x = e.stageX - this.clickX;
                    this.y = e.stageY - this.clickY;
                }
            } else {
                this.x = e.stageX - this.clickX;
                this.y = e.stageY - this.clickY;
            }
            stage.update();
        }
    }

    applyTo(applier, x) {
        console.log({...this})
        console.log({...applier})
        var x = applier.x
        var y = applier.y
        if (applier instanceof CombinatorInput) {
            x += applier.parent.x
            y += applier.parent.y
            console.log(applier.coord === applier.parent.coord)
        }
        var parent = (applier instanceof CombinatorInput) ? applier.parent.parent : applier.parent
        if (applier.coord == null) applier.coord = [...applier.func.coord]
        const rightX = !(this.rightmostFunction instanceof Combinator) ? structuredClone(this.rightmostFunction.x) : this.rightmostFunction.width - 50 + this.rightmostFunction.x
        const children = [...this.children]
        for (var i = 0; i < children.length; i++) {
            this.removeChild(children[i])
            parent.addChild(children[i])
            children[i].newAdded = true
            console.log(children[i])
            // if (children[i] instanceof Combinator) {
            //     children[i].x = 0
            // }
            children[i].x += x - rightX
            children[i].y += y - 75
        }

        if (applier.isParameter) {
            postOrder(parent.tree, n => {if (n.obj != null) n.obj.coord.unshift("r")})
            parent.tree = new TreeNode("app", this.tree, parent.tree) //application inputs have undefined coords for some reason
            postOrder(parent.tree, n => {
                if (n.obj != null && n.obj.newAdded && !(n.obj instanceof Output)) {
                    n.obj.coord.unshift("l")
                } 
            })
        } else {
            var coord = (applier instanceof CombinatorInput) ? [...applier.coord] : [...applier.func.coord]
            while (true) {
                console.log(parent.tree.getCoord(coord.slice(0, -1)).right != parent.tree.getCoord(coord))
                if (parent.tree.getCoord(coord.slice(0, -1)).data != "app" || parent.tree.getCoord(coord.slice(0, -1)).right != parent.tree.getCoord(coord)) break
                coord = coord.slice(0, -1)
            }
            console.log(coord) //the tree is different for comb vs func apps
            postOrder(parent.tree.getCoord([...coord]), n => {if (n.obj != null) n.obj.coord.unshift("r")})
            if (coord.length == 0) parent.tree = new TreeNode("app", this.tree, parent.tree, applier)
            else parent.tree.setCoord(coord, new TreeNode("app", this.tree, parent.tree.getCoord(coord), applier))
            // if (!(applier instanceof CombinatorInput))
            applier.coord = coord
            postOrder(parent.tree, n => {
                if (n.obj != null && n.obj.newAdded && !(n.obj instanceof Output)) {
                    n.obj.coord.unshift("l")
                    n.obj.coord.unshift(...applier.coord)
                }
            })
        }
        var tRightX = !(this.rightmostFunction instanceof Combinator) ? structuredClone(this.rightmostFunction.x) : this.rightmostFunction.width - 50 + this.rightmostFunction.x
        parent.children.forEach(e => {
            if (e.x >= tRightX || e.newAdded) {
                e.x += rightX
                e.newAdded = false
            }
        })
        var prev = parent.tree.getCoord(applier.coord.slice(0, -1))
        console.log(prev)
        if (prev.data == "abs") {
            var obj = parent.tree.getCoord(applier.coord.slice(0, -1)).obj
            if (parent.tree.getCoord(applier.coord).data == "app"
            && parent.tree.getCoord([...applier.coord, "r"]).data == "app"
            && parent.tree.getCoord([...applier.coord, "r"]).obj.output != null) { //xor?? maybe
                obj = parent.tree.getCoord([...applier.coord, "r"]).obj
                console.log(obj)
            }
            var output = obj.output
            console.log(output)
            output.addLength(rightX)
        }
        if (applier instanceof CombinatorInput) { //future me: the problem is the combinator input coords aren't being updated with the combinator coords
            console.log(this.rightmostFunction.width)
            console.log(rightX)
            console.log(tRightX)
            console.log(applier.comb.width) //yeah no vv
            console.log(applier.parent.x)
            console.log(this.rightmostFunction.x)
            applier.comb.addLength(Math.max(this.rightmostFunction.x - applier.parent.x, 0), applier.comb.inputs.indexOf(applier))
        }

        // for (var i = 0; i < 1; i++) {
        //     parent.children.forEach(c => {
        //         if (!c.newAdded && c instanceof Output) {
        //             var x = parent.x + c.x + c.length + 20
        //             var y = parent.y + c.y
        //             // var sqr = new createjs.Shape()
        //             // sqr.graphics.beginFill("blue").drawRect(x, y, 5, 5)
        //             // stage.addChild(sqr)
        //             console.log(getItemsUnderPoint(stage, x, y))
        //             // if (getItemsUnderPoint(stage, x, y).length == 0) {
        //                 c.addLength(75)
        //             // }
        //         }
        //         c.newAdded = false
        //     })
        // }

        parent.clickX = this.clickX + tRightX
        parent.clickY = this.rightmostY - this.clickY
        parent.x = this.x + tRightX
        parent.y = this.rightmostY - this.y
        stage.removeChild(this)

        return parent
    }

    setOutput() {
        this.removeChild(this.children[this.children.length-1])
    }
}