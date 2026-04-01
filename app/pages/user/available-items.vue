<template>
  <IonPage>
    <IonContent>
      <NuxtLayout>
        <div>
          <LoadingTable v-if="isGettingAvailableData"/>
          <div v-if='!isGettingAvailableData' class="mt-6">
            <UInput v-model="globalFilter" class="mb-2" placeholder="Search for an item..." color="secondary" />
            <UTable ref="table" :data="availableItemsData" :columns="columns" v-model:global-filter="globalFilter" class="flex-1 bg-white rounded-lg" v-model:pagination="pagination" :pagination-options="{ getPaginationRowModel: getPaginationRowModel() }">
              <template #actions-cell="{ row }">
                <UButton color="secondary" variant="subtle" class="mr-2" @click="openBorrowModal(row.original,'reserve')">Reserve</UButton>
                <UButton color="secondary" @click="openBorrowModal(row.original,'borrow')">
                  Borrow
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
            <UModal title="Borrow Equipment" v-model:open="isBorrowModalOpen" :dismissible="false" :close="!isSubmittingForm">
              <template #body="{ close }">
                <UForm :schema="schema" :state="state" @submit="submitRequest">
                  <UFormField label="Borower Name" class="mt-4" name="borrowerName">
                    <UInput color="secondary" variant="subtle" size="xl" class="w-full" placeholder="Borrower name" v-model="state.borrowerName" disabled/>
                  </UFormField>
                  <UFormField label="Borrower ID" class="mt-4" name="borrowerID">
                    <UInput color="secondary" variant="subtle" size="xl" class="w-full" placeholder="Item name" v-model="state.borrowerID" disabled/>
                  </UFormField>
                  <UFormField class="mt-4" name="itemName" :ui="{ 
  root: 'w-full',
  labelWrapper: 'flex items-center justify-between w-full',
  label: 'w-full'
}">
                    <template #label>
                      <div class="flex justify-between items-center">
                        <span class="font-medium flex-1 text-left">Equipment to Borrow</span>
                        <UButton color="secondary" @click="addMoreModal" size="sm" variant="subtle" :disabled="selectedId.length >= 3">
                          Add More
                        </UButton>
                      </div>
                    </template>
                    <div class="flex items-center gap-2" v-for="(item, index) in selectedItemName" :key='item.item_id'>
                      
                    <UInput color="secondary" variant="subtle" size="xl" class="w-full mt-2" placeholder="Item name" v-model="selectedItemName[index].item_name" disabled>
                      <template #trailing>
                        <div class="flex items-center gap-x-2">
                          <UButton variant="link" icon="i-lucide-plus" color="neutral" @click="addMoreQuantity(index)" />
                          <span class="text-gray-700">
                            {{ item.quantity }}
                          </span>
                          <UButton variant="link" icon="i-lucide-minus" color="neutral" @click="deductQuantity(index)" :disabled="item.quantity <= 1"/>
                        </div>
                      </template>
                    </UInput>
                    <UButton v-if="selectedItemName.length > 1" variant="link" icon="i-lucide-trash" color="error" @click="removeFromList(index,item.item_id)"></UButton>
                    </div>
                  </UFormField>
                  <UFormField label="Teachers Name" class="mt-4" name="teachersName" hint="(optional)">
                    <UInput color="secondary" variant="subtle" size="xl" class="w-full" placeholder="" v-model="state.teachersName" />
                  </UFormField>
                  <UFormField label="Room" class="mt-4" name="room">
                    <UInputMenu color="secondary" variant="subtle" size="xl" class="w-full" placeholder="room" v-model="state.room" :items="rooms"/>
                  </UFormField>
                  <!--<UFormField label="Equipments Quantity" class="mt-4" name="quantity">
                      <UInput type="number" variant="subtle" color="secondary" class="" v-model.number="state.quantity" disabled/>
                  </UFormField>-->
                  <UFormField label="Borrow Date" class="mt-4" name="borrowDate" :error="borrowDateError">
                    <UInput type="date" v-if="isReserve" variant="subtle" color="secondary" v-model="state.borrowDate" :min="todayDate" :max="maxDate" @change="checkIfSunday"/>
                    <UInput type="date" v-else variant="subtle" v-model="state.borrowDate" disabled />
                  </UFormField>
                  <UFormField label="Borrow Time" class="mt-4" name="borrowTime" :error="borrowTimeError">
                    <UInput variant="subtle" color="secondary" type="time" v-model="state.borrowTime"/>
                  </UFormField>
                  <UFormField label="Return Date" class="mt-4" name="returnDate">
                    <UInput type="date" variant="subtle" v-model="state.returnDate" disabled />
                  </UFormField>
                  <UFormField label="Return Time" class="mt-4" name="returnTime" >
                    <UInput variant="subtle" color="secondary" type="time" v-model="state.returnTime" disabled/>
                  </UFormField>
                  <div class="flex justify-end gap-x-2 mt-6 mb-2">
                      <UButton color="error" variant="outline" @click="handleModalClose(close)" :disabled="isSubmittingForm" size="lg">Cancel</UButton>
                      <UButton v-if="!isSubmittingForm" type="submit"  color="secondary" size="lg">Submit Request</UButton>
                      <UButton v-if="isSubmittingForm" type="submit"  color="secondary" loading size="lg">Submitting Request ...</UButton>
                  </div>
                </UForm>
              </template>
            </UModal>
            <UModal title="Add More Equipment" :dismissible="false" v-model:open="addMoreModalOpen">
              <template #body="{ close }">
                <div class="">
                  <UInput v-model="searchItem" class="mb-2 bg-gray-100" placeholder="Search for an item..." color="secondary" variant="subtle"/>
                  <UTable v-model:global-filter="searchItem" :data="filteredData" :columns="selectColumns" class="flex-1 bg-gray-50 rounded-lg">
                    <template  #action-cell="{ row }">
                      <UButton @click="addItem(row.original)" color="secondary">Add Item</UButton>
                    </template>
                  </UTable>
                </div>
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
    isGettingAvailableData.value = true
    getAvailableItems()
  })

  
  import { object, string, number,date } from 'yup'
  import { h, resolveComponent } from 'vue'
  import { getPaginationRowModel } from '@tanstack/vue-table'
  import { today, getLocalTimeZone, Time } from '@internationalized/date'
  import { onIonViewWillEnter, onIonViewWillLeave } from '#imports'
  import dayjs from 'dayjs'
  
  definePageMeta({
    layout: 'user'
  })

  const table = useTemplateRef('table')
  const UBadge = resolveComponent('UBadge')
  const toast = useToast()
  const supabase = useSupabaseClient()
  const userStore = useUserStore()
  const open = ref(false)
  const isBorrowModalOpen = ref(false)
  const statusItems = ref(['Available','Not-Available'])
  const globalFilter = ref('')
  const isReserve = ref(undefined)
  const isGettingAvailableData = ref(false)
  const availableItemsData = ref([])
  const addMoreModalOpen = ref(false)
  const searchItem = ref('')
  const selectedItemName = ref([])
  const selectedId = ref([])
  const filteredData = ref([])
  const rooms = ref(["101","102", "103", "104", "105", "106", "107", "110", "111","201", "202", "203", "204", "205", "206", "207","208", "209", "210", "301", "Slab 1", "Slab 2", "Slab 3", "Slab 4", "Slab 5", "NLAB", "Linux"]);
  const borrowTimeError = ref(null)
  const form = useTemplateRef('form')
  const isSubmittingForm = ref(false)
  const todayDate = dayjs().add(1,'day').format('YYYY-MM-DD')
  const maxDate = dayjs().add(3, 'days').format('YYYY-MM-DD')
  const borrowDateError = ref(null)
  
  const schema = object({
    borrowerName: string().required('name is required'),
    borrowerID: string().required('id is required'),
    itemName: string().required('item name is required'),
    room: string().required('room is required'),
    quantity: number().required('quantity is required'),
    borrowDate: date().required('borrow date is required'),
    borrowTime: string().required('borrow time is required'),
    returnDate: date().required('return date is required'),
    //returnTime: string().required('set borrow time first')
  })
  
  const state = reactive({
    borrowerName: undefined,
    borrowerID: undefined,
    itemName: undefined,
    teachersName: undefined,
    room: undefined,
    quantity: 0,
    borrowDate: undefined,
    borrowTime: '',
    returnDate: undefined,
    returnTime: undefined
  })

  const getAvailableItems = async () => {
    let { data: items, error: isError } = await supabase.from('tbl_item').select('*').eq('status', 'Available').gt('quantity', 0)

    if(isError) {
      toast.add({
        title: 'Server error',
        description: 'An error occured while getting data',
        icon: 'i-lucide-circle-x',
        color: 'error'
      })
      isGettingAvailableData.value = false
      console.log(isError)
      return
    }

    if(items) {
      availableItemsData.value = items
      isGettingAvailableData.value = false
    }
  }
  
  const addNewStock = () => {
    console.log('new stock')
  }
  
  const openBorrowModal = (item,type) => {
    state.borrowerName = `${userStore.user.firstname} ${userStore.user.middlename} ${userStore.user.lastname}`
    state.borrowerID = userStore.user.id
    state.quantity = selectedItemName.value.length
    state.itemName = item.item_name
    selectedItemName.value.push({
      item_id: item.item_id,
      item_name: item.item_name,
      quantity: 1
    })

    selectedId.value.push(item.item_id)
    
    if(type == 'borrow') {
      isReserve.value = false
      state.borrowDate = dayjs().format('YYYY-MM-DD')
      state.returnDate = dayjs().format('YYYY-MM-DD')
    }
    if(type == 'reserve') {
     isReserve.value = true
      state.borrowDate = undefined
      state.returnDate = undefined
    }

    isBorrowModalOpen.value = true
      console.log('here?',selectedItemName.value.length)
    console.log('itemID',selectedItemName.value)
  }

  const addMoreModal = () => {
    filteredData.value = availableItemsData.value.filter(i => !selectedId.value.includes(i.item_id))
    console.log(filteredData.value)
    addMoreModalOpen.value = true
  }

  const addItem = (item) => {
    selectedItemName.value.push({
      item_id: item.item_id,
      item_name: item.item_name,
      quantity: 1
    })
    selectedId.value.push(item.item_id)
    console.log(selectedId.value)
    addMoreModalOpen.value = false
  }

  const addMoreQuantity = (dataIndex) => {
    if(dataIndex !== -1) {
      selectedItemName.value[dataIndex].quantity += 1
    }
    console.log(selectedItemName.value)
  }

  const deductQuantity = (dataIndex) => {
    if(dataIndex !== -1) {
      selectedItemName.value[dataIndex].quantity -= 1
    }
  }

  const handleModalClose = (close) => {
    selectedItemName.value = []
    selectedId.value = []
    state.room = null
    state.borrowDate = null
    state.borrowTime = null
    state.returnDate = null
    state.returnTime = null
    close()
    console.log('close?')
  }

  const removeFromList = (index, itemID) => {
    console.log('remove',index,itemID)
    selectedItemName.value.splice(index, 1)
    selectedId.value.splice(index, 1)
    filteredData.value = availableItemsData.value.filter(i => !selectedId.value.includes(itemID))
    //console.log('here remove?', itemId)
  }

  const submitRequest = async() => {
    isSubmittingForm.value = true
    let finalItemsSelected = selectedItemName.value.map(i => i.item_name).join(',')
    let borrowId = Date.now()

    let insertItems = selectedItemName.value.map(item => {
      return {
        borrow_id: borrowId,
        borrower_id: state.borrowerID,
        borrower_type: userStore.user.user_type,
        borrower_name: state.borrowerName,
        room: state.room,
        teacher_name: state.teachersName || 'N/A',
        item: item.item_name,
        quantity: item.quantity,
        borrow_date: state.borrowDate,
        borrow_time: state.borrowTime,
        return_date: state.returnDate,
        return_time: state.returnTime,
        status: 'Pending',
      }
    })
    
    try {
      let { data, error } = await supabase.from('tbl_borrowed_item').insert(insertItems).select()

      if(error) throw error

      let { error: isNotifErr } = await supabase.from('tbl_notifications').insert([
        {
          title: 'Borrow Request',
          message: `${userStore.user.firstname} ${userStore.user.middlename} ${userStore.user.lastname} borrow request`
        }
      ]).select()

      if(isNotifErr) throw error

      toast.add({
        title: 'Request Success!',
        description: 'Request has been successfully sent. Please wait for admin approval',
        icon: 'i-lucide-message-circle-check',
        color: 'secondary'
      
      })
      
      isBorrowModalOpen.value = false
      isSubmittingForm.value = false
      
      
    } catch(err) {
      toast.add({
        title: 'Server error',
        description: 'An error occured while updating data',
        icon: 'i-lucide-circle-x',
        color: 'error'
      })
      isSubmittingForm.value = false
    }
  
  }

  const checkIfSunday = (event) => {
    borrowDateError.value = null
    let selected = dayjs(event.target.value)

    if (selected.day() === 0) {
      borrowDateError.value = "Can't reserve during sundays"
      state.borrowDate = undefined
      state.returnDate = undefined
      return
    }

    state.returnDate = state.borrowDate
  }

  const pagination = ref({
    pageIndex: 0,
    pageSize: 7
  })
  
  // for UTable
  const columns = [
    { 
      accessorKey: 'item_name',
      header: 'Equipment Name'
    },
    { 
      accessorKey: 'category',
      header: 'Category'
    },
    { 
      accessorKey: 'quantity',
      header: 'In Stock'
    },
    {
      id: 'actions',
      header: 'Actions'
    }
  ]

  const selectColumns = [
    {
      accessorKey: 'item_name',
      header: 'Equipment Name'
    },
    {
      accessorKey: 'category',
      header: 'Category'
    },
    {
      accessorKey: 'action',
      header: ''
    }
  ]

  watch(isBorrowModalOpen, (newValue) => {
    if(newValue == false) {
      selectedItemName.value = []
      selectedId.value = []
      state.room = null
      state.borrowDate = null
      state.borrowTime = null
      state.returnDate = null
      state.returnTime = null
      console.log('close2?')
    }
    borrowDateError.value = null
  })

  watch(() => state.borrowTime , (newTime) => {
    
    if(!newTime) return

    if(newTime < '07:00') {
      borrowTimeError.value = 'borrow time starts at 07:00AM'
      state.borrowTime = ''
      state.returnTime = ''
      console.log(newTime)
      return
    } else {
      borrowTimeError.value = null
    }
    if(newTime > '18:00') {
      state.borrowTime = ''
      state.returnTime = ''
      borrowTimeError.value = 'last borrow time ends on 6:00PM'
      return
    } else {
      borrowTimeError.value = null
    }

    let [hours, minutes] = newTime.split(':')
    let returnTimeObj = dayjs().hour(parseInt(hours)).minute(parseInt(minutes)).add(2,'hour').add(30,'minute')

    state.returnTime = returnTimeObj.format('HH:mm')
  })

  watch(() => state.borrowDate, (newDate) => {
    if(!newDate) return

    //if(newDate)
  })

  watch(() => selectedItemName.value.length, (newValue) => {
    state.quantity = newValue
  }, { immidiate: true })
</script>