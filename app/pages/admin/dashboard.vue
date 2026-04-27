<template>
  <ion-page>
    <ion-content>
        <div class="min-h-full bg-gray-100 pt-28 px-6 pb-6">
          <div class="flex flex-wrap gap-4 justify-between">
            <div class="flex-1 min-w-[calc(50%-0.5rem)] flex flex-col bg-white py-2 px-4 rounded-lg shadow">
              <p class="text-gray-500 text-sm">
                <UIcon name="i-lucide-box" class="text-blue-600 mr-2" />
                Total Equipments
              </p>
              <UButton v-if="isGettingData" class="mt-auto pt-2" variant="soft" color="neutral" loading></UButton>
              <p v-else class="text-xl font-bold mt-auto pt-2">{{ allEquipments }}</p>
            </div>
            <div class="flex-1 min-w-[calc(50%-0.5rem)] flex flex-col bg-white py-2 px-4 rounded-lg shadow">
              <p class="text-gray-500 text-sm">
                <UIcon name="i-lucide-users" class="text-blue-600 mr-2" />
                Total Users
              </p>
              <div v-if="userStore.user.user_type == 'Admin'" class="mt-auto pt-2">
                <UButton v-if="isGettingData" class="mt-auto pt-2" variant="soft" color="neutral" loading></UButton>
                <p v-else class="text-xl font-bold mt-auto pt-2">{{ allStaffLength }}</p>
              </div>
              <div v-else class="mt-auto pt-2">
                <UButton v-if="isGettingData" class="mt-auto pt-2" variant="soft" color="neutral" loading></UButton>
                <p v-else class="text-xl font-bold mt-auto pt-2">{{ allUsersLength }}</p>
              </div>
            </div>
            <div class="flex-1 min-w-[calc(50%-0.5rem)] flex flex-col bg-white py-2 px-4 rounded-lg shadow" @click="setType('unreturned')">
              <p class="text-gray-500 text-sm">
                <UIcon name="i-lucide-circle-alert" class="text-red-600 mr-2" />
                Unreturned
              </p>
              <UButton v-if="isGettingData" class="mt-auto pt-2" variant="soft" color="neutral" loading></UButton>
              <p v-else class="text-xl font-bold mt-auto pt-2">{{ allBorrowedData.filter(i => i.status == "Unreturned").length }}</p>
            </div>
            <div class="flex-1 min-w-[calc(50%-0.5rem)] flex flex-col bg-white py-2 px-4 rounded-lg shadow" @click="setType('pending')">
              <p class="text-gray-500 text-sm">
                <UIcon name="i-lucide-hourglass" class="text-orange-600 mr-2" />
                Pending Request
              </p>
             <UButton v-if="isGettingData" class="mt-auto pt-2" variant="soft" color="neutral" loading></UButton>
              <p v-else class="text-xl font-bold mt-auto pt-2">{{ allBorrowedData.filter(i => i.status == "Pending").length }}</p>
            </div>
            <div class="flex-1 min-w-[calc(50%-0.5rem)] flex flex-col bg-white py-2 px-4 rounded-lg shadow" @click="setType('borrowed')">
              <p class="text-gray-500 text-sm">
                <UIcon name="i-lucide-refresh-ccw" class="text-blue-600 mr-2" />
                Borrowed
              </p>
              <UButton v-if="isGettingData" class="mt-auto pt-2" variant="soft" color="neutral" loading></UButton>
              <p v-else class="text-xl font-bold mt-auto pt-2">{{ allBorrowedData.filter(i => i.status == "On Going").length + allBorrowedData.filter(i => i.status == "Unreturned").length }}</p>
            </div>
            <div class="flex-1 min-w-[calc(50%-0.5rem)] flex flex-col bg-white py-2 px-4 rounded-lg shadow" @click="setType('returned')">
              <p class="text-gray-500 text-sm">
                <UIcon name="i-lucide-undo-2" class="text-green-600 mr-2" />
                Returned
              </p>
              <UButton v-if="isGettingData" class="mt-auto pt-2" variant="soft" color="neutral" loading></UButton>
              <p v-else class="text-xl font-bold mt-auto pt-2">{{ allBorrowedData.filter(i => i.status == "Return").length }}</p>
            </div>
          </div>

          <DashboardChart v-if="!isGettingData" :data="allBorrowedData" :selectType="selectType" />
        </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
  import { onMounted } from "vue"

  const supabase = useSupabaseClient()
  const userStore = useUserStore()
  const toast = useToast()
  const isGettingData = ref(true)
  const allBorrowedData = ref()
  const allUsersLength = ref()
  const allEquipments = ref()
  const allStaffLength = ref()
  const selectType = ref('borrowed')

  const getStatsData = async () => {
    isGettingData.value = true
    try {
      let { count: items, error: itemsErr } = await supabase
      .from('tbl_item_models')
      .select('*', { count: 'exact', head: true })

      if(itemsErr) throw itemsErr

      let { data, error } = await supabase
      .from('tbl_borrowed_item')
      .select('*')
      .in('status', ['On Going', 'Unreturned', 'Returned'])

      if (error) throw error

      let { count, error: countErr } = await supabase
      .from("tbl_users")
      .select('*', { count: 'exact', head: true })

      if(countErr) throw countErr

      let { count: techStaffData, error: techStaffDataErr } = await supabase
      .from("tbl_users")
      .select('*', { count: 'exact', head: true })
      .in('user_type', ['Technical Staff', 'OJT Trainee'])

      allBorrowedData.value = data
      allUsersLength.value = count
      allEquipments.value = items
      allStaffLength.value = techStaffData
      isGettingData.value = false
    } catch (error) {
      toast.add({
        title: 'Server error',
        description: 'An error occured while getting data',
        icon: 'i-lucide-circle-x',
        color: 'error'
      })
      console.log(error)
      isGettingData.value = false
    }

  }

  const setType = (type) => {
    selectType.value = type
    console.log(type)
  }


  definePageMeta({
    layout: 'admin',
    middleware: 'auth'
  })

  onMounted(() => {
    getStatsData()
  })

</script>