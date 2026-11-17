  <script setup>
  </script>

  <template>
  <div id="stockLevelModal" class="modal"  tabindex="-1">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <slot name="modal-title">
          <!-- Custom title goes here -->
        </slot>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <slot name="modal-body"></slot>

      </div>
      <div class="modal-footer">
        <slot name="modal-footer">
            <button type="button" class="btn btn-secondary" @click="$emit('reset-form')">Reset</button>
      <button type="submit" form="stock-level-form" class="btn btn-primary" data-bs-dismiss="modal" >Update</button>
        </slot>
         
      </div>
    </div>
  </div>
</div>
  </template>

  <style>
.fade-enter-active,
.fade-leave-active,
.fade-move {
  transition: all 0.4s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
.fade-leave-active {
  position: relative; 
}
  </style>
