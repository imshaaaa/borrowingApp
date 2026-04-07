<template>
  <IonPage>
    <IonContent>
        <div class="min-h-screen bg-gray-100 pt-24 px-6 pb-10">
          <div class="bg-white rounded-xl px-6 py-4 text-gray-700">
          <div>
            <p class="text-xl font-bold">Your Details</p>
            <p class="text-xs text-blue-800">This is your profile informations.</p>
            <UForm class="mt-8">
              <UFormField v-if="!isEdit" label="Fullname">
                <UInput v-model="state.fullname" class="w-full" variant="soft" :disabled="!isEdit"/>
              </UFormField>
              <div v-if="isEdit">
                <UFormField label="Firstname" class="mt-4" >
                  <UInput v-model="state.firstname" class="w-full" variant="soft" :disabled="!isEdit"/>
                </UFormField>
                <UFormField label="Middlename" class="mt-4" >
                  <UInput v-model="state.middlename" class="w-full" variant="soft" :disabled="!isEdit"/>
                </UFormField>
                <UFormField label="Lastname" class="mt-4">
                  <UInput v-model="state.lastname" class="w-full" variant="soft" :disabled="!isEdit"/>
                </UFormField>
              </div>
              <UFormField label="Role" class="mt-4">
                <UInput v-model="state.role" class="w-full" variant="soft" disabled/>
              </UFormField>
              <UFormField label="User ID" class="mt-4">
                <UInput v-model="state.userid" class="w-full" variant="soft" disabled/>
              </UFormField>
              <UFormField v-if="state.role == 'Student'" label="Course" class="mt-4">
                <UInput v-model="state.course" class="w-full" variant="soft" />
              </UFormField>
              <UFormField v-if="state.role == 'Student'" label="Year Level" class="mt-4">
                <UInput v-model="state.yearLevel" class="w-full" variant="soft"/>
              </UFormField>
              <UFormField label="Username" class="mt-4">
                <UInput v-model="state.username" class="w-full" variant="soft" disabled />
              </UFormField>
              <UFormField v-if="state.role != 'Student'" label="Department" class="mt-4">
                <UInput v-model="state.department" class="w-full" variant="soft" :disabled="!isEdit" />
              </UFormField>
              <UFormField label="Email" class="mt-4">
                <UInput v-model="state.email" class="w-full" variant="soft" :disabled="!isEdit" />
              </UFormField>
              <UFormField label="Contact" class="mt-4">
                <UInput v-model="state.contact" class="w-full" variant="soft" :disabled="!isEdit" />
              </UFormField>
              <div class="flex gap-2 justify-end">
                <UButton v-if="!isEdit" color="secondary" class="mt-4" @click="isEdit = true">Edit Profile</UButton>
                  <UButton v-if="isEdit" color="error" variant="soft" class="mt-4" @click="isEdit = false">Cancel</UButton>
                  <UButton v-if="isEdit" color="secondary" class="mt-4">Update Profile</UButton>
              </div>
            </UForm>
          </div>
        </div>
        </div>
    </IonContent>
  </IonPage>
</template>

<script setup>

  definePageMeta({
    layout: 'admin'
  })

  const userStore = useUserStore()
  const isEdit = ref(false)

  const state = reactive({
    firstname: undefined,
    middlename: undefined,
    lastname: undefined,
    fullname: undefined,
    role: undefined,
    userid: undefined,
    username: undefined,
    course: undefined,
    yearLevel: undefined,
    department: undefined,
    email: undefined,
    contact: undefined,
  })

  const setUserInfo = () => {
    state.firstname = userStore.user.firstname
    state.middlename = userStore.user.middlename
    state.lastname = userStore.user.lastname
    state.fullname = `${userStore.user.firstname} ${userStore.user.middlename} ${userStore.user.lastname}`
    state.role = userStore.user.user_type
    state.userid = userStore.user.id
    state.username = userStore.user.username
    state.course = userStore.user.course
    state.yearLevel = userStore.user.year_level
    state.department = userStore.user.department
    state.email = userStore.user.email
    state.contact = userStore.user.contact
  }

  onMounted(() => {
    setUserInfo()
    console.log(userStore)
  })
  
</script>