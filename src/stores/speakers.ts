import { defineStore } from "pinia";
import { ref } from "vue";
import { api } from "@/api/client";

export interface Speaker {
  id: number;
  name: string;
  nameRu?: string;
  nameUz?: string;
  nameEn: string;
  photo: string;
  photoPosition: string;
  position: string;
  positionRu?: string;
  positionUz?: string;
  positionEn?: string;
  bio: string;
  bioRu?: string;
  bioUz?: string;
  bioEn?: string;
  order: number;
}

export interface SpeakerPayload {
  name?: string;
  nameRu: string;
  nameUz?: string;
  nameEn: string;
  photo?: string;
  photoPosition?: string;
  position?: string;
  positionRu: string;
  positionUz?: string;
  positionEn?: string;
  bio?: string;
  bioRu: string;
  bioUz?: string;
  bioEn?: string;
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
    return created;
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

    return updated;
  }

  async function deleteSpeaker(id: number) {
    await api<Speaker>(`/speakers/${id}`, { method: "DELETE" });
    speakers.value = speakers.value.filter((speaker) => speaker.id !== id);
  }

  async function reorder(fromIndex: number, toIndex: number) {
    const next = [...speakers.value];
    const moved = next.splice(fromIndex, 1)[0];
    if (!moved) {
      return;
    }

    next.splice(toIndex, 0, moved);
    speakers.value = next;

    const ids = speakers.value.map((speaker) => speaker.id);
    speakers.value = await api<Speaker[]>("/speakers/reorder/batch", {
      method: "PUT",
      body: JSON.stringify({ ids }),
    });
  }

  async function uploadPhoto(id: number, file: File) {
    const formData = new FormData();
    formData.append("file", file);
    const updated = await api<Speaker>(`/speakers/${id}/photo`, {
      method: "POST",
      body: formData,
    });

    const index = speakers.value.findIndex((speaker) => speaker.id === id);
    if (index !== -1) {
      speakers.value[index] = updated;
    }

    return updated;
  }

  return {
    speakers,
    loading,
    fetchSpeakers,
    addSpeaker,
    updateSpeaker,
    deleteSpeaker,
    reorder,
    uploadPhoto,
  };
});
