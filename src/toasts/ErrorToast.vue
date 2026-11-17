<script setup>

import { watch, onBeforeUnmount } from 'vue'

const props = defineProps({
  show:     { type: Boolean, default: false },
  message:  { type: String,  default: '' },
  duration: { type: Number,  default: 3000 },
})
const emit = defineEmits(['close-error-toast'])

let timer = null
const clear = () => { clearTimeout(timer); timer = null }

watch(
  [() => props.show, () => props.message],
  ([isShown]) => {
    clear()
    if (isShown) timer = setTimeout(() => emit('close-error-toast'), props.duration)
  },
  { immediate: true }
)

onBeforeUnmount(clear)

</script>

<template>
 <Transition name="toast">
  <div
    v-if="show"
    class="position-fixed top-0 start-0 end-0 d-flex justify-content-center pt-3"
    style="z-index: 1090; pointer-events: none;"
  >
    <div class="toast show bg-danger" role="alert" aria-live="polite" aria-atomic="true">
      <div class="toast-body text-white">
<svg xmlns="http://www.w3.org/2000/svg" width="2em" height="1em" me-1 fill="currentColor" class="bi bi-x-circle" viewBox="0 0 16 16">
  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
  <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
</svg>
        <slot name="message">{{ message }}</slot>
      </div>
    </div>
  </div>
</Transition>

</template>

<style>
.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}
</style>