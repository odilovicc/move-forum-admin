<script setup lang="ts">
import { watch } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import HardBreak from '@tiptap/extension-hard-break'
import {
  Bold, Italic, List, ListOrdered, Link2, Unlink, CornerDownLeft
} from 'lucide-vue-next'

const model = defineModel<string>()

defineProps<{
  placeholder?: string
  disabled?: boolean
}>()

const editor = useEditor({
  extensions: [
    StarterKit.configure({ hardBreak: false }),
    HardBreak.extend({
      addKeyboardShortcuts() {
        return {
          'Shift-Enter': () => this.editor.commands.setHardBreak(),
        }
      },
    }),
    Link.configure({ openOnClick: false }),
  ],
  content: model.value ?? '',
  editable: true,
  onUpdate({ editor }) {
    model.value = editor.getHTML()
  },
})

watch(model, (val) => {
  if (editor.value && val !== editor.value.getHTML()) {
    editor.value.commands.setContent(val ?? '', false)
  }
})

function setLink() {
  const prev = editor.value?.getAttributes('link').href ?? ''
  const url = window.prompt('URL:', prev)
  if (url === null) return
  if (url === '') {
    editor.value?.chain().focus().extendMarkRange('link').unsetLink().run()
    return
  }
  editor.value?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
}
</script>

<template>
  <div class="rounded-lg border border-input bg-background shadow-xs overflow-hidden focus-within:ring-2 focus-within:ring-ring">
    <!-- Toolbar -->
    <div v-if="editor" class="flex flex-wrap gap-0.5 border-b border-input px-2 py-1.5 bg-muted/40">
      <button
        type="button"
        :class="['p-1 rounded hover:bg-accent transition-colors', editor.isActive('bold') ? 'bg-accent text-accent-foreground' : 'text-muted-foreground']"
        @click="editor.chain().focus().toggleBold().run()"
        title="Жирный"
      >
        <Bold class="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        :class="['p-1 rounded hover:bg-accent transition-colors', editor.isActive('italic') ? 'bg-accent text-accent-foreground' : 'text-muted-foreground']"
        @click="editor.chain().focus().toggleItalic().run()"
        title="Курсив"
      >
        <Italic class="w-3.5 h-3.5" />
      </button>
      <div class="w-px bg-border mx-0.5 self-stretch" />
      <button
        type="button"
        :class="['p-1 rounded hover:bg-accent transition-colors', editor.isActive('bulletList') ? 'bg-accent text-accent-foreground' : 'text-muted-foreground']"
        @click="editor.chain().focus().toggleBulletList().run()"
        title="Маркированный список"
      >
        <List class="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        :class="['p-1 rounded hover:bg-accent transition-colors', editor.isActive('orderedList') ? 'bg-accent text-accent-foreground' : 'text-muted-foreground']"
        @click="editor.chain().focus().toggleOrderedList().run()"
        title="Нумерованный список"
      >
        <ListOrdered class="w-3.5 h-3.5" />
      </button>
      <div class="w-px bg-border mx-0.5 self-stretch" />
      <button
        type="button"
        class="p-1 rounded hover:bg-accent transition-colors text-muted-foreground"
        @click="editor.chain().focus().setHardBreak().run()"
        title="Перенос строки (br)"
      >
        <CornerDownLeft class="w-3.5 h-3.5" />
      </button>
      <div class="w-px bg-border mx-0.5 self-stretch" />
      <button
        type="button"
        :class="['p-1 rounded hover:bg-accent transition-colors', editor.isActive('link') ? 'bg-accent text-accent-foreground' : 'text-muted-foreground']"
        @click="setLink"
        title="Добавить ссылку"
      >
        <Link2 class="w-3.5 h-3.5" />
      </button>
      <button
        v-if="editor.isActive('link')"
        type="button"
        class="p-1 rounded hover:bg-accent transition-colors text-muted-foreground"
        @click="editor.chain().focus().unsetLink().run()"
        title="Убрать ссылку"
      >
        <Unlink class="w-3.5 h-3.5" />
      </button>
    </div>

    <!-- Editor content -->
    <EditorContent
      :editor="editor"
      class="prose prose-sm max-w-none px-3 py-2 min-h-[100px] text-sm focus:outline-none [&_.tiptap]:outline-none [&_.tiptap]:min-h-[100px]"
    />
  </div>
</template>

<style scoped>
:deep(.tiptap) {
  outline: none;
  min-height: 100px;
}
:deep(.tiptap p) {
  margin: 0 0 0.25rem;
}
:deep(.tiptap ul),
:deep(.tiptap ol) {
  padding-left: 1.25rem;
  margin: 0.25rem 0;
}
:deep(.tiptap ul) {
  list-style-type: disc;
}
:deep(.tiptap ol) {
  list-style-type: decimal;
}
:deep(.tiptap a) {
  color: var(--color-primary);
  text-decoration: underline;
}
</style>
