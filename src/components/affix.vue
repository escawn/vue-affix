<template lang="html">
	<div class="affix-container">
		<ul class="tag-pane" :class="state" ref="affix">
			<li v-for="(item, index) in panes" :class="{'active': index === activeIndex}">
				<a href="javascript:void(0)"
				@click="handleClick(index)"
				>{{item.label}}</a>
			</li>
		</ul>
		<div class="affix-content" :style="paneStyle" ref="mainContent">
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
      default: 0
    },
    elementDistance: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {
      panes: [],
      paneStyle: {
        transform: ''
      },
      Top: document.body.scrollTop,
      activeIndex: 0,
      state: 'affix-top',
      flag: 0,
      affixHeight: 0
    }
  },
  watch: {
  },
  computed: {
    distance () {
      return this.initOffsetTop + this.affixHeight + this.elementDistance
    }
  },
  methods: {
// 获取元素顶部与文档之间距离
    getPosition (el) {
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
          console.log('1')
          func.apply(self, args)
        } else {
          deferTimer = setTimeout(() => {
          }, delay)
        }
      }
    },
// 获取Affix状态
    getAffixState () {
      if (this.state === 'affix-top') {
        if (this.initOffsetTop !== null && this.$refs.affix.getBoundingClientRect().top >= this.initOffsetTop) {
          return 'affix-top'
        }
        return 'affix'
      } else {
        if (this.Top <= this.flag) {
          return 'affix-top'
        } else {
          return 'affix'
        }
      }
    },
    scrollListener () {
      const me = this
      window.addEventListener('scroll', () => {
        me.Top = document.body.scrollTop
        me.state = me.getAffixState()
        me.panes.forEach((item, index) => {
// 1是affix border的高，border会影响tab之间的切换，待解决
          if (me.getPosition(item.$refs.content).top - me.Top <= (me.distance) + 1) {
            me.activeIndex = index
            return
          }
        })
      })
    },
    addPanes (item) {
      this.panes.push(item)
    },
    handleClick (index) {
// 解绑滚动事件
      this.activeIndex = index
      const newScrollTop = this.getPosition(this.panes[index].$refs.content).top - this.distance
      // document.body.scrollTop = newScrollTop
      const timer = setInterval(() => {
        if (document.body.scrollTop < newScrollTop) {
          document.body.scrollTop += 1
        } else if (document.body.scrollTop > newScrollTop) {
          document.body.scrollTop -= 1
        }
        if ((document.body.scrollTop - newScrollTop < 1 && document.body.scrollTop - newScrollTop > 0) || (document.body.scrollTop - newScrollTop < 0 && document.body.scrollTop - newScrollTop > -1)) {
// 绑定滚动事件
          clearInterval(timer)
        }
      }, 10)
    }
  },
  mounted: function () {
    const me = this
    this.$nextTick(() => {
      me.$children.forEach((item) => {
        me.addPanes(item)
      })
      me.scrollListener()
// flag为到达刚好从affix-top转变为affix时，滚动条卷去的距离
      me.flag = me.getPosition(me.$refs.affix).top - me.initOffsetTop
      me.affixHeight = me.$refs.affix.offsetHeight
    })
  }
}
</script>

<style lang="less" scoped>
.affix-container {
    position: relative;
    .tag-pane {
        width: 400px;
		height: 30px;
		padding: 0;
		margin: 0;
        border-radius: 4px;
        border: 1px solid #ddd;
		display: flex;
		justify-content: space-between;
		align-items: center;
		left: 10px;
		top: 0px;
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
				&:hover{
					background-color: #eeeeee;
				}
		}
    }
	.affix-top {
		position: static;
	}
	.affix {
		position: fixed;
		top: 20px;
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.067);
	}
}
.affix-content {
    padding-top: 60px;
}
.active {
	color: #fff;
	background-color: #eeeeee;
}
</style>
