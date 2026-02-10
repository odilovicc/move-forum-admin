import { defineStore } from "pinia";
import { ref } from "vue";
import { api } from "@/api/client";

export interface Speaker {
  id: number;
  name: string;
  nameEn: string;
  photo: string;
  position: string;
  bio: string;
  order: number;
}

export interface SpeakerPayload {
  name: string;
  nameEn: string;
  photo?: string;
  position: string;
  bio: string;
  order?: number;
}

export const useSpeakersStore = defineStore("speakers", () => {
  const speakers = ref<Speaker[]>([]);
  const loading = ref(false);

  async function fetchSpeakers() {
    loading.value = true;
    try {
      speakers.value = await api<Speaker[]>("/speakers");
    } finally {
      loading.value = false;
    }
  }

  async function addSpeaker(payload: SpeakerPayload) {
    const created = await api<Speaker>("/speakers", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    speakers.value.push(created);
    speakers.value.sort((a, b) => a.order - b.order);
  }

  async function updateSpeaker(id: number, payload: Partial<SpeakerPayload>) {
    const updated = await api<Speaker>(`/speakers/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });

    const index = speakers.value.findIndex((speaker) => speaker.id === id);
    if (index !== -1) {
      speakers.value[index] = updated;
      speakers.value.sort((a, b) => a.order - b.order);
    }
  }

  async function deleteSpeaker(id: number) {
    await api<Speaker>(`/speakers/${id}`, { method: "DELETE" });
    speakers.value = speakers.value.filter((speaker) => speaker.id !== id);
  }

  return {
    speakers,
    loading,
    fetchSpeakers,
    addSpeaker,
    updateSpeaker,
    deleteSpeaker,
  };
});
