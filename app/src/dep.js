let depId = 0;
// 定义依赖对象
class Dep {
  constructor() {
    this.id = depId++;
    this.subs = []; // 存储的是与 当前 Dep 关联的 watcher
  }

  addSub(sub) {
    this.subs.push(sub);
  }

  removeSub(sub) {
    // 倒序循环可以避免索引变化的问题
    for ( let i = this.subs.length - 1; i >= 0 ; i-- ) {
      if ( sub === this.subs[ i ] ) {
        this.subs.splice( i, 1 );
      }
    }
  }

  // 依赖收集：将当前 Dep 与当前的 watcher ( 暂时渲染 watcher ) 相互关联
  depend() {
    if (Dep.target) {
      this.addSub(Dep.target);
      Dep.target.addDep(this);
    }
  }

  // 派发更新：触发与之关联的 watcher 的 update 方法, 起到更新的作用
  notify() {
    const watchers = this.subs.slice();
    watchers.forEach(watcher => {
      watcher.update();
    })
  }
}

// 全局的容器存储渲染 Watcher
Dep.target = null;

const targetStack = [];

/** 将当前操作的 watcher 存储到 全局 watcher 中, 参数 target 就是当前 watcher */
function pushTarget(target) {
  targetStack.unshift(Dep.target);
  Dep.target = target;
}

/** 将 当前 watcher 踢出 */
function popTarget() {
  Dep.target = targetStack.shift();
}

/**使用：
 *  - 在 watcher 调用 get 方法的时候, 调用 pushTarget( this )
 *  - 在 watcher 的 get 方法结束的时候, 调用 popTarget()
 */