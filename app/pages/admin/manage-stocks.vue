<template>
  <IonPage>
    <IonContent>
      <NuxtLayout>
        <div>
          <LoadingTable v-if="isGettingStocksData" />
          <div v-if="!isGettingStocksData" class="flex justify-end">
            <UButton color="secondary" variant="subtle" class="mr-2">Scan QR</UButton>
          </div>
          <div v-if="!isGettingStocksData" class="mt-6">
            <UInput v-model="globalFilter" class="mb-2" placeholder="Global Filter Search..." color="secondary" />
            <UTable ref="table" :data="allStocks" :columns="columns" v-model:global-filter="globalFilter" class="flex-1 bg-white rounded-lg" v-model:pagination="pagination" :pagination-options="{ getPaginationRowModel: getPaginationRowModel() }">
              <template #actions-cell="{ row }">
                <UButton variant="soft" color="neutral" @click="openActionsModal(row.original)">
                  <UIcon name="i-lucide-pen"></UIcon>
                </UButton>
                <UButton class="ml-2" variant="subtle" color="error" @click="openDeleteModal(row.original)">
                  <UIcon name="i-lucide-trash"></UIcon>
                </UButton>
              </template>
            </UTable>
            <div class="flex justify-center border-t border-default pt-4 px-4">
            <UPagination color="neutral" activeColor="neutral"
              :page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
              :items-per-page="table?.tableApi?.getState().pagination.pageSize"
              :total="table?.tableApi?.getFilteredRowModel().rows.length"
              @update:page="(p) => table?.tableApi?.setPageIndex(p - 1)"
            />
          </div>
            <UModal title="Edit Selected Equipment" v-model:open="isActionsModalOpen" :dismissible="false" :close="!isUpdatingEquipment">
              <template #body="{ close }">
                <UForm :schema="schema" :state="state" @submit="updateStock">
                  <UFormField label="Item name" name="selectedItemName" :error="isItemNameError">
                    <UInput color="secondary" variant="subtle" size="xl" class="w-full" placeholder="Item name" v-model="state.selectedItemName" />
                  </UFormField>
                  <UFormField label="Category" class="mt-4" name="selectedCategory">
                    <USelect color="secondary" variant="subtle" size="xl" class="w-full" placeholder="Item name" :items="categoriesItems" v-model="state.selectedCategory" />
                  </UFormField>
                  <UFormField label="Quantity" class="mt-4" name="selectedQuantity">
                      <UInputNumber color="secondary" class="w-30" v-model="state.selectedQuantity" :min="0" :max="200" variant="subtle"/>
                  </UFormField>
                  <UFormField label="Status" class="mt-4" name="selectedStatus">
                    <USelect color="secondary" variant="subtle" size="xl" class="w-full" placeholder="Item name" :items="statusItems" v-model="state.selectedStatus" />
                  </UFormField>
                  <div class="flex justify-end gap-x-2 mt-6">
                      <UButton color="error" variant="subtle" @click="closeEquipmentModal(close)" :disabled="isUpdatingEquipment">Cancel</UButton>
                      <UButton v-if="!isUpdatingEquipment" variant='subtle' color="secondary" >View full details</UButton>
                      <UButton v-if="!isUpdatingEquipment" type="submit"  color="secondary" >Update Equipment</UButton>
                      <UButton v-if="isUpdatingEquipment" color="secondary" loading>Updating Equipment ...</UButton>
                  </div>
                </UForm>
              </template>
            </UModal>
            <UModal title="Delete Equipment" v-model:open="isDeleteModalOpen" :ui="{ footer: 'justify-end'}" :dismissible="false" :close="!isDeletingItem">
              <template #body>
                <div class="w-full text-gray-800 text-center">
                  <p>Are you sure you want to delete <span class="font-bold text-red-500 uppercase">{{selectedItem.item_name}}</span></p> item?
                </div>
              </template>
              <template #footer="{ close }">
                <UButton color="error" variant="outline" @click="close" :disabled="isDeletingItem">Cancel</UButton>
                <UButton color="error" v-if="!isDeletingItem" @click="deleteItem">Delete Item</UButton>
                <UButton v-if="isDeletingItem" color="error" loading>Deleting Item...</UButton>
              </template>
            </UModal>
          </div>
        </div>
      </NuxtLayout>
    </IonContent>
  </IonPage>
</template>

<script setup>
  onIonViewWillEnter(() => {
    isGettingStocksData.value = true
    getStocks()
  })
  
  definePageMeta({
    layout: 'admin'
  })
  import { object, string, number } from 'yup'
  import { h, resolveComponent } from 'vue'
  import { getPaginationRowModel } from '@tanstack/vue-table'
  import { onIonViewWillEnter, onIonViewWillLeave } from '#imports'

  const supabase = useSupabaseClient()
  const table = useTemplateRef('table')
  const UBadge = resolveComponent('UBadge')
  const toast = useToast()
  const open = ref(false)
  const isActionsModalOpen = ref(false)
  const isDeleteModalOpen = ref(false)
  const selectedItem = ref({})
  const isGettingStocksData = ref(false)
  const statusItems = ref(['Available','Not Available'])
  const globalFilter = ref('')
  const allStocks = ref()
  const isMode = ref()
  const isUpdatingEquipment = ref(false)
  const isItemNameError = ref(null)
  const isDeletingItem = ref(false)
  const categoriesItems = ref(['Computer Hardware','Network and Cabling','Repair and Maintenance Tools','Power Equipment','Audio-Visual Devices','Remote Controls'])

  defineShortcuts({
    o: () => open.value = !open.value
  })

  const schema = object({
    selectedItemName: string().required('Item name is required'),
    selectedCategory: string().required('Category is required'),
    selectedQuantity: number().required('quantity is required'),
    selectedStatus: string().required('quantity is required')
  })
  
  const state = reactive({
    selectedItemName: undefined,
    selectedCategory: undefined,
    selectedQuantity: undefined,
    selectedStatus: undefined,
    selectedItemID: undefined
  })

  const getStocks = async () => {
    let { data: stocks, error: isError } = await supabase.from('tbl_item').select('*')

    if(isError) {
      toast.add({
        title: 'Server error',
        description: 'An error occured while getting data',
        icon: 'i-lucide-circle-x',
        color: 'error'
      })
      isGettingStocksData.value = false
      console.log(isError)
      return
    }


    if(stocks) {
      let fixStatusForQuantity = stocks.filter(item => item.quantity <= 0 && item.status == 'Available').map(item => item.item_id)

      if(fixStatusForQuantity.length > 0) {
        let { error: errUpdate } = await supabase.from('tbl_item').update({ status: 'Not Available' }).eq('item_id', fixStatusForQuantity)

        if(errUpdate) {
          toast.add({
            title: 'Server error',
            description: 'An error occured while getting data',
            icon: 'i-lucide-circle-x',
            color: 'error'
          })
          console.log(errUpdate)
          return
        }

        stocks.forEach(d => {
          if(fixStatusForQuantity.includes(d.item_id)) {
            d.status = 'Not Available'
          }
        })
        console.log('???')
      }
      allStocks.value = stocks
      isGettingStocksData.value = false
    }
  }
  
  const openActionsModal = (item) => {
    state.selectedItemName = item.item_name
    state.selectedCategory = item.category
    state.selectedQuantity = item.quantity
    state.selectedStatus = item.status
    state.selectedItemID = item.item_id
    isActionsModalOpen.value = true
    console.log(state.selectedItemID)
  }

  const updateStock = async () => {
    isUpdatingEquipment.value = true

    let { data, error } = await supabase.from('tbl_item').update({
      item_name: state.selectedItemName,
      category: state.selectedCategory,
      quantity: state.selectedQuantity,
      status: state.selectedStatus
    }).eq('item_id', state.selectedItemID).select()

    if(error) {
      toast.add({
        title: 'Server error',
        description: 'An error occured while updating data',
        icon: 'i-lucide-circle-x',
        color: 'error'
      })
      isUpdatingEquipment.value = false
      console.log(error)
      return
    }

    if(data) {
      
      await getStocks()
      isActionsModalOpen.value = false
      isUpdatingEquipment.value = false
      toast.add({
        title: 'Update Success!',
        description: 'Item has been successfully updated!',
        icon: 'i-lucide-message-circle-check',
        color: 'secondary'
      
      })
    }
  }

  const closeEquipmentModal = (close) => {
    isItemNameError.value = null
    close()
  }

  const openDeleteModal = (item) => {
    state.selectedItemID = item.item_id
    isDeleteModalOpen.value = true
  }

  const deleteItem = async () => {
    isDeletingItem.value = true
    let { error } = await supabase.from('tbl_item').delete().eq('item_id', state.selectedItemID)

    if(error) {
      toast.add({
        title: 'Server error',
        description: 'An error occured while deleting data',
        icon: 'i-lucide-circle-x',
        color: 'error'
      })
      isDeletingItem.value = false
      console.log(error)
      return
    }

    allStocks.value = allStocks.value.filter(d => d.item_id !== state.selectedItemID)

    toast.add({
      title: 'Delete Success!',
      description: 'Item has been deleted successfully!',
      icon: 'i-lucide-message-circle-check',
      color: 'secondary'
    
    })
    isDeletingItem.value = false
    isDeleteModalOpen.value = false
  }

  const pagination = ref({
    pageIndex: 0,
    pageSize: 7
  })
  
  // for UTable
  const columns = [
    { 
      accessorKey: 'item_id',
      header: 'Equipment ID'
    },
    { 
      accessorKey: 'item_name',
      header: 'Item Name'
    },
    { 
      accessorKey: 'category',
      header: 'Category'
    },
    { 
      accessorKey: 'quantity',
      header: 'Quantity'
    },
    { 
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const color = {
          Available: 'success',
          'Not Available': 'error',
        }[row.getValue('status')]
        
        return h(UBadge, { class: 'capitalize', variant: 'subtle', color }, () => 
          row.getValue('status'))
      }
    },
    {
      id: 'actions',
      header: 'Actions'
    }
  ]
</script>