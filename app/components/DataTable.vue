<script setup lang="ts" generic="T">
interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  align?: "left" | "center" | "right";
  width?: string;
}

interface Props {
  columns: Column[];
  data: T[];
  loading?: boolean;
  emptyText?: string;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  emptyText: "ບໍ່ມີຂໍ້ມູນ",
});

const emit = defineEmits<{
  rowClick: [item: T];
}>();

const getAlignment = (align?: string) => {
  switch (align) {
    case "center":
      return "text-center";
    case "right":
      return "text-right";
    default:
      return "text-left";
  }
};
</script>

<template>
  <div class="table-container">
    <table class="table">
      <thead>
        <tr>
          <th
            v-for="column in columns"
            :key="column.key"
            :class="getAlignment(column.align)"
            :style="column.width ? { width: column.width } : {}"
          >
            {{ column.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <!-- Loading State -->
        <tr v-if="loading">
          <td :colspan="columns.length" class="text-center py-12">
            <Icon
              name="lucide:loader-2"
              class="w-8 h-8 animate-spin text-clinic-accent mx-auto"
            />
            <p class="mt-2 text-gray-400">ກຳລັງໂຫຼດ...</p>
          </td>
        </tr>

        <!-- Empty State -->
        <tr v-else-if="data.length === 0">
          <td :colspan="columns.length" class="text-center py-12">
            <Icon
              name="lucide:inbox"
              class="w-12 h-12 text-gray-600 mx-auto mb-2"
            />
            <p class="text-gray-400">{{ emptyText }}</p>
          </td>
        </tr>

        <!-- Data Rows -->
        <tr
          v-else
          v-for="(item, index) in data"
          :key="index"
          class="cursor-pointer"
          @click="emit('rowClick', item)"
        >
          <td
            v-for="column in columns"
            :key="column.key"
            :class="getAlignment(column.align)"
          >
            <slot :name="`cell-${column.key}`" :item="item" :value="(item as Record<string, unknown>)[column.key]">
              {{ (item as Record<string, unknown>)[column.key] }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

