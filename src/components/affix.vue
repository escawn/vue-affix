<template lang="html">
	<div class="affix-container" ref="body">
		<ul class="affix-nav" :class="affixState" ref="affixNav" :style="{top: initOffsetTop + 'px'}">
			<li v-for="(item, index) in panes" :class="{'active': index === activeIndex}">
				<a href="javascript:void(0)"
				@click="handleClick(index)"
				>{{item.label}}</a>
			</li>
		</ul>
		<div v-show="affixState === 'affix-ing'" :style="{height: affixHeight + 'px'}"></div>
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
    }

  },
  data () {
    return {
      panes: [],
      Top: 0,
      activeIndex: 0,
      affixState: 'affix-top',
      flag: 0,
      affixHeight: 0,
      animationFrameFlag: 0,
      timer: 0
    }
  },
  watch: {},
  computed: {
    distance () {
      // 当正好处于某个content位置时，content应与窗口顶部相隔distance距离，以便留给affix展示
      return this.initOffsetTop + this.affixHeight + this.elementDistance
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
    getAffixState () {
      // 不同浏览器内核下scrolltop取值方式不同
      let top = document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop
      if (this.affixState === 'affix-top') {
        if (this.initOffsetTop !== null && this.$refs.affixNav.getBoundingClientRect().top >= this.initOffsetTop) {
          return 'affix-top'
        }
        return 'affix-ing'
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
      // 不同浏览器内核下scrolltop取值方式不同
      let top = document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop
      me.panes.forEach((item, index) => {
        // 1是affix border的高，border会影响tab之间的切换，待解决
        if (me.getPosition(item.$refs.content).top - top <= (me.distance) + 1) {
          me.activeIndex = index
          return
        }
      })
      if (!me.isSupportSticky) {
        me.affixState = me.getAffixState()
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
      window.removeEventListener('scroll', me.scrollListener)
      // clearInterval(me.timer)
      this.activeIndex = index
      let e = this.panes[index]
      let f = e.$refs.content
      let h = me.getPosition(f)
      console.log(h)
      const newScrollTop = me.getPosition(this.panes[index].$refs.content).top - this.distance
      if (me.isSmoothScroll) {
        me.smoothScroll(newScrollTop)
      } else {
        window.scrollTo(0, newScrollTop)
        window.addEventListener('scroll', me.scrollListener)
      }
      //   me.timer = setInterval(() => {
      //     let flag = me.isHandScroll()
      //     console.log('aaa')
      //     // 判断滑动过程中是否有手动滑动打断滚动
      //     if (flag || Math.abs(document.documentElement.scrollTop - newScrollTop) <= 5) {
      //       console.log('aaa')
      //       clearInterval(me.timer)
      //       window.addEventListener('scroll', me.scrollListener)
      //     } else {
      //       if (document.documentElement.scrollTop < newScrollTop) {
      //         document.documentElement.scrollTop += 5
      //         // me.panes[index].$refs.content.offsetTop
      //       } else if (document.documentElement.scrollTop > newScrollTop) {
      //         document.documentElement.scrollTop -= 5
      //       }
      //       if (Math.abs(document.documentElement.scrollTop - newScrollTop) < 5) {
      //         clearInterval(me.timer)
      //         window.addEventListener('scrolll', me.scrollListener)
      //       }
      //     }
      //   }, 20)
    },
    // 通过requestAnimationFrame实现平滑滚动
    smoothScroll (target) {
      const me = this
      let top = document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop
      console.log('aaa')
      if (Math.abs(top - target) <= 5) {
        console.log('aaa')
        window.cancelAnimationFrame(me.animationFrameFlag)
        window.addEventListener('scroll', me.scrollListener)
      } else {
        if (top <= target) {
          window.scrollTo(0, top + 15)
          // me.panes[index].$refs.content.offsetTop
        } else if (top > target) {
          window.scrollTo(0, top - 15)
        }
        if (Math.abs(top - target) > 15) {
          me.animationFrameFlag = window.requestAnimationFrame(() => { me.smoothScroll(target) })
        } else {
          window.cancelAnimationFrame(me.animationFrameFlag)
          window.addEventListener('scroll', me.scrollListener)
        }
      }
    }
  },
  mounted: function () {
    const me = this
    this.$nextTick(() => {
      me.$children.forEach((item, index) => {
        me.addPanes(item)
      })
      window.addEventListener('scroll', me.scrollListener)
      // flag为到达刚好从affix-top转变为affix时，滚动条卷去的距离
      me.flag = me.getPosition(me.$refs.affixNav).top - me.initOffsetTop
      me.affixHeight = me.$refs.affixNav.offsetHeight
    })
  }
}
</script>

<style lang="less" scoped>
.affix-container {
    position: relative;
    .affix-nav {
        width: 400px;
        height: 30px;
        padding: 0;
        margin: 0;
        border-radius: 4px;
        border: 1px solid #ddd;
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: sticky;
        top: 10px;
        background-color: #fff;
        z-index: 999999;
        li {
            border-right: 1px solid #ddd;
            width: 33%;
            display: inline-block;
            height: 100%;
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
