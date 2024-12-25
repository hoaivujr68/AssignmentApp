<template>
  <b-progress
    striped
    :value="percent"
    variant="success"
    height="4px"
    v-if="isShow"
    class="progress-custom-bar"
  ></b-progress>
</template>

<script>
import {EventBus} from "@/common/event-bus";

export default {
  name: "Progress",
  data() {
    return {
      isShow: false,
      percent: 0,
    };
  },
  mounted() {
    EventBus.$on("send-progress", this.listenProgress);
    EventBus.$on("close-progress", this.closeProgress);
  },
  methods: {
    listenProgress(event) {
      this.isShow = true;
      this.percent = 0;
      for (let i = 1; i <= 50; i++) {
        this.percent += 1;
      }
    },
    closeProgress(event) {
      let vm = this;
      this.percent = 100;

      function sayHello() {
        vm.isShow = false;
      }

      for (let i = 1; i <= 50; i++) {
        this.percent += 1;
      }
      setTimeout(sayHello, 500);
    },
  },
};
</script>

<style>
.progress-custom-bar {
  z-index: 999999;
  top: 0;
  left: 0;
  height: 4px;
  width: 100%;
  position: fixed;
  border-radius: 0;
  border-radius: 5px;
  background: rgba(0, 0, 0, 0.25);
  transition: color 0.2s ease;
  background-color: #fff;
  opacity: 1;
}
</style>
