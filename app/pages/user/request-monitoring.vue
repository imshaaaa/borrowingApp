<template>
  <ion-page>
    <ion-content>
        <div class="min-h-screen bg-gray-100 pt-24 px-6">
          <LoadingTable v-if="isGettingBorrowedItems" />
          <div v-else class="mt-6">
            <div class="flex justify-between mb-2 gap-4">
              <UInput v-model="globalFilter" placeholder="Search" color="secondary">
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
              <USelect v-model="statusFilter" class="w-auto" color="secondary" variant="outline" :items="statusFilterItems"/>
            </div>
            <UTable ref="table" :data="filteredBorrowedItems" :columns="columns" v-model:global-filter="globalFilter" class="flex-1 bg-white rounded-lg" v-model:pagination="pagination" :pagination-options="{ getPaginationRowModel: getPaginationRowModel() }">
              <template #actions-cell="{ row }">
                <UButton color="secondary" @click="viewDetails(row.original)">View Details</UButton>
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
            <UModal title="Borrow Details" v-model:open="isViewDetailsOpen" :dismissible="!isUpdate" :ui="{ footer: 'justify-end' }">
              <template #body="{ close }">
                <UForm>
                  <UFormField label="Equipment Name" class="mt-4">
                    <UInput color="secondary" variant="subtle" size="xl" class="w-full" placeholder="Item name" v-model="selectedItem.item"  disabled/>
                  </UFormField>
                  <UFormField label="Teachers Name" class="mt-4">
                    <UInput color="secondary" variant="subtle" size="xl" class="w-full" placeholder="Item name" v-model="selectedItem.teacher_name" disabled/>
                  </UFormField>
                  <UFormField label="Borrow Quantity" class="mt-4">
                      <UInput type='number' variant="subtle" color="secondary" v-model="selectedItem.quantity" class="w-40" disabled/>
                  </UFormField>
                  <UFormField label="Room" class="mt-4" name="room">
                    <UInputMenu color="secondary" variant="subtle" size="xl" class="w-40" placeholder="room" v-model="selectedItem.room" :items="rooms" :disabled="selectedItem.status == 'Returned' || selectedItem.status == 'Request Denied' || selectedItem.status == 'Request Expired' ? true : false"/>
                  </UFormField>
                  <UFormField label="Status" class="mt-4">
                    <UInput color="secondary" variant="subtle" size="xl" class="w-40" placeholder="status" v-model="selectedItem.status" disabled/>
                  </UFormField>
                  <UFormField label="Borrow Date" class="mt-4">
                    <UInput type="date" variant="subtle" size="xl" v-model="selectedItem.borrow_date" disabled/>
                  </UFormField>
                  <UFormField label="Borrow Time" class="mt-4">
                    <UInput type="time" variant="subtle" size="xl" v-model="selectedItem.borrow_time" disabled/>
                  </UFormField>
                  <UFormField label="Return Date" class="mt-4">
                    <UInput type="date" variant="subtle" size="xl" v-model="selectedItem.return_date" disabled/>
                  </UFormField>
                  <UFormField label="Return Time" class="mt-4">
                    <UInput type="time" variant="subtle" size="xl" v-model="selectedItem.return_time" disabled/>
                  </UFormField>
                </UForm>
              </template>
              <template #footer="{ close }">
                <UButton color="error" variant="outline" @click="close" size="lg" :disabled="isUpdate">Close</UButton>
                <span v-if="!isUpdate">  
                  <UButton v-if="selectedItem.status != 'Request Denied' && selectedItem.status != 'Request Expired'  && selectedItem.status != 'Returned'" type="submit"  color="secondary" size="lg" :disabled="isDisabled" @click="updateItem">Update Changes</UButton>
                </span>
                <UButton v-if="isUpdate" size="lg" color="secondary" loading>Updating Changes ...</UButton>
              </template>
            </UModal>
          </div>
        </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
  import { object, string } from 'yup'
  import { h, resolveComponent } from 'vue'
  import { getPaginationRowModel } from '@tanstack/vue-table'
  import { today, getLocalTimeZone, Time } from '@internationalized/date'
  import { onIonViewWillEnter, onIonViewWillLeave } from '#imports'
  
  definePageMeta({
    layout: 'user',
    middleware: 'auth'
  })

  onIonViewWillEnter(() => {
    getBorrowedItems()
  })

  const toast = useToast()
  const supabase = useSupabaseClient()
  const userStore = useUserStore()
  const table = useTemplateRef('table')
  const UBadge = resolveComponent('UBadge')
  const categoryItems = ref(['Cables','Network Tools','Power Equipment', 'Remote'])
  const open = ref(false)
  const isViewDetailsOpen = ref(false)
  const selectedItem = ref({})
  const statusItems = ref(['Available','Not-Available'])
  const globalFilter = ref('')
  const statusFilterItems = ref(['All Status', 'Pending', 'On Going', 'Overdue', 'Returned', 'Request Denied', 'Request Expired'])
  const statusFilter = ref('All Status')
  const currentDate = ref(today(getLocalTimeZone()))
  const borrowTime = ref('07:00')
  const returnDate = ref(today(getLocalTimeZone()))
  const returnTime = ref('07:00')
  const isReserve = ref(undefined)
  const borrowedItems = ref([])
  const isGettingBorrowedItems = ref(false)
  const rooms = ref(["101","102", "103", "104", "105", "106", "107", "110", "111","201", "202", "203", "204", "205", "206", "207","208", "209", "210", "301", "Slab 1", "Slab 2", "Slab 3", "Slab 4", "Slab 5", "NLAB", "Linux"]);
  const isDisabled = ref(false)
  const isUpdate = ref(false)
  const currentRoom = ref()

  const getBorrowedItems = async () => {
    isGettingBorrowedItems.value = true
    try {
      let { data, error } = await supabase.from('tbl_borrowed_item').select('*').eq('borrower_id', userStore.user.id).order('borrow_date', { ascending: false }).order('borrow_time', { ascending: false })

      if(error) throw error

      if(data) {
        borrowedItems.value = data.map(item => ({
          ...item, status: item.status == 'Return' ? 'Returned' : item.status
        }))
        isGettingBorrowedItems.value = false
        console.log(borrowedItems.value)
      }
    } catch(err) {
      toast.add({
        title: 'Server error',
        description: 'An error occured while getting data',
        icon: 'i-lucide-circle-x',
        color: 'error'
      })
      console.log(err)
    }
  }

  const filteredBorrowedItems = computed(() => {
    if(statusFilter.value == 'All Status') {
      return borrowedItems.value
    } else {
      return borrowedItems.value.filter(i => i.status == statusFilter.value)
    }
  })
  
  const viewDetails = (item) => {
    selectedItem.value = {...item}
    currentRoom.value = item.room
    isViewDetailsOpen.value = true
    console.log('current',currentRoom.value)
    console.log('current',item)
  }

  const updateItem = async () => {
    isUpdate.value = true
    try {
      let { error } = await supabase.from('tbl_borrowed_item').update({ room: selectedItem.value.room }).eq('form_id', selectedItem.value.form_id)

      if(error) throw error

      borrowedItems.value = await borrowedItems.value.map(item => {
        if(item.form_id == selectedItem.value.form_id) {
          return {...item, room: selectedItem.value.room}
        }
        return item
      })

      toast.add({
        title: 'Update Success!',
        description: 'Room change has been saved!',
        icon: 'i-lucide-circle-check',
        color: 'success'
      })
      isUpdate.value = false
      isViewDetailsOpen.value = false
      
    } catch(err) {
      toast.add({
        title: 'Server error',
        description: 'An error occured while updating data',
        icon: 'i-lucide-circle-x',
        color: 'error'
      })
      console.log(err)
      isUpdate.value = false
      isViewDetailsOpen.value = false
    }
  }
  const pagination = ref({
    pageIndex: 0,
    pageSize: 7
  })
  
  // for UTable
  const columns = [
    { 
      accessorKey: 'item',
      header: 'Equipment Name(s)'
    },
    { 
      accessorKey: 'quantity',
      header: 'Borrowed Quantity'
    },
    { 
      id: 'status',
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const color = {
          Pending: 'warning',
          'Request Denied': 'error',
          'On Going': 'secondary',
          Overdue: 'error',
          Unreturned: 'error',
          Returned: 'success',
          'Request Expired': 'neutral'
        }[row.getValue('status')]
        
        return h(UBadge, { class: 'capitalize uppercase', variant: 'subtle', color }, () => 
          row.getValue('status'))
      }
    },
    {
      id: 'actions',
      header: 'Actions'
    }
  ]

  watch(() => selectedItem.value.room, (newValue) => {
    if(currentRoom.value == newValue) {
      isDisabled.value = true
    } else {
      isDisabled.value = false
    }

    console.log('set',newValue)
  })
</script>