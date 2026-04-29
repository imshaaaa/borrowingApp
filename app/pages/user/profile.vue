<template>
  <ion-page>
    <ion-content>
        <div class="min-h-screen bg-gray-100 pt-24 px-6 pb-10 mt-6">
          <div class="bg-white rounded-xl px-6 py-4 text-gray-700">
          <div>
            <p class="text-xl font-bold">Your Details</p>
            <p class="text-xs text-blue-800">This is your profile informations.</p>
            <UForm class="mt-8" :schema="schema" :state="state" @submit="updateProfile">
              <div class="flex justify-center mb-8">
                <UAvatar class="h-24 w-24" :src="`https://zijlzrpvfhkojhcpunas.supabase.co/storage/v1/object/public/profile_pictures/${userStore.user.id}?t=${picKey}`" :alt="userStore.user.fullname"/>
                <UModal title="Update Profile Picture" :ui="{ footer: 'justify-end' }" :close="!isUpdating" :dismissible="false">
                  <UButton v-if="isEdit" icon="i-lucide-pen"  size="xs" color="neutral" class="absolute mt-16 ml-18 rounded-lg" />
                  <template #body>
                    <div class="w-full flex justify-center">
                      <UFileUpload accept="image/*" v-model="isProfilePic" label="Drop your image here" description="PNG, JPG (max. 30MB)" class="w-50 min-h-full"/>
                    </div>
                  </template>
                  <template #footer="{ close }">
                    <UButton variant="soft" color="error" @click="close" :disabled="isUpdatingPic">close</UButton>
                    <UButton v-if="!isUpdatingPic" color="secondary" :disabled="!isProfilePic" @click="updateProfilePic(close)">Update profile</UButton>
                    <UButton v-if="isUpdatingPic" color="secondary" loading="">Updating profile ...</UButton>
                  </template>
                </UModal>
              </div>
              <UFormField v-if="!isEdit" label="Fullname">
                <UInput v-model="state.fullname" class="w-full" variant="soft" disabled/>
              </UFormField>
              <div v-if="isEdit">
                <UFormField label="Firstname" class="mt-4" >
                  <UInput v-model="state.firstname" class="w-full" variant="soft" disabled/>
                </UFormField>
                <UFormField label="Middlename" class="mt-4" >
                  <UInput v-model="state.middlename" class="w-full" variant="soft" disabled/>
                </UFormField>
                <UFormField label="Lastname" class="mt-4">
                  <UInput v-model="state.lastname" class="w-full" variant="soft" disabled   />
                </UFormField>
              </div>
              <UFormField label="Role" class="mt-4">
                <UInput v-model="state.role" class="w-full" variant="soft" disabled/>
              </UFormField>
              <UFormField label="User ID" class="mt-4">
                <UInput v-model="state.userid" class="w-full" variant="soft" disabled/>
              </UFormField>
              <div v-if="userStore.user.user_type == 'Student'">
                <UFormField label="Course / Program" name="courses" class="mt-4">
                  <USelect color="secondary" variant="soft" v-model="state.course" :items="courseItems" class="w-full" :disabled="!isEdit"/>
                </UFormField>
                <UFormField label="Year Level" name="yearLevel" class="mt-4">
                  <USelect color="secondary" variant="soft" v-model="state.yearLevel" :items="yearLevelItems" class="w-full" :disabled="!isEdit"/>
                </UFormField>
                <UFormField label="Section" name="section" class="mt-4">
                  <UInput v-model="state.section" class="w-full" variant="soft" :disabled="!isEdit" :ui="{ input: 'uppercase' }"/>
                </UFormField>
              </div>
              <div v-if="userStore.user.user_type == 'Staff' || userStore.user.user_type == 'Teacher'">
                <UFormField label="Department" class="mt-4">
                  <UInput v-model="state.department" class="w-full" variant="soft" disabled />
                </UFormField>
              </div>
              <UFormField label="Username" class="mt-4">
                <UInput v-model="state.username" class="w-full" variant="soft" disabled />
              </UFormField>
              <UFormField label="Email" class="mt-4">
                <UInput v-model="state.email" class="w-full" variant="soft" disabled />
              </UFormField>
              <UFormField label="Contact" class="mt-4">
                <UInput v-model="state.contact" class="w-full" variant="soft" disabled/>
              </UFormField>
              <UFormField :error="oldPassErrMSg" v-if="isEdit" label="Current Password" name="password" class="mt-4" hint="optional">
                <UInput
                  v-model="state.oldPass"
                  color="secondary"
                  size="xl"
                  class="w-full"
                  variant="soft"
                  placeholder="Leave blank if not"
                  :type="show ? 'text' : 'password'"
                  :ui="{ trailing: 'pe-1'}"
                >
                  <template #trailing>
                    <UButton
                      color="neutral"
                      variant="link"
                      size="sm"
                      :icon="show ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                      :aria-label="show ? 'Hide password' : 'Show password'"
                      :aria-pressed="show"
                      aria-controls="password"
                      @click="show = !show"
                    />
                  </template>
                </UInput>
              </UFormField>
              <UFormField :error="newPassErrMsg" v-if="isEdit" label="New Password" name="password" class="mt-4" hint="optional">
                <UInput
                  v-model="state.newPass"
                  color="secondary"
                  size="xl"
                  class="w-full"
                  variant="soft"
                  placeholder="Leave blank if not"
                  :type="show2 ? 'text' : 'password'"
                  :ui="{ trailing: 'pe-1'}"
                >
                  <template #trailing>
                    <UButton
                      color="neutral"
                      variant="link"
                      size="sm"
                      :icon="show2 ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                      :aria-label="show2 ? 'Hide password' : 'Show password'"
                      :aria-pressed="show2"
                      aria-controls="password"
                      @click="show2 = !show2"
                    />
                  </template>
                </UInput>
              </UFormField>
              <div class="flex gap-2 justify-end">
                <UButton v-if="!isEdit" color="secondary" class="mt-4" @click="isEdit = true">Edit Profile</UButton>
                  <UButton v-if="isEdit && !isUpdating" color="error" variant="soft" class="mt-4" @click="isEdit = false">Cancel</UButton>
                  <UButton v-if="isEdit && !isUpdating" color="secondary" class="mt-4" type="submit">Update Profile</UButton>
                  <UButton v-if="isEdit && isUpdating" color="secondary" class="mt-4" loading>Updating Profile ...</UButton>
              </div>
            </UForm>
          </div>
        </div>
        </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
  import { object, string, ref as yupRef } from 'yup'

  definePageMeta({
    layout: 'user',
    middleware: 'auth'
  })

  const userStore = useUserStore()
  const supabase = useSupabaseClient()
  const toast = useToast()
  const isEdit = ref(false)
  const isUpdating = ref(false)
  const show = ref(false)
  const show2 = ref(false)
  const oldPassErrMSg = ref(null)
  const newPassErrMsg = ref(null)
  const courseItems = ref(['ABM','GAS','STEM','HUMSS','TVL','BSIT','BSCS','BSA','BSBA','BSHM','TESDA'])
  const yearLevelItems = ref(['grade 11','grade 12','1st year', '2nd year','3rd year', '4th year'])
  const isProfilePic = ref()
  const isUpdatingPic = ref(false)
  const picKey = ref(Date.now())

  const schema = object({
    section: string().trim().required('section is required').min(4, 'invalid length')
  })

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
    section: undefined,
    department: undefined,
    email: undefined,
    contact: undefined,
    oldPass: undefined,
    newPass: undefined
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
    state.section = userStore.user.section
    state.department = userStore.user.department
    state.email = userStore.user.email
    state.contact = userStore.user.contact
  }

  const updateProfilePic = async (close) => {
    isUpdatingPic.value = true
    let fileName =  userStore.user.id

   try {
    let { error } = await supabase.storage.from('profile_pictures').upload(fileName, isProfilePic.value, {
      upsert: true,
      cacheControl: '0'
    })

    if(error) throw error

    picKey.value = Date.now()
    userStore.setTimeStamp(picKey.value)

    toast.add({
      title: 'Update Successfull',
      description: 'Account has been updated successfully',
      icon: 'i-lucide-user-check',
      color: 'success'
    })

    console.log('timestamp', userStore.user)

    isProfilePic.value = null
    isUpdatingPic.value = false
    close()
   } catch (error) {
    toast.add({
      title: ' Error',
      description: 'An error occured while updating profile picture.',
      icon: 'i-lucide-user-x',
      color: 'error'
    })
    console.log('error', error)
    isProfilePic.value = null
    isUpdatingPic.value = false
   }
  }

  const updateProfile = async () => {
    oldPassErrMSg.value = false
    newPassErrMsg.value = false
    isUpdating.value = true

    try {
      if(!state.oldPass && state.newPass) return oldPassErrMSg.value = 'current password is required', isUpdating.value = false

      if(state.oldPass && !state.newPass) return newPassErrMsg.value = 'new password is required', isUpdating.value = false

      if(state.newPass && state.newPass.length < 6) return newPassErrMsg.value = '6 characters minimum required', isUpdating.value = false

      if(state.oldPass && state.newPass) {
        let { error: passDataErr } = await supabase.auth.updateUser({ password: state.newPass, current_password: state.oldPass })
        
        if(passDataErr && passDataErr.code == 'current_password_required') return oldPassErrMSg.value = 'invalid current password', isUpdating.value = false,  state.oldPass = ''

      }

      let { error } = await supabase.from('tbl_users').update({ course: state.course, year_level: state.yearLevel, section: state.section }).eq('email', state.email)

      if(error) throw error

      toast.add({
        title: 'Update Successfull',
        description: 'Account has been updated successfully',
        icon: 'i-lucide-user-check',
        color: 'success'
      })
      isUpdating.value = false
      isEdit.value = false
    } catch (error) {
      toast.add({
        title: ' Error',
        description: 'An error occured while updating profile.',
        icon: 'i-lucide-user-x',
        color: 'error'
      })
      isUpdating.value = false
      isEdit.value = false
      console.log('here',error)
    }
  }

  onMounted(() => {
    setUserInfo()
  })
  
</script>