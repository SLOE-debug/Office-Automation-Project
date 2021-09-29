import { Vue } from "vue-class-component";

export default class Home extends Vue {
  render() {
    return (
      <>
        {this.$Controls.map((m: string) => {
          let control = this.$.appContext.components[m];
          return <control msg={"测试"} />;
        })}
      </>
    );
  }
}
