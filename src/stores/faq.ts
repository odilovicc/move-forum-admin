import { defineStore } from "pinia";
import { ref } from "vue";
import { api } from "@/api/client";

export interface FaqItem {
  id: number;
  question: string;
  answer: string;
  questionRu?: string;
  answerRu?: string;
  questionUz?: string;
  answerUz?: string;
  questionEn?: string;
  answerEn?: string;
  order: number;
}

export interface FaqPayload {
  question?: string;
  answer?: string;
  questionRu: string;
  answerRu: string;
  questionUz?: string;
  answerUz?: string;
  questionEn?: string;
  answerEn?: string;
  order?: number;
}

export const useFaqStore = defineStore("faq", () => {
  const items = ref<FaqItem[]>([]);
  const loading = ref(false);

  async function fetchFaq() {
    loading.value = true;
    try {
      items.value = await api<FaqItem[]>("/faq");
    } finally {
      loading.value = false;
    }
  }

  async function addItem(payload: FaqPayload) {
    const created = await api<FaqItem>("/faq", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    items.value.push(created);
    items.value.sort((a, b) => a.order - b.order);
  }

  async function updateItem(id: number, payload: Partial<FaqPayload>) {
    const updated = await api<FaqItem>(`/faq/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });

    const index = items.value.findIndex((item) => item.id === id);
    if (index !== -1) {
      items.value[index] = updated;
      items.value.sort((a, b) => a.order - b.order);
    }
  }

  async function deleteItem(id: number) {
    await api<FaqItem>(`/faq/${id}`, { method: "DELETE" });
    items.value = items.value.filter((item) => item.id !== id);
  }

  async function reorder(fromIndex: number, toIndex: number) {
    const nextItems = [...items.value];
    const moved = nextItems.splice(fromIndex, 1)[0];

    if (!moved) {
      return;
    }

    nextItems.splice(toIndex, 0, moved);
    items.value = nextItems;

    const ids = items.value.map((item) => item.id);
    items.value = await api<FaqItem[]>("/faq/reorder/batch", {
      method: "PUT",
      body: JSON.stringify({ ids }),
    });
  }

  return {
    items,
    loading,
    fetchFaq,
    addItem,
    updateItem,
    deleteItem,
    reorder,
  };
});
