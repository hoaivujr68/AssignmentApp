<template>
  <svg
    :style="{'width': width}"
    width="21"
    height="20"
    viewBox="0 0 21 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M11.2791 8.7522V9.0022H11.5291H20.0312V10.9978H11.5291H11.2791V11.2478V19.75H9.28345V11.2478V10.9978H9.03345H0.53125V9.0022H9.03345H9.28345V8.7522V0.25H11.2791V8.7522Z"
      fill="currentcolor"
      stroke="white"
      stroke-width="0.5"
    />
  </svg>
</template>
<script>
export default {
  props: {
    width: {
      default: '21',
      type: String
    }
  }
}
</script>
