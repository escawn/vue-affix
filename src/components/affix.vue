<template lang="html">
	<div class="affix-container" ref="affix" :style="overScroll?{overflow: 'scroll'}:''">
		<ul class="affix-nav" :class="affixState" ref="affixNav" :style="{top: actualOffsetTop + 'px', height: affixNavHeight, width: affixNavWidth}">
			<li v-for="(item, index) in panes" :class="{'active': index === activeIndex}">
				<a href="javascript:void(0)"
				@click="handleClick(index)"
				>{{item.label}}</a>
			</li>
		</ul>
		<div v-show="affixState === 'affix-ing'" :style="{height: affixNavHeight }"></div>
		<div class="affix-content">
			<slot></slot>
		</div>
	</div>
</template>

<script>
export default {
  name: 'affix',
  props: {
    initOffsetTop: {
      type: Number,
      default: 10
    },
    elementDistance: {
      type: Number,
      default: 0
    },
    isSmoothScroll: {
      type: Boolean,
      default: true
    },
    overScroll: {
      type: Boolean,
      default: false
    },
    affixNavWidth: {
      type: String,
      default: '100%'
    },
    affixNavHeight: {
      type: String,
      default: '30px'
    }
  },
  data () {
    return {
      panes: [],
      Top: 0,
      activeIndex: 0,
      affixState: 'affix-top',
      flag: 0,
      animationFrameFlag: 0,
      timer: 0,
      affixNavSize: {
        height: 0,
        width: 0
      },
      affixHeight: 0,
      container: null,
      actualOffsetTop: 0
    }
  },
  watch: {},
  computed: {
    distance () {
      // 当正好处于某个content位置时，content应与窗口顶部相隔distance距离，以便留给affix展示
      return this.actualOffsetTop + this.affixNavSize.height + this.elementDistance
    },
    // 判断是否支持sticky属性
    isSupportSticky () {
      const ele = this.$refs.affixNav
      // 等待渲染完成
      if (ele) {
        if ('position' in ele.style) {
          ele.style['position'] = '-webkit-sticky'
          return ele.style['position'] === '-webkit-sticky'
        } else {
          return false
        }
      }
    }
  },
  methods: {
    // 获取元素顶部与文档之间距离
    getPosition (el) {
      if (el) {
        let actualLeft = el.offsetLeft
        let actualTop = el.offsetTop
        let current = el.offsetParent
        while (current !== document.body && current !== null) {
          actualLeft += (current.offsetLeft + current.clientLeft)
          actualTop += (current.offsetTop + current.clientTop)
          current = current.offsetParent
        }
        return {
          top: actualTop,
          left: actualLeft
        }
      } else {
        return {
          top: 0,
          left: 0
        }
      }
    },
    // 获取Affix状态
    getAffixState (top) {
      if (this.affixState === 'affix-top') {
        if (this.actualOffsetTop !== null && this.$refs.affixNav.getBoundingClientRect().top >= this.actualOffsetTop) {
          console.log('affix-top to affix-top ' + ' nav距窗口距离： ' + this.$refs.affixNav.getBoundingClientRect().top, 'actualOffsetTop: ' + this.actualOffsetTop)
          return 'affix-top'
        } else {
          console.log('affix-top to affix-ing ' + ' nav距窗口距离： ' + this.$refs.affixNav.getBoundingClientRect().top, 'actualOffsetTop: ' + this.actualOffsetTop)
          return 'affix-ing'
        }
      } else {
        if (top <= this.flag) {
          console.log('affix-ing to affix-top ' + ' top： ' + top + ', flag: ' + this.flag)
          return 'affix-top'
        } else {
          console.log('affix-ing to affix-ing ' + ' top： ' + top + ', flag: ' + this.flag)
          return 'affix-ing'
        }
      }
    },
    // 监听事件判断
    scrollListener () {
      const me = this
      let top
      if (me.overScroll) {
        top = me.container.scrollTop
      } else {
        // 不同浏览器内核下scrolltop取值方式不同
        top = document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop
      }
      me.panes.forEach((item, index) => {
        // 1是affix border的高，border会影响tab之间的切换，待解决
        if (me.getPosition(item.$refs.content).top - top <= me.distance) {
          me.activeIndex = index
          return
        }
      })
      if (!me.isSupportSticky) {
        me.affixState = me.getAffixState(top)
      }
    },
    // 将affix-pane内容添加进数组
    addPanes (item) {
      this.panes.push(item)
    },
    // 点击事件
    handleClick (index) {
      const me = this
      // 解绑滚动事件
      me.container.removeEventListener('scroll', me.scrollListener)
      // 适应还没滚到目标位置就重新进行点击的情况
      if (me.animationFrameFlag) {
        window.cancelAnimationFrame(me.animationFrameFlag)
      }
      // clearInterval(me.timer)
      this.activeIndex = index
      // 此处暴露一个点击事件
      this.$emit('click-prescroll', index)
      const newScrollTop = Math.round(me.getPosition(this.panes[index].$refs.content).top - this.distance)
      if (me.isSmoothScroll) {
        me.smoothScroll(newScrollTop, index)
      } else {
        me.container.scrollTop = newScrollTop
        me.container.addEventListener('scroll', me.scrollListener)
        // 此处暴露一个点击事件
        this.$emit('click-afterscroll', index)
      }
    },
    // 通过requestAnimationFrame实现平滑滚动
    smoothScroll (target, index) {
      const me = this
      let top
      if (me.overScroll) {
        top = me.container.scrollTop
      } else {
        // 不同浏览器内核下scrolltop取值方式不同
        top = document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop
      }
      top = Math.round(top)
      target = Math.round(target)
      if (target - top > 50) {
        me.overScroll ? me.container.scrollTop = top + 50 : window.scrollTo(0, top + 50)
      } else if (top - target > 50) {
        me.overScroll ? me.container.scrollTop = top - 50 : window.scrollTo(0, top - 50)
      } else {
        me.overScroll ? me.container.scrollTop = target : window.scrollTo(0, target)
      }
      if (Math.abs(target - top) > 1) {
        me.animationFrameFlag = window.requestAnimationFrame(() => { me.smoothScroll(target) })
      } else {
        window.cancelAnimationFrame(me.animationFrameFlag)
        me.container.addEventListener('scroll', me.scrollListener)
        this.$emit('click-afterscroll', index)
      }
      if (!me.isSupportSticky) {
        me.affixState = me.getAffixState(top)
      }
    }
  },
  mounted: function () {
    const me = this
    this.$nextTick(() => {
      me.affixNavSize = {
        height: me.$refs.affixNav.offsetHeight,
        width: me.$refs.affixNav.offsetWidth
      }
      me.affixHeight = me.$refs.affix.offsetHeight
      me.container = me.overScroll ? me.$refs.affix : window
      me.container.addEventListener('scroll', me.scrollListener)
      me.actualOffsetTop = me.overScroll ? Math.min((me.getPosition(me.$refs.affixNav).top), (me.initOffsetTop + me.getPosition(me.$refs.affix).top)) : Math.min(me.initOffsetTop, me.getPosition(me.$refs.affixNav).top)
      // flag为到达刚好从affix-top转变为affix时，滚动条卷去的距离
      me.flag = me.getPosition(me.$refs.affixNav).top - me.actualOffsetTop
    })
  }
}
</script>

<style lang="less" scoped>
.affix-container {
    position: relative;
    .affix-nav {
        padding: 0;
        margin: 0;

        display: flex;
        justify-content: space-between;
        align-items: center;
        position: sticky;
        top: 10px;
        background-color: #fff;
        z-index: 999999;
        li:first-child {
            border-top-left-radius: 4px;
            border-bottom-left-radius: 4px;
            border-right: none;
        }
        li:last-child {
            border-top-right-radius: 4px;
            border-bottom-right-radius: 4px;
            border-left: none;
        }
        li {
            border-right: 1px solid #ddd;
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
            border: 1px solid #ddd;
            a {
                text-decoration: none;
                color: #337ab7;
                vertical-align: -webkit-baseline-middle;
            }
            &:hover {
                background-color: #eeeeee;
            }
        }
        .active {
            color: #fff;
            background-color: #eeeeee;
        }
    }
    .affix-top {
        position: static;
    }
    .affix-ing {
        position: fixed;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.067);
    }
}
.affix-content {
    padding-top: 60px;
    scroll-behavior: smooth;
    overflow-y: scroll;
}
</style>
