const ARRAY_METHOD = [
  'push',
  'pop',
  'shift',
  'unshift',
  'reverse',
  'sort',
  'splice',
];
const array_method = Object.create(Array.prototype);

ARRAY_METHOD.forEach(METHOD => {
  array_method[METHOD] = function() {
    console.log(`调用的拦截的${METHOD}方法`);
    // 将数据进行响应式话
    for (const item of arguments) {
      observe(item); // 这里还是有一个问题, 在引入 Watcher 后解决
    }
    // 再调用原来的方法
    const res = Array.prototype[METHOD].apply(this, arguments);
    return res;
  }
})

function defineReactive(target, key, value, enumerable) {

  if ( typeof value === 'object' && value != null ) {
    observe(value);
  }

  let dep = new Dep();

  dep.__propName__ = key;

  Object.defineProperty(target, key, {
    configurable: true,
    enumerable: !!enumerable,
    get() {
      console.log(`读取o的属性 ${key}`)
      // 依赖收集
      dep.depend();
      return value;
    },
    set(newValue) {
      console.log(`设置o的属性 ${key} 为${newValue}`)
      if (typeof newValue === 'object' && newValue !== null) {
        // 将重新赋值的数据变成响应式的
        observe(newValue);
      }
      value = newValue;

      // 派发更新, 找到全局的 watcher, 调用 update
      dep.notify();
    }
  })
}

/** 将对象 o 变成响应式, vm 就是 vue 实例, 为了在调用时处理上下文 */
function observe( obj) {
  // 之前没有对 obj 本身进行操作, 这一次就直接对 obj 进行判断
  if ( Array.isArray( obj ) ) {
    obj.__proto__ = array_method;
    for ( let i = 0; i < obj.length; i++ ) {
      observe( obj[ i ] ); // 递归处理每一个数组元素
    }
  } else {
    let keys = Object.keys( obj );
    for ( let i = 0; i < keys.length; i++ ) {
      let prop = keys[ i ]; // 属性名
      defineReactive( obj, prop, obj[ prop ], true );
    }
  }
}

/** 将 某一个对象的属性 访问 映射到 对象的某一个属性成员上 */
function proxy(target, prop, key) {
  Object.defineProperty(target, key, {
    enumerable: true,
    configurable: true,
    get() {
      return target[prop][key];
    },
    set(newVal) {
      target[prop][key] = newVal;
    }
  });
}

Myvue.prototype.initData = function () {
  // 遍历 this._data 的成员, 将 属性转换为响应式 ( 上 ), 将 直接属性, 代理到 实例上
  let keys = Object.keys(this._data);

  // 响应式话
  observe(this._data, this);

  // 代理
  for (let i = 0; i < keys.length; i++) {
    // 将 this._data[ keys[ i ] ] 映射到 this[ keys[ i ] ] 上
    // 就是要 让 this 提供 keys[ i ] 这个属性
    // 在访问这个属性的时候 相当于在 访文this._data 的这个属性

    proxy(this, '_data', keys[i]);
  }
}