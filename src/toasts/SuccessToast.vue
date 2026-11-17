<script setup>

import { watch, onBeforeUnmount } from 'vue'

const props = defineProps({
  show:     { type: Boolean, default: false },
  message:  { type: String,  default: '' },
  duration: { type: Number,  default: 3000 },
})
const emit = defineEmits(['close-success-toast'])

let timer = null
const clear = () => { clearTimeout(timer); timer = null }

watch(
  [() => props.show, () => props.message],
  ([isShown]) => {
    clear()
    if (isShown) timer = setTimeout(() => emit('close-success-toast'), props.duration)
  },
  { immediate: true }
)

onBeforeUnmount(clear)

</script>
<template>
  <Transition name="toast-pop">
    <div
      v-if="show"
      class="position-fixed top-0 start-0 end-0 d-flex justify-content-center pt-3"
      style="z-index: 1090; pointer-events: none;"
    >
      <div class="toast show bg-success" role="alert" aria-live="polite" aria-atomic="true">
        <div class="toast-body text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="1em" me-1 fill="currentColor" class="bi bi-check-circle" viewBox="0 0 16 16">
  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
  <path d="m10.97 4.97-.02.022-3.473 4.425-2.093-2.094a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05"/>
</svg>
          <slot name="message">{{ message }}</slot>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style>
.toast-pop-enter-active,
.toast-pop-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.toast-pop-enter-from,
.toast-pop-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}
</style>