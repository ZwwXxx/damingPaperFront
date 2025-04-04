<!--
*@wrapper
*@author Zww
*@date 2024/10/7 9:32
-->
<template>
  <div :class="['container', sizeClass,padding, 'mx-auto bg-white shadow-lg relative']">
    <slot :customStyle="customStyle"></slot> <!-- 插槽，传递参数 -->
  </div>
</template>

<script>
export default {
  name: "wrapper",
  props: {
    size: {
      type: String,
      default: 'full', // 默认大小
    },
    padding: {
      type: String,
      default: 'p-8', // 默认大小
    },
  },

  computed: {
    sizeClass() {
      return {
        'w-1/3': this.size === 'sm', // 小宽度
        'w-1/2': this.size === 'md', // 中等宽度
        'w-3/4': this.size === 'lg', // 大宽度
        'w-full': this.size === 'full', // 全宽
      };
    },
    customStyle() {
      return {
        // 可以根据需要添加更多自定义样式
        color: 'blue',
      };
    },
  },
  components: {},
  data() {
    return {}
  },
  methods: {},
}
</script>

<style scoped>

</style>
