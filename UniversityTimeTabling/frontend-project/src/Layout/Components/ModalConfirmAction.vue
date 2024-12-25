<template>
    <b-modal :id="idModal" :title="titleModal" :no-close-on-backdrop="noCloseOnBackdrop" :hide-footer="hideFooter"  @hide="$emit('cancelAction')">
      <slot name="body">
      </slot>
      <slot name="footer">
        <div class="row text-center justify-content-end">
            <b-button
              variant="outline-success"
              class="btn btn-outline-success mx-2"
              @click.prevent="$emit('confirmAction')"
              :disabled="loading"
            >
              <i v-show="loading" class="fa fa-spinner fa-spin mr-2"/> Xác nhận
            </b-button>
            <b-button variant="outline-secondary" :disabled="loading" @click="$emit('cancelAction')">Hủy bỏ</b-button>
        </div>
      </slot>
    </b-modal>
</template>

<script>
export default {
  props: {
    idModal: {
      type: String
    },
    titleModal: {
      type: String
    },
    noCloseOnBackdrop: {
      type: Boolean,
      default: true
    },
    hideFooter: {
      type: Boolean,
      default: true
    },
    isDisabled: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    }
  }
}
</script>
