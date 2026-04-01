<template>
  <IonPage>
    <IonContent>
      <NuxtLayout>
        <div>
          <div class="mt-6">
            <UInput v-model="globalFilter" class="mb-2" placeholder="Global Filter Search..." color="secondary" />
            <UTable ref="table" :data="stocksData" :columns="columns" v-model:global-filter="globalFilter" class="flex-1 bg-white rounded-lg" v-model:pagination="pagination" :pagination-options="{ getPaginationRowModel: getPaginationRowModel() }">
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
  
  definePageMeta({
    layout: 'admin'
  })

  const table = useTemplateRef('table')
  const UBadge = resolveComponent('UBadge')
  const globalFilter = ref('')
  const stocksData = ref([
    { item_name: 'Hdmi Cable', borrower_name: 'Shallom Kyle Jacinto', user_id: '001-00101', room: '201', teacher:'Angel Mangubat', quantity: 10, borrow_date:'march 1', borrow_time: '10am', return_date: 'N/A', return_time:'N/A', status: 'overdue' },

  ])

  const pagination = ref({
    pageIndex: 0,
    pageSize: 7
  })
  
  // for UTable
  const columns = [
    { 
      accessorKey: 'item_name',
      header: 'Item Name'
    },
    { 
      accessorKey: 'borrower_name',
      header: 'Borrower Name'
    },
    { 
      accessorKey: 'user_id',
      header: 'ID'
    },
    { 
      accessorKey: 'room',
      header: 'Room'
    },
    { 
      accessorKey: 'teacher',
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
      header: 'Borrowed Time'
    },
    { 
      accessorKey: 'return_date',
      header: 'Returned Date'
    },
    { 
      accessorKey: 'return_time',
      header: 'Returned Time'
    },
    { 
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const color = {
          pending: 'neutral',
          approved: 'success',
          on_going: 'warning',
          overdue: 'error'
        }[row.getValue('status')]
        
        return h(UBadge, { class: 'capitalize uppercase', variant: 'subtle', color }, () => 
          row.getValue('status'))
      }
    }
  ]
</script>