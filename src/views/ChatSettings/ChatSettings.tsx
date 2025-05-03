import { FormEvent, useCallback, useMemo, useRef } from "react"
import { View } from "../../components/View/View"
import { AppViews, useAppStore } from "../../stores/AppStore"
import { useChatStore } from "../../stores/ChatStore"
import "./ChatSettings.css"
import { ModelSelect } from "../../components/ModelSelect/ModelSelect"

export interface ChatSettingsFormElements extends HTMLFormControlsCollection {
  title: HTMLInputElement
  host: HTMLInputElement
  model: HTMLInputElement
  systemMessage: HTMLTextAreaElement
  historyLength: HTMLInputElement
}

export const ChatSettings = () => {
  const setView = useAppStore((state) => state.setView)
  const formRef = useRef<HTMLFormElement>(null)
  const {chats, currentChatId, updateChatSettings, clearChatHistory} = useChatStore()
  const hasHistory = currentChatId
    ? chats[currentChatId]?.chatHistory?.length > 0
    : false
  const settings = useMemo(() => {
    return currentChatId
      ? chats[currentChatId]?.chatSettings
      : undefined
  }, [chats, currentChatId])
  const handleGoBack = useCallback(() => {
    setView(AppViews.chatView)
  }, [setView])
  
  const handleSettingsSave = useCallback(() => {
    if (!formRef.current) return

    if (!currentChatId) {
      console.error('No chat id set, can not update settings')
      return
    }

    const target = formRef.current
    const elements = target.elements as ChatSettingsFormElements
    const settingsUpdate = {
      title: elements.title.value,
      host: elements.host.value,
      model: elements.model.value,
      systemMessage: elements.systemMessage.value,
      historyLength: parseInt(elements.historyLength.value)
    }

    updateChatSettings(currentChatId, settingsUpdate)
  }, [currentChatId, updateChatSettings])

  const handleSubmit = useCallback(function (event: FormEvent) {
    event.preventDefault()
    if (!formRef.current) return

    handleSettingsSave()
  }, [handleSettingsSave])

  const handleSetModel = useCallback((model: string) => {
    if (!currentChatId) {
      return
    }
    updateChatSettings(currentChatId, { model })
  }, [currentChatId, updateChatSettings])

  const clearHistory = useCallback(() => {
    if (!currentChatId) {
      return
    }
    clearChatHistory(currentChatId)
  }, [clearChatHistory, currentChatId])

  return (
    <View
      type={AppViews.chatSettings}
      className="ChatSettings"
    >
      <header>
        <button
          onClick={handleGoBack}
          title="Go back"
        >🔙</button>
        <h1>Chat Settings</h1>
      </header>
      <form
        key={currentChatId}
        onSubmit={handleSubmit}
        onChange={handleSettingsSave}
        ref={formRef}
      >
        <label>
          <span>Title</span>
          <input
            name="title"
            defaultValue={settings?.title}
          ></input>
        </label>
        <label>
          <span>Host</span>
          <input
            name="host"
            defaultValue={settings?.host}
          ></input>
        </label>
        <ModelSelect
          modelSetting={settings?.model}
          hostSetting={settings?.host}
          setModel={handleSetModel}
        ></ModelSelect>
        <label>
          <span>System Message</span>
          <textarea
            name="systemMessage"
            rows={5}
            defaultValue={settings?.systemMessage}
          ></textarea>
        </label>
        <label>
          <span>History Length</span>
          <input
            name="historyLength"
            type="number"
            defaultValue={settings?.historyLength}
          ></input>
        </label>
        <button
          className="ClearHistoryButton"
          type="button"
          onClick={clearHistory}
          disabled={!hasHistory}
        >
          🗑️ Clear History
        </button>
      </form>
    </View>
  )
}