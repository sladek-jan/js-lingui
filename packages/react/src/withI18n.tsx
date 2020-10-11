import * as React from "react"
import hoistStatics from "hoist-non-react-statics"
import { I18n as I18nType } from "@lingui/core"
// TODO uncomment
//import { useLingui } from "./I18nProvider"
import { useLingui } from "@lingui/react"

type withI18nOptions = {
  update?: boolean,
  withRef?: boolean,
  withHash?: boolean
}

type withI18nProps = {
  i18n: I18nType
}

function getComponentDisplayName(Component) {
  return Component.displayName ||
    Component.name || (typeof Component === 'string' ?
      (Component.length > 0 ? Component : 'UnknownComponent') : 'UnknownComponent');
}

export function withI18n(options: withI18nOptions = {}) {
  return function <P, C extends React.ComponentType<P>>(
    WrappedComponent: C
  ): React.ComponentType<Exclude<P, withI18nProps>> {
    if (process.env.NODE_ENV !== "production") {
      if (typeof options === "function" || React.isValidElement(options)) {
        console.warn(
          "withI18n([options]) takes options as a first argument, " +
          "but received React component itself. Without options, the Component " +
          "should be wrapped as withI18n()(Component), not withI18n(Component)."
        )
      }
    }

    const { withRef = false } = options
    console.log('creating WithI18n')

    function WithI18n({ props }: React.PropsWithChildren<any>) {
      const { i18n } = useLingui()
      console.log('passing i18n: ', i18n)
      return (
        <WrappedComponent {...props} i18n={i18n} />
      )
    }
    WithI18n.displayName = `withI18n(${getComponentDisplayName(WrappedComponent)})`
    withRef && (WithI18n.wrappedInstance = WrappedComponent)

    return hoistStatics(WithI18n, WrappedComponent)
  }

}

export type { withI18nProps }
