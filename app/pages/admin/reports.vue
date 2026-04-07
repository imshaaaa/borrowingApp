<template>
  <IonPage>
    <IonContent>
        <div class="min-h-full bg-gray-100 pt-24 px-6">
          <UTabs :items="tabsItem" color="secondary">
            <template #user>
              <div class="bg-white py-2 px-5 rounded-lg">
                <p class="text-xl font-bold">Generate User Borrowing Report</p>
                <p class="text-blue-800 text-xs">Select a time period to generate a table of borrowing activities.</p>
                <div class="flex flex-wrap justify-start gap-x-2">
                  
                <UFormField label="Report Type" class="mt-4">
                  <USelect color="secondary" variant="subtle" size="xl" class="" :items="reportTypeItems" v-model="reportTypeDefault" />
                </UFormField>
                <UFormField v-if="reportTypeDefault == 'Weekly'" label="Week of" class="mt-4">
                <UPopover>
                  <UButton variant="subtle" color="neutral" size="xl" icon="i-lucide-calendar">
                    <template v-if="modelValue.start">
                      <template v-if="modelValue.end">
                        {{ df.format(modelValue.start.toDate(getLocalTimeZone())) }} - {{ df.format(modelValue.end.toDate(getLocalTimeZone())) }}
                      </template>
                      <template v-else>
                        {{ df.format(modelValue.start.toDate(getLocalTimeZone())) }}
                      </template>
                    </template>
                    <template v-else>
                      pick a date
                    </template>
                  </UButton>
                  <template #content>
                    <UCalendar v-model="modelValue" :number-of-months="1" range variant="subtle" color="secondary" class="text-gray-800" />
                  </template>
                </UPopover>
                </UFormField>
                <UFormField v-if="reportTypeDefault == 'Monthly' " label="Month" class="mt-4">
                <USelect color="secondary" variant="subtle" size="xl" class="" :items="weekOfItems" v-model="weekOfDefault" />
                </UFormField>
                <UFormField v-if="reportTypeDefault == 'Yearly' || reportTypeDefault == 'Monthly'" label="Year" class="mt-4">
                  <UInput variant="subtle" color="secondary" size="xl" class="w-28"/>
                </UFormField>
                </div>
                <div class="mt-4 mb-2 flex justify-start gap-2">
                  <UButton color="secondary" size="xl">Generate Report</UButton>
                  <UDropdownMenu :items="exportItems">
                    <UButton color="neutral" variant="subtle" size="xl" icon="i-lucide-download">Export</UButton>
                  </UDropdownMenu>
                  <UButton color="neutral" variant="subtle" size="xl" icon="i-lucide-printer"/>
                </div>
              </div>
              <div class="mt-6">
                <UInput v-model="globalFilter" class="mb-2" placeholder="Global Filter Search..." color="secondary" />
                <UTable ref="table" :data="usersReportData" :columns="columnsUser" v-model:global-filter="globalFilter" class="flex-1 bg-white rounded-lg" v-model:pagination="pagination" :pagination-options="{ getPaginationRowModel: getPaginationRowModel() }">
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
              
            </template>
            <template #inventory>
              <div class="bg-white py-2 px-5 rounded-lg">
                <p class="text-xl font-bold">Generate Inventory Report</p>
                <p class="text-blue-800 text-xs">Select a time period to generate a table of borrowing activities.</p>
                <div class="flex flex-wrap justify-start gap-x-2">
                  
                <UFormField label="Report Type" class="mt-4">
                  <USelect color="secondary" variant="subtle" size="xl" class="" :items="reportTypeItems" v-model="reportTypeDefault" />
                </UFormField>
                <UFormField v-if="reportTypeDefault == 'Weekly'" label="Week of" class="mt-4">
                <UPopover>
                  <UButton variant="subtle" color="neutral" size="xl" icon="i-lucide-calendar">
                    <template v-if="modelValue.start">
                      <template v-if="modelValue.end">
                        {{ df.format(modelValue.start.toDate(getLocalTimeZone())) }} - {{ df.format(modelValue.end.toDate(getLocalTimeZone())) }}
                      </template>
                      <template v-else>
                        {{ df.format(modelValue.start.toDate(getLocalTimeZone())) }}
                      </template>
                    </template>
                    <template v-else>
                      pick a date
                    </template>
                  </UButton>
                  <template #content>
                    <UCalendar v-model="modelValue" :number-of-months="1" range variant="subtle" color="secondary" class="text-gray-800" />
                  </template>
                </UPopover>
                </UFormField>
                <UFormField v-if="reportTypeDefault == 'Monthly' " label="Month" class="mt-4">
                <USelect color="secondary" variant="subtle" size="xl" class="" :items="weekOfItems" v-model="weekOfDefault" />
                </UFormField>
                <UFormField v-if="reportTypeDefault == 'Yearly' || reportTypeDefault == 'Monthly'" label="Year" class="mt-4">
                  <UInput variant="subtle" color="secondary" size="xl" class="w-28"/>
                </UFormField>
                </div>
                <div class="mt-4 mb-2 flex justify-start gap-2">
                  <UButton color="secondary" size="xl">Generate Report</UButton>
                  <UDropdownMenu :items="exportItems">
                    <UButton color="neutral" variant="subtle" size="xl" icon="i-lucide-download">Export</UButton>
                  </UDropdownMenu>
                  <UButton color="neutral" variant="subtle" size="xl" icon="i-lucide-printer"/>
                </div>
              </div>
              <div class="mt-6">
                <UInput v-model="globalFilter" class="mb-2" placeholder="Global Filter Search..." color="secondary" />
                <UTable ref="table" :data="inventoryReportData" :columns="columnsInventory" v-model:global-filter="globalFilter" class="flex-1 bg-white rounded-lg" v-model:pagination="pagination" :pagination-options="{ getPaginationRowModel: getPaginationRowModel() }">
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
            </template>
          </UTabs>
        </div>
    </IonContent>
  </IonPage>
</template>

<script setup>
  import { object, string } from 'yup'
  import { h, resolveComponent } from 'vue'
  import { getPaginationRowModel } from '@tanstack/vue-table'
  import { CalendarDate, DateFormatter, getLocalTimeZone } from '@internationalized/date'
  
  definePageMeta({
    layout: 'admin'
  })

  const table = useTemplateRef('table')
  const UBadge = resolveComponent('UBadge')
  const globalFilter = ref('')
  const usersReportData = ref([
    { item_name: 'Hdmi Cable', borrower_name: 'Shallom Kyle Jacinto', user_id: '001-00101', room: '201', teacher:'Angel Mangubat', quantity: 10, borrow_date:'march 1', borrow_time: '10am', return_date: 'N/A', return_time:'N/A', status: 'overdue' },

  ])
  const inventoryReportData = ref([
    { item_id: '0101', item_name:'HDMI', category:'Accessories', date_purchased: '2023/1/26', price: 'php100', total_quantity: 10, available_quantity: 10, date_added:'march 1', last_updated: '10am' },

  ])
  const tabsItem = [
    {
      label: 'User Borrowing Report',
      slot: 'user'
    },
    {
      label: 'Inventory Report',
      slot: 'inventory'
    }
  ]
  const df = new DateFormatter('en-US', {
    dateStyle: 'medium'
  })
  const exportItems = ref([
    { label: 'Export as PDF' },
    { label: 'Export as Excel' },
  ])

  const modelValue = shallowRef({
    start: null,
    end: null
  })

  const reportTypeItems = ref(['Weekly','Monthly','Yearly'])
  const weekOfItems = ref(['January', 'February', 'March', 'April', 'May', 'June', 'July','August','September','October','November','December'])
  const reportTypeDefault = ref('Weekly')
  const weekOfDefault = ref('January')

  const pagination = ref({
    pageIndex: 0,
    pageSize: 7
  })
  
  // for UTable
  const columnsUser = [
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
  const columnsInventory = [
    {
      accessorKey: 'item_id',
      header: 'Item ID',
    },
    {
      accessorKey: 'item_name',
      header: 'Item Name',
    },
    {
      accessorKey: 'category',
      header: 'Category',
    },
    {
      accessorKey: 'date_purchased',
      header: 'Date Purchased',
    },
    {
      accessorKey: 'price',
      header: 'Price',
    },
    {
      accessorKey: 'total_quantity',
      header: 'Total Quantity',
    },
    {
      accessorKey: 'available_quantity',
      header: 'Available Quantity',
    },
    {
      accessorKey: 'date_added',
      header: 'Date Added',
    },
    {
      accessorKey: 'last_updated',
      header: 'Last Updated',
    },
  ]
</script>