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
    }
  },
  methods: {
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
