import * as React from "react"
import { render, cleanup } from "@testing-library/react"

import { withI18n } from "./withI18n"
import { mockEnv, mockConsole } from './mocks'
import { I18nProvider } from "@lingui/react"
import { setupI18n } from "@lingui/core"
import TestRenderer from 'react-test-renderer';

const i18nMock = setupI18n()
const MockI18nProvider = ({ children }) => <I18nProvider i18n={i18nMock}>{children}</I18nProvider>

describe("withI18n", function () {

  afterEach(cleanup)

  it("should warn if called incorrectly", function () {
    const wrongMount = () => {
      // @ts-expect-error
      const Component = withI18n(() => <span />)
      // Catch the React error. It will blow up user app, but at least they get
      // the warning about the cause.
      try {
        // @ts-expect-error
        render(<Component />)
      } catch (e) { }
    }

    mockEnv("production", () => {
      mockConsole(console => {
        wrongMount()
        expect(console.warn).not.toBeCalled()
      })
    })

    mockEnv("development", () => {
      mockConsole(console => {
        wrongMount()
        expect(console.warn).toBeCalledWith(
          expect.stringContaining("withI18n([options]) takes options")
        )
      })
    })
  })

  it("should assign displayName", function () {
    class FancyComponent extends React.Component {
    }
    const wrapper = <MockI18nProvider>{withI18n()(FancyComponent)}</MockI18nProvider>
    expect(wrapper.props.children.displayName).toBe('withI18n(FancyComponent)')
  })

  it("should hoist statics from wrapped component", function () {
    class Component extends React.Component {
      static myProp = 24
      static myMethod = () => 42
    }

    const wrapper = <MockI18nProvider>{withI18n()(Component)}</MockI18nProvider>
    const wrapped = wrapper.props.children
    expect(wrapped.myProp).toBeDefined()
    expect(wrapped.myProp).toEqual(24)
    expect(wrapped.myMethod).toBeDefined()
    expect(wrapped.myMethod()).toEqual(42)

    function StatelessComponent() {
      return <span />
    }
    StatelessComponent.myProp = 24
    StatelessComponent.myMethod = () => 42

    const wrapperStateless = <MockI18nProvider>{withI18n()(StatelessComponent)}</MockI18nProvider>
    const wrappedStateless = wrapperStateless.props.children
    expect(wrappedStateless.myProp).toBeDefined()
    expect(wrappedStateless.myProp).toEqual(24)
    expect(wrappedStateless.myMethod).toBeDefined()
    expect(wrappedStateless.myMethod()).toEqual(42)
  })

  class AnotherFancyComponent extends React.Component {
  }

  it("should hold ref to wrapped instance when withRef is enabled", function () {
    const wrapper = <MockI18nProvider>{withI18n({ withRef: true })(AnotherFancyComponent)}</MockI18nProvider>
    const wrapped = wrapper.props.children

    expect(wrapped.wrappedInstance).not.toBeNull()
    expect(wrapped.wrappedInstance.name).toBe('AnotherFancyComponent')
  })

  it("should not hold ref to wrapped instance when withRef is disabled", function () {
    const wrapper = <MockI18nProvider>{withI18n({ withRef: false })(AnotherFancyComponent)}</MockI18nProvider>
    const wrapped = wrapper.props.children
    expect(wrapped.wrappedInstance).toBeUndefined()
  })
})
