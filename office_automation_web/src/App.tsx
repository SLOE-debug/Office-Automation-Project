import { Vue } from "vue-class-component";
import '@/assets/css/App.less';

export default class App extends Vue {
  render() {
    return <router-view />;
  }
}
