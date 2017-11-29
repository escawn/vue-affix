<template lang="html">
	<div class="affix-container" ref="affix" :style="overScroll?{overflow: 'scroll'}:''">
				<ul class="affix-nav" :class="affixState" ref="affixNav" :style="{top: actualOffsetTop + 'px', height: affixNavHeight, width: affixNavWidth}">
					<li v-if="pure">
						<a href="javascript:void(0)" @click="handleClick"><slot name="affix-content"></slot></a>
					</li>
					<li v-for="(item, index) in panes" :class="{'active': index === activeIndex}">
						<a href="javascript:void(0)"
						@click="handleClick(index)"
						>{{item.label}}</a>
					</li>
				</ul>
				<div v-show="affixState === 'affix-ing'" :style="{height: affixNavHeight }"></div>
				<div class="affix-content" v-if="!pure">
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
      default: '70%'
    },
    affixNavHeight: {
      type: String,
      default: '30px'
    },
    pure: {
      type: Boolean,
      default: false
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
      actualOffsetTop: 0,
      affixLeft: 0
    }
  },
  watch: {},
  computed: {
    distance () {
      // 当正好处于某个content位置时，content应与窗口顶部相隔distance距离，以便留给affix展示
      return (
        this.actualOffsetTop + this.affixNavSize.height + this.elementDistance
      )
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
    initAffix () {
      const me = this
      me.affixNavSize = {
        height: me.$refs.affixNav ? me.$refs.affixNav.offsetHeight : 0,
        width: me.$refs.affixNav ? me.$refs.affixNav.offsetWidth : 0
      }
      me.affixHeight = me.$refs.affix.offsetHeight
      me.container = me.overScroll ? me.$refs.affix : window
      me.container.addEventListener('scroll', me.scrollListener)
      let affixNavPosition = me.getPosition(
        me.pure ? me.$refs.affixNav : me.$refs.affix
      )
      let affixPosition = me.getPosition(me.$refs.affix)
      me.actualOffsetTop = me.overScroll
        ? Math.min(affixNavPosition.top, me.initOffsetTop + affixPosition.top)
        : Math.min(me.initOffsetTop, affixNavPosition.top)
      // flag为到达刚好从affix-top转变为affix时，滚动条卷去的距离
      me.flag = affixNavPosition.top - me.actualOffsetTop
      me.affixLeft = affixNavPosition.left
      // resize而不刷新会导致报错
      window.addEventListener('resize', me.throttle(me.initAffix, 2000))
    },
    // 获取元素顶部与文档之间距离
    getPosition (el) {
      if (el) {
        let actualLeft = el.offsetLeft
        let actualTop = el.offsetTop
        let current = el.offsetParent
        while (current !== document.body && current !== null) {
          actualLeft += current.offsetLeft + current.clientLeft
          actualTop += current.offsetTop + current.clientTop
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
        if (
          this.actualOffsetTop !== null &&
          this.$refs.affixNav.getBoundingClientRect().top >=
            this.actualOffsetTop
        ) {
          return 'affix-top'
        } else {
          return 'affix-ing'
        }
      } else {
        if (top <= this.flag) {
          return 'affix-top'
        } else {
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
        top =
          document.documentElement.scrollTop ||
          window.pageYOffset ||
          document.body.scrollTop
      }
      // 兼容无affix-pane情况
      if (!me.pure) {
        me.panes.forEach((item, index) => {
          // 1是affix border的高，border会影响tab之间的切换，待解决
          if (me.getPosition(item.$refs.content).top - top <= me.distance) {
            me.activeIndex = index
            return
          }
        })
      }

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
      if (me.pure) {
        this.$emit('click-prescroll')
      } else {
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
        const newScrollTop = Math.round(
          me.getPosition(this.panes[index].$refs.content).top - this.distance
        )
        if (me.isSmoothScroll) {
          me.smoothScroll(newScrollTop, index)
        } else {
          me.container.scrollTop = newScrollTop
          me.container.addEventListener('scroll', me.scrollListener)
          // 此处暴露一个点击事件
          this.$emit('click-afterscroll', index)
        }
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
        top =
          document.documentElement.scrollTop ||
          window.pageYOffset ||
          document.body.scrollTop
      }
      top = Math.round(top)
      target = Math.round(target)
      if (target - top > 50) {
        me.overScroll
          ? (me.container.scrollTop = top + 50)
          : window.scrollTo(0, top + 50)
      } else if (top - target > 50) {
        me.overScroll
          ? (me.container.scrollTop = top - 50)
          : window.scrollTo(0, top - 50)
      } else {
        me.overScroll
          ? (me.container.scrollTop = target)
          : window.scrollTo(0, target)
      }
      if (Math.abs(target - top) > 1) {
        me.animationFrameFlag = window.requestAnimationFrame(() => {
          me.smoothScroll(target)
        })
      } else {
        window.cancelAnimationFrame(me.animationFrameFlag)
        me.container.addEventListener('scroll', me.scrollListener)
        this.$emit('click-afterscroll', index)
      }
      if (!me.isSupportSticky) {
        me.affixState = me.getAffixState(top)
      }
    },
    throttle (func, delay) {
      let deferTimer = null
      let lastTime = 0
      return function () {
        const self = this
        const args = arguments
        const currTime = new Date().getTime()
        clearTimeout(deferTimer)
        if (currTime - lastTime >= delay) {
          lastTime = currTime
          func.apply(self, args)
        } else {
          deferTimer = setTimeout(() => {}, delay)
        }
      }
    }
  },
  mounted: function () {
    this.$nextTick(() => {
      this.initAffix()
    })
  }
}
</script>

<style lang="less" scoped>
// 设置几个背景颜色主题
.affix-container {
  position: relative;
  .affix-nav {
    padding: 0;
    margin: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: releative;
    left: 50%;
    top: 10px;
    transform: translateX(-50%);
    background-color: #fff;
    z-index: 999999;
    color: #337ab7;
    border: 1px solid #ddd;
    border-radius: 4px;
    li {
      border-right: 1px solid #ddd;
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      border-right: 1px solid #ddd;
      a {
        color: #337ab7;
        text-decoration: none;
        vertical-align: -webkit-baseline-middle;
      }
      &:hover {
        background-color: #eeeeee;
      }
      &:last-child {
        border-right: none;
      }
    }
    .active {
      color: #fff;
      background-color: #eeeeee;
    }
  }
  .affix-top {
    position: relative;
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
