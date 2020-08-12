/* eslint-disable no-console */
import React, { FC, useState } from 'react'
import { injectIntl, WrappedComponentProps, defineMessages } from 'react-intl'
import { compose, graphql, useMutation, useQuery } from 'react-apollo'
import {
  Tabs,
  Tab,
  Layout,
  PageBlock,
  PageHeader,
  Button,
  Spinner,
  Modal,
  IconCheck,
  IconDeny,
  Progress,
} from 'vtex.styleguide'
import { useRuntime } from 'vtex.render-runtime'
import sessionQuery from 'vtex.store-resources/QuerySession'

import Colors from './components/Colors'
import LayoutSettings from './components/Layout'
import Javascript from './components/Javascript'
import Css from './components/Css'
import History from './components/History'
import saveMutation from './mutations/saveConfiguration.gql'
import GET_LAST from './queries/getLast.gql'

const messages = defineMessages({
  title: {
    id: 'admin/checkout-ui.title',
    defaultMessage: 'Checkout custom interface',
  },
})

const defaultConfiguration = {
  colors: {
    base: '#f4f2f2',
    baseInverted: '#FF0000',
    actionPrimary: '#1a73e8',
    actionPrimaryDarken: '#1d63be',
    actionSecondary: '#FF0000',
    emphasis: '#FF0000',
    disabled: '#999999',
    success: '#2fba2d',
    successDarken: '#269e24',
    successFaded: '#beffa5',
    danger: '#ff4c4c',
    dangerFaded: '#ffe6e6',
    warning: '#ffb100',
    warningFaded: '#fff6e0',
    muted1: '#323232',
    muted2: '#676767',
    muted3: '#999999',
    muted4: '#cbcbcb',
    muted5: '#eeeeee',
    muted6: '#f3f3f3',
  },
  layout: {
    type: 'vertical',
    accordionPayments: false,
    deliveryDateFormat: false,
    showCartQuantityPrice: false,
    showNoteField: false,
    fontSize: '12px',
    borderRadius: '4px',
    btnBorderRadius: '30px',
    maxWrapper: '980px',
    inputHeight: '40px',
    bordersContainers: '2px solid #eeeeee',
    fontFamily: '"Roboto", sans-serif',
  },
  css: '',
  javascript: '',
  javascriptActive: false,
  cssActive: false,
}

let email = window.localStorage.getItem('adminEmail') ?? null
let initialLoad = false

const Admin: FC<any & WrappedComponentProps> = ({ intl, session }: any) => {
  const { workspace } = useRuntime()

  const [state, setState] = useState<any>({
    ...defaultConfiguration,
    currentTab: 0,
    isModalOpen: false,
    showCloseIcon: false,
    workspace,
  })

  const [
    saveConfig,
    {
      data: dataSave,
      loading: loadingSave,
      called: calledSave,
      error: errorSave,
    },
  ] = useMutation(saveMutation)

  const { loading: loadingLast } = useQuery(GET_LAST, {
    variables: {
      workspace,
    },
    skip: initialLoad,
    onCompleted: (res: any) => {
      initialLoad = true
      setState({
        ...state,
        ...res.getLast,
        currentTab: 1,
        colors: {
          ...state.colors,
          ...res.getLast.colors,
        },
        layout: {
          ...state.layout,
          ...res.getLast.layout,
        },
      })
    },
  })

  if (session?.getSession?.adminUserEmail) {
    window.localStorage.setItem('adminEmail', session.getSession.adminUserEmail)
    email = session.getSession.adminUserEmail
  }

  console.log('email', email)
  console.log('dataSave', dataSave)

  const handleLayoutChange = (layout: any) => {
    setState({
      ...state,
      layout,
    })
  }

  const handleColorsChange = (colors: any) => {
    setState({
      ...state,
      colors,
    })
  }

  const handleCssChange = ({ value: css, active: cssActive }: any) => {
    setState({
      ...state,
      css,
      cssActive,
    })
  }

  const handleJSChange = ({
    value: javascript,
    active: javascriptActive,
  }: any) => {
    setState({
      ...state,
      javascript,
      javascriptActive,
    })
  }

  const handleLoad = ({
    javascript,
    css,
    layout,
    colors,
    javascriptActive,
    cssActive,
  }: any) => {
    setState({
      ...state,
      currentTab: 1,
      layout,
      colors,
      css,
      javascript,
      javascriptActive,
      cssActive,
    })
  }

  const handlePublish = () => {
    setState({
      ...state,
      isModalOpen: true,
    })

    console.log({
      variables: {
        email,
        workspace: state.workspace,
        layout: state.layout,
        colors: state.colors,
        css: state.css,
        javascript: state.javascript,
        javascriptActive: state.javascriptActive,
        cssActive: state.cssActive,
      },
    })

    if (email) {
      saveConfig({
        variables: {
          email,
          workspace: state.workspace,
          layout: state.layout,
          colors: state.colors,
          css: state.css,
          javascript: state.javascript,
          javascriptActive: state.javascriptActive,
          cssActive: state.cssActive,
        },
      })
    }
  }

  const handleModalClose = () => {
    setState({
      ...state,
      isModalOpen: false,
    })
  }

  console.log('State => ', state)

  return (
    <Layout
      fullWidth
      pageHeader={
        <PageHeader title={intl.formatMessage(messages.title)}>
          <span className="mr4">
            <div className="flex items-center">
              <div className="ma3">
                <Button
                  variation="primary"
                  disabled={loadingLast}
                  onClick={() => {
                    handlePublish()
                  }}
                >
                  Publish
                </Button>
              </div>
            </div>
          </span>
        </PageHeader>
      }
    >
      <PageBlock>
        {loadingLast && <Progress type="steps" steps={['inProgress']} />}
        {!loadingLast && (
          <Tabs fullWidth>
            <Tab
              label={intl.formatMessage({
                id: 'admin/checkout-ui.tab.layout',
              })}
              active={state.currentTab === 1}
              onClick={() => setState({ ...state, currentTab: 1 })}
            >
              <LayoutSettings
                onChange={handleLayoutChange}
                initialState={state.layout}
              />
            </Tab>
            <Tab
              label={intl.formatMessage({
                id: 'admin/checkout-ui.tab.colors',
              })}
              active={state.currentTab === 2}
              onClick={() => setState({ ...state, currentTab: 2 })}
            >
              <Colors
                onChange={handleColorsChange}
                initialState={state.colors}
              />
            </Tab>
            <Tab
              label={intl.formatMessage({
                id: 'admin/checkout-ui.tab.javascript',
              })}
              active={state.currentTab === 3}
              onClick={() => setState({ ...state, currentTab: 3 })}
            >
              <Javascript
                onChange={handleJSChange}
                initialState={{
                  value: state.javascript,
                  active: state.javascriptActive,
                }}
              />
            </Tab>
            <Tab
              label={intl.formatMessage({
                id: 'admin/checkout-ui.tab.css',
              })}
              active={state.currentTab === 4}
              onClick={() => setState({ ...state, currentTab: 4 })}
            >
              <Css
                onChange={handleCssChange}
                initialState={{
                  value: state.css,
                  active: state.cssActive,
                }}
              />
            </Tab>
            <Tab
              label={intl.formatMessage({
                id: 'admin/checkout-ui.tab.history',
              })}
              active={state.currentTab === 5}
              onClick={() => setState({ ...state, currentTab: 5 })}
            >
              <History onChange={handleLoad} />
            </Tab>
          </Tabs>
        )}
        <Modal
          centered
          isOpen={state.isModalOpen}
          showCloseIcon={state.showCloseIcon}
          onClose={() => {
            handleModalClose()
          }}
        >
          <div className="dark-gray">
            <ul className="list pl0">
              <li>
                <span className="w-100 mw1 dib">
                  {loadingSave === true && <Spinner size={12} />}
                  {loadingSave === false &&
                    calledSave === true &&
                    !errorSave && <IconCheck size={12} />}
                  {errorSave && <IconDeny size={12} />}
                  {calledSave === false && !errorSave && <span>-</span>}
                </span>{' '}
                Publishing to <strong>{state.workspace}</strong>
              </li>
            </ul>
          </div>
        </Modal>
      </PageBlock>
    </Layout>
  )
}

const optionsSession = {
  name: 'session',
  skip: email !== null,
  options: () => ({
    ssr: false,
  }),
}

export default injectIntl(compose(graphql(sessionQuery, optionsSession))(Admin))