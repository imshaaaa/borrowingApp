<template>
  <ion-page>
    <ion-content>
        <div class="min-h-full bg-gray-100 pt-24 px-6">
          <LoadingTable v-if="isGettingUsersData"/>
          <div class="mt-6" v-else>
            <div class="mb-2">
              <UInput v-model="globalFilter" placeholder="Search" color="secondary" class="w-full mb-2">
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
              <USelect v-model="statusFilter" class="w-auto mr-2" color="secondary" variant="outline" :items="statusFilterItems"/>
              <USelect v-model="roleFilter" class="w-auto" color="secondary" variant="outline" :items="userStore.user.user_type == 'Admin' ? roleFilterItemsAdmin : roleFilterItemsTechnical"/>
            </div>
            <UTable ref="table" :data="filteredRoles" :columns="columns" v-model:global-filter="globalFilter" class="flex-1 bg-white rounded-lg" v-model:pagination="pagination" :pagination-options="{ getPaginationRowModel: getPaginationRowModel() }">
              <!-- <template #actions-cell="{ row }">
                <div v-if="userStore.user.user_type !== 'Admin'" class="flex justify-center items-center gap-2">
                  <UButton v-if="row.original.status  != 'Approved' && row.original.status  != 'Disabled' && row.original.status  != 'Rejected'" variant="soft" color="neutral" @click="openActionsModal(row.original)">
                    <UIcon name="i-lucide-user-pen"></UIcon>
                  </UButton>
                  
                  <UButton v-else class="ml-2" variant="subtle" color="error" @click="openDeleteModal(row.original)">
                    <UIcon name="i-lucide-trash"></UIcon>
                  </UButton>
                </div>
              </template> -->
            </UTable>
            <div class="flex justify-center border-t border-default pt-4 px-4">
            <UPagination v-if="filteredUsers?.length >= 10" color="neutral" activeColor="neutral"
              :page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
              :items-per-page="table?.tableApi?.getState().pagination.pageSize"
              :total="table?.tableApi?.getFilteredRowModel().rows.length"
              @update:page="(p) => table?.tableApi?.setPageIndex(p - 1)"
            />
          </div>
            <UModal title="New Account Request" v-model:open="isActionsModalOpen" :dismissible="false" :ui="{ footer: 'justify-end' }">
              <template #body>
                <div class="text-gray-700 text-center">
                  Approve new user account request?
                </div>
              </template>
              <template #footer>
                <UButton color="error" variant="subtle" @click="isRejectModalOpen = true">Reject</UButton>
                  <UButton type="submit"  color="secondary" @click="approveUser">Approve</UButton>
              </template>
            </UModal>
            <UModal title="Delete User" v-model:open="isDeleteModalOpen" :ui="{ footer: 'justify-end'}" :dismissible="false" :close="!isDelete">
              <template #body>
                <div class="w-full text-gray-800 text-center">
                  <p>Are you sure you want to delete <span class="font-bold text-red-500">{{ selectedUser.fullname }} ({{ selectedUser.user_id }})</span> account?</p>
                </div>
              </template>
              <template #footer="{ close }">
                <UButton color="error" variant="outline" @click="close" :disabled="isDelete">Cancel</UButton>
                <UButton color="error" @click="deleteUser" v-if=!isDelete>Delete</UButton>
                <UButton color="error" @click="" loading v-if="isDelete">Deleting account ...</UButton>
              </template>
            </UModal>
            <UModal title="Reject User Request" v-model:open="isRejectModalOpen" :ui="{ footer: 'justify-end'}" :dismissible="false" :close="!isReject">
              <template #body>
                <div class="w-full text-gray-800 text-center">
                  <p>Are you sure you want to reject this user request ?</p>
                </div>
              </template>
              <template #footer="{ close }">
                <UButton color="error" variant="outline" @click="close" :disabled="isReject">Cancel</UButton>
                <UButton color="error" @click="rejectUser" v-if=!isReject>Reject</UButton>
                <UButton color="error" @click="" loading v-if="isReject">Rejecting account ...</UButton>
              </template>
            </UModal>
            <UModal v-model:open='isNotifModal' :dismissible='false' :close="false">
              <template #body>
                <div class="text-gray-700 flex justify-center items-center h-16">
                <p class="font-medium">{{ isNotifModalMsg }}</p>
                </div>
              </template>
            </UModal>
            <UModal :title="isReconfirmModalTitle" v-model:open="isReconfirmModal" :dismissible='false' :ui="{ footer: 'justify-end'}" :close="false">
              <template #body>
                <div class="text-gray-700">
                {{ isReconfirmModalMsg }}
                </div>
              </template>
              <template #footer="{ close }">
                <UButton color="error" variant="subtle" @click="close" :disabled="isApprove">Cancel</UButton>
                <UButton v-if="!isApprove" color="secondary" @click="approveNewUser">Approve User</UButton>
                <UButton v-if="isApprove" color="secondary" class="flex justify-center" loading> Approving new user ...</UButton>
              </template>
            </UModal>
          </div>
        </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
  definePageMeta({
    layout: 'admin',
    middleware: 'auth'
  })

  onIonViewWillEnter(() => {
    isGettingUsersData.value = true
    getUsers()
  })

  onIonViewWillLeave(() => {
    console.log('unmount')
  })
  
  import { h, resolveComponent } from 'vue'
  import { getPaginationRowModel } from '@tanstack/vue-table'
  import { onIonViewWillEnter, onIonViewWillLeave } from '#imports'
import { header, user } from '#build/ui'

  const supabase = useSupabaseClient()
  const userStore = useUserStore()
  const table = useTemplateRef('table')
  const UBadge = resolveComponent('UBadge')
  const toast = useToast()
  const config = useRuntimeConfig()
  const open = ref(false)
  const isGettingUsersData = ref(false)
  const isActionsModalOpen = ref(false)
  const isConfirmModal = ref(false)
  const isNotifModal = ref(false)
  const isNotifModalMsg = ref('')
  const isReconfirmModal = ref(false)
  const isReconfirmModalMsg = ref('')
  const isReconfirmModalTitle = ref('')
  const isDeleteModalOpen = ref(false)
  const isRejectModalOpen = ref(false)
  const isApprove = ref(false)
  const isReject = ref(false)
  const isDelete = ref(false)
  const selectedUser = ref({})
  const statusItems = ref(['Pending','Approved'])
  const statusFilterItems = ref(['All Status', 'Pending', 'Approved', 'Disabled', 'Rejected'])
  const roleFilterItemsTechnical = ref(['All Roles','Student', 'Staff', 'Teacher'])
  const roleFilterItemsAdmin = ref(['All Roles','OJT Trainee', 'Technical Staff'])
  const statusFilter = ref('All Status')
  const roleFilter = ref('All Roles')
  const globalFilter = ref('')
  const allUsersData = ref(null)

  defineShortcuts({
    o: () => open.value = !open.value
  })

  const getUsers = async () => {

    let userTypes = []

    if(userStore.user.user_type === 'Admin') {
      userTypes = ['Technical Staff', 'OJT Trainee']
    } else {
      userTypes = ['Student','Staff','Teacher']
    }

    let { data: usersData, error: isError } = await supabase.from('tbl_users').select('*').in('user_type', userTypes).order('user_id', { ascending: false })

    if(!usersData) {
      return allUsersData.value = null
    }

    if(isError) {
      toast.add({
        title: 'Server error',
        description: 'An error occured while getting data',
        icon: 'i-lucide-circle-x',
        color: 'error'
      })
      return
    }

    if(usersData) {
      let newUsersData = usersData.map(d => ({
        user_id: d.employee_id || d.student_id,
        role: d.user_type,
        user_uid: d.user_uid || null,
        fullname: `${d.firstname} ${d.lastname}`,
        email: d.email,
        contact: d.contact_number,
        details: d.course ? `${d.student_role} - ${d.course}` : d.department ,
        year_level: d.year_level || 'N/A',
        username: d.username,
        status: d.status
      }))
      isGettingUsersData.value = false
      return allUsersData.value = newUsersData
    }
  }

  const filteredUsers = computed(() => {
    if(statusFilter.value == 'All Status') {
      return allUsersData.value
    } else {
      return allUsersData.value.filter(u => u.status == statusFilter.value)
    }
  })

  const filteredRoles = computed(() => {
    if(roleFilter.value == 'All Roles') {
      return filteredUsers.value
    } else {
      return filteredUsers.value.filter(u => u.role == roleFilter.value)
    }
  })
  
  const openActionsModal = (item) => {
    selectedUser.value = {...item}
    isActionsModalOpen.value = true
  }

  const openDeleteModal = (item) => {
    selectedUser.value = {...item}
    isDeleteModalOpen.value = true
    console.log(selectedUser.value)
  }

  const rejectUser  = async () => {
    isReject.value = true
    try {
      let { error } = await supabase.from('tbl_users').update({ status: 'Rejected' }).eq('user_uid', selectedUser.value.user_uid)

      if(error) throw error

      let index = await filteredUsers.value.findIndex(u => u.user_uid == selectedUser.value.user_uid)

      if(index !== -1) {
        filteredUsers.value[index].status = 'Rejected'  
      }

      console.log('index of reject acc', filteredUsers.value)

      toast.add({
        title: 'Account Rejected!',
        description: 'Requested account has been rejected',
        icon: 'i-lucide-user-check',
        color: 'warning'
      })

      isActionsModalOpen.value = false
      isRejectModalOpen.value = false
      isReject.value = false
    } catch (error) {
      toast.add({
        title: 'Process Failed!',
        description: 'An error occured while processing data',
        icon: 'i-lucide-circle-x',
        color: 'error'
      })
      isReject.value = false
      console.log(error)
    }
  }

  const approveUser = async () => {
    isReconfirmModal.value = true
    isReconfirmModalMsg.value = 'Are you sure you want to approve this user?'
    isReconfirmModalTitle.value = 'Approve User'
  }

  const approveNewUser = async () => {
    isApprove.value= true
    let { error } = await supabase.from('tbl_users').update({ status: 'Approved' }).eq('email', selectedUser.value.email)

    if(error) {
      toast.add({
        title: 'Update Failed!',
        description: 'An error occured while updating data',
        icon: 'i-lucide-circle-x',
        color: 'error'
      })
      isApprove.value = true
      return
    }

    let index = allUsersData.value.findIndex(u => u.email == selectedUser.value.email)
    if(index !== -1) {
      allUsersData.value[index].status = 'Approved'
    }

    toast.add({
        title: 'Account Approved!',
        description: 'New account has been approved',
        icon: 'i-lucide-user-check',
        color: 'success'
      })
    isActionsModalOpen.value = false
    isReconfirmModal.value = false
  }

  const deleteUser = async () => {
    // isNotifModal.value = true
    // isNotifModalMsg.value = 'Deleting account ...'

    isDelete.value = true
    
     try {
      let res = await $fetch('https://zijlzrpvfhkojhcpunas.supabase.co/functions/v1/delete-user',{
        
        method: 'POST',
        headers:{
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.public.supabaseSecretKey}`
        },
        body: { user_uid: selectedUser.value.user_uid }
      
      })
      if(res.success) {
         let { error } = await supabase.from('tbl_users').delete().eq('user_uid', selectedUser.value.user_uid)
      }
       if(res.error) {
         console.log('error', res.error)
        toast.add({
          title: 'Delete Failed!',
          description: 'An error occured while deleting data',
          icon: 'i-lucide-circle-x',
          color: 'error'
        })
         isDelete.value = false
        return
       }
    } catch(err) {
      console.log(err)
      toast.add({
        title: 'Delete Failed!',
        description: 'An error occured while deleting data',
        icon: 'i-lucide-circle-x',
        color: 'error'
      })
       isDelete.value = false
      return
    }
    
    allUsersData.value = allUsersData.value.filter(u => u.email !== selectedUser.value.email)

    toast.add({
      title: 'Account Deleted!',
      description: 'Account is deleted/declined successfully',
      icon: 'i-lucide-user-check',
      color: 'success'
    })
    isActionsModalOpen.value = false
    isDeleteModalOpen.value = false
    //isNotifModal.value = false
    isDelete.value = false
  }

  const pagination = ref({
    pageIndex: 0,
    pageSize: 10
  })
  
  // for UTable
  const columns = [
    { 
      accessorKey: 'user_id',
      header: 'User ID'
    },
    {
      accessorKey: 'role',
      header: 'Role'
    },
    { 
      accessorKey: 'fullname',
      header: 'Fullname'
    },
    { 
      accessorKey: 'email',
      header: 'Email'
    },
    { 
      accessorKey: 'contact',
      header: 'Contact'
    },
    { 
      accessorKey: 'details',
      header: 'Details'
    },
    { 
      accessorKey: 'year_level',
      header: 'Year Level'
    },
    { 
      accessorKey: 'username',
      header: 'Username'
    },
    { 
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const color = {
          Pending: 'warning',
          Approved: 'success',
          Disabled: 'neutral',
          Rejected: 'neutral'
        }[row.getValue('status')]
        
        return h(UBadge, { class: 'capitalize uppercase', variant: 'subtle', color }, () => 
          row.getValue('status'))
      }
    },
    // {
    //   id: 'actions',
    //   header: 'Actions'
    // }
  ]
    </script>