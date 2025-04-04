<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>

export default {
  name: 'App',
}
</script>
<!--/* 解决页面dialog出现时，页面滚动条出现消失导致的Message消息提示抖动问题 */-->
<!--//内容溢出时强制出现滚动条，防止elementui 弹框隐藏滚动条使其引起的页面宽度（内容+滚动条宽度）变化的抖动问题-->
<!--//不能设置为scroll 那样的话内容不溢出也有一条空的滚动条，很奇怪的-->
<style>
body {
  overflow-y: scroll !important;
  padding-right: 0 !important;
}

</style>
