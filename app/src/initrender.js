Myvue.prototype.mount = function() {
  this.render = this.createRenderFn();
  this.mountComponent();
}

Myvue.prototype.mountComponent = function() {
  const mount = () => {
    this.update(this.render());
  }
  // 这个 Watcher 就是全局的 Watcher, 在任何一个位置都可以访问他了
  new Watcher( this, mount ); // 相当于这里调用了 mount
}

// 这里是生成 render 函数, 目的是缓存 抽象语法树 ( 我们使用 虚拟 DOM 来模拟 )
Myvue.prototype.createRenderFn = function() {
  const ast = getVNode(this._template); // 带坑的vnode
  return function render() {
    const _tmp = combine(ast, this._data);
    return _tmp;
  }
}

// 将虚拟 DOM 渲染到页面中: diff 算法就在里
Myvue.prototype.update = function(vnode) {
  const realDom = parseVNode(vnode);
  // 此处没有采用diff算法局部更新
  this._parent.replaceChild(realDom, document.querySelector('#root'));
}