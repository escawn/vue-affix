import Vue from 'vue'
import Demo from '../../src/Demo.vue'
import Affix from '../../src/components/affix.vue'

// 挂载元素并返回已渲染的文本的工具函数
function getRenderedVm (Component, propsData) {
  const Ctor = Vue.extend(Component)
  const vm = new Ctor({ propsData: propsData }).$mount()
  return vm
}


describe('test Demo.vue', () => {
  it('create', () => {
  });
  it('render correct content',()=>{
  });
  it('append to body',()=>{});
  it('props',()=>{
    let affixvm = getRenderedVm(Affix, {
            initOffsetTop: 0,
            elementDistance: 0,
            isSmoothScroll: true,
            overScroll: true,
            affixNavWidth: 'this is affixNacWidth',
            affixNavHeight: 'this is affixNacHeight',
            pure: true,
        });

        // 断言组件的child组件的props是否生效
        expect(affixvm.initOffsetTop).toEqual(0);
        expect(affixvm.elementDistance).toEqual(0);
        expect(affixvm.isSmoothScroll).toEqual(true);
        expect(affixvm.overScroll).toEqual(true);
        expect(affixvm.affixNavWidth).toEqual('this is affixNacWidth');
        expect(affixvm.affixNavHeight).toEqual('this is affixNacHeight');
        expect(affixvm.pure).toEqual(true);
  });
  it('target scroll',()=>{});
  it('affix-nav click',()=>{});
  it('affix-nav-item active',()=>{});
})
