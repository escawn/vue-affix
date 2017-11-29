<template>
  <div id="Demo">
    <header>
      <i><img src="./assets/affix-bold.png" alt="affix"></i>
      <p>VUE组件：AFFIX</p>
    </header>
    <affix>
      <affix-pane :label="'基础用法'">
        111
      </affix-pane>
      <affix-pane :label="'进阶用法'">222</affix-pane>
      <affix-pane :label="'后续feature'">333</affix-pane>
    </affix>
  </div>
</template>

<script>
import affixPane from './components/affix-pane.vue'
import affix from './components/affix.vue'

export default {
  name: 'app',
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

<style lang="less" scoped>
#Demo {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  header {
    width: 100%;
    height: 100px;
    background-image: url("./assets/crinkle.jpeg");
    background-size: contain;
    display: flex;
    justify-content: center;
    align-items: center;
    p {
      font-size: 40px;
      background-color: #fff;
      font-weight: bolder;
      padding: 5px;
      margin: 10px 20px;
    }
    img {
      width: 40px;
    }
  }
}
</style>
