import { defineStore } from 'pinia'

export const useUserStore = defineStore('userStore', {
  state: () => ({
    user: {
      id: null,
      contact: null,
      course: null,
      department: null,
      email: null,
      fullname: null,
      firstname: null,
      middlename: null,
      lastname: null,
      status: null,
      user_type: null,
      username: null,
      year_level: null,
      section: null,
      pic_time_stamp: null
    }
  }),
  actions: {
    setUserData(data) {
      
      const { admin_id, employee_id, student_id, contact_number, course, department, email, firstname, middlename, lastname, status, user_type, username, year_level, section } = data

      this.user = {
        id: admin_id || employee_id || student_id || null,
        contact: contact_number,
        course: course || null,
        department: department,
        email: email,
        fullname: `${firstname} ${lastname}`,
        firstname: firstname,
        middlename: middlename,
        lastname: lastname,
        status: status,
        user_type: user_type,
        username: username,
        year_level: year_level || null,
        section: section || null,
       
      }
    },

    setTimeStamp(timeStamp) {
      this.user.pic_time_stamp = timeStamp
    }
  }
})