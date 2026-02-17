<template>
  <transition name="fade">
    <div v-if="show" class="lottie-container">
      <div class="lottie-box" ref="lottieContainer"></div>
    </div>
  </transition>
</template>

<script>
import lottie from 'lottie-web'

export default {
  name: 'LottieAnimation',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    animationData: {
      type: String,
      default: 'https://cdn.zww0891.fun/data.json'
    }
  },
  data() {
    return {
      animation: null
    }
  },
  watch: {
    show(newVal) {
      if (newVal) {
        this.initAnimation()
      } else {
        this.destroyAnimation()
      }
    }
  },
  mounted() {
    if (this.show) {
      this.initAnimation()
    }
  },
  beforeDestroy() {
    this.destroyAnimation()
  },
  methods: {
    initAnimation() {
      if (this.animation) {
        return
      }
      
      this.$nextTick(() => {
        if (!this.$refs.lottieContainer) {
          return
        }
        
        this.animation = lottie.loadAnimation({
          container: this.$refs.lottieContainer,
          renderer: 'svg',
          loop: false,
          autoplay: true,
          path: this.animationData
        })
        
        let isOk = false
        
        // 监听动画帧，在58帧时循环播放
        this.animation.addEventListener('enterFrame', () => {
          if (!isOk) {
            if (this.animation.currentFrame >= 58) {
              this.animation.goToAndPlay(0, true)
            }
          }
        })
        
        // 4秒后停止循环
        setTimeout(() => {
          isOk = true
        }, 4000)
        
        // 动画完成后触发事件
        this.animation.addEventListener('complete', () => {
          this.$emit('complete')
        })
      })
    },
    destroyAnimation() {
      if (this.animation) {
        this.animation.destroy()
        this.animation = null
      }
    }
  }
}
</script>

<style scoped>
.lottie-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #000;
  z-index: 10000;
  pointer-events: none;
}

.lottie-box {
  position: absolute;
  width: 50rem;
  max-width: 90vw;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.8s ease, transform 0.8s ease;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
  transform: translateY(100%);
}
</style>

