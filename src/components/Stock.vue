<script setup>
import FormModal from '@/modals/FormModal.vue'
import DeletionModal from '@/modals/DeletionModal.vue' 
import { StockService } from '@/services/StockService'
import ErrorToast from '@/toasts/ErrorToast.vue'
import SuccessToast from '@/toasts/SuccessToast.vue'
import {ref, computed, onMounted, watch }from 'vue'
const {fetchStockItems, fetchStockItemHistory, deleteStockItem, updateStockItem, addStockItem, adjustStockLevels} = StockService()

import {Field, Form} from 'vee-validate'
import StockAdjustModal from '@/modals/StockAdjustModal.vue'
import { formValidationSchema } from '@/composables/validationSchema'
import { adjustValidationSchema } from '@/composables/adjustValidationSchema'

const productFormRef = ref(null)
const adjustmentFormRef = ref(null)
const isDraftEmpty = ref(false)


const error       = ref(null)   
const fieldErrors = ref({})    
const isSuccessful = ref(false)
const successMessage = ref('')
const isLoading = ref(false)
const stockItems = ref([])
const selectedItemHistory = ref([])
const searchQuery = ref('')
const selectedItem = ref(null)
const itemToDelete = ref(null)
const editingId = ref(null)       
const draft = ref({})     
const draftTouched = ref(false)  

const currentPage = ref(1)
const pageSize = ref(6) 


const filteredStockItems = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return stockItems.value
  return stockItems.value.filter((item) =>
    item.title.toLowerCase().includes(q)
  )
})



async function fetchStock() {
isLoading.value = true;
try {
     const [stock] = await Promise.all([
      fetchStockItems(),
      new Promise(r => setTimeout(r, 500))  
    ])

     stockItems.value = stock


} catch (e) {
    error.value = e.message
    fieldErrors.value = e.errors ?? {}
    isLoading.value = false
} finally {
  isLoading.value = false
}

}

async function onSubmit(payload, { resetForm } = {}) {
  isLoading.value = true
  try {
     const [addedItem] = await Promise.all([
      addStockItem(payload),
      new Promise(r => setTimeout(r, 500)),
    ])
  
    successMessage.value = 'Item Added successfully'
    isSuccessful.value = true
    isLoading.value = false
    currentPage.value = 1
    stockItems.value.unshift(addedItem)

 } catch (e) {
  
  error.value = e.message
  isLoading.value = false
 } 
  resetForm?.()
}

async function submitAdjustment(payload, {resetForm}= {}) {
   isLoading.value = true
  try {
     const [addedItem] = await Promise.all([
      adjustStockLevels({...payload}, selectedItem.value),
      new Promise(r => setTimeout(r, 500)),
    ])

    const index = stockItems.value.findIndex((i) => i.id === selectedItem.value)
    if (index !== -1) {
      stockItems.value[index] = {
        ...stockItems.value[index],
        ...addedItem,
      }
    }
    selectedItemHistory.value = await fetchStockItemHistory(selectedItem.value)
  
    successMessage.value = 'Stock level updated successfully'
    isSuccessful.value = true
    isLoading.value = false


 } catch (e) {
  
  error.value = e.message
  isLoading.value = false
 } 
     resetForm?.()

}


async function selectItem(id) {
  selectedItem.value = selectedItem.value === id ? null : id
  if (editingId.value) cancelEdit()
  if (!selectedItem.value) return
  
    isLoading.value = true
    selectedItemHistory.value = []
  if (selectedItem.value){
     try {
      const [history] = await Promise.all([
      fetchStockItemHistory(selectedItem.value),
      new Promise(r => setTimeout(r, 500))  
    ])
    selectedItemHistory.value = history

  } catch(e) {
    error.value = e.message
    isLoading.value = false

  } finally {

    isLoading.value = false
    isSuccessful.value = false
    error.value = null;
  }

  }

 
}

function editItem(item) {
  editingId.value = item.id
  draft.value = { title: item.title }
  
}

function cancelEdit() {
  editingId.value = null
  draft.value = {}
}

async function saveEdit(payload) {
  const newTitle = draft.value.title.trim()
  if (!newTitle || newTitle === '') cancelEdit()

  isLoading.value = true

  try {
    const [updated] = await Promise.all([
      updateStockItem({ ...payload, title: newTitle }, selectedItem.value),
      new Promise(r => setTimeout(r, 500)),
    ])
    payload.title = newTitle        
    successMessage.value = 'Item title updated successfully'
    isSuccessful.value = true
    editingId.value = null
    draft.value = {}
  } catch (e) {
    error.value = e.message  
  }
  isLoading.value = false
}


async function deleteItem(id) {

  if (!id) return
  isLoading.value = true

  try {
    const ok = await deleteStockItem(id)
    if (!ok) {
      error.value = 'Could not delete item'
      return
    }
    stockItems.value = stockItems.value.filter(i => i.id !== id)

    if (selectedItem.value === id) {
      selectedItem.value = null
      selectedItemHistory.value = []
    }
    successMessage.value = 'Item deleted successfully'
    isSuccessful.value = true
    isLoading.value = false
  } catch (e) {
        isLoading.value = false
    error.value = e.message
  }

}



//Pagination 
const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredStockItems.value.length / pageSize.value))
)

const paginatedStockItems = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredStockItems.value.slice(start, start + pageSize.value)
})

watch(totalPages, (_totalPages) => {
  if (currentPage.value > _totalPages) currentPage.value = _totalPages
})

watch(searchQuery, () => { currentPage.value = 1 })

function goToPage(page) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
}

onMounted(fetchStock)


</script>
<template>
<div class="p-2 d-flex align-items-center">
  <button data-bs-target="#formModal" data-bs-toggle="modal" class="btn btn-primary d-inline-flex align-items-center">
    <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="1em" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
      <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
    </svg>
    New Product
  </button>

  <div v-if="isLoading" class="spinner-grow text-primary mx-auto" role="status">
    <span class="visually-hidden">Loading...</span>
  </div>
</div>
<div class="row p-3"> 
  
</div>

  <div class="row p-3">
<div class="col-sm-6 mb-3">
<div class="card">
 <div class="card-header d-flex align-items-center justify-content-between gap-2">
  <h5 class="card-title mb-0">Stock Items</h5>
  <input
    v-model="searchQuery"
    type="search"
    class="form-control form-control-sm w-auto"
    placeholder="Search items…"
  />
</div>
<div class="card-body">
  <nav class="mb-2" v-if="totalPages > 1" aria-label="Stock items pagination">
  <ul class="pagination pagination-sm mb-0">
    <li class="page-item" :class="{ disabled: currentPage === 1 }">
      <button type="button" class="page-link" @click="goToPage(currentPage - 1)">
        Previous
      </button>
    </li>

    <li
      v-for="p in totalPages"
      :key="p"
      class="page-item"
      :class="{ active: currentPage === p }"
    >
      <button
        type="button"
        class="page-link"
        :aria-current="currentPage === p ? 'page' : undefined"
        @click="goToPage(p)"
      >
        {{ p }}
      </button>
    </li>

    <li class="page-item" :class="{ disabled: currentPage === totalPages }">
      <button type="button" class="page-link" @click="goToPage(currentPage + 1)">
        Next
      </button>
    </li>
  </ul>
</nav>
<TransitionGroup  name="stock-list" tag="div" class="row g-3">
  <div v-for="item in paginatedStockItems" :key="item.id" class="col-sm-6">
    <div
      @click="selectItem(item.id)"
      class="card stock-item-card"
      :class="{ 'border-primary': selectedItem === item.id }"
    >
      <div class="card-body">
 <h5
  v-if="editingId !== item.id" class="card-title d-flex align-items-center justify-content-between mb-3"
>
  {{ item.title }}
</h5>



<div v-else class="d-flex gap-2">
  <input
    v-model="draft.title"
       class="form-control form-control-sm"
      :class="{ 'border-danger shadow-sm': !draft.title.trim() && draftTouched }"
      @input="draftTouched = true"
      @click.stop
    @keyup.enter="saveEdit(item)"
    @keyup.esc="cancelEdit"
  />

  <button :disabled="!draft.title.trim()" class="btn btn-sm btn-success"  @click.stop="saveEdit(item)">
    <i class="bi bi-check"></i>
  </button>
  <button class="btn btn-sm btn-secondary" @click.stop="cancelEdit">
    <i class="bi bi-x"></i>
  </button>
</div>
        <p class="card-title d-flex align-items-center justify-content-between mt-3">
          Available Stock:
          <span
            class="badge"
            :class="item.quantity >= 2 ? 'bg-success' : 'bg-warning text-dark'"
          >
            {{ item.quantity }}
          </span>
        </p>
        <div class="d-flex gap-2">
          
          <button
            :disabled="selectedItem !== item.id"
            class="btn btn-sm btn-outline-primary"
            title="Edit"
            @click.stop="editItem(item)"
          >
            <i class="bi bi-pencil"></i>
          </button>
          <button
            :disabled="selectedItem !== item.id"
            class="btn btn-sm btn-outline-success"
            title="Adjust stock"
            data-bs-target="#stockLevelModal"
            data-bs-toggle="modal"
            @click.stop.prevent="selectedItem = item.id"       
                           >
            <i class="bi bi-sliders"></i>
          </button>
          <button
            :disabled="selectedItem !== item.id"
            class="btn btn-sm btn-outline-danger"
            title="Delete"
            data-bs-toggle="modal"
            data-bs-target="#deletionModal"
            @click.stop="itemToDelete = item"
          >
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</TransitionGroup>

  <div v-if="!filteredStockItems.length" class="col-12 text-center text-muted py-4">
    No items match "{{ searchQuery }}".
  </div>
</div>
</div>
    </div>

<div v-if="selectedItem && selectedItemHistory.length > 0" class="col-sm-6">
    <div class="card">
        <div class="card-header">
        <label class="card-title">{{ stockItems.find((i) => i.id === selectedItem)?.title }} Adjustment History</label>

        </div>
    <div class="card-body">
     <table class="table table-dark table-hover">
  <thead>
    <tr>
      <th scope="col">ID</th>
      <th scope="col">Adjustment</th>
      <th scope="col">Reason</th>
      <th scope="col">Date</th>
    </tr>
  </thead>
  <tbody>
    <tr v-for="item in selectedItemHistory" :key="item.id">
      <th scope="row">{{ item.id }}</th>
      <td>{{ item.delta }}</td>
      <td>{{item.reason}}</td>
      <td>{{item.created_at}}</td>
</tr>
  </tbody>
</table>
    </div>
</div>
</div>
<div class="col-sm-6 text-center" >
      <div v-if="selectedItem && selectedItemHistory.length < 1 && !isLoading" class="text-center">
        <p class="tex-muted p-3"> No Adjustment history available for {{  stockItems.find(i => i.id === selectedItem)?.title}}</p>
       </div>
</div>
</div>

   <DeletionModal  id="deletionModal">
            <template v-slot:modal-title>
                              <h5 v-if="itemToDelete">Delete {{ itemToDelete.name  }}</h5>

            </template>
            <template v-slot:modal-body>
               <div  class="alert alert-warning alert-dismissible" role="alert">
                  Are you sure you want to delete this item? 
              </div>
            </template>
            <template v-slot:modal-footer>
             <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button @click="deleteItem(selectedItem)" data-bs-dismiss="modal" type="button"  class="btn btn-primary">Confrirm</button>
            </template>
      
</DeletionModal>

<FormModal @reset-form="productFormRef?.resetForm()" id="formModal">
  <template v-slot:modal-title>
    <h5>Add new Stock {{ stockItems.find((i) => i.id === selectedItem)?.title }}</h5>
  </template>

  <template v-slot:modal-body>
    <Form
      ref="productFormRef"
      id="product-form"
      class="details-form form-group form-group-sm"
      :validation-schema="formValidationSchema"
      :initial-values="{title: '', quantity: ''}"
      @submit="onSubmit"
    >
      <div class="d-flex flex-column gap-3 mb-3">
        <Field
          :validate-on-input="false"
          :validate-on-change="false"
          :validate-on-model-update="false"
          :validate-on-blur="true"
          name="title"
          v-slot="{ field, errors, errorMessage, meta }"
        >
          <div class="d-flex flex-column">
            <label for="title" class="d-flex mb-2 form-label">Title</label>

            <div class="d-flex align-items-center gap-2">
              <input
                class="form-control field-narrow"
                v-bind="field"
                type="text"
                placeholder="JBL Wave Beam"
                id="title"
              />
              <Transition name="fade" mode="out-in">
                <svg
                  v-show="meta.touched && meta.validated && meta.valid"
                  xmlns="http://www.w3.org/2000/svg"
                  width="1em"
                  height="1em"
                  fill="currentColor"
                  class="text-success"
                  viewBox="0 0 16 16"
                >
                  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                  <path d="m10.97 4.97-.02.022-3.473 4.425-2.093-2.094a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05"/>
                </svg>
              </Transition>
            </div>

            <Transition name="fade" mode="out-in">
              <span
                class="text-danger error-label mt-1"
                v-if="errors.length"
              >{{ errorMessage }}</span>
            </Transition>
          </div>
        </Field>

        <Field
          :validate-on-input="false"
          :validate-on-change="false"
          :validate-on-model-update="false"
          :validate-on-blur="true"
          name="quantity"
          v-slot="{ field, errors, errorMessage, meta }"
        >
          <div class="d-flex flex-column">
            <label for="quantity" class="d-flex mb-2 form-label">Quantity</label>

            <div class="d-flex align-items-center gap-2">
              <input
                class="form-control field-narrow"
                v-bind="field"
                type="text"
                inputmode="numeric"
                placeholder="5"
                id="quantity"
              />
              <Transition name="fade" mode="out-in">
                <svg
                  v-show="meta.touched && meta.validated && meta.valid"
                  xmlns="http://www.w3.org/2000/svg"
                  width="1em"
                  height="1em"
                  fill="currentColor"
                  class="text-success"
                  viewBox="0 0 16 16"
                >
                  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                  <path d="m10.97 4.97-.02.022-3.473 4.425-2.093-2.094a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05"/>
                </svg>
              </Transition>
            </div>

            <Transition name="fade" mode="out-in">
              <span
                class="text-danger error-label mt-1"
                v-if="errors.length"
              >{{ errorMessage }}</span>
            </Transition>
          </div>
        </Field>
      </div>
    </Form>
  </template>
</FormModal>

<StockAdjustModal @reset-form="adjustmentFormRef?.resetForm()" id="stockLevelModal">
  <template v-slot:modal-title>
    <h5>Adjust Stock level for{{ stockItems.find((i) => i.id === selectedItem)?.title }}</h5>
  </template>

  <template v-slot:modal-body>
    <Form
      ref="adjustmentFormRef"
      id="stock-level-form"
      class="details-form form-group form-group-sm"
      :validation-schema="adjustValidationSchema"
      :initial-values="{delta :'', reason: ''}"
      @submit="submitAdjustment"
    >
      <!-- stacked fields -->
      <div class="d-flex flex-column gap-3 mb-3">
        <Field
          :validate-on-input="false"
          :validate-on-change="false"
          :validate-on-model-update="false"
          :validate-on-blur="true"
          name="delta"
          v-slot="{ field, errors, errorMessage, meta }"
        >
          <div class="d-flex flex-column">
            <label for="delta" class="d-flex mb-2 form-label">Quantity</label>

            <div class="d-flex align-items-center gap-2">
              <input
                class="form-control field-narrow"
                v-bind="field"
                type="text"
                placeholder="10"
                id="delta"
              />
              <Transition name="fade" mode="out-in">
                <svg
                  v-show="meta.touched && meta.validated && meta.valid"
                  xmlns="http://www.w3.org/2000/svg"
                  width="1em"
                  height="1em"
                  fill="currentColor"
                  class="text-success"
                  viewBox="0 0 16 16"
                >
                  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                  <path d="m10.97 4.97-.02.022-3.473 4.425-2.093-2.094a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05"/>
                </svg>
              </Transition>
            </div>

            <Transition name="fade" mode="out-in">
              <span
                class="text-danger error-label mt-1"
                v-if="errors.length"
              >{{ errorMessage }}</span>
            </Transition>
          </div>
        </Field>

        <Field
          :validate-on-input="false"
          :validate-on-change="false"
          :validate-on-model-update="false"
          :validate-on-blur="true"
          name="reason"
          v-slot="{ field, errors, errorMessage, meta }"
        >
          <div class="d-flex flex-column">
            <label for="reason" class="d-flex mb-2 form-label">Reason</label>

            <div class="d-flex align-items-center gap-2">
              <input
                class="form-control field-narrow"
                v-bind="field"
                type="text"
                inputmode="numeric"
                placeholder="Top Up - INV12345"
                id="reason"
              />
              <Transition name="fade" mode="out-in">
                <svg
                  v-show="meta.touched && meta.validated && meta.valid"
                  xmlns="http://www.w3.org/2000/svg"
                  width="1em"
                  height="1em"
                  fill="currentColor"
                  class="text-success"
                  viewBox="0 0 16 16"
                >
                  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                  <path d="m10.97 4.97-.02.022-3.473 4.425-2.093-2.094a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05"/>
                </svg>
              </Transition>
            </div>

            <Transition name="fade" mode="out-in">
              <span
                class="text-danger error-label mt-1"
                v-if="errors.length"
              >{{ errorMessage }}</span>
            </Transition>
          </div>
        </Field>
      </div>
    </Form>
  </template>
</StockAdjustModal>



<ErrorToast
  :show="!!error && !isLoading"
  :message="error ?? ''"
  @close-error-toast="error = null"
/>

<SuccessToast
:show="!!isSuccessful"
:message="successMessage"
@close-success-toast="isSuccessful = null"
/>

</template>

<style>
.stock-item-card {
  cursor: pointer;
  transition:
    transform 0.35s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.stock-item-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

.stock-list {
  position: relative;
}

.stock-list-move {
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.stock-list-enter-active {
  transition:
    opacity 0.55s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.55s cubic-bezier(0.4, 0, 0.2, 1);
}

.stock-list-leave-active {
  position: absolute;
  transition:
    opacity 0.45s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.45s cubic-bezier(0.4, 0, 0.2, 1);
}

.stock-list-enter-from {
  opacity: 0;
  transform: translateX(-16px) scale(0.97);
}

.stock-list-leave-to {
  opacity: 0;
  transform: translateX(16px) scale(0.97);
}
.field-narrow{
  width: 60%;
}

</style>