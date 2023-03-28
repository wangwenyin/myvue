function Myvue(options) {
  this._data = options.data;
  this._template = document.querySelector(options.el);
  this._parent = this._template.parentNode;

  this.initData(); // 将 data 进行响应式转换, 并进行代理
  
  this.mount();
}