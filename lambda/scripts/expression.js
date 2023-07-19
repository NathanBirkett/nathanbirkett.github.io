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
                var rightmostFunction = this.children.reduce((p, c) => {return p.x > c.x ? p : c})

                detector.setBounds(this.x + rightmostFunction.x, this.y + rightmostFunction.y + 25, 50, 50)
                var det = getObjectsInBounds(stage, detector).filter(i => i instanceof Input && this.children[0] != i)
                if (det.length > 0) {
                    console.log("next")
                    var detected = det[0]
                    detected.parent.tree = new TreeNode("app", this.tree, detected.parent.tree)
                    const rightX = structuredClone(rightmostFunction.x)
                    const children = [...this.children]
                    for (var i = 0; i < children.length; i++) {
                        console.log(children)
                        this.removeChild(children[i])
                        console.log(children[i])
                        detected.parent.addChild(children[i])
                        children[i].newAdded = true
                        children[i].x += detected.x - rightX
                        children[i].y += detected.y - 75
                        if (children[i].parentNode == null) {
                            children[i].parentNode = detected.parent.tree
                        }
                    }
                    detected.parent.children.forEach(e => {
                        if (e.x >= rightX || e.newAdded) {
                            console.log(rightX)
                            e.x += rightX
                            if (e.constructor.name == "Output") {
                                console.log(e)
                                // e.setLength(100)
                            }
                            e.newAdded = false
                        }
                    })
                    console.log(detected.parent.tree)
                } else {
                    this.x = e.stageX - this.clickX;
                    this.y = e.stageY - this.clickY;
                }
                stage.update();
        }
        })

        this.tree = new TreeNode(color)
        var func = new Function(stage, null, color);
        stage.usedColors.push(color)
        this.addChild(func)
    }
    setOutput() {
        this.removeChild(this.children[this.children.length-1])
    }
}