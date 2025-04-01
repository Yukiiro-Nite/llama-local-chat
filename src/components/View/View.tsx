import classNames from "classnames"
import { AppViewType, useAppStore } from "../../stores/AppStore"
import "./View.css"

export interface ViewProps extends React.PropsWithChildren {
  type: AppViewType
  className?: string
}

export const View = (props: ViewProps) => {
  const {
    type,
    className,
    children
  } = props
  const view = useAppStore((state) => state.view)
  const viewClasses = classNames(
    "View",
    className,
    { show: type === view }
  )
  
  return (
    <section className={viewClasses}>
      {children}
    </section>
  )
}