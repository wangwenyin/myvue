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
      reactify(item);
    }
    // 再调用原来的方法
    const res = Array.prototype[METHOD].apply(this, arguments);
    return res;
  }
})

function defineReactive(target, key, value, enumerable) {
  const that = this;
  Object.defineProperty(target, key, {
    configurable: true,
    enumerable: !!enumerable,
    get() {
      console.log(`读取o的属性 ${key}`)
      return value;
    },
    set(newValue) {
      console.log(`设置o的属性 ${key} 为${newValue}`)
      if (typeof newValue === 'object' && newValue !== null) {
        value = reactify(newValue);
      } else {
        value = newValue;
      }
      that.mountComponent();
    }
  })
}

function reactify(o, vm) {
  const keys = Object.keys(o);
  for (const key of keys) {
    const value = o[key];
    // 判断value是否是引用类型（数组：遍历后再判读类型）
    if (Array.isArray(value)) {
      value.__proto__ = array_method;
      for (const item of value) {
        reactify(item, vm)
      }
    } else {
      // 对象或值类型
      if (typeof value === 'object' && value !== null) {
        reactify(value, vm);
      } else {
        defineReactive.call(vm, o, key, value, true);
      }
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

  // 临时方法处理myvue的响应式
  reactify(this._data, this);

  // 代理
  for (let i = 0; i < keys.length; i++) {
    // 将 this._data[ keys[ i ] ] 映射到 this[ keys[ i ] ] 上
    // 就是要 让 this 提供 keys[ i ] 这个属性
    // 在访问这个属性的时候 相当于在 访文this._data 的这个属性

    proxy(this, '_data', keys[i]);
  }
}