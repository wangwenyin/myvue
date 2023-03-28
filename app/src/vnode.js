/** 虚拟 DOM 构造函数 */
class vNode {
  constructor(tag, value, type, data) {
    this.tag = tag && tag.toLowerCase();
    this.value = value;
    this.type = type;
    this.data = data;
    this.children = [];
  }

  appendChild(node) {
    this.children.push(node);
  }
}