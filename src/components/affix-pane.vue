<template lang="html">
	<div class="content" ref="content">
		<slot></slot>
	</div>

</template>

<script>
export default {
  name: 'affixPane',
  props: ['label'],
  data () {
    return {
      contentP: {},
      contentH: '',
      contentH2: '',
      contentH3: '',
      scrollTop: ''
    }
  },
  methods: {
    init () {
      this.contentH = this.$refs.content.clientHeight
      this.contentH2 = this.$refs.content.scrollHeight
      this.contentH3 = this.$refs.content.offsetHeight
      this.scrollTop = document.body.scrollTop
    },
    scrollEvent () {
      const me = this
      window.addEventListener('scroll', (e) => {
        me.$nextTick(() => {
        })
      })
    }
  },
  mounted: function () {
    this.$nextTick(() => {
    })
  }
}
</script>

<style lang="css">
.affix-pane{
	width: 300px;
	height: 200px;
}
.content {
	border-top: 1px solid #ddd;
	padding: 20px;
	width: 300px;
}
</style>
