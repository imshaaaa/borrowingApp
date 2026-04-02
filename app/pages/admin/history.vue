<template>
  <IonPage>
    <IonContent>
      <NuxtLayout>
        <div>
          <LoadingTable v-if="isGettingHistoryData" />
          <div v-if="!isGettingHistoryData" class="mt-6">
            <UInput v-model="globalFilter" class="mb-2" placeholder="Global Filter Search..." color="secondary" />
            <UTable ref="table" :data="historyData" :columns="columns" v-model:global-filter="globalFilter" class="flex-1 bg-white rounded-lg" v-model:pagination="pagination" :pagination-options="{ getPaginationRowModel: getPaginationRowModel() }">
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
      </NuxtLayout>
    </IonContent>
  </IonPage>
</template>

<script setup>
  import { object, string } from 'yup'
  import { h, resolveComponent } from 'vue'
  import { getPaginationRowModel } from '@tanstack/vue-table'
  import { onIonViewWillEnter, onIonViewWillLeave } from '#imports'
  import dayjs from 'dayjs'
  
  definePageMeta({
    layout: 'admin'
  })

  const supabase = useSupabaseClient()
  const table = useTemplateRef('table')
  const UBadge = resolveComponent('UBadge')
  const toast = useToast()
  const globalFilter = ref('')
  const stocksData = ref([
    { item_name: 'Hdmi Cable', borrower_name: 'Shallom Kyle Jacinto', user_id: '001-00101', room: '201', teacher:'Angel Mangubat', quantity: 10, borrow_date:'march 1', borrow_time: '10am', return_date: 'N/A', return_time:'N/A', status: 'overdue' },

  ])
  const isGettingHistoryData = ref(false)
  const historyData = ref([])

  const pagination = ref({
    pageIndex: 0,
    pageSize: 7
  })

  const getHistoryData = async () => {
    isGettingHistoryData.value = true
    try {
      
      let { data, error } = await supabase.from('tbl_borrowed_item').select('*').in('status', ['Return', 'Request Denied']).order('form_id', { ascending: false })

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
          Return: 'success',
          'Request Denied': 'error',
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