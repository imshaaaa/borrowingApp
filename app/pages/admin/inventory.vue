<template>
  <ion-page>
    <ion-content>
        <div class="min-h-full bg-gray-100 pt-24 px-6 mt-6">
          <LoadingTable v-if="isGettingStocksData" />
          <div v-if="!isGettingStocksData && userStore.user.user_type != 'Admin'" class="flex justify-end">
            <UButton color="secondary" class="mr-2" @click="isQrOpen = true">Scan QR</UButton>
          </div>
          <div v-if="!isGettingStocksData" class="mt-6">
            <div class="flex justify-between mb-4 gap-x-4 gap-y-2 flex-wrap">
              <UInput v-model="globalFilter" placeholder="Search" color="secondary" class="w-full sm:w-auto">
                <template v-if="globalFilter.length" #trailing>
                  <UButton
                    color="neutral"
                    variant="link"
                    size="sm"
                    icon="i-lucide-circle-x"
                    aria-label="Clear input"
                    @click="globalFilter = ''"
                  />
                </template>
              </UInput>
              <div class="flex gap-2">
                <!-- <USelect v-model="Filter" class="w-auto" color="secondary" variant="outline" :items="FilterItems"/> -->
                <USelect v-model="statusFilter" class="w-auto" color="secondary" variant="outline" :items="statusFilterItems"/>
              </div>
            </div>
            <!-- <UTable ref="table" :data="filteredStocksByStatus" :columns="columns" v-model:global-filter="globalFilter" class="flex-1 bg-white rounded-lg" v-model:pagination="pagination" :pagination-options="{ getPaginationRowModel: getPaginationRowModel() }">
              <template #actions-cell="{ row }">
                <div v-if="userStore.user.user_type !== 'Admin'">
                  <UButton variant="soft" color="neutral" @click="openActionsModal(row.original)">
                    <UIcon name="i-lucide-pen"></UIcon>
                  </UButton>
                  <UButton class="ml-2" variant="subtle" color="error" @click="openDeleteModal(row.original)">
                    <UIcon name="i-lucide-trash"></UIcon>
                  </UButton>
                </div>
              </template>
            </UTable> -->
            <UTable ref="table"  v-model:global-filter="globalFilter" :columns="columns" :data="filteredStocksByStatus" class="flex-1 bg-white rounded-lg" v-model:pagination="pagination" :pagination-options="{ getPaginationRowModel: getPaginationRowModel() }"/>
            <div class="flex justify-center border-t border-default pt-4 px-4">
            <UPagination v-if="filteredStocksByStatus?.length >= 10" color="neutral" activeColor="neutral"
              :page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
              :items-per-page="table?.tableApi?.getState().pagination.pageSize"
              :total="table?.tableApi?.getFilteredRowModel().rows.length"
              @update:page="(p) => table?.tableApi?.setPageIndex(p - 1)"
            />
          </div>
            <UModal title="Scan Qr" v-model:open="isQrOpen">
              <template #body>
                <div v-if="!isQrError">
                  <QrcodeStream @error="onQrScanError" @detect="onDetectQr"/>
                </div>
                <div v-if="isQrError">
                  <p>QR scanner erorr: {{ isQrErrorMsg }}</p>
                </div>
              </template>
            </UModal>
            <UModal title="Update Equipment Unit" v-model:open="isUpdateEquipmentOpen" :dismissible="false" :ui="{ footer: 'justify-end' }">
                <template #body>
                    <UForm id="update-form" :schema="schema" :state="state" @submit="updateUnit">
                        <UFormField label="Unit ID" name="unitID" >
                            <UInput v-model="state.selectedUnitId" color="secondary" variant="subtle" size="xl" class="w-full" disabled/>
                        </UFormField>
                        <UFormField label="Equipment Name" name="equipmentName"  class="mt-4">
                            <UInput v-model="state.selectedItemName" color="secondary" variant="subtle" size="xl" class="w-full" disabled/>
                        </UFormField>
                        <UFormField label="Serial Number" name="serialNum"  class="mt-4">
                            <UInput v-model="state.selectedSN" color="secondary" variant="subtle" size="xl" class="w-full" disabled/>
                        </UFormField>
                        <UFormField label="Price" name="selectedPrice"  class="mt-4">
                            <UInputNumber v-model="state.selectedPrice" color="neutral" variant="subtle" size="xl" class="w-32" :min="1"/>
                        </UFormField>
                        <UFormField label="Date Added" name="dateAdded"  class="mt-4">
                            <UInput v-model="state.selectedDateAdded" color="secondary" variant="subtle" size="xl" class="w-full" disabled/>
                        </UFormField>
                        <UFormField label="Status" name="selectedStatus"  class="mt-4">
                            <USelect v-model="state.selectedStatus" color="secondary" variant="subtle" size="xl" :items="statusItems" class="w-full" />
                        </UFormField>
                    </UForm>
                </template>
                <template #footer="{ close }">
                    <UButton color="error" variant="soft" @click="close" :disabled="isUpdatingEquipment">Cancel</UButton>
                    <UButton v-if="!isUpdatingEquipment" color="secondary" type="submit" form="update-form">Update Equipment</UButton>
                    <UButton v-else color="secondary" loading>Updating Equipment ...</UButton>
                </template>
            </UModal>
          </div>
        </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
  onIonViewWillEnter(() => {
    isGettingStocksData.value = true
    //getStocks()
    getUnits()
  })
  
  definePageMeta({
    layout: 'admin',
    middleware: 'auth'
  })
  import { object, string, number } from 'yup'
  import { h, resolveComponent } from 'vue'
  import { getPaginationRowModel } from '@tanstack/vue-table'
  import { onIonViewWillEnter, onIonViewWillLeave } from '#imports'
  import { header, select } from '#build/ui'

  const supabase = useSupabaseClient()
  const table = useTemplateRef('table')
  const UBadge = resolveComponent('UBadge')
  const toast = useToast()
  const open = ref(false)
  const userStore = useUserStore()
  const isActionsModalOpen = ref(false)
  const isDeleteModalOpen = ref(false)
  const selectedItem = ref({})
  const isGettingStocksData = ref(false)
  const statusItems = ref(['Available','Not Available'])
  const FilterItems = ['Default','Computer Hardware','Network and Cabling','Repair and Maintenance Tools','Power Equipment','Audio-Visual Devices','Remote Controls']
  const statusFilterItems = ref(['All Status', 'Available', 'Not Available'])
  const globalFilter = ref('')
  const Filter = ref('Default')
  const statusFilter = ref('All Status')
  const allStocks = ref()
  const isMode = ref()
  const isUpdatingEquipment = ref(false)
  const isItemNameError = ref(null)
  const isDeletingItem = ref(false)
  const categoriesItems = ref(['Computer Hardware','Network and Cabling','Repair and Maintenance Tools','Power Equipment','Audio-Visual Devices','Remote Controls'])
  const isQrOpen = ref(false)
  const isQrError = ref()
  const isQrErrorMsg = ref(null)
  const qrScanResult = ref()
  const isUpdateEquipmentOpen = ref(false)

  const schema = object({
    selectedPrice: number().required('price is required'),
    selectedStatus: string().required('status is required')
  })
  
  const state = reactive({
    selectedUnitId: undefined,
    selectedItemName: undefined,
    selectedSN: undefined,
    selectedPrice: undefined,
    selectedDateAdded: undefined,
    selectedStatus: undefined,
    selectedQuantity: undefined,    
  })

//   const getStocks = async () => {
//     let { data: stocks, error: isError } = await supabase.from('tbl_item').select('*').order('status', { ascending: true })

//     if(isError) {
//       toast.add({
//         title: 'Server error',
//         description: 'An error occured while getting data',
//         icon: 'i-lucide-circle-x',
//         color: 'error'
//       })
//       isGettingStocksData.value = false
//       console.log(isError)
//       return
//     }


//     if(stocks) {
//       let fixStatusForQuantity = stocks.filter(item => item.quantity <= 0 && item.status == 'Available').map(item => item.item_id)

//       if(fixStatusForQuantity.length > 0) {
//         let { error: errUpdate } = await supabase.from('tbl_item').update({ status: 'Not Available' }).in('item_id', fixStatusForQuantity)

//         if(errUpdate) {
//           toast.add({
//             title: 'Server error',
//             description: 'An error occured while getting data',
//             icon: 'i-lucide-circle-x',
//             color: 'error'
//           })
//           console.log('errorUpdate?',errUpdate)
//           return
//         }

//         stocks.forEach(d => {
//           if(fixStatusForQuantity.includes(d.item_id)) {
//             d.status = 'Not Available'
//           }
//         })
//         console.log('???')
//       }
//       allStocks.value = stocks
//       isGettingStocksData.value = false
//     }
//   }

  const getUnits = async () => {
    try {
        let { data, error } = await supabase.from('tbl_item_units')
            .select(`
                id,
                serial_number,
                status,
                date_added,
                price,
                model_id,
                tbl_item_models (
                    item_name,
                    quantity
                )
            `)
            .order('status', { ascending: true })

        if(error) throw error
        allStocks.value = data
        isGettingStocksData.value = false
        console.log(allStocks.value)
    } catch(error) {
    toast.add({
        title: 'Server error',
            description: 'An error occured while getting data',
            icon: 'i-lucide-circle-x',
            color: 'error'
        })
        isGettingStocksData.value = false
        console.log(error)
    }
  }

//   const filteredStocks = computed(() => {
//     if(Filter.value == 'Default') {
//       return allStocks.value
//     } else {
//       return allStocks.value.filter(i => i.category == Filter.value)
//     }
//   })

  const filteredStocksByStatus = computed(() => {
    if(statusFilter.value == 'All Status') {
      return allStocks.value
    } else {
      return allStocks.value.filter(i => i.status == statusFilter.value)
    }
  })
  
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

  const onQrScanError = (err) => {
    isQrErrorMsg.value = `[${err.name}]: ${err.message}`
  }

  const onDetectQr = (detectedCodes) => {
    qrScanResult.value = detectedCodes.map((code) => {

      try {
        
        let data = JSON.parse(code.rawValue)

        console.log('raw data', data)

        console.log('dataUID', data.uid)

        if(!data || data.uid == null || isNaN(data.uid)) {
            toast.add({
            title: 'QR error',
            description: 'Invalid QR CODE DATA!',
            icon: 'i-lucide-circle-x',
            color: 'error'
          })
          isQrOpen.value = false
          return
        }

        let isData = allStocks.value.find(d => d.serial_number == data.sn)


        if(!isData) {
            toast.add({
                title: 'Data not found.',
                description: 'The scanned data is not found on database',
                icon: 'i-lucide-circle-x',
                color: 'error'
            })
            isQrOpen.value = false
            return
        }

        state.selectedUnitId = isData.id
        state.selectedItemName = isData.tbl_item_models.item_name
        state.selectedSN = isData.serial_number
        state.selectedPrice = isData.price
        state.selectedDateAdded = isData.date_added
        state.selectedStatus = isData.status
        state.selectedQuantity = isData.tbl_item_models.quantity

        isUpdateEquipmentOpen.value = true
        isQrOpen.value = false

         toast.add({
            title: 'QR scanned successfully.',
            description: 'scanned the qr code data successfully.',
            icon: 'i-lucide-circle-check',
            color: 'success'
        })

        console.log('qr code data', isData)

      } catch(err) {
        toast.add({
          title: 'QR error',
          description: 'Invalid QR CODE DATA!',
          icon: 'i-lucide-circle-x',
          color: 'error'
        })
        isQrOpen.value = false
        console.log('err', err)
      }
    })
  }

  const updateUnit = async () => {
    isUpdatingEquipment.value = true
    try {
        let { error } = await supabase.from('tbl_item_units').update({
                price: state.selectedPrice,
                status: state.selectedStatus
        }).eq('id', state.selectedUnitId).select()

        if(error) throw error

        isUpdateEquipmentOpen.value = false
        isUpdatingEquipment.value = false

        toast.add({
            title: 'Update Success!',
            description: 'Equipment has been successfully updated!',
            icon: 'i-lucide-message-circle-check',
            color: 'success'
        
        })
    } catch(err) {
        toast.add({
            title: 'Server error',
            description: 'An error occured while updating data',
            icon: 'i-lucide-circle-x',
            color: 'error'
        })
        
        isUpdatingEquipment.value = false
        console.log(err)
    }
  }

  const pagination = ref({
    pageIndex: 0,
    pageSize: 10
  })
  
  // for UTable
  const columns = [
    { 
      accessorKey: 'id',
      header: 'Product ID'
    },
    { 
      accessorKey: 'tbl_item_models.item_name',
      header: 'Item Name'
    },
    { 
      accessorKey: 'serial_number',
      header: 'Serial Number'
    },
    { 
      accessorKey: 'price',
      header: 'Price',
      cell: ({ row }) => {
        return `Php ${row.getValue('price')}`
      }
    },
    {
        accessorKey: 'date_added',
        header: 'Date Added'
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
    // {
    //   id: 'actions',
    //   header: 'Actions'
    // }
  ]
</script>