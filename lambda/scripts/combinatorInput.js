class CombinatorInput extends createjs.Container {
    constructor(comb) {
        super()
        this.comb = comb
        this.func = comb
        this.coord = comb.coord

        var polygon = new createjs.Shape()
        polygon.graphics.beginFill("lightgreen").beginStroke().moveTo(25, 25).lineTo(0, -25).lineTo(50, -25).lineTo(25, 25)
        this.addChild(polygon)
    }
}