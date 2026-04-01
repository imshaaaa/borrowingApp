<template>
  <IonPage>
    <IonContent>
  <div class="bg-blue-50 h-lvh overflow-y-auto px-6 py-4">
    <div class="bg-white p-6 border border-gray-100">
      <div class="flex justify-center">
        <img src="/img/aclclogo.jpeg" class="self-center h-17"/>
      </div>
      <p class="text-3xl font-bold text-center text-gray-800 mt-4">Create an Account</p>
      <p class="text-blue-800 text-center text-sm mt-2">Choose your role and fill out the form to register.</p>
      <UForm :schema="schema" :state="state" @submit='onSubmit' ref="formRef">
        <div class="mt-6">
          <UFormField label="Register as" name="registerAs">
            <USelect color="secondary" variant="subtle" v-model="state.registerAs" :items="regAsItems" size="xl" class="w-full"/>
          </UFormField>
          <UFormField label="Frstname" name="firstname" class="mt-4">
            <UInput v-model="state.firstname" color="secondary" variant="subtle" size="xl" class="w-full ring-blue-600" placeholder="John"/>
          </UFormField>
          <UFormField label="Middlename" name="middlename" class="mt-4">
            <UInput v-model="state.middlename" color="secondary" variant="subtle" size="xl" class="w-full ring-blue-600" placeholder=""/>
          </UFormField>
          <UFormField label="Lastname" name="lastname" class="mt-4">
            <UInput v-model="state.lastname" color="secondary" variant="subtle" size="xl" class="w-full ring-blue-600" placeholder="Doe"/>
          </UFormField>
          <UFormField label="Teacher/Staff ID" name="teacherStaffID" class="mt-4" v-if="state.registerAs == 'Teacher' || state.registerAs == 'Staff'">
            <UInput v-model="state.teacherStaffID" v-maska="teacherStaffIdMask" color="secondary" variant="subtle" size="xl" class="w-full ring-blue-600" placeholder="00-00001"/>
          </UFormField>
          <UFormField label="Student ID" name="studentID" class="mt-4" v-if="state.registerAs == 'Student'">
            <UInput v-model="state.studentID" v-maska="studentIdMask" color="secondary" variant="subtle" size="xl" class="w-full ring-blue-600" placeholder="C01-0-0001-MAN123"/>
          </UFormField>
          <UFormField label="Course / Program" name="courses" class="mt-4" v-if="state.registerAs == 'Student'">
            <USelect color="secondary" variant="subtle" v-model="state.courses" :items="courseItems" size="xl" class="w-full" placeholder="Select course/strand"/>
          </UFormField>
          <UFormField label="Year Level" name="yearLevel" class="mt-4" v-if="state.registerAs == 'Student'">
            <USelect color="secondary" variant="subtle" v-model="state.yearLevel" :items="yearLevelItems" size="xl" class="w-full" placeholder="Select year level"/>
          </UFormField>
          <UFormField label="Department" name="department" class="mt-4" v-if="state.registerAs == 'Teacher'">
            <USelect color="secondary" variant="subtle" v-model="state.department" :items="teachersDepartment" size="xl" class="w-full" placeholder="Select department"/>
          </UFormField>
          <UFormField label="Department" name="department" class="mt-4" v-if="state.registerAs == 'Staff'">
            <USelect color="secondary" variant="subtle" v-model="state.department" :items="staffDepartment" size="xl" class="w-full" placeholder="Select department"/>
          </UFormField>
          <UFormField label="Contact" name="contact" class="mt-4">
            <UInput type="tel" v-model="state.contact" color="secondary" variant="subtle" size="xl" class="w-full ring-blue-600" placeholder="Contact no."/>
          </UFormField>
          <UFormField label="Email" name="email" :error="isEmailError" class="mt-4">
            <UInput v-model="state.email" color="secondary" variant="subtle" size="xl" class="w-full ring-blue-600" placeholder="Email"/>
          </UFormField>
          <UFormField label="Username" name="username" :error="isUsernameError" class="mt-4">
            <UInput v-model="state.username" color="secondary" variant="subtle" size="xl" class="w-full ring-blue-600" placeholder="Username"/>
          </UFormField>
          <UFormField label="Password" name="password" class="mt-4">
            <UInput
              v-model="state.password"
              color="secondary"
              size="xl"
              class="w-full"
              variant="subtle"
              placeholder="Password"
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
          <UFormField label="Confirm Password" name="confirmPass" class="mt-4">
            <UInput
              v-model="state.confirmPass"
              color="secondary"
              size="xl"
              class="w-full"
              variant="subtle"
              placeholder="Confirm password"
              :type="showCP ? 'text' : 'password'"
              :ui="{ trailing: 'pe-1'}"
            >
              <template #trailing>
                <UButton
                  color="neutral"
                  variant="link"
                  size="sm"
                  :icon="showCP ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                  :aria-label="showCP ? 'Hide password' : 'Show password'"
                  :aria-pressed="showCP"
                  aria-controls="password"
                  @click="showCP = !showCP"
                />
              </template>
            </UInput>
          </UFormField>
          <UButton v-if="!isSignUp" type="submit" color="secondary" size="xl" class="flex justify-center w-full mt-6">Sign up</UButton>
          <UButton v-if="isSignUp" color="secondary" size="xl" class="w-full mt-6 flex justify-center" loading>Creating Account...</UButton>
          <p class="text-center text-sm mt-4">Already have an account? <span @click="toLogin" class='text-blue-600'>Login</span></p>
        </div>
      </UForm>
    </div>
  </div>
  </IonContent>
  </IonPage>
</template>

<script setup>
  definePageMeta({
    supabase: {
      auth: false
    }
  })
  
  import { object, string, ref as yupRef } from 'yup'
  import { vMaska } from 'maska/vue'
  
  const supabase = useSupabaseClient()
  const ionRouter = useIonRouter()
  const toast = useToast()
  const show = ref(false)
  const showCP = ref(false)
  const formRef = ref(null)
  const isSignUp = ref(false)
  const isEmailError = ref(null)
  const isUsernameError = ref(null)
  
  const regAsItems = ref(['Student', 'Teacher','Staff'])
  const courseItems = ref(['ABM','GAS','STEM','HUMSS','TVL','BSIT','BSCS','BSA','BSBA','BSHM','TESDA'])
  const yearLevelItems = ref(['grade 11','grade 12','1st year', '2nd year','3rd year', '4th year'])
  const department = ref(['Senior High School','Computer Studies','Hospitality','General Education','Business & Accountancy','Records Section /Registrar','Finance','Admission','Guidance','Human Resources','Library Service Scholarship'])
  const teachersDepartment = ref(['Senior High School','Computer Studies','Hospitality','General Education','Business & Accountancy'])
  const staffDepartment = ref(['Records Section /Registrar','Finance','Admission','Guidance','Human Resources','Library Service Scholarship'])
  
  const studentIdMask = {
    mask: 'A##-##-####-AAA###',
    eager: true,
    tokens: {
      'A': { pattern: /[A-Z]/, uppercase: true },
      '#': { pattern: /[0-9]/ }
    }
  }
  
  const teacherStaffIdMask = {
    mask: '##-#####',
    eager: true
  }
  
  const schema = object({
    registerAs: string().trim().required('role is required'),
    firstname: string().trim().min(3, 'must be atleast 3 characters').required('firstname is required'),
    middlename: string().trim().min(3, 'must be atleast 3 characters').required('middlename is required'),
    lastname: string().trim().min(3, 'must be atleast 3 characters').required('lastname is required'),
    teacherStaffID: string().when('registerAs', {
      is: (val) => val === 'Teacher' || val === 'Staff',
      then: (schema) => schema.trim().min(7, 'must be 7 characters').required('teacher/staff id is required'),
      otherwise: (schema) => schema.strip()
    }),
    studentID: string().when('registerAs', {
      is: 'Student',
      then: (schema) => schema.trim().min(15, 'must be 15 characters').required("studend id is required"),
      otherwise: (schema) => schema.strip()
    }),
    courses: string().when('registerAs', {
      is: 'Student',
      then: (schema) => schema.trim().required('course is required'),
      otherwise: (schema) => schema.strip()
    }),
    yearLevel: string().when('registerAs', {
      is: 'Student',
      then: (schema) => schema.trim().required('year level is required'),
      otherwise: (schema) => schema.strip()
    }),
    department: string().when('registerAs', {
      is: (val) => val === 'Teacher' || val === 'Staff',
      then: (schema) => schema.trim().required('department is required'),
      otherwise: (schema) => schema.strip()
    }),
    contact: string().trim().required('Contact is required').matches(/^09\d{9}$/,'Must be a valid contact').length(11, 'Must be exactly 11 digits'),
    email: string().trim().required('email is required').email('please enter a valid email'),
    username: string().trim().required("username is required"),
    password: string().min(6,'Minimum of 6 characters').required("password is required"),
    confirmPass: string().required('Please confirm your password').oneOf([yupRef('password')], "password doesn't match")
  })
  
  const state = reactive({
    registerAs: "Student",
    firstname: undefined,
    middlename: undefined,
    lastname: undefined,
    studentID: undefined,
    teacherStaffID: undefined,
    courses: undefined,
    yearLevel: undefined,
    department: undefined,
    contact: undefined,
    email: undefined,
    username: undefined,
    password: undefined,
    confirmPass: undefined
  })
  
  const onSubmit = async () => {
    isEmailError.value = null
    isUsernameError.value = null
    isSignUp.value = await true
    try {
      const { data: existingUser } = await supabase.from('tbl_users').select('username').eq('username', state.username).maybeSingle()

      if(existingUser) {
        isUsernameError.value = 'Username is already taken'
        isSignUp.value = false
        return
      }
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: state.email,
        password: state.password
      })
      
      if(authError) {
        if(authError.code = "user_already_exists") {
          isEmailError.value = "Email is already exists"
          isSignUp.value = false
          return
        }
      }
      
      if(authData.user) {
        const { error: dbError } = await supabase.from('tbl_users').insert({
          user_uid: authData.user.id,
          user_type: state.registerAs,
          firstname: state.firstname,
          middlename: state.middlename,
          lastname: state.lastname,
          student_id: state.studentID,
          employee_id: state.teacherStaffID,
          course: state.courses,
          year_level: state.yearLevel,
          department: state.department,
          contact_number: state.contact,
          email: state.email,
          username: state.username,
          status: 'Pending'
        })
        if(dbError) {
          toast.add({
            title: 'Register Error',
            description: 'An error occured while creating account.',
            icon: 'i-lucide-user-x',
            color: 'error'
          })
          isSignUp.value = false
        }
          toast.add({
            title: 'Account created successfully',
            description: 'Pending for admin approval. redirecting...',
            icon: 'i-lucide-user-check',
            color: 'success'
          })
        setTimeout(() => {
          toLogin()
        }, 2000)
        isSignUp.value = await false
      }
    } catch(err) {
      console.log(err)
      isSignUp.value = false
    }
  }
  
  const resetForm = () => {
    formRef.value?.clear()
    //state.registerAs = "Student"
    state.firstname = ""
    state.middlename = ""
    state.lastname = ""
    state.studentID = ""
    state.teacherStaffID = ""
    state.courses = ""
    state.yearLevel = ""
    state.department = ""
    state.contact = ""
    state.email = ""
    state.username = ""
    state.password = ""
    state.confirmPass = ""
  }
  
  const toLogin = () => {
    resetForm()
    state.registerAs = "Student"
    ionRouter.navigate('/login', 'forward', 'push')
  }

  watch(() => state.registerAs, (val) => {
    resetForm()
  })
</script>