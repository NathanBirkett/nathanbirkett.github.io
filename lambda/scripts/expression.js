class Expression extends createjs.Container {
    constructor(stage, color) {
        super()

        this.on("mousedown", e => {
            this.clickX = e.stageX - this.x
            this.clickY = e.stageY - this.y
            stage.setChildIndex(this, stage.numChildren - 1)
        })

        this.on('pressmove', function(e) {
            if (!(this.parent instanceof Expression)) {
                var detector = new createjs.Shape()
                detector.setBounds(this.x + this.rightmostFunction.x, this.y + this.rightmostFunction.y + 25, 50, 50)
                var det = getObjectsInBounds(stage, detector).filter(i => i instanceof Input && this.children[0] != i)
                if (det.length > 0) {
                    this.applyTo(det[0])
                } else {
                    this.x = e.stageX - this.clickX;
                    this.y = e.stageY - this.clickY;
                }
                stage.update();
        }
        })
        var func = new Function(stage, [], color);
        this.tree = new TreeNode(color, null, null, func)
        if (!stage.usedColors.includes(color)) stage.usedColors.push(color)
        this.addChild(func)
        this.rightmostFunction = this.children.reduce((p, c) => {return p.x > c.x ? p : c})
    }

    applyTo(applier) {
        console.log(this)
        console.log(applier)
        if (applier.isParameter) {
            applier.parent.tree = new TreeNode("app", this.tree, applier.parent.tree)
        } else { //what if there are applications afterwards
            if (applier.func.coord.length == 0) applier.parent.tree = new TreeNode("app", this.tree, applier.parent.tree.getCoord(applier.func.coord), applier)
            else {
                if (applier.parent.tree.getCoord(applier.func.coord.slice(0, -1)).data == "app") {
                    var coord = applier.func.coord
                    while (true) {
                        if (applier.parent.tree.getCoord(coord.slice(0, -1)).right != applier.parent.tree.getCoord(coord)) break
                        coord = coord.slice(0, -1)
                    }
                    console.log(applier.parent.tree)
                    if (coord.length == 0) applier.parent.tree = new TreeNode("app", this.tree, applier.parent.tree, applier)
                    else applier.parent.tree.setCoord(coord, new TreeNode("app", this.tree, applier.parent.tree.getCoord(applier.func.coord), applier))

                }
                else applier.parent.tree.setCoord(applier.func.coord, new TreeNode("app", this.tree, applier.parent.tree.getCoord(applier.func.coord), applier))
            }
        }
        const rightX = structuredClone(this.rightmostFunction.x)
        const children = [...this.children]
        for (var i = 0; i < children.length; i++) {
            this.removeChild(children[i])
            applier.parent.addChild(children[i])
            children[i].newAdded = true
            children[i].x += applier.x - rightX
            children[i].y += applier.y - 75
            if (children[i].constructor.name != "Output")children[i].coord.unshift("l")
        }
        var tRightX = structuredClone(this.rightmostFunction.x)
        applier.parent.children.forEach(e => {
            if (!e.newAdded && e.constructor.name != "Output") try {
                e.coord.unshift("r")
            } catch (error) {
                
            } 
            if (e.x >= tRightX || e.newAdded) {
                // console.log(rightX)
                e.x += rightX
                e.newAdded = false
            }
        })
        try {
            var output = applier.parent.tree.getCoord(applier.coord.slice(0, -1)).obj.output
            console.log(rightX)
            output.addLength(rightX)
            console.log(applier.parent.tree.left.obj)
        } catch (error) {
            
        }
        return applier.parent
    }

    setOutput() {
        this.removeChild(this.children[this.children.length-1])
    }
}