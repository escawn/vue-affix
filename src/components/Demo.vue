<template>
<div class="demo">
	<affix :initOffsetTop="maxtop" :elementDistance="distance" style="height: 420px;">
1111
    </affix>

</div>
</template>

<script>
import affixPane from './affix-pane.vue'
import affix from './affix.vue'
export default {
  name: 'demo',
  components: {
    affixPane,
    affix
  },
  data () {
    return {
      maxtop: 20,
      distance: 20
    }
  },
  mounted: function () {
    this.$nextTick(() => {})
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1,
h2 {
  font-weight: normal;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}

.demo {}
</style>
