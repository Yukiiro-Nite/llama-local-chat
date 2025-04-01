import './App.css'
import { ChatSettings } from './views/ChatSettings/ChatSettings'
import { ChatView } from './views/ChatView/ChatView'
import { LoadChat } from './views/LoadChat/LoadChat'
import { StartMenu } from './views/StartMenu/StartMenu'

export const App = () => {

  return (
    <main>
      <StartMenu />
      <ChatView />
      <ChatSettings />
      <LoadChat />
    </main>
  )
}
