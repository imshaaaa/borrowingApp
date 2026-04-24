<template>
  <ion-page>
    <ion-content>
        <div class="min-h-full bg-gray-100 pt-24 px-6">
          <LoadingTable v-if="isGettingBorrowedData" />
          <div v-if="!isGettingBorrowedData" class="mt-6">
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
            <UTable :data="filterData" ref="table" :columns="columns" v-model:global-filter="globalFilter" class="flex-1 bg-white rounded-lg" v-model:pagination="pagination" :pagination-options="{ getPaginationRowModel: getPaginationRowModel() }" v-model:grouping="grouping" v-model:expanded="expanded" :grouping-options="groupingOptions">
              <template #borrow_id-cell="{ row }">
                <div class="flex gap-2">
                  <template v-if="row.getIsGrouped() && row.subRows.length > 1" >
                    <UButton
                      color="neutral"
                      variant="ghost"
                      size="xs"
                      :icon="row.getIsExpanded() ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'"
                      @click="row.toggleExpanded()"
                    />
                  </template>
                </div>
              </template>
              <template #item_name-cell= "{ row }">
                <span v-if="row.subRows.length > 1">
                 <!--{{ row.subRows.map(d => d.original.item).join(', ') }}-->
                  {{ row.subRows.filter(i => i.original.status == 'Pending' || i.original.status == 'On Going' || i.original.status == 'Overdue' || i.original.status == "Unreturned").map(d => d.original.item).join(',') }}
                </span>
                <span v-else>
                  {{ row.original.item }}
                </span>
              </template>
              
              <template #borrower_id-cell="{ row }">
                {{ row.getIsGrouped() ? row.subRows[0].original.borrower_id : row.original.borrower_id }}
              </template>
              <template #borrower_name-cell="{ row }">
                {{ row.getIsGrouped() ? row.subRows[0].original.borrower_name: row.original.borrower_name }}
              </template>
              <template #room-cell="{ row }">
                {{ row.getIsGrouped() ? row.subRows[0].original.room : row.original.room }}
              </template>
              <template #teacher-cell="{ row }">
                {{ row.getIsGrouped() ? row.subRows[0].original.teacher_name : row.original.teacher_name }}
              </template>
              <template #borrow_date-cell="{ row }">
                {{ row.getIsGrouped() ? row.subRows[0].original.borrow_date : row.original.borrow_date }}
              </template>
              <template #borrow_time-cell="{ row }">
                {{ dayjs(`2026-1-1 ${row.original.borrow_time}`).format('h:mm A') }}
              </template>
              <template #return_date-cell="{ row }">
                {{ row.original.return_date }}
              </template>
              <template #return_time-cell="{ row }">
                {{ dayjs(`2026-1-1 ${row.original.return_time}`).format('h:mm A') }}
              </template>
              <template #status-cell="{ row }">
                <div v-if="row.getIsGrouped()">
                  <UBadge v-if="row.subRows.every(d => d.original.status == 'Pending')" variant="subtle" color="warning">
                    PENDING
                  </UBadge>
                  <UBadge v-else-if="row.subRows.every(d => d.original.status === 'On Going')" variant="subtle" color="secondary">
                    ON GOING
                  </UBadge>
                  <UBadge v-else-if="row.subRows.every(d => d.original.status == 'Overdue')" variant="subtle" color="error">
                    OVERDUE
                  </UBadge>
                  <UBadge v-else-if="row.subRows.every(d => d.original.status == 'Unreturned')" variant="subtle" color="error">
                    UNRETURNED
                  </UBadge>
                  <UBadge v-else-if="row.subRows.some(d => d.original.status == 'Pending' || d.original.status == 'On Going' || d.original.status == 'Overdue' || d.original.status == 'Unreturned')" variant="subtle" color="neutral">
                    MIXED STATUS
                  </UBadge>
                </div>
                <div v-else>
                  <UBadge v-if="row.original.status == 'Pending'" variant="subtle" color="warning">
                    PENDING
                  </UBadge>
                  <UBadge v-else-if="row.original.status === 'On Going'" variant="subtle" color="secondary">
                    ON GOING
                  </UBadge>
                  <UBadge v-else-if="row.original.status === 'Overdue'" variant="subtle" color="error">
                    OVERDUE
                  </UBadge>
                  <UBadge v-else-if="row.original.status === 'Unreturned'" variant="subtle" color="error">
                    UNRETURNED
                  </UBadge>
                </div>
              </template>
              <template v-if="userStore.user.user_type !== 'Admin'" #actions-cell="{ row }">
                <div>
                  <UButton v-if="row.original.status == 'Pending' " variant="soft" color="neutral" @click="openActionsModal(row.original, row)">
                    <UIcon name="i-lucide-pen"></UIcon>
                  </UButton>
                  <span v-else>
                    <UButton v-if="row.original.status == 'On Going' && row.subRows.length == 1 || row.subRows.length == 0" variant="soft" color="neutral" @click="openMarkAsModal(row)">
                      <UIcon name="i-lucide-pen"></UIcon>
                    </UButton>
                    <UButton v-if="row.original.status == 'Overdue'  && row.subRows.length == 1" variant="soft" color="neutral" @click="openMarkAsModal(row)">
                      <UIcon name="i-lucide-pen"></UIcon>
                    </UButton>
                    <UButton v-if="row.original.status == 'Unreturned'  && row.subRows.length == 1" variant="soft" color="neutral" @click="openMarkAsModal(row)">
                      <UIcon name="i-lucide-pen"></UIcon>
                    </UButton>
                  </span>
                  
                </div>
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
            <UModal title="Approve Equipment Request" v-model:open="isActionsModalOpen" :dismissible="false" :ui="{ footer: 'justify-end' }" :close="!isApproving"> 
              <template #body>
                <div class="text-center text-gray-700">
                  Are you sure you want to approve this equipment request?
                </div>
              </template>
              <template #footer>
                <UButton color="error" variant="subtle" @click="openDeclineModal">Decline</UButton>
                  <UButton color="secondary" @click="openApproveModal">Approve</UButton>
              </template>
            </UModal>
            <UModal :dismissible="false" :title="confirmTitle" v-model:open="isConfirmModalOpen" :ui="{ footer: 'justify-end'}" :close="!isApproving && !isDeclining && !isMarkAsReturning">
              <template #body>
                <div class="text-center text-gray-700">
                  <p>{{ confirmMsg }}</p>
                </div>
              </template>
              <template #footer="{ close }">
                <UButton color="error" @click="close" variant="subtle" :disabled="isApproving || isDeclining || isMarkAsReturning">Cancel</UButton>
                <UButton v-if="confirmType == 'decline' && !isDeclining" color="error" @click="declineRequestItem">Decline</UButton>
                <UButton v-if="confirmType == 'decline' && isDeclining" color="error" loading>Declining Request ....</UButton>
                <UButton v-if="confirmType == 'approve' && !isApproving" color="secondary" @click='approveRequestItem'>Approve</UButton>
                <UButton color="secondary" v-if="isApproving && confirmType == 'approve'" loading>Approving Request...</UButton>
                <UButton v-if="confirmType === 'asReturn' && !isMarkAsReturning" color="secondary" @click='returnItem'>Return</UButton>
                <UButton v-if="confirmType === 'asReturn' && isMarkAsReturning" color="secondary" loading>Setting as return ...</UButton>
              </template>
            </UModal>
          </div>
        </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
  onIonViewWillEnter(() => {
    isGettingBorrowedData.value = true
    getBorrowedItems()
  })
  
  import { object, string } from 'yup'
  import { h, resolveComponent } from 'vue'
  import { getPaginationRowModel } from '@tanstack/vue-table'
  import { onIonViewWillEnter, onIonViewWillLeave } from '#imports'
  import dayjs from 'dayjs'
  import { getGroupedRowModel, getCoreRowModel, getExpandedRowModel } from '@tanstack/vue-table'

  definePageMeta({
    layout: 'admin',
    middleware: 'auth'
  })

  const supabase = useSupabaseClient()
  const userStore = useUserStore()
  const table = useTemplateRef('table')
  const UBadge = resolveComponent('UBadge')
  const toast = useToast()
  const open = ref(false)
  const isActionsModalOpen = ref(false)
  const isDeleteModalOpen = ref(false)
  const selectedItem = ref({})
  const statusItems = ref(['Pending','Request Denied','On Going'])
  const statusFilterItems = ref(['All Status', 'Pending', 'On Going', 'Unreturned'])
  const globalFilter = ref('')
  const statusFilter = ref('All Status')
  const borrowedItemsData = ref([])
  const isGettingBorrowedData = ref(false)
  const isApproving = ref(false)
  const confirmTitle = ref('')
  const confirmMsg = ref("")
  const isConfirmModalOpen = ref(false)
  const confirmType = ref(null)
  const isDeclining = ref(false)
  const grouping = ref(['borrow_id'])
  const expanded = ref({})
  const selectedRowData = ref({})
  const isMarkAsReturning = ref(false)

  defineShortcuts({
    o: () => open.value = !open.value
  })
  
  const schema = object({
    itemName: string().required('item name is required'),
    category: string().required('category is required')
  })
  
  const state = reactive({
    itemName: undefined,
    category: undefined,
    quantity: 1
  })

  const getBorrowedItems = async () => {
    try {
      let now = dayjs()
      let { data, error } = await supabase.from('tbl_borrowed_item').select('*').in("status", ['Pending','On Going','Overdue',"Unreturned"]).order('form_id', { ascending: false })

      if(error) throw error
      if(!data) return

      const overdueIds = data.filter(item => {
        let returnDateTime = dayjs(`${item.return_date} ${item.return_time}`)
        return returnDateTime.isBefore(now) && item.status == 'On Going'
      }).map(item => item.form_id)

      const expiredRequest = data.filter(item => {
        let borrowDate = dayjs(item.borrow_date).startOf('day').add(20,'hours')
        if(item.status == 'Pending') {
          return dayjs().isAfter(borrowDate)
        }
      }).map(i => i.form_id)

      if(overdueIds.length > 0) {
        let { error: updateErr } = await supabase.from('tbl_borrowed_item').update({ status: 'Unreturned' }).in('form_id', overdueIds)

        console.log('update here?')
        
        if(updateErr) throw updateErr
      }

      if(expiredRequest.length > 0) {
        let { error: expiredErr } = await supabase.from('tbl_borrowed_item').update({ status: 'Request Expired' }).in('form_id', expiredRequest)

        if(expiredErr) throw expiredErr
      }


      let finalData = await data.filter(i => !expiredRequest.includes(i.form_id)).map(item => {
        if(overdueIds.includes(item.form_id)) {
          return {...item, status: 'Unreturned'}
        }
      
        return item
      })

      console.log('overdue?', overdueIds)
      console.log('data final', finalData)

      borrowedItemsData.value = await finalData
      isGettingBorrowedData.value = false
    } catch(err) {
      toast.add({
        title: 'Server error',
        description: 'An error occured while getting data',
        icon: 'i-lucide-circle-x',
        color: 'error'
      })
      isGettingBorrowedData.value = false
      console.log(err)
    }
    
  }

  const filterData = computed(() => {
    if(statusFilter.value == 'All Status') {
      return borrowedItemsData.value
    } else {
      return borrowedItemsData.value.filter(i => i.status == statusFilter.value)
    }
  })

  const approveRequestItem = async() => {
    isApproving.value = true

    let itemNames = selectedRowData.value.item.map(d => d.name)

    console.log('item',itemNames)

    let { data: itemsData, error: isError } = await supabase.from('tbl_item_models').select('quantity,item_name').in('item_name', itemNames)

    if(isError) {
      toast.add({
        title: 'Server error',
        description: 'An error occured while updating data!',
        icon: 'i-lucide-circle-x',
        color: 'error'
      })
      console.log(isError)
      return
    }
    
    console.log(itemsData)

    let errors = []
    let itemsToUpdate = []

    let filterData = await selectedRowData.value.item.forEach(item => {
      let stockItem = itemsData.find(d => d.item_name == item.name)

      if(!stockItem) {
          errors.push('No item found')
          toast.add({
            title: 'Request error',
            description: 'Cant find the requested item from Database! ',
            icon: 'i-lucide-circle-x',
            color: 'error'
          })
          isConfirmModalOpen.value = false
          isApproving.value = false
          isActionsModalOpen.value = false
      }

       if(stockItem.quantity < item.quantity) {
         errors.push('No stocks remaining')
          toast.add({
            title: 'Data error',
            description: `Only ${stockItem.quantity} remaining for ${item.quantity} pcs of ${item.name} request`,
            icon: 'i-lucide-circle-x',
            color: 'error'
          })
       } else {
        itemsToUpdate.push({
          item_name: item.name,
          quantity: stockItem.quantity - item.quantity
        })
       }
      console.log('here??',stockItem)
    })

    if(errors.length > 0) {
      isConfirmModalOpen.value = false
      isApproving.value = false
      isActionsModalOpen.value = false
      return
    }

    let idsToUpdate = await selectedRowData.value.form_ids
    
     let { error } = await supabase.from('tbl_borrowed_item').update({ status: 'On Going' }).in('form_id', idsToUpdate)

    if(error) {
      toast.add({
        title: 'Server error',
        description: 'An error occured while updating data',
        icon: 'i-lucide-circle-x',
        color: 'error'
      })
    return
    }

    try {
      let updateItems = itemsToUpdate.map(d => {
        return supabase.from('tbl_item').update({ quantity: d.quantity }).eq('item_name', d.item_name)
      })

      let results = await Promise.all(updateItems)
      let hasErrors = results.some(res => res.error)

      if(hasErrors) throw hasErrors
      
    } catch(err) {
      toast.add({
        title: 'Server error',
        description: 'An error occured while updating data',
        icon: 'i-lucide-circle-x',
        color: 'error'
      })
      console.log(err)
    }

    borrowedItemsData.value = borrowedItemsData.value.map(item => {
      if(idsToUpdate.includes(item.form_id)) {
        return { ...item, status: 'On Going'}
      }
      return item
    })

    toast.add({
        title: 'Request Approved!',
        description: 'Borrow request approve successfully',
        icon: 'i-lucide-circle-check',
        color: 'success'
      })

    isConfirmModalOpen.value = false
    isApproving.value = false
    isActionsModalOpen.value = false
  }

  const declineRequestItem = async () => {
    isDeclining.value = true

    let targetIds = selectedRowData.value.form_ids
    
    let { error } = await supabase.from('tbl_borrowed_item').update({ status: 'Request Denied' }).in('form_id', targetIds)

    if(error) {
      toast.add({
        title: 'Server error',
        description: 'An error occured while updating data',
        icon: 'i-lucide-circle-x',
        color: 'error'
      })
    return
    }

    borrowedItemsData.value = borrowedItemsData.value.filter(d => !targetIds.includes(d.form_id))
    

    toast.add({
        title: 'Request Denied!',
        description: 'The Borrow request has been decline',
        icon: 'i-lucide-circle-check',
        color: 'warning'
      })

    isConfirmModalOpen.value = false
    isDeclining.value = false
    isActionsModalOpen.value = false
  }
  
  const openActionsModal = (item, row) => {
    selectedItem.value = {...item}
    isActionsModalOpen.value = true

    if(row.getIsGrouped() && row.subRows.length > 1) {
      selectedRowData.value = {
        isGroup: true,
        form_ids: row.subRows.map(d => d.original.form_id),
        item: row.subRows.map(d => ({ 
          name: d.original.item,
          quantity: d.original.quantity
        }))
      }
    } else {
      selectedRowData.value = {
        isGroup: false,
        form_ids: [row.original.form_id],
        item: [
          {
            name: row.original.item,
            quantity: row.original.quantity
          }
        ]
      }
    }
    
    console.log('datarow',row)
  }

  const openApproveModal = () => {
    confirmType.value = 'approve'
    isConfirmModalOpen.value = true
    confirmTitle.value = 'Approve Request'
    confirmMsg.value = 'Are you sure you want  to approve borrow request?'
    
  }

  const openDeclineModal = () => {
    confirmType.value = 'decline'
    isConfirmModalOpen.value = true
  confirmTitle.value = 'Decline Request'
    confirmMsg.value = 'Are you sure you want  to decline borrow request?'
  }

  const openMarkAsModal = (row) => {
    if(row.getIsGrouped() && row.subRows.length > 1) {
      selectedRowData.value = {
        isGroup: true,
        form_ids: row.subRows.map(d => d.original.form_id)
      }
    } else {
      selectedRowData.value = {
        isGroup: false,
        form_ids: [row.original.form_id]
      }
    }
    confirmType.value = 'asReturn'
    confirmTitle.value = "Mark as"
    if(row.subRows.length > 1) {
      confirmMsg.value = 'Mark this all item as returned?'
    } else {
      confirmMsg.value = 'Mark this item as returned?'
    }
    isConfirmModalOpen.value = true
  }

  const returnItem = async() => {
    isMarkAsReturning.value = true
    let targetIds = selectedRowData.value.form_ids
    let itemsToReturn = borrowedItemsData.value.filter(i => targetIds.includes(i.form_id)).map(i => ({ item_name: i.item, quantity: i.quantity }))

    let { data: stocks, error: stockErr } = await supabase.from('tbl_item_models').select('quantity').eq('item_name', itemsToReturn[0].item_name)

    if(stockErr) {
      toast.add({
        title: 'Server error',
        description: 'An error occured while updating data',
        icon: 'i-lucide-circle-x',
        color: 'error'
      })
      console.log(stockErr)
      isConfirmModalOpen.value = false
      isMarkAsReturning.value = false
      return
    }

      let stockQuantity = stocks[0].quantity
      let newQuantity = stockQuantity + parseInt(itemsToReturn[0].quantity)
      let currentReturnTime = dayjs().format('HH:mm')

    console.log('items to return', itemsToReturn)
    console.log('stock quantity', stockQuantity)
    console.log('new quantity', newQuantity)

     let { error: setError } = await supabase.from('tbl_borrowed_item').update({ status: 'Returned', return_time: currentReturnTime }).in('form_id', targetIds)

    if(setError) {
      toast.add({
        title: 'Server error',
        description: 'An error occured while updating data',
        icon: 'i-lucide-circle-x',
        color: 'error'
      })
    return
    }

    // let { error: setQuantityError } = await supabase.from('tbl_item').update({ quantity: newQuantity, status: 'Available' }).eq('item_name', itemsToReturn[0].item_name)

    // if(setQuantityError) {
    //   toast.add({
    //     title: 'Server error',
    //     description: 'An error occured while updating data',
    //     icon: 'i-lucide-circle-x',
    //     color: 'error'
    //   })
    //   console.log(setQuantityError)
    //   isConfirmModalOpen.value = false
    //   isMarkAsReturning.value = false
    //   return
    // }

    // borrowedItemsData.value = borrowedItemsData.value.filter(d => !targetIds.includes(d.form_id))
    

    toast.add({
        title: 'Item Returned!',
        description: 'The selected items has been returned!',
        icon: 'i-lucide-circle-check',
        color: 'success'
      })

    isConfirmModalOpen.value = false
    isMarkAsReturning.value = false
  }

  const pagination = ref({
    pageIndex: 0,
    pageSize: 7
  })
  
  //for UTable
  const columns = [
    {
      id: 'borrow_id',
      accessorKey: 'borrow_id',
      header: ''
    },
    { 
      id: 'item_name',
      accessorKey: 'item',
      header: 'Equipment Name(s)'
    },
    { 
      id: 'borrower_name',
      accessorKey: 'borrower_name',
      header: 'Borrower(s) Name'
    },
    { 
      id: 'borrower_id',
      accessorKey: 'borrower_id',
      header: 'Borrower ID'
    },
    { 
      id: 'room',
      accessorKey: 'room',
      header: 'Room/Laboratory Assigned'
    },
    { 
      id: 'teacher',
      accessorKey: 'teacher',
      header: "Teacher's Name",
      cell: ({ row }) => {
        let name = row.getValue('teacher')
        if(!name) return 'N/A'
        return name
      }
    },
    { 
      accessorKey: 'quantity',
      header: 'Borrowed Quantity'
    },
    { 
      id: 'borrow_date',
      accessorKey: 'borrow_date',
      header: 'Borrow Date'
    },
    {
      id: 'borrow_time',
      accessorKey: 'borrow_time',
      header: 'Borrow Time',
      cell: ({ row }) => {
        let borrowTime = row.getValue('borrow_time')
        return dayjs(`2026-1-1 ${borrowTime}`).format('h:mm A')
      }
    },
    { 
      id: 'return_date',
      accessorKey: 'return_date',
      header: 'Return Date'
    },
    { 
      id: 'return_time',
      accessorKey: 'return_time',
      header: 'Expected Return Time',
      cell: ({ row }) => {
        const time = row.getValue('return_time')
        return dayjs(`2026-1-1 ${time}`).format('h:mm A')
      }
    },
    { 
      id: 'status',
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const color = {
          Pending: 'warning',
          'On Going': 'secondary',
          Overdue: 'error',
          Unreturned: 'error'
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

  const groupingOptions = {
    getGroupedRowModel: getGroupedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    groupedColumnMode: 'reorder'
  }

      </script>