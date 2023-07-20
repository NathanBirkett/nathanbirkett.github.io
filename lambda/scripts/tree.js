class TreeNode {
    constructor(data, left, right, obj) {
        this.data = data
        this.left = left
        this.right = right
        this.obj = obj
    }
    
    setCoord(coord, node) {
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
        console.log(coord)
        var parent = this
        for (var i = 0; i < coord.length; i++) {
            if (coord[i] == "r") parent = parent.right
            else if (coord[i] == "l") parent = parent.left
        }
        return parent
    }
}


function postOrder(node, func) {
    if (node == null) return
    postOrder(node.left, func)
    postOrder(node.right, func)
    return func(node)
}

function inOrder(node, func) {
    if (node == null) return
    inOrder(node.left, func)
    var r = func(node)
    inOrder(node.right, func)
    return r
}