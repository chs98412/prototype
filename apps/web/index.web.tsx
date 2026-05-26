import React from 'react'
import { AppRegistry } from 'react-native'
import App from './App'

AppRegistry.registerComponent('Logged', () => App)
AppRegistry.runApplication('Logged', {
  rootTag: document.getElementById('root'),
})
