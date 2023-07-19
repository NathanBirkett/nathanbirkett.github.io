class TreeNode {
    constructor(data, left, right) {
        this.data = data
        this.left = left
        this.right = right
    }
}


function postOrder(node, func) {
    if (node == null) return
    postOrder(node.left, func)
    postOrder(node.right, func)
    func(node)
}

function inOrder(node, func) {
    if (node == null) return
    func(node)
    inOrder(node.left, func)
    inOrder(node.right, func)
}