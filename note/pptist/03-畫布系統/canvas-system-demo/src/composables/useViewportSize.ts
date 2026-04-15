// 監聽一個元素，並輸出它目前的像素寬高。
import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue'

export function useViewportSize(targetRef: Ref<HTMLElement | null>) {
  // width 和 height 保持響應式，讓 fit zoom 可以自動重算。
  const width = ref(0)
  const height = ref(0)
  // 優先使用 ResizeObserver，沒有時才退回 window resize。
  let observer: ResizeObserver | null = null

  // 直接從 DOM 節點讀取目前尺寸。
  const updateSize = () => {
    const element = targetRef.value

    if (!element) {
      width.value = 0
      height.value = 0
      return
    }

    width.value = element.clientWidth
    height.value = element.clientHeight
  }

  onMounted(() => {
    // 元件掛載後先量一次。
    updateSize()

    if ('ResizeObserver' in window) {
      // 現代瀏覽器：監看實際元素尺寸變化。
      observer = new ResizeObserver(() => {
        updateSize()
      })

      if (targetRef.value) {
        observer.observe(targetRef.value)
      }
    } else {
      // 舊環境的退路。
      globalThis.addEventListener('resize', updateSize)
    }
  })

  onBeforeUnmount(() => {
    // 清理前面建立的監聽機制。
    observer?.disconnect()
    globalThis.removeEventListener('resize', updateSize)
  })

  return {
    width,
    height,
    updateSize,
  }
}
