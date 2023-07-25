class Expression extends createjs.Container {
    constructor(stage, color, obj) {
        super()

        this.on("mousedown", e => {
            this.clickX = e.stageX - this.x
            this.clickY = e.stageY - this.y
            stage.setChildIndex(this, stage.numChildren - 1)
        })

        this.on('pressmove', function(e) {
            if (!(this.parent instanceof Expression)) {
                var detector = new createjs.Shape()
                var rightmostX = this.rightmostFunction.x
                var rightmostY = this.rightmostFunction.y
                if (this.rightmostFunction instanceof Combinator) {
                    console.log("combinator")
                    rightmostX = this.rightmostFunction.width / 2 - 25
                }
                detector.setBounds(this.x + rightmostX, this.y + rightmostY+ 25, 50, 50)
                var det = getObjectsInBounds(stage, detector).filter(i => (i instanceof Input || i instanceof Combinator) && this.children[0] != i)
                if (det.length > 0) {
                    this.applyTo(det[0])
                } else {
                    this.x = e.stageX - this.clickX;
                    this.y = e.stageY - this.clickY;
                }
                stage.update();
        }
        })
        if (obj != null) {
            this.tree = new TreeNode(obj.name, null, null, obj)
            this.addChild(obj)
            this.rightmostFunction = this.children.reduce((p, c) => {return p.x > c.x ? p : c})
            console.log(this.rightmostFunction)
        } else if (color != null) {
            var func = new Function(stage, [], color);
            this.tree = new TreeNode(color, null, null, func)
            if (!stage.usedColors.includes(color)) stage.usedColors.push(color)
            this.addChild(func)
            this.rightmostFunction = this.children.reduce((p, c) => {return p.x > c.x ? p : c})
        }
    }

    applyTo(applier) {
        // console.log(this)
        // console.log(applier)
        if (applier.coord == null) applier.coord = [...applier.func.coord]
        console.log(applier.coord)
        const rightX = !(this.rightmostFunction instanceof Combinator) ? structuredClone(this.rightmostFunction.x) : this.rightmostFunction.width / 2 - 25 + this.rightmostFunction.x
        console.log(rightX)
        const children = [...this.children]
        console.log([...children[0].coord])
        for (var i = 0; i < children.length; i++) {
            this.removeChild(children[i])
            applier.parent.addChild(children[i])
            children[i].newAdded = true
            console.log(children[i].x + applier.x - rightX)
            children[i].x += applier.x - rightX
            console.log(children[i])
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
            // applier.coord = ["r", ...applier.func.coord]
        } else { //what if there are applications afterwards

            // if (false) {console.log("wierdness"); applier.parent.tree = new TreeNode("app", this.tree, applier.parent.tree.getCoord(applier.func.coord), applier)}
            // else {
            console.log(applier.func.coord)
            var coord = [...applier.func.coord]
            while (true) {
                // if (applier.parent.tree.getCoord(coord.slice(0, -1)).right != applier.parent.tree.getCoord(coord)) break
                console.log(applier.parent.tree.getCoord(coord.slice(0, -1)).copy()) //AHHHHHH
                if (applier.parent.tree.getCoord(coord.slice(0, -1)).data != "app" || applier.parent.tree.getCoord(coord.slice(0, -1)).right != applier.parent.tree.getCoord(coord)) break
                coord = coord.slice(0, -1)
            }
            console.log(coord)
            postOrder(applier.parent.tree.getCoord([...coord]), n => {if (n.obj != null) n.obj.coord.unshift("r")})
            
            console.log(applier.parent.tree)
            if (coord.length == 0) applier.parent.tree = new TreeNode("app", this.tree, applier.parent.tree, applier)
            else applier.parent.tree.setCoord(coord, new TreeNode("app", this.tree, applier.parent.tree.getCoord(coord), applier))
            // }
            applier.coord = coord
            console.log(applier.coord)
            postOrder(applier.parent.tree, n => {
                if (n.obj != null && n.obj.newAdded && !(n.obj instanceof Output)) {
                    n.obj.coord.unshift("l")
                    n.obj.coord.unshift(...applier.coord)
                }
            })
            // applier.coord = [...applier.func.coord]
        }

        // if (applier.isParameter) {
        //     postOrder(applier.parent.tree.right, n => {if (n.obj != null && n.obj != applier){n.obj.coord.unshift("r")}})
        // } else {
        //     console.log(applier.coord)
        //     postOrder(applier.parent.tree.getCoord([...applier.coord, "r"]), n => {
        //         if (n.obj != null) {
        //             n.obj.coord.unshift("r")
        //             // if (n.obj.output != null) {
        //             //     console.log(n.obj.output)
        //             //     n.obj.output.coord.unshift("r")
        //             // }
        //         }
        //     })
        // }
        // console.log(applier)
        var tRightX = !(this.rightmostFunction instanceof Combinator) ? structuredClone(this.rightmostFunction.x) : this.rightmostFunction.width / 2 - 25 + this.rightmostFunction.x
        applier.parent.children.forEach(e => {
            // if (!e.newAdded && e.constructor.name != "Output") try {
            //     e.coord.unshift("r")
            // } catch (error) {
            //     console.log(e)
            // } //                                           vvv sometimes this might be wrong vvv
            // if (e.newAdded && e.constructor.name != "Output" && applier.isParameter != true) e.coord.unshift(...applier.coord)
            if (e.x >= tRightX || e.newAdded) {
                e.x += rightX
                e.newAdded = false
            }
        })
        if (applier.parent.tree.getCoord(applier.coord.slice(0, -1)).data == "abs") {
            var output = applier.parent.tree.getCoord(applier.coord.slice(0, -1)).obj.output
            output.addLength(rightX)
        }
        // console.log(applier.parent.tree.left.obj)
        return applier.parent
    }

    setOutput() {
        this.removeChild(this.children[this.children.length-1])
    }
}