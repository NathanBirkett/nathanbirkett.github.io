class Expression extends createjs.Container {
    constructor(stage, color, obj) {
        super()

        
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
        if (!(this.parent instanceof Expression)) {
            var detector = new createjs.Shape()
            var rightmostX = this.rightmostFunction.x
            this.rightmostY = this.rightmostFunction.y
            if (this.rightmostFunction instanceof Combinator) {
                rightmostX = this.rightmostFunction.width / 2 - 25
            }
            detector.setBounds(this.x + rightmostX, this.y + this.rightmostY+ 25, 50, 50)
            var det = getObjectsInBounds(stage, detector).filter(i => (i instanceof Input || i instanceof Combinator) && this.children[0] != i)
            if (det.length > 0 && getItemsUnderPoint(stage, det[0].parent.x + det[0].x + 25, det[0].parent.y + det[0].y - 45).length == 0) {
                this.applyTo(det[0])
            } else {
                this.x = e.stageX - this.clickX;
                this.y = e.stageY - this.clickY;
            }
            stage.update();
        }
    }

    applyTo(applier) {
        // console.log({...this})
        // console.log({...applier})
        if (applier.coord == null) applier.coord = [...applier.func.coord]
        const rightX = !(this.rightmostFunction instanceof Combinator) ? structuredClone(this.rightmostFunction.x) : this.rightmostFunction.width / 2 - 25 + this.rightmostFunction.x
        const children = [...this.children]
        for (var i = 0; i < children.length; i++) {
            this.removeChild(children[i])
            applier.parent.addChild(children[i])
            children[i].newAdded = true
            children[i].x += applier.x - rightX
            children[i].y += applier.y - 75
        }

        if (applier.isParameter) {
            postOrder(applier.parent.tree, n => {if (n.obj != null) n.obj.coord.unshift("r")})
            applier.parent.tree = new TreeNode("app", this.tree, applier.parent.tree) //application inputs have undefined coords for some reason
            postOrder(applier.parent.tree, n => {
                if (n.obj != null && n.obj.newAdded && !(n.obj instanceof Output)) {
                    n.obj.coord.unshift("l")
                } 
            })
        } else {
            var coord = [...applier.func.coord]
            while (true) {
                if (applier.parent.tree.getCoord(coord.slice(0, -1)).data != "app" || applier.parent.tree.getCoord(coord.slice(0, -1)).right != applier.parent.tree.getCoord(coord)) break
                coord = coord.slice(0, -1)
            }
            postOrder(applier.parent.tree.getCoord([...coord]), n => {if (n.obj != null) n.obj.coord.unshift("r")})
            if (coord.length == 0) applier.parent.tree = new TreeNode("app", this.tree, applier.parent.tree, applier)
            else applier.parent.tree.setCoord(coord, new TreeNode("app", this.tree, applier.parent.tree.getCoord(coord), applier))
            applier.coord = coord
            postOrder(applier.parent.tree, n => {
                if (n.obj != null && n.obj.newAdded && !(n.obj instanceof Output)) {
                    n.obj.coord.unshift("l")
                    n.obj.coord.unshift(...applier.coord)
                }
            })
        }
        var tRightX = !(this.rightmostFunction instanceof Combinator) ? structuredClone(this.rightmostFunction.x) : this.rightmostFunction.width / 2 - 25 + this.rightmostFunction.x
        applier.parent.children.forEach(e => {
            if (e.x >= tRightX || e.newAdded) {
                e.x += rightX
                e.newAdded = false
            }
        })
        if (applier.parent.tree.getCoord(applier.coord.slice(0, -1)).data == "abs") {
            var output = applier.parent.tree.getCoord(applier.coord.slice(0, -1)).obj.output
            output.addLength(rightX)
        }

        applier.parent.clickX = this.clickX + tRightX
        applier.parent.clickY = this.rightmostY - this.clickY
        applier.parent.x = this.x + tRightX
        applier.parent.y = this.rightmostY - this.y
        stage.removeChild(this)
        return applier.parent
    }

    setOutput() {
        this.removeChild(this.children[this.children.length-1])
    }
}