<template>
  <ion-page>
    <ion-content>
        <div class="min-h-full bg-gray-100 pt-24 px-6">
          <LoadingTable v-if="isGettingHistoryData" />
          <div v-if="!isGettingHistoryData" class="mt-6">
            <div class="flex justify-between mb-2 gap-x-4">
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
            <UTable ref="table" :data="filterData" :columns="columns" v-model:global-filter="globalFilter" class="flex-1 bg-white rounded-lg" v-model:pagination="pagination" :pagination-options="{ getPaginationRowModel: getPaginationRowModel() }">
            </UTable>
            <div class="flex justify-center border-t border-default pt-4 px-4">
            <UPagination color="neutral" activeColor="neutral"
              :page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
              :items-per-page="table?.tableApi?.getState().pagination.pageSize"
              :total="table?.tableApi?.getFilteredRowModel().rows.length"
              @update:page="(p) => table?.tableApi?.setPageIndex(p - 1)"
            />
          </div>
          </div>
        </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
  import { object, string } from 'yup'
  import { h, resolveComponent } from 'vue'
  import { getPaginationRowModel } from '@tanstack/vue-table'
  import { onIonViewWillEnter, onIonViewWillLeave } from '#imports'
  import dayjs from 'dayjs'
  
  definePageMeta({
    layout: 'admin',
    middleware: 'auth'
  })

  const supabase = useSupabaseClient()
  const table = useTemplateRef('table')
  const UBadge = resolveComponent('UBadge')
  const toast = useToast()
  const statusFilter = ref('All Status')
  const statusFilterItems = ref(['All Status', 'Returned', 'Request Denied','Archived'])
  const globalFilter = ref('')
  const isGettingHistoryData = ref(false)
  const historyData = ref([])

  const pagination = ref({
    pageIndex: 0,
    pageSize: 7
  })

  const getHistoryData = async () => {
    isGettingHistoryData.value = true
    try {
      
      let { data, error } = await supabase.from('tbl_borrowed_item').select('*').in('status', ['Returned', 'Request Denied', 'Archived']).order('form_id', { ascending: false })

      if(data) {
        console.log(data)
        historyData.value = data
        isGettingHistoryData.value = false
      }
    } catch(err) {
      toast.add({
        title: 'Server error',
        description: 'An error occured while getting data',
        icon: 'i-lucide-circle-x',
        color: 'error'
      })
      console.log(err)
      isGettingHistoryData.value = false
    }
  }

  const filterData = computed(() => {
    if(statusFilter.value == 'All Status') {
      return historyData.value
    } else {
      return historyData.value.filter(i => i.status == statusFilter.value)
    }
  })
  
  // for UTable
  const columns = [
    { 
      accessorKey: 'item',
      header: 'Equipment Name'
    },
    { 
      accessorKey: 'borrower_name',
      header: 'Borrower Name'
    },
    { 
      accessorKey: 'borrower_id',
      header: 'ID'
    },
    { 
      accessorKey: 'room',
      header: 'Room'
    },
    { 
      accessorKey: 'teacher_name',
      header: 'Teacher'
    },
    { 
      accessorKey: 'quantity',
      header: 'Quantity'
    },
    { 
      accessorKey: 'borrow_date',
      header: 'Borrowed Date'
    },
    { 
      accessorKey: 'borrow_time',
      header: 'Borrowed Time',
      cell: ({ row }) => {
        let borrowTime = row.getValue('borrow_time')
        return dayjs(`2026-1-1 ${borrowTime}`).format('h:mm A')
      }
    },
    { 
      accessorKey: 'return_date',
      header: 'Returned Date'
    },
    { 
      accessorKey: 'return_time',
      header: 'Returned Time',
      cell: ({ row }) => {
        let returnTime = row.getValue('return_time')
        return dayjs(`2026-1-1 ${returnTime}`).format('h:mm A')
      }
    },
    { 
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const color = {
          Returned: 'success',
          'Request Denied': 'error',
          Archived: 'neutral'
        }[row.getValue('status')]
        
        return h(UBadge, { class: 'capitalize uppercase', variant: 'subtle', color }, () => 
          row.getValue('status'))
      }
    }
  ]

  onIonViewWillEnter(() => {
    getHistoryData()
  })
</script>