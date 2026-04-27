<template>
    <ion-page>
        <ion-content>
            <div class="bg-blue-50 flex items-center justify-center h-screen">
                <div class="bg-white p-6 border border-gray-100">
                <div class="flex justify-center">
                    <img src="/img/aclclogo.jpeg" class="self-center h-17"/>
                </div>
                <p class="text-3xl font-bold text-center text-gray-800 mt-4">Account Recovery</p>
                <p class="text-blue-800 text-center text-sm mt-2 mb-4">recover your account by sending otp</p>
                    <UFormField v-if="isEnterEmail" label="Email" class="w-full">
                        <UInput v-model="email" placeholder="example@gmail.com" size="xl" color="secondary" variant="subtle" class="w-full" />
                    </UFormField>
                    <UFormField v-if="isEnterOTP" label="Enter OTP">
                        <UPinInput v-model="otp" type="number" :length="8" color="secondary" />
                    </UFormField>
                    <UFormField v-if="isEnterPass" label="Enter Password">
                        <UInput v-model="password" type="password" color="secondary" variant="subtle" size="xl" class="w-full" placeholder="Enter your new password"/>
                    </UFormField>
                    <!-- <UFormField v-if="" label="Enter New Password">
                        <UInput v-model="password" type="password" />
                    </UFormField> -->
                    <div class="mt-4">
                        <UButton v-if="!loading && isEnterEmail" class="w-full flex justify-center" color="secondary" @click.once="sendOTP">Send OTP</UButton>
                        <UButton v-if="loading && isEnterEmail" class="w-full flex justify-center" color="secondary" loading>Sending OTP ...</UButton>
                        <UButton v-if="!loading && isEnterOTP" class="w-full flex justify-center" color="secondary" @click.once="verifyOTP">Verify OTP</UButton>
                        <UButton v-if="loading && isEnterOTP" class="w-full flex justify-center" color="secondary" loading>Verifying OTP ...</UButton>
                        <UButton v-if="!loading && isEnterPass" class="w-full flex justify-center" color="secondary" @click.once="changePass">Save new password</UButton>
                        <UButton v-if="loading && isEnterPass" class="w-full flex justify-center" color="secondary" loading>Saving new password ...</UButton>
                    </div>

                    <div class="flex justify-center mt-4">
                        <UButton variant="ghost" color="neutral" @click="ionRouter.navigate('/login', 'forward', 'push')" class="jus">Back to login</UButton>
                    </div>
                </div>
            </div>
        </ion-content>
    </ion-page>
</template>

<script setup>
    const supabase = useSupabaseClient()
    const ionRouter = useIonRouter()
    const toast = useToast()
    const email = ref()
    const otp = ref()
    const password = ref()
    const isEnterEmail = ref(true)
    const isEnterOTP = ref(false)
    const isEnterPass = ref(false)
    const loading = ref(false)

    const sendOTP = async () => {
        loading.value = true

        try {

            let { data, error: errorIsUserExist } = await supabase.from('tbl_users').select('email').eq('email', email.value).maybeSingle()

            if(errorIsUserExist) throw errorIsUserExist

            if(!data) {
                toast.add({
                    title: 'Email Error',
                    description: 'Email doesnt exist on database app',
                    icon: 'i-lucide-user-x',
                    color: 'error'
                })
                loading.value = false
                return
            }

            let { error } = await supabase.auth.resetPasswordForEmail(email.value)

            if(error) throw error

            toast.add({
                title: 'OTP Sent',
                description: 'OTP has been sent successfully, please check your email inbox',
                icon: 'i-lucide-user-check',
                color: 'success'
            })
            isEnterEmail.value = false
            isEnterOTP.value = true
            loading.value = false
        } catch(err) {
            toast.add({
                title: 'Server Error',
                description: 'An error occured while sending otp.',
                icon: 'i-lucide-user-x',
                color: 'error'
            })
            console.log(err)
            loading.value = false
            isEnterEmail.value = true
        }
    }

    const verifyOTP = async () => {
        loading.value = true
        try {
            let { error } = await supabase.auth.verifyOtp({
                email: email.value,
                token: String(otp.value.join('')),
                type: 'recovery'
            })

            if(error) throw error

            toast.add({
                title: 'OTP Verify',
                description: 'OTP is valid, you can now change your new password',
                icon: 'i-lucide-user-check',
                color: 'success'
            })
            loading.value = false
            isEnterOTP.value = false
            isEnterPass.value = true
        } catch(err) {
            toast.add({
                title: 'Server Error',
                description: 'An error occured while verifying otp.',
                icon: 'i-lucide-user-x',
                color: 'error'
            })
            console.log(err)
            console.log(otp.value)
            loading.value = false
        }
    }

    const changePass = async () => {
        loading.value = true
        try {

            let { error:accStatusError } = await supabase.from('tbl_users').update({ failed_attempts: 0, locked_until: null, is_locked: false }).eq('email', email.value)

            if(accStatusError) throw accStatusError

            let { error } = await supabase.auth.updateUser({
                password: password.value
            })

            if(error) throw error
            
            ionRouter.replace('/login', 'root')

            toast.add({
                title: 'Password changed!',
                description: 'Your password has been changed!',
                icon: 'i-lucide-user-check',
                color: 'success'
            })

            loading.value = false
            isEnterPass.value = false
            isEnterEmail.value = true
        } catch (error) {
             toast.add({
                title: 'Server Error',
                description: 'An error occured while changing password.',
                icon: 'i-lucide-user-x',
                color: 'error'
            })
            console.log(error)
            loading.value = false
        }
    }

    definePageMeta({
        layout: 'default'
    })
</script>