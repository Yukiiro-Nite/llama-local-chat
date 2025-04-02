import { FormEvent, useCallback, useMemo } from "react"
import { View } from "../../components/View/View"
import { AppViews, useAppStore } from "../../stores/AppStore"
import { useChatStore } from "../../stores/ChatStore"
import "./ChatSettings.css"

export interface ChatSettingsFormElements extends HTMLFormControlsCollection {
  title: HTMLInputElement
  host: HTMLInputElement
  model: HTMLInputElement
  systemMessage: HTMLTextAreaElement
  historyLength: HTMLInputElement
}

export const ChatSettings = () => {
  const setView = useAppStore((state) => state.setView)
  const {chats, currentChatId, updateChatSettings} = useChatStore()
  const settings = useMemo(() => {
    return currentChatId
      ? chats[currentChatId]?.chatSettings
      : undefined
  }, [chats, currentChatId])
  const handleGoBack = useCallback(() => {
    setView(AppViews.chatView)
  }, [setView])
  const handleSettingsSave = useCallback((event: FormEvent) => {
    event.preventDefault()

    if (!currentChatId) {
      console.error('No chat id set, can not update settings')
      return
    }

    const target = event.target as HTMLFormElement
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
      <form key={currentChatId} onSubmit={handleSettingsSave}>
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
        <label>
          <span>Model</span>
          <input
            name="model"
            defaultValue={settings?.model}
          ></input>
        </label>
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
        <button>💾 Save</button>
      </form>
    </View>
  )
}