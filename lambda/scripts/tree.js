class TreeNode {
    constructor(data, left, right, obj) {
        this.data = data
        this.left = left
        this.right = right
        this.obj = obj
    }
    
    setCoord(coord, node) {
        // console.log(coord)
        // console.log(this)
        if (coord.length == 0) {
            this.data = node.data
            this.left = node.left
            this.right = node.right
            this.obj = node.obj
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

    copy() {
        var left = null
        var right = null
        if (this.left != null) left = this.left.copy()
        if (this.right != null) right = this.right.copy()
        return new TreeNode((" " + this.data).slice(1), left, right, _.cloneDeep(this.obj))
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

function preOrder(node, func) {
    if (node == null) return
    var r = func(node)
    preOrder(node.right, func)
    preOrder(node.left, func)
    return r
}

var rRun = true
function reversePostOrder(node, func) {
    rRun = true
    reversePostHelper(node, func)
}

function reversePostHelper(node, func) {
    if (rRun === false) return 
    if (node == null) return
    reversePostHelper(node.right, func)
    reversePostHelper(node.left, func)
    var res = func(node)
    if (res === false) rRun = false
    return res
}