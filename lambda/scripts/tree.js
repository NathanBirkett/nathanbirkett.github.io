class TreeNode {
    constructor(data, left, right, obj) {
        this.data = data
        this.left = left
        this.right = right
        this.obj = obj
    }
    
    setCoord(coord, node) {
        if (coord.length == 0) {
            this.data = node.data
            this.left = node.left
            this.right = node.right
            this.obj = this.obj
        }
        var parent = this
        for (var i = 1; i < coord.length; i++) {
            if (coord[i - 1] == "r") parent = parent.right
            else if (coord[i - 1] == "l") parent = parent.left
        }
        var last = coord[coord.length - 1]
        if (last == "r") parent.right = node
        else if (last == "l") parent.left = node
    }

    getCoord(coord) {
        // console.log(this)
        // console.log(coord)
        var parent = this
        for (var i = 0; i < coord.length; i++) {
            if (coord[i] == "r") parent = parent.right
            else if (coord[i] == "l") parent = parent.left
        }
        return parent
    }
}

var run = true
function postOrder(node, func) {
    run = true
    postHelper(node, func)
}

function postHelper(node, func) {
    if (run === false) return 
    if (node == null) return
    postHelper(node.left, func)
    postHelper(node.right, func)
    var res = func(node)
    if (res === false) run = false
    return res
}

function inOrder(node, func) {
    if (node == null) return
    inOrder(node.left, func)
    var r = func(node)
    inOrder(node.right, func)
    return r
}