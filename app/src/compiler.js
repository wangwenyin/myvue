const rkuohao = /\{\{(.+?)\}\}/g;
  // 多层属性处理
  function getValueByPath(obj, path) {
    const paths = path.split('.');
    let res = obj;
    let prop;
    // 此处while很巧妙
    while(prop = paths.shift()) { // 即while(prop)
      res = res[prop];
    }
    return res;
  }

  // 使用递归 来遍历dom元素 生成虚拟dom
  function getVNode(node) {
    const nodeType = node.nodeType;
    let _vnode = null; 
    if (nodeType === 1) {
      // 元素
      const nodeName = node.nodeName;
      const attrs = node.attributes; // 伪数组
      const attrsObj = Array.from(attrs).reduce((obj, item) => { // item 属性节点 nodeType == 2
        obj[item.nodeName] = item.nodeValue;
        return obj;
      }, {});
      _vnode = new vNode(nodeName, undefined, nodeType, attrsObj);
      // 考虑node的子元素
      const childNodes = node.childNodes;
      for (const child of childNodes) {
        _vnode.appendChild(getVNode(child)); // 递归
      }
    } else if (nodeType === 3) {
      _vnode = new vNode(undefined, node.nodeValue, nodeType, undefined);
    }

    return _vnode;
  }

  // 将虚拟dom 转换成真正的dom
  function parseVNode(vnode) {
    const nodeType = vnode.type;
    let dom = null;
    if (nodeType === 1) {
      // 元素
      dom = document.createElement(vnode.tag);

      // 属性
      const attrsObj = vnode.data;
      for (key in attrsObj) {
        dom.setAttribute(key, attrsObj[key]);
      }
      // 子元素
      const childNodes = vnode.children;
      for (const child of childNodes) {
        dom.appendChild(parseVNode(child));
      }
    } else if (nodeType === 3) {
      // 文本
      dom = document.createTextNode(vnode.value);
    }

    return dom;
  }

  /** 将 带有 坑的 Vnode 与数据 data 结合, 得到 填充数据的 VNode: 模拟 AST -> VNode */
  function combine(vnode, data) {
    let { type: _type, tag: _tag, value: _value, data: _data, children: _children } = vnode;
    let _vnode = null;
    if (_type === 3) {
      // 文本节点
      _value = _value.replace(rkuohao, (_, g) => {
        return getValueByPath(data, g.trim());
      })
      _vnode = new vNode(_tag, _value, _type, _data);
    } else if (_type === 1) {
      // 元素节点
      _vnode = new vNode(_tag, _value, _type, _data);
      _children.forEach(_subVnode => _vnode.appendChild(combine(_subVnode, data)));
    }
    return _vnode;
  }