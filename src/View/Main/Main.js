import Hello from '@/Component/Hello/Hello.vue'
import user from '@/Image/user.png'

export default {
  name: 'MainView',
  components: {
    Hello
  },
  data () {
    return {
      user: user,
    }
  }
}
